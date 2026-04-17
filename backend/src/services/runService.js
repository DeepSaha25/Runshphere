const Run = require('../models/Run');
const User = require('../models/User');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const { getLocationFromCoordinates } = require('../utils/geocoding');

class RunService {
  /**
   * Submit a new run and update user stats
   */
  static async submitRun(userId, { distance, duration, coordinates, date, elevationGain, caloriesBurned }) {
    // Validate run data
    const validationErrors = Run.validateRunData(distance, duration);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const normalizedCoordinates = this.normalizeCoordinates(coordinates);
    if (normalizedCoordinates.length === 0) {
      throw new Error('At least one valid coordinate is required');
    }

    const lastCoordinate = normalizedCoordinates[normalizedCoordinates.length - 1];
    const locationData = await getLocationFromCoordinates(lastCoordinate.latitude, lastCoordinate.longitude);
    const derivedElevationGain = Number.isFinite(elevationGain)
      ? Number(elevationGain)
      : this.calculateElevationGain(normalizedCoordinates);
    const derivedCalories = Number.isFinite(caloriesBurned)
      ? Number(caloriesBurned)
      : this.calculateCalories(distance, user.weightKg);
    const runDate = date ? new Date(date) : new Date();

    // Create run
    const run = new Run({
      userId,
      distance,
      duration,
      coordinates: normalizedCoordinates,
      date: runDate,
      elevationGain: derivedElevationGain,
      caloriesBurned: derivedCalories,
      location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        district: locationData.district,
        state: locationData.state,
        country: locationData.country,
        point: {
          type: 'Point',
          coordinates: [locationData.longitude, locationData.latitude]
        }
      }
    });

    await run.save();

    await User.findByIdAndUpdate(userId, {
      'location.latitude': locationData.latitude,
      'location.longitude': locationData.longitude,
      'location.city': locationData.city,
      'location.district': locationData.district,
      'location.state': locationData.state,
      'location.country': locationData.country,
      'location.point.type': 'Point',
      'location.point.coordinates': [locationData.longitude, locationData.latitude]
    });

    // Update user total distance and streak
    await this.updateUserStats(userId, runDate);

    return run;
  }

  /**
   * Update user total distance and streak
   */
  static async updateUserStats(userId, runDate = new Date()) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tz = user.timezone || 'Asia/Kolkata';
    const totalStats = await Run.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$userId',
          totalDistance: { $sum: '$distance' }
        }
      }
    ]);

    user.totalDistance = totalStats[0]?.totalDistance || 0;
    user.streak = await this.calculateCurrentStreak(userId, tz);
    user.lastRunDate = runDate;
    await user.save();

    return user;
  }

  /**
   * Get user run history
   */
  static async getUserRunHistory(userId, limit = 50, startDate = null, endDate = null) {
    const query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    const runs = await Run.find(query).sort({ date: -1 }).limit(limit);

    return runs;
  }

  /**
   * Get user stats with aggregation
   */
  static async getUserAggregatedStats(userId) {
    const totalRunsStats = await Run.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$userId',
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          totalRuns: { $sum: 1 },
          avgSpeed: { $avg: '$avgSpeed' },
          averagePace: { $avg: '$averagePace' },
          caloriesBurned: { $sum: '$caloriesBurned' },
          elevationGain: { $sum: '$elevationGain' }
        }
      }
    ]);

    if (totalRunsStats.length === 0) {
      return {
        totalDistance: 0,
        totalDuration: 0,
        totalRuns: 0,
        avgSpeed: 0,
        averagePace: 0,
        caloriesBurned: 0,
        elevationGain: 0
      };
    }

    return totalRunsStats[0];
  }

  /**
   * Get weekly stats
   */
  static async getWeeklyStats(userId) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyStats = await Run.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalRuns: { $sum: 1 },
          avgSpeed: { $avg: '$avgSpeed' },
          averagePace: { $avg: '$averagePace' }
        }
      }
    ]);

    if (weeklyStats.length === 0) {
      return {
        totalDistance: 0,
        totalRuns: 0,
        avgSpeed: 0,
        averagePace: 0
      };
    }

    return weeklyStats[0];
  }

  /**
   * Get daily stats
   */
  static async getDailyStats(userId, date = new Date()) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dailyStats = await Run.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: dayStart, $lte: dayEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalRuns: { $sum: 1 },
          avgSpeed: { $avg: '$avgSpeed' },
          averagePace: { $avg: '$averagePace' }
        }
      }
    ]);

    if (dailyStats.length === 0) {
      return {
        totalDistance: 0,
        totalRuns: 0,
        avgSpeed: 0,
        averagePace: 0
      };
    }

    return dailyStats[0];
  }

  static normalizeCoordinates(coordinates = []) {
    return coordinates
      .map((coordinate) => ({
        latitude: Number(coordinate.latitude),
        longitude: Number(coordinate.longitude),
        altitude: coordinate.altitude === undefined || coordinate.altitude === null
          ? null
          : Number(coordinate.altitude),
        timestamp: coordinate.timestamp ? new Date(coordinate.timestamp) : new Date()
      }))
      .filter((coordinate) => Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude));
  }

  static calculateCalories(distance, weightKg) {
    const effectiveWeight = Number.isFinite(weightKg) ? Number(weightKg) : 70;
    return Math.round(distance * effectiveWeight * 1.036 * 100) / 100;
  }

  static calculateElevationGain(coordinates = []) {
    let gain = 0;

    for (let index = 1; index < coordinates.length; index += 1) {
      const previous = coordinates[index - 1].altitude;
      const current = coordinates[index].altitude;

      if (Number.isFinite(previous) && Number.isFinite(current) && current > previous) {
        gain += current - previous;
      }
    }

    return Math.round(gain * 100) / 100;
  }

  static async calculateCurrentStreak(userId, timezone = 'Asia/Kolkata') {
    const qualifyingDays = await Run.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
              timezone
            }
          },
          totalDistance: { $sum: '$distance' }
        }
      },
      { $match: { totalDistance: { $gte: 2 } } },
      { $sort: { _id: -1 } }
    ]);

    if (qualifyingDays.length === 0) {
      return 0;
    }

    const dayKeys = new Set(qualifyingDays.map((entry) => entry._id));
    const today = moment.tz(timezone).startOf('day');
    const yesterday = today.clone().subtract(1, 'day');
    const startingPoint = dayKeys.has(today.format('YYYY-MM-DD'))
      ? today
      : dayKeys.has(yesterday.format('YYYY-MM-DD'))
        ? yesterday
        : null;

    if (!startingPoint) {
      return 0;
    }

    let streak = 0;
    const cursor = startingPoint.clone();

    while (dayKeys.has(cursor.format('YYYY-MM-DD'))) {
      streak += 1;
      cursor.subtract(1, 'day');
    }

    return streak;
  }
}

module.exports = RunService;
