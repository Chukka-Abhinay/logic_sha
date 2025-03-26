<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'db.php';
require_once 'encryption.php';

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

try {
  $db = new Database();
  $user = $db->getUser($data['email']);
  
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