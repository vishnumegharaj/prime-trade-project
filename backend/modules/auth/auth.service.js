import jwt from 'jsonwebtoken';
import User from './user.model.js';
import ApiError from '../../utils/ApiError.js';
import config from '../../config/config.js';

const generateToken = (userId) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiry });

export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  // Explicitly select password since it's excluded by default
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

// Admin: get all users
export const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const [users, total] = await Promise.all([
    User.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  };
};
