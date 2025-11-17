// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // serve static files (index.html, images/ etc)

const ORDERS_FILE = path.join(__dirname, 'orders.json');

function readOrders(){
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE,'utf8')); } catch(e){ return []; }
}
function writeOrders(arr){ fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr,null,2)); }

// API create order
app.post('/api/orders', (req, res)=>{
  const orders = readOrders();
  const id = 'ORD' + Date.now();
  const order = {
    id,
    created: new Date().toISOString(),
    status: 'pending',
    payload: req.body
  };
  orders.push(order);
  writeOrders(orders);
  res.json({ok:true,id});
});

// API list orders (admin - no auth here; in real site add auth)
app.get('/api/orders', (req, res)=>{
  res.json(readOrders());
});

// API confirm order (admin marks paid)
app.post('/api/orders/:id/confirm', (req,res)=>{
  const orders = readOrders();
  const id = req.params.id;
  const o = orders.find(x=>x.id===id);
  if(!o) return res.status(404).json({error:'not found'});
  o.status = 'paid';
  o.paidAt = new Date().toISOString();
  writeOrders(orders);
  res.json({ok:true});
});

app.listen(PORT, ()=> console.log('Server listening on', PORT));
