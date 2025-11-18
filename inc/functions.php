<?php
// inc/functions.php
require_once __DIR__ . '/config.php';

function h($s){ return htmlspecialchars($s, ENT_QUOTES); }

function linked_url($path){
    return rtrim(BASE_URL, '/') . '/' . ltrim($path, '/');
}

// current user helper
function current_user(){
    global $mysqli;
    if(session_status() === PHP_SESSION_NONE) session_start();
    if(!isset($_SESSION['user_id'])) return null;
    $id = intval($_SESSION['user_id']);
    $res = $mysqli->query("SELECT id,email,fullname FROM users WHERE id={$id} LIMIT 1");
    return $res ? $res->fetch_assoc() : null;
}

// format money
function money($v){ return number_format($v,0,',','.') . '₫'; }
