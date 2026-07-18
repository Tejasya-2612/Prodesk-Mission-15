import mongoose from 'mongoose';

const fileAssetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    mimeType: String,
    size: Number,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  },
  { timestamps: true }
);

const FileAsset = mongoose.model('FileAsset', fileAssetSchema);

export default FileAsset;
