import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as taskService from './task.service.js';

export const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getAllTasks(req.query, req.user._id, req.user.role);
  res.json(new ApiResponse(200, result, 'Tasks fetched successfully'));
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user._id, req.user.role);
  res.json(new ApiResponse(200, task, 'Task fetched successfully'));
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user._id, req.user.role);
  res.json(new ApiResponse(200, task, 'Task updated successfully'));
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user._id, req.user.role);
  res.json(new ApiResponse(200, null, 'Task deleted successfully'));
});

export const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats(req.user._id, req.user.role);
  res.json(new ApiResponse(200, stats, 'Task stats fetched'));
});
