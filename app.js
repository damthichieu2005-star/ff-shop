// app.js - ShopBinBoi (client side) ----------------------------------

// ========== FIREBASE CONFIG (dán config của bạn) ==========
var firebaseConfig = {
  apiKey: "AIzaSyBvwvKC1yEiMQDyLpmq6uAhxcleQwFx7E",
  authDomain: "ff-shop-e7e08.firebaseapp.com",
  projectId: "ff-shop-e7e08",
  storageBucket: "ff-shop-e7e08.appspot.com",
  messagingSenderId: "692245023370",
  appId: "1:692245023370:web:b04318a43b46938b4fb3e1",
  measurementId: "G-1KVQNMJJMH"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();

// ========== UTIL ==========
function formatMoney(v){ if(!v && v!==0) return "0₫"; v = Number(v)||0; return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".") + "₫"; }
function uid(){ return 'id'+Math.random().toString(36).substr(2,9); }

// ========== SHOP (index.html) ==========
const productsGrid = document.getElementById && document.getElementById('productsGrid');
if(productsGrid){
  const cartKey = "shopbinboi_cart_v1";
  let CART = JSON.parse(localStorage.getItem(cartKey) || "[]");

  // load config (bank, qr)
  db.ref('config').once('value').then(s=>{
    const cfg = s.val() || {};
    const bankInfo = document.getElementById('bankInfo');
    if(bankInfo && cfg.bankText) bankInfo.innerText = cfg.bankText;
    if(cfg.bannerUrl){
      const b = document.getElementById('bannerImg'); if(b) b.src = cfg.bannerUrl;
    }
    if(cfg.qrUrl){
      const q = document.getElementById('qrImg'); if(q) q.src = cfg.qrUrl;
    }
    if(cfg.zalo) {
      const z = document.getElementById('zaloLink'); if(z) z.href = cfg.zalo;
    } else {
      const z = document.getElementById('zaloLink'); if(z) z.href = 'https://zalo.me/0347676833';
    }
  });

  // realtime products listener
  db.ref('products').on('value', snapshot=>{
    const data = snapshot.val() || {};
    renderProducts(Object.values(data));
  });

  function renderProducts(list){
    productsGrid.innerHTML = "";
    list.forEach(p=>{
      const el = document.createElement('div');
      el.className = 'card product';
      el.innerHTML = `
        <img src="${p.img||'images/banner.jpg'}" onerror="this.src='images/banner.jpg'">
        <div style="font-weight:700;margin-top:6px">${p.title}</div>
        <div class="muted small">${p.desc||''}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div class="price">${formatMoney(p.price)}</div>
          <div>
            <button class="btn primary buy" data-id="${p.id}">Mua</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(el);
    });
    renderCartCount();
  }

  // cart functions
  function saveCart(){ localStorage.setItem(cartKey, JSON.stringify(CART)); renderCartCount(); }
  function renderCartCount(){ document.getElementById('cartCount').innerText = CART.reduce((s,i)=>s+i.qty,0); }

  document.body.addEventListener('click', function(e){
    if(e.target.matches('.buy')){
      const id = e.target.dataset.id;
      db.ref('products').orderByChild('id').equalTo(id).once('value').then(s=>{
        const matches = s.val();
        if(!matches){ alert('Sản phẩm không tìm thấy'); return; }
        const p = Object.values(matches)[0];
        // add to cart (simple: one item, open checkout)
        CART = [{ id:p.id, title:p.title, price:p.price, qty:1 }];
        saveCart();
        openCart();
      })
    }
    if(e.target.id === 'openCart') openCart();
  });

  // open cart modal
  function openCart(){
    const cm = document.getElementById('cartModal');
    const items = document.getElementById('cartItems');
    items.innerHTML = "";
    if(CART.length===0){ items.innerHTML = "<p>Giỏ hàng trống</p>"; }
    let total = 0;
    CART.forEach(it=>{
      items.innerHTML += `<div style="display:flex;justify-content:space-between;margin-bottom:8px"><div><b>${it.title}</b><div class="small">${formatMoney(it.price)}</div></div><div>${it.qty} × ${formatMoney(it.price*it.qty)}</div></div>`;
      total += it.price * it.qty;
    });
    document.getElementById('cartTotal').innerText = formatMoney(total);
    cm.style.display = 'flex';
    // attach checkout
    document.getElementById('checkoutBtn').onclick = ()=>{
      openCheckout(total);
    }
  }

  document.getElementById('closeCart').onclick = ()=> document.getElementById('cartModal').style.display = 'none';

  function openCheckout(total){
    const cm = document.getElementById('checkoutModal');
    document.getElementById('checkoutSummary').innerHTML = `<p>${CART.map(i=> i.title + ' ×' + i.qty).join('<br>')}</p><p><b>Tiền: ${formatMoney(total)}</b></p>`;
    cm.style.display = 'flex';
    document.getElementById('sendOrder').onclick = ()=> {
      const name = document.getElementById('buyerName').value || 'Khách';
      const phone = document.getElementById('buyerPhone').value || '';
      if(!phone) return alert('Vui lòng nhập số điện thoại (Zalo).');
      // build mailto
      let body = `Người mua: ${name}%0ASĐT: ${phone}%0AĐơn hàng:%0A`;
      CART.forEach(i=> body += `- ${i.title} x${i.qty} = ${formatMoney(i.price*i.qty)}%0A`);
      body += `%0ATổng: ${formatMoney(total)}%0A%0ANội dung chuyển khoản: Mua Acc GiaRE.BinBoi%0ASTK: 0347676833 (NGÂN MINH HIẾU)`;
      window.location.href = `mailto:shopbinboi@example.com?subject=${encodeURIComponent('Xác nhận đơn - ShopBinBoi')}&body=${body}`;
    }
  }

  document.getElementById('closeCheckout').onclick = ()=> document.getElementById('checkoutModal').style.display = 'none';
  // close modal click outside
  window.addEventListener('click', e=>{
    if(e.target === document.getElementById('cartModal')) document.getElementById('cartModal').style.display='none';
    if(e.target === document.getElementById('checkoutModal')) document.getElementById('checkoutModal').style.display='none';
  });

  // admin quick open link
  document.getElementById('openAdmin').addEventListener('click', ()=> window.location.href = 'admin.html');
}

// ========== ADMIN (admin.html) ==========
const loginBox = document.getElementById && document.getElementById('loginBox');
if(loginBox){
  const ADMIN_USER = "binboi207";
  const ADMIN_PASS = "mhieu2007@";
  const btnLogin = document.getElementById('btnLogin');
  const btnClear = document.getElementById('btnClear');
  const adminPanel = document.getElementById('adminPanel');
  const msg = document.getElementById('configMsg');

  function showPanel(){
    loginBox.style.display = 'none';
    adminPanel.style.display = 'block';
    loadAdminProducts();
    loadConfig();
  }
  function hidePanel(){ loginBox.style.display = ''; adminPanel.style.display = 'none'; }

  // login
  btnLogin.onclick = ()=>{
    const u = document.getElementById('adminUser').value.trim();
    const p = document.getElementById('adminPass').value.trim();
    if(u === ADMIN_USER && p === ADMIN_PASS){
      localStorage.setItem('sb_admin','1'); showPanel();
    } else alert('Sai user hoặc pass');
  }
  if(localStorage.getItem('sb_admin') === '1') showPanel();
  btnClear.onclick = ()=> { document.getElementById('adminUser').value=''; document.getElementById('adminPass').value=''; }

  document.getElementById('btnLogout').onclick = ()=>{
    localStorage.removeItem('sb_admin'); hidePanel();
  }

  // config: upload qr + save bank text
  async function loadConfig(){
    const s = await db.ref('config').once('value'); const cfg = s.val() || {};
    document.getElementById('bankText').value = cfg.bankText || "MB: 0347676833 - NGÂN MINH HIẾU";
    msg.innerText = '';
  }
  document.getElementById('saveConfig').onclick = async ()=>{
    const bankText = document.getElementById('bankText').value.trim();
    // upload QR if file chosen
    const f = document.getElementById('qrFile').files[0];
    let qrUrl = null;
    if(f){
      const path = 'shop/qr-' + Date.now() + '-' + f.name;
      const stRef = storage.ref(path);
      await stRef.put(f);
      qrUrl = await stRef.getDownloadURL();
    }
    await db.ref('config').set({ bankText, qrUrl, bannerUrl: null, zalo: 'https://zalo.me/0347676833' });
    msg.innerText = 'Đã lưu cấu hình.';
  }

  // product CRUD
  const p_title = document.getElementById('p_title');
  const p_price = document.getElementById('p_price');
  const p_desc = document.getElementById('p_desc');
  const p_file = document.getElementById('p_file');
  const p_img = document.getElementById('p_img');
  const btnSaveProduct = document.getElementById('btnSaveProduct');
  const btnClearForm = document.getElementById('btnClearForm');
  const adminProducts = document.getElementById('adminProducts');

  let editingId = null;

  btnSaveProduct.onclick = async ()=>{
    const title = p_title.value.trim();
    const price = Number(p_price.value || 0);
    const desc = p_desc.value.trim();
    if(!title || !price) return alert('Vui lòng nhập tiêu đề và giá.');

    // handle image upload
    let imageUrl = p_img.value.trim() || null;
    if(p_file.files && p_file.files[0]){
      const f = p_file.files[0];
      const path = 'shop/products/' + Date.now() + '-' + f.name;
      const stRef = storage.ref(path);
      await stRef.put(f);
      imageUrl = await stRef.getDownloadURL();
    }

    if(editingId){
      await db.ref('products/' + editingId).update({ title, price, desc, img: imageUrl });
      editingId = null;
    } else {
      const id = uid();
      await db.ref('products/' + id).set({ id, title, price, desc, img: imageUrl });
    }
    p_title.value = ''; p_price.value=''; p_desc.value=''; p_file.value=''; p_img.value='';
    loadAdminProducts();
    alert('Lưu sản phẩm thành công');
  }

  btnClearForm.onclick = ()=> { editingId=null; p_title.value=''; p_price.value=''; p_desc.value=''; p_file.value=''; p_img.value=''; }

  async function loadAdminProducts(){
    const s = await db.ref('products').once('value');
    const obj = s.val() || {};
    adminProducts.innerHTML = '';
    Object.keys(obj).reverse().forEach(k=>{
      const p = obj[k];
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${p.img||'images/banner.jpg'}" style="width:90px;height:70px;object-fit:cover;border-radius:6px">
          <div style="flex:1">
            <div style="font-weight:700">${p.title}</div>
            <div class="muted">${p.desc||''}</div>
            <div style="margin-top:6px">${formatMoney(p.price)}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn" data-id="${p.id}" onclick="editProduct('${p.id}')">Sửa</button>
            <button class="btn muted" onclick="deleteProduct('${p.id}')">Xóa</button>
          </div>
        </div>
      `;
      adminProducts.appendChild(div);
    });
  }

  window.editProduct = async function(id){
    const s = await db.ref('products/' + id).once('value');
    const p = s.val();
    if(!p) return alert('Không tìm thấy sản phẩm');
    editingId = id;
    p_title.value = p.title; p_price.value = p.price; p_desc.value = p.desc; p_img.value = p.img || '';
    window.scrollTo({top:0,behavior:'smooth'});
  }

  window.deleteProduct = async function(id){
    if(!confirm('Bạn muốn xóa sản phẩm này?')) return;
    await db.ref('products/' + id).remove();
    loadAdminProducts();
    alert('Đã xóa');
  }

  // initial load
  loadAdminProducts();
  loadConfig();
}
