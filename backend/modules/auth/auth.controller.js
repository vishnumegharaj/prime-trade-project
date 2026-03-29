import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.json(new ApiResponse(200, result, 'Login successful'));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  res.json(new ApiResponse(200, user, 'User profile fetched'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await authService.getAllUsers(req.query);
  res.json(new ApiResponse(200, result, 'Users fetched'));
});
