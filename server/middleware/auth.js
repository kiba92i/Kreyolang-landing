const jwt = require('jsonwebtoken');
const CONFIG = require('../config');
const { findUserById } = require('../db');

function getTokenFromRequest(req) {
  return req.cookies?.[CONFIG.cookieName];
}

function signToken(user) {
  return jwt.sign({ userId: user.id }, CONFIG.jwtSecret, {
    expiresIn: '7d',
  });
}

function issueAuthCookie(res, user) {
  const token = signToken(user);
  res.cookie(CONFIG.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: CONFIG.isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(CONFIG.cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: CONFIG.isProduction,
  });
}

function attachUser(req, _res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, CONFIG.jwtSecret);
    const user = findUserById(decoded.userId);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Invalid auth token provided', error.message);
  }

  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    const wantsHtml = req.accepts(['html', 'json']) === 'html';
    if (wantsHtml) {
      return res.redirect('/login.html');
    }
    return res.status(401).json({ message: 'Authentication required.' });
  }
  return next();
}

function requireActiveSubscription(req, res, next) {
  if (!req.user) {
    const wantsHtml = req.accepts(['html', 'json']) === 'html';
    if (wantsHtml) {
      return res.redirect('/login.html');
    }
    return res.status(401).json({ message: 'Authentication required.' });
  }
  if (req.user.subscription_status !== 'active') {
    const wantsHtml = req.accepts(['html', 'json']) === 'html';
    if (wantsHtml) {
      return res.redirect('/subscribe.html');
    }
    return res.status(402).json({
      message: 'Active subscription required.',
      code: 'subscription_required',
    });
  }
  return next();
}

module.exports = {
  attachUser,
  requireAuth,
  requireActiveSubscription,
  issueAuthCookie,
  clearAuthCookie,
};
