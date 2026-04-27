-- =============================================
-- DALOR — Full Supabase Migration (run once)
-- פתח ב-Supabase → SQL Editor → הרץ הכל
-- =============================================

-- ── טבלת הסלים מהאתר ──────────────────────
CREATE TABLE IF NOT EXISTS web_carts (
  id           BIGSERIAL PRIMARY KEY,
  session_id   TEXT NOT NULL UNIQUE,
  items        JSONB NOT NULL DEFAULT '[]',
  total        NUMERIC NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | claimed
  phone        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  claimed_at   TIMESTAMPTZ,
  -- פרטי לקוח ומשלוח (Patch D)
  customer_name  TEXT,
  delivery_type  TEXT DEFAULT 'pickup',   -- pickup | delivery
  address_street TEXT,
  address_city   TEXT,
  address_zip    TEXT,
  payment_type   TEXT DEFAULT 'whatsapp', -- whatsapp | credit | cash
  order_notes    TEXT,
  payment_link   TEXT
);

-- Indexes לחיפוש מהיר
CREATE INDEX IF NOT EXISTS web_carts_session_idx ON web_carts(session_id);
CREATE INDEX IF NOT EXISTS web_carts_status_idx  ON web_carts(status);

-- ── RLS — הרשאות גישה ──────────────────────
ALTER TABLE web_carts ENABLE ROW LEVEL SECURITY;

-- האתר (anon) יכול להוסיף סל
DROP POLICY IF EXISTS "anon can insert carts" ON web_carts;
CREATE POLICY "anon can insert carts"
  ON web_carts FOR INSERT
  TO anon
  WITH CHECK (true);

-- האתר (anon) יכול לקרוא סלים
DROP POLICY IF EXISTS "anon can read own cart" ON web_carts;
CREATE POLICY "anon can read own cart"
  ON web_carts FOR SELECT
  TO anon
  USING (true);

-- האתר יכול גם לעדכן (נדרש ל-UPSERT עם merge-duplicates)
DROP POLICY IF EXISTS "anon can upsert carts" ON web_carts;
CREATE POLICY "anon can upsert carts"
  ON web_carts FOR UPDATE
  TO anon
  USING (true);

-- הבוט (service_role) יכול לעדכן סטטוס וטלפון
DROP POLICY IF EXISTS "service can update carts" ON web_carts;
CREATE POLICY "service can update carts"
  ON web_carts FOR UPDATE
  TO service_role
  USING (true);

-- ── Realtime ────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE web_carts;

-- ── עמודות v4 לטבלאות קיימות ─────────────
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS icon_emoji  TEXT DEFAULT '🔥';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS color_hex   TEXT DEFAULT '#C9A84C';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS priority    INT  DEFAULT 0;

ALTER TABLE products ADD COLUMN IF NOT EXISTS featured       BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_hex_map  JSONB   DEFAULT '{}';

ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE promotions;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
