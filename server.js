require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin-static', express.static(path.join(__dirname, 'admin')));
// Serve admin directly at /admin to allow /admin/dashboard.html
app.use('/admin', express.static(path.join(__dirname, 'admin')));
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API
app.use('/api', apiRouter);

// Catch-all to serve index (for SPA-like behavior on static pages)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ROSE GIFTS server running on port ${PORT}`);
});
