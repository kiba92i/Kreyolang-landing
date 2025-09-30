const express = require('express');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const CONFIG = require('../config');
const {
  createUser,
  findUserByEmail,
  setStripeCustomerId,
} = require('../db');
const {
  issueAuthCookie,
  clearAuthCookie,
  requireAuth,
} = require('../middleware/auth');

const router = express.Router();

let stripe = null;
if (CONFIG.stripeSecretKey) {
  stripe = new Stripe(CONFIG.stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
}

function serializeUser(user) {
  if (!user) return null;
  const {
    password_hash: _passwordHash,
    ...safeUser
  } = user;
  return safeUser;
}

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let stripeCustomerId = null;
  if (stripe) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { application: 'Kreyolang' },
      });
      stripeCustomerId = customer.id;
    } catch (error) {
      return res.status(502).json({ message: 'Unable to create Stripe customer.', details: error.message });
    }
  }

  const user = createUser({
    email,
    name: name || null,
    passwordHash,
    stripeCustomerId,
  });

  issueAuthCookie(res, user);

  return res.status(201).json({ user: serializeUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  issueAuthCookie(res, user);

  return res.json({ user: serializeUser(user) });
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: serializeUser(req.user) });
});

router.post('/stripe/customer', requireAuth, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ message: 'Stripe integration is not configured.' });
  }

  if (req.user.stripe_customer_id) {
    return res.json({ user: serializeUser(req.user) });
  }

  try {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
      metadata: { application: 'Kreyolang' },
    });
    const updated = setStripeCustomerId(req.user.id, customer.id);
    return res.json({ user: serializeUser(updated) });
  } catch (error) {
    return res.status(502).json({ message: 'Unable to create Stripe customer.', details: error.message });
  }
});

module.exports = router;
