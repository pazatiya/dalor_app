-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS web_carts (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | claimed
  phone TEXT,                               -- filled by bot when claimed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

-- Index for fast bot lookup
CREATE INDEX IF NOT EXISTS web_carts_session_idx ON web_carts(session_id);
CREATE INDEX IF NOT EXISTS web_carts_status_idx  ON web_carts(status);

-- Allow anon inserts (web app writes the cart)
ALTER TABLE web_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can insert carts"
  ON web_carts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon can read own cart"
  ON web_carts FOR SELECT
  TO anon
  USING (true);

-- Service role (bot) can update
CREATE POLICY "service can update carts"
  ON web_carts FOR UPDATE
  TO service_role
  USING (true);
