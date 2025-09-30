# Configuration Stripe

Cette application repose sur Stripe Checkout pour gérer les abonnements. Voici comment configurer votre environnement de test ou de production.

## 1. Créer les produits et tarifs

1. Connectez-vous au [dashboard Stripe](https://dashboard.stripe.com/).
2. Créez un **Produit** (ex. `Abonnement Kreyolang`).
3. Ajoutez un **tarif récurrent** (mensuel ou annuel) et notez l’identifiant du prix (`price_xxx`).
4. Reportez cet identifiant dans `STRIPE_PRICE_ID` (fichier `.env`).

## 2. Clés API et variables d’environnement

Copiez `server/.env.example` vers `server/.env` puis remplissez :

- `STRIPE_SECRET_KEY` : clé secrète commençant par `sk_test_` ou `sk_live_`.
- `STRIPE_PRICE_ID` : identifiant du tarif créé plus haut.
- `CLIENT_BASE_URL` : URL publique depuis laquelle le frontend est servi (ex. `http://localhost:4173`).
- `PORT` : port d’écoute du backend Express (par défaut `4242`).

Lancez ensuite :

```bash
cd server
npm install
npm run dev
```

Le serveur expose deux routes :

- `POST /api/create-checkout-session` : crée une session Checkout pour l’adresse e-mail fournie et renvoie l’URL Stripe.
- `GET /api/checkout-session/:sessionId` : récupère la session pour consigner l’identifiant client (`customer.id`).

Les identifiants clients sont conservés dans `server/data/customers.json`.

## 3. Redirections & pages frontend

- `subscribe.html` : formulaire e-mail qui appelle l’API et redirige vers Stripe.
- `success.html` : page de remerciement appelée par Stripe via `success_url`. Elle interroge l’API pour confirmer la session et afficher l’identifiant client.
- `subscribe.html?canceled=1` est utilisé comme `cancel_url` afin de permettre à l’utilisateur de recommencer.

## 4. Webhooks recommandés

Pour automatiser la mise à jour du statut d’abonnement, créez un webhook Stripe ciblant une future route (ex. `/api/stripe/webhook`). Abonnez-vous au minimum aux événements :

- `checkout.session.completed`
- `customer.subscription.updated`
- `invoice.payment_failed`

La clé de signature (`STRIPE_WEBHOOK_SECRET`) devra être ajoutée à votre `.env` lorsque vous implémenterez le point d’entrée webhook.

## 5. Tests

Utilisez la carte de test Stripe `4242 4242 4242 4242` avec une date future et un CVC à 3 chiffres. Les adresses e-mail peuvent être quelconques tant qu’elles respectent le format `utilisateur@example.com`.

## 6. Déploiement

- Protégez votre fichier `.env` et vos clés secrètes.
- Servez `index.html`, `subscribe.html` et `success.html` via un CDN ou un hébergement statique.
- Déployez `server/` (Express) sur une plateforme Node.js (Railway, Render, Fly.io, etc.) et configurez les variables d’environnement identiques.

Pour toute question, consultez la [documentation officielle Stripe](https://stripe.com/docs/payments/checkout) ou ouvrez une issue dans ce dépôt.
