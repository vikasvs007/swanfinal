// models/Visitor.js
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip_address: {
    type: String,
    required: true
  },
  device_info: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  referrer: String,
  location: {
    country: String,
    country_code: String,
    city: String,
    latitude: Number,
    longitude: Number,
    coordinates: [Number] // [longitude, latitude] format for GeoJSON compatibility
  },
  visit_count: {
    type: Number,
    default: 1
  },
  last_visited_at: {
    type: Date,
    default: Date.now
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('visitorscollections', visitorSchema);
