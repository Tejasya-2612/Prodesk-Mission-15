import Activity from '../models/Activity.js';

export async function logActivity({ userId, action, targetType, targetId, targetName, metadata = {} }) {
  if (!userId || !action || !targetType) return null;
  return Activity.create({ userId, action, targetType, targetId, targetName, metadata });
}

export async function getActivity(req, res) {
  try {
    const activities = await Activity.find({})
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 20);

    res.json({ activities });
  } catch {
    res.status(500).json({ message: 'Could not load activity' });
  }
}
