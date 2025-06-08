/**
 * Console Protection Utilities
 * 
 * This file contains functions to help prevent tampering with your app
 * through the browser console.
 */

// Initialize console protection - call this in your app's entry point
export const initConsoleProtection = () => {
  // Only apply in production environments
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV MODE] Console protection disabled');
    return;
  }

  // Add a custom header to all fetch/XHR requests to identify legitimate app requests
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    options.headers = options.headers || {};
    options.headers = {
      ...options.headers,
      'X-Requested-With': 'https://swanfinal-1.onrender.com'
    };
    return originalFetch.call(this, url, options);
  };

  // Override XMLHttpRequest to add custom headers
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    const result = originalXhrOpen.apply(this, arguments);
    this.setRequestHeader('X-Requested-With', 'https://swanfinal-1.onrender.com');
    return result;
  };

  // Disable common console debugging functions in production
  if (window.console) {
    const noop = () => {};
    const methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'group',
      'groupCollapsed', 'groupEnd', 'info', 'profile', 'profileEnd',
      'time', 'timeEnd', 'timeStamp', 'trace'
    ];
    
    // Create a warning message for attempts to use console
    const consoleWarning = () => {
      console.warn('Console commands are disabled in production for security reasons.');
      return false;
    };

    // Replace methods with warnings or no-ops
    methods.forEach(method => {
      if (window.console[method]) {
        window.console[method] = noop;
      }
    });
    
    // Keep these methods but show warnings
    ['log', 'warn', 'error'].forEach(method => {
      const originalMethod = window.console[method];
      window.console[method] = function(...args) {
        // Prevent infinite recursion by checking message content
        if (args[0] === 'Console protection activated for production environment' ||
            args[0] === 'Console commands are disabled in production for security reasons.') {
          return originalMethod.apply(console, args);
        }
        
        consoleWarning();
        // Still allow error logging for critical issues
        if (method === 'error') {
          originalMethod.apply(console, args);
        }
      };
    });
  }

  // Prevent debugging and breakpoints
  setInterval(() => {
    const startTime = new Date();
    debugger; // This triggers only when dev tools are open with breakpoints
    const endTime = new Date();
    
    // If debugger takes significant time, dev tools are likely open
    if (endTime - startTime > 100) {
      // Take defensive actions - reload page, clear localStorage, etc.
      window.location.href = '/';
    }
  }, 1000);

  // Disable right-click (context menu)
  document.addEventListener('contextmenu', event => {
    event.preventDefault();
    return false;
  });
  
  // Set a flag to prevent recursion issues
  if (!window._consoleWarningShown) {
    window._consoleWarningShown = true;
    console.warn('Console protection activated for production environment');
  }
};

// Use this function to detect if DevTools are open
export const detectDevTools = (callback) => {
  const threshold = 160;
  
  // Check by element size
  const checkDevToolsBySize = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      callback(true);
    } else {
      callback(false);
    }
  };
  
  // Check by debugger
  const checkDevToolsByDebugger = () => {
    const before = performance.now();
    debugger;
    const after = performance.now();
    const diff = after - before;
    
    if (diff > 100) {
      callback(true);
    }
  };
  
  // Run checks
  window.addEventListener('resize', checkDevToolsBySize);
  setInterval(checkDevToolsByDebugger, 1000);
  
  // Initial check
  checkDevToolsBySize();
};

export default {
  initConsoleProtection,
  detectDevTools
};
