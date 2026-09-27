import { AppError } from './errorHandler.js';

/**
 * Validates request payload for creating an event
 */
export function validateCreateEvent(req, res, next) {
    const { title, description, date, time, capacity } = req.body;

    if (!title || !title.trim()) {
        return next(new AppError('Event title is required', 400));
    }

    if (!description || !description.trim()) {
        return next(new AppError('Event description is required', 400));
    }

    if (!date || !date.trim()) {
        return next(new AppError('Event date is required (e.g. YYYY-MM-DD)', 400));
    }

    if (!time || !time.trim()) {
        return next(new AppError('Event time is required (e.g. 10:00 AM)', 400));
    }

    if (capacity !== undefined) {
        const numCapacity = Number(capacity);
        if (isNaN(numCapacity) || numCapacity <= 0) {
            return next(new AppError('Capacity must be a positive number', 400));
        }
    }

    next();
}

/**
 * Validates request payload for updating an event
 */
export function validateUpdateEvent(req, res, next) {
    const { title, description, date, time, capacity } = req.body;

    // Check that at least one field is provided for update
    if (
        title === undefined &&
        description === undefined &&
        date === undefined &&
        time === undefined &&
        capacity === undefined
    ) {
        return next(new AppError('Please provide at least one field to update', 400));
    }

    if (title !== undefined && !title.trim()) {
        return next(new AppError('Event title cannot be empty', 400));
    }

    if (description !== undefined && !description.trim()) {
        return next(new AppError('Event description cannot be empty', 400));
    }

    if (date !== undefined && !date.trim()) {
        return next(new AppError('Event date cannot be empty', 400));
    }

    if (time !== undefined && !time.trim()) {
        return next(new AppError('Event time cannot be empty', 400));
    }

    if (capacity !== undefined) {
        const numCapacity = Number(capacity);
        if (isNaN(numCapacity) || numCapacity <= 0) {
            return next(new AppError('Capacity must be a positive number', 400));
        }
    }

    next();
}

export default {
    validateCreateEvent,
    validateUpdateEvent
};
