import { UserService } from '../services/userService.js';
import { AppError } from '../middleware/errorHandler.js';

export const handleCreateUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            throw new AppError('Name, email, and password are required', 400);
        }

        const newUser = await UserService.registerUser({ name, email, password, role });
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetUserById = async (req, res, next) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

export const logIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        const result = await UserService.loginUser({ email, password });
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        next(error);
    }
};
