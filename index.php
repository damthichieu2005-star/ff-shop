<?php
require_once 'inc/functions.php';
session_start();
$user = current_user();
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title><?php echo SHOP_NAME; ?></title>
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header>
  <div class="wrap">
    <h1><?php echo SHOP_NAME; ?></h1>
    <div class="top-right">
      <?php if($user): ?>
        <span>Xin chào, <?php echo h($user['fullname']); ?></span>
        <a href="logout.php">Đăng xuất</a>
      <?php else: ?>
        <a href="login.php">Đăng nhập</a> | <a href="register.php">Đăng ký</a>
      <?php endif; ?>
      <a href="admin/index.php" class="admin-link">Admin</a>
    </div>
  </div>
</header>

<main class="wrap">
  <section class="bank">
    <p>MB: <strong>0347676833</strong> — NGÂN MINH HIẾU</p>
    <p>Nội dung chuyển khoản: <strong>Mua Acc GiaRE.BinBoi</strong></p>
    <img src="assets/uploads/qr.png" alt="QR" class="qr">
  </section>

  <section>
    <h2>Sản phẩm</h2>
    <div class="grid">
      <?php
      $res = $mysqli->query("SELECT * FROM products ORDER BY created_at DESC");
      while($p = $res->fetch_assoc()):
      ?>
        <div class="card">
          <img src="<?php echo h($p['image'] ? $p['image'] : 'assets/uploads/placeholder.png'); ?>" alt="">
          <h3><?php echo h($p['title']); ?></h3>
          <p><?php echo h($p['description']); ?></p>
          <div class="price"><?php echo money($p['price']); ?></div>
          <a class="btn" href="product.php?id=<?php echo $p['id']; ?>">Xem & Mua</a>
        </div>
      <?php endwhile; ?>
    </div>
  </section>
</main>
</body>
</html>
