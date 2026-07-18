import express from 'express';
import { getDashboardActivity, getDashboardCharts, getDashboardStats, getUpcomingDeadlines } from '../controllers/dashboardController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/charts', getDashboardCharts);
router.get('/deadlines', getUpcomingDeadlines);
router.get('/activity', getDashboardActivity);

export default router;
