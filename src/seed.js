/* Seeds the Certko database with starter content.
 * Safe to run multiple times: it only inserts when a table is empty. */
const bcrypt = require('bcryptjs');
const { db, init, getSetting, setSetting } = require('./db');

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const SETTINGS = {
  site_name: 'Certko',
  tagline: 'Product Certification, Made Buttery Smooth',
  hero_eyebrow: 'Updated Jul 2026 · 870+ Products · 31 Upcoming QCOs',
  hero_title: 'Does Your Product Need BIS Certification?',
  hero_subtitle:
    'Check instantly. Free. Enter your product name or HSN code and get the certification type, estimated cost, timeline, and nearby testing labs — all in one buttery-smooth dashboard.',
  hero_cta_primary: 'Check My Product',
  hero_cta_secondary: 'Talk to an Expert',
  stat_products: '870+',
  stat_products_label: 'Products Covered',
  stat_labs: '420+',
  stat_labs_label: 'Testing Labs',
  stat_experts: '50+',
  stat_experts_label: 'BIS Experts',
  stat_free: 'Free',
  stat_free_label: 'Certko Checker',
  band_1_value: '2,500+', band_1_label: 'Products Checked',
  band_2_value: '500+', band_2_label: 'Businesses Helped',
  band_3_value: '98%', band_3_label: 'Accuracy Rate',
  band_4_value: '24hr', band_4_label: 'Expert Response',
  newsletter_title: 'Never Miss a New Mandatory Product',
  newsletter_body:
    'The government adds ~50 new products to mandatory BIS every year. Get alerted the day a new QCO affects your product category.',
  cta_title: 'Need BIS Certification Help?',
  cta_body:
    'Connect with verified BIS consultants who handle the entire process: application, testing, inspection, and certification. Free quote in 24 hours.',
  contact_email: 'hello@certko.com',
  contact_phone: '+91 98765 43210',
  brand_primary: '#12294a',
  brand_accent: '#f2a41c',
  brand_teal: '#1c8b8e',
  footer_note: 'Certko is an independent guidance platform and is not affiliated with the Bureau of Indian Standards.',
};

const CATEGORIES = [
  { name: 'Electronics & IT', icon: '💻', count: 96, img: 'cat-electronics.png',
    description: 'Laptops, LED products, power banks, set-top boxes and IT hardware under the CRS scheme.' },
  { name: 'Electrical Equipment', icon: '⚡', count: 228, img: 'cat-electrical.png',
    description: 'Switches, cables, transformers, motors and low-voltage gear needing ISI marking.' },
  { name: 'Steel & Metals', icon: '🏗️', count: 194, img: 'cat-steel.png',
    description: 'TMT bars, structural steel, wires and alloys governed by mandatory QCOs.' },
  { name: 'Building Materials', icon: '🧱', count: 58, img: 'cat-building.png',
    description: 'Cement, tiles, glass and construction chemicals requiring BIS certification.' },
  { name: 'Kitchen & Food', icon: '🍳', count: 71, img: 'cat-kitchen.png',
    description: 'Pressure cookers, LPG appliances, packaged water and food-contact goods.' },
  { name: 'Safety Equipment', icon: '🦺', count: 67, img: 'cat-safety.png',
    description: 'Helmets, gloves, footwear and industrial protective equipment.' },
  { name: 'Textiles & PPE', icon: '🧵', count: 38, img: 'cat-textiles.png',
    description: 'Medical textiles, coveralls and protective clothing under new QCOs.' },
  { name: 'Solar & Energy', icon: '☀️', count: 12, img: 'cat-solar.png',
    description: 'PV modules, inverters and batteries covered by the solar QCO.' },
  { name: 'Other Products', icon: '📦', count: 59, img: 'cat-other.png',
    description: 'Toys, footwear, kitchenware and miscellaneous notified products.' },
];

const CEMENTS = [
  ['Sulphate Resisting Portland Cement', 52, 191],
  ['Low Heat Portland Cement', 46, 207],
  ['Portland Pozzolana Cement | IS 1489 (Part 1)', 56, 197],
  ['Portland Pozzolana Cement | IS 1489 (Part 2)', 43, 200],
  ['Ordinary Portland Cement', 43, 206],
  ['Masonry Cement', 51, 204],
  ['Portland Slag Cement', 55, 212],
  ['High Alumina Cement for Structural Use', 53, 186],
];

function cementContent(name) {
  return (
    `<p><strong>${name}</strong> is a notified product under a mandatory Quality Control Order (QCO). ` +
    `Manufacturers — domestic and foreign — must obtain an ISI licence under BIS Scheme I before the product ` +
    `can be sold, stocked, or imported into India.</p>` +
    `<h3>What certification is required?</h3>` +
    `<p>An <strong>ISI Mark licence (Scheme I)</strong> tied to the relevant Indian Standard. Foreign manufacturers ` +
    `apply through the Foreign Manufacturers Certification Scheme (FMCS).</p>` +
    `<h3>Typical process</h3>` +
    `<ol><li>Application &amp; documentation</li><li>Factory inspection by a BIS officer</li>` +
    `<li>Sample drawal &amp; independent lab testing</li><li>Grant of licence &amp; ISI marking</li></ol>` +
    `<p>Certko connects you with an approved lab and a consultant who manages the full file so you stay compliant ` +
    `without the paperwork headache.</p>`
  );
}

const OTHER_PRODUCTS = [
  { name: 'LED Lighting Products', cat: 'Electronics & IT', scheme: 'CRS', hsn: '9405', min: 25, max: 90, popular: 1,
    summary: 'Self-ballasted LED lamps and luminaires must be registered under the CRS scheme (IS 16102 / IS 10322).' },
  { name: 'Mobile Phone Charger', cat: 'Electronics & IT', scheme: 'CRS', hsn: '8504', min: 30, max: 85, popular: 1,
    summary: 'Adapters and chargers require BIS registration under IS 13252 (Part 1) before sale.' },
  { name: 'Household Electrical Switches', cat: 'Electrical Equipment', scheme: 'ISI', hsn: '8536', min: 40, max: 160, popular: 0,
    summary: 'Switches for domestic use are covered under IS 3854 and need an ISI mark licence.' },
  { name: 'PVC Insulated Cables', cat: 'Electrical Equipment', scheme: 'ISI', hsn: '8544', min: 60, max: 220, popular: 1,
    summary: 'Low-voltage PVC cables fall under IS 694 and require mandatory ISI certification.' },
  { name: 'TMT Reinforcement Bars', cat: 'Steel & Metals', scheme: 'ISI', hsn: '7214', min: 70, max: 260, popular: 1,
    summary: 'High-strength deformed steel bars are notified under IS 1786 and need an ISI licence.' },
  { name: 'Stainless Steel Utensils', cat: 'Kitchen & Food', scheme: 'ISI', hsn: '7323', min: 45, max: 150, popular: 0,
    summary: 'Food-grade stainless steel utensils are covered under IS 14756.' },
  { name: 'Domestic Pressure Cooker', cat: 'Kitchen & Food', scheme: 'ISI', hsn: '7615', min: 50, max: 175, popular: 1,
    summary: 'Pressure cookers are a mandatory ISI product under IS 2347.' },
  { name: 'Industrial Safety Helmet', cat: 'Safety Equipment', scheme: 'ISI', hsn: '6506', min: 35, max: 120, popular: 0,
    summary: 'Protective helmets for industrial workers are certified under IS 2925.' },
  { name: 'Medical Coveralls (PPE)', cat: 'Textiles & PPE', scheme: 'ISI', hsn: '6210', min: 40, max: 130, popular: 0,
    summary: 'Protective medical coveralls follow IS 17423 requirements.' },
  { name: 'Solar Photovoltaic Modules', cat: 'Solar & Energy', scheme: 'CRS', hsn: '8541', min: 90, max: 300, popular: 1,
    summary: 'Crystalline silicon PV modules require BIS registration under IS 14286.' },
  { name: 'Solar Inverter', cat: 'Solar & Energy', scheme: 'CRS', hsn: '8504', min: 80, max: 240, popular: 0,
    summary: 'Grid-tied and off-grid inverters are registered under IS 16221.' },
  { name: 'Children\u2019s Toys', cat: 'Other Products', scheme: 'ISI', hsn: '9503', min: 30, max: 140, popular: 1,
    summary: 'All toys sold in India need an ISI licence under IS 9873 (Toys QCO).' },
];

function genericContent(p) {
  return (
    `<p>${p.summary}</p>` +
    `<h3>Is certification mandatory?</h3>` +
    `<p>Yes. Selling this product without valid BIS certification can lead to seizure, penalties, and delisting ` +
    `from marketplaces such as Amazon and Flipkart.</p>` +
    `<h3>How Certko helps</h3>` +
    `<p>Enter your product above to see the exact standard, estimated government + lab fees, realistic timeline, ` +
    `and a shortlist of accredited labs near you. Our experts can then run the entire application for you.</p>`
  );
}

const TESTIMONIALS = [
  { name: 'Rahul M.', role: 'Electronics Importer', location: 'Mumbai', quote:
    'Certko saved me hours of research. I found out my LED products needed CRS in 30 seconds, got connected with a consultant, and had my certification in 6 weeks.' },
  { name: 'Priya S.', role: 'Amazon Seller', location: 'Delhi', quote:
    'My products got delisted for missing BIS. Certko helped me understand exactly what I needed and connected me with an expert who fast-tracked my CRS registration.' },
  { name: 'Vikram K.', role: 'Solar Panel Manufacturer', location: 'Bangalore', quote:
    'The cost calculator was incredibly accurate, and the QCO alerts keep me informed about new mandatory products before my competitors know about them.' },
];

const STEPS = [
  { icon: '🔍', title: 'Check Your Product', description: 'Enter a product name or HSN code and get an instant answer: is BIS required, and under which scheme?' },
  { icon: '🔬', title: 'Find Testing Labs', description: 'Browse 420+ BIS-approved labs. Filter by city, product type, and cost to plan your testing.' },
  { icon: '👨‍💼', title: 'Get Expert Help', description: 'Connect with vetted BIS consultants who handle everything end-to-end. Free quote in 24 hours.' },
];

const FAQS = [
  { q: 'What is BIS certification?', a: 'BIS certification is a conformity mark issued by the Bureau of Indian Standards confirming a product meets the relevant Indian Standard. Common schemes include the ISI mark (Scheme I) and Compulsory Registration Scheme (CRS).', c: 'Basics' },
  { q: 'Is BIS certification mandatory for my product?', a: 'It depends on whether your product is covered by a Quality Control Order (QCO). Use the Certko checker at the top of any page — enter your product name or HSN code for an instant answer.', c: 'Basics' },
  { q: 'What is the difference between ISI and CRS?', a: 'ISI (Scheme I) applies to products like cement, steel and electrical goods and requires a factory inspection. CRS applies mostly to electronics and IT hardware and is based on lab testing plus online registration — usually no factory inspection.', c: 'Schemes' },
  { q: 'How much does BIS certification cost?', a: 'Costs vary by product and scheme. Typical all-in costs range from ₹25,000 to ₹3,00,000 including government fees, lab testing and consultant charges. Use our Cost Calculator for a product-specific estimate.', c: 'Cost' },
  { q: 'How long does certification take?', a: 'CRS registrations typically take 3–6 weeks. ISI licences involving a factory inspection usually take 8–26 weeks depending on the product and lab availability.', c: 'Timeline' },
  { q: 'Can foreign manufacturers get BIS certification?', a: 'Yes. Foreign manufacturers apply under the Foreign Manufacturers Certification Scheme (FMCS) and must appoint an Authorised Indian Representative (AIR).', c: 'Import' },
  { q: 'What happens if I sell without BIS certification?', a: 'Selling a notified product without valid certification is an offence. Penalties include fines, imprisonment, product seizure and delisting from e-commerce marketplaces.', c: 'Compliance' },
  { q: 'Is the Certko checker really free?', a: 'Yes. Checking whether your product needs certification, viewing cost estimates and browsing labs is completely free. You only pay a consultant if you choose to engage one.', c: 'Basics' },
];

const PAGES = [
  { slug: 'guide', title: 'BIS Certification Guide',
    subtitle: 'The complete 2026 guide: process, cost, documents and schemes.',
    image: 'page-guide.png', meta: 'A complete guide to BIS certification in India for 2026.',
    body: `<p>This guide walks you through everything you need to legally sell a notified product in India.</p>
      <h3>1. Confirm whether you need certification</h3>
      <p>Only products covered by a Quality Control Order (QCO) are mandatory. Use the Certko checker to confirm.</p>
      <h3>2. Identify your scheme</h3>
      <p><strong>ISI (Scheme I)</strong> — factory-inspection based, used for cement, steel, cables and appliances.<br>
      <strong>CRS</strong> — testing + registration based, used for electronics and IT hardware.</p>
      <h3>3. Prepare documents</h3>
      <ul><li>Business registration &amp; factory details</li><li>Product test reports from a BIS-recognised lab</li>
      <li>Trademark / brand authorisation</li><li>Authorised Indian Representative (for importers)</li></ul>
      <h3>4. Apply, test and get your licence</h3>
      <p>Submit the application, undergo testing (and inspection for ISI), and receive your licence or registration number.</p>` },
  { slug: 'cost-calculator', title: 'BIS Cost Calculator',
    subtitle: 'Estimate the certification cost for your product in seconds.',
    image: 'page-calculator.png', meta: 'Estimate BIS certification cost for your product.',
    body: `<p>Pick a product and scheme to see a realistic all-in estimate covering government fees, lab testing and consultant charges. Estimates are indicative and refined by our experts on request.</p>` },
  { slug: 'about', title: 'About Certko',
    subtitle: 'Making product certification buttery smooth for Indian businesses.',
    image: 'page-about.png', meta: 'About Certko — product certification made simple.',
    body: `<p>Certko is an independent guidance platform that helps manufacturers, importers and online sellers
      understand and obtain the certifications their products need. We combine an always-free lookup tool with a
      vetted network of testing labs and consultants so you can move from "do I need this?" to "fully certified"
      without the usual confusion.</p>` },
];

function run() {
  init();

  // Admin ------------------------------------------------------------------
  const adminCount = db.prepare('SELECT COUNT(*) c FROM admins').get().c;
  if (adminCount === 0) {
    const user = process.env.ADMIN_USER || 'admin';
    const pass = process.env.ADMIN_PASS || 'certko123';
    const hash = bcrypt.hashSync(pass, 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(user, hash);
    console.log(`Created admin user "${user}" (password: "${pass}")`);
  }

  // Settings ---------------------------------------------------------------
  for (const [k, v] of Object.entries(SETTINGS)) {
    if (!getSetting(k)) setSetting(k, v);
  }

  // Categories -------------------------------------------------------------
  const catByName = {};
  if (db.prepare('SELECT COUNT(*) c FROM categories').get().c === 0) {
    const insCat = db.prepare(
      'INSERT INTO categories (slug, name, icon, description, image, sort_order) VALUES (?,?,?,?,?,?)'
    );
    CATEGORIES.forEach((c, i) => {
      const info = insCat.run(slugify(c.name), c.name, c.icon, c.description, '/images/' + c.img, i);
      catByName[c.name] = info.lastInsertRowid;
    });
    console.log(`Seeded ${CATEGORIES.length} categories`);
  } else {
    db.prepare('SELECT id, name FROM categories').all().forEach((r) => (catByName[r.name] = r.id));
  }

  // Products ---------------------------------------------------------------
  if (db.prepare('SELECT COUNT(*) c FROM products').get().c === 0) {
    const insP = db.prepare(`INSERT INTO products
      (slug, name, category_id, scheme, hsn, cost_min, cost_max, timeline, is_mandatory, summary, content, image, is_popular, sort_order)
      VALUES (@slug,@name,@category_id,@scheme,@hsn,@cost_min,@cost_max,@timeline,1,@summary,@content,@image,@is_popular,@sort_order)`);
    let order = 0;
    CEMENTS.forEach(([name, min, max]) => {
      insP.run({
        slug: slugify(name), name, category_id: catByName['Building Materials'],
        scheme: 'ISI', hsn: '2523', cost_min: min * 1000, cost_max: max * 1000,
        timeline: '14–26 weeks', summary: `${name} requires a mandatory ISI mark licence under BIS Scheme I.`,
        content: cementContent(name), image: '/images/cat-building.png', is_popular: 1, sort_order: order++,
      });
    });
    OTHER_PRODUCTS.forEach((p) => {
      const catImg = CATEGORIES.find((c) => c.name === p.cat).img;
      insP.run({
        slug: slugify(p.name), name: p.name, category_id: catByName[p.cat], scheme: p.scheme,
        hsn: p.hsn, cost_min: p.min * 1000, cost_max: p.max * 1000,
        timeline: p.scheme === 'CRS' ? '3–6 weeks' : '8–20 weeks', summary: p.summary,
        content: genericContent(p), image: '/images/' + catImg, is_popular: p.popular, sort_order: order++,
      });
    });
    console.log(`Seeded ${CEMENTS.length + OTHER_PRODUCTS.length} products`);
  }

  // Testimonials -----------------------------------------------------------
  if (db.prepare('SELECT COUNT(*) c FROM testimonials').get().c === 0) {
    const insT = db.prepare('INSERT INTO testimonials (name, role, location, rating, quote, initial, sort_order) VALUES (?,?,?,?,?,?,?)');
    TESTIMONIALS.forEach((t, i) => insT.run(t.name, t.role, t.location, 5, t.quote, t.name[0], i));
    console.log(`Seeded ${TESTIMONIALS.length} testimonials`);
  }

  // Steps ------------------------------------------------------------------
  if (db.prepare('SELECT COUNT(*) c FROM steps').get().c === 0) {
    const insS = db.prepare('INSERT INTO steps (icon, title, description, sort_order) VALUES (?,?,?,?)');
    STEPS.forEach((s, i) => insS.run(s.icon, s.title, s.description, i));
    console.log(`Seeded ${STEPS.length} steps`);
  }

  // FAQs -------------------------------------------------------------------
  if (db.prepare('SELECT COUNT(*) c FROM faqs').get().c === 0) {
    const insF = db.prepare('INSERT INTO faqs (question, answer, category, sort_order) VALUES (?,?,?,?)');
    FAQS.forEach((f, i) => insF.run(f.q, f.a, f.c, i));
    console.log(`Seeded ${FAQS.length} FAQs`);
  }

  // Pages ------------------------------------------------------------------
  if (db.prepare('SELECT COUNT(*) c FROM pages').get().c === 0) {
    const insPg = db.prepare('INSERT INTO pages (slug, title, subtitle, body_html, image, meta_description) VALUES (?,?,?,?,?,?)');
    PAGES.forEach((p) => insPg.run(p.slug, p.title, p.subtitle, p.body, '/images/' + p.image, p.meta));
    console.log(`Seeded ${PAGES.length} pages`);
  }

  console.log('Seed complete.');
}

run();
module.exports = { slugify };
