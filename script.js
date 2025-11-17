// Sample product data.
// In real deployment replace with backend calls (REST/API) and proper authentication.
const products = [
  {
    id: 'acc001',
    title: 'Acc FF - Rank Legendary, Nhiều skin',
    type: 'account',
    desc: 'Rank Legendary, 200+ skin, linked email, khuyến nghị đổi mật khẩu',
    price: 250000, // VND
    tags: ['Legendary', '200+ skin']
  },
  {
    id: 'acc002',
    title: 'Acc FF - Rank Diamond II',
    type: 'account',
    desc: 'Rank Diamond II, 50 skin, chưa đổi email',
    price: 90000,
    tags: ['Diamond II']
  },
  {
    id: 'kc100',
    title: 'Gói KC - 100 KC',
    type: 'kc',
    desc: 'Mã nạp 100 KC (giao mã qua chat)',
    price: 45000,
    tags: ['KC', 'Mã nạp']
  },
  {
    id: 'kc500',
    title: 'Gói KC - 500 KC',
    type: 'kc',
    desc: 'Mã nạp 500 KC (giao mã qua chat)',
    price: 200000,
    tags: ['KC', 'Mã nạp']
  }
];

const productList = document.getElementById('product-list');
const modal = document.getElementById('cart-modal');
const closeModal = document.getElementById('closeModal');
const cartItemsDiv = document.getElementById('cart-items');
const totalSpan = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');

let cart = [];

function formatVND(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

function renderProducts(){
  products.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${p.title}</h4>
      <div class="meta">${p.desc}</div>
      <div class="price">${formatVND(p.price)} ₫</div>
      <div class="actions">
        <button class="btn" data-id="${p.id}">Mua</button>
        <button class="btn ghost" data-id-view="${p.id}">Xem</button>
      </div>
    `;
    productList.appendChild(card);
  });

  // Attach buy button listeners
  document.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      addToCart(id);
      openCart();
    })
  });
  document.querySelectorAll('button[data-id-view]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.target.dataset.idView;
      viewProduct(id);
    })
  });
}

function viewProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  alert(`${p.title}\n\nMô tả: ${p.desc}\nGiá: ${formatVND(p.price)} ₫`);
}

function addToCart(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  cart.push(p);
  renderCart();
}

function renderCart(){
  cartItemsDiv.innerHTML = '';
  let total = 0;
  cart.forEach((item,idx)=>{
    total += item.price;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<div>${item.title} <div class="meta">${item.desc}</div></div><div>${formatVND(item.price)} ₫ <button data-idx="${idx}" class="btn ghost">X</button></div>`;
    cartItemsDiv.appendChild(div);
  });
  totalSpan.textContent = formatVND(total);
  // remove buttons
  cartItemsDiv.querySelectorAll('button[data-idx]').forEach(b=>{
    b.addEventListener('click', e=>{
      const i = Number(e.target.dataset.idx);
      cart.splice(i,1);
      renderCart();
    })
  });
}

function openCart(){ modal.classList.remove('hidden'); }
function closeCart(){ modal.classList.add('hidden'); }

closeModal.addEventListener('click', closeCart);
checkoutBtn.addEventListener('click', ()=>{
  // Simulated checkout: in production integrate with a payment gateway + order management backend
  if(cart.length===0){ alert('Giỏ hàng rỗng'); return; }
  const total = cart.reduce((s,it)=>s+it.price,0);
  const names = cart.map(c=>c.title).join(', ');
  // Show a confirmation and order summary
  alert('Thanh toán mô phỏng:\nSản phẩm: ' + names + '\nTổng: ' + formatVND(total) + ' ₫\n\nSau khi thanh toán, người bán sẽ liên hệ để giao acc/mã KC.');
  // Clear cart
  cart = [];
  renderCart();
  closeCart();
});

renderProducts();
