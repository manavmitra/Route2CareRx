-- OTC retail / pharmacy store locations (bulk state imports)
CREATE TABLE IF NOT EXISTS otc_stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  address TEXT,
  city TEXT,
  state TEXT NOT NULL DEFAULT 'CA',
  zip TEXT,
  phone TEXT,
  hours TEXT,
  website TEXT,
  store_type TEXT NOT NULL,
  source TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  license_number TEXT,
  otc_tier TEXT,
  license_class TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otc_stores_bbox
  ON otc_stores (latitude, longitude)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_otc_stores_state
  ON otc_stores (state)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_otc_stores_source
  ON otc_stores (source);

CREATE INDEX IF NOT EXISTS idx_otc_stores_tier
  ON otc_stores (otc_tier)
  WHERE is_active = true;

ALTER TABLE otc_stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read otc_stores" ON otc_stores;
CREATE POLICY "Allow public read otc_stores"
  ON otc_stores FOR SELECT
  USING (is_active = true);

-- Backfill columns if table existed from an older migration
ALTER TABLE otc_stores ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE otc_stores ADD COLUMN IF NOT EXISTS otc_tier TEXT;
ALTER TABLE otc_stores ADD COLUMN IF NOT EXISTS license_class TEXT;
