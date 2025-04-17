// models/ActiveUser.js
const mongoose = require('mongoose');

const activeUserSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  last_activity: {
    type: Date,
    default: Date.now
  },
  session_start: {
    type: Date,
    default: Date.now
  },
  session_duration: {
    type: Number,
    default: 0
  },
  is_online: {
    type: Boolean,
    default: true
  },
  current_page: {
    type: String
  },
  device_info: {
    type: String
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Update session duration before saving
activeUserSchema.pre('save', function(next) {
  if (this.session_start && this.is_online) {
    this.session_duration = (Date.now() - this.session_start.getTime()) / 1000; // Duration in seconds
  }
  next();
});

// Create indexes for better query performance
activeUserSchema.index({ last_activity: 1, is_deleted: 1 });
activeUserSchema.index({ user_id: 1, is_deleted: 1 });

const ActiveUser = mongoose.model('ActiveUser', activeUserSchema);

module.exports = ActiveUser;
