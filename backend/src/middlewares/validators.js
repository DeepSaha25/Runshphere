/**
 * Request validation middleware
 */

const validateSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateRunSubmission = (req, res, next) => {
  const { distance, duration, coordinates } = req.body;
  const errors = [];

  if (distance === undefined || distance === null || distance === '') {
    errors.push('Distance is required');
  } else if (isNaN(distance) || Number(distance) < 0.2) {
    errors.push('Distance must be at least 0.2 km');
  }

  if (duration === undefined || duration === null || duration === '') {
    errors.push('Duration is required');
  } else if (isNaN(duration) || duration <= 0) {
    errors.push('Duration must be a positive number');
  }

  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    errors.push('Coordinates array is required and must not be empty');
  } else if (!coordinates.every((coordinate) => coordinate && coordinate.latitude !== undefined && coordinate.longitude !== undefined)) {
    errors.push('Each coordinate must include latitude and longitude');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLocationUpdate = (req, res, next) => {
  const { latitude, longitude } = req.body;
  const errors = [];

  if (latitude === undefined || latitude === null) {
    errors.push('Latitude is required');
  } else if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (longitude === undefined || longitude === null) {
    errors.push('Longitude is required');
  } else if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// ==================== HELPER FUNCTIONS ====================

const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateSignup,
  validateLogin,
  validateRunSubmission,
  validateLocationUpdate
};
