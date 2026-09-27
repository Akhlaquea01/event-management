export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle JSON syntax error in body
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON payload received';
    }

    // Handle JWT specific errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired';
    }

    const response = {
        success: false,
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        message
    };

    // Show stack trace only in development
    if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

export default errorHandler;