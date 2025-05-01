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
    console.error('Please add these variables to your .env file');
    
    // Don't crash in development, but warn clearly
    if (process.env.NODE_ENV === 'production') {
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