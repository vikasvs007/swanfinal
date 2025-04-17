// controllers/orderController.js
const Order = require('../models/Order');

const orderController = {
  // Create a new order
  async createOrder(req, res) {
    try {
      // Create order object with validated fields
      const orderData = { ...req.body };
      
      // If there's no user_id but there is a name, ensure user_id is undefined
      // This allows mongoose to save the order without a user_id reference
      if (!orderData.user_id && orderData.name) {
        orderData.user_id = undefined;
      }
      
      const order = new Order(orderData);
      await order.save();
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all orders
  async getAllOrders(req, res) {
    try {
      const orders = await Order.find()
        .populate('user_id', 'name email')
        .populate('products.product_id', 'name price stock_quantity image')
        .sort({ created_at: -1 });

      const formattedOrders = orders.map(order => {
        const orderObj = order.toObject();
        return {
          ...orderObj,
          // Use order.name if user_id is not available
          user_name: orderObj.user_id?.name || orderObj.name || 'Guest',
          products: orderObj.products.map(product => ({
            ...product,
            name: product.product_id?.name || 'N/A',
            price: product.product_id?.price || 0,
            image: product.product_id?.image || '',
          }))
        };
      });

      res.json(formattedOrders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single order
  async getOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user_id', 'name email')
        .populate('products.product_id', 'name price');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update order status
  async updateOrder(req, res) {
    try {
      // Create update object with validated fields
      const updateData = { ...req.body };
      
      // If there's no user_id but there is a name, ensure user_id is undefined
      if (!updateData.user_id && updateData.name) {
        updateData.user_id = undefined;
      }
      
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('user_id', 'name email')
       .populate('products.product_id', 'name price');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete an order
  async deleteOrder(req, res) {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = orderController;
