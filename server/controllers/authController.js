import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function createRefreshToken(userId) {
  return jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    lastActive: user.lastActive
  };
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: 'Admin' });
    const refreshToken = createRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Registration successful',
      token: createToken(user._id),
      refreshToken,
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const refreshToken = createRefreshToken(user._id);
    user.refreshToken = refreshToken;
    user.lastActive = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      token: createToken(user._id),
      refreshToken,
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getMe(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token is required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    const nextRefreshToken = createRefreshToken(user._id);
    user.refreshToken = nextRefreshToken;
    await user.save();

    res.json({ token: createToken(user._id), refreshToken: nextRefreshToken, user: publicUser(user) });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  if (req.user) {
    req.user.refreshToken = '';
    await req.user.save();
  }
  res.json({ message: 'Logged out' });
}

export async function forgotPassword(req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.resetPasswordToken = crypto.randomBytes(24).toString('hex');
      user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
      await user.save();
    }

    res.json({ message: 'If that email exists, a reset token has been generated' });
  } catch {
    res.status(500).json({ message: 'Could not start password reset' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = '';
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(500).json({ message: 'Could not reset password' });
  }
}
