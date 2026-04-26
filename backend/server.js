const config = require('./src/config/env');
const app = require('./app');

app.listen(config.PORT, () => {
  console.log(`[RunSphere] Backend running on port ${config.PORT}`);
  console.log(`[RunSphere] Timezone: ${config.TIMEZONE}`);
  console.log(`[RunSphere] Environment: ${config.NODE_ENV}`);
});
