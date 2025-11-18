// TÀI KHOẢN ADMIN
const ADMIN_USER = "binboi207";
const ADMIN_PASS = "mhieu2007@";

let accs = JSON.parse(localStorage.getItem("accData") || "[]");

function saveAcc() {
    localStorage.setItem("accData", JSON.stringify(accs));
}

// LOGIN
document.getElementById("loginBtn").onclick = () => {
    let u = adminUser.value;
    let p = adminPass.value;

    if (u === ADMIN_USER && p === ADMIN_PASS) {
        loginBox.style.display = "none";
        adminPanel.style.display = "block";
    } else {
        alert("Sai tài khoản hoặc mật khẩu!");
    }
};

// LOAD ACC
function loadAcc() {
    accList.innerHTML = "";

    accs.forEach((a, i) => {
        accList.innerHTML += `
            <div class="acc-item">
                <p><b>${a.name}</b></p>
                <p>💰 Giá: ${a.price}đ</p>
                <p>📌 Info: ${a.info}</p>

                <button onclick="deleteAcc(${i})">Xóa</button>
            </div>
            <hr>
        `;
    });
}

// THÊM ACC
addAccBtn.onclick = () => {
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
};

// XÓA ACC
function deleteAcc(i) {
    accs.splice(i, 1);
    saveAcc();
    loadAcc();
}

loadAcc();
