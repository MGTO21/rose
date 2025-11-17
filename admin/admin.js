const API='/api/admin';
const token=localStorage.getItem('rg_admin_token');
if(!token){ location.href='/admin/login.html'; }
function qs(s){return document.querySelector(s);} function ce(t,c){const e=document.createElement(t); if(c) e.className=c; return e;}
function authHeaders(){ return { 'Content-Type':'application/json', 'Authorization':'Bearer '+token }; }
async function fetchJSON(url,opts={}){ const r=await fetch(url,opts); if(!r.ok) throw new Error(r.status); return r.json(); }

async function loadProducts(){ const box=qs('#productsAdmin'); box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>'; try{ const resp=await fetchJSON(API+'/products',{headers:authHeaders()}); box.innerHTML=''; resp.data.forEach(p=>{ const card=ce('div','card text-sm space-y-2'); card.innerHTML=`<div class='font-semibold'>${p.name}</div><div>${p.price} ج.س</div><input type='number' step='0.01' value='${p.price}' data-id='${p.id}' class='w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs' /><div class='flex gap-2'><button class='updateP cta text-xs px-3' data-id='${p.id}'>تحديث</button><button class='delP text-xs px-3 rounded-full bg-red-500/20 hover:bg-red-500/30'>حذف</button></div>`; card.querySelector('.delP').setAttribute('data-id',p.id); box.appendChild(card); }); }catch(e){ box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل المنتجات</p>'; }}

async function addProductForm(e){ e.preventDefault(); const form=e.target; const fd=new FormData(form); if(!fd.get('name')) return; try { const resp=await fetch(API+'/products',{ method:'POST', headers:{ 'Authorization':'Bearer '+token }, body: fd }); if(!resp.ok) throw new Error('fail'); await resp.json(); form.reset(); loadProducts(); } catch(err){ alert('خطأ رفع المنتج'); }}

async function updateProduct(id){ const inp=document.querySelector(`input[data-id='${id}']`); const price=parseFloat(inp.value||'0'); try{ await fetchJSON(API+'/products/'+id,{ method:'PUT', headers:authHeaders(), body:JSON.stringify({ price }) }); loadProducts(); }catch(e){ alert('خطأ تحديث'); }}
async function deleteProduct(id){ if(!confirm('حذف المنتج؟')) return; try{ await fetchJSON(API+'/products/'+id,{ method:'DELETE', headers:authHeaders() }); loadProducts(); }catch(e){ alert('خطأ حذف'); }}

async function loadFaqs(){ const box=qs('#faqsAdmin'); box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>'; try{ const resp=await fetchJSON(API+'/faqs',{headers:authHeaders()}); box.innerHTML=''; resp.data.forEach(f=>{ const row=ce('div','card text-sm flex justify-between items-center'); row.innerHTML=`<div><div class='font-semibold'>${f.question}</div><div class='opacity-70 text-xs'>${f.answer}</div></div><button class='delF text-xs px-3 rounded-full bg-red-500/20 hover:bg-red-500/30' data-id='${f.id}'>حذف</button>`; box.appendChild(row); }); }catch(e){ box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل الأسئلة</p>'; }}
async function addFaq(){ const q=qs('#fqQ').value.trim(); const a=qs('#fqA').value.trim(); if(!q||!a) return; try{ await fetchJSON(API+'/faqs',{ method:'POST', headers:authHeaders(), body:JSON.stringify({ question:q, answer:a, active:1 }) }); qs('#fqQ').value=''; qs('#fqA').value=''; loadFaqs(); }catch(e){ alert('خطأ إضافة سؤال'); }}
async function deleteFaq(id){ if(!confirm('حذف السؤال؟')) return; try{ await fetchJSON(API+'/faqs/'+id,{ method:'DELETE', headers:authHeaders() }); loadFaqs(); }catch(e){ alert('خطأ حذف'); }}

async function loadSettings(){
  try{
    const resp = await fetchJSON(API+'/settings',{headers:authHeaders()});
    const s = resp.data || {};
    qs('#heroHeading').value = s.hero_heading || '';
    qs('#heroSub').value = s.hero_subheading || '';
    qs('#aboutHtml').value = s.about_html || '';
    qs('#contactPhone').value = s.contact_phone || '';
    qs('#contactEmail').value = s.contact_email || '';
    qs('#socialFacebook').value = s.social_facebook || '';
    qs('#socialInstagram').value = s.social_instagram || '';
    qs('#socialWhatsApp').value = s.social_whatsapp || '';
    qs('#socialTwitter').value = s.social_twitter || '';
  } catch(e){ console.warn('settings load', e); }
}

async function saveSettings(){
  const payload = {
    hero_heading: qs('#heroHeading').value.trim(),
    hero_subheading: qs('#heroSub').value.trim(),
    about_html: qs('#aboutHtml').value.trim(),
    contact_phone: qs('#contactPhone').value.trim(),
    contact_email: qs('#contactEmail').value.trim(),
    social_facebook: qs('#socialFacebook').value.trim(),
    social_instagram: qs('#socialInstagram').value.trim(),
    social_whatsapp: qs('#socialWhatsApp').value.trim(),
    social_twitter: qs('#socialTwitter').value.trim()
  };
  try{
    await fetchJSON(API+'/settings',{ method:'PUT', headers:authHeaders(), body: JSON.stringify(payload) });
    qs('#settingsStatus').textContent='تم الحفظ'; setTimeout(()=>qs('#settingsStatus').textContent='',2000);
  } catch(e){ qs('#settingsStatus').textContent='خطأ'; }
}

// Categories
async function loadCategories(){ const box=qs('#categoriesAdmin'); if(!box) return; box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>'; try{ const resp=await fetchJSON(API+'/categories',{headers:authHeaders()}); box.innerHTML=''; resp.data.forEach(c=>{ const row=ce('div','card text-sm flex justify-between items-center'); row.innerHTML=`<span class='font-semibold'>${c.name}</span><div class='flex gap-2'><button class='editCat text-xs px-2 bg-white/10 rounded' data-id='${c.id}'>تعديل</button><button class='delCat text-xs px-2 bg-red-500/30 rounded' data-id='${c.id}'>حذف</button></div>`; box.appendChild(row); }); }catch(e){ box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل التصنيفات</p>'; }}
async function addCategory(){ const name=qs('#catName').value.trim(); if(!name) return; try{ await fetchJSON(API+'/categories',{method:'POST', headers:authHeaders(), body:JSON.stringify({ name })}); qs('#catName').value=''; loadCategories(); }catch(e){ alert('خطأ إضافة تصنيف'); }}
async function deleteCategory(id){ if(!confirm('حذف التصنيف؟')) return; try{ await fetchJSON(API+'/categories/'+id,{method:'DELETE', headers:authHeaders()}); loadCategories(); }catch(e){ alert('خطأ حذف'); }}
async function editCategory(id){ const cur=document.querySelector(`[data-id='${id}'].editCat`)?.closest('div')?.previousElementSibling?.textContent; const name=prompt('اسم جديد', cur||''); if(!name) return; try{ await fetchJSON(API+'/categories/'+id,{method:'PUT', headers:authHeaders(), body:JSON.stringify({ name })}); loadCategories(); }catch(e){ alert('خطأ تعديل'); }}

// Banners
async function loadBanners(){ const box=qs('#bannersAdmin'); if(!box) return; box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>'; try{ const resp=await fetchJSON(API+'/banners',{headers:authHeaders()}); box.innerHTML=''; resp.data.forEach(b=>{ const card=ce('div','card text-sm space-y-2'); card.innerHTML=`<div class='font-semibold'>${b.title||''}</div><div class='text-xs opacity-70'>${b.subtitle||''}</div><div class='text-xs break-all'>${b.image||''}</div><div class='flex gap-2'><button class='editBan text-xs px-2 bg-white/10 rounded' data-id='${b.id}'>تعديل</button><button class='delBan text-xs px-2 bg-red-500/30 rounded' data-id='${b.id}'>حذف</button></div>`; box.appendChild(card); }); }catch(e){ box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل البانرات</p>'; }}
async function addBannerForm(e){ e.preventDefault(); const form=e.target; const fd=new FormData(form); if(!fd.get('title')) return; try { const resp=await fetch(API+'/banners',{ method:'POST', headers:{ 'Authorization':'Bearer '+token }, body: fd }); if(!resp.ok) throw new Error('fail'); await resp.json(); form.reset(); loadBanners(); } catch(err){ alert('خطأ رفع البانر'); }}
async function deleteBanner(id){ if(!confirm('حذف البانر؟')) return; try{ await fetchJSON(API+'/banners/'+id,{method:'DELETE', headers:authHeaders()}); loadBanners(); }catch(e){ alert('خطأ حذف'); }}
async function editBanner(id){ const title=prompt('عنوان جديد'); if(!title) return; try{ await fetchJSON(API+'/banners/'+id,{method:'PUT', headers:authHeaders(), body:JSON.stringify({ title })}); loadBanners(); }catch(e){ alert('خطأ تعديل'); }}

// Testimonials
async function loadTestimonials(){
  const box=qs('#testimonialsAdmin');
  if(!box) return;
  box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>';
  try{
    const resp=await fetchJSON(API+'/testimonials',{headers:authHeaders()});
    box.innerHTML='';
    if(!resp.data || !resp.data.length) {
      box.innerHTML = '<p class="text-sm opacity-60">لا توجد تقييمات بعد</p>';
      return;
    }
    resp.data.forEach(t=>{
      const name = t.author || t.name || '';
      const msg = t.content || t.message || '';
      const row=ce('div','card text-sm space-y-1');
      row.innerHTML=`<div class='font-semibold'>${name}</div><div class='text-xs opacity-70'>${msg}</div><div class='flex gap-2'><button class='editTest text-xs px-2 bg-white/10 rounded' data-id='${t.id}'>تعديل</button><button class='delTest text-xs px-2 bg-red-500/30 rounded' data-id='${t.id}'>حذف</button></div>`;
      box.appendChild(row);
    });
  }catch(e){
    box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل التقييمات: '+(e.message||'')+'</p>';
  }
}
async function addTestimonial(){ const name=qs('#testAuthor').value.trim(); const message=qs('#testContent').value.trim(); if(!name||!message) return; try{ await fetchJSON(API+'/testimonials',{method:'POST', headers:authHeaders(), body:JSON.stringify({ name, message, active:1 })}); qs('#testAuthor').value=''; qs('#testContent').value=''; loadTestimonials(); }catch(e){ alert('خطأ إضافة تقييم'); }}
async function deleteTestimonial(id){ if(!confirm('حذف التقييم؟')) return; try{ await fetchJSON(API+'/testimonials/'+id,{method:'DELETE', headers:authHeaders()}); loadTestimonials(); }catch(e){ alert('خطأ حذف'); }}
async function editTestimonial(id){ const name=prompt('اسم جديد'); if(!name) return; try{ await fetchJSON(API+'/testimonials/'+id,{method:'PUT', headers:authHeaders(), body:JSON.stringify({ name })}); loadTestimonials(); }catch(e){ alert('خطأ تعديل'); }}

// Subscribers
async function loadSubscribers(){ const box=qs('#subsAdmin'); if(!box) return; box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>'; try{ const resp=await fetchJSON(API+'/subscribers',{headers:authHeaders()}); box.innerHTML=''; resp.data.forEach(s=>{ const row=ce('div','card text-xs flex justify-between items-center'); row.innerHTML=`<span>${s.email}</span><button class='delSub px-2 bg-red-500/30 rounded text-[10px]' data-id='${s.id}'>حذف</button>`; box.appendChild(row); }); }catch(e){ box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل المشتركين</p>'; }}
async function deleteSubscriber(id){ if(!confirm('حذف المشترك؟')) return; try{ await fetchJSON(API+'/subscribers/'+id,{method:'DELETE', headers:authHeaders()}); loadSubscribers(); }catch(e){ alert('خطأ حذف'); }}

// Messages
async function loadMessages(){ const box=qs('#messagesAdmin'); if(!box) return; box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>'; try{ const resp=await fetchJSON(API+'/messages',{headers:authHeaders()}); box.innerHTML=''; resp.data.forEach(m=>{ const row=ce('div','card text-sm space-y-1'); row.innerHTML=`<div class='flex justify-between'><span class='font-semibold'>${m.name||''}</span><span class='text-xs opacity-70'>${m.email||''}</span></div><div class='text-xs opacity-80'>${m.message||''}</div><button class='delMsg text-xs px-2 bg-red-500/30 rounded self-start' data-id='${m.id}'>حذف</button>`; box.appendChild(row); }); }catch(e){ box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل الرسائل</p>'; }}
async function deleteMessage(id){ if(!confirm('حذف الرسالة؟')) return; try{ await fetchJSON(API+'/messages/'+id,{method:'DELETE', headers:authHeaders()}); loadMessages(); }catch(e){ alert('خطأ حذف'); }}

// Orders
async function loadOrders(){
  const box=qs('#ordersAdmin');
  if(!box) return;
  box.innerHTML='<p class="text-sm opacity-60">تحميل...</p>';
  try{
    const fSel = document.getElementById('ordersFilter');
    const status = fSel ? fSel.value : 'all';
    const url = status && status !== 'all' ? (API+`/orders?status=${encodeURIComponent(status)}`) : (API+'/orders');
    const resp=await fetchJSON(url,{headers:authHeaders()});
    box.innerHTML='';
    resp.data.forEach(o=>{
      const row=ce('div','order-card-admin bg-white/5 border border-white/10 rounded-2xl shadow-lg overflow-hidden transition hover:shadow-2xl relative');
      row.classList.add('order-row');
      row.setAttribute('data-id', o.id);
      // حالة الطلب لون مخصص
      let statusColor = 'bg-amber-400/20 text-amber-700';
      if(o.status==='Delivered') statusColor = 'bg-emerald-400/20 text-emerald-700';
      if(o.status==='Canceled') statusColor = 'bg-rose-400/20 text-rose-700';
      // رأس الطلب
      row.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center gap-4 p-5 border-b border-white/10 bg-gradient-to-l from-white/5 to-white/0">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <img src="${o.thumb || 'https://via.placeholder.com/64x64?text=RG'}" alt="thumb" class="w-16 h-16 rounded-xl object-cover ring-2 ring-white/20 shadow order-thumb cursor-pointer transition-all duration-200" style="max-width:4rem;max-height:4rem;" title="اضغط للتكبير/التصغير">
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-base text-accent">طلب #${o.id}</span>
                <span class="order-status-badge px-3 py-1 rounded-full text-xs font-bold ${statusColor}">${o.status||'Pending'}</span>
              </div>
              <div class="text-xs opacity-80">${o.created_at?new Date(o.created_at).toLocaleString('ar-EG'):''}</div>
            </div>
          </div>
          <div class="flex flex-col gap-2 items-end">
            <div class="flex items-center gap-2">
              <button class="deliver-order text-xs px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 font-bold">تم التسليم</button>
              <select class="order-status px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40" data-id="${o.id}">
                <option value="Pending" ${o.status==='Pending'?'selected':''}>قيد المعالجة</option>
                <option value="Delivered" ${o.status==='Delivered'?'selected':''}>تم التسليم</option>
                <option value="Canceled" ${o.status==='Canceled'?'selected':''}>ملغي</option>
              </select>
            </div>
            <div class="text-xs font-bold text-accent">${o.total||0} ج.س</div>
          </div>
        </div>
        <div class="order-details hidden bg-white/2 p-5 text-sm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><span class="font-bold">العميل:</span> <span>${o.customer_name||''}</span>${o.customer_email?` <span class='opacity-60'>(${o.customer_email})</span>`:''}</div>
            <div><span class="font-bold">الهاتف:</span> <span>${o.customer_phone||'-'}</span>${o.customer_alt_phone?` <span class='opacity-60'>/ ${o.customer_alt_phone}`:''}</div>
            <div class="md:col-span-2"><span class="font-bold">العنوان:</span> <span>${o.customer_address||''}</span></div>
            <div class="md:col-span-2"><span class="font-bold">ملاحظة:</span> <span>${o.note||'-'}</span></div>
          </div>
          <div class="items-list"><div class="text-xs opacity-60">جلب العناصر...</div></div>
        </div>
      `;
      box.appendChild(row);
    });
  }catch(e){
    box.innerHTML='<p class="text-sm text-red-300">خطأ تحميل الطلبات</p>';
  }
}

async function loadOrderItemsTo(row){
  const id=row.getAttribute('data-id');
  try{
    const detail=await fetchJSON(`/api/orders/${id}`);
    const items = detail.data.items||[];
    const wrap=row.querySelector('.items-list');
    if(items.length === 0) {
      wrap.innerHTML = '<div class="text-xs opacity-60">لا توجد عناصر</div>';
      return;
    }
    wrap.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full text-xs border-separate border-spacing-y-2">
          <thead>
            <tr class="text-accent/80">
              <th class="text-right font-bold">الصورة</th>
              <th class="text-right font-bold">المنتج</th>
              <th class="text-right font-bold">الكمية</th>
              <th class="text-right font-bold">السعر</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it=>`
              <tr class="bg-white/10 rounded-lg">
                <td class="py-1 px-2"><img src='${it.image||"https://via.placeholder.com/40"}' class='w-10 h-10 rounded object-cover ring-1 ring-white/10'></td>
                <td class="py-1 px-2 font-medium">${it.name}</td>
                <td class="py-1 px-2">${it.quantity}</td>
                <td class="py-1 px-2">${it.price} ج.س</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }catch(e){ /* ignore */ }
}

// Tabs
function setupTabs(){ const buttons=document.querySelectorAll('.tab-btn'); const panels=document.querySelectorAll('.tab-panel'); function activate(name){ buttons.forEach(b=>{ b.classList.toggle('active', b.dataset.tab===name); }); panels.forEach(p=>{ p.classList.toggle('hidden', p.id!=='tab-'+name); }); }
  buttons.forEach(b=> b.addEventListener('click', ()=> activate(b.dataset.tab))); activate('products'); }

function bind(){
  const pf=qs('#productForm'); pf&&pf.addEventListener('submit', addProductForm);
  qs('#productsAdmin').addEventListener('click', e=>{ if(e.target.classList.contains('updateP')) updateProduct(e.target.getAttribute('data-id')); if(e.target.classList.contains('delP')) deleteProduct(e.target.getAttribute('data-id')); });
  qs('#addFaq').addEventListener('click', addFaq);
  qs('#faqsAdmin').addEventListener('click', e=>{ if(e.target.classList.contains('delF')) deleteFaq(e.target.getAttribute('data-id')); });
  qs('#saveSettings').addEventListener('click', saveSettings);
  qs('#logout').addEventListener('click', ()=>{ localStorage.removeItem('rg_admin_token'); location.href='/admin/login.html'; });
  qs('#addCategory').addEventListener('click', addCategory);
  qs('#categoriesAdmin').addEventListener('click', e=>{ if(e.target.classList.contains('delCat')) deleteCategory(e.target.getAttribute('data-id')); if(e.target.classList.contains('editCat')) editCategory(e.target.getAttribute('data-id')); });
  const bf=qs('#bannerForm'); bf&&bf.addEventListener('submit', addBannerForm);
  qs('#bannersAdmin').addEventListener('click', e=>{ if(e.target.classList.contains('delBan')) deleteBanner(e.target.getAttribute('data-id')); if(e.target.classList.contains('editBan')) editBanner(e.target.getAttribute('data-id')); });
  qs('#addTestimonial').addEventListener('click', addTestimonial);
  qs('#testimonialsAdmin').addEventListener('click', e=>{ if(e.target.classList.contains('delTest')) deleteTestimonial(e.target.getAttribute('data-id')); if(e.target.classList.contains('editTest')) editTestimonial(e.target.getAttribute('data-id')); });
  qs('#subsAdmin').addEventListener('click', e=>{ if(e.target.classList.contains('delSub')) deleteSubscriber(e.target.getAttribute('data-id')); });
  qs('#messagesAdmin').addEventListener('click', e=>{ if(e.target.classList.contains('delMsg')) deleteMessage(e.target.getAttribute('data-id')); });
  const of=document.getElementById('ordersFilter'); of&&of.addEventListener('change', ()=> loadOrders());
  qs('#ordersAdmin').addEventListener('click', async e=>{
    const row=e.target.closest('.order-row'); if(!row) return;
    // تكبير/تصغير صورة الطلب عند الضغط على المصغرة أو الكبيرة
    if (e.target.classList.contains('order-thumb') || e.target.classList.contains('order-thumb-zoom')) {
      e.target.classList.toggle('order-thumb-zoom');
      return;
    }
    if (e.target.classList.contains('deliver-order')){
      const id=row.getAttribute('data-id');
      try{ await fetchJSON(API+`/orders/${id}/status`, { method:'PUT', headers:authHeaders(), body: JSON.stringify({ status:'Delivered' })});
        row.remove(); notify('تم وسم الطلب كمُسَلَّم وإخفاؤه'); }catch(err){ alert('تعذر تحديث حالة الطلب'); }
      return;
    }
    // If interacting with the status select, don't toggle details
    if (e.target.closest && e.target.closest('select.order-status')) return;
    const det=row.querySelector('.order-details'); det.classList.toggle('hidden'); if(!det.dataset.loaded){ loadOrderItemsTo(row).then(()=> det.dataset.loaded='1'); }
  });
  // CSS: تكبير صورة الطلب عند إضافة order-thumb-zoom
  const styleZoom = document.createElement('style');
  styleZoom.innerHTML = `.order-thumb-zoom { z-index: 50 !important; position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%,-50%) scale(2.5) !important; box-shadow: 0 0 0 9999px rgba(0,0,0,0.5), 0 8px 32px 0 rgba(0,0,0,0.25); border-radius: 1.5rem !important; max-width: 90vw !important; max-height: 80vh !important; cursor: zoom-out !important; }`;
  document.head.appendChild(styleZoom);
  qs('#ordersAdmin').addEventListener('change', async e=>{
    const sel = e.target.closest('.order-status'); if(!sel) return;
    const id = sel.getAttribute('data-id'); const value = sel.value;
    try { await fetchJSON(API+`/orders/${id}/status`, { method:'PUT', headers:authHeaders(), body: JSON.stringify({ status:value })});
      const badge = sel.closest('.order-row').querySelector('.order-status-badge'); if(badge) badge.textContent = value;
      // If current filter hides this status, remove from list
      const fSel = document.getElementById('ordersFilter');
      if (fSel && fSel.value !== 'all' && fSel.value !== value){ sel.closest('.order-row').remove(); }
      notify('تم تحديث حالة الطلب');
    } catch(err){ alert('تعذر تحديث الحالة'); }
  });
}

// Mobile aside toggle for admin
function setupAdminMobileToggle(){
  const btn = qs('#mobileMenuBtn'); const aside = qs('aside'); if(!btn || !aside) return;
  function closeAside(){ aside.classList.remove('open-mobile'); const ov = qs('#adminAsideOverlay'); if(ov) ov.remove(); btn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  function openAside(){ aside.classList.add('open-mobile'); const ov = ce('div','admin-aside-overlay'); ov.id='adminAsideOverlay'; ov.addEventListener('click', closeAside); document.body.appendChild(ov); btn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
  btn.addEventListener('click', ()=>{ if(aside.classList.contains('open-mobile')) closeAside(); else openAside(); });
}

// Lightweight toast for admin
function notify(msg){ let t=document.getElementById('_adm_toast'); if(!t){ t=ce('div','fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full shadow-soft text-sm z-50'); t.id='_adm_toast'; document.body.appendChild(t);} t.textContent=msg; t.style.opacity='1'; setTimeout(()=>{ t.style.opacity='0'; },2200); }

// Poll metrics for new orders/messages
let lastMetrics = { orders: Number(localStorage.getItem('rg_last_orders_count')||0), messages: Number(localStorage.getItem('rg_last_messages_count')||0) };
async function pollMetrics(){
  try{ const r=await fetchJSON(API+'/metrics', { headers:authHeaders()}); const m=r.data||{};
    if (m.orders>lastMetrics.orders){ notify('طلب جديد وصل للتو'); }
    if (m.messages>lastMetrics.messages){ notify('رسالة جديدة وصلت للتو'); }
    lastMetrics.orders = m.orders||0; lastMetrics.messages = m.messages||0;
    localStorage.setItem('rg_last_orders_count', String(lastMetrics.orders));
    localStorage.setItem('rg_last_messages_count', String(lastMetrics.messages));
  }catch(e){ /* ignore */ }
}

async function init(){ setupTabs(); bind(); await Promise.all([
  loadProducts(), loadFaqs(), loadSettings(), loadCategories(), loadBanners(), loadTestimonials(), loadSubscribers(), loadMessages(), loadOrders()
]); document.body.classList.add('ready'); setInterval(pollMetrics, 20000); pollMetrics(); }

init().catch(e=>{ console.error(e); document.body.classList.add('ready'); });

// initialize mobile toggle after init
document.addEventListener('DOMContentLoaded', ()=>{ setupAdminMobileToggle(); });