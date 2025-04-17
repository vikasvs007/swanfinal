// models/UserStatistics.js
const mongoose = require('mongoose');

const userStatisticsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  pages_visited: [{
    page_name: {
      type: String,
      required: true
    },
    visit_count: {
      type: Number,
      default: 1
    }
  }],
  total_time_spent: {
    type: Number,
    default: 0
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('userStatistics', userStatisticsSchema);