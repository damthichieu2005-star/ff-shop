let products = JSON.parse(localStorage.getItem("products")) || [
    {
        name: "Acc VIP 980k",
        desc: "Acc VIP level cao, nhiều skin",
        price: 980000,
        img: "acc1.jpg"
    },
    {
        name: "Acc VIP cổ 1.5tr",
        desc: "Acc cổ, đồ đẹp",
        price: 1500000,
        img: "acc2.jpg"
    }
];

let cart = [];

function format(n) {
    return n.toLocaleString("vi-VN") + "đ";
}

function renderProducts() {
    const box = document.getElementById("productList");
    box.innerHTML = "";

    products.forEach((p, i) => {
        box.innerHTML += `
        <div class="product">
            <img src="${p.img}">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <p class="price">${format(p.price)}</p>
            <button onclick="addToCart(${i})">Mua</button>
        </div>`;
    });
}
renderProducts();

function addToCart(i) {
    cart.push(products[i]);
    updateCart();
}

function updateCart() {
    document.querySelector(".cart-btn").innerText = `Giỏ (${cart.length})`;

    const c = document.getElementById("cartItems");
    c.innerHTML = "";

    let total = 0;
    cart.forEach((p, i) => {
        total += p.price;
        c.innerHTML += `<p>${p.name} - ${format(p.price)}</p>`;
    });

    document.getElementById("total").innerText = format(total);
}

function toggleCart() {
    document.getElementById("cartBox").classList.toggle("hidden");
}

function clearCart() {
    cart = [];
    updateCart();
}

function checkout() {
    alert("Chuyển tiền vào MB 0347676833 (Ngân Minh Hiếu).\nNội dung: Mua Acc GiaRE.BinBoi\n\nSau khi chuyển tiền gửi ảnh giao dịch cho admin để nhận acc.");
}
