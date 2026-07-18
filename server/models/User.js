import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Member'],
      default: 'Member'
    },
    status: {
      type: String,
      enum: ['Active', 'Invited', 'Suspended'],
      default: 'Active'
    },
    refreshToken: {
      type: String,
      default: ''
    },
    resetPasswordToken: {
      type: String,
      default: ''
    },
    resetPasswordExpires: {
      type: Date
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
