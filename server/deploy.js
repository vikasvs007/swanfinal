// deploy.js - A helper script to prepare your application for deployment to Hostinger
const fs = require('fs');
const path = require('path');

console.log('Preparing for deployment to Hostinger with SSL...');

// 1. Ensure production env file exists
try {
  if (fs.existsSync(path.join(__dirname, '.env.production'))) {
    console.log('✅ .env.production file found');
    
    // Copy production env to .env
    fs.copyFileSync(
      path.join(__dirname, '.env.production'),
      path.join(__dirname, '.env')
    );
    console.log('✅ Copied .env.production to .env');
  } else {
    console.error('❌ .env.production file not found. Please create it first.');
    process.exit(1);
  }
} catch (err) {
  console.error('Error checking for .env.production:', err);
  process.exit(1);
}

// 2. Check for MongoDB connection string
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  if (!envContent.includes('MONGODB_URI=')) {
    console.error('❌ MONGODB_URI not found in .env file. Please add it.');
    process.exit(1);
  }
  
  if (!envContent.includes('ssl=true')) {
    console.warn('⚠️ Warning: MongoDB connection string may not have SSL enabled.');
  } else {
    console.log('✅ MongoDB connection string has SSL enabled');
  }
  
  if (!envContent.includes('NODE_ENV=production')) {
    console.warn('⚠️ Warning: NODE_ENV is not set to production.');
  } else {
    console.log('✅ NODE_ENV is set to production');
  }
} catch (err) {
  console.error('Error reading .env file:', err);
  process.exit(1);
}

// 3. Perform any other deployment preparations
console.log('\nDeployment preparation complete!');
console.log('\nReminder for Hostinger deployment:');
console.log('1. Make sure SSL is enabled in your Hostinger control panel');
console.log('2. Hostinger handles SSL certificates, so the application runs on HTTP internally');
console.log('3. Set up MongoDB IP allowlisting for your Hostinger server IP address');
console.log('4. Use "npm run start" to start the server on Hostinger');
console.log('\nGood luck with your deployment! 🚀'); 