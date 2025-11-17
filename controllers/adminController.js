const express = require('express');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Upload config
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '_' + Math.random().toString(36).slice(2) + path.extname(file.originalname);
    cb(null, unique);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('INVALID_FILE_TYPE'));
    cb(null, true);
  }
});

// Simple middleware to protect admin routes
router.use(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Products CRUD
router.get('/products', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM products');
  res.json({ success: true, data: rows });
});

router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category_id } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const imagePath = req.file ? ('/uploads/' + req.file.filename) : null;
    const [result] = await db.query('INSERT INTO products (name, description, price, category_id, image, active) VALUES (?,?,?,?,?,1)', [name, description||'', parseFloat(price)||0, category_id||null, imagePath]);
    res.json({ success: true, id: result.insertId, image: imagePath });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Product create error' });
  }
});

router.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const sets = Object.keys(fields).map(k => `${k}=?`).join(', ');
  const values = Object.values(fields);
  if (!sets) return res.status(400).json({ success: false, message: 'No fields' });
  await db.query(`UPDATE products SET ${sets} WHERE id=?`, [...values, id]);
  res.json({ success: true });
});

router.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  await db.query('DELETE FROM products WHERE id=?', [id]);
  res.json({ success: true });
});

// Orders overview
router.get('/orders', async (req, res) => {
  const { status } = req.query;
  const filter = status && status.toLowerCase() !== 'all' ? 'WHERE o.status = ?' : '';
  const params = status && status.toLowerCase() !== 'all' ? [status] : [];
  const [rows] = await db.query(`
    SELECT 
      o.*,
      (
        SELECT p.image FROM order_items oi 
        JOIN products p ON p.id = oi.product_id 
        WHERE oi.order_id = o.id 
        ORDER BY oi.id ASC LIMIT 1
      ) AS thumb,
      (
        SELECT COUNT(*) FROM order_items oi2 WHERE oi2.order_id = o.id
      ) AS items_count
    FROM orders o
    ${filter}
    ORDER BY o.created_at DESC
    LIMIT 100
  `, params);
  res.json({ success: true, data: rows });
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ success:false, message:'Missing status' });
  try {
    await db.query('UPDATE orders SET status=? WHERE id=?', [status, id]);
    res.json({ success:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'Status update error' });
  }
});

// Simple metrics for notifications
router.get('/metrics', async (req, res) => {
  try {
    const [[ord]] = await db.query("SELECT COUNT(*) AS total, SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) AS pending FROM orders");
    const [[msg]] = await db.query('SELECT COUNT(*) AS total FROM messages');
    res.json({ success:true, data: { orders: ord.total||0, pendingOrders: ord.pending||0, messages: msg.total||0 } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'metrics error' });
  }
});

// Messages
router.get('/messages', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
  res.json({ success: true, data: rows });
});
router.delete('/messages/:id', async (req, res) => {
  const id = req.params.id;
  try { await db.query('DELETE FROM messages WHERE id=?',[id]); res.json({ success:true }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error' }); }
});

// Testimonials
router.get('/testimonials', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
  res.json({ success: true, data: rows });
});
router.post('/testimonials', async (req, res) => {
  const { name, message, active } = req.body;
  try { const [r] = await db.query('INSERT INTO testimonials (name, message, active) VALUES (?,?,?)',[name||'', message||'', active?1:0]); res.json({ success:true, id:r.insertId }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error'}); }
});
router.put('/testimonials/:id', async (req, res) => {
  const id = req.params.id; const f=req.body; const sets=Object.keys(f).map(k=>`${k}=?`).join(', '); const vals=Object.values(f);
  if(!sets) return res.status(400).json({ success:false, message:'No fields' });
  try { await db.query(`UPDATE testimonials SET ${sets} WHERE id=?`, [...vals,id]); res.json({ success:true }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error'}); }
});
router.delete('/testimonials/:id', async (req, res) => {
  const id=req.params.id;
  try { await db.query('DELETE FROM testimonials WHERE id=?',[id]); res.json({ success:true }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error'}); }
});

// Simple analytics endpoint
router.get('/analytics', async (req, res) => {
  const [[{ totalOrders }]] = await db.query('SELECT COUNT(*) as totalOrders FROM orders');
  const [top] = await db.query('SELECT p.id, p.name, SUM(oi.quantity) as sold FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.id ORDER BY sold DESC LIMIT 5');
  res.json({ success: true, data: { totalOrders, topProducts: top } });
});

module.exports = { router };

// Additional admin endpoints below

// Categories CRUD
router.get('/categories', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
  res.json({ success: true, data: rows });
});

router.post('/categories', async (req, res) => {
  const { name, slug } = req.body;
  const [r] = await db.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug || null]);
  res.json({ success: true, id: r.insertId });
});

router.put('/categories/:id', async (req, res) => {
  const id = req.params.id;
  const { name, slug } = req.body;
  await db.query('UPDATE categories SET name=?, slug=? WHERE id=?', [name, slug || null, id]);
  res.json({ success: true });
});

router.delete('/categories/:id', async (req, res) => {
  const id = req.params.id;
  await db.query('DELETE FROM categories WHERE id=?', [id]);
  res.json({ success: true });
});

// Settings: support two possible schemas (key_name/value_text OR key/value)
router.get('/settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT key_name, value_text FROM site_settings');
    const obj = {}; rows.forEach(r => obj[r.key_name] = r.value_text);
    return res.json({ success: true, data: obj, mode: 'key_name/value_text' });
  } catch (e) {
    if (e.code === 'ER_BAD_FIELD_ERROR') {
      try {
        const [rows2] = await db.query('SELECT `key`, `value` FROM site_settings');
        const obj2 = {}; rows2.forEach(r => obj2[r.key] = r.value);
        return res.json({ success: true, data: obj2, mode: 'key/value' });
      } catch (e2) {
        console.error(e2);
        return res.status(500).json({ success: false, message: 'Settings query error' });
      }
    }
    console.error(e);
    return res.status(500).json({ success: false, message: 'Settings query error' });
  }
});

router.put('/settings', async (req, res) => {
  const updates = req.body || {};
  const keys = Object.keys(updates);
  if (!keys.length) return res.json({ success: true });
  // Try key_name/value_text first, fallback to key/value
  try {
    for (const k of keys) {
      await db.query('INSERT INTO site_settings (key_name, value_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_text=VALUES(value_text)', [k, String(updates[k])]);
    }
    return res.json({ success: true, mode: 'key_name/value_text' });
  } catch (e) {
    if (e.code === 'ER_BAD_FIELD_ERROR') {
      try {
        for (const k of keys) {
          await db.query('INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)', [k, String(updates[k])]);
        }
        return res.json({ success: true, mode: 'key/value' });
      } catch (e2) {
        console.error(e2);
        return res.status(500).json({ success: false, message: 'Settings update error' });
      }
    }
    console.error(e);
    return res.status(500).json({ success: false, message: 'Settings update error' });
  }
});

// FAQs CRUD
router.get('/faqs', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM faqs ORDER BY sort_order ASC, id DESC');
  res.json({ success: true, data: rows });
});
router.post('/faqs', async (req, res) => {
  const { question, answer, sort_order, active } = req.body;
  const [r] = await db.query('INSERT INTO faqs (question, answer, sort_order, active) VALUES (?,?,?,?)', [question, answer, sort_order||0, active?1:0]);
  res.json({ success: true, id: r.insertId });
});
router.put('/faqs/:id', async (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const sets = Object.keys(fields).map(k => `${k}=?`).join(', ');
  const values = Object.values(fields);
  if (!sets) return res.status(400).json({ success: false, message: 'No fields' });
  await db.query(`UPDATE faqs SET ${sets} WHERE id=?`, [...values, id]);
  res.json({ success: true });
});
router.delete('/faqs/:id', async (req, res) => {
  const id = req.params.id;
  await db.query('DELETE FROM faqs WHERE id=?', [id]);
  res.json({ success: true });
});

// Newsletter subscribers list
router.get('/subscribers', async (req, res) => {
  const [rows] = await db.query('SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC');
  res.json({ success: true, data: rows });
});
router.delete('/subscribers/:id', async (req, res) => {
  const id = req.params.id;
  try { await db.query('DELETE FROM newsletter_subscribers WHERE id=?',[id]); res.json({ success:true }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error'}); }
});

// Banners CRUD (title, subtitle, image, active, sort_order)
router.get('/banners', async (req, res) => {
  try { const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order, id'); res.json({ success:true, data: rows }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error' }); }
});
router.post('/banners', upload.single('image'), async (req, res) => {
  const { title, subtitle, sort_order, active } = req.body;
  try {
    const imagePath = req.file ? ('/uploads/' + req.file.filename) : null;
    const [r] = await db.query('INSERT INTO banners (title, subtitle, image, sort_order, active) VALUES (?,?,?,?,?)',[title||'', subtitle||'', imagePath, parseInt(sort_order)||0, active?1:0]);
    res.json({ success:true, id:r.insertId, image:imagePath });
  } catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error' }); }
});
router.put('/banners/:id', async (req, res) => {
  const id = req.params.id; const f=req.body; const sets=Object.keys(f).map(k=>`${k}=?`).join(', '); const vals=Object.values(f);
  if(!sets) return res.status(400).json({ success:false, message:'No fields' });
  try { await db.query(`UPDATE banners SET ${sets} WHERE id=?`, [...vals,id]); res.json({ success:true }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error' }); }
});
router.delete('/banners/:id', async (req, res) => {
  const id=req.params.id;
  try { await db.query('DELETE FROM banners WHERE id=?',[id]); res.json({ success:true }); }
  catch(e){ console.error(e); res.status(500).json({ success:false, message:'Server error' }); }
});
