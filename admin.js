// === Assumes firebase initialized in admin.html ===
const auth = firebase.auth();
const dbAdmin = firebase.firestore();
const storage = firebase.storage();

const loginBtn = document.getElementById("loginBtn");
const adminEmail = document.getElementById("adminEmail");
const adminPass = document.getElementById("adminPass");
const authMsg = document.getElementById("authMsg");
const adminPanel = document.getElementById("adminPanel");
const authSection = document.getElementById("authSection");
const logoutBtn = document.getElementById("logoutBtn");

loginBtn.addEventListener("click", async ()=>{
  const e = adminEmail.value.trim();
  const p = adminPass.value.trim();
  if(!e||!p){ authMsg.textContent="Nhập email và mật khẩu"; return;}
  try{
    await auth.signInWithEmailAndPassword(e,p);
    authMsg.textContent="";
  }catch(err){
    authMsg.textContent = "Lỗi đăng nhập: "+err.message;
  }
});

logoutBtn.addEventListener("click", ()=>auth.signOut());

auth.onAuthStateChanged(user=>{
  if(user){
    authSection.style.display="none";
    adminPanel.style.display="block";
    logoutBtn.style.display="inline-block";
    loadAdminProducts();
  }else{
    authSection.style.display="block";
    adminPanel.style.display="none";
    logoutBtn.style.display="none";
  }
});

// product form
const productForm = document.getElementById("productForm");
productForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const title = document.getElementById("pTitle").value.trim();
  const desc = document.getElementById("pDesc").value.trim();
  const price = Number(document.getElementById("pPrice").value);
  const file = document.getElementById("pImage").files[0];
  if(!title||!price){ alert("Nhập đầy đủ"); return; }

  let imageUrl = "";
  if(file){
    const ref = storage.ref().child('uploads/'+Date.now()+"_"+file.name);
    const snap = await ref.put(file);
    imageUrl = await snap.ref.getDownloadURL();
  }

  // save product to Firestore
  await dbAdmin.collection("products").add({
    title, desc, price, image: imageUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  alert("Đã thêm");
  productForm.reset();
});

// load admin product list
const adminProducts = document.getElementById("adminProducts");
function loadAdminProducts(){
  dbAdmin.collection("products").orderBy("createdAt","desc").onSnapshot(snapshot=>{
    adminProducts.innerHTML="";
    snapshot.forEach(doc=>{
      const d = doc.data(); d.id = doc.id;
      const box = document.createElement("div");
      box.className="card";
      box.style.marginBottom="8px";
      box.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${d.image||'images/placeholder.png'}" style="width:110px;height:70px;object-fit:cover;border-radius:8px" />
          <div style="flex:1">
            <div style="font-weight:700">${d.title}</div>
            <div style="color:#9fb0bb">${d.desc||''}</div>
            <div style="color:var(--accent);font-weight:700">${d.price}₫</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <button onclick="editProduct('${d.id}')">Sửa</button>
            <button onclick="deleteProduct('${d.id}')">Xóa</button>
          </div>
        </div>
      `;
      adminProducts.appendChild(box);
    });
  });
}

// edit and delete
window.deleteProduct = async function(id){
  if(!confirm("Xóa sản phẩm?")) return;
  await dbAdmin.collection("products").doc(id).delete();
  alert("Đã xóa");
}
window.editProduct = async function(id){
  const doc = await dbAdmin.collection("products").doc(id).get();
  const d = doc.data();
  // simple edit via prompt
  const title = prompt("Tên", d.title);
  if(title===null) return;
  const price = prompt("Giá", d.price);
  if(price===null) return;
  await dbAdmin.collection("products").doc(id).update({title, price: Number(price)});
  alert("Đã cập nhật");
}
