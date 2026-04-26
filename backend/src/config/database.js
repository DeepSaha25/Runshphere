const mongoose = require('mongoose');
const config = require('./env');

mongoose
  .connect(config.DATABASE_URL)
  .then(() => {
    console.log('[RunSphere] MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('[RunSphere] MongoDB connection failed:', err.message);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => {
  console.warn('[RunSphere] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[RunSphere] MongoDB error:', err.message);
});

module.exports = mongoose.connection;
