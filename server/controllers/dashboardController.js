import Activity from '../models/Activity.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

function startOfWeek() {
  const date = new Date();
  date.setDate(date.getDate() - date.getDay());
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function visibleProjectIds(userId) {
  const projects = await Project.find({ $or: [{ ownerId: userId }, { members: userId }] }).select('_id');
  return projects.map((project) => project._id);
}

export async function getDashboardStats(req, res) {
  try {
    const projectIds = await visibleProjectIds(req.user._id);
    const taskFilter = { $or: [{ authorId: req.user._id }, { assignedTo: req.user._id }, { projectId: { $in: projectIds } }] };
    const now = new Date();
    const weekStart = startOfWeek();

    const [totalProjects, activeProjects, completedProjects, totalTasks, completedTasks, pendingTasks, overdueTasks, teamMembers, tasksCompletedThisWeek, projectsCreatedThisWeek] = await Promise.all([
      Project.countDocuments({ _id: { $in: projectIds } }),
      Project.countDocuments({ _id: { $in: projectIds }, status: 'Active' }),
      Project.countDocuments({ _id: { $in: projectIds }, status: 'Completed' }),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'Completed' }),
      Task.countDocuments({ ...taskFilter, status: { $ne: 'Completed' } }),
      Task.countDocuments({ ...taskFilter, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
      User.countDocuments({ status: 'Active' }),
      Task.countDocuments({ ...taskFilter, status: 'Completed', updatedAt: { $gte: weekStart } }),
      Project.countDocuments({ _id: { $in: projectIds }, createdAt: { $gte: weekStart } })
    ]);

    res.json({
      totalProjects,
      activeProjects,
      completedProjects,
      recentProjects: await Project.find({ _id: { $in: projectIds } }).sort({ createdAt: -1 }).limit(5),
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      assignedTasks: await Task.countDocuments({ assignedTo: req.user._id, status: { $ne: 'Completed' } }),
      teamMembers,
      tasksCompletedThisWeek,
      projectsCreatedThisWeek,
      completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    });
  } catch {
    res.status(500).json({ message: 'Could not load dashboard stats' });
  }
}

export async function getDashboardCharts(req, res) {
  try {
    const projectIds = await visibleProjectIds(req.user._id);
    const tasks = await Task.find({ $or: [{ authorId: req.user._id }, { assignedTo: req.user._id }, { projectId: { $in: projectIds } }] });
    const projects = await Project.find({ _id: { $in: projectIds } });
    const days = Array.from({ length: 5 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (4 - index) * 7);
      return date;
    });

    const weeklyProgress = days.map((date) => {
      const complete = tasks.filter((task) => task.status === 'Completed' && task.updatedAt <= date).length;
      return { name: dateKey(date), value: tasks.length ? Math.round((complete / tasks.length) * 100) : 0 };
    });

    const taskCompletion = ['To Do', 'In Progress', 'Review', 'Completed'].map((status) => ({
      name: status,
      value: tasks.filter((task) => task.status === status).length
    }));

    res.json({
      monthlyProgress: weeklyProgress,
      weeklyProgress,
      taskCompletion,
      teamProductivity: [],
      projectProgress: projects.map((project) => ({ name: project.title, value: project.progress })),
      completionPercent: tasks.length ? Math.round((tasks.filter((task) => task.status === 'Completed').length / tasks.length) * 100) : 0
    });
  } catch {
    res.status(500).json({ message: 'Could not load dashboard charts' });
  }
}

export async function getUpcomingDeadlines(req, res) {
  try {
    const projectIds = await visibleProjectIds(req.user._id);
    const tasks = await Task.find({
      $or: [{ authorId: req.user._id }, { assignedTo: req.user._id }, { projectId: { $in: projectIds } }],
      status: { $ne: 'Completed' },
      dueDate: { $gte: new Date() }
    })
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(Number(req.query.limit) || 8);

    res.json({ deadlines: tasks });
  } catch {
    res.status(500).json({ message: 'Could not load deadlines' });
  }
}

export async function getDashboardActivity(req, res) {
  try {
    const activities = await Activity.find({})
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 8);

    res.json({ activities });
  } catch {
    res.status(500).json({ message: 'Could not load activity' });
  }
}
