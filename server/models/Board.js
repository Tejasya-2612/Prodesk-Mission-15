import mongoose from 'mongoose';

const boardColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    position: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    columns: [boardColumnSchema]
  },
  { timestamps: true }
);

const Board = mongoose.model('Board', boardSchema);

export default Board;
