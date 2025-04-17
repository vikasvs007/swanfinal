const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'customer'], 
    default: 'customer' 
  },
  profile_image: String,
  is_active: { 
    type: Boolean, 
    default: true 
  },
  is_deleted: { 
    type: Boolean, 
    default: false 
  },
  created_by: String,
  updated_by: String
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Users', userSchema);