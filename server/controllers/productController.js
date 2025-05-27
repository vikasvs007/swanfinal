// controllers/productController.js
const Product = require('../models/Product');

const productController = {
  // Create a new product
  async createProduct(req, res) {
    try {
      // Log request body in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating product with data:', JSON.stringify(req.body, null, 2));
      }
      
      // Ensure req.body is properly formatted
      const productData = req.body;
      
      // Create the product with enhanced error handling
      const product = new Product(productData);
      
      await product.save();
      console.log('Product created successfully:', product._id);
      res.status(201).json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Error creating product:', error.message);
      
      if (error.name === 'ValidationError') {
        // Handle mongoose validation errors
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          success: false, 
          message: 'Validation error', 
          errors: validationErrors 
        });
      }
      
      res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }
  },

  // Get all products
  async getProducts(req, res) {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single product
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a product
  async updateProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a product
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Search products
  async searchProducts(req, res) {
    try {
      const { query } = req.query;
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = productController;