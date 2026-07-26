/* Minimal express-session store backed by the app's better-sqlite3 database. */
const { db } = require('./db');

module.exports = function (session) {
  const Store = session.Store;

  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    sid     TEXT PRIMARY KEY,
    expires INTEGER,
    sess    TEXT
  )`);

  class SqliteSessionStore extends Store {
    constructor(options = {}) {
      super(options);
      this.getStmt = db.prepare('SELECT sess, expires FROM sessions WHERE sid = ?');
      this.setStmt = db.prepare(
        'INSERT INTO sessions (sid, expires, sess) VALUES (?, ?, ?) ' +
        'ON CONFLICT(sid) DO UPDATE SET expires = excluded.expires, sess = excluded.sess'
      );
      this.delStmt = db.prepare('DELETE FROM sessions WHERE sid = ?');
    }

    get(sid, cb) {
      try {
        const row = this.getStmt.get(sid);
        if (!row) return cb(null, null);
        if (row.expires && row.expires < Date.now()) {
          this.delStmt.run(sid);
          return cb(null, null);
        }
        return cb(null, JSON.parse(row.sess));
      } catch (e) {
        return cb(e);
      }
    }

    set(sid, sess, cb) {
      try {
        const maxAge = sess.cookie && sess.cookie.maxAge ? sess.cookie.maxAge : 1000 * 60 * 60 * 24 * 7;
        const expires = Date.now() + maxAge;
        this.setStmt.run(sid, expires, JSON.stringify(sess));
        return cb && cb(null);
      } catch (e) {
        return cb && cb(e);
      }
    }

    destroy(sid, cb) {
      try {
        this.delStmt.run(sid);
        return cb && cb(null);
      } catch (e) {
        return cb && cb(e);
      }
    }

    touch(sid, sess, cb) {
      return this.set(sid, sess, cb);
    }
  }

  return SqliteSessionStore;
};
