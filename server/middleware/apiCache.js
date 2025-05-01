/**
 * API Caching Middleware
 * 
 * This middleware implements caching for the API proxy to improve performance
 * and reduce load on external APIs
 */
const NodeCache = require('node-cache');

// Create a cache instance with entries expiring after 5 minutes
const apiCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes in seconds
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // For better performance
});

/**
 * Generates a cache key based on request details
 */
const getCacheKey = (req) => {
  // Create a unique key based on the request method, path, and query params
  const method = req.method.toLowerCase();
  const path = req.params.path;
  const query = JSON.stringify(req.query || {});
  
  return `${method}:${path}:${query}`;
};

/**
 * Middleware to cache API responses
 */
const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  // Skip cache if requested
  if (req.headers['x-skip-cache'] === 'true') {
    return next();
  }
  
  const key = getCacheKey(req);
  const cachedResponse = apiCache.get(key);
  
  if (cachedResponse) {
    // If we have a cached response, return it
    res.setHeader('X-Cache', 'HIT');
    return res.status(cachedResponse.status).json(cachedResponse.data);
  }
  
  // No cached response, continue to the API proxy
  res.setHeader('X-Cache', 'MISS');
  
  // Store the original JSON method to intercept the response
  const originalJson = res.json;
  res.json = function(data) {
    // Cache the response before sending it
    apiCache.set(key, {
      status: res.statusCode,
      data: data
    });
    
    // Call the original json method
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Clear the cache for specific paths or completely
 */
const clearCache = (path = null) => {
  if (path) {
    // Clear only cache entries that match the path
    const keys = apiCache.keys();
    const pathKeys = keys.filter(key => key.includes(`:${path}:`));
    pathKeys.forEach(key => apiCache.del(key));
    return pathKeys.length;
  } else {
    // Clear the entire cache
    apiCache.flushAll();
    return true;
  }
};

module.exports = {
  cacheMiddleware,
  clearCache
}; 