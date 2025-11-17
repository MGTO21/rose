# ROSE GIFTS — Online Gift Shop

This repository is a complete, production-ready scaffold for **ROSE GIFTS** — a modern, elegant online gift shop built with a vanilla HTML/CSS/JS frontend and a Node.js + Express backend using MySQL.

Features:
- Elegant responsive frontend (pure HTML/CSS/vanilla JS)
- REST API (products, cart, checkout, contact, admin)
- Admin dashboard (HTML/CSS/JS) with JWT auth
- MySQL schema + seed data
- Email notification placeholder (nodemailer)

---

Quick start (Windows PowerShell):

1. Install Node dependencies

```powershell
cd C:\Users\DELL\Desktop\wapside
npm install
```

2. Create `.env` file based on `.env.example` and set your DB and email settings.

3. Create the MySQL database and load schema + seed (adjust mysql command if needed):

```powershell
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```

Important: The seed inserts an admin user with `password_hash` set to `REPLACE_WITH_BCRYPT_HASH`. Create a bcrypt hash for your chosen admin password and update the users table:

Example Node snippet to generate a hash:

```powershell
node -e "const bcrypt=require('bcrypt');bcrypt.hash('admin123',10).then(h=>console.log(h));"
```

Then update the DB record:

```sql
UPDATE users SET password_hash='paste_hash_here' WHERE email='admin@rosegifts.test';
```

4. Start the server:

```powershell
npm run dev
```

5. Open the site: `http://localhost:3000`
   Admin panel: `http://localhost:3000/admin-static/index.html`

---

Project structure (key files):

- `server.js` — Express entry point
- `routes/api.js` — API endpoints
- `controllers/` — controllers for products, cart, orders, auth, admin
- `config/db.js` — MySQL pool
# ROSE GIFTS — Online Gift Shop

This repository is a complete, production-ready scaffold for **ROSE GIFTS** — a modern, elegant online gift shop (Node.js + Express + MySQL backend, TailwindCSS + vanilla JS frontend, Arabic default with English toggle).

Features:
- Elegant responsive frontend (TailwindCSS utilities + minimal JS)
- REST API (products, cart, checkout, contact, content: FAQs / settings / testimonials / banners / newsletter)
- Admin static panel removed (backend endpoints remain for future re‑addition)
- MySQL schema + seed data + migrations (see `sql/`)
- Email notification placeholder (nodemailer)

---

## Quick Start (Windows PowerShell)

1. Install Node dependencies:
```powershell
cd C:\Users\DELL\Desktop\wapside
npm install
```
2. Create `.env` from `.env.example` (DB credentials, JWT secret, mail settings).
3. Initialize database & seeds:
```powershell
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
```
4. (Optional) Generate bcrypt hash for a new admin password:
```powershell
node -e "const bcrypt=require('bcrypt');bcrypt.hash('admin123',10).then(h=>console.log(h));"
```
5. Start dev server:
```powershell
npm run dev
```
6. Build CSS (one‑time) or watch:
```powershell
npm run tailwind:build
# OR
npm run tailwind:watch
```
7. Open site: `http://localhost:3000`

---

## Project Structure (Key Files)
- `server.js` — Express entry (serves `public/` statics)
- `routes/api.js` — API endpoints
- `controllers/` — products, cart, orders, auth, contact, content, admin endpoints
- `config/db.js` — MySQL pool
- `public/` — rebuilt Tailwind frontend
- `public/lang/` — `ar.json`, `en.json` translation dictionaries
- `src/styles/input.css` — Tailwind source
- `tailwind.config.js` / `postcss.config.js` — build config
- `sql/` — schema, seeds, migrations

To create a distributable ZIP:
```powershell
Compress-Archive -Path .\* -DestinationPath ..\rose-gifts.zip -Force
```

---

## Frontend Rebuild (TailwindCSS)
The `public/` folder was recreated. Main parts:
- `index.html` — One-page layout (hero, products, testimonials, FAQ, contact, newsletter).
- `assets/js/main.js` — Bootstrap, data fetch, cart, i18n toggle.
- `lang/ar.json` & `lang/en.json` — Text keys for translation.
- Generated CSS: `assets/css/style.css` (build via scripts).

Build once:
```powershell
npm run tailwind:build
```
Watch mode during development:
```powershell
npm run tailwind:watch
```

### Adding Translation Keys
1. Add key to both JSON language files.
2. Use `data-i18n="key"` or `data-i18n-placeholder` on inputs.
3. Reload (bootstrap loads and applies).

### Dynamic Content
- Products: `/api/products`
- Testimonials: `/api/testimonials`
- FAQs: `/api/faqs`
- Settings (hero overrides): `/api/settings` (keys `hero_heading`, `hero_subheading`)
- Newsletter: POST `/api/newsletter/subscribe` `{ email }`
- Cart: POST `/api/cart` with `{ sessionId, productId, qty }` then GET `/api/cart/:sessionId`

### Cart Session
`main.js` creates a persistent `rg_session` ID in `localStorage` used by cart endpoints.

### Re‑adding Admin UI
Backend admin endpoints still exist under `/api/admin/*` (JWT). Rebuild a new SPA or static panel when needed; serve it similarly to `public/`.

---

## Security Notes / Next Steps
- Replace `JWT_SECRET` & mail credentials before production.
- Use HTTPS, proper secret management, and production logging.
- Consider rate limiting & input sanitization beyond current validation.
- Migrate images to external storage (S3/CDN) if media grows.

Admin credentials (backend only, dev):
- Email: `admin@rosegifts.test`
- Password: `J5aCoehIAs4A!Rg`

Change both + rotate hash before real deployment.

---

## Contributing / Extending
Suggested enhancements:
- Add richer animations (GSAP / AOS) & product filtering.
- Implement full checkout UI + order history component.
- Normalize `site_settings` schema (drop fallback variant).
- Add SSR or hydration strategy if SEO for dynamic sections needed.

---

Enjoy building with ROSE GIFTS.
