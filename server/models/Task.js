import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Review', 'Completed'],
      default: 'To Do'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    dueDate: {
      type: Date
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    labels: [{
      type: String,
      trim: true
    }],
    attachments: [{
      name: String,
      url: String,
      size: Number,
      mimeType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      editedAt: Date,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    checklist: [{
      title: String,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    timeTracking: {
      estimateMinutes: {
        type: Number,
        default: 0
      },
      loggedMinutes: {
        type: Number,
        default: 0
      }
    },
    boardColumnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BoardColumn'
    },
    position: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
