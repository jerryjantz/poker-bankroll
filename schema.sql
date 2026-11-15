CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  stakes TEXT DEFAULT '',
  default_buyin REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY,
  location TEXT NOT NULL,
  stakes TEXT DEFAULT '',
  date TEXT NOT NULL,
  buyin REAL NOT NULL,
  reloads REAL DEFAULT 0,
  cashout REAL NOT NULL,
  hours REAL DEFAULT 0,
  notes TEXT DEFAULT '',
  kind TEXT DEFAULT 'cash',
  game TEXT DEFAULT '',
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  table_size INTEGER DEFAULT 0,
  limit_type INTEGER DEFAULT 0,
  pause_seconds REAL DEFAULT 0,
  finish_pos INTEGER DEFAULT 0,
  players INTEGER DEFAULT 0,
  format TEXT DEFAULT '',
  events TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
