/**
 * IP Blocklist Middleware
 * 
 * Automatically blocks IPs that repeatedly trigger rate limits
 */

const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');

// Path to store persistent IP blocklist
const BLOCKLIST_FILE = path.join(__dirname, '../data/ip-blocklist.json');

// Create directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize or load existing blocklist
let persistentBlocklist = new Set();
try {
  if (fs.existsSync(BLOCKLIST_FILE)) {
    const loadedList = JSON.parse(fs.readFileSync(BLOCKLIST_FILE, 'utf8'));
    persistentBlocklist = new Set(loadedList);
    console.log(`Loaded ${persistentBlocklist.size} IPs from blocklist`);
  } else {
    // Create empty blocklist file if it doesn't exist
    fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify([]), 'utf8');
    console.log('Created new IP blocklist file');
  }
} catch (error) {
  console.error('Error loading IP blocklist:', error);
}

// Cache to track rate limit violations
// key: IP address, value: {count: number, lastViolation: timestamp}
const violationTracker = new NodeCache({ stdTTL: 24 * 60 * 60 }); // 24 hour TTL

// Configuration
const BLOCK_THRESHOLD = 5; // Number of violations before blocking
const BLOCK_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Save blocklist to disk
const saveBlocklist = () => {
  try {
    fs.writeFileSync(BLOCKLIST_FILE, JSON.stringify([...persistentBlocklist]), 'utf8');
  } catch (error) {
    console.error('Error saving IP blocklist:', error);
  }
};

// Register a rate limit violation for an IP
const registerViolation = (ip) => {
  // Skip for localhost in development
  if ((ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') && 
      process.env.NODE_ENV !== 'production') {
    return;
  }
  
  const record = violationTracker.get(ip) || { count: 0, lastViolation: Date.now() };
  record.count += 1;
  record.lastViolation = Date.now();
  
  violationTracker.set(ip, record);
  
  console.warn(`[SECURITY] Rate limit violation #${record.count} from IP: ${ip}`);
  
  // If violations exceed threshold, add to blocklist
  if (record.count >= BLOCK_THRESHOLD) {
    addToBlocklist(ip);
  }
};

// Add an IP to the blocklist
const addToBlocklist = (ip) => {
  if (persistentBlocklist.has(ip)) {
    return; // Already blocked
  }
  
  persistentBlocklist.add(ip);
  saveBlocklist();
  
  console.warn(`[SECURITY] IP ${ip} has been added to the blocklist`);
};

// Remove an IP from the blocklist
const removeFromBlocklist = (ip) => {
  if (!persistentBlocklist.has(ip)) {
    return false; // Not in blocklist
  }
  
  persistentBlocklist.delete(ip);
  saveBlocklist();
  
  console.log(`IP ${ip} has been removed from the blocklist`);
  return true;
};

// Check if an IP is on the blocklist
const isBlocked = (ip) => {
  return persistentBlocklist.has(ip);
};

// Middleware to check if the IP is blocked
const blocklistMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  // Skip for localhost in development
  if ((ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') && 
      process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  if (isBlocked(ip)) {
    console.warn(`[SECURITY] Blocked request from banned IP: ${ip}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied: Your IP address has been blocked due to excessive rate limit violations'
    });
  }
  
  next();
};

// Automatic cleanup of expired IPs from blocklist (run once a day)
const cleanupBlocklist = () => {
  const now = Date.now();
  const expiredIps = [];
  
  persistentBlocklist.forEach(ip => {
    const record = violationTracker.get(ip);
    if (!record || (now - record.lastViolation > BLOCK_DURATION)) {
      expiredIps.push(ip);
    }
  });
  
  if (expiredIps.length > 0) {
    expiredIps.forEach(ip => {
      persistentBlocklist.delete(ip);
    });
    saveBlocklist();
    console.log(`Removed ${expiredIps.length} expired IPs from blocklist`);
  }
};

// Start cleanup job
const startCleanupJob = () => {
  setInterval(cleanupBlocklist, 24 * 60 * 60 * 1000); // Run once per day
  console.log('IP blocklist cleanup job started');
};

// Initialize cleanup job
startCleanupJob();

module.exports = {
  blocklistMiddleware,
  registerViolation,
  addToBlocklist,
  removeFromBlocklist,
  isBlocked,
  getBlockedIps: () => [...persistentBlocklist]
};
