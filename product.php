<?php
require_once 'inc/functions.php';
session_start();
$id = intval($_GET['id'] ?? 0);
$res = $mysqli->query("SELECT * FROM products WHERE id={$id} LIMIT 1");
if(!$res || $res->num_rows==0){ header("Location: index.php"); exit; }
$p = $res->fetch_assoc();
?>
<!doctype html>
<html><head><meta charset="utf-8"><title><?php echo h($p['title']); ?></title><link rel="stylesheet" href="assets/css/style.css"></head>
<body>
<div class="wrap">
  <a href="index.php">← Trở về</a>
  <h1><?php echo h($p['title']); ?></h1>
  <img src="<?php echo h($p['image'] ? $p['image'] : 'assets/uploads/placeholder.png'); ?>" style="max-width:360px">
  <p><?php echo h($p['description']); ?></p>
  <p class="price"><?php echo money($p['price']); ?></p>

  <form method="post" action="cart.php">
    <input type="hidden" name="product_id" value="<?php echo $p['id']; ?>">
    <label>Số lượng: <input type="number" name="qty" value="1" min="1"></label><br>
    <button type="submit" class="btn">Thêm vào giỏ & Thanh toán</button>
  </form>
</div>
</body></html>
