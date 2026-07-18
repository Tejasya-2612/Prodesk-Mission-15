import express from 'express';
import { createUser, deleteUser, getProfile, getTeamSummary, getUsers, inviteUser, updateUser } from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/profile', getProfile);
router.get('/', getUsers);
router.get('/team/summary', getTeamSummary);
router.post('/', requireRole('Admin', 'Manager'), createUser);
router.post('/invite', requireRole('Admin', 'Manager'), inviteUser);
router.put('/:id', updateUser);
router.delete('/:id', requireRole('Admin'), deleteUser);

export default router;
