import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
const port = process.env.PORT || 5000;
const app = express();

// 1. Global Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(logger);

// Apply rate limiting to all /api routes
app.use('/api', apiLimiter);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date() }));

// 2. Mounting routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/events', eventRoutes);

// Direct aliases for assignment route specifications (/events, /register, /login)
app.use('/events', eventRoutes);
app.post('/register', (req, res, next) => {
    req.url = '/';
    userRoutes(req, res, next);
});
app.post('/login', (req, res, next) => {
    req.url = '/login';
    userRoutes(req, res, next);
});


// 3. 404 Handler
app.all('{*path}', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// 4. Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

export default app;