import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Archived'],
      default: 'Active'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    dueDate: Date,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    color: {
      type: String,
      default: '#4f46e5'
    },
    icon: {
      type: String,
      default: 'folder'
    }
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
