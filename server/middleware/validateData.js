const validateData = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      if (req.body && Object.keys(req.body).length > 0) {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }));
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
          });
        }
      }

      // Validate request query parameters
      if (req.query && Object.keys(req.query).length > 0) {
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }));
          return res.status(400).json({
            success: false,
            message: 'Invalid query parameters',
            errors
          });
        }
      }

      // Validate request params
      if (req.params && Object.keys(req.params).length > 0) {
        const { error } = schema.validate(req.params, { abortEarly: false });
        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }));
          return res.status(400).json({
            success: false,
            message: 'Invalid URL parameters',
            errors
          });
        }
      }

      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during validation'
      });
    }
  };
};

module.exports = validateData; 