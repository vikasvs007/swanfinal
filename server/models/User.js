const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: { 
    type: String, 
    required: true,
    trim: true
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

// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ is_active: 1 });
userSchema.index({ role: 1 });

// Set collection name explicitly to avoid collection name issues
module.exports = mongoose.model('user', userSchema,);