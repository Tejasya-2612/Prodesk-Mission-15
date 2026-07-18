import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    body: {
      type: String,
      default: ''
    },
    attachments: [{
      name: String,
      url: String
    }],
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
