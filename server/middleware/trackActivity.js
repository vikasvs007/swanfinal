const ActiveUser = require('../models/ActiveUser');

const trackActivity = async (req, res, next) => {
  try {
    if (req.user) {
      const deviceInfo = req.headers['user-agent'];
      const currentPage = req.originalUrl;

      // Update or create active user record
      await ActiveUser.findOneAndUpdate(
        { user_id: req.user._id, is_deleted: false },
        {
          last_activity: new Date(),
          current_page: currentPage,
          device_info: deviceInfo,
          is_online: true,
          $setOnInsert: { session_start: new Date() }
        },
        { upsert: true, new: true }
      );
    }
    next();
  } catch (error) {
    console.error('Error tracking user activity:', error);
    next(); // Continue even if tracking fails
  }
};

module.exports = trackActivity;
