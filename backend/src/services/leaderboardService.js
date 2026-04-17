const Run = require('../models/Run');
const moment = require('moment-timezone');

class LeaderboardService {
  /**
   * Generate leaderboard at a specific geographic level
   */
  static async generateLeaderboard(level, userLocation = {}, timePeriod = 'today', limit = 100, timezone = 'Asia/Kolkata') {
    // Determine date range based on time period
    const dateRange = this.getDateRange(timePeriod, timezone);

    // Build query based on geographic level
    const matchStage = this.buildMatchStage(level, userLocation, dateRange);

    // Aggregate runs by user
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalDistance: { $sum: '$distance' },
          totalRuns: { $sum: 1 },
          avgSpeed: { $avg: '$avgSpeed' },
          averagePace: { $avg: '$averagePace' },
          lastRunAt: { $max: '$date' }
        }
      },
      { $sort: { totalDistance: -1, lastRunAt: 1, _id: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $limit: limit }
    ];

    const runAggregates = await Run.aggregate(pipeline);

    return runAggregates.map((aggregate, index) => ({
      rank: index + 1,
      userId: aggregate.user._id,
      name: aggregate.user.name,
      avatar: aggregate.user.avatar || null,
      totalDistance: Math.round((aggregate.totalDistance || 0) * 100) / 100,
      totalRuns: aggregate.totalRuns,
      avgSpeed: Math.round((aggregate.avgSpeed || 0) * 100) / 100,
      averagePace: Math.round((aggregate.averagePace || 0) * 100) / 100,
      streak: aggregate.user.streak,
      lastRunAt: aggregate.lastRunAt,
      location: {
        city: aggregate.user.location?.city || null,
        district: aggregate.user.location?.district || null,
        state: aggregate.user.location?.state || null,
        country: aggregate.user.location?.country || null
      }
    }));
  }

  /**
   * Get local leaderboard (city level)
   */
  static async getLocalLeaderboard(userLocation, timePeriod = 'today', limit = 100, timezone = 'Asia/Kolkata') {
    return this.generateLeaderboard('local', userLocation, timePeriod, limit, timezone);
  }

  /**
   * Get city leaderboard
   */
  static async getCityLeaderboard(userLocation, timePeriod = 'today', limit = 100, timezone = 'Asia/Kolkata') {
    return this.generateLeaderboard('city', userLocation, timePeriod, limit, timezone);
  }

  /**
   * Get district leaderboard
   */
  static async getDistrictLeaderboard(userLocation, timePeriod = 'today', limit = 100, timezone = 'Asia/Kolkata') {
    return this.generateLeaderboard('district', userLocation, timePeriod, limit, timezone);
  }

  /**
   * Get state leaderboard
   */
  static async getStateLeaderboard(userLocation, timePeriod = 'today', limit = 100, timezone = 'Asia/Kolkata') {
    return this.generateLeaderboard('state', userLocation, timePeriod, limit, timezone);
  }

  /**
   * Get country leaderboard
   */
  static async getCountryLeaderboard(timePeriod = 'today', limit = 100, timezone = 'Asia/Kolkata') {
    return this.generateLeaderboard('country', {}, timePeriod, limit, timezone);
  }

  /**
   * Get user rank at a specific level
   */
  static async getUserRank(userId, level, userLocation, timePeriod = 'today', timezone = 'Asia/Kolkata') {
    const leaderboard = await this.generateLeaderboard(level, userLocation, timePeriod, 10000, timezone);
    const userRank = leaderboard.find((entry) => entry.userId.toString() === userId.toString());
    return userRank || null;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get date range based on time period
   */
  static getDateRange(timePeriod, timezone = 'Asia/Kolkata') {
    const now = moment.tz(timezone);

    if (timePeriod === 'weekly' || timePeriod === 'week') {
      return {
        start: now.clone().startOf('isoWeek').toDate(),
        end: now.clone().endOf('day').toDate()
      };
    }

    if (timePeriod === 'monthly' || timePeriod === 'month') {
      return {
        start: now.clone().startOf('month').toDate(),
        end: now.clone().endOf('day').toDate()
      };
    }

    return {
      start: now.clone().startOf('day').toDate(),
      end: now.clone().endOf('day').toDate()
    };
  }

  /**
   * Build location-aware Mongo match stage
   */
  static buildMatchStage(level, userLocation, dateRange) {
    const matchStage = {
      date: {
        $gte: dateRange.start,
        $lte: dateRange.end
      }
    };

    if (level === 'local' && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude)) {
      const radiusKm = Number(process.env.LOCAL_LEADERBOARD_RADIUS_KM || 8);
      matchStage['location.point'] = {
        $geoWithin: {
          $centerSphere: [[userLocation.longitude, userLocation.latitude], radiusKm / 6371]
        }
      };
    }

    if (level === 'city' && userLocation.city) {
      matchStage['location.city'] = userLocation.city;
    }

    if (level === 'district' && userLocation.district) {
      matchStage['location.district'] = userLocation.district;
    }

    if (level === 'state' && userLocation.state) {
      matchStage['location.state'] = userLocation.state;
    }

    if (level === 'country' && userLocation.country) {
      matchStage['location.country'] = userLocation.country;
    }

    return matchStage;
  }

  /**
   * Get Redis cache key (for future integration)
   */
  static getCacheKey(level, userLocation, timePeriod) {
    const locationKey = this.getLocationKey(level, userLocation);
    return `leaderboard:${level}:${locationKey}:${timePeriod}`;
  }

  /**
   * Get location key for caching
   */
  static getLocationKey(level, userLocation) {
    if (level === 'local') {
      return `${userLocation.latitude || 'na'}:${userLocation.longitude || 'na'}`;
    } else if (level === 'city') {
      return userLocation.city || 'unknown';
    } else if (level === 'district') {
      return userLocation.district || 'unknown';
    } else if (level === 'state') {
      return userLocation.state || 'unknown';
    } else if (level === 'country') {
      return userLocation.country || 'other';
    }
    return 'unknown';
  }

  /**
   * Calculate streak for a user with IST timezone
   */
  static calculateUserStreak(lastRunDate, timezone = 'Asia/Kolkata') {
    if (!lastRunDate) {
      return 0;
    }

    const tz = timezone || 'Asia/Kolkata';
    const today = moment.tz(tz).startOf('day');
    const lastRun = moment.tz(lastRunDate, tz);

    const daysDiff = today.diff(lastRun, 'days');

    if (daysDiff === 0) {
      // Ran today
      return 1;
    } else if (daysDiff === 1) {
      // Ran yesterday
      return 1; // Actual streak value should come from User model
    } else {
      // Streak broken
      return 0;
    }
  }
}

module.exports = LeaderboardService;
