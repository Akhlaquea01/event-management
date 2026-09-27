import rateLimit from 'express-rate-limit';

// Standard rate limit error response generator
const createLimiterHandler = (message) => (req, res) => {
    res.status(429).json({
        success: false,
        status: 'fail',
        message
    });
};

/**
 * 1. Global API rate limiter (100 requests per 15 minutes)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP
    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: createLimiterHandler('Too many requests from this IP, please try again after 15 minutes.')
});

/**
 * 2. Auth limiter for login / register to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    skip: () => process.env.NODE_ENV === 'test',
    standardHeaders: true,
    legacyHeaders: false,
    handler: createLimiterHandler('Too many login/registration attempts. Please try again after 15 minutes.')
});

/**
 * 3. AI / Heavy endpoint limiter (20 requests per 15 min)
 */
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createLimiterHandler('Too many AI requests. Please try again after 15 minutes.')
});

export default {
    apiLimiter,
    authLimiter,
    aiLimiter
};
