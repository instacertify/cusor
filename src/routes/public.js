const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Home -----------------------------------------------------------------------
router.get('/', (req, res) => {
  const steps = db.prepare('SELECT * FROM steps ORDER BY sort_order').all();
  const popular = db.prepare('SELECT * FROM products WHERE is_popular = 1 ORDER BY sort_order LIMIT 8').all();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY sort_order').all();
  const totalProducts = db.prepare('SELECT COUNT(*) c FROM products').get().c;
  res.render('home', {
    title: `${res.locals.settings.site_name} — ${res.locals.settings.tagline}`,
    page: 'home', steps, popular, categories, testimonials, totalProducts,
  });
});

// Product listing ------------------------------------------------------------
router.get('/products', (req, res) => {
  const q = (req.query.q || '').trim();
  const catSlug = (req.query.category || '').trim();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();

  let sql = `SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p LEFT JOIN categories c ON c.id = p.category_id`;
  const where = [];
  const params = {};
  if (q) { where.push('(p.name LIKE @kw OR p.hsn LIKE @kw)'); params.kw = `%${q}%`; }
  if (catSlug) { where.push('c.slug = @cat'); params.cat = catSlug; }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY p.is_popular DESC, p.sort_order';
  const products = db.prepare(sql).all(params);

  res.render('products', {
    title: 'Browse Products — ' + res.locals.settings.site_name,
    page: 'products', products, categories, q, catSlug,
  });
});

// Instant checker (used by hero search) --------------------------------------
router.get('/check', (req, res) => {
  const q = (req.query.q || '').trim();
  let match = null;
  if (q) {
    match = db.prepare(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.name LIKE @kw OR p.hsn LIKE @kw ORDER BY p.is_popular DESC LIMIT 1`
    ).get({ kw: `%${q}%` });
  }
  const related = q
    ? db.prepare(
        `SELECT * FROM products WHERE name LIKE @kw OR hsn LIKE @kw ORDER BY is_popular DESC LIMIT 6`
      ).all({ kw: `%${q}%` })
    : [];
  res.render('check', {
    title: `Check "${q}" — ${res.locals.settings.site_name}`,
    page: 'products', q, match, related,
  });
});

// Product detail -------------------------------------------------------------
router.get('/product/:slug', (req, res, next) => {
  const product = db.prepare(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.slug = ?`
  ).get(req.params.slug);
  if (!product) return next();
  const related = db.prepare(
    'SELECT * FROM products WHERE category_id = ? AND id != ? ORDER BY is_popular DESC LIMIT 4'
  ).all(product.category_id, product.id);
  res.render('product', {
    title: `${product.name} — BIS Certification | ${res.locals.settings.site_name}`,
    page: 'products', product, related,
  });
});

// Categories -----------------------------------------------------------------
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  categories.forEach((c) => {
    c.count = db.prepare('SELECT COUNT(*) c FROM products WHERE category_id = ?').get(c.id).c;
  });
  res.render('categories', {
    title: 'Browse by Category — ' + res.locals.settings.site_name,
    page: 'categories', categories,
  });
});

router.get('/category/:slug', (req, res, next) => {
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!category) return next();
  const products = db.prepare(
    'SELECT * FROM products WHERE category_id = ? ORDER BY is_popular DESC, sort_order'
  ).all(category.id);
  res.render('category', {
    title: `${category.name} — BIS Certification | ${res.locals.settings.site_name}`,
    page: 'categories', category, products,
  });
});

// FAQ ------------------------------------------------------------------------
router.get('/faq', (req, res) => {
  const rows = db.prepare('SELECT * FROM faqs ORDER BY sort_order').all();
  const groups = {};
  for (const f of rows) {
    (groups[f.category] = groups[f.category] || []).push(f);
  }
  res.render('faq', {
    title: 'Frequently Asked Questions — ' + res.locals.settings.site_name,
    page: 'faq', groups,
  });
});

// Static content pages (guide, cost-calculator, about) -----------------------
router.get('/cost-calculator', (req, res, next) => {
  const pageRow = db.prepare('SELECT * FROM pages WHERE slug = ?').get('cost-calculator');
  if (!pageRow) return next();
  const products = db.prepare('SELECT slug, name, scheme, cost_min, cost_max, timeline FROM products ORDER BY name').all();
  res.render('calculator', {
    title: pageRow.title + ' — ' + res.locals.settings.site_name,
    page: 'calculator', pageRow, products,
  });
});

router.get('/page/:slug', (req, res, next) => {
  const pageRow = db.prepare('SELECT * FROM pages WHERE slug = ?').get(req.params.slug);
  if (!pageRow) return next();
  res.render('page', {
    title: pageRow.title + ' — ' + res.locals.settings.site_name,
    page: req.params.slug, pageRow,
  });
});
router.get('/guide', (req, res) => res.redirect('/page/guide'));
router.get('/about', (req, res) => res.redirect('/page/about'));

// Contact / lead capture -----------------------------------------------------
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Get Expert Help — ' + res.locals.settings.site_name,
    page: 'contact', sent: req.query.sent === '1',
  });
});

router.post('/contact', (req, res) => {
  const { name, email, phone, product, message } = req.body;
  db.prepare('INSERT INTO leads (name, email, phone, product, message) VALUES (?,?,?,?,?)')
    .run(name || '', email || '', phone || '', product || '', message || '');
  res.redirect('/contact?sent=1');
});

router.post('/subscribe', (req, res) => {
  const { email } = req.body;
  db.prepare('INSERT INTO leads (name, email, message) VALUES (?,?,?)')
    .run('Newsletter', email || '', 'QCO alert subscription');
  res.redirect(req.get('referer') || '/');
});

module.exports = router;
