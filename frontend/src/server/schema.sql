CREATE TABLE IF NOT EXISTS lscm_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_fingerprint TEXT,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  rockstar_tag TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  support_read_receipts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lscm_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES lscm_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lscm_cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES lscm_users(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  image_path TEXT NOT NULL DEFAULT '/grayscalemini.png',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, product_code)
);

CREATE TABLE IF NOT EXISTS lscm_requested_items (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES lscm_users(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  image_path TEXT NOT NULL DEFAULT '/grayscalemini.png',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'awaiting_approval'
    CHECK (status IN ('requested', 'awaiting_approval', 'approved', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lscm_support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES lscm_users(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES lscm_requested_items(id) ON DELETE SET NULL,
  query_type TEXT NOT NULL CHECK (query_type IN ('order', 'general')),
  query_topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  typing_user_id TEXT REFERENCES lscm_users(id) ON DELETE SET NULL,
  typing_at TIMESTAMPTZ,
  closed_by TEXT REFERENCES lscm_users(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lscm_support_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES lscm_support_tickets(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES lscm_users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'admin', 'system')),
  body TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reply_to_id TEXT REFERENCES lscm_support_messages(id) ON DELETE SET NULL,
  pinned_at TIMESTAMPTZ,
  pinned_by TEXT REFERENCES lscm_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lscm_discord_settings (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  status_type TEXT NOT NULL DEFAULT 'online'
    CHECK (status_type IN ('online', 'idle', 'dnd', 'invisible')),
  status_description TEXT NOT NULL DEFAULT 'Los Santos Car Modders Community',
  activity_type TEXT NOT NULL DEFAULT 'playing'
    CHECK (activity_type IN ('playing', 'listening', 'watching', 'competing')),
  activity_title TEXT NOT NULL DEFAULT 'LSCM Network',
  buttons JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lscm_discord_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS lscm_sessions_user_id_idx ON lscm_sessions (user_id);
CREATE INDEX IF NOT EXISTS lscm_sessions_expires_at_idx ON lscm_sessions (expires_at);
CREATE INDEX IF NOT EXISTS lscm_cart_items_user_id_idx ON lscm_cart_items (user_id);
CREATE INDEX IF NOT EXISTS lscm_requested_items_user_id_idx ON lscm_requested_items (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lscm_requested_items_status_idx ON lscm_requested_items (status, created_at DESC);
CREATE INDEX IF NOT EXISTS lscm_support_tickets_user_id_idx ON lscm_support_tickets (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS lscm_support_tickets_status_idx ON lscm_support_tickets (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS lscm_support_messages_ticket_id_idx ON lscm_support_messages (ticket_id, created_at ASC);