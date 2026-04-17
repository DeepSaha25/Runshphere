const UserService = require('../services/userService');

/**
 * Get user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const profile = await UserService.getUserProfile(userId);

    res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update user location
 */
const updateLocation = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { latitude, longitude } = req.body;

    // Validation
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude and longitude are required'
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude must be between -90 and 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        status: 'error',
        message: 'Longitude must be between -180 and 180'
      });
    }

    const user = await UserService.updateUserLocation(userId, latitude, longitude);

    res.status(200).json({
      status: 'success',
      message: 'Location updated successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user stats
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const stats = await UserService.getUserStats(userId);

    res.status(200).json({
      status: 'success',
      message: 'Stats retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateLocation,
  getStats
};
