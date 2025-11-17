function pay(name) {
    document.getElementById("productName").innerText = name;
    document.getElementById("paymentPopup").style.display = "block";
}

function closePopup() {
    document.getElementById("paymentPopup").style.display = "none";
}
