<?php
// inc/config.php
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Database config — thay bằng thông tin hosting của bạn
define('DB_HOST','localhost');
define('DB_USER','your_db_user');
define('DB_PASS','your_db_pass');
define('DB_NAME','your_db_name');

define('SHOP_NAME','ShopBinBoi.Vn');

// path for uploads
define('UPLOAD_DIR', __DIR__ . '/../assets/uploads/');

// base url of site (ví dụ https://yourdomain.com/shopbinboi)
// dùng để tạo link ảnh khi hiển thị
define('BASE_URL','https://yourdomain.com/shopbinboi'); 

// admin email (dùng để đăng nhập admin)
define('ADMIN_EMAIL','admin@shopbinboi.vn');

$mysqli = new mysqli(DB_HOST,DB_USER,DB_PASS,DB_NAME);
if($mysqli->connect_errno){
    die("DB connect error: " . $mysqli->connect_error);
}
$mysqli->set_charset("utf8mb4");
