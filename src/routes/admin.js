const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { db, getSetting, setSetting, allSettings } = require('../db');
const { requireAuth } = require('../middleware/auth');

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Image upload storage -------------------------------------------------------
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + slugify(path.parse(file.originalname).name) + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function uploadedPath(file) {
  return file ? '/uploads/' + file.filename : null;
}

// Auth -----------------------------------------------------------------------
router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', { title: 'Admin Login', layout: false, error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password || '', admin.password_hash)) {
    return res.status(401).render('admin/login', { title: 'Admin Login', layout: false, error: 'Invalid credentials' });
  }
  req.session.adminId = admin.id;
  req.session.adminUser = admin.username;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// Everything below requires auth --------------------------------------------
router.use(requireAuth);

function adminView(res, view, data) {
  res.render('admin/' + view, Object.assign({ layout: 'admin/layout', admin: true }, data));
}

// Dashboard ------------------------------------------------------------------
router.get('/', (req, res) => {
  const counts = {
    products: db.prepare('SELECT COUNT(*) c FROM products').get().c,
    categories: db.prepare('SELECT COUNT(*) c FROM categories').get().c,
    faqs: db.prepare('SELECT COUNT(*) c FROM faqs').get().c,
    testimonials: db.prepare('SELECT COUNT(*) c FROM testimonials').get().c,
    leads: db.prepare('SELECT COUNT(*) c FROM leads').get().c,
  };
  const recentLeads = db.prepare('SELECT * FROM leads ORDER BY id DESC LIMIT 5').all();
  adminView(res, 'dashboard', { title: 'Dashboard', section: 'dashboard', counts, recentLeads });
});

// Site settings --------------------------------------------------------------
router.get('/settings', (req, res) => {
  adminView(res, 'settings', { title: 'Site Settings', section: 'settings', values: allSettings() });
});
router.post('/settings', (req, res) => {
  for (const [k, v] of Object.entries(req.body)) setSetting(k, v);
  res.redirect('/admin/settings');
});

// Products -------------------------------------------------------------------
router.get('/products', (req, res) => {
  const products = db.prepare(
    `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.sort_order, p.id`
  ).all();
  adminView(res, 'products', { title: 'Products', section: 'products', products });
});

router.get('/products/new', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  adminView(res, 'product_form', { title: 'New Product', section: 'products', product: {}, categories, isNew: true });
});

router.get('/products/:id/edit', (req, res, next) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return next();
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  adminView(res, 'product_form', { title: 'Edit Product', section: 'products', product, categories, isNew: false });
});

router.post('/products', upload.single('image_file'), (req, res) => {
  const b = req.body;
  const image = uploadedPath(req.file) || b.image || '';
  db.prepare(`INSERT INTO products
    (slug, name, category_id, scheme, hsn, cost_min, cost_max, timeline, is_mandatory, summary, content, image, is_popular, sort_order)
    VALUES (@slug,@name,@category_id,@scheme,@hsn,@cost_min,@cost_max,@timeline,@is_mandatory,@summary,@content,@image,@is_popular,@sort_order)`)
    .run({
      slug: slugify(b.slug || b.name), name: b.name, category_id: b.category_id || null,
      scheme: b.scheme || 'ISI', hsn: b.hsn || '', cost_min: parseInt(b.cost_min || 0, 10),
      cost_max: parseInt(b.cost_max || 0, 10), timeline: b.timeline || '',
      is_mandatory: b.is_mandatory ? 1 : 0, summary: b.summary || '', content: b.content || '',
      image, is_popular: b.is_popular ? 1 : 0, sort_order: parseInt(b.sort_order || 0, 10),
    });
  res.redirect('/admin/products');
});

router.post('/products/:id', upload.single('image_file'), (req, res) => {
  const b = req.body;
  const current = db.prepare('SELECT image FROM products WHERE id = ?').get(req.params.id);
  const image = uploadedPath(req.file) || b.image || (current && current.image) || '';
  db.prepare(`UPDATE products SET slug=@slug, name=@name, category_id=@category_id, scheme=@scheme, hsn=@hsn,
    cost_min=@cost_min, cost_max=@cost_max, timeline=@timeline, is_mandatory=@is_mandatory, summary=@summary,
    content=@content, image=@image, is_popular=@is_popular, sort_order=@sort_order WHERE id=@id`)
    .run({
      id: req.params.id, slug: slugify(b.slug || b.name), name: b.name, category_id: b.category_id || null,
      scheme: b.scheme || 'ISI', hsn: b.hsn || '', cost_min: parseInt(b.cost_min || 0, 10),
      cost_max: parseInt(b.cost_max || 0, 10), timeline: b.timeline || '',
      is_mandatory: b.is_mandatory ? 1 : 0, summary: b.summary || '', content: b.content || '',
      image, is_popular: b.is_popular ? 1 : 0, sort_order: parseInt(b.sort_order || 0, 10),
    });
  res.redirect('/admin/products');
});

router.post('/products/:id/delete', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.redirect('/admin/products');
});

// Categories -----------------------------------------------------------------
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
  adminView(res, 'categories', { title: 'Categories', section: 'categories', categories });
});
router.get('/categories/new', (req, res) => {
  adminView(res, 'category_form', { title: 'New Category', section: 'categories', category: {}, isNew: true });
});
router.get('/categories/:id/edit', (req, res, next) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) return next();
  adminView(res, 'category_form', { title: 'Edit Category', section: 'categories', category, isNew: false });
});
router.post('/categories', upload.single('image_file'), (req, res) => {
  const b = req.body;
  const image = uploadedPath(req.file) || b.image || '';
  db.prepare('INSERT INTO categories (slug, name, icon, description, content, image, sort_order) VALUES (?,?,?,?,?,?,?)')
    .run(slugify(b.slug || b.name), b.name, b.icon || '', b.description || '', b.content || '', image, parseInt(b.sort_order || 0, 10));
  res.redirect('/admin/categories');
});
router.post('/categories/:id', upload.single('image_file'), (req, res) => {
  const b = req.body;
  const current = db.prepare('SELECT image FROM categories WHERE id = ?').get(req.params.id);
  const image = uploadedPath(req.file) || b.image || (current && current.image) || '';
  db.prepare('UPDATE categories SET slug=?, name=?, icon=?, description=?, content=?, image=?, sort_order=? WHERE id=?')
    .run(slugify(b.slug || b.name), b.name, b.icon || '', b.description || '', b.content || '', image, parseInt(b.sort_order || 0, 10), req.params.id);
  res.redirect('/admin/categories');
});
router.post('/categories/:id/delete', (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.redirect('/admin/categories');
});

// FAQs -----------------------------------------------------------------------
router.get('/faqs', (req, res) => {
  const faqs = db.prepare('SELECT * FROM faqs ORDER BY sort_order, id').all();
  adminView(res, 'faqs', { title: 'FAQs', section: 'faqs', faqs });
});
router.get('/faqs/new', (req, res) => {
  adminView(res, 'faq_form', { title: 'New FAQ', section: 'faqs', faq: {}, isNew: true });
});
router.get('/faqs/:id/edit', (req, res, next) => {
  const faq = db.prepare('SELECT * FROM faqs WHERE id = ?').get(req.params.id);
  if (!faq) return next();
  adminView(res, 'faq_form', { title: 'Edit FAQ', section: 'faqs', faq, isNew: false });
});
router.post('/faqs', (req, res) => {
  const b = req.body;
  db.prepare('INSERT INTO faqs (question, answer, category, sort_order) VALUES (?,?,?,?)')
    .run(b.question, b.answer || '', b.category || 'General', parseInt(b.sort_order || 0, 10));
  res.redirect('/admin/faqs');
});
router.post('/faqs/:id', (req, res) => {
  const b = req.body;
  db.prepare('UPDATE faqs SET question=?, answer=?, category=?, sort_order=? WHERE id=?')
    .run(b.question, b.answer || '', b.category || 'General', parseInt(b.sort_order || 0, 10), req.params.id);
  res.redirect('/admin/faqs');
});
router.post('/faqs/:id/delete', (req, res) => {
  db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  res.redirect('/admin/faqs');
});

// Testimonials ---------------------------------------------------------------
router.get('/testimonials', (req, res) => {
  const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY sort_order, id').all();
  adminView(res, 'testimonials', { title: 'Testimonials', section: 'testimonials', testimonials });
});
router.get('/testimonials/new', (req, res) => {
  adminView(res, 'testimonial_form', { title: 'New Testimonial', section: 'testimonials', item: {}, isNew: true });
});
router.get('/testimonials/:id/edit', (req, res, next) => {
  const item = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!item) return next();
  adminView(res, 'testimonial_form', { title: 'Edit Testimonial', section: 'testimonials', item, isNew: false });
});
router.post('/testimonials', (req, res) => {
  const b = req.body;
  db.prepare('INSERT INTO testimonials (name, role, location, rating, quote, initial, sort_order) VALUES (?,?,?,?,?,?,?)')
    .run(b.name, b.role || '', b.location || '', parseInt(b.rating || 5, 10), b.quote || '', (b.name || '?')[0], parseInt(b.sort_order || 0, 10));
  res.redirect('/admin/testimonials');
});
router.post('/testimonials/:id', (req, res) => {
  const b = req.body;
  db.prepare('UPDATE testimonials SET name=?, role=?, location=?, rating=?, quote=?, initial=?, sort_order=? WHERE id=?')
    .run(b.name, b.role || '', b.location || '', parseInt(b.rating || 5, 10), b.quote || '', (b.name || '?')[0], parseInt(b.sort_order || 0, 10), req.params.id);
  res.redirect('/admin/testimonials');
});
router.post('/testimonials/:id/delete', (req, res) => {
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  res.redirect('/admin/testimonials');
});

// Pages ----------------------------------------------------------------------
router.get('/pages', (req, res) => {
  const pages = db.prepare('SELECT * FROM pages ORDER BY id').all();
  adminView(res, 'pages', { title: 'Content Pages', section: 'pages', pages });
});
router.get('/pages/new', (req, res) => {
  adminView(res, 'page_form', { title: 'New Page', section: 'pages', pageRow: {}, isNew: true });
});
router.get('/pages/:id/edit', (req, res, next) => {
  const pageRow = db.prepare('SELECT * FROM pages WHERE id = ?').get(req.params.id);
  if (!pageRow) return next();
  adminView(res, 'page_form', { title: 'Edit Page', section: 'pages', pageRow, isNew: false });
});
router.post('/pages', upload.single('image_file'), (req, res) => {
  const b = req.body;
  const image = uploadedPath(req.file) || b.image || '';
  db.prepare('INSERT INTO pages (slug, title, subtitle, body_html, image, meta_description) VALUES (?,?,?,?,?,?)')
    .run(slugify(b.slug || b.title), b.title, b.subtitle || '', b.body_html || '', image, b.meta_description || '');
  res.redirect('/admin/pages');
});
router.post('/pages/:id', upload.single('image_file'), (req, res) => {
  const b = req.body;
  const current = db.prepare('SELECT image FROM pages WHERE id = ?').get(req.params.id);
  const image = uploadedPath(req.file) || b.image || (current && current.image) || '';
  db.prepare('UPDATE pages SET slug=?, title=?, subtitle=?, body_html=?, image=?, meta_description=? WHERE id=?')
    .run(slugify(b.slug || b.title), b.title, b.subtitle || '', b.body_html || '', image, b.meta_description || '', req.params.id);
  res.redirect('/admin/pages');
});
router.post('/pages/:id/delete', (req, res) => {
  db.prepare('DELETE FROM pages WHERE id = ?').run(req.params.id);
  res.redirect('/admin/pages');
});

// Leads ----------------------------------------------------------------------
router.get('/leads', (req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY id DESC').all();
  adminView(res, 'leads', { title: 'Leads', section: 'leads', leads });
});

module.exports = router;
