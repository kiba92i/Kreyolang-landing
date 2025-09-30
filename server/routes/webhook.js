const express = require('express');
const Stripe = require('stripe');
const CONFIG = require('../config');
const { setSubscriptionStatus, db } = require('../db');

const router = express.Router();

let stripe = null;
if (CONFIG.stripeSecretKey) {
  stripe = new Stripe(CONFIG.stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
}

router.post('/', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !CONFIG.stripeWebhookSecret) {
    return res.status(503).json({ message: 'Stripe integration is not configured.' });
  }

  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, CONFIG.stripeWebhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const data = event.data.object;

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const customerId = data.customer;
    const status = data.status === 'active' || data.status === 'trialing' ? 'active' : 'inactive';
    const expiresAt = data.current_period_end ? new Date(data.current_period_end * 1000).toISOString() : null;
    if (customerId) {
      const user = findUserByStripeCustomerId(customerId);
      if (user) {
        setSubscriptionStatus(user.id, status, expiresAt);
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = data.customer;
    if (customerId) {
      const user = findUserByStripeCustomerId(customerId);
      if (user) {
        setSubscriptionStatus(user.id, 'inactive', null);
      }
    }
  }

  res.json({ received: true });
});

function findUserByStripeCustomerId(stripeCustomerId) {
  const stmt = db.prepare('SELECT * FROM users WHERE stripe_customer_id = ?');
  return stmt.get(stripeCustomerId);
}

module.exports = router;
