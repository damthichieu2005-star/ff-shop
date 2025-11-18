<?php
require_once __DIR__ . '/../inc/functions.php';
session_start();
$user = current_user();
if(!$user || $user['email'] !== 'admin@shopbinboi.vn'){ header("Location: ../login.php"); exit; }

// handle add product
if($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['action']) && $_POST['action']=='add'){
    $title = $mysqli->real_escape_string($_POST['title']);
    $desc = $mysqli->real_escape_string($_POST['description']);
    $price = intval($_POST['price']);
    $warranty = intval($_POST['warranty'] ?? 15);

    $image_url = null;
    if(isset($_FILES['image']) && $_FILES['image']['error']===0){
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fn = 'prod_'.time().'.'.$ext;
        $dest = UPLOAD_DIR . $fn;
        if(move_uploaded_file($_FILES['image']['tmp_name'],$dest)){
            $image_url = linked_url('assets/uploads/'.$fn);
        }
    }
    $stmt = $mysqli->prepare("INSERT INTO products (title,description,price,image,warranty_days) VALUES (?,?,?,?,?)");
    $stmt->bind_param("ssisi",$title,$desc,$price,$image_url,$warranty);
    $stmt->execute();
    header("Location: products.php");
    exit;
}

// handle delete
if(isset($_GET['delete'])){
    $id = intval($_GET['delete']);
    $mysqli->query("DELETE FROM products WHERE id={$id}");
    header("Location: products.php");
    exit;
}

$res = $mysqli->query("SELECT * FROM products ORDER BY created_at DESC");
?>
<!doctype html><html><head><meta charset="utf-8"><title>Products</title><link rel="stylesheet" href="../assets/css/style.css"></head><body>
<div class="wrap admin">
  <h2>Quản lý sản phẩm</h2>
  <form method="post" enctype="multipart/form-data">
    <input name="title" placeholder="Tiêu đề" required>
    <textarea name="description" placeholder="Mô tả"></textarea>
    <input name="price" placeholder="Giá" required>
    <input name="warranty" placeholder="Bảo hành (ngày)" value="15">
    <input type="file" name="image" accept="image/*">
    <input type="hidden" name="action" value="add">
    <button type="submit" class="btn">Thêm sản phẩm</button>
  </form>

  <h3>Danh sách</h3>
  <?php while($p = $res->fetch_assoc()): ?>
    <div class="card">
      <img src="<?php echo h($p['image']?:'../assets/uploads/placeholder.png'); ?>" style="width:140px;height:90px;object-fit:cover">
      <h4><?php echo h($p['title']); ?></h4>
      <div><?php echo money($p['price']); ?></div>
      <div>Bảo hành: <?php echo intval($p['warranty_days']); ?> ngày</div>
      <a href="products.php?delete=<?php echo $p['id']; ?>" onclick="return confirm('Xóa?')">Xóa</a>
    </div>
  <?php endwhile; ?>
</div>
</body></html>
