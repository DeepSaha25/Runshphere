const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(ApiError.tooManyRequests(message));
    }
  });

module.exports = {
  authLimiter: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again later.'
  }),
  writeLimiter: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 120,
    message: 'Too many write requests. Please slow down.'
  }),
  locationLimiter: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: 'Too many location sync requests. Please try again later.'
  }),
  leaderboardLimiter: createLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: 'Too many leaderboard requests. Please try again shortly.'
  }),
  communityLimiter: createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many community actions. Please slow down.'
  })
};
