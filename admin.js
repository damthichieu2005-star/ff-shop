// Tài khoản admin
const ADMIN_USER = "binboi207";
const ADMIN_PASS = "mhieu2007@";

// Load data acc
let accs = JSON.parse(localStorage.getItem("accData") || "[]");

// Lưu acc
function saveAcc() {
    localStorage.setItem("accData", JSON.stringify(accs));
}

// ---- LOGIN ----
document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.onclick = () => {
        let u = document.getElementById("adminUser").value;
        let p = document.getElementById("adminPass").value;

        if (u === ADMIN_USER && p === ADMIN_PASS) {
            document.getElementById("loginBox").style.display = "none";
            document.getElementById("adminPanel").style.display = "block";
        } else {
            alert("Sai tài khoản hoặc mật khẩu!");
        }
    };

    loadAcc();
});

// ---- LOAD ACC ----
function loadAcc() {
    let html = "";
    accs.forEach((a, i) => {
        html += `
            <div class="acc-item">
                <p><b>${a.name}</b></p>
                <p>💰 Giá: ${a.price}đ</p>
                <p>📌 Info: ${a.info}</p>
                <button onclick="deleteAcc(${i})">Xóa</button>
            </div>
        `;
    });
    document.getElementById("accList").innerHTML = html;
}

// ---- THÊM ACC ----
document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "addAccBtn") {
        let name = accName.value;
        let price = accPrice.value;
        let info = accInfo.value;

        if (!name || !price || !info) {
            alert("Điền đầy đủ thông tin!");
            return;
        }

        accs.push({ name, price, info });
        saveAcc();
        loadAcc();

        accName.value = "";
        accPrice.value = "";
        accInfo.value = "";
    }
});

// ---- XÓA ACC ----
function deleteAcc(i) {
    accs.splice(i, 1);
    saveAcc();
    loadAcc();
}
