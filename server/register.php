<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
  header("Access-Control-Allow-Methods: POST, OPTIONS");
  header("Access-Control-Allow-Headers: Content-Type");
  header("Access-Control-Max-Age: 86400");  // 24 hours cache
  header("Content-Length: 0");
  http_response_code(204);
  exit;
}

// Set CORS headers for actual request
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
require_once 'db.php';
require_once 'encryption.php';

try {
    // Validate JSON input
    $jsonInput = file_get_contents('php://input');
    $data = json_decode($jsonInput, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON format");
    }

    // Validate required fields
    $requiredFields = ['email', 'R1', 'R2', 'key'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            throw new Exception("Missing or empty required field: $field");
        }
    }

    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    $db = new Database();
    
    // Check if email already exists
    if ($db->getUserByEmail($data['email'])) {
        throw new Exception("Email already registered");
    }

    // Generate unique secrets with proper length
    $sw1 = bin2hex(random_bytes(16)); // 32 characters
    $sw2 = bin2hex(random_bytes(16)); // 32 characters

    // Compute encryption keys
    $SK1 = hash('sha256', $data['key'] . $sw1);
    $SK2 = hash('sha256', $data['key'] . $sw2);

    // Encrypt values with proper error handling
    $c1 = encryptData($data['R1'], $SK1);
    $c2 = encryptData($data['R2'], $SK2);

    if (!$c1 || !$c2) {
        throw new Exception("Encryption failed");
    }

    // Store in database
    $db->registerUser(
        $data['email'],
        $c1,
        $c2,
        $sw1,
        $sw2
    );

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful'
    ]);

} catch(PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database operation failed'
    ]);
} catch(Exception $e) {
    error_log("Registration Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

exit;
?>