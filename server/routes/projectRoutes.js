import express from 'express';
import { createProject, deleteProject, getProjects, updateProject } from '../controllers/projectController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
