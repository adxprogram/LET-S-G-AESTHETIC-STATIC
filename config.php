<?php
$host = 'localhost';
$db = 'letslycx_wellness';
$user = 'letslycx_admin';
$password = 'HpGFcqQ3NaF2hwH';

$conn = new mysqli($host, $user, $password, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>
