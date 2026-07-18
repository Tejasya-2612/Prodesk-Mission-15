import bcrypt from 'bcryptjs';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastActive: user.lastActive
  };
}

export async function getProfile(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function getUsers(req, res) {
  try {
    const users = await User.find({}).select('-password -refreshToken -resetPasswordToken').sort({ createdAt: -1 });
    res.json({ users });
  } catch {
    res.status(500).json({ message: 'Could not load users' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role = 'Member' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ user: publicUser(user) });
  } catch {
    res.status(500).json({ message: 'Could not create user' });
  }
}

export async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    ['name', 'avatar', 'role', 'status'].forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });
    await user.save();
    res.json({ user });
  } catch {
    res.status(500).json({ message: 'Could not update user' });
  }
}

export async function deleteUser(req, res) {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ message: 'Could not delete user' });
  }
}

export async function inviteUser(req, res) {
  try {
    const { name, email, role = 'Member' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOneAndUpdate(
      { email },
      { name: name || email.split('@')[0], email, role, status: 'Invited', password: await bcrypt.hash(Math.random().toString(36), 10) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('-password');
    res.status(201).json({ message: 'Invitation created', user });
  } catch {
    res.status(500).json({ message: 'Could not invite user' });
  }
}

export async function getTeamSummary(req, res) {
  try {
    const users = await User.find({}).select('-password');
    const summaries = await Promise.all(users.map(async (user) => {
      const [assignedProjects, assignedTasks, completedTasks] = await Promise.all([
        Project.countDocuments({ members: user._id }),
        Task.countDocuments({ assignedTo: user._id }),
        Task.countDocuments({ assignedTo: user._id, status: 'Completed' })
      ]);
      return {
        ...publicUser(user),
        assignedProjects,
        assignedTasks,
        completionRate: assignedTasks ? Math.round((completedTasks / assignedTasks) * 100) : 0
      };
    }));
    res.json({ totalMembers: summaries.length, activeMembers: summaries.filter((user) => user.status === 'Active').length, members: summaries });
  } catch {
    res.status(500).json({ message: 'Could not load team summary' });
  }
}
