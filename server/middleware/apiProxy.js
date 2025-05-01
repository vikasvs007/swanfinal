const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// API configuration with the token from environment variables
const API_TOKEN = process.env.API_SECRET_TOKEN;
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL;

/**
 * API Proxy middleware
 * This proxies requests to external APIs while keeping the API token on the server side
 */
const apiProxy = async (req, res) => {
  try {
    // Get the API endpoint path from the request
    const endpointPath = req.params.path;
    
    // Build the full URL for the external API
    const url = `${EXTERNAL_API_BASE_URL}/${endpointPath}`;
    
    // Create headers with API token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${API_TOKEN}`
    };
    
    // Copy any additional headers from the original request (except host and authorization)
    Object.keys(req.headers).forEach(header => {
      if (!['host', 'authorization'].includes(header.toLowerCase())) {
        headers[header] = req.headers[header];
      }
    });
    
    // Make the request to the external API with the appropriate method
    const response = await axios({
      method: req.method,
      url: url,
      headers: headers,
      data: req.method !== 'GET' ? req.body : undefined,
      params: req.method === 'GET' ? req.query : undefined
    });
    
    // Return the response from the external API
    return res.status(response.status).json(response.data);
  } catch (error) {
    // Handle errors from the external API
    console.error('API Proxy Error:', error.message);
    
    // If we have a response from the API, return it
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Error from external API',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        data: error.response.data
      });
    }
    
    // Otherwise return a generic error
    return res.status(500).json({
      success: false,
      message: 'Failed to communicate with external API',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = apiProxy; 