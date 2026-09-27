import express from 'express';
import {
    handleGetAllEvents,
    handleGetEventById,
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleRegisterForEvent,
    handleCancelRegistration,
    handleGetMyRegistrations
} from '../controllers/eventController.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { validateCreateEvent, validateUpdateEvent } from '../middleware/validator.js';

const router = express.Router();

router.get('/', handleGetAllEvents);

router.get('/my-registrations', authenticateUser, handleGetMyRegistrations);

router.get('/:id', handleGetEventById);

// Organizer routes: create, update, delete events
router.post(
    '/',
    authenticateUser,
    authorizeRoles('organizer', 'admin'),
    validateCreateEvent,
    handleCreateEvent
);

router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('organizer', 'admin'),
    validateUpdateEvent,
    handleUpdateEvent
);

router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('organizer', 'admin'),
    handleDeleteEvent
);

// Attendee event registration routes
router.post(
    '/:id/register',
    authenticateUser,
    handleRegisterForEvent
);

router.delete(
    '/:id/register',
    authenticateUser,
    handleCancelRegistration
);

export default router;
