const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

tableMissing(['JWT_SECRET']);

function tableMissing(required) {
  required.forEach((key) => {
    if (!process.env[key]) {
      // eslint-disable-next-line no-console
      console.warn(`Warning: environment variable ${key} is not set.`);
    }
  });
}

const CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  cookieName: process.env.AUTH_COOKIE_NAME || 'kreyolang_session',
  isProduction: process.env.NODE_ENV === 'production',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  port: process.env.PORT || 3000,
};

module.exports = CONFIG;
