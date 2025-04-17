const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  name: {
    type: String,
    trim: true,
  },
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  products: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'productsList',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  total_amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending'
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('ordersList', orderSchema);
