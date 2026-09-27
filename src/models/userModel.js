import { readData, writeData } from '../utils/fileHelper.js';

const USERS_FILE = '../data/users.json';

class UserModel {
    constructor({ id, name, email, password, role = 'attendee' }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = new Date().toISOString();
    }

    // Read all users
    static async findAll() {
        return await readData(USERS_FILE);
    }

    // Find user by ID
    static async findById(id) {
        const users = await readData(USERS_FILE);
        return users.find(u => u.id === Number(id));
    }

    // Find user by Email
    static async findByEmail(email) {
        const users = await readData(USERS_FILE);
        return users.find(u => u.email === email);
    }

    // Create and persist a new user
    static async create(userData) {
        const users = await readData(USERS_FILE);

        const newUser = new UserModel({
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            ...userData
        });

        users.push(newUser);
        await writeData(USERS_FILE, users);
        return newUser;
    }
}

export default UserModel;
