<?php
require_once 'inc/functions.php';
session_start();
$id = intval($_GET['id'] ?? 0);
$res = $mysqli->query("SELECT * FROM orders WHERE id={$id} LIMIT 1");
if(!$res || $res->num_rows==0) { echo "Đơn không tồn tại"; exit; }
$order = $res->fetch_assoc();

// handle upload
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['proof'])){
    $f = $_FILES['proof'];
    if($f['error']===0){
        $ext = pathinfo($f['name'], PATHINFO_EXTENSION);
        $fn = 'proof_'.$id.'_'.time().'.'.$ext;
        $dest = UPLOAD_DIR . $fn;
        if(move_uploaded_file($f['tmp_name'],$dest)){
            $url = linked_url('assets/uploads/'.$fn);
            $mysqli->query("UPDATE orders SET proof_image='".$mysqli->real_escape_string($url)."', status='waiting' WHERE id={$id}");
            echo "Đã gửi hoá đơn. Admin sẽ kiểm tra và xác nhận.";
        } else echo "Lỗi lưu file.";
    } else echo "Lỗi upload.";
}
?>
<!doctype html><html><head><meta charset="utf-8"><title>Upload hóa đơn</title><link rel="stylesheet" href="assets/css/style.css"></head>
<body><div class="wrap">
  <h2>Đơn hàng #<?php echo $order['id']; ?></h2>
  <p>Tổng: <?php echo money($order['total']); ?></p>
  <p>Nội dung chuyển khoản: <b>Mua Acc GiaRE.BinBoi</b></p>
  <form method="post" enctype="multipart/form-data">
    <label>Chọn ảnh hóa đơn / giao dịch</label>
    <input type="file" name="proof" accept="image/*" required>
    <button type="submit" class="btn">Gửi hóa đơn</button>
  </form>
</div></body></html>
