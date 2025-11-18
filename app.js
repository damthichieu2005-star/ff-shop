// app.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-storage.js";

/* ==========  THAY THÔNG TIN FIREBASE Ở ĐÂY  ========== */
/* Lấy config từ Firebase console */
const  = {
  https://damthichieu2005-star.github.io/ff-shop/apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};
/* ==========  KẾT THÚC THAY ========== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const adminEmail = "YOUR_ADMIN_EMAIL@example.com"; // <-- đổi email admin (Google) ở đây

// UI elements
const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const btnLogin = document.getElementById("btnLogin");
const btnCart = document.getElementById("btnCart");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItemsWrap = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const qrImg = document.getElementById("qrImg");

// Simple cart (localStorage)
let cart = JSON.parse(localStorage.getItem("shopCart") || "[]");
function saveCart(){ localStorage.setItem("shopCart", JSON.stringify(cart)); renderCartCount();}
function renderCartCount(){ cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0); }
renderCartCount();

// Login button behavior (open auth page or show current)
btnLogin?.addEventListener("click", ()=> location.href = "admin.html");

// Cart open/close
btnCart?.addEventListener("click", ()=> { cartModal.style.display = "flex"; renderCart(); });
closeCart?.addEventListener("click", ()=> cartModal.style.display = "none");

async function renderProducts(){
  productsGrid.innerHTML = "<div style='color:#aaa'>Đang tải...</div>";
  const q = collection(db, "products");
  // realtime snapshot
  onSnapshot(q, (snap)=>{
    productsGrid.innerHTML = "";
    snap.forEach(docu=>{
      const p = docu.data();
      const id = docu.id;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.image || ''}" alt="${p.title||''}" />
        <h4>${p.title||''}</h4>
        <p>${p.desc||''}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:700">${Number(p.price).toLocaleString('vi-VN')}₫</div>
          <div><button data-id="${id}" class="buyBtn">Mua</button></div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  });
}
renderProducts();

// buy handler
document.body.addEventListener("click", (e)=>{
  if(e.target.matches(".buyBtn")){
    const id = e.target.dataset.id;
    addToCart(id);
  }
});

// addToCart uses Firestore doc to get product
async function addToCart(id){
  const pDoc = await (await fetchProduct(id));
  if(!pDoc) return alert("Sản phẩm không tồn tại");
  const exist = cart.find(c=>c.id===id);
  if(exist) exist.qty++;
  else cart.push({id, qty:1, title:pDoc.title, price:pDoc.price});
  saveCart();
  alert("Đã thêm vào giỏ");
}

// helper: fetch product once
async function fetchProduct(id){
  try{
    const d = await import("https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js");
    const { getDoc, doc } = d;
    const docRef = doc(db, "products", id);
    const snap = await getDoc(docRef);
    if(snap.exists()) return snap.data();
    return null;
  } catch(err){ console.error(err); return null; }
}

// render cart modal
function renderCart(){
  cartItemsWrap.innerHTML = "";
  if(cart.length===0){ cartItemsWrap.innerHTML = "<p>Giỏ hàng trống.</p>"; cartTotalEl.textContent = "0"; return; }
  let total = 0;
  cart.forEach((it,idx)=>{
    const row = document.createElement("div");
    row.style.display="flex";row.style.justifyContent="space-between";row.style.marginBottom="8px";
    row.innerHTML = `<div>${it.title} x${it.qty}</div><div>${(it.price*it.qty).toLocaleString('vi-VN')}₫ <button data-i="${idx}" class="removeItem">Xóa</button></div>`;
    cartItemsWrap.appendChild(row);
    total += it.price*it.qty;
  });
  cartTotalEl.textContent = total.toLocaleString('vi-VN');
}
document.body.addEventListener("click",(e)=>{ if(e.target.matches(".removeItem")){ const i= +e.target.dataset.i; cart.splice(i,1); saveCart(); renderCart(); }});

// checkout (just show bank instructions)
checkoutBtn?.addEventListener("click", ()=>{
  alert("Thanh toán: chuyển khoản vào MB 0347676833 — NGÂN MINH HIẾU.\nNội dung: Mua Acc GiaRE.BinBoi\nSau khi chuyển gửi ảnh qua Zalo/Facebook để admin kiểm tra và giao acc.");
});

// load QR from storage location (we store QR at 'payments/qr.jpg' in Storage)
async function loadQr(){
  try{
    const qrRef = sref(storage, 'payments/qr.jpg');
    const url = await getDownloadURL(qrRef);
    qrImg.src = url;
  } catch(e){
    // no qr yet - leave blank
  }
}
loadQr();
