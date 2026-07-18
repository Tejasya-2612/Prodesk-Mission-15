import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { logActivity } from './activityController.js';

function pagination(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function sortFrom(query) {
  const sorts = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priority: { priority: -1 },
    alphabetical: { title: 1 },
    dueDate: { dueDate: 1 }
  };
  return sorts[query.sort] || sorts.newest;
}

function projectFilter(req) {
  const filter = { $or: [{ ownerId: req.user._id }, { members: req.user._id }] };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  return filter;
}

export async function getProjects(req, res) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const filter = projectFilter(req);
    const [projects, total] = await Promise.all([
      Project.find(filter).populate('ownerId members', 'name email avatar role').sort(sortFrom(req.query)).skip(skip).limit(limit),
      Project.countDocuments(filter)
    ]);
    res.json({ projects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch {
    res.status(500).json({ message: 'Could not load projects' });
  }
}

export async function createProject(req, res) {
  try {
    const { title, description, status, priority, dueDate, members = [], color, icon } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title is required' });

    const project = await Project.create({
      title,
      description,
      status,
      priority,
      dueDate,
      members: [...new Set([req.user._id.toString(), ...members])],
      ownerId: req.user._id,
      color,
      icon
    });

    await logActivity({ userId: req.user._id, action: 'Project Created', targetType: 'Project', targetId: project._id, targetName: project.title });
    res.status(201).json({ message: 'Project created', project });
  } catch {
    res.status(500).json({ message: 'Could not create project' });
  }
}

export async function updateProject(req, res) {
  try {
    const project = await Project.findOne({ _id: req.params.id, $or: [{ ownerId: req.user._id }, { members: req.user._id }] });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    ['title', 'description', 'status', 'priority', 'dueDate', 'progress', 'color', 'icon'].forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });
    if (Array.isArray(req.body.members)) project.members = req.body.members;

    await project.save();
    await logActivity({ userId: req.user._id, action: 'Project Updated', targetType: 'Project', targetId: project._id, targetName: project.title });
    res.json({ message: 'Project updated', project });
  } catch {
    res.status(500).json({ message: 'Could not update project' });
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ projectId: project._id });
    await logActivity({ userId: req.user._id, action: 'Project Deleted', targetType: 'Project', targetId: project._id, targetName: project.title });
    res.json({ message: 'Project deleted' });
  } catch {
    res.status(500).json({ message: 'Could not delete project' });
  }
}
