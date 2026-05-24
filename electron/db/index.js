const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'snippet-vault.db')
const db = new Database(dbPath)

// ── Schema ──
db.exec(`
  CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL,
    description TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    copy_count INTEGER DEFAULT 0,
    last_used_at INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_snippets_title ON snippets(title);
  CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#4a9eff',
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS snippet_tags (
    snippet_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (snippet_id, tag_id),
    FOREIGN KEY (snippet_id) REFERENCES snippets(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
`)

// ── Migrations ──
const columns = db.prepare("PRAGMA table_info(snippets)").all()
const hasLastUsedAt = columns.some(c => c.name === 'last_used_at')
if (!hasLastUsedAt) {
  db.exec(`ALTER TABLE snippets ADD COLUMN last_used_at INTEGER DEFAULT 0`)
}

module.exports = db
