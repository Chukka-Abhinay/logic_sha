<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class Database {
  private $host = 'localhost';
  private $dbname = 'auth_system';
  private $user = 'root';
  private $pass = '';
  private $conn;

  public function __construct() {
    try {
      $this->conn = new PDO("mysql:host=$this->host;dbname=$this->dbname", $this->user, $this->pass);
      $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch(PDOException $e) {
      die("Connection failed: " . $e->getMessage());
    }
  }

  public function registerUser($email, $c1, $c2, $sw1, $sw2) {
    $stmt = $this->conn->prepare("INSERT INTO users (email, c1, c2, sw1, sw2) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$email, $c1, $c2, $sw1, $sw2]);
  }

  public function getUser($email) {
    $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }
  public function getUserByEmail($email) {
    try {
      $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = :email");
      $stmt->bindParam(':email', $email);
      $stmt->execute();
      return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
      throw new Exception("Database query failed: " . $e->getMessage());
    }
  }
}
?>