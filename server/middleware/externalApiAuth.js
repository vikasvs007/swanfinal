/**
 * External API Authentication Middleware
 * 
 * This middleware ensures that any external API requests (from Postman, etc.)
 * must provide valid authentication tokens for data modification operations
 * without changing existing functionality.
 */
const { apiKeyAuth } = require('./auth');

/**
 * Middleware to enforce API token authentication for external clients
 * while preserving existing website functionality
 */
const externalApiAuth = (req, res, next) => {
  // Check if request is coming from browser or external client
  const userAgent = req.headers['user-agent'] || '';
  const contentType = req.headers['content-type'] || '';
  const origin = req.headers['origin'] || '';
  
  // Identify if request is likely from an API client like Postman
  // External API clients usually have specific user-agent strings or don't have origin headers
  const isLikelyExternal = (
    !origin || // No origin header (common for API clients)
    userAgent.includes('Postman') || 
    userAgent.includes('insomnia') ||
    userAgent.includes('curl') ||
    (contentType.includes('application/json') && !userAgent.includes('Mozilla'))
  );

  if (isLikelyExternal) {
    // For external clients, enforce API token authentication
    return apiKeyAuth(req, res, next);
  }
  
  // For regular web app traffic, continue with existing authentication flow
  next();
};

module.exports = externalApiAuth; 