// models/Enquiry.js
const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved', 'closed', 'open'],
    default: 'pending'
  },
  response: {
    type: String,
    default: ''
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Middleware to handle status field migration
enquirySchema.pre('save', function(next) {
  // If status is 'open', convert it to 'pending' for new frontend compatibility
  if (this.status === 'open') {
    this.status = 'pending';
  }
  next();
});

// Create compound index for common queries to improve performance
enquirySchema.index({ is_deleted: 1, created_at: -1 });
enquirySchema.index({ status: 1, is_deleted: 1 });

module.exports = mongoose.model('usersEnquires', enquirySchema);
