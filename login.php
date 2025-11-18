<?php
require_once 'inc/functions.php';
session_start();
if($_SERVER['REQUEST_METHOD']==='POST'){
    $email = $mysqli->real_escape_string(trim($_POST['email']));
    $pass = $_POST['password'];
    $fullname = $mysqli->real_escape_string(trim($_POST['fullname']));
    if(!$email || !$pass){ $err="Nhập email và mật khẩu"; }
    else {
        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $stmt = $mysqli->prepare("INSERT INTO users (email,password,fullname) VALUES (?,?,?)");
        $stmt->bind_param("sss",$email,$hash,$fullname);
        if($stmt->execute()){
            $_SESSION['user_id'] = $stmt->insert_id;
            header("Location: index.php"); exit;
        } else $err="Email đã tồn tại";
    }
}
?>
<!doctype html><html><head><meta charset="utf-8"><title>Đăng ký</title><link rel="stylesheet" href="assets/css/style.css"></head>
<body><div class="wrap">
<h2>Đăng ký</h2>
<?php if(isset($err)) echo "<p class='err'>".h($err)."</p>"; ?>
<form method="post">
  <input name="fullname" placeholder="Họ tên" required>
  <input name="email" placeholder="Email" required>
  <input name="password" type="password" placeholder="Mật khẩu" required>
  <button type="submit" class="btn">Đăng ký</button>
</form>
</div></body></html>
