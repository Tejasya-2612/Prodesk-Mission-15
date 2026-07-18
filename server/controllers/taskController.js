import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { logActivity } from './activityController.js';

const validStatuses = ['To Do', 'In Progress', 'Review', 'Completed'];
const validPriorities = ['Low', 'Medium', 'High'];

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isValidDate(date) {
  return !date || !Number.isNaN(new Date(date).getTime());
}

function getSort(query) {
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priority: { priority: -1 },
    alphabetical: { title: 1 },
    dueDate: { dueDate: 1 },
    position: { position: 1 }
  };

  return sortMap[query.sort] || sortMap.newest;
}

async function getWorkspaceProjectIds(userId) {
  const projects = await Project.find({ $or: [{ ownerId: userId }, { members: userId }] }).select('_id');
  return projects.map((project) => project._id);
}

async function getTaskFilter(req) {
  const projectIds = await getWorkspaceProjectIds(req.user._id);
  const filter = {
    $or: [
      { authorId: req.user._id },
      { assignedTo: req.user._id },
      { projectId: { $in: projectIds } }
    ]
  };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.project) filter.projectId = req.query.project;
  if (req.query.assignedUser) filter.assignedTo = req.query.assignedUser;
  if (req.query.label) filter.labels = req.query.label;
  if (req.query.dueBefore) filter.dueDate = { ...(filter.dueDate || {}), $lte: new Date(req.query.dueBefore) };
  if (req.query.dueAfter) filter.dueDate = { ...(filter.dueDate || {}), $gte: new Date(req.query.dueAfter) };

  return filter;
}

async function refreshProjectProgress(projectId) {
  if (!projectId) return;
  const [total, completed] = await Promise.all([
    Task.countDocuments({ projectId }),
    Task.countDocuments({ projectId, status: 'Completed' })
  ]);
  const progress = total ? Math.round((completed / total) * 100) : 0;
  await Project.findByIdAndUpdate(projectId, { progress, status: progress === 100 ? 'Completed' : 'Active' });
}

export async function getTasks(req, res) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const filter = await getTaskFilter(req);
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('projectId', 'title color icon')
        .populate('assignedTo authorId', 'name email avatar')
        .sort(getSort(req.query))
        .skip((page - 1) * limit)
        .limit(limit),
      Task.countDocuments(filter)
    ]);

    res.json({ tasks, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function createTask(req, res) {
  try {
    const {
      title,
      description,
      projectId,
      status,
      priority,
      dueDate,
      assignedTo,
      labels = [],
      attachments = [],
      checklist = [],
      timeTracking,
      boardColumnId,
      position
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid task priority' });
    }

    if (!isValidDate(dueDate)) {
      return res.status(400).json({ message: 'Invalid due date' });
    }

    if (projectId) {
      const project = await Project.findOne({ _id: projectId, $or: [{ ownerId: req.user._id }, { members: req.user._id }] });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId: projectId || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || req.user._id,
      labels,
      attachments,
      checklist,
      timeTracking,
      boardColumnId,
      position,
      authorId: req.user._id
    });

    await refreshProjectProgress(projectId);
    await logActivity({ userId: req.user._id, action: 'Task Created', targetType: 'Task', targetId: task._id, targetName: task.title });
    res.status(201).json({ message: 'Task created', task });
  } catch {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, projectId, status, priority, dueDate, assignedTo, labels, attachments, checklist, timeTracking, boardColumnId, position } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectIds = await getWorkspaceProjectIds(req.user._id);
    const canAccess = task.authorId.toString() === req.user._id.toString() ||
      task.assignedTo?.toString() === req.user._id.toString() ||
      projectIds.some((item) => item.toString() === task.projectId?.toString());

    if (!canAccess) {
      return res.status(403).json({ message: 'Forbidden, this task belongs to another workspace' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid task priority' });
    }

    if (!isValidDate(dueDate)) {
      return res.status(400).json({ message: 'Invalid due date' });
    }

    const previousStatus = task.status;
    const previousProject = task.projectId;

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.projectId = projectId ?? task.projectId;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.dueDate = dueDate || undefined;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.labels = labels ?? task.labels;
    task.attachments = attachments ?? task.attachments;
    task.checklist = checklist ?? task.checklist;
    task.timeTracking = timeTracking ?? task.timeTracking;
    task.boardColumnId = boardColumnId ?? task.boardColumnId;
    task.position = position ?? task.position;

    const updatedTask = await task.save();
    await refreshProjectProgress(previousProject);
    await refreshProjectProgress(updatedTask.projectId);
    await logActivity({
      userId: req.user._id,
      action: previousStatus !== updatedTask.status ? 'Status Changed' : 'Task Updated',
      targetType: 'Task',
      targetId: updatedTask._id,
      targetName: updatedTask.title,
      metadata: { previousStatus, status: updatedTask.status }
    });
    res.json({ message: 'Task updated', task: updatedTask });
  } catch {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden, this task belongs to another user' });
    }

    await task.deleteOne();
    await refreshProjectProgress(task.projectId);
    await logActivity({ userId: req.user._id, action: 'Task Deleted', targetType: 'Task', targetId: task._id, targetName: task.title });
    res.json({ message: 'Task deleted' });
  } catch {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function addComment(req, res) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.body.message) {
      return res.status(400).json({ message: 'Comment message is required' });
    }

    task.comments.push({ authorId: req.user._id, message: req.body.message });
    await task.save();
    await logActivity({ userId: req.user._id, action: 'Comment Added', targetType: 'Comment', targetId: task._id, targetName: task.title });

    res.status(201).json({ message: 'Comment added', task });
  } catch {
    res.status(500).json({ message: 'Could not add comment' });
  }
}
