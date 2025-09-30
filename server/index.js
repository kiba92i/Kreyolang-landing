import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';

const requiredEnv = ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'CLIENT_BASE_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing expected environment variable: ${key}`);
  }
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY must be set before starting the server.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataFilePath = join(__dirname, 'data', 'customers.json');

async function readCustomers() {
  try {
    const raw = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirname(dataFilePath), { recursive: true });
      await fs.writeFile(dataFilePath, '[]', 'utf8');
      return [];
    }
    console.error('Unable to read customers file:', error);
    throw error;
  }
}

async function writeCustomers(customers) {
  await fs.writeFile(dataFilePath, JSON.stringify(customers, null, 2), 'utf8');
}

app.post('/api/create-checkout-session', async (req, res) => {
  const { email } = req.body ?? {};

  if (!email) {
    return res.status(400).json({ error: 'Adresse e-mail requise pour créer une session de paiement.' });
  }

  try {
    const customers = await readCustomers();
    let customerRecord = customers.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

    if (!customerRecord) {
      const customer = await stripe.customers.create({ email });
      customerRecord = { email, customerId: customer.id };
      customers.push(customerRecord);
      await writeCustomers(customers);
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({ error: 'STRIPE_PRICE_ID est manquant côté serveur.' });
    }

    const successUrlBase = process.env.CLIENT_BASE_URL ?? 'http://localhost:4173';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerRecord.customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrlBase}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${successUrlBase}/subscribe.html?canceled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    const message = error?.message ?? 'Erreur inconnue lors de la création de la session Stripe.';
    return res.status(500).json({ error: message });
  }
});

app.get('/api/checkout-session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: 'Identifiant de session manquant.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer'],
    });

    if (!session.customer || typeof session.customer === 'string') {
      return res.status(200).json({
        status: session.status,
        customerId: session.customer ?? null,
      });
    }

    const customer = session.customer;
    const email = customer.email ?? null;

    const customers = await readCustomers();
    const existing = customers.find((entry) => entry.customerId === customer.id);
    if (!existing) {
      customers.push({ email, customerId: customer.id });
      await writeCustomers(customers);
    }

    return res.status(200).json({
      status: session.status,
      customerId: customer.id,
      email,
    });
  } catch (error) {
    console.error('Unable to retrieve checkout session:', error);
    const message = error?.message ?? 'Erreur inconnue lors de la récupération de la session.';
    return res.status(500).json({ error: message });
  }
});

const port = process.env.PORT ?? 4242;
app.listen(port, () => {
  console.log(`Kreyolang Stripe server running on http://localhost:${port}`);
});
