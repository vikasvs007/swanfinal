const mongoose = require('mongoose');

async function connectToDatabase() {
  let retries = 5;
  
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crud_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 75000,
        maxPoolSize: 10
      });
      
      console.log('Connected to MongoDB successfully');
      
      // Add event listeners for connection issues
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected, attempting to reconnect...');
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
      });
      
      return true;
    } catch (error) {
      console.error(`MongoDB connection attempt failed (${retries} retries left):`, error.message);
      retries--;
      
      if (retries === 0) {
        console.error('Failed to connect to MongoDB after multiple attempts');
        return false;
      }
      
      // Wait before trying again (exponential backoff)
      const waitTime = Math.pow(2, 5 - retries) * 1000;
      console.log(`Waiting ${waitTime/1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

module.exports = { connectToDatabase }; 