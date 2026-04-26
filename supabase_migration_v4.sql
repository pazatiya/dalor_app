-- DALOR v4 Migration
-- Run once in Supabase SQL Editor
-- All changes are backwards-compatible (nullable / with defaults)

ALTER TABLE promotions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS icon_emoji TEXT DEFAULT '🔥';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#C9A84C';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0;

ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color_hex_map JSONB DEFAULT '{}';

-- Enable Realtime on relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE promotions;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
