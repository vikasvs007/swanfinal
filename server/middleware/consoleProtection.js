/**
 * Console Protection Middleware
 * 
 * Prevents unauthorized API access from browser console and scripts
 */

const consoleProtection = (req, res, next) => {
  // Skip in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Check the Referer header - browser console requests often lack this
  const referer = req.get('Referer');
  
  // Check for presence of specific headers that are usually present in legitimate browser requests
  const isLegitimateRequest = () => {
    // Must have a referer that matches our domains
    if (!referer) {
      return false;
    }
    
    // Check if referer is from allowed domains
    const allowedDomains = [
      'admin.swansorter.com',
      'www.admin.swansorter.com',
      'swanfinal-1.onrender.com',
      'www.swanfinal-1.onrender.com',
    ];
    
    const isAllowedReferer = allowedDomains.some(domain => 
      referer.includes(domain)
    );
    
    if (!isAllowedReferer) {
      return false;
    }
    
    // Typically fetch requests will have these headers
    const hasAcceptHeader = !!req.get('Accept');
    const hasContentType = req.method !== 'GET' ? !!req.get('Content-Type') : true;
    
    // Most legitimate AJAX requests from your app will include this custom header
    const hasAppHeader = !!req.get('X-Requested-With');
    
    return hasAcceptHeader && hasContentType && hasAppHeader;
  };
  
  // Check for request modification from POST/PUT methods
  if (['PATCH'].includes(req.method)) {
    if (!isLegitimateRequest()) {
      // Use req.connection.write directly to avoid potential recursion with console.warn
      const logMessage = `[SECURITY] Blocked potential console request: ${req.method} ${req.originalUrl} from ${req.ip}`;
      // In production, log to a file or use a direct method that won't cause recursion
      process.stderr.write(logMessage + '\n');
      
      return res.status(403).json({
        success: false,
        message: 'Direct API access is not allowed'
      });
    }
  }
  
  next();
};

module.exports = consoleProtection;
