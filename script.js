/* script.js - shop front-end behavior */

// === DỮ LIỆU SẢN PHẨM MẪU ===
// Thay link ảnh bằng tên file bạn upload vào folder images/
const products = [
  {
    id: "acc01",
    title: "Acc FF Lv86 - Full skin",
    price: 1200000,
    imgs: ["images/acc1-1.jpg","images/acc1-2.jpg"],
    desc: "Full skin, súng xịn, UID: 208133735"
  },
  {
    id: "acc02",
    title: "Acc FF độc - Acc cổ",
    price: 980000,
    imgs: ["images/acc2-1.jpg","images/acc2-2.jpg"],
    desc: "Acc cổ, nhiều skin, rank cao"
  },
  {
    id: "acc03",
    title: "Acc FF 50k (ngẫu nhiên)",
    price: 50000,
    imgs: ["images/acc3-1.jpg"],
    desc: "Acc rẻ ngẫu nhiên, uy tín"
  }
];

// Cart
let cart = [];

// render product grid
const grid = document.getElementById("productGrid");
function renderProducts(){
  grid.innerHTML = "";
  products.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imgs[0]}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <div class="meta">${p.desc}</div>
      <div style="margin-top:8px">
        <span class="price">${p.price.toLocaleString()}đ</span>
      </div>
      <div class="actions">
        <button class="btn" onclick="viewProduct('${p.id}')">Xem</button>
        <button class="btn primary" onclick="buyNow('${p.id}')">Mua ngay</button>
      </div>
    `;
    grid.appendChild(card);
  });
}
renderProducts();

// view product (simple)
window.viewProduct = function(id){
  const p = products.find(x=>x.id===id);
  if(!p) return alert("Không tìm thấy sản phẩm");
  const modal = document.getElementById("checkoutModal");
  document.getElementById("checkoutTitle").innerText = `Mua - ${p.title}`;
  document.getElementById("selectedProduct").innerHTML = `
    <img src="${p.imgs[0]}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;margin-right:12px;float:left" />
    <div>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
      <p style="font-weight:700">${p.price.toLocaleString()}đ</p>
    </div>
    <div style="clear:both"></div>
  `;
  modal.classList.remove("hidden");
  // store current product id
  modal.dataset.product = id;
};

// buyNow same as view
window.buyNow = function(id){ viewProduct(id) }

// close checkout
document.getElementById("closeCheckout").onclick = ()=>{
  document.getElementById("checkoutModal").classList.add("hidden");
};

// pay option buttons
document.getElementById("payMomo").onclick = ()=>{
  document.getElementById("momoInfo").classList.remove("hidden");
  document.getElementById("bankInfo").classList.add("hidden");
};
document.getElementById("payBank").onclick = ()=>{
  document.getElementById("bankInfo").classList.remove("hidden");
  document.getElementById("momoInfo").classList.add("hidden");
};

// confirm order -> save to localStorage orders
document.getElementById("confirmOrder").onclick = ()=>{
  const modal = document.getElementById("checkoutModal");
  const pid = modal.dataset.product;
  const p = products.find(x=>x.id===pid);
  if(!p) return;
  const orders = JSON.parse(localStorage.getItem("shop_orders")||"[]");
  const ord = {
    id: 'ORD'+Date.now(),
    product: p.title,
    price: p.price,
    time: new Date().toISOString(),
    phone: '0347676833', // mặc định seller
    status: 'pending'
  };
  orders.push(ord);
  localStorage.setItem("shop_orders", JSON.stringify(orders));
  alert("Gửi yêu cầu thành công! Admin sẽ kiểm tra và chuyển acc cho bạn.");
  modal.classList.add("hidden");
};

// fake facebook login (client side)
document.getElementById("fakeFbLogin").onclick = ()=>{
  // This is a fake/login simulation. Real FB login requires OAuth & server config.
  const name = prompt("Nhập tên (simulate FB)","Khách");
  if(!name) return;
  sessionStorage.setItem("shop_user", JSON.stringify({name}));
  alert("Đăng nhập thành công: " + name);
};

// CART view (simple)
document.getElementById("viewCart").onclick = ()=>{
  alert("Giỏ hàng: demo - dùng Mua ngay để thanh toán (cart tạm thời)");
};

// === SPIN WHEEL SIMPLE ===
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const segments = ["0%","5%","10%","15%","Voucher 50k","No prize","5%","Voucher 100k"];
const colors = ["#f8c"," #ffd54f","#b2ebf2","#d1c4e9","#ffcdd2","#c8e6c9","#fff9c4","#b3e5fc"];
function drawWheel(){
  const center = canvas.width/2;
  const radius = center - 6;
  const seg = segments.length;
  for(let i=0;i<seg;i++){
    const start = (i/seg)*Math.PI*2;
    const end = ((i+1)/seg)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(center,center);
    ctx.arc(center,center,radius,start,end);
    ctx.closePath();
    ctx.fillStyle = colors[i%colors.length];
    ctx.fill();
    // text
    ctx.save();
    ctx.translate(center,center);
    ctx.rotate(start + (end-start)/2);
    ctx.fillStyle="#222";
    ctx.font="14px Arial";
    ctx.textAlign="center";
    ctx.fillText(segments[i], radius*0.6, 0);
    ctx.restore();
  }
}
drawWheel();

let spinning=false;
document.getElementById("spinBtn").onclick = ()=>{
  if(spinning) return;
  spinning=true;
  const spins = 6 + Math.floor(Math.random()*6);
  const degPer = 360/segments.length;
  const winnerIndex = Math.floor(Math.random()*segments.length);
  const finalDeg = 360*spins + (segments.length - winnerIndex) * degPer - degPer/2;
  let start=0;
  const duration = 4200;
  const startTime = performance.now();
  function animate(now){
    const t = Math.min(1,(now-startTime)/duration);
    const ease = 1 - Math.pow(1-t,3);
    const cur = finalDeg * ease;
    canvas.style.transform = `rotate(${cur}deg)`;
    if(t<1) requestAnimationFrame(animate);
    else {
      spinning=false;
      const prize = segments[winnerIndex];
      document.getElementById("spinResult").innerText = "Kết quả: " + prize;
      // save spin history
      const spinsHist = JSON.parse(localStorage.getItem("spin_hist")||"[]");
      spinsHist.push({time:new Date().toISOString(), prize});
      localStorage.setItem("spin_hist", JSON.stringify(spinsHist));
    }
  }
  requestAnimationFrame(animate);
};

// === ADMIN ===
document.getElementById("adminLogin").onclick = ()=>{
  const pwd = document.getElementById("adminPwd").value;
  // simple password check - change for production
  if(pwd === "admin123"){
    renderOrders();
  } else {
    alert("Mật khẩu sai");
  }
};

function renderOrders(){
  const orders = JSON.parse(localStorage.getItem("shop_orders")||"[]");
  const list = document.getElementById("orderList");
  list.innerHTML = "";
  if(orders.length===0) list.innerHTML = "<p>Chưa có đơn hàng</p>";
  orders.forEach(o=>{
    const el = document.createElement("div");
    el.className = "order-item";
    el.innerHTML = `
      <div><b>${o.id}</b> - ${o.product} - ${o.price.toLocaleString()}đ</div>
      <div>Trạng thái: <select data-id="${o.id}" class="statusSel">
        <option ${o.status==="pending"?"selected":""} value="pending">pending</option>
        <option ${o.status==="paid"?"selected":""} value="paid">paid</option>
        <option ${o.status==="delivered"?"selected":""} value="delivered">delivered</option>
      </select></div>
      <div>Thời gian: ${o.time}</div>
      <button class="btn adminDeliver" data-id="${o.id}">Giao acc</button>
    `;
    list.appendChild(el);
  });
  // attach events
  document.querySelectorAll(".adminDeliver").forEach(b=>{
    b.onclick = ()=>{
      const id = b.dataset.id;
      const orders = JSON.parse(localStorage.getItem("shop_orders")||"[]");
      const idx = orders.findIndex(x=>x.id===id);
      if(idx>-1){
        orders[idx].status = "delivered";
        localStorage.setItem("shop_orders", JSON.stringify(orders));
        renderOrders();
        alert("Đã đánh dấu giao");
      }
    };
  });
  document.querySelectorAll(".statusSel").forEach(s=>{
    s.onchange = ()=>{
      const id = s.dataset.id; const val = s.value;
      const orders = JSON.parse(localStorage.getItem("shop_orders")||"[]");
      const idx = orders.findIndex(x=>x.id===id);
      if(idx>-1){ orders[idx].status = val; localStorage.setItem("shop_orders", JSON.stringify(orders)); }
    };
  });
}

// open admin (keyboard shortcut simulated)
document.addEventListener("keydown", (e)=>{
  if(e.key === "F2"){
    document.getElementById("adminPanel").classList.remove("hidden");
  }
});
document.getElementById("closeAdmin").onclick = ()=>document.getElementById("adminPanel").classList.add("hidden");

// helper: sample: open admin by clicking logo (for demo)
document.querySelector(".logo").onclick = ()=>document.getElementById("adminPanel").classList.remove("hidden");
