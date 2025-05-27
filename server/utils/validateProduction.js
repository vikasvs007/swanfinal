/**
 * Production Environment Validation Script
 * 
 * Run this script before deploying to production to ensure the environment
 * is properly configured.
 */

const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🔍 Validating production environment configuration...');

// Required environment variables for production
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'API_SECRET_TOKEN',
  'EXTERNAL_API_BASE_URL'
];

// Check environment variables
console.log('\n📋 Checking required environment variables:');
let missingVars = [];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
    console.error(`❌ Missing: ${envVar}`);
  } else {
    // Don't print the actual values of secrets
    if (['JWT_SECRET', 'API_SECRET_TOKEN'].includes(envVar)) {
      console.log(`✅ ${envVar}: [SECURED]`);
    } else {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`);
    }
  }
});

// Check if NODE_ENV is set to production
if (process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ WARNING: NODE_ENV is not set to "production"');
}

// Check for essential files
console.log('\n📂 Checking essential files:');
const essentialFiles = [
  path.join(__dirname, '..', 'server.js'),
  path.join(__dirname, '..', 'package.json'),
  path.join(__dirname, '..', '.env')
];

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found: ${path.basename(file)}`);
  } else {
    console.error(`❌ Missing: ${path.basename(file)}`);
  }
});

// Check MongoDB connection string
if (process.env.MONGODB_URI) {
  console.log('\n🔌 Validating MongoDB connection string:');
  const mongoUri = process.env.MONGODB_URI;
  
  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    console.error('❌ MongoDB URI contains localhost. Use a remote database for production!');
  } else {
    console.log('✅ MongoDB URI appears to use a remote database.');
  }
}

// Check JWT secret length
if (process.env.JWT_SECRET) {
  console.log('\n🔑 Checking JWT secret strength:');
  if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️ WARNING: JWT_SECRET is less than 32 characters. Consider using a stronger secret.');
  } else {
    console.log('✅ JWT_SECRET length is sufficient.');
  }
}

// Print summary
console.log('\n📊 Environment validation summary:');
if (missingVars.length > 0) {
  console.error(`❌ Missing ${missingVars.length} required environment variables.`);
  console.error('   You must set these before deploying to production.');
} else {
  console.log('✅ All required environment variables are set.');
}

if (process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ NODE_ENV should be set to "production".');
} else {
  console.log('✅ NODE_ENV is correctly set to "production".');
}

console.log('\n⚠️ IMPORTANT: Before deployment, ensure:');
console.log('   1. All console.log calls are removed or disabled in production code');
console.log('   2. Error handling is properly implemented');
console.log('   3. Rate limiting is appropriately configured');
console.log('   4. CORS settings are correctly set for your domains');
console.log('   5. Security headers are properly configured');
console.log('   6. Database connection is configured for a production database');

console.log('\n🚀 To run the validation again, use: node utils/validateProduction.js');
