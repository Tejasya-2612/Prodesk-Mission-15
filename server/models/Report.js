import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Weekly', 'Monthly', 'Project', 'Team', 'Task'],
      required: true
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    data: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
