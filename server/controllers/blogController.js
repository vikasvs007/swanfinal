const Blog = require('../models/Blog');
const mongoose = require('mongoose');

// Helper function to create URL-friendly slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    console.log("Fetching blogs with query:", req.query);
    const { status, category, featured, search, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = { is_deleted: false };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Filter featured blogs if requested
    if (featured === 'true') {
      query.is_featured = true;
    }
    
    // Search by text if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    console.log("Final query:", JSON.stringify(query));
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination - remove populate to fix User model error
    const blogs = await Blog.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    
    console.log(`Found ${blogs.length} blogs out of ${total} total`);
    
    res.json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs', error: error.toString() });
  }
};

// Get blog by ID
exports.getBlog = async (req, res) => {
  try {
    // Remove populate to fix User model error
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    // Return the blog inside an object with blog property
    res.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Error fetching blog', error: error.message });
  }
};

// Get blog by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    // Remove populate to fix User model error
    const blog = await Blog.findOne({ 
      slug: req.params.slug,
      is_deleted: false
    });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    // Return the blog inside an object with blog property
    res.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Error fetching blog', error: error.message });
  }
};

// Create new blog
exports.createBlog = async (req, res) => {
  try {
    console.log("Creating blog with data:", req.body);
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featured_image,
      status,
      is_featured
    } = req.body;
    
    // Check required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    // Generate slug from title
    let slug = createSlug(title);
    
    // Check if slug exists and make it unique if needed
    const slugExists = await Blog.findOne({ slug, is_deleted: false });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // Add published date if status is Published
    const published_date = status === 'Published' ? new Date() : null;
    
    // Use the base64 image string directly
    const imageUrl = featured_image === 'uploading' ? '' : featured_image;
    
    const newBlog = new Blog({
      title,
      slug,
      content,
      excerpt: excerpt || title,
      author: req.user ? req.user._id : null,
      category: category || 'Other',
      tags: tags || [],
      featured_image: imageUrl,
      status: status || 'Draft',
      published_date,
      is_featured: is_featured || false
    });
    
    const savedBlog = await newBlog.save();
    console.log("Blog created successfully:", savedBlog._id);
    
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Error creating blog', error: error.toString() });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    console.log("Updating blog with id:", req.params.id, "and data:", req.body);
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featured_image,
      status,
      is_featured
    } = req.body;
    
    const blog = await Blog.findOne({ _id: req.params.id, is_deleted: false });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Generate new slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = createSlug(title);
      
      // Check if new slug exists and make it unique if needed
      const slugExists = await Blog.findOne({ 
        slug, 
        _id: { $ne: blog._id },
        is_deleted: false
      });
      
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }
    
    // Set published_date if status is changing to Published
    let published_date = blog.published_date;
    if (status === 'Published' && blog.status !== 'Published') {
      published_date = new Date();
    }
    
    // Use the base64 image string directly
    const imageUrl = featured_image === 'uploading' ? blog.featured_image : featured_image;
    
    // Update blog - remove populate to fix User model error
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title: title || blog.title,
        slug,
        content: content || blog.content,
        excerpt: excerpt || blog.excerpt || blog.title,
        category: category || blog.category,
        tags: tags || blog.tags,
        featured_image: imageUrl,
        status: status || blog.status,
        published_date,
        is_featured: is_featured !== undefined ? is_featured : blog.is_featured
      },
      { new: true }
    );
    
    console.log("Blog updated successfully:", updatedBlog._id);
    
    res.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
};

// Delete blog (soft delete)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Perform soft delete
    blog.is_deleted = true;
    await blog.save();
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
};

// Get blog categories
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({ message: 'Error fetching blog categories', error: error.message });
  }
};

// Get blog tags
exports.getBlogTags = async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { is_deleted: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json(tags);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    res.status(500).json({ message: 'Error fetching blog tags', error: error.message });
  }
};

// Upload image for blog
exports.uploadImage = async (req, res) => {
  try {
    console.log('Uploading image. Request file:', req.file);
    
    // Check if file was uploaded
    if (!req.file) {
      console.error('No file provided in the request');
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Create the file URL - make sure to use absolute URL
    const fileUrl = `/uploads/blogs/${req.file.filename}`;
    console.log('File uploaded successfully to path:', fileUrl);
    console.log('Full file path:', req.file.path);
    
    // Check if the file exists
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.resolve(req.file.path);
    
    if (fs.existsSync(fullPath)) {
      console.log('Verified: File exists at:', fullPath);
    } else {
      console.error('ERROR: File does not exist at:', fullPath);
    }
    
    // Return the image URL
    res.json({ 
      success: true, 
      url: fileUrl,
      fullPath: fullPath,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      message: 'Error uploading image', 
      error: error.message 
    });
  }
}; 