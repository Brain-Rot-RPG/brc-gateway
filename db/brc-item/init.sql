CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  effect TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_price ON items(price);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);

-- Insert default potions
INSERT INTO items (id, name, effect, price, created_at) VALUES 
  (0, 'Skibidi Potion', '{"HP": 40}', 50, NOW()),
  (1, 'La Gourde du Brave', '{"Attack": 15}', 75, NOW()),
  (2, 'Skibidi Potion Deluxe', '{"HP": 100}', 150, NOW()),
  (3, 'Skibidi Potion PRO MAX', '{"HP": 1000, "Attack": 50}', 300, NOW()),
  (4, 'La Gourde du Brave 2.0', '{"Attack": 50}', 200, NOW()),
  (5, 'La Gourde du Brave 67', '{"Attack": 670}', 500, NOW())
ON CONFLICT (id) DO NOTHING;
