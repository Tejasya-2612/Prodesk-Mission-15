import CalendarEvent from '../models/CalendarEvent.js';
import FileAsset from '../models/FileAsset.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import Report from '../models/Report.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

export async function getNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(Number(req.query.limit) || 50);
  res.json({ notifications, unread: notifications.filter((item) => !item.read).length });
}

export async function createNotification(req, res) {
  const notification = await Notification.create({ ...req.body, userId: req.body.userId || req.user._id });
  res.status(201).json({ notification });
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
  res.json({ notification });
}

export async function getFiles(req, res) {
  const files = await FileAsset.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json({ files });
}

export async function createFile(req, res) {
  const file = await FileAsset.create({ ...req.body, ownerId: req.user._id });
  res.status(201).json({ file });
}

export async function updateFile(req, res) {
  const file = await FileAsset.findOneAndUpdate({ _id: req.params.id, ownerId: req.user._id }, req.body, { new: true });
  res.json({ file });
}

export async function deleteFile(req, res) {
  await FileAsset.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
  res.json({ message: 'File deleted' });
}

export async function getMessages(req, res) {
  const messages = await Message.find({ $or: [{ senderId: req.user._id }, { recipientIds: req.user._id }] }).sort({ createdAt: -1 });
  res.json({ messages, unread: messages.filter((item) => !item.readBy.some((id) => id.toString() === req.user._id.toString())).length });
}

export async function createMessage(req, res) {
  const message = await Message.create({ ...req.body, senderId: req.user._id });
  res.status(201).json({ message });
}

export async function getCalendarEvents(req, res) {
  const events = await CalendarEvent.find({ ownerId: req.user._id }).sort({ start: 1 });
  res.json({ events });
}

export async function createCalendarEvent(req, res) {
  const event = await CalendarEvent.create({ ...req.body, ownerId: req.user._id });
  res.status(201).json({ event });
}

export async function getReports(req, res) {
  const reports = await Report.find({ generatedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ reports });
}

export async function createReport(req, res) {
  const report = await Report.create({ ...req.body, generatedBy: req.user._id });
  res.status(201).json({ report });
}

export async function globalSearch(req, res) {
  const q = req.query.q || '';
  const pattern = new RegExp(q, 'i');
  const [projects, tasks, users, messages, files] = await Promise.all([
    Project.find({ title: pattern }).limit(10),
    Task.find({ title: pattern }).limit(10),
    User.find({ $or: [{ name: pattern }, { email: pattern }] }).select('-password').limit(10),
    Message.find({ body: pattern }).limit(10),
    FileAsset.find({ name: pattern }).limit(10)
  ]);
  res.json({ projects, tasks, users, messages, files });
}
