// controllers/visitorController.js
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const UserStatistics = require('../models/UserStatistics');

const visitorController = {
  // Get all visitors
  async getVisitors(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const query = { is_deleted: false };

      const visitors = await Visitor.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ last_visited_at: -1 });

      const total = await Visitor.countDocuments(query);

      // Transform visitors data to ensure coordinates are properly formatted
      const transformedVisitors = visitors.map(visitor => {
        const visitorObj = visitor.toObject();
        
        // Ensure the location object exists
        if (!visitorObj.location) {
          visitorObj.location = {};
        }
        
        // Convert string coordinates to numbers if needed
        if (visitorObj.location.latitude) {
          visitorObj.location.latitude = parseFloat(visitorObj.location.latitude);
        }
        
        if (visitorObj.location.longitude) {
          visitorObj.location.longitude = parseFloat(visitorObj.location.longitude);
        }
        
        // Add coordinates array if it doesn't exist but we have latitude/longitude
        if ((!visitorObj.location.coordinates || visitorObj.location.coordinates.length !== 2) && 
            visitorObj.location.latitude && 
            visitorObj.location.longitude) {
          
          // Ensure coordinates are valid numbers
          const lat = parseFloat(visitorObj.location.latitude);
          const lng = parseFloat(visitorObj.location.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            visitorObj.location.coordinates = [lng, lat]; // GeoJSON format [longitude, latitude]
          }
        }
        
        // If we have coordinates array but not lat/long fields, extract them
        if (visitorObj.location.coordinates && 
            visitorObj.location.coordinates.length === 2 && 
            (!visitorObj.location.latitude || !visitorObj.location.longitude)) {
          
          // Ensure coordinates are valid numbers
          const lng = parseFloat(visitorObj.location.coordinates[0]);
          const lat = parseFloat(visitorObj.location.coordinates[1]);
          
          if (!isNaN(lng) && !isNaN(lat)) {
            visitorObj.location.longitude = lng;
            visitorObj.location.latitude = lat;
          }
        }
        
        return {
          ...visitorObj,
          ipAddress: visitor.ip_address,
          lastVisited: visitor.last_visited_at,
          visitCount: visitor.visit_count
        };
      });

      res.json({
        visitors: transformedVisitors,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get visitor by IP
  async getVisitorByIp(req, res) {
    try {
      const visitor = await Visitor.findOne({ 
        ip_address: req.params.ip,
        is_deleted: false 
      });

      if (!visitor) {
        return res.status(404).json({ message: 'Visitor not found' });
      }

      res.json(visitor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create or update visitor
  async createOrUpdateVisitor(req, res) {
    try {
      const { ip_address, location, device_info, browser, os, referrer, visit_count } = req.body;

      // Validate and sanitize location data
      let sanitizedLocation = null;
      if (location) {
        sanitizedLocation = {
          country: location.country || '',
          city: location.city || '',
          country_code: location.country_code || ''
        };
        
        // Handle coordinates - convert to numbers and validate
        if (location.latitude && location.longitude) {
          const lat = parseFloat(location.latitude);
          const lng = parseFloat(location.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            sanitizedLocation.latitude = lat;
            sanitizedLocation.longitude = lng;
            sanitizedLocation.coordinates = [lng, lat]; // GeoJSON format
          }
        } else if (location.coordinates && location.coordinates.length === 2) {
          const lng = parseFloat(location.coordinates[0]);
          const lat = parseFloat(location.coordinates[1]);
          
          if (!isNaN(lng) && !isNaN(lat)) {
            sanitizedLocation.coordinates = [lng, lat];
            sanitizedLocation.longitude = lng;
            sanitizedLocation.latitude = lat;
          }
        }
      }

      let visitor = await Visitor.findOne({ ip_address, is_deleted: false });

      if (visitor) {
        // Update existing visitor
        visitor.visit_count += 1;
        visitor.last_visited_at = new Date();
        
        if (sanitizedLocation) {
          visitor.location = sanitizedLocation;
        }
        
        // Update other fields if provided
        if (device_info) visitor.device_info = device_info;
        if (browser) visitor.browser = browser;
        if (os) visitor.os = os;
        if (referrer) visitor.referrer = referrer;
      } else {
        // Create new visitor
        visitor = new Visitor({
          ip_address,
          location: sanitizedLocation,
          device_info: device_info || 'Unknown',
          browser: browser || 'Unknown',
          os: os || 'Unknown',
          referrer: referrer || '',
          visit_count: visit_count || 1,
          last_visited_at: new Date(),
          is_deleted: false
        });
      }

      const savedVisitor = await visitor.save();
      
      // Transform the saved visitor to include both formats of coordinates
      const transformedVisitor = savedVisitor.toObject();
      
      if (!transformedVisitor.location) {
        transformedVisitor.location = {};
      }
      
      // Ensure we have both lat/lng and coordinates array
      if (transformedVisitor.location.latitude && transformedVisitor.location.longitude && 
          (!transformedVisitor.location.coordinates || transformedVisitor.location.coordinates.length !== 2)) {
        transformedVisitor.location.coordinates = [
          parseFloat(transformedVisitor.location.longitude),
          parseFloat(transformedVisitor.location.latitude)
        ];
      } else if (transformedVisitor.location.coordinates && transformedVisitor.location.coordinates.length === 2 &&
                (!transformedVisitor.location.latitude || !transformedVisitor.location.longitude)) {
        transformedVisitor.location.longitude = parseFloat(transformedVisitor.location.coordinates[0]);
        transformedVisitor.location.latitude = parseFloat(transformedVisitor.location.coordinates[1]);
      }
      
      res.status(201).json(transformedVisitor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update visitor by ID
  async updateVisitor(req, res) {
    try {
      const { id } = req.params;
      const { ip_address, location, device_info, browser, os, referrer, visit_count } = req.body;

      // Validate and sanitize location data
      let sanitizedLocation = null;
      if (location) {
        sanitizedLocation = {
          country: location.country || '',
          city: location.city || '',
          country_code: location.country_code || ''
        };
        
        // Handle coordinates - convert to numbers and validate
        if (location.latitude && location.longitude) {
          const lat = parseFloat(location.latitude);
          const lng = parseFloat(location.longitude);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            sanitizedLocation.latitude = lat;
            sanitizedLocation.longitude = lng;
            sanitizedLocation.coordinates = [lng, lat]; // GeoJSON format
          }
        } else if (location.coordinates && location.coordinates.length === 2) {
          const lng = parseFloat(location.coordinates[0]);
          const lat = parseFloat(location.coordinates[1]);
          
          if (!isNaN(lng) && !isNaN(lat)) {
            sanitizedLocation.coordinates = [lng, lat];
            sanitizedLocation.longitude = lng;
            sanitizedLocation.latitude = lat;
          }
        }
      }

      // Find the visitor by ID
      const visitor = await Visitor.findById(id);
      
      if (!visitor || visitor.is_deleted) {
        return res.status(404).json({ message: 'Visitor not found' });
      }
      
      // Update visitor fields
      if (ip_address) visitor.ip_address = ip_address;
      if (sanitizedLocation) visitor.location = sanitizedLocation;
      if (device_info) visitor.device_info = device_info;
      if (browser) visitor.browser = browser;
      if (os) visitor.os = os;
      if (referrer) visitor.referrer = referrer;
      if (visit_count) visitor.visit_count = visit_count;
      
      const updatedVisitor = await visitor.save();
      
      // Transform the saved visitor to include both formats of coordinates
      const transformedVisitor = updatedVisitor.toObject();
      
      if (!transformedVisitor.location) {
        transformedVisitor.location = {};
      }
      
      // Ensure we have both lat/lng and coordinates array
      if (transformedVisitor.location.latitude && transformedVisitor.location.longitude && 
          (!transformedVisitor.location.coordinates || transformedVisitor.location.coordinates.length !== 2)) {
        transformedVisitor.location.coordinates = [
          parseFloat(transformedVisitor.location.longitude),
          parseFloat(transformedVisitor.location.latitude)
        ];
      } else if (transformedVisitor.location.coordinates && transformedVisitor.location.coordinates.length === 2 &&
                (!transformedVisitor.location.latitude || !transformedVisitor.location.longitude)) {
        transformedVisitor.location.longitude = parseFloat(transformedVisitor.location.coordinates[0]);
        transformedVisitor.location.latitude = parseFloat(transformedVisitor.location.coordinates[1]);
      }
      
      res.json(transformedVisitor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete visitor (soft delete)
  async deleteVisitor(req, res) {
    try {
      const visitor = await Visitor.findById(req.params.id);
      
      if (!visitor || visitor.is_deleted) {
        return res.status(404).json({ message: 'Visitor not found' });
      }

      visitor.is_deleted = true;
      await visitor.save();
      res.json({ message: 'Visitor deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get visitor statistics
  async getVisitorStats(req, res) {
    try {
      // Calculate retention rate
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Get total users who registered in the last 30 days
      const newUsers = await User.countDocuments({
        created_at: { $gte: thirtyDaysAgo },
        is_deleted: false
      });
      
      // Get users who have been active in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const retainedUsers = await UserStatistics.distinct('user_id', {
        last_active: { $gte: sevenDaysAgo },
        is_deleted: false
      });
      
      // Calculate retention rate
      const retentionRate = newUsers > 0 
        ? ((retainedUsers.length / newUsers) * 100).toFixed(1)
        : 0;
      
      // Get total visitors in the last 30 days
      const totalVisitors = await UserStatistics.aggregate([
        { $match: { 
          created_at: { $gte: thirtyDaysAgo },
          is_deleted: false 
        }},
        { $group: { 
          _id: '$user_id',
          visitCount: { $sum: 1 }
        }},
        { $count: 'total' }
      ]);
      
      res.json({
        retentionRate,
        totalVisitors: totalVisitors[0]?.total || 0,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error getting visitor stats:', error);
      res.status(500).json({ message: error.message });
    }
  },
  
  // Get visitor geography data
  async getVisitorGeography(req, res) {
    try {
      const visitors = await Visitor.find({ is_deleted: false });
      
      // Aggregate visitors by country for choropleth map
      const countryData = visitors.reduce((acc, visitor) => {
        if (visitor.location && visitor.location.country_code) {
          const countryCode = visitor.location.country_code;
          if (!acc[countryCode]) {
            acc[countryCode] = {
              id: countryCode,
              value: 0
            };
          }
          acc[countryCode].value += visitor.visit_count || 1;
        }
        return acc;
      }, {});
      
      // Convert to array format expected by the frontend
      const formattedData = Object.values(countryData);
      
      res.json(formattedData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = visitorController;
