import type Database from "better-sqlite3";

const DEFAULT_BIO =
  "Certko helps manufacturers navigate BIS, QCO and export certifications with clear process guidance, lab coordination and documentation support.";

export function ensureAuthorsCatalog(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      sort INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const postCols = db.prepare("PRAGMA table_info(posts)").all() as { name: string }[];
  if (!postCols.some((c) => c.name === "author_id")) {
    db.exec("ALTER TABLE posts ADD COLUMN author_id INTEGER REFERENCES authors(id)");
  }

  const count = (db.prepare("SELECT COUNT(*) AS n FROM authors").get() as { n: number }).n;
  if (count === 0) {
    db.prepare(
      `INSERT INTO authors (slug, name, title, bio, sort)
       VALUES ('certko-team', 'Certko Team', 'Compliance consultants', ?, 0)`
    ).run(DEFAULT_BIO);
  }

  const authors = db.prepare("SELECT id, name FROM authors").all() as { id: number; name: string }[];
  const linkByName = db.prepare(
    "UPDATE posts SET author_id = ?, author = ? WHERE (author_id IS NULL OR author_id = 0) AND author = ?"
  );
  for (const a of authors) {
    linkByName.run(a.id, a.name, a.name);
  }

  const fallback = db
    .prepare("SELECT id, name FROM authors ORDER BY sort, id LIMIT 1")
    .get() as { id: number; name: string } | undefined;
  if (fallback) {
    db.prepare(
      "UPDATE posts SET author_id = ?, author = ? WHERE author_id IS NULL OR author_id = 0"
    ).run(fallback.id, fallback.name);
  }
}
