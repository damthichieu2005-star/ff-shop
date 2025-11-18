async function loadProducts() {
    const res = await fetch("products.json");
    const data = await res.json();

    const box = document.getElementById("productList");
    box.innerHTML = "";

    data.forEach(p => {
        box.innerHTML += `
            <div class="card">
                <img src="${p.img}">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <p class="price">${p.price.toLocaleString()}đ</p>
            </div>
        `;
    });
}

loadProducts();
