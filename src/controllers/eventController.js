import EventService from '../services/eventService.js';

export const handleGetAllEvents = async (req, res, next) => {
    try {
        const events = await EventService.getAllEvents();
        return res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetEventById = async (req, res, next) => {
    try {
        const event = await EventService.getEventById(req.params.id);
        return res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
};

export const handleCreateEvent = async (req, res, next) => {
    try {
        const organizerId = req.user.id;
        const newEvent = await EventService.createEvent(req.body, organizerId);
        return res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateEvent = async (req, res, next) => {
    try {
        const updatedEvent = await EventService.updateEvent(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        next(error);
    }
};

export const handleDeleteEvent = async (req, res, next) => {
    try {
        const result = await EventService.deleteEvent(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

export const handleRegisterForEvent = async (req, res, next) => {
    try {
        const result = await EventService.registerForEvent(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: 'Successfully registered for event. Confirmation email has been sent.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const handleCancelRegistration = async (req, res, next) => {
    try {
        const updatedEvent = await EventService.cancelRegistration(req.params.id, req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Successfully cancelled event registration',
            data: updatedEvent
        });
    } catch (error) {
        next(error);
    }
};

export const handleGetMyRegistrations = async (req, res, next) => {
    try {
        const events = await EventService.getUserRegistrations(req.user.id);
        return res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        next(error);
    }
};

export default {
    handleGetAllEvents,
    handleGetEventById,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleRegisterForEvent,
    handleCancelRegistration,
    handleGetMyRegistrations
};
