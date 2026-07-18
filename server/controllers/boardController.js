import Board from '../models/Board.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { logActivity } from './activityController.js';

const defaultColumns = ['To Do', 'In Progress', 'Review', 'Completed'];

export async function getBoards(req, res) {
  try {
    const projects = await Project.find({ $or: [{ ownerId: req.user._id }, { members: req.user._id }] }).select('_id title');
    const projectIds = projects.map((project) => project._id);
    const boards = await Board.find({ projectId: { $in: projectIds } }).populate('projectId', 'title');
    res.json({ boards });
  } catch {
    res.status(500).json({ message: 'Could not load boards' });
  }
}

export async function createBoard(req, res) {
  try {
    const project = await Project.findOne({ _id: req.body.projectId, $or: [{ ownerId: req.user._id }, { members: req.user._id }] });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const board = await Board.create({
      title: req.body.title || `${project.title} Board`,
      projectId: project._id,
      columns: (req.body.columns || defaultColumns).map((title, index) => ({ title, position: index }))
    });

    await logActivity({ userId: req.user._id, action: 'Board Created', targetType: 'Board', targetId: board._id, targetName: board.title });
    res.status(201).json({ message: 'Board created', board });
  } catch {
    res.status(500).json({ message: 'Could not create board' });
  }
}

export async function getBoardDetail(req, res) {
  try {
    const board = await Board.findById(req.params.id).populate('projectId', 'title description');
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const tasks = await Task.find({ projectId: board.projectId._id })
      .populate('assignedTo', 'name email avatar')
      .sort({ position: 1, createdAt: -1 });

    res.json({ board, tasks });
  } catch {
    res.status(500).json({ message: 'Could not load board' });
  }
}

export async function moveTask(req, res) {
  try {
    const { taskId, status, position, boardColumnId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status || task.status;
    task.position = position ?? task.position;
    task.boardColumnId = boardColumnId || task.boardColumnId;
    await task.save();

    await logActivity({ userId: req.user._id, action: 'Task Moved', targetType: 'Task', targetId: task._id, targetName: task.title, metadata: { status, position } });
    res.json({ message: 'Task moved', task });
  } catch {
    res.status(500).json({ message: 'Could not move task' });
  }
}
