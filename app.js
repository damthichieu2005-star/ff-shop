// === Assumes firebase initialized in index.html ===
const db = firebase.firestore();
const storage = firebase.storage();

// Utils
function formatMoney(v){ return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".") + "₫"; }

// Render products from Firestore
const grid = document.getElementById("productsGrid");
function renderProducts(products){
  grid.innerHTML = "";
  products.forEach(p=>{
    const el = document.createElement("div");
    el.className="card";
    el.innerHTML = `
      <div style="min-height:160px;background:#000;border-radius:8px;display:flex;align-items:center;justify-content:center">
        <img src="${p.image || 'images/placeholder.png'}" alt="" />
      </div>
      <h4>${p.title}</h4>
      <p style="color:#9fb0bb;margin:6px 0">${p.desc || ''}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="price">${formatMoney(p.price)}</div>
        <button class="btn buy" data-id="${p.id}">Mua</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

// load products (realtime)
db.collection("products").orderBy("createdAt","desc").onSnapshot(snap=>{
  const arr=[];
  snap.forEach(doc=>{
    const d = doc.data();
    d.id = doc.id;
    arr.push(d);
  });
  renderProducts(arr);
});

// CART (localStorage)
let cart = JSON.parse(localStorage.getItem("shopCart")||"[]");
const cartCount = document.getElementById("cartCount");
const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");
const cartItemsWrap = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const closeCart = document.getElementById("closeCart");
const clearCartBtn = document.getElementById("clearCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const checkoutSummary = document.getElementById("checkoutSummary");

function saveCart(){ localStorage.setItem("shopCart",JSON.stringify(cart)); renderCartCount(); }
function renderCartCount(){ cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0); }
function renderCartModal(){
  cartItemsWrap.innerHTML="";
  if(cart.length===0){ cartItemsWrap.innerHTML="<p>Giỏ hàng trống.</p>"; cartTotal.textContent="0₫"; return; }
  let total=0;
  cart.forEach(async it=>{
    const doc = await db.collection("products").doc(it.id).get();
    const p = doc.data();
    const row = document.createElement("div");
    row.style.display="flex";row.style.justifyContent="space-between";row.style.marginBottom="8px";
    row.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center">
        <img src="${p.image||'images/placeholder.png'}" style="width:60px;height:44px;object-fit:cover;border-radius:6px">
        <div><div style="font-weight:700">${p.title}</div><div style="color:#9fb0bb">${formatMoney(p.price)}</div></div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button onclick="changeQty('${it.id}', -1)">-</button>
        <div>${it.qty}</div>
        <button onclick="changeQty('${it.id}', 1)">+</button>
        <button onclick="removeItem('${it.id}')">Xóa</button>
      </div>
    `;
    cartItemsWrap.appendChild(row);
    total += p.price * it.qty;
    cartTotal.textContent = formatMoney(total);
  });
}
window.changeQty = function(id,delta){
  const it = cart.find(c=>c.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty<=0) cart = cart.filter(c=>c.id!==id);
  saveCart(); renderCartModal();
}
window.removeItem = function(id){
  cart = cart.filter(c=>c.id!==id); saveCart(); renderCartModal();
}
function addToCart(id){
  const ex = cart.find(c=>c.id===id);
  if(ex) ex.qty++;
  else cart.push({id,qty:1});
  saveCart();
  alert("Đã thêm vào giỏ");
}

// attach buy buttons
document.body.addEventListener("click", function(e){
  if(e.target.matches(".buy")) addToCart(e.target.dataset.id);
});

cartBtn.addEventListener("click", ()=>{ cartModal.style.display="flex"; renderCartModal();});
closeCart.addEventListener("click", ()=>cartModal.style.display="none");
clearCartBtn.addEventListener("click", ()=>{ if(confirm("Xóa toàn bộ giỏ?")){cart=[];saveCart();renderCartModal();}});

checkoutBtn.addEventListener("click", ()=>{
  if(cart.length===0){ alert("Giỏ hàng trống"); return;}
  let html="<ul>";
  let total=0;
  (async ()=>{
    for(const it of cart){
      const doc = await db.collection("products").doc(it.id).get();
      const p = doc.data();
      html += `<li>${p.title} × ${it.qty} — ${formatMoney(p.price*it.qty)}</li>`;
      total += p.price*it.qty;
    }
    html += `</ul><p><strong>Tổng: ${formatMoney(total)}</strong></p>`;
    html += `<p>Chuyển vào MB 0347676833 - NGÂN MINH HIẾU. Nội dung: <strong>Mua Acc GiaRE.BinBoi</strong></p>`;
    html += `<p>Quét QR để chuyển (QR ở trang chính). Sau chuyển gửi ảnh giao dịch vào Zalo/Facebook để được giao acc và bảo hành 15 ngày.</p>`;
    checkoutSummary.innerHTML = html;
    checkoutModal.style.display="flex";
  })();
});

closeCheckout.addEventListener("click", ()=>checkoutModal.style.display="none");

// initial
renderCartCount();
document.getElementById("qrImg").src = "images/IMG_0161.jpeg"; // thay bằng đường dẫn QR bạn đã upload
