import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    start: {
      type: Date,
      required: true
    },
    end: Date,
    type: {
      type: String,
      enum: ['Task', 'Project', 'Event'],
      default: 'Event'
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

export default CalendarEvent;
