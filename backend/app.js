const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./src/config/database');

// ==================== MIDDLEWARE & UTILITIES ====================
const logger = require('./src/middlewares/logger');
const errorHandler = require('./src/middlewares/errorHandler');
const apiRoutes = require('./src/routes');

const app = express();

// ==================== GLOBAL MIDDLEWARE ====================

// Request logging
app.use(logger);

// Allow cross-origin requests
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== ROUTES ====================

app.use('/api', apiRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
