const path = require('path');
const fs = require('fs');
const express = require('express');
const { requireActiveSubscription } = require('../middleware/auth');

const modulesDirectory = path.join(__dirname, '..', 'protected', 'modules');

if (!fs.existsSync(modulesDirectory)) {
  fs.mkdirSync(modulesDirectory, { recursive: true });
}

const apiRouter = express.Router();
const pageRouter = express.Router();

apiRouter.get('/', requireActiveSubscription, (_req, res) => {
  const files = fs.readdirSync(modulesDirectory)
    .filter((file) => file.endsWith('.html'))
    .map((file) => ({
      slug: path.basename(file, '.html'),
      title: path.basename(file, '.html').replace(/[-_]/g, ' '),
      href: `/modules/${path.basename(file, '.html')}`,
    }));

  res.json({ modules: files });
});

pageRouter.get('/', requireActiveSubscription, (_req, res) => {
  const files = fs.readdirSync(modulesDirectory)
    .filter((file) => file.endsWith('.html'))
    .map((file) => path.basename(file, '.html'));

  if (files.length === 0) {
    return res.status(204).end();
  }

  return res.redirect(`/modules/${files[0]}`);
});

pageRouter.get('/:slug', requireActiveSubscription, (req, res, next) => {
  const filePath = path.join(modulesDirectory, `${req.params.slug}.html`);
  if (!fs.existsSync(filePath)) {
    return next();
  }
  return res.sendFile(filePath);
});

module.exports = {
  apiRouter,
  pageRouter,
};
