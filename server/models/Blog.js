const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: false
  },
  category: {
    type: String,
    enum: ['News', 'Updates', 'Tutorials', 'Events', 'Other'],
    default: 'News'
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured_image: {
    type: String,
    default: ''
  },
  gallery: [{
    type: String,
    default: ''
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  published_date: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create text index for search functionality
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blogs', blogSchema); 