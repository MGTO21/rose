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

function qs(sel){ return document.querySelector(sel); }
function ce(tag, cls){ const el = document.createElement(tag); if(cls) el.className = cls; return el; }

async function fetchJSON(url, opts={}) { const res = await fetch(url, opts); if(!res.ok) throw new Error(res.status+' '+url); return res.json(); }

async function loadTranslations(){ translations = await fetchJSON(langFiles[currentLang]); }

function applyTranslations(){
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', currentLang === 'ar');
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const k=el.getAttribute('data-i18n'); if(translations[k]) el.textContent=translations[k]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ const k=el.getAttribute('data-i18n-placeholder'); if(translations[k]) el.setAttribute('placeholder', translations[k]); });
  document.title = translations['site.title'] || document.title;
  const lt = qs('#langToggle'); if(lt) lt.textContent = currentLang==='ar' ? 'EN' : 'عربي';
}

function formatPrice(p){ return currentLang==='ar' ? p+' ج.س' : 'SDG '+p; }

// ================= تحميل البيانات =================
async function loadProducts(){
  const wrap = qs('#productsGrid');
  if(!wrap) return;
  wrap.innerHTML = Array.from({length:8}).map(()=>'<div class="animate-pulse rounded-xl bg-white/5 h-48"></div>').join('');
  try {
    const resp = await fetchJSON(API+'/products');
    const arr = resp.data || resp;
    wrap.innerHTML='';
    arr.forEach(p => {
      const card = ce('div','product reveal shine-border');
      card.setAttribute('data-pid', p.id);
      card.innerHTML = `
        <div class="overflow-hidden rounded-lg mb-3 aspect-[4/3] relative group">
          <img loading="lazy" decoding="async" class="w-full h-full object-cover transition duration-700 group-hover:scale-110" src="${p.image || 'https://via.placeholder.com/600x400?text=Rose+Gift'}" alt="${p.name}" />
          <div class="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/40 to-transparent"></div>
        </div>
        <h4 class="font-semibold mb-1 text-lg">${p.name}</h4>
        <p class="text-accent font-bold mb-4">${formatPrice(p.price)}</p>
        <button class="cta w-full text-sm" data-pid="${p.id}" data-i18n="product.add">${translations['product.add']||'Add to Cart'}</button>`;
      wrap.appendChild(card);
    });
  } catch(e){ console.error(e); wrap.innerHTML='<p class="text-center text-sm text-red-300">تعذر تحميل المنتجات</p>'; }
}

async function loadCategories(){
  const wrap = qs('#categoriesGrid'); if(!wrap) return;
  wrap.innerHTML='';
  try {
    const resp = await fetchJSON(API+'/categories');
    const arr = resp.data || [];
    if(!arr.length){ wrap.innerHTML = '<p class="text-sm opacity-60">لا توجد فئات بعد</p>'; return; }
    arr.forEach(c => {
      const card = ce('a','card flex flex-col items-start gap-3 p-4 hover:shadow-lg transition');
      card.href = '#products';
      card.setAttribute('data-cat-id', c.id);
      card.innerHTML = `<div class="font-semibold text-lg">${c.name}</div><div class="text-xs opacity-70">${c.slug||''}</div>`;
      wrap.appendChild(card);
    });
  } catch(e){ console.error('loadCategories', e); wrap.innerHTML='<p class="text-sm text-red-400">تعذر تحميل الفئات</p>'; }
}

async function loadFaq(){
  const wrap = qs('#faqList'); if(!wrap) return;
  wrap.innerHTML='';
  try {
    const resp = await fetchJSON(API+'/faqs');
    (resp.data||resp||[]).forEach(f => {
      const det = ce('details'); det.classList.add('reveal');
      const sum = ce('summary'); sum.textContent=f.question; det.appendChild(sum);
      const ans = ce('div','mt-2 text-sm opacity-80'); ans.textContent=f.answer; det.appendChild(ans);
      wrap.appendChild(det);
    });
  } catch(e){ wrap.innerHTML='<p class="text-sm">Failed FAQ</p>'; }
}

async function loadSettings(){
  try {
    const resp = await fetchJSON(API+'/settings'); const map={}; (resp.data||[]).forEach(r=>map[r.key_name]=r.value_text);
    if(map.hero_heading){ const h=qs('#hero h2'); if(h) h.textContent=map.hero_heading; }
    if(map.hero_subheading){ const p=qs('#hero p'); if(p) p.textContent=map.hero_subheading; }
    // About section
    const aboutHtml = map.about_html || '';
    const aboutEl = qs('#aboutContent'); if(aboutEl) aboutEl.innerHTML = aboutHtml;
    // Contact channels (icons-only buttons)
    const channelsWrap = qs('#contactChannels');
    if (channelsWrap) {
      channelsWrap.innerHTML = '';
      const phone = map.contact_phone || '';
      const email = map.contact_email || '';
      const socials = [ ['Facebook','social_facebook'], ['Instagram','social_instagram'], ['WhatsApp','social_whatsapp'], ['Twitter','social_twitter'] ];

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

      function makeCard(href, title, sub, iconSvg, isExternal, bg){
        const a = ce('a','group block p-3 rounded-2xl bg-white/5 hover:shadow-lg transition-transform transform hover:-translate-y-1 text-center flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent/30');
        a.href = href || '#'; a.setAttribute('aria-label', title); a.title = title;
        if(isExternal){ a.target = '_blank'; a.rel = 'noopener'; }
        const iconWrap = ce('div','w-12 h-12 flex items-center justify-center rounded-xl mb-1 transition-transform duration-200');
        if(bg) iconWrap.style.background = bg; else iconWrap.classList.add('bg-white/6');
        // allow a subtle icon scale on hover
        iconWrap.classList.add('group-hover:scale-110');
        iconWrap.style.display = 'flex'; iconWrap.style.alignItems = 'center'; iconWrap.style.justifyContent = 'center';
        iconWrap.innerHTML = iconSvg;
        const t = ce('div','text-sm font-semibold'); t.textContent = title;
        const s = ce('div','text-xs opacity-70'); s.textContent = sub;
        a.appendChild(iconWrap); a.appendChild(t); a.appendChild(s);
        return a;
      }

      // Build cards (phone, email, socials)
      if (phone) channelsWrap.appendChild(makeCard('tel:'+phone, currentLang==='ar'?'هاتف':'Phone', phone, icons.phone, false, brandBg.phone));
      if (email) channelsWrap.appendChild(makeCard('mailto:'+email, currentLang==='ar'?'البريد':'Email', email, icons.email, false, brandBg.email));
      socials.forEach(s => {
        const key = s[1]; const name = s[0].toLowerCase();
        if (map[key]){
          const url = map[key]; const label = currentLang==='ar'? s[0] : s[0]; const bg = brandBg[name] || null;
          channelsWrap.appendChild(makeCard(url, label, url, icons[name] || icons.facebook, true, bg));
        }
      });

      // If no channels configured
      if (!channelsWrap.children.length) channelsWrap.innerHTML = '<p class="text-sm opacity-60">لم تتم إضافة وسائل تواصل بعد</p>';

      // Staggered entrance animation for the generated cards
      const kids = Array.from(channelsWrap.children);
      kids.forEach((kid, i)=>{
        kid.style.opacity = '0';
        kid.style.transform = 'translateY(8px)';
        kid.style.transition = 'opacity .45s ease, transform .45s cubic-bezier(.2,.9,.3,1)';
        setTimeout(()=>{ kid.style.opacity='1'; kid.style.transform='none'; }, 80 * i);
      });
    }
  } catch(e){ console.warn('settings', e); }
}

// ================= السلة =================
async function addToCart(productId){
  try {
    const res = await fetchJSON(API+'/cart', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId, productId, qty:1 })});
    if(res.success){ toast(translations['cart.added']||'Added'); updateCartCount(); }
    else toast(translations['cart.error']||'Cart error');
  } catch(e){ toast(translations['cart.error']||'Cart error'); }
}

async function updateCartCount(){
  try { const resp = await fetchJSON(API+'/cart/'+sessionId); const arr=(resp.data||resp); qs('#cartCount').textContent = arr.length || 0; } catch(e){ /* ignore */ }
}

async function loadCartItems(){
  const container = qs('#cartItems'); if(!container) return;
  container.innerHTML='<p class="text-center text-sm opacity-60">'+(translations['misc.loading']||'...')+'</p>';
  try {
    const resp = await fetchJSON(API+'/cart/'+sessionId); const items=resp.data||resp;
    if(!items.length){ container.innerHTML='<p class="text-center text-sm opacity-60">'+(translations['cart.empty']||'Empty')+'</p>'; qs('#cartTotal').textContent='0'; return; }
    container.innerHTML=''; let total=0;
    items.forEach(it=>{ total+=(it.price||0)*(it.quantity||1); const row=ce('div','flex items-center gap-3 border border-white/10 rounded-lg p-3 text-sm relative');
      row.innerHTML=`<img loading="lazy" decoding="async" src="${it.image||'https://via.placeholder.com/60'}" alt="${it.name}" class="w-14 h-14 object-cover rounded-md" />
      <div class="flex-1"><div class="font-semibold mb-1">${it.name}</div>
      <div class="flex items-center gap-2 opacity-80"><input type="number" min="1" value="${it.quantity}" data-id="${it.id}" class="qty-input w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-center text-xs" />
      <span class="text-accent font-bold text-xs">${formatPrice(it.price)}</span></div></div>
      <button class="remove-item text-xs text-red-300 hover:text-red-400" data-id="${it.id}">${translations['cart.remove']||'Remove'}</button>`; container.appendChild(row); });
    qs('#cartTotal').textContent=formatPrice(total.toFixed(2));
    container.querySelectorAll('.qty-input').forEach(inp=>inp.addEventListener('change', debounce(updateQuantities,400)));
  } catch(e){ container.innerHTML='<p class="text-center text-sm text-red-300">خطأ في تحميل السلة</p>'; }
}

function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }

async function updateQuantities(){
  const inputs=[...document.querySelectorAll('.qty-input')]; const items=inputs.map(i=>({ id:i.getAttribute('data-id'), quantity:parseInt(i.value)||1 }));
  try { await fetchJSON(API+'/cart/'+sessionId,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ items }) }); updateCartCount(); loadCartItems(); }
  catch(e){ toast('خطأ في التحديث'); }
}

async function removeCartItem(id){
  try { await fetchJSON(API+`/cart/${sessionId}/item/${id}`, { method:'DELETE' }); loadCartItems(); updateCartCount(); }
  catch(e){ toast('خطأ في الحذف'); }
}

function openCart(){ const d=qs('#cartDrawer'); if(!d) return; d.classList.remove('pointer-events-none'); qs('#cartOverlay').classList.add('opacity-100'); qs('#cartPanel').classList.remove('translate-x-full'); loadCartItems(); }
function closeCart(){ const d=qs('#cartDrawer'); if(!d) return; qs('#cartOverlay').classList.remove('opacity-100'); qs('#cartPanel').classList.add('translate-x-full'); setTimeout(()=>d.classList.add('pointer-events-none'),300); }

// ================= واجهة واحداث =================
function toast(msg){ let t=qs('#_toast'); if(!t){ t=ce('div','fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full shadow-soft text-sm'); t.id='_toast'; document.body.appendChild(t);} t.textContent=msg; t.style.opacity='1'; setTimeout(()=>{ t.style.opacity='0'; },2000); }

function initLangToggle(){ const btn=qs('#langToggle'); if(!btn) return; btn.addEventListener('click',()=>{ currentLang=currentLang==='ar'?'en':'ar'; localStorage.setItem('rg_lang', currentLang); loadTranslations().then(()=>{ applyTranslations(); // لا نعيد بناء المنتجات لتقليل الوميض، فقط نحدث نص الأزرار
  document.querySelectorAll('button[data-pid][data-i18n="product.add"]').forEach(b=>{ const k=b.getAttribute('data-i18n'); if(translations[k]) b.textContent=translations[k]; }); loadCartItems(); }); }); }

function initForms(){
  const contactForm=qs('#contactForm'); if(contactForm){ contactForm.addEventListener('submit', async e=>{ e.preventDefault(); const fd=new FormData(contactForm); const payload=Object.fromEntries(fd.entries()); try { const resp=await fetchJSON(API+'/contact',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); qs('#contactStatus').textContent=resp.success?translations['contact.success']:translations['contact.error']; if(resp.success) contactForm.reset(); } catch(err){ qs('#contactStatus').textContent=translations['contact.error']; } }); }
  const newsletterForm=qs('#newsletterForm'); if(newsletterForm){ newsletterForm.addEventListener('submit', async e=>{ e.preventDefault(); const email=newsletterForm.email.value.trim(); if(!email) return; try { const resp=await fetchJSON(API+'/newsletter/subscribe',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) }); qs('#newsletterStatus').textContent=resp.success?translations['newsletter.success']:translations['newsletter.error']; if(resp.success) newsletterForm.reset(); } catch(err){ qs('#newsletterStatus').textContent=translations['newsletter.error']; } }); }
}

function initGlobalEvents(){ document.addEventListener('click', e=>{ const addBtn = e.target.closest('button[data-pid]'); const cardAdd = (!addBtn) ? e.target.closest('.product[data-pid]') : null; if(addBtn){ const pid=+addBtn.getAttribute('data-pid'); addToCart(pid); } else if(cardAdd){ const pid=+cardAdd.getAttribute('data-pid'); addToCart(pid); }
  if(e.target.id==='cartBtn'){ openCart(); }
  if(e.target.id==='closeCart' || e.target.id==='cartOverlay'){ closeCart(); }
  const remBtn=e.target.closest('.remove-item'); if(remBtn){ const id=remBtn.getAttribute('data-id'); removeCartItem(id); }
  if(e.target.id==='checkoutBtn'){ const f=qs('#checkoutForm'); if(f){ f.classList.toggle('hidden'); }}
  if(e.target.id==='checkoutSubmit'){ doCheckout(); }
  }); }

async function doCheckout(){
  const name=qs('#coName')?.value.trim(); const email=qs('#coEmail')?.value.trim(); const phone=qs('#coPhone')?.value.trim(); const altPhone=qs('#coAltPhone')?.value.trim(); const address=qs('#coAddress')?.value.trim(); const note=qs('#coNote')?.value.trim(); const status=qs('#checkoutStatus');
  if(!name||!phone||!address){ status.textContent = currentLang==='ar' ? 'يرجى تعبئة الاسم والهاتف والعنوان' : 'Please fill name, phone, address'; return; }
  status.textContent = currentLang==='ar' ? 'جاري تأكيد الطلب...' : 'Placing order...';
  try{
    const resp = await fetchJSON(API+'/checkout',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ sessionId, customer:{ name, email, address, phone, altPhone, note } }) });
    if(resp.success){
      status.textContent = currentLang==='ar' ? `تم إنشاء الطلب #${resp.orderId}` : `Order #${resp.orderId} created`;
      // Refresh cart UI
      await loadCartItems(); await updateCartCount();
    } else {
      status.textContent = currentLang==='ar' ? 'تعذر إنشاء الطلب' : 'Checkout failed';
    }
  }catch(err){
    status.textContent = currentLang==='ar' ? 'خطأ في إتمام الشراء' : 'Checkout error';
  }
}

function initScrollReveal(){ const observer=new IntersectionObserver(entries=>{ entries.forEach(ent=>{ if(ent.isIntersecting){ ent.target.classList.add('in'); observer.unobserve(ent.target); } }); }, { threshold:0.15 }); document.querySelectorAll('.reveal').forEach(el=>observer.observe(el)); }

// ================= تشغيل =================
async function bootstrap(){
  await loadTranslations(); applyTranslations(); initLangToggle(); initForms(); initGlobalEvents();
  await Promise.all([loadProducts(), loadCategories(), loadFaq(), loadSettings(), updateCartCount()]);
  // تحديث رابط الإدارة حسب حالة التوكن
  const adminLink = qs('#adminLink');
  if(adminLink){ const hasToken = !!localStorage.getItem('rg_admin_token'); adminLink.href = hasToken ? '/admin/dashboard.html' : '/admin/login.html'; }
  initScrollReveal(); qs('#year') && (qs('#year').textContent=new Date().getFullYear()); document.body.classList.add('ready');
}

bootstrap().catch(err=>{ console.error('bootstrap', err); document.body.classList.add('ready'); });
