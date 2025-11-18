// app.js - shared logic
const ADMIN_USER = "binboi207";
const ADMIN_PASS = "mhieu2007@";
const PRODUCTS_KEY = "shopbinboi_products_v1";

// default sample products (if nothing)
const DEFAULT_PRODUCTS = [
  { id: "p1", title:"Acc VIP 980k", price:980000, desc:"Acc VIP level cao, nhiều skin", img:"images/IMG_0161.jpeg" },
  { id: "p2", title:"Acc VIP cổ 1.5tr", price:1500000, desc:"Acc cổ, đồ đẹp", img:"images/IMG_0162.jpeg" },
  { id: "p3", title:"Acc VIP chuyên đồ nữ 1.4tr", price:1400000, desc:"Đồ nữ đẹp", img:"images/IMG_D91BEFEF-3D84-4CE0-A044-D06ACD12.jpeg" },
  { id: "p4", title:"Acc VIP chuyên S7 TVC mùa 1 2tr", price:2000000, desc:"S7 TVC mùa 1", img:"images/banner.jpg" }
];

// utils
function uid(){ return 'id'+Math.random().toString(36).slice(2,9); }
function formatMoney(v){ return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".") + "₫"; }
function loadProducts(){
  const raw = localStorage.getItem(PRODUCTS_KEY);
  if(!raw){
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS.slice();
  }
  try { return JSON.parse(raw); } catch(e){ return DEFAULT_PRODUCTS.slice(); }
}
function saveProducts(list){
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

/* ------------------ index.html behavior ------------------ */
if(document.getElementById("productsGrid")){
  const grid = document.getElementById("productsGrid");
  let products = loadProducts();

  function render(){
    grid.innerHTML = "";
    products.forEach(p=>{
      const card = document.createElement("div");
      card.className = "card product";
      card.innerHTML = `
        <img src="${p.img||'images/banner.jpg'}" alt="${p.title}" onerror="this.src='images/banner.jpg'">
        <div><strong>${p.title}</strong></div>
        <div class="muted">${p.desc||''}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="price">${formatMoney(p.price)}</div>
          <div>
            <button class="btn primary buy" data-id="${p.id}">Mua</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  render();

  // Checkout modal
  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckout = document.getElementById("closeCheckout");
  const checkoutSummary = document.getElementById("checkoutSummary");
  const buyerName = document.getElementById("buyerName");
  const buyerPhone = document.getElementById("buyerPhone");
  const sendConfirm = document.getElementById("sendConfirm");
  const sendZalo = document.getElementById("sendZalo");

  document.body.addEventListener("click", function(e){
    if(e.target.matches(".buy")){
      const id = e.target.dataset.id;
      const p = products.find(x=>x.id===id);
      if(!p) return alert("Sản phẩm không tồn tại");
      let html = `<p><strong>${p.title}</strong> — ${formatMoney(p.price)}</p>`;
      html += `<p>${p.desc||''}</p>`;
      html += `<p><strong>Nội dung chuyển khoản:</strong> Mua Acc GiaRE.BinBoi</p>`;
      checkoutSummary.innerHTML = html;
      // store current order in memory
      checkoutModal.dataset.order = JSON.stringify({id:p.id, title:p.title, price:p.price});
      checkoutModal.style.display = "flex";
    }
  });

  closeCheckout.addEventListener("click", ()=>checkoutModal.style.display="none");
  sendZalo.addEventListener("click", ()=>{
    // open zalo with phone
    sendZalo.href = "https://zalo.me/0347676833";
  });

  sendConfirm.addEventListener("click", ()=>{
    const name = buyerName.value || "Khách";
    const phone = buyerPhone.value || "";
    if(!phone){ alert("Vui lòng nhập SĐT để liên hệ (Zalo)"); return; }
    const ord = JSON.parse(checkoutModal.dataset.order || "{}");
    let subject = encodeURIComponent("Xác nhận mua - ShopBinBoi");
    let body = `Người mua: ${name}%0ASĐT: ${phone}%0AĐơn hàng: ${ord.title} - ${formatMoney(ord.price)}%0A%0ANội dung chuyển: Mua Acc GiaRE.BinBoi%0AThanh toán qua MB/MoMo: 0347676833 (NGÂN MINH HIẾU)`;
    window.location.href = `mailto:shopbinboi@example.com?subject=${subject}&body=${body}`;
  });

  // close modal on outside click
  window.addEventListener("click", function(e){
    if(e.target === checkoutModal) checkoutModal.style.display="none";
  });
}

/* ------------------ admin.html behavior ------------------ */
if(document.getElementById("doLogin")){
  let products = loadProducts();

  const loginBox = document.getElementById("loginBox");
  const panel = document.getElementById("panel");
  const adminUser = document.getElementById("adminUser");
  const adminPass = document.getElementById("adminPass");
  const doLogin = document.getElementById("doLogin");
  const logoutBtn = document.getElementById("logout");

  function showPanel(){
    loginBox.style.display = "none";
    panel.style.display = "block";
    renderAdminProducts();
  }
  function hidePanel(){
    loginBox.style.display = "block";
    panel.style.display = "none";
  }

  doLogin.addEventListener("click", ()=>{
    if(adminUser.value === ADMIN_USER && adminPass.value === ADMIN_PASS){
      localStorage.setItem("admin_logged","1");
      showPanel();
    } else alert("Sai user hoặc mật khẩu");
  });

  // auto-login if flag
  if(localStorage.getItem("admin_logged") === "1") showPanel();

  document.getElementById("logout").addEventListener("click", ()=>{
    localStorage.removeItem("admin_logged");
    hidePanel();
  });

  // form elements
  const p_title = document.getElementById("p_title");
  const p_desc = document.getElementById("p_desc");
  const p_price = document.getElementById("p_price");
  const p_file = document.getElementById("p_file");
  const p_imgurl = document.getElementById("p_imgurl");
  const saveProduct = document.getElementById("saveProduct");
  const clearForm = document.getElementById("clearForm");
  const adminProducts = document.getElementById("adminProducts");
  const exportJSON = document.getElementById("exportJSON");
  const importFile = document.getElementById("importFile");

  let editingId = null;

  function renderAdminProducts(){
    adminProducts.innerHTML = "";
    products.forEach(p=>{
      const div = document.createElement("div");
      div.className = "card";
      div.style.marginBottom = "8px";
      div.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${p.img||'images/banner.jpg'}" style="width:80px;height:60px;object-fit:cover;border-radius:6px" onerror="this.src='images/banner.jpg'">
          <div style="flex:1">
            <div style="font-weight:700">${p.title}</div>
            <div class="muted">${p.desc}</div>
            <div style="margin-top:6px">${formatMoney(p.price)}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button class="btn" data-id="${p.id}" onclick="adminEdit('${p.id}')">Sửa</button>
            <button class="btn muted" data-id="${p.id}" onclick="adminDelete('${p.id}')">Xóa</button>
          </div>
        </div>
      `;
      adminProducts.appendChild(div);
    });
  }

  window.adminEdit = function(id){
    const p = products.find(x=>x.id===id);
    if(!p) return;
    editingId = id;
    p_title.value = p.title;
    p_desc.value = p.desc;
    p_price.value = p.price;
    p_imgurl.value = p.img || "";
    window.scrollTo({top:0,behavior:'smooth'});
  }
  window.adminDelete = function(id){
    if(!confirm("Xóa sản phẩm này?")) return;
    products = products.filter(x=>x.id!==id);
    saveProducts(products);
    renderAdminProducts();
    alert("Đã xóa");
  }

  // file to base64
  function fileToDataUrl(file){ return new Promise((res,rej)=>{
    const fr = new FileReader();
    fr.onload = ()=>res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  })}

  saveProduct.addEventListener("click", async ()=>{
    let img = p_imgurl.value.trim();
    if(!img && p_file.files && p_file.files[0]){
      try{
        img = await fileToDataUrl(p_file.files[0]);
      }catch(e){ console.error(e); alert("Không đọc file"); return; }
    }
    const title = p_title.value.trim();
    const desc = p_desc.value.trim();
    const price = parseInt(p_price.value || "0",10);
    if(!title || !price){ alert("Vui lòng nhập tiêu đề và giá"); return; }

    if(editingId){
      const idx = products.findIndex(x=>x.id===editingId);
      if(idx>=0){
        products[idx].title = title;
        products[idx].desc = desc;
        products[idx].price = price;
        if(img) products[idx].img = img;
      }
      editingId = null;
    } else {
      const newP = { id: uid(), title, desc, price, img: img || "images/banner.jpg" };
      products.unshift(newP);
    }
    saveProducts(products);
    renderAdminProducts();
    p_title.value=""; p_desc.value=""; p_price.value=""; p_imgurl.value=""; p_file.value="";
    alert("Lưu thành công");
  });

  clearForm.addEventListener("click", ()=>{
    editingId = null;
    p_title.value=""; p_desc.value=""; p_price.value=""; p_imgurl.value=""; p_file.value="";
  });

  // export products json
  exportJSON.addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(products, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "products.json"; a.click();
    URL.revokeObjectURL(url);
  });

  // import json file (replace products)
  importFile.addEventListener("change", (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const fr = new FileReader();
    fr.onload = ()=>{
      try{
        const arr = JSON.parse(fr.result);
        if(Array.isArray(arr)){
          products = arr;
          saveProducts(products);
          renderAdminProducts();
          alert("Import thành công");
        } else alert("File không đúng định dạng (cần array)");
      }catch(err){ alert("Không đọc được file: " + err.message); }
    };
    fr.readAsText(f);
  });

  // first render
  renderAdminProducts();
}
