require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[RunSphere] Backend running on port ${PORT}`);
  console.log(`[RunSphere] Timezone: ${process.env.TIMEZONE || 'Asia/Kolkata'}`);
  console.log(`[RunSphere] Environment: ${process.env.NODE_ENV || 'development'}`);
});
