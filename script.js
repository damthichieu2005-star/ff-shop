// ====== PRODUCTS (mở rộng, thay img bằng images/... khi bạn upload) ======
const products = [
  { id: "acc1", title: "Acc VIP 1 - 1.2tr", price: 1200000, desc: "Level 86 – nhiều skin", img: "https://via.placeholder.com/400x250?text=Acc+VIP+1" },
  { id: "acc2", title: "Acc VIP 2 - 1.5tr", price: 1500000, desc: "Full súng, đồ hiếm", img: "https://via.placeholder.com/400x250?text=Acc+VIP+2" },
  { id: "acc3", title: "Acc 980k", price: 980000, desc: "Acc ngon tầm 980k", img: "https://via.placeholder.com/400x250?text=980k" }
];

// ====== UTIL ======
function formatMoney(v){ return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"; }
function $(id){ return document.getElementById(id); }

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

// cart open button
$("cartBtn")?.addEventListener("click", ()=>{ openCart(); });

// close cart
$("closeCart")?.addEventListener("click", ()=>{ closeCart(); });

// ====== CHECKOUT ======
$("openCheckout")?.addEventListener("click", ()=>{
  if(CART.length===0) return alert("Giỏ hàng trống");
  // build summary
  const summary = $("checkoutSummary");
  let html = "<ul>";
  let total = 0;
  CART.forEach(c=>{
    const p = products.find(x=>x.id===c.id);
    html += `<li>${p.title} x${c.qty} — ${formatMoney(p.price*c.qty)}</li>`;
    total += p.price*c.qty;
  });
  html += `</ul><p><strong>Tổng: ${formatMoney(total)}</strong></p>`;
  summary.innerHTML = html;
  // show momo vs bank
  const radios = document.getElementsByName("pay");
  radios.forEach(r=> r.addEventListener("change", togglePayInfo));
  togglePayInfo(); // init
  // show modal
  $("checkoutModal").classList.remove("hidden");
});

// toggle pay view
function togglePayInfo(){
  const val = document.querySelector('input[name="pay"]:checked')?.value || 'momo';
  if(val === 'momo'){ $("momoInfo").classList.remove("hidden"); $("bankInfo").classList.add("hidden"); }
  else { $("momoInfo").classList.add("hidden"); $("bankInfo").classList.remove("hidden"); }
}
$("closeCheckout")?.addEventListener("click", ()=>{ $("checkoutModal").classList.add("hidden"); });

// copy helper
function copyText(t){ navigator.clipboard.writeText(t).then(()=> alert('Đã sao chép: ' + t)).catch(()=> alert('Không copy được')); }

// ====== PLACE ORDER (download json) ======
$("placeOrderBtn")?.addEventListener("click", ()=>{
  const name = $("buyerName").value || "Khách";
  const phone = $("buyerPhone").value || "";
  const note = $("buyerNote").value || "";
  if(!phone){ return alert("Vui lòng nhập số điện thoại"); }
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

  // create downloadable JSON
  const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = order.id + '.json'; a.click(); URL.revokeObjectURL(url);

  alert('Đã tạo đơn: ' + order.id + '\nVui lòng chuyển tiền theo hướng dẫn và gửi biên lai Zalo: 0347676833');
  // clear cart + close
  CART = []; saveCart(); renderCart(); closeCart(); $("checkoutModal").classList.add("hidden");
});

// close checkout cancel
$("cancelCheckout")?.addEventListener("click", ()=> $("checkoutModal").classList.add("hidden"));

// misc
$("year").innerText = new Date().getFullYear();

// close modal when clicking outside
window.addEventListener('click', (e)=>{
  if(e.target.classList.contains('modal')) e.target.classList.add('hidden');
});
