// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

const SECRET_KEY = process.env.JWT_SECRET || 'finedge_default_jwt_secret';

export const authenticateUser = (req, res, next) => {
    try {
        let token;

        // 1. Extract Bearer token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Check if token exists
        if (!token) {
            return next(new AppError('You are not logged in! Please provide a valid Bearer token.', 401));
        }

        // 3. Verify token
        const decoded = jwt.verify(token, SECRET_KEY);

        // 4. Attach logged-in user payload ({ id, email, role }) to request
        req.user = decoded;

        next();
    } catch (error) {
        next(error); // Automatically handled by errorHandler.js (JWT expired / invalid)
    }
};


export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        // 3. Role is authorized, proceed to next handler
        next();
    };
};

export default authenticateUser;
