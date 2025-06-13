// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: process.env.NODE_ENV === 'production',
    default: 'Untitled Product' // Fallback for development
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: process.env.NODE_ENV === 'production',
    default: 0 // Fallback for development
  },
  stock_quantity: {
    type: Number,
    required: process.env.NODE_ENV === 'production',
    default: 1 // Fallback for development
  },
  image_url: {
    type: String,
    default: ''
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  // Make the schema more flexible in development mode
  strict: process.env.NODE_ENV === 'production'
});

module.exports = mongoose.model('productsList', productSchema);
