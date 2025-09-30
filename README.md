README – Parcours créole (Leçons 1–50)

Ce dépôt fournit une base pédagogique normalisée couvrant 50 leçons de créole (martiniquais), prête à brancher sur un générateur (p. ex. Codex) pour produire des fiches, exercices, quiz et dialogues.

🎯 Objectifs

Donner aux développeurs une structure de données unique pour toutes les leçons.

Offrir aux pédagogues des contenus validés (règles + exemples).

Permettre à un LLM (Codex) de générer automatiquement :

fiches de cours,

exercices auto-corrigés,

évaluations rapides,

dialogues et mini-scénarios.

📦 Structure du dépôt
.
├─ data/
│  ├─ modules.json          # Découpage en 6 modules (résumé & index)
│  ├─ lessons/              # 50 leçons normalisées
│  │  ├─ 01.json
│  │  ├─ 02.json
│  │  └─ ... 50.json
│  └─ glossary.json         # Adverbes, onomatopées, locutions
├─ prompts/
│  ├─ codex_generation.md   # Prompts prêts à l’emploi (fiches/exos/quiz)
│  └─ guardrails.md         # Règles et styles à imposer au modèle
├─ scripts/
│  ├─ validate.mjs          # Validation JSON (schema)
│  └─ build.mjs             # Build en paquets (fiches PDF/HTML)
├─ schema/
│  └─ lesson.schema.json    # Schéma des leçons
├─ README.md
└─ LICENSE

🧱 Modèle de données (leçon)

Chaque leçon suit le schéma lesson.schema.json. Exemple :

{
  "id": 33,
  "title": "Tournures impersonnelles & équivalents de « on »",
  "summary_fr": "Exprimer l’impersonnel, « il y a », et traduire l’indéfini « on » par ou/yo.",
  "tags": ["syntaxe", "impersonnel", "pronom"],
  "rules": [
    {
      "label": "Impersonnel thermique/météo",
      "explain_fr": "Action sans sujet réel ; « i » sert de support.",
      "patterns": ["i + [nom/adj] (heure, météo)", "ni / té ni = il y a / il y avait"],
      "examples": [
        {"cr": "koumansé ka fè cho", "fr": "il commence à faire chaud"},
        {"cr": "i midi", "fr": "il est midi"},
        {"cr": "ni pen", "fr": "il y a du pain"}
      ]
    },
    {
      "label": "« on » = ou (2sg) / yo (3pl)",
      "explain_fr": "Usage générique (ou) ou indéterminé collectif (yo).",
      "examples": [
        {"cr": "pli ou ka travay, se pli ou ké ni lajan", "fr": "plus on travaille, plus on a d’argent"},
        {"cr": "yo balyé lakou-a", "fr": "on a balayé la cour"}
      ]
    }
  ],
  "exercises": [
    {
      "type": "fill_in_blank",
      "instruction_fr": "Complète avec « i », « ni », « ou » ou « yo ».",
      "items": [
        {"cr": "___ nèvè.", "answer": "i"},
        {"cr": "___ pen an kay-la.", "answer": "ni"},
        {"cr": "___ di sa ?", "answer": "yo"}
      ]
    },
    {
      "type": "transform",
      "instruction_fr": "Transforme avec l’équivalent de « on » indiqué.",
      "items": [
        {"from": {"cr":"On a prêté la maison", "hint":"yo"}, "to": {"cr":"yo ja prété moun kay-la"}}
      ]
    }
  ],
  "checklist": [
    "Employer « i » pour l’impersonnel d’heure/météo.",
    "Utiliser « ni / té ni » pour « il y a / il y avait ».",
    "Préférer « ou » pour on générique, « yo » pour on indéterminé."
  ],
  "references": ["Module 4"]
}


🔎 Tous les fichiers data/lessons/*.json respectent ce format.

🗂️ Découpage en modules

Bases (1–10) — pronoms, articles, négation, interrogation, copule sé, possessifs.

Temps/Aspect/Mode (11–20) — ka, té, ké, sé ké, té ké, impératif, progressif, accompli.

Syntaxe de base (21–30) — SVO, compléments, exhortation (annou), adjectifs, comparatifs, quantités.

Phrases complexes (31–40) — complétives avec sé, impersonnelles, « on » (ou/yo), en/y, verbes « devenir », réduplication.

Subordonnées (41–47) — temporelles, cause, concession, but, conséquence, relatives, condition.

Mise en relief & lexique (48–50) — dislocation, sé… ki, adverbes, onomatopées.

Le fichier data/modules.json contient les métadonnées et l’index des leçons par module.

🧪 Types d’exercices standard

fill_in_blank : texte à trous.

transform : transformation dirigée (affirmative → négative, français → créole, etc.).

multiple_choice : QCM (une ou plusieurs réponses).

arrange : remettre en ordre (phrases / mots).

explain_rule : question courte où l’élève explique la règle (évaluation formative).

dialogue_complete : compléter un mini-dialogue contextualisé.

Chaque exercice inclut instruction_fr, items[], et selon le type options[], answer, rationale_fr (explication).

🧭 Conventions (orthographe & style)

Variantes usuelles acceptées : i/li/y (3e sg.), oben/ouben/o (ou), etc.

Adjectif postposé : liv wouj-la.

Article défini : suffixe -la / -a (harmonie vocalique).

Relatifs : sujet = ki, complément = Ø + reprise la/a.

Impersonnel : i (heure/météo), ni / té ni = il y a / avait.

« on » : ou (générique), yo (indéterminé collectif).

Négation : pa, pòkò, janmen, pyès.

Aspect/Temps : ka (imperfectif), té (passé), ké (futur), sé ké / té ké (conditionnel).

🤖 Prompts prêt-à-l’emploi (Codex)

prompts/codex_generation.md contient des prompts. Exemples abrégés :

Fiche de cours

Tu es un générateur pédagogique. À partir de data/lessons/33.json :
1) Résume la règle en 5 points clairs.
2) Liste 6 exemples (CR→FR).
3) Donne 3 erreurs fréquentes + corrections.
4) Produit 5 mini-exercices variés (avec solutions).
Respecte la graphie et les conventions.


Quiz instantané (10 items)

Génère un QCM (10 items) couvrant les règles de Module 4. 
Format JSON: [{question, options[], answerIndex, rationale_fr}].
Difficulté progressive. Un piège par tranche de 3 items max.


Dialogue contextualisé

Crée un dialogue (10 répliques) illustrant: impersonnelles + « on ».
Inclure au moins: i midi, ni, ou/yo. Ajoute un glossaire final (5 entrées).

🛠️ Workflow

Valider les données

node scripts/validate.mjs


Builder les fiches (HTML/PDF)

node scripts/build.mjs


Brancher à votre app : charger modules.json puis les leçons ciblées.

✅ Qualité & garde-fous

Style constant : pas de mélange créole/FR dans la même ligne, sauf traduction.

Exemples min. : 6 par règle, variés (personnes/temps).

Explications : courtes, en français simple, avec contre-exemple si utile.

Solutions : toujours incluses (même pour QCM).

Accessibilité : éviter jargon ; ajouter gloses quand un mot est rare.

Voir prompts/guardrails.md.

📚 Glossaire & ressources

data/glossary.json : adverbes fréquents, onomatopées, locutions (déf + exemples).

Chaque entrée : { "term": "vitman", "pos": "adv", "fr": "rapidement", "ex": {"cr":"i vini vitman", "fr":"il est venu vite"} }.

🧩 Exemples d’utilisation (API interne)
Charger le module et ses leçons
import modules from './data/modules.json';
import lesson33 from './data/lessons/33.json';

const m4 = modules.find(m => m.id === 4);
const lessons = m4.lesson_ids.map(id => require(`./data/lessons/${String(id).padStart(2,'0')}.json`));

Générer un quiz à partir d’une règle
function fromRuleToMCQ(rule) {
  return {
    question: `Choisis la bonne tournure (impersonnel) :`,
    options: [
      "i midi", "midi i", "sé midi i", "ni midi"
    ],
    answerIndex: 0,
    rationale_fr: "L’heure s’exprime par « i + [heure] »."
  };
}

🔧 Contribution

Crée une branche feat/<nom>.

Ajoute/édite des leçons dans data/lessons/.

Lance validate.mjs.

PR avec description : règles ajoutées, exemples, tests.

Style PR : capture d’écran des fiches générées + sortie validate.

📜 Licence

MIT — voir LICENSE.

🧭 Contact / Support

Ouvre une Issue pour :

demandes de nouvelles features (types d’exercices),

correction de données linguistiques,

bugs de build/validation.

TL;DR

Tout est normalisé en JSON pour être digéré par un LLM.

6 modules couvrent les 50 leçons.

Scripts fournis pour valider et builder.

Prompts prêts à l’emploi pour fiches, quiz, dialogues.

💳 Abonnements & intégration Stripe

Un serveur Express minimal est fourni dans `server/` pour créer des sessions Checkout et stocker les identifiants clients Stripe. Pour l’utiliser :

1. Copiez `server/.env.example` vers `server/.env` et renseignez vos clés (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `CLIENT_BASE_URL`).
2. Installez les dépendances backend :
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. Servez le frontend (par exemple avec `npx serve .`) sur l’URL définie dans `CLIENT_BASE_URL`.

Le bouton « S’abonner » dans `index.html` ouvre `subscribe.html`, qui appelle `/api/create-checkout-session`. Après paiement, Stripe redirige vers `success.html` qui interroge `/api/checkout-session/:id` pour confirmer le paiement et conserver l’identifiant client.
