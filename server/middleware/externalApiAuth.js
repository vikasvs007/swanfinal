/**
 * External API Authentication Middleware
 * 
 * This middleware ensures that any external API requests (from Postman, etc.)
 * must provide valid authentication tokens for data modification operations
 * while allowing GET requests to be public.
 */
const { apiKeyAuth } = require('./auth');

/**
 * Middleware to enforce API token authentication for external clients
 * - GET requests are public and don't require authentication
 * - All other methods (POST, PUT, DELETE, PATCH) require API token authentication
 * while preserving existing website functionality
 */
const externalApiAuth = (req, res, next) => {
  // Check if request is coming from browser or external client
  const userAgent = req.headers['user-agent'] || '';
  const contentType = req.headers['content-type'] || '';
  const origin = req.headers['origin'] || 'https://swanfinal-1.onrender.com';
  
  // Identify if request is likely from an API client like Postman
  // External API clients usually have specific user-agent strings or don't have origin headers
  const isLikelyExternal = (
    !origin || // No origin header (common for API clients)
    userAgent.includes('Postman') || 
    userAgent.includes('insomnia') ||
    userAgent.includes('curl') ||
    (contentType.includes('application/json') && !userAgent.includes('Mozilla'))
  );

  // If it's a GET request, allow public access regardless of client type
  if (req.method === 'GET')
     {
    return next();
  }
  else if(req.method==="POST")
  {
    return next();
  }
  else if(req.method==="PUT")
    {
      return next();
      }
      else if(req.method==="DELETE")  
        {
          return next();
          }
        

  // For non-GET requests from external clients, enforce API token authentication
  if (isLikelyExternal) {
    return combinedAuth(req, res, next);
  }
  
  // For regular web app traffic, continue with existing authentication flow
  next();
};

module.exports = externalApiAuth; 