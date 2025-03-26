<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Max-Age: 86400");
    header("Content-Length: 0");
    http_response_code(204);
    exit;
}

// Set CORS headers for actual request
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Hheaders: Content-Type");
header("Content-Type: application/json");

require_once 'db.php';
require_once 'encryption.php';

try {
    $jsonInput = file_get_contents('php://input');
    $data = json_decode($jsonInput, true);
    
    // Input validation
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input");
    }
    
    $required = ['email', 'R1', 'R2', 'key'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing field: $field");
        }
    }

    $db = new Database();
    $user = $db->getUserByEmail($data['email']);
 
  if (!$user) throw new Exception("User not found");
  
  // Compute SK1/SK2
  $SK1 = hash('sha256', $data['key'] . $user['sw1']);
  $SK2 = hash('sha256', $data['key'] . $user['sw2']);
  
  // Decrypt stored values
  $RD1 = decryptData($user['c1'], $SK1);
  $RD2 = decryptData($user['c2'], $SK2);
  
  // Compare values
  if ($data['R1'] === $RD1 && $data['R2'] === $RD2) {
    echo json_encode(['message' => 'Login successful!']);
  } else {
    throw new Exception("Authentication failed");
  }
} catch(Exception $e) {
  http_response_code(401);
  echo json_encode(['message' => 'Error: ' . $e->getMessage()]);
}
?>