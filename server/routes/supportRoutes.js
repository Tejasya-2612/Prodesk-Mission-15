import express from 'express';
import {
  createCalendarEvent,
  createFile,
  createMessage,
  createNotification,
  createReport,
  deleteFile,
  getCalendarEvents,
  getFiles,
  getMessages,
  getNotifications,
  getReports,
  globalSearch,
  markNotificationRead,
  updateFile
} from '../controllers/supportController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/files', getFiles);
router.post('/files', createFile);
router.put('/files/:id', updateFile);
router.delete('/files/:id', deleteFile);
router.get('/messages', getMessages);
router.post('/messages', createMessage);
router.get('/calendar', getCalendarEvents);
router.post('/calendar', createCalendarEvent);
router.get('/reports', getReports);
router.post('/reports', createReport);
router.get('/search', globalSearch);

export default router;
