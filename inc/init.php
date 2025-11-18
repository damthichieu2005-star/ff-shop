<?php
// init.php — chạy 1 lần rồi xóa
require_once __DIR__ . '/inc/config.php';

$sql = "
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(200) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(200) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL DEFAULT 0,
  image VARCHAR(500) DEFAULT NULL,
  warranty_days INT DEFAULT 15,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  fullname VARCHAR(200),
  phone VARCHAR(50),
  total INT,
  status VARCHAR(50) DEFAULT 'pending',
  note TEXT,
  proof_image VARCHAR(500) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* create default admin user (email admin@shopbinboi.vn, pass: mhieu2007@) */
INSERT IGNORE INTO users (email,password,fullname) VALUES (
  'admin@shopbinboi.vn',
  '". password_hash('mhieu2007@', PASSWORD_DEFAULT) ."',
  'Admin'
);
";

$res = $mysqli->multi_query($sql);
if($res){
    echo "Init completed. Please delete init.php for security.";
} else {
    echo "Init error: " . $mysqli->error;
}
