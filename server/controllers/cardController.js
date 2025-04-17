const Card = require('../models/Card');
const fs = require('fs');
const path = require('path');

// Get all cards
exports.getAllCards = async (req, res) => {
  try {
    const cards = await Card.find().sort({ createdAt: -1 });
    res.status(200).json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Error fetching cards', error: error.message });
  }
};

// Get a single card by ID
exports.getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.status(200).json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ message: 'Error fetching card', error: error.message });
  }
};

// Upload image for card
exports.uploadImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      console.error('No file provided in the request');
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Read file and convert to base64
    const imagePath = path.join(__dirname, '..', req.file.path);
    const imageData = fs.readFileSync(imagePath);
    const base64Image = `data:${req.file.mimetype};base64,${imageData.toString('base64')}`;
    
    // Delete the temporary file
    fs.unlinkSync(imagePath);
    
    // Return the base64 encoded image
    res.json({ 
      success: true, 
      url: base64Image,
      message: 'Image uploaded and encoded successfully' 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      message: 'Error uploading image', 
      error: error.message 
    });
  }
};

// Create a new card with image
exports.createCard = async (req, res) => {
  try {
    const { title, message, image } = req.body;
    
    // Check for required fields
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    // Handle image - could be base64 string or file upload
    let imageData;
    
    if (req.file) {
      // If image was uploaded as a file, convert to base64
      const imagePath = path.join(__dirname, '..', req.file.path);
      const fileData = fs.readFileSync(imagePath);
      imageData = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
      
      // Delete the temporary file
      fs.unlinkSync(imagePath);
    } else if (image) {
      // If image was provided as base64 string or path
      imageData = image;
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    const newCard = new Card({
      title,
      message,
      image: imageData
    });

    const savedCard = await newCard.save();
    res.status(201).json(savedCard);
  } catch (error) {
    console.error('Error creating card:', error);
    // If an error occurs and we uploaded a file, try to clean it up
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, '..', req.file.path));
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Error creating card', error: error.message });
  }
};

// Update a card by ID
exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const { title, message, image } = req.body;
    
    // Update image if new one provided
    if (req.file) {
      // If image was uploaded as a file, convert to base64
      const imagePath = path.join(__dirname, '..', req.file.path);
      const fileData = fs.readFileSync(imagePath);
      card.image = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
      
      // Delete the temporary file
      fs.unlinkSync(imagePath);
    } else if (image && image !== card.image) {
      // If image was provided as base64 string and it's different from current
      card.image = image;
    }

    // Update other fields
    if (title) card.title = title;
    if (message) card.message = message;
    
    const updatedCard = await card.save();
    res.status(200).json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    // If an error occurs and we uploaded a file, try to clean it up
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, '..', req.file.path));
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    res.status(500).json({ message: 'Error updating card', error: error.message });
  }
};

// Delete a card by ID
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Delete the card document
    await Card.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Error deleting card', error: error.message });
  }
}; 