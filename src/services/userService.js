import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../utils/email.js';

const SECRET_KEY = process.env.JWT_SECRET || 'finedge_default_jwt_secret';

export class UserService {
    static async registerUser({ name, email, password, role }) {
        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new AppError('User already exists with this email', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Normalize default role to 'attendee' if not specified
        const assignedRole = role ? role.toLowerCase() : 'attendee';

        // Save new user via model
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        // Send welcome email asynchronously (non-blocking)
        sendEmail({
            to: [{ email: newUser.email, name: newUser.name }],
            subject: 'Welcome to Virtual Event Platform!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">Welcome to Virtual Event Platform! 🚀</h2>
                    <p>Hi <strong>${newUser.name}</strong>,</p>
                    <p>Your account has been successfully created as an <strong>${newUser.role}</strong>.</p>
                    <p style="color: #64748b; font-size: 14px;">You can now browse events, register as an attendee, or host your own events as an organizer.</p>
                </div>
            `,
            text: `Hi ${newUser.name},\n\nWelcome to Virtual Event Platform! Your account has been created as an ${newUser.role}.`
        }).catch(err => {
            console.error('[UserService] Failed to send welcome email:', err?.message || err);
        });

        // Strip password before returning
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    static async loginUser({ email, password }) {
        // Find user by email
        const user = await UserModel.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Validate password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }

    static async getAllUsers() {
        const users = await UserModel.findAll();
        return users.map(({ password, ...user }) => user);
    }

    static async getUserById(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
