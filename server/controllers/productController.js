// controllers/productController.js
const Product = require('../models/Product');

const productController = {
  // Create a new product
  async createProduct(req, res) {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
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