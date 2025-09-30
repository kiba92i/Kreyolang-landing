--- Schémas & types

> 📚 Consultez également la synthèse des [leçons 1 à 50](docs/lecons-1-50.md) pour les points de grammaire et de vocabulaire.
create schema if not exists app;

create type app.quiz_type as enum ('MCQ','LISTEN','MATCH','TYPE','SPEAK_PLACEHOLDER');
create type app.asset_type as enum ('AUDIO','IMAGE','VIDEO','TEXT');
create type app.difficulty as enum ('A1','A2','B1','B2'); -- à simplifier si besoin
create type app.variant as enum ('MQ', 'GP'); -- MQ = Martinique, GP = Guadeloupe

-- Utilisateurs
create table if not exists app.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,                         -- map à auth.users.id (Supabase)
  email text unique,
  display_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auteurs / linguistes (pour crédit & traçabilité)
create table if not exists app.authors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text,                                        -- ex: "Linguiste", "Locuteur natif"
  contact text,
  created_at timestamptz default now()
);

-- Langues/variantes (Martiniquais, Guadeloupéen)
create table if not exists app.languages (
  id uuid primary key default gen_random_uuid(),
  code app.variant not null,
  name text not null,                               -- "Kréyol Matinik", "Kréyol Gwadloup"
  is_active boolean default true
);

-- Leçons (unité pédagogique)
create table if not exists app.lessons (
  id uuid primary key default gen_random_uuid(),
  language_id uuid references app.languages(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  level app.difficulty default 'A1',
  order_index int default 0,
  is_published boolean default false,
  created_by uuid references app.authors(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Items (exercices/écrans dans une leçon)
create table if not exists app.lesson_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references app.lessons(id) on delete cascade,
  order_index int not null,
  prompt text not null,                             -- énoncé
  prompt_translation text,
  quiz app.quiz_type not null,
  choices jsonb,                                    -- pour MCQ (liste d’options)
  answer jsonb,                                     -- réponse attendue
  hints jsonb,                                      -- indices facultatifs
  created_at timestamptz default now()
);

-- Médias (audio natif, images, etc.)
create table if not exists app.media_assets (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references app.lesson_items(id) on delete cascade,
  asset_kind app.asset_type not null,
  storage_path text not null,                       -- Supabase Storage path
  duration_ms int,
  transcript text,                                  -- pour AUDIO (utile au TTS/ASR)
  speaker text,                                     -- ex: "Locuteur MQ", "Locuteur GP"
  created_at timestamptz default now()
);

-- Tentatives (logs d’exécution des exercices)
create table if not exists app.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app.users(id) on delete cascade,
  item_id uuid references app.lesson_items(id) on delete cascade,
  is_correct boolean,
  payload jsonb,                                    -- réponse donnée
  score numeric(5,2),                               -- 0..100
  created_at timestamptz default now()
);

-- Progression utilisateur (SRS simple)
create table if not exists app.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app.users(id) on delete cascade,
  lesson_id uuid references app.lessons(id) on delete cascade,
  last_item_id uuid references app.lesson_items(id),
  srs_bucket int default 1,                         -- 1..5 (spaced repetition simplifié)
  due_at timestamptz,                               -- prochaine révision
  updated_at timestamptz default now(),
  unique (user_id, lesson_id)
);

-- Abonnements / droits
create table if not exists app.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app.users(id) on delete cascade,
  provider text,                                    -- 'stripe', 'revenuecat'...
  status text,                                      -- 'trialing','active','canceled'...
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- Feature flags (pour activer des modules)
create table if not exists app.feature_flags (
  key text primary key,                             -- ex: 'asr_experimental'
  is_enabled boolean default false,
  payload jsonb
);

-- Index utiles
create index if not exists idx_items_lesson on app.lesson_items(lesson_id, order_index);
create index if not exists idx_media_item on app.media_assets(item_id);
create index if not exists idx_attempts_user on app.attempts(user_id, created_at desc);
create index if not exists idx_progress_user_due on app.progress(user_id, due_at);
