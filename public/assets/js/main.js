// ================= أساسيات =================
const API = '/api';
const langFiles = { ar: '/lang/ar.json', en: '/lang/en.json' };
let currentLang = localStorage.getItem('rg_lang') || 'ar';
let translations = {};
const sessionId = (() => {
  let s = localStorage.getItem('rg_session');
  if (!s) { s = 'sess_' + Math.random().toString(36).slice(2); localStorage.setItem('rg_session', s); }
  return s;
})();

function qs(sel) { return document.querySelector(sel); }
function ce(tag, cls) { const el = document.createElement(tag); if (cls) el.className = cls; return el; }

async function fetchJSON(url, opts = {}) { const res = await fetch(url, opts); if (!res.ok) throw new Error(res.status + ' ' + url); return res.json(); }

async function loadTranslations() { translations = await fetchJSON(langFiles[currentLang]); }

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', currentLang === 'ar');
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); if (translations[k]) el.textContent = translations[k]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.getAttribute('data-i18n-placeholder'); if (translations[k]) el.setAttribute('placeholder', translations[k]); });
  document.title = translations['site.title'] || document.title;
  const lt = qs('#langToggle'); if (lt) lt.textContent = currentLang === 'ar' ? 'EN' : 'عربي';
  // Refresh GSAP ScrollTrigger if active
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

function formatPrice(p) { return currentLang === 'ar' ? p + ' ج.س' : 'SDG ' + p; }

// ================= تحميل البيانات =================
async function loadProducts() {
  const wrap = qs('#productsGrid');
  if (!wrap) return;
  wrap.innerHTML = Array.from({ length: 8 }).map(() => '<div class="animate-pulse rounded-2xl bg-white/5 h-64 border border-white/5"></div>').join('');
  try {
    const resp = await fetchJSON(API + '/products');
    const arr = resp.data || resp;
    wrap.innerHTML = '';
    arr.forEach(p => {
      const card = ce('div', 'product group reveal');
      card.setAttribute('data-pid', p.id);
      card.setAttribute('data-tilt', '');
      card.setAttribute('data-tilt-max', '8');
      card.setAttribute('data-tilt-speed', '400');
      card.setAttribute('data-tilt-glare', 'true');
      card.setAttribute('data-tilt-max-glare', '0.2');

      card.innerHTML = `
        <div class="overflow-hidden rounded-2xl mb-4 aspect-[4/5] relative shadow-2xl">
          <img loading="lazy" decoding="async" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" src="${p.image || 'https://via.placeholder.com/600x400?text=Rose+Gift'}" alt="${p.name}" />
          <div class="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/20 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <button class="cta w-full py-2.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md bg-white/10 border border-white/20 hover:bg-accent hover:text-primary" data-pid="${p.id}" data-i18n="product.add">${translations['product.add'] || 'Add to Cart'}</button>
          </div>
        </div>
        <div class="text-right px-1">
          <h4 class="font-semibold text-white/90 mb-1 line-clamp-1">${p.name}</h4>
          <p class="text-accent font-bold text-lg">${formatPrice(p.price)}</p>
        </div>`;
      wrap.appendChild(card);
    });
    // Init Tilt
    if (window.VanillaTilt) VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
  } catch (e) { console.error(e); wrap.innerHTML = '<p class="text-center text-sm text-red-300">تعذر تحميل المنتجات</p>'; }
}

async function loadCategories() {
  const wrap = qs('#categoriesGrid'); if (!wrap) return;
  wrap.innerHTML = '';
  try {
    const resp = await fetchJSON(API + '/categories');
    const arr = resp.data || [];
    if (!arr.length) { wrap.innerHTML = '<p class="text-sm opacity-60">لا توجد فئات بعد</p>'; return; }
    arr.forEach((c, i) => {
      const card = ce('a', 'group relative overflow-hidden rounded-3xl p-6 h-64 border border-white/5 bg-white/5 backdrop-blur-sm flex flex-col justify-end transition-all duration-500 hover:border-accent/30 reveal');
      card.href = '#products';
      card.setAttribute('data-cat-id', c.id);
      // Stagger categories with different sizes for bento look
      if (i % 3 === 0) card.classList.add('md:col-span-2');

      card.innerHTML = `
        ${c.image ? `
          <div class="absolute inset-0 z-0">
            <img src="${c.image}" class="w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700" alt="${c.name}">
            <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent"></div>
          </div>
        ` : `
          <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
             <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>
          </div>
        `}
        <div class="relative z-10">
          <div class="text-xs font-bold uppercase tracking-tighter text-accent/80 mb-1">${c.slug || 'Category'}</div>
          <h4 class="text-2xl font-bold text-white group-hover:text-accent transition-colors">${c.name}</h4>
          <div class="mt-4 w-8 h-1 bg-accent/40 group-hover:w-16 transition-all duration-500"></div>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>`;
      wrap.appendChild(card);
    });
  } catch (e) { console.error('loadCategories', e); wrap.innerHTML = '<p class="text-sm text-red-400">تعذر تحميل الفئات</p>'; }
}

// ================= Banners =================
async function loadBanners() {
  const wrap = qs('#bannersDisplay');
  if (!wrap) return;
  try {
    const resp = await fetchJSON(API + '/banners');
    const banners = resp.data || [];
    wrap.innerHTML = '';
    if (banners.length === 0) {
      wrap.parentElement.style.display = 'none';
      return;
    }
    banners.forEach((b, i) => {
      const card = ce('div', 'group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-accent/20 transition-all duration-700 cursor-pointer reveal');
      const isWide = i === 0 && banners.length > 2;
      if (isWide) card.classList.add('md:col-span-2');
      card.innerHTML = `
        <div class="aspect-[16/9] ${isWide ? 'md:aspect-[21/9]' : ''} overflow-hidden">
          ${b.image ? `<img src="${b.image}" alt="${b.title || ''}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />` : '<div class="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20"></div>'}
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent flex flex-col justify-end p-6 md:p-8">
          ${b.title ? `<h4 class="text-2xl md:text-3xl font-brand text-white mb-2 drop-shadow-lg">${b.title}</h4>` : ''}
          ${b.subtitle ? `<p class="text-white/70 text-sm md:text-base max-w-md">${b.subtitle}</p>` : ''}
        </div>
        <div class="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent/20 backdrop-blur-md text-accent text-xs font-bold">\u0639\u0631\u0636 \u062e\u0627\u0635</div>
      `;
      wrap.appendChild(card);
    });
  } catch (e) {
    console.warn('loadBanners', e);
    wrap.parentElement.style.display = 'none';
  }
}

async function loadFaq() {
  const wrap = qs('#faqList'); if (!wrap) return;
  wrap.innerHTML = '';
  try {
    const resp = await fetchJSON(API + '/faqs');
    (resp.data || resp || []).forEach(f => {
      const det = ce('details'); det.classList.add('reveal');
      const sum = ce('summary'); sum.textContent = f.question; det.appendChild(sum);
      const ans = ce('div', 'mt-2 text-sm opacity-80'); ans.textContent = f.answer; det.appendChild(ans);
      wrap.appendChild(det);
    });
  } catch (e) { wrap.innerHTML = '<p class="text-sm">Failed FAQ</p>'; }
}

async function loadSettings() {
  try {
    const resp = await fetchJSON(API + '/settings'); const map = {}; (resp.data || []).forEach(r => map[r.key_name] = r.value_text);
    if (map.hero_heading) { const h = qs('#hero h2'); if (h) h.textContent = map.hero_heading; }
    if (map.hero_subheading) { const p = qs('#hero p'); if (p) p.textContent = map.hero_subheading; }
    // About section
    const aboutHtml = map.about_html || '';
    const aboutEl = qs('#aboutContent'); if (aboutEl) aboutEl.innerHTML = aboutHtml;
    // Contact channels (icons-only buttons)
    const channelsWrap = qs('#contactChannels');
    if (channelsWrap) {
      channelsWrap.innerHTML = '';
      const phone = map.contact_phone || '';
      const email = map.contact_email || '';
      const socials = [['Facebook', 'social_facebook'], ['Instagram', 'social_instagram'], ['WhatsApp', 'social_whatsapp'], ['Twitter', 'social_twitter']];

      const icons = {
        phone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16.5v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.45 19.45 0 0 1 3.57 9.81 19.86 19.86 0 0 1 .5 1.99 2 2 0 0 1 2.5-.18h3a2 2 0 0 1 2 1.72c.12.99.36 1.96.7 2.88a2 2 0 0 1-.45 2.11L6.91 8.91a16 16 0 0 0 7.18 7.18l1.39-1.39a2 2 0 0 1 2.11-.45c.92.34 1.89.58 2.88.7A2 2 0 0 1 21 16.5z" fill="currentColor"/></svg>`,
        email: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11zM5.2 6.7l6.2 4.2 6.2-4.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        facebook: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.2v-3h2.2V9.1c0-2.2 1.3-3.4 3.3-3.4.96 0 1.96.17 1.96.17v2.1h-1.07c-1.05 0-1.38.66-1.38 1.34V12h2.36l-.38 3h-1.98v7A10 10 0 0 0 22 12z" fill="currentColor"/></svg>`,
        instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.2"/><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>`,
        whatsapp: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.07a9 9 0 1 0-2.48 5.79L21 21l-1.62-4.76A8.93 8.93 0 0 0 21 12.07z" fill="currentColor"/><path d="M16.2 13.7c-.3-.15-1.78-.87-2.06-.97-.28-.1-.48-.15-.69.15s-.79.97-.97 1.17c-.18.2-.36.22-.66.07-.3-.15-1.27-.47-2.42-1.48-.9-.76-1.51-1.7-1.69-2.01-.18-.3-.02-.46.13-.61.13-.13.3-.33.45-.5.15-.17.2-.28.3-.47.1-.18.05-.34-.03-.49-.08-.15-.69-1.66-.95-2.28-.25-.6-.5-.52-.69-.53-.18-.01-.39-.01-.6-.01s-.49.07-.75.34c-.26.27-1 1-1 2.46 0 1.47 1.03 2.9 1.17 3.1.15.2 2.02 3.08 4.9 4.32 2.88 1.24 2.88.83 3.4.78.52-.05 1.78-.72 2.03-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.18-.58-.33z" fill="#fff"/></svg>`,
        twitter: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 5.92c-.64.28-1.32.46-2.04.55.73-.44 1.28-1.13 1.54-1.96-.68.4-1.44.68-2.25.84A3.5 3.5 0 0 0 12 8.5v.45A9.93 9.93 0 0 1 3.16 4.1a3.5 3.5 0 0 0 1.08 4.67c-.53-.02-1.03-.16-1.47-.4v.04c0 1.7 1.2 3.13 2.8 3.46-.5.14-1.02.18-1.56.07.44 1.37 1.72 2.37 3.23 2.39A7.02 7.02 0 0 1 2 18.54a9.94 9.94 0 0 0 5.38 1.58c6.45 0 9.98-5.35 9.98-9.98v-.45c.68-.5 1.2-1.13 1.64-1.85-.6.28-1.25.48-1.92.57z" fill="currentColor"/></svg>`
      };

      const brandBg = {
        phone: 'linear-gradient(135deg, rgba(96,165,250,0.12), rgba(99,102,241,0.12))',
        email: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(234,179,8,0.08))',
        facebook: 'linear-gradient(135deg,#1877F2,#155dbb)',
        instagram: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af)',
        whatsapp: 'linear-gradient(135deg,#25D366,#16a34a)',
        twitter: 'linear-gradient(135deg,#1DA1F2,#0d8be6)'
      };

      function makeCard(href, title, sub, iconSvg, isExternal, bg) {
        const a = ce('a', 'group block p-3 rounded-2xl bg-white/5 hover:shadow-lg transition-transform transform hover:-translate-y-1 text-center flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent/30');
        a.href = href || '#'; a.setAttribute('aria-label', title); a.title = title;
        if (isExternal) { a.target = '_blank'; a.rel = 'noopener'; }
        const iconWrap = ce('div', 'w-12 h-12 flex items-center justify-center rounded-xl mb-1 transition-transform duration-200');
        if (bg) iconWrap.style.background = bg; else iconWrap.classList.add('bg-white/6');
        // allow a subtle icon scale on hover
        iconWrap.classList.add('group-hover:scale-110');
        iconWrap.style.display = 'flex'; iconWrap.style.alignItems = 'center'; iconWrap.style.justifyContent = 'center';
        iconWrap.innerHTML = iconSvg;
        const t = ce('div', 'text-sm font-semibold'); t.textContent = title;
        const s = ce('div', 'text-xs opacity-70'); s.textContent = sub;
        a.appendChild(iconWrap); a.appendChild(t); a.appendChild(s);
        return a;
      }

      // Build cards (phone, email, socials)
      if (phone) channelsWrap.appendChild(makeCard('tel:' + phone, currentLang === 'ar' ? 'هاتف' : 'Phone', phone, icons.phone, false, brandBg.phone));
      if (email) channelsWrap.appendChild(makeCard('mailto:' + email, currentLang === 'ar' ? 'البريد' : 'Email', email, icons.email, false, brandBg.email));
      socials.forEach(s => {
        const key = s[1]; const name = s[0].toLowerCase();
        if (map[key]) {
          const url = map[key]; const label = currentLang === 'ar' ? s[0] : s[0]; const bg = brandBg[name] || null;
          channelsWrap.appendChild(makeCard(url, label, url, icons[name] || icons.facebook, true, bg));
        }
      });

      // If no channels configured
      if (!channelsWrap.children.length) channelsWrap.innerHTML = '<p class="text-sm opacity-60">لم تتم إضافة وسائل تواصل بعد</p>';

      // Staggered entrance animation for the generated cards
      const kids = Array.from(channelsWrap.children);
      kids.forEach((kid, i) => {
        kid.style.opacity = '0';
        kid.style.transform = 'translateY(8px)';
        kid.style.transition = 'opacity .45s ease, transform .45s cubic-bezier(.2,.9,.3,1)';
        setTimeout(() => { kid.style.opacity = '1'; kid.style.transform = 'none'; }, 80 * i);
      });
    }
  } catch (e) { console.warn('settings', e); }
}

// ================= السلة =================
async function addToCart(productId) {
  const btn = document.querySelector(`button[data-pid="${productId}"]`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="inline-block animate-spin mr-2">◌</span> ${translations['misc.loading'] || '...'}`;
  }
  try {
    const res = await fetchJSON(API + '/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, productId, qty: 1 }) });
    if (res.success) {
      toast(translations['cart.added'] || 'Added');
      const countEl = qs('#cartCount');
      if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
      // Confetti burst!
      if (window.confetti) {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 }, colors: ['#ff9de6', '#3f0050', '#ffffff'] });
      }
    } else toast(translations['cart.error'] || 'Cart error');
  } catch (e) { toast(translations['cart.error'] || 'Cart error'); }
  finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = translations['product.add'] || 'Add to Cart';
    }
  }
}

async function updateCartCount() {
  try {
    const resp = await fetchJSON(API + '/cart/' + sessionId);
    const arr = (resp.data || resp);
    const count = arr.length || 0;
    if (qs('#cartCount')) qs('#cartCount').textContent = count;
    if (qs('#cartCountBadge')) qs('#cartCountBadge').textContent = count;
  } catch (e) { /* ignore */ }
}

async function loadCartItems() {
  const container = qs('#cartItems'); if (!container) return;
  // If we already have items, don't clear them completely to avoid flicker
  if (!container.children.length) {
    container.innerHTML = '<div class="flex flex-col items-center justify-center h-40 opacity-40 animate-pulse"><div class="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-sm">' + (translations['misc.loading'] || '...') + '</p></div>';
  }
  try {
    const resp = await fetchJSON(API + '/cart/' + sessionId);
    const items = resp.data || resp;
    const count = items.length || 0;
    if (qs('#cartCountBadge')) qs('#cartCountBadge').textContent = count;

    if (!items.length) {
      container.innerHTML = `<div class="flex flex-col items-center justify-center h-60 text-center opacity-40">
        <div class="text-6xl mb-4">🛍️</div>
        <p class="text-lg font-bold">${translations['cart.empty'] || 'Empty'}</p>
        <p class="text-xs mt-2">تسوق الآن وأضف بعض الهدايا الجميلة</p>
      </div>`;
      qs('#cartTotal').textContent = '0';
      return;
    }

    container.innerHTML = ''; let total = 0;
    items.forEach(it => {
      total += (it.price || 0) * (it.quantity || 1);
      const row = ce('div', 'group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-4 transition-all duration-300');
      row.innerHTML = `
        <div class="relative overflow-hidden rounded-xl w-16 h-16 flex-shrink-0 border border-white/10">
          <img src="${it.image || 'https://via.placeholder.com/60'}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-sm truncate mb-1">${it.name}</div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <input type="number" min="1" value="${it.quantity}" data-id="${it.id}" class="qty-input w-12 bg-white/5 border border-white/10 rounded-lg py-1 text-center text-xs focus:ring-1 focus:ring-accent/50 outline-none" />
              <span class="text-accent font-bold text-sm">${formatPrice(it.price)}</span>
            </div>
            <button class="remove-item p-2 text-white/20 hover:text-rose-400 transition-colors" data-id="${it.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
      container.appendChild(row);
    });
    qs('#cartTotal').textContent = formatPrice(total.toFixed(2));
    container.querySelectorAll('.qty-input').forEach(inp => inp.addEventListener('change', debounce(updateQuantities, 400)));
    container.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', (e) => {
      const row = e.target.closest('.group');
      if (row) row.style.opacity = '0.5';
      removeCartItem(btn.getAttribute('data-id'));
    }));
  } catch (e) { container.innerHTML = '<p class="text-center text-sm text-red-300">خطأ في تحميل السلة</p>'; }
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

async function updateQuantities() {
  const inputs = [...document.querySelectorAll('.qty-input')]; const items = inputs.map(i => ({ id: i.getAttribute('data-id'), quantity: parseInt(i.value) || 1 }));
  try { await fetchJSON(API + '/cart/' + sessionId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) }); updateCartCount(); loadCartItems(); }
  catch (e) { toast('خطأ في التحديث'); }
}

async function removeCartItem(id) {
  try { await fetchJSON(API + `/cart/${sessionId}/item/${id}`, { method: 'DELETE' }); loadCartItems(); updateCartCount(); }
  catch (e) { toast('خطأ في الحذف'); }
}

function openCart() { const d = qs('#cartDrawer'); if (!d) return; d.classList.remove('pointer-events-none'); qs('#cartOverlay').classList.add('opacity-100'); qs('#cartPanel').classList.remove('translate-x-full'); loadCartItems(); }
function closeCart() { const d = qs('#cartDrawer'); if (!d) return; qs('#cartOverlay').classList.remove('opacity-100'); qs('#cartPanel').classList.add('translate-x-full'); setTimeout(() => d.classList.add('pointer-events-none'), 300); }

// ================= واجهة واحداث =================
function toast(msg) { let t = qs('#_toast'); if (!t) { t = ce('div', 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full shadow-soft text-sm'); t.id = '_toast'; document.body.appendChild(t); } t.textContent = msg; t.style.opacity = '1'; setTimeout(() => { t.style.opacity = '0'; }, 2000); }

function initLangToggle() {
  const btn = qs('#langToggle'); if (!btn) return; btn.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar'; localStorage.setItem('rg_lang', currentLang); loadTranslations().then(() => {
      applyTranslations(); // لا نعيد بناء المنتجات لتقليل الوميض، فقط نحدث نص الأزرار
      document.querySelectorAll('button[data-pid][data-i18n="product.add"]').forEach(b => { const k = b.getAttribute('data-i18n'); if (translations[k]) b.textContent = translations[k]; }); loadCartItems();
    });
  });
}

function initForms() {
  const contactForm = qs('#contactForm'); if (contactForm) { contactForm.addEventListener('submit', async e => { e.preventDefault(); const fd = new FormData(contactForm); const payload = Object.fromEntries(fd.entries()); try { const resp = await fetchJSON(API + '/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); qs('#contactStatus').textContent = resp.success ? translations['contact.success'] : translations['contact.error']; if (resp.success) contactForm.reset(); } catch (err) { qs('#contactStatus').textContent = translations['contact.error']; } }); }
  const newsletterForm = qs('#newsletterForm'); if (newsletterForm) { newsletterForm.addEventListener('submit', async e => { e.preventDefault(); const email = newsletterForm.email.value.trim(); if (!email) return; try { const resp = await fetchJSON(API + '/newsletter/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }); qs('#newsletterStatus').textContent = resp.success ? translations['newsletter.success'] : translations['newsletter.error']; if (resp.success) newsletterForm.reset(); } catch (err) { qs('#newsletterStatus').textContent = translations['newsletter.error']; } }); }
}

function initGlobalEvents() {
  document.addEventListener('click', e => {
    const addBtn = e.target.closest('button[data-pid]');
    if (addBtn) { const pid = +addBtn.getAttribute('data-pid'); addToCart(pid); return; }

    if (e.target.id === 'cartBtn') { openCart(); }
    if (e.target.id === 'closeCart' || e.target.id === 'cartOverlay') { closeCart(); }

    if (e.target.id === 'checkoutBtn') {
      const f = qs('#checkoutForm');
      const a = qs('#cartActions');
      if (f && a) {
        f.classList.remove('hidden');
        a.classList.add('hidden');
      }
    }

    if (e.target.id === 'backToCart') {
      const f = qs('#checkoutForm');
      const a = qs('#cartActions');
      if (f && a) {
        f.classList.add('hidden');
        a.classList.remove('hidden');
      }
    }

    if (e.target.id === 'checkoutSubmit') { doCheckout(); }
  });
}

async function doCheckout() {
  const name = qs('#coName')?.value.trim();
  const email = qs('#coEmail')?.value.trim();
  const phone = qs('#coPhone')?.value.trim();
  const address = qs('#coAddress')?.value.trim();
  const note = qs('#coNote')?.value.trim();
  const status = qs('#checkoutStatus');
  const btn = qs('#checkoutSubmit');

  if (!name || !phone || !address) {
    status.textContent = currentLang === 'ar' ? 'يرجى تعبئة الاسم والهاتف والعنوان' : 'Please fill name, phone, address';
    status.className = 'text-[10px] text-center text-rose-400 mt-2';
    return;
  }

  if (btn) btn.disabled = true;
  status.textContent = currentLang === 'ar' ? 'جاري تأكيد الطلب...' : 'Placing order...';
  status.className = 'text-[10px] text-center text-white/60 mt-2';

  try {
    const resp = await fetchJSON(API + '/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, customer: { name, email, address, phone, note } }) });
    if (resp.success) {
      status.textContent = currentLang === 'ar' ? `تم إنشاء الطلب بنجاح!` : `Order created successfully!`;
      status.className = 'text-xs text-center text-emerald-400 font-bold mt-2';
      // Massive Confetti!
      if (window.confetti) {
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff9de6', '#ffffff'] });
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff9de6', '#ffffff'] });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
      }
      setTimeout(() => {
        closeCart();
        location.reload(); // Simple way to clear cart and show success (optional)
      }, 4000);
    } else {
      status.textContent = currentLang === 'ar' ? 'تعذر إنشاء الطلب' : 'Checkout failed';
      if (btn) btn.disabled = false;
    }
  } catch (err) {
    status.textContent = currentLang === 'ar' ? 'خطأ في إتمام الشراء' : 'Checkout error';
    if (btn) btn.disabled = false;
  }
}

// ================= Three.js Magic =================
function init3D() {
  const canvas = qs('#three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Background Particles (Stars)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) { starPos[i] = (Math.random() - 0.5) * 40; }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff, transparent: true, opacity: 0.5 });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Floating Gift Boxes & Hearts Group
  const group = new THREE.Group();
  scene.add(group);

  // Helper to create a procedural Gift Box
  function createGiftBox(color) {
    const boxGroup = new THREE.Group();
    // The Box
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshPhongMaterial({ color: color, shininess: 80 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    boxGroup.add(box);
    // Ribbon
    const ribGeo1 = new THREE.BoxGeometry(1.05, 0.2, 1.05);
    const ribGeo2 = new THREE.BoxGeometry(0.2, 1.05, 1.05);
    const ribMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 });
    boxGroup.add(new THREE.Mesh(ribGeo1, ribMat));
    boxGroup.add(new THREE.Mesh(ribGeo2, ribMat));
    return boxGroup;
  }

  // Add multiple gifts - permanently visible
  for (let i = 0; i < 8; i++) {
    const gift = createGiftBox(i % 2 === 0 ? 0x3f0050 : 0xff9de6);
    gift.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10);
    gift.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    gift.userData = { speed: 0.003 + Math.random() * 0.008 };
    group.add(gift);
  }

  // Floating Hearts (using a shape)
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo(0, 0.5, 0.5, 1, 1, 1);
  heartShape.bezierCurveTo(1.5, 1, 2, 0.5, 2, 0);
  heartShape.bezierCurveTo(2, -0.5, 1.5, -1, 0, -2);
  heartShape.bezierCurveTo(-1.5, -1, -2, -0.5, -2, 0);
  heartShape.bezierCurveTo(-2, 0.5, -1.5, 1, -1, 1);
  heartShape.bezierCurveTo(-0.5, 1, 0, 0.5, 0, 0);
  const heartExtrude = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, heartExtrude);
  const heartMat = new THREE.MeshPhongMaterial({ color: 0xff0044, shininess: 100 });

  for (let i = 0; i < 6; i++) {
    const heart = new THREE.Mesh(heartGeo, heartMat.clone());
    heart.scale.set(0.15, 0.15, 0.15);
    heart.rotation.z = Math.PI;
    heart.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8);
    heart.userData = { speed: 0.003 + Math.random() * 0.008 };
    group.add(heart);
  }



  const light1 = new THREE.PointLight(0xff9de6, 30, 100); light1.position.set(10, 10, 10); scene.add(light1);
  const light2 = new THREE.PointLight(0x3f0050, 30, 100); light2.position.set(-10, -10, 10); scene.add(light2);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  camera.position.z = 12;

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  });

  function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.0003;

    group.children.forEach(child => {
      const ud = child.userData;
      child.rotation.x += ud.speed;
      child.rotation.y += ud.speed * 0.5;
      child.position.y += Math.sin(Date.now() * 0.001 + child.position.x) * 0.002;
    });

    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ================= Reveal Animations =================
function initScrollReveal() {
  if (!window.gsap || !window.ScrollTrigger) return;
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power2.out"
    });
  });
}

// Sparkle Cursor (Enhanced)=================
function initSparkleCursor() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed'; canvas.style.top = '0'; canvas.style.left = '0';
  canvas.style.pointerEvents = 'none'; canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  class Particle {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 2;
      this.speedY = (Math.random() - 0.5) * 2;
      this.color = `hsl(${Math.random() * 60 + 300}, 100%, 80%)`;
      this.alpha = 1;
    }
    update() { this.x += this.speedX; this.y += this.speedY; this.alpha -= 0.02; }
    draw() {
      ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
  }

  window.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 2; i++) particles.push(new Particle(e.clientX, e.clientY));
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.alpha > 0);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// ================= تشغيل =================
async function bootstrap() {
  await loadTranslations(); applyTranslations(); initLangToggle(); initForms(); initGlobalEvents();
  init3D();
  initSparkleCursor();
  await Promise.all([loadProducts(), loadCategories(), loadBanners(), loadFaq(), loadSettings(), updateCartCount()]);

  // GSAP Animations
  if (window.gsap) {
    gsap.from("#hero .animate-fade-in-up > *", { opacity: 0, scale: 0.9, y: 50, duration: 1.2, stagger: 0.3, ease: "back.out(1.7)" });
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.section-title').forEach(title => {
      gsap.from(title, { scrollTrigger: { trigger: title, start: "top 90%" }, opacity: 0, scaleX: 0, transformOrigin: "right", duration: 1, ease: "power4.out" });
    });
  }

  const adminLink = qs('#adminLink');
  if (adminLink) { const hasToken = !!localStorage.getItem('rg_admin_token'); adminLink.href = hasToken ? '/admin/dashboard.html' : '/admin/login.html'; }
  initScrollReveal(); qs('#year') && (qs('#year').textContent = new Date().getFullYear()); document.body.classList.add('ready');
}

bootstrap().catch(err => { console.error('bootstrap', err); document.body.classList.add('ready'); });
