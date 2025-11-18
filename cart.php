<?php
require_once 'inc/functions.php';
session_start();

// add to cart or checkout create order
if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $product_id = intval($_POST['product_id'] ?? 0);
    $qty = max(1,intval($_POST['qty'] ?? 1));

    // get product
    $res = $mysqli->query("SELECT * FROM products WHERE id={$product_id} LIMIT 1");
    if(!$res || $res->num_rows==0){ header("Location: index.php"); exit; }
    $p = $res->fetch_assoc();

    // if user logged in -> create order record with pending status and redirect to upload proof
    if(isset($_SESSION['user_id'])){
        $user = current_user();
        $fullname = $user['fullname'];
        $phone = ''; // could ask customer for phone - simplify for now
        $total = intval($p['price']) * $qty;
        $stmt = $mysqli->prepare("INSERT INTO orders (user_id, fullname, phone, total, status, note) VALUES (?,?,?,?,?,?)");
        $status = 'pending';
        $note = "Product: {$p['title']} x{$qty}";
        $stmt->bind_param("ississ", $_SESSION['user_id'], $fullname, $phone, $total, $status, $note);
        $stmt->execute();
        $order_id = $stmt->insert_id;
        header("Location: order_upload.php?id={$order_id}");
        exit;
    } else {
        // save selection in session for guest; redirect to register/login
        $_SESSION['pending_product'] = ['id'=>$p['id'],'title'=>$p['title'],'qty'=>$qty,'price'=>$p['price']];
        header("Location: login.php?redirect=cart");
        exit;
    }
}
header("Location: index.php");
exit;
