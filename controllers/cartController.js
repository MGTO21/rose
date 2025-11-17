const db = require('../config/db');

// Note: For simplicity cart is stored server-side in `carts` table keyed by session_id.
exports.add = async (req, res) => {
  const { sessionId, productId, qty } = req.body;
  if (!sessionId || !productId) return res.status(400).json({ success: false, message: 'Missing params' });
  try {
    const [existing] = await db.query('SELECT * FROM cart_items WHERE session_id=? AND product_id=?', [sessionId, productId]);
    if (existing.length) {
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id=?', [qty||1, existing[0].id]);
    } else {
      await db.query('INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)', [sessionId, productId, qty||1]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    const [rows] = await db.query('SELECT ci.*, p.name, p.price, p.image FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.session_id=?', [sessionId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const sessionId = req.params.sessionId;
  const { items } = req.body; // [{ id, quantity }]
  if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'Invalid payload' });
  try {
    const promises = items.map(i => db.query('UPDATE cart_items SET quantity=? WHERE id=? AND session_id=?', [i.quantity, i.id, sessionId]));
    await Promise.all(promises);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeItem = async (req, res) => {
  const { sessionId, itemId } = req.params;
  try {
    await db.query('DELETE FROM cart_items WHERE id=? AND session_id=?', [itemId, sessionId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
