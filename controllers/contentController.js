const db = require('../config/db');

exports.listFaqs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, question, answer FROM faqs WHERE active=1 ORDER BY sort_order, id');
    res.json({ success: true, data: rows });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getSettings = async (req, res) => {
  try {
    // Try schema with key_name/value_text
    const [rows] = await db.query('SELECT key_name, value_text FROM site_settings');
    return res.json({ success: true, data: rows });
  } catch (e1) {
    try {
      // Fallback to schema with `key`/`value`
      const [rows2] = await db.query('SELECT `key` AS key_name, `value` AS value_text FROM site_settings');
      return res.json({ success: true, data: rows2 });
    } catch (e2) {
      console.error(e2);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

exports.listBanners = async (req, res) => {
  try { const [rows] = await db.query('SELECT * FROM banners WHERE active=1 ORDER BY sort_order, id'); res.json({ success: true, data: rows }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, message: 'Missing email' });
  try { await db.query('INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE email=email', [email]); res.json({ success: true }); }
  catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Server error' }); }
};

// Public testimonials list
exports.listTestimonials = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, COALESCE(author,name) AS author, COALESCE(content,message) AS content, rating FROM testimonials ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Server error' }); }
};

// Public categories list
exports.listCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, slug, image FROM categories ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: 'Server error' }); }
};
