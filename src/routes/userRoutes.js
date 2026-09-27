import express from 'express';
import { handleCreateUser, handleGetUsers, handleGetUserById, logIn } from '../controllers/userController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authLimiter, handleCreateUser);
router.get('/', handleGetUsers);
router.get('/:id', authenticateUser, authorizeRoles('organizer'), handleGetUserById);
router.post('/login', authLimiter, logIn);

export default router;
