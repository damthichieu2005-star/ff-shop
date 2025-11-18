// ====== PRODUCTS (4 sản phẩm theo yêu cầu) ======
const products = [
  { id: "p1", title: "Acc VIP - 980k", price: 980000, desc: "Acc VIP giá rẻ, nhiều skin", img: "https://via.placeholder.com/400x250?text=Acc+VIP+980k" },
  { id: "p2", title: "Acc VIP Cổ - 1.5tr", price: 1500000, desc: "Acc cổ nhiều đồ hiếm", img: "https://via.placeholder.com/400x250?text=Acc+VIP+C%E1%BB%91+1.5tr" },
  { id: "p3", title: "Acc VIP Chuyên Đồ Nữ - 1.4tr", price: 1400000, desc: "Acc chuyên đồ nữ, phối trang phục đẹp", img: "https://via.placeholder.com/400x250?text=Acc+N%E1%BB%AF+1.4tr" },
  { id: "p4", title: "Acc VIP S7 TVC Mùa 1 - 2tr", price: 2000000, desc: "Acc chuyên S7 TVC Mùa 1 cao cấp", img: "https://via.placeholder.com/400x250?text=Acc+S7+2tr" }
];

// ====== HELPERS ======
function $(id){ return document.getElementById(id); }
function formatMoney(v){ return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"; }

// ====== RENDER PRODUCTS ======
function renderProducts(){
  const grid = $("productsGrid");
  grid.innerHTML = "";
  products.forEach(p=>{
    const el = document.createElement("div"); el.className = "card";
    el.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h4>${p.title}</h4>
      <div class="small">${p.desc}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
        <div class="price">${formatMoney(p.price)}</div>
        <div style="display:flex;gap:8px;">
          <button class="btn" onclick="buyNow('${p.id}')">Mua ngay</button>
          <button class="btn ghost" onclick="addToCart('${p.id}')">Thêm</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });
}
renderProducts();

// ====== CART ======
let CART = JSON.parse(localStorage.getItem("shopCart") || "[]");
function saveCart(){ localStorage.setItem("shopCart", JSON.stringify(CART)); renderCartCount(); }
function renderCartCount(){ $("cartCount").innerText = CART.reduce((s,i)=>s+i.qty,0); }
renderCartCount();

function addToCart(id){
  const p = products.find(x=>x.id===id);
  if(!p) return alert("Sản phẩm không tồn tại");
  const ex = CART.find(c=>c.id===id);
  if(ex) ex.qty++;
  else CART.push({ id, qty: 1 });
  saveCart();
  alert("Đã thêm vào giỏ");
}

function buyNow(id){
  addToCart(id);
  openCart();
}

// CART UI
function openCart(){ $("cartModal").classList.remove("hidden"); renderCart(); }
function closeCart(){ $("cartModal").classList.add("hidden"); }

function renderCart(){
  const list = $("cartList");
  list.innerHTML = "";
  if(CART.length===0){ list.innerHTML = "<p>Giỏ hàng trống</p>"; $("cartTotal").innerText = "0 ₫"; return; }
  let total = 0;
  CART.forEach((c,i)=>{
    const p = products.find(x=>x.id===c.id);
    total += p.price * c.qty;
    const row = document.createElement("div");
    row.style.display="flex"; row.style.gap="10px"; row.style.alignItems="center"; row.style.marginBottom="8px";
    row.innerHTML = `<img src="${p.img}" style="width:84px;height:56px;object-fit:cover;border-radius:6px"><div style="flex:1"><b>${p.title}</b><div class="small">${formatMoney(p.price)}</div></div>
      <div style="display:flex;gap:6px;align-items:center"><button onclick="changeQty('${c.id}',-1)">&minus;</button><div>${c.qty}</div><button onclick="changeQty('${c.id}',1)">+</button><button style="margin-left:8px" onclick="removeItem('${c.id}')">Xóa</button></div>`;
    list.appendChild(row);
  });
  $("cartTotal").innerText = formatMoney(total);
}

function changeQty(id, delta){
  const it = CART.find(c=>c.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) CART = CART.filter(c=>c.id!==id);
  saveCart(); renderCart();
}

function removeItem(id){ CART = CART.filter(c=>c.id!==id); saveCart(); renderCart(); }
$("clearCart")?.addEventListener("click", ()=>{ if(confirm("Xóa giỏ hàng?")){ CART=[]; saveCart(); renderCart(); } });
$("cartBtn")?.addEventListener("click", ()=>{ openCart(); });
$("closeCart")?.addEventListener("click", ()=>{ closeCart(); });

// ====== CHECKOUT ======
$("openCheckout")?.addEventListener("click", ()=>{
  if(CART.length===0) return alert("Giỏ hàng trống");
  const summary = $("checkoutSummary");
  let html = "<ul>";
  let total = 0;
  CART.forEach(c=>{
    const p = products.find(x=>x.id===c.id);
    html += `<li>${p.title} x${c.qty} — ${formatMoney(p.price*c.qty)}</li>`;
    total += p.price*c.qty;
  });
  html += `</ul><p><strong>Tổng: ${formatMoney(total)}</strong></p>`;
  html += `<p><b>MB Bank:</b> 0347676833 — Ngân Minh Hiếu<br><b>MoMo:</b> 0347676833</p>`;
  summary.innerHTML = html;
  // ensure pay toggle works
  togglePayInfo();
  $("checkoutModal").classList.remove("hidden");
});

function togglePayInfo(){
  const v = document.querySelector('input[name="pay"]:checked')?.value || 'momo';
  if(v === 'momo'){ $("momoInfo").classList.remove("hidden"); $("bankInfo").classList.add("hidden"); }
  else { $("momoInfo").classList.add("hidden"); $("bankInfo").classList.remove("hidden"); }
}
document.querySelectorAll('input[name="pay"]').forEach(r=> r.addEventListener('change', togglePayInfo));
$("closeCheckout")?.addEventListener("click", ()=> $("checkoutModal").classList.add("hidden"));

// copy helper
function copyText(t){ navigator.clipboard.writeText(t).then(()=> alert('Đã sao chép: ' + t)).catch(()=> alert('Không copy được')); }

// place order -> download json
$("placeOrderBtn")?.addEventListener("click", ()=>{
  const name = $("buyerName").value || "Khách";
  const phone = $("buyerPhone").value || "";
  const note = $("buyerNote").value || "";
  if(!phone) return alert("Vui lòng nhập số điện thoại");
  const order = {
    id: 'ORD' + Date.now(),
    created: new Date().toISOString(),
    buyer: { name, phone, note },
    items: CART.map(c => {
      const p = products.find(x=>x.id===c.id);
      return { id: p.id, title: p.title, price: p.price, qty: c.qty };
    }),
    total: CART.reduce((s,c)=> s + (products.find(x=>x.id===c.id).price * c.qty), 0),
    payMethod: document.querySelector('input[name="pay"]:checked')?.value || 'momo',
    momo: '0347676833',
    bank: { name: 'MB Bank', acc: '0347676833', owner: 'NGÂN MINH HIẾU' }
  };
  const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = order.id + '.json'; a.click(); URL.revokeObjectURL(url);
  alert('Đã tạo đơn: ' + order.id + '\nVui lòng chuyển tiền theo hướng dẫn và gửi biên lai Zalo: 0347676833');
  CART = []; saveCart(); renderCart(); closeCart(); $("checkoutModal").classList.add("hidden");
});

// cancel checkout
$("cancelCheckout")?.addEventListener("click", ()=> $("checkoutModal").classList.add("hidden"));

// misc
$("year").innerText = new Date().getFullYear();
window.addEventListener('click', (e)=>{ if(e.target.classList.contains('modal')) e.target.classList.add('hidden'); });
