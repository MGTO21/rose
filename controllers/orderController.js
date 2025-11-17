const db = require('../config/db');
const nodemailer = require('nodemailer');

exports.checkout = async (req, res) => {
  const { sessionId, customer } = req.body; // customer: {name,email,address,phone,altPhone,note}
  if (!sessionId || !customer) return res.status(400).json({ success: false, message: 'Missing params' });
  const requiredMissing = !customer.name || !customer.address || !customer.phone;
  if (requiredMissing) return res.status(400).json({ success: false, message: 'Missing required fields (name, phone, address)' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [items] = await conn.query('SELECT ci.*, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.session_id=?', [sessionId]);
    if (!items.length) { await conn.release(); return res.status(400).json({ success: false, message: 'Cart empty' }); }
    let total = items.reduce((s, it) => s + it.quantity * it.price, 0);
    // Try extended schema first (with phone, alt_phone, note)
    let orderRes;
    try {
      const [r] = await conn.query('INSERT INTO orders (customer_name, customer_email, customer_address, customer_phone, customer_alt_phone, note, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [customer.name, customer.email, customer.address, customer.phone || null, customer.altPhone || null, customer.note || null, total, 'Pending']);
      orderRes = r;
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        const [r2] = await conn.query('INSERT INTO orders (customer_name, customer_email, customer_address, total, status) VALUES (?, ?, ?, ?, ?)', [customer.name, customer.email, customer.address, total, 'Pending']);
        orderRes = r2;
      } else {
        throw e;
      }
    }
    const orderId = orderRes.insertId;
    const orderItemsPromises = items.map(it => conn.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, it.product_id, it.quantity, it.price]));
    await Promise.all(orderItemsPromises);
    // Clear cart
    await conn.query('DELETE FROM cart_items WHERE session_id=?', [sessionId]);
    await conn.commit();

    // Send notification email (simple placeholder using env vars)
    try {
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Order #${orderId}`,
        text: `New order received. Order ID: ${orderId}. Total: ${total}. Customer: ${customer.name} ${customer.email} ${customer.phone||''}`
      });
    } catch (mailErr) {
      console.warn('Email not sent (check configuration):', mailErr.message);
    }

    res.json({ success: true, orderId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: 'Checkout error' });
  } finally {
    conn.release();
  }
};

exports.getOrder = async (req, res) => {
  const id = req.params.id;
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id=?', [id]);
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });
      const [items] = await db.query('SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id=?', [id]);
    res.json({ success: true, data: { order: orders[0], items } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
