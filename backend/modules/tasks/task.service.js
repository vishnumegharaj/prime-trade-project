import Task from './task.model.js';
import ApiError from '../../utils/ApiError.js';

export const getAllTasks = async ({ page = 1, limit = 10, status, priority, search }, userId, userRole) => {
  const query = {};

  // Regular users only see their own tasks; admins see all
  if (userRole !== 'admin') {
    query.owner = userId;
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: 'i' };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('owner', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
    },
  };
};

export const getTaskById = async (id, userId, userRole) => {
  const task = await Task.findById(id).populate('owner', 'name email');
  if (!task) throw new ApiError(404, 'Task not found');

  // Users can only access their own tasks
  if (userRole !== 'admin' && task.owner._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to access this task');
  }

  return task;
};

export const createTask = async (data, userId) => {
  return await Task.create({ ...data, owner: userId });
};

export const updateTask = async (id, data, userId, userRole) => {
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, 'Task not found');

  if (userRole !== 'admin' && task.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to update this task');
  }

  const updated = await Task.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name email');

  return updated;
};

export const deleteTask = async (id, userId, userRole) => {
  const task = await Task.findById(id);
  if (!task) throw new ApiError(404, 'Task not found');

  if (userRole !== 'admin' && task.owner.toString() !== userId.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this task');
  }

  await Task.findByIdAndDelete(id);
  return task;
};

export const getTaskStats = async (userId, userRole) => {
  const matchStage = userRole === 'admin' ? {} : { owner: userId };

  const stats = await Task.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Task.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  return { statusBreakdown: stats, priorityBreakdown: priorityStats };
};
