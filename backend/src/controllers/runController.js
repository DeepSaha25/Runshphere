const RunService = require('../services/runService');

/**
 * Submit a new run
 */
const submitRun = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { distance, duration, coordinates, date, elevationGain, caloriesBurned } = req.body;

    // Validation
    if (distance === undefined || duration === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Distance (km) and duration (seconds) are required'
      });
    }

    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Coordinates array is required and must not be empty'
      });
    }

    // Parse numbers
    const parsedDistance = parseFloat(distance);
    const parsedDuration = parseInt(duration, 10);

    if (isNaN(parsedDistance) || isNaN(parsedDuration)) {
      return res.status(400).json({
        status: 'error',
        message: 'Distance and duration must be valid numbers'
      });
    }

    const run = await RunService.submitRun(userId, {
      distance: parsedDistance,
      duration: parsedDuration,
      coordinates,
      date,
      elevationGain,
      caloriesBurned
    });

    res.status(201).json({
      status: 'success',
      message: 'Run submitted successfully',
      data: run
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user run history
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { limit = 50, startDate, endDate } = req.query;

    const runs = await RunService.getUserRunHistory(userId, parseInt(limit, 10), startDate, endDate);

    res.status(200).json({
      status: 'success',
      message: 'Run history retrieved successfully',
      count: runs.length,
      data: runs
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user aggregated stats
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const stats = await RunService.getUserAggregatedStats(userId);

    res.status(200).json({
      status: 'success',
      message: 'Stats retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get weekly stats
 */
const getWeeklyStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const stats = await RunService.getWeeklyStats(userId);

    res.status(200).json({
      status: 'success',
      message: 'Weekly stats retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get daily stats
 */
const getDailyStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { date } = req.query;
    const stats = await RunService.getDailyStats(userId, date ? new Date(date) : new Date());

    res.status(200).json({
      status: 'success',
      message: 'Daily stats retrieved successfully',
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitRun,
  getHistory,
  getStats,
  getWeeklyStats,
  getDailyStats
};
