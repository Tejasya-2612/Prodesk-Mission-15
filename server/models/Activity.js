import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      enum: ['Project', 'Task', 'Comment', 'File', 'User', 'Board', 'Message'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },
    targetName: {
      type: String,
      default: ''
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
