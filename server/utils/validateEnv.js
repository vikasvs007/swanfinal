/**
 * Environment Variable Validation
 * 
 * This utility validates that all required environment variables
 * are properly configured for the API proxy
 */

const validateEnvironment = () => {
  const requiredVars = [
    'API_SECRET_TOKEN',
    'EXTERNAL_API_BASE_URL'
  ];
  
  const missingVars = [];
  
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Load production environment variables if available
  if (isProduction) {
    console.log('Loading production environment variables...');
    
    // Try to load from .env.production first
    try {
      require('dotenv').config({ path: '.env.production' });
      console.log('Successfully loaded .env.production');
    } catch (err) {
      console.warn('Could not load .env.production:', err.message);
    }
    
    // If still missing, try to load from .env
    if (missingVars.length > 0) {
      try {
        require('dotenv').config();
        console.log('Successfully loaded .env');
      } catch (err) {
        console.warn('Could not load .env:', err.message);
      }
    }
  }
  
  // Now check the variables
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('Please add these variables to your environment configuration');
    
    if (isProduction) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    } else {
      console.warn('⚠️ API proxy may not function correctly without these environment variables');
    }
    
    return false;
  }
  
  // Optional validation of URL format
  try {
    new URL(process.env.EXTERNAL_API_BASE_URL);
  } catch (error) {
    console.warn(`⚠️ EXTERNAL_API_BASE_URL (${process.env.EXTERNAL_API_BASE_URL}) is not a valid URL`);
    return false;
  }
  
  console.log('✅ Environment validation successful');
  return true;
};

module.exports = validateEnvironment; 