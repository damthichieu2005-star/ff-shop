// admin.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-storage.js";

/* ==========  THAY CHÍNH XÁC firebaseConfig NHƯ app.js ========== */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};
/* ========================================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const googleBtn = document.getElementById("loginGoogle");
const facebookBtn = document.getElementById("loginFacebook");
const adminPanel = document.getElementById("adminPanel");
const adminInfo = document.getElementById("adminInfo");

const adminEmail = "YOUR_ADMIN_EMAIL@example.com"; // <-- đổi email admin

// providers
const gProvider = new GoogleAuthProvider();
const fProvider = new FacebookAuthProvider();

googleBtn?.addEventListener("click", ()=> signInWithPopup(auth, gProvider).catch(e=>alert(e.message)));
facebookBtn?.addEventListener("click", ()=> signInWithPopup(auth, fProvider).catch(e=>alert(e.message)));

onAuthStateChanged(auth, user=>{
  if(user){
    adminInfo.innerHTML = `Đang đăng nhập: ${user.email} <button id="btnSignOut">Đăng xuất</button>`;
    document.getElementById("btnSignOut").onclick = ()=> signOut(auth);
    // only allow admin email
    if(user.email === adminEmail){
      adminPanel.style.display = "block";
      initAdminFunctions();
    } else {
      adminPanel.style.display = "none";
      alert("Bạn không phải admin.");
    }
  } else {
    adminInfo.innerHTML = "Chưa đăng nhập";
    adminPanel.style.display = "none";
  }
});

function initAdminFunctions(){
  // upload QR
  document.getElementById("uploadQrBtn").onclick = async ()=>{
    const f = document.getElementById("qrFile").files[0];
    if(!f) return alert("Chọn file QR");
    const ref = sref(storage, `payments/qr.jpg`);
    await uploadBytes(ref, f);
    const u = await getDownloadURL(ref);
    document.getElementById("qrPreview").innerHTML = `<img src="${u}" style="max-width:300px"/>`;
    alert("Đã upload QR");
  };

  // add product
  document.getElementById("addProductBtn").onclick = async ()=>{
    const title = document.getElementById("pTitle").value.trim();
    const price = Number(document.getElementById("pPrice").value.trim()) || 0;
    const desc = document.getElementById("pDesc").value.trim();
    const file = document.getElementById("pImage").files[0];
    if(!title || !price || !file) return alert("Điền đủ tiêu đề, giá và chọn ảnh");
    const imgRef = sref(storage, `uploads/${Date.now()}_${file.name}`);
    await uploadBytes(imgRef, file);
    const url = await getDownloadURL(imgRef);
    await addDoc(collection(db, "products"), { title, price, desc, image: url, createdAt: Date.now() });
    alert("Thêm sản phẩm thành công");
    loadAdminList();
  };

  loadAdminList();
  loadQrPreview();
}

// load admin list realtime
function loadAdminList(){
  const q = collection(db, "products");
  onSnapshot(q, (snap)=>{
    const wrap = document.getElementById("adminList"); wrap.innerHTML = "";
    snap.forEach(docu=>{
      const p = docu.data();
      const id = docu.id;
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `<img src="${p.image}" style="height:120px"/><div><b>${p.title}</b><p>${p.desc}</p><div>${p.price.toLocaleString('vi-VN')}₫</div><button data-id="${id}" class="delBtn">Xóa</button></div>`;
      wrap.appendChild(el);
    });
  });
  document.body.addEventListener("click", async (e)=>{
    if(e.target.matches(".delBtn")){
      const id = e.target.dataset.id;
      if(confirm("Xóa sản phẩm?")) await deleteDoc(doc(db, "products", id));
    }
  });
}

async function loadQrPreview(){
  try{
    const qrRef = sref(storage, 'payments/qr.jpg');
    const url = await getDownloadURL(qrRef);
    document.getElementById("qrPreview").innerHTML = `<img src="${url}" style="max-width:300px"/>`;
  } catch(e){
    document.getElementById("qrPreview").innerHTML = "<p>Chưa có QR</p>";
  }
}
