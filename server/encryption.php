<?php
function generateSecret() {
  return bin2hex(random_bytes(16));
}

function encryptData($data, $key) {
  $iv = openssl_random_pseudo_bytes(16);
  $encrypted = openssl_encrypt($data, 'aes-256-cbc', $key, 0, $iv);
  return base64_encode($encrypted . '::' . $iv);
}

function decryptData($encrypted, $key) {
  list($data, $iv) = explode('::', base64_decode($encrypted), 2);
  return openssl_decrypt($data, 'aes-256-cbc', $key, 0, $iv);
}
?>