const User = require('../models/User');
const { getLocationFromCoordinates } = require('../utils/geocoding');

class UserService {
  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user location from coordinates
   */
  static async updateUserLocation(userId, latitude, longitude) {
    try {
      // Get location details from Google Maps API
      const locationData = await getLocationFromCoordinates(latitude, longitude);

      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        {
          'location.latitude': latitude,
          'location.longitude': longitude,
          'location.city': locationData.city,
          'location.district': locationData.district,
          'location.state': locationData.state,
          'location.country': locationData.country,
          'location.point.type': 'Point',
          'location.point.coordinates': [longitude, latitude]
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get aggregated user stats
   */
  static async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      totalDistance: user.totalDistance,
      streak: user.streak,
      lastRunDate: user.lastRunDate,
      createdAt: user.createdAt
    };
  }
}

module.exports = UserService;
