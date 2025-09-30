const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const CONFIG = require('./config');
const authRoutes = require('./routes/auth');
const { apiRouter: moduleApiRouter, pageRouter: modulePageRouter } = require('./routes/modules');
const webhookRoutes = require('./routes/webhook');
const { attachUser } = require('./middleware/auth');

const app = express();

if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

app.use(cookieParser());
app.use('/webhooks/stripe', webhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachUser);

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleApiRouter);
app.use('/modules', modulePageRouter);

app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(CONFIG.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${CONFIG.port}`);
  });
}

module.exports = app;
