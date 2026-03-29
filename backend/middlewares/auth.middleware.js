import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../modules/auth/user.model.js';
import config from '../config/config.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];
  // jwt.verify throws JsonWebTokenError / TokenExpiredError — caught by global error middleware
  const decoded = jwt.verify(token, config.jwtSecret);

  const user = await User.findById(decoded.userId).select('-password');
  if (!user) throw new ApiError(401, 'User no longer exists.');

  req.user = user;
  next();
});
