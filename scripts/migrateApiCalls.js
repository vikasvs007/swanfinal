/**
 * API Call Migration Script
 * 
 * This script helps identify and migrate direct API calls to use the secure API client
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Target directory to scan (client source code)
const targetDir = path.join(__dirname, '..', 'client', 'src');

// Patterns to look for in the code (common direct API calls)
const patterns = [
  'fetch\\([\'"`]https?://',
  'axios\\.[a-z]+\\([\'"`]https?://',
  '\\.get\\([\'"`]https?://',
  '\\.post\\([\'"`]https?://',
  '\\.put\\([\'"`]https?://',
  '\\.delete\\([\'"`]https?://',
  'new\\s+XMLHttpRequest\\(',
  'localStorage.getItem\\([\'"`]apiToken[\'"`]\\)'
];

// Build a grep command to find potential API calls
const grepPattern = patterns.join('|');
const grepCommand = `grep -r -E "${grepPattern}" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" ${targetDir}`;

console.log('Scanning for direct API calls...');

try {
  // Execute the grep command
  const results = execSync(grepCommand, { encoding: 'utf8' });
  
  // Split the results by line
  const lines = results.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    console.log('✅ No direct API calls found.');
    process.exit(0);
  }
  
  console.log(`\n🔍 Found ${lines.length} potential direct API calls:`);
  
  // Group results by file
  const fileMap = {};
  
  lines.forEach(line => {
    const [filePath, ...rest] = line.split(':');
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    
    if (!fileMap[relativePath]) {
      fileMap[relativePath] = [];
    }
    
    fileMap[relativePath].push(rest.join(':'));
  });
  
  // Output the results grouped by file
  console.log('\n📁 Files with direct API calls that need migration:');
  
  Object.keys(fileMap).forEach(file => {
    console.log(`\n${file}:`);
    fileMap[file].forEach(line => {
      console.log(`  - ${line.trim()}`);
    });
  });
  
  console.log('\n📝 Migration instructions:');
  console.log('1. Import the secure API client:');
  console.log('   ```');
  console.log('   import api from \'../utils/apiClient\';');
  console.log('   ```');
  
  console.log('\n2. Replace direct API calls with the secure client:');
  console.log('   ```');
  console.log('   // Before:');
  console.log('   fetch(\'https://api.example.com/users\', { headers: { Authorization: `Bearer ${token}` } })');
  console.log('');
  console.log('   // After:');
  console.log('   api.getUsers()');
  console.log('   // or for custom endpoints:');
  console.log('   api.request(\'get\', \'/users\')');
  console.log('   ```');
  
  console.log('\n3. For help migrating complex cases, use the migration utility:');
  console.log('   ```');
  console.log('   import { migrateApiCall } from \'../utils/apiMigration\';');
  console.log('');
  console.log('   // Convert the existing call');
  console.log('   migrateApiCall(\'https://api.example.com/users?active=true\', { method: \'GET\' })');
  console.log('   ```');
  
} catch (error) {
  if (error.status === 1) {
    console.log('✅ No direct API calls found.');
  } else {
    console.error('Error scanning files:', error.message);
  }
} 