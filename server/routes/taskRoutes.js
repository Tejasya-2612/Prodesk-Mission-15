import express from 'express';
import { addComment, createTask, deleteTask, getTasks, updateTask } from '../controllers/taskController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.post('/:id/comments', addComment);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
