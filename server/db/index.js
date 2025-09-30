const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(process.cwd(), 'data', 'app.sqlite');

const db = new Database(dbPath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password_hash TEXT NOT NULL,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const updateTimestampTrigger = `
  CREATE TRIGGER IF NOT EXISTS users_updated_at
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;

db.exec(updateTimestampTrigger);

const statements = {
  createUser: db.prepare(`
    INSERT INTO users (email, name, password_hash, stripe_customer_id, subscription_status)
    VALUES (@email, @name, @password_hash, @stripe_customer_id, @subscription_status)
  `),
  findUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  updateStripeCustomerId: db.prepare('UPDATE users SET stripe_customer_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  updateSubscriptionStatus: db.prepare('UPDATE users SET subscription_status = ?, subscription_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
};

function createUser({ email, name, passwordHash, stripeCustomerId, subscriptionStatus = 'inactive' }) {
  const info = statements.createUser.run({
    email,
    name,
    password_hash: passwordHash,
    stripe_customer_id: stripeCustomerId || null,
    subscription_status: subscriptionStatus,
  });
  return statements.findUserById.get(info.lastInsertRowid);
}

function findUserByEmail(email) {
  return statements.findUserByEmail.get(email);
}

function findUserById(id) {
  return statements.findUserById.get(id);
}

function setStripeCustomerId(userId, customerId) {
  statements.updateStripeCustomerId.run(customerId, userId);
  return findUserById(userId);
}

function setSubscriptionStatus(userId, status, expiresAt = null) {
  statements.updateSubscriptionStatus.run(status, expiresAt, userId);
  return findUserById(userId);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  setStripeCustomerId,
  setSubscriptionStatus,
  db,
};
