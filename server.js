const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');

const { init, allSettings } = require('./src/db');
const SqliteSessionStore = require('./src/session-store')(session);
const publicRoutes = require('./src/routes/public');
const adminRoutes = require('./src/routes/admin');

// Ensure schema exists, then make sure content is seeded.
init();
try {
  require('./src/seed');
} catch (e) {
  console.error('Seed step failed (continuing):', e.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new SqliteSessionStore(),
    secret: process.env.SESSION_SECRET || 'certko-dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  })
);

// Expose settings + helpers to every view.
app.use((req, res, next) => {
  res.locals.settings = allSettings();
  res.locals.currentUser = req.session.adminUser || null;
  res.locals.formatCost = (n) => {
    if (!n) return '—';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    if (n >= 1000) return '₹' + Math.round(n / 1000) + 'K';
    return '₹' + n;
  };
  res.locals.currentPath = req.path;
  next();
});

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found', page: '' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error: ' + err.message);
});

app.listen(PORT, () => {
  console.log(`Certko running at http://localhost:${PORT}`);
  console.log(`Admin panel at   http://localhost:${PORT}/admin`);
});
