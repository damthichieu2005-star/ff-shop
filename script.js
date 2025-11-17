// Basic shop data (sample). Replace images in images/ folder and change product data as needed.
const products = [
{
  name: "Acc VIP 2 - 1.5tr",
  price: 1500000,
  desc: "Full súng, level cao, nhiều skin vip",
  img: "https://raw.githubusercontent.com/damthichieu2005-star/ff-shop/main/images/A3CC2068-7808-40FC-98D8-E5BF0841D3BA.jpeg"
},  id: "acc1",
    title: "Acc VIP 1 - 1.2tr",
    price: 1200000,
    desc: "Level 86 - Nhiều skin",
    img: "images/acc1.jpg"
  },
  ];
    id: "acc2",
    title: "Acc Pro - 980k",
    price: 980000,
    desc: "Level 71 - Nhiều trang bị",
    img: "images/acc2.jpg"
  },
  {
    id: "acc3",
    title: "Acc Cổ - 1.2tr",
    price: 1200000,
    desc: "Acc cổ nhiều đồ",
    img: "images/acc3.jpg"
  }
];

// Utils
function formatMoney(v){
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

// Render products
const grid = document.getElementById("productsGrid");
products.forEach(p=>{
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${p.img}" alt="${p.title}">
    <h4>${p.title}</h4>
    <p>${p.desc}</p>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div class="price">${formatMoney(p.price)}</div>
      <div class="actions">
        <button class="btn add" data-id="${p.id}">Thêm vào giỏ</button>
        <button class="btn outline view" data-id="${p.id}">Xem</button>
      </div>
    </div>
  `;
  grid.appendChild(card);
});

// Cart handling (localStorage)
let cart = JSON.parse(localStorage.getItem("shopCart") || "[]");
const cartCount = document.getElementById("cartCount");
const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");
const cartItemsWrap = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const closeCart = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCart");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const checkoutSummary = document.getElementById("checkoutSummary");
const buyerName = document.getElementById("buyerName");
const buyerPhone = document.getElementById("buyerPhone");
const sendConfirm = document.getElementById("sendConfirm");
const sendZalo = document.getElementById("sendZalo");

// update cart UI
function saveCart(){
  localStorage.setItem("shopCart", JSON.stringify(cart));
  renderCartCount();
}
function renderCartCount(){
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
}
function renderCartModal(){
  cartItemsWrap.innerHTML = "";
  if(cart.length===0){
    cartItemsWrap.innerHTML = "<p>Giỏ hàng trống.</p>";
    cartTotal.textContent = "0₫";
    return;
  }
  let total = 0;
  cart.forEach(it=>{
    const product = products.find(p=>p.id===it.id);
    const row = document.createElement("div");
    row.style.display="flex";
    row.style.alignItems="center";
    row.style.justifyContent="space-between";
    row.style.marginBottom="8px";
    row.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center">
        <img src="${product.img}" style="width:60px;height:40px;object-fit:cover;border-radius:6px">
        <div>
          <div style="font-weight:700">${product.title}</div>
          <div style="color:#666">${formatMoney(product.price)}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="muted" data-id="${it.id}" onclick="changeQty('${it.id}', -1)">-</button>
        <div>${it.qty}</div>
        <button class="muted" data-id="${it.id}" onclick="changeQty('${it.id}', 1)">+</button>
        <button style="margin-left:8px;color:#a00;background:transparent;border:0;cursor:pointer" onclick="removeItem('${it.id}')">Xóa</button>
      </div>
    `;
    cartItemsWrap.appendChild(row);
    total += product.price * it.qty;
  });
  cartTotal.textContent = formatMoney(total);
}
window.changeQty = function(id, delta){
  const i = cart.find(ci=>ci.id===id);
  if(!i) return;
  i.qty += delta;
  if(i.qty<=0) cart = cart.filter(ci=>ci.id!==id);
  saveCart();
  renderCartModal();
}
window.removeItem = function(id){
  cart = cart.filter(ci=>ci.id!==id);
  saveCart();
  renderCartModal();
}
function addToCart(id){
  const exist = cart.find(c=>c.id===id);
  if(exist) exist.qty++;
  else cart.push({id, qty:1});
  saveCart();
  // small feedback
  alert("Đã thêm vào giỏ");
}

// attach buttons
document.body.addEventListener("click", function(e){
  if(e.target.matches(".add")){
    addToCart(e.target.dataset.id);
  }
  if(e.target.matches(".view")){
    const p = products.find(x=>x.id===e.target.dataset.id);
    alert(p.title + "\n" + p.desc + "\nGiá: " + formatMoney(p.price));
  }
});

cartBtn.addEventListener("click", function(){ cartModal.style.display = "flex"; renderCartModal();});
closeCart.addEventListener("click", ()=>cartModal.style.display="none");
clearCartBtn.addEventListener("click", ()=>{
  if(confirm("Xóa toàn bộ giỏ?")) { cart=[]; saveCart(); renderCartModal();}
});

// Checkout
checkoutBtn.addEventListener("click", ()=>{
  if(cart.length===0){ alert("Giỏ hàng trống."); return; }
  // build summary
  let html = "<ul>";
  let total=0;
  cart.forEach(it=>{
    const p = products.find(x=>x.id===it.id);
    html += `<li>${p.title} × ${it.qty} — ${formatMoney(p.price*it.qty)}</li>`;
    total += p.price*it.qty;
  });
  html += `</ul><p><strong>Tổng: ${formatMoney(total)}</strong></p>`;
  checkoutSummary.innerHTML = html;
  // set zalo link
  sendZalo.href = `https://zalo.me/0347676833`;
  checkoutModal.style.display = "flex";
});

// close checkout
closeCheckout.addEventListener("click", ()=>checkoutModal.style.display="none");

// send confirm mail (mailto with body)
sendConfirm.addEventListener("click", ()=>{
  const name = buyerName.value || "Khách";
  const phone = buyerPhone.value || "";
  if(!name || !phone){ alert("Vui lòng nhập tên và số điện thoại."); return; }
  let subject = encodeURIComponent("Xác nhận thanh toán - ShopBinBoi");
  let body = `Người mua: ${name}%0ASDT: ${phone}%0A%0AĐơn hàng:%0A`;
  let total = 0;
  cart.forEach(it=>{
    const p = products.find(x=>x.id===it.id);
    body += `- ${p.title} x${it.qty} = ${formatMoney(p.price*it.qty)}%0A`;
    total += p.price*it.qty;
  });
  body += `%0ATổng: ${formatMoney(total)}%0A%0AThanh toán qua MB Bank (STK: 0347676833 - Ngân Minh Hiếu) hoặc MoMo 0347676833%0A%0AKèm ảnh giao dịch tại zalo/facebook hoặc trả lời mail này.`;
  // open mail client
  window.location.href = `mailto:shopbinboi@example.com?subject=${subject}&body=${body}`;
  // we keep cart (or you can clear on success)
});

// initial render
renderCartCount();
document.getElementById("year").textContent = new Date().getFullYear();

// close modals when clicking outside content
window.addEventListener("click", function(e){
  if(e.target === cartModal) cartModal.style.display="none";
  if(e.target === checkoutModal) checkoutModal.style.display="none";
});
