// controllers/enquiryController.js
const Enquiry = require('../models/Enquiry');
const { sendEnquiryNotification } = require('../utils/mailer');

const enquiryController = {
  // Create a new enquiry
  async createEnquiry(req, res) {
    try {
      const {
        user_id,
        name,
        email,
        phone,
        subject,
        message,
        status,
        response
      } = req.body;

      // Validate required fields - removed user_id from required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Normalize status value
      let normalizedStatus = status || 'pending';
      // Handle old status value conversion
      if (normalizedStatus === 'open') {
        normalizedStatus = 'pending';
      }

      const enquiry = new Enquiry({
        // Only include user_id if it's provided
        ...(user_id && { user_id }),
        name,
        email,
        phone,
        subject,
        message,
        status: normalizedStatus,
        response: response || '',
        is_deleted: false
      });

      await enquiry.save();
      
      // Send email notification asynchronously (don't await)
      sendEnquiryNotification(enquiry)
        .then(info => {
          if (info) {
            console.log(`Email notification sent for enquiry ID: ${enquiry._id}`);
          }
        })
        .catch(err => {
          console.error('Failed to send email notification:', err);
        });
      
      res.status(201).json(enquiry);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all enquiries
  async getEnquiries(req, res) {
    try {
      const enquiries = await Enquiry.find({ is_deleted: false })
        .populate('user_id', 'name email phone')
        .sort({ created_at: -1 });
      
      // Normalize status values in the response
      const normalizedEnquiries = enquiries.map(enquiry => {
        const normEnquiry = enquiry.toObject();
        if (normEnquiry.status === 'open') {
          normEnquiry.status = 'pending';
        }
        return normEnquiry;
      });
      
      res.json(normalizedEnquiries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get a single enquiry
  async getEnquiry(req, res) {
    try {
      const enquiry = await Enquiry.findOne({ 
        _id: req.params.id,
        is_deleted: false 
      }).populate('user_id', 'name email phone');
      
      if (!enquiry) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }
      
      // Normalize status value in response
      const normalizedEnquiry = enquiry.toObject();
      if (normalizedEnquiry.status === 'open') {
        normalizedEnquiry.status = 'pending';
      }
      
      res.json(normalizedEnquiry);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update an enquiry
  async updateEnquiry(req, res) {
    try {
      const {
        name,
        email,
        phone,
        subject,
        message,
        status,
        response
      } = req.body;

      const updateData = {};
      
      // Only update fields that are provided
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (subject) updateData.subject = subject;
      if (message) updateData.message = message;
      if (status) {
        // Normalize status value
        updateData.status = status === 'open' ? 'pending' : status;
      }
      if (response !== undefined) updateData.response = response;

      const enquiry = await Enquiry.findOneAndUpdate(
        { _id: req.params.id, is_deleted: false },
        updateData,
        { new: true, runValidators: true }
      ).populate('user_id', 'name email phone');

      if (!enquiry) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }
      
      res.json(enquiry);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete an enquiry (soft delete)
  async deleteEnquiry(req, res) {
    try {
      const enquiry = await Enquiry.findById(req.params.id);
      
      if (!enquiry || enquiry.is_deleted) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }

      enquiry.is_deleted = true;
      await enquiry.save();
      
      res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = enquiryController;
