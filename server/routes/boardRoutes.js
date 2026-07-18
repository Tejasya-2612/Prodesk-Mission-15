import express from 'express';
import { createBoard, getBoardDetail, getBoards, moveTask } from '../controllers/boardController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoardDetail);
router.post('/:id/move-task', moveTask);

export default router;
