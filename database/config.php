<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'letslycx_admin');
define('DB_PASS', 'HpGFcqQ3NaF2hwH');
define('DB_NAME', 'letslycx_wellness');

function get_db(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $conn->connect_error]);
        exit;
    }
    $conn->set_charset('utf8mb4');
    return $conn;
}