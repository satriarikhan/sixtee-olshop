<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Koneksi database
require_once __DIR__ . '/database.php';

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Ambil data dari form
$rating = isset($_POST['rating']) ? intval($_POST['rating']) : 0;
$coment = isset($_POST['coment']) ? $conn->real_escape_string($_POST['coment']) : '';

// Validasi dan simpan
if ($rating >= 1 && $rating <= 5 && !empty($coment)) {
    $sql = "INSERT INTO ulasan (rating, coment) VALUES ($rating, '$coment')";
    if ($conn->query($sql) !== false) {
        header("Location: index.php");
        exit();
    } else {
        echo "Gagal menyimpan: " . $conn->error;
    }
} else {
    echo "Data ulasan tidak valid.";
}

$conn->close();
?>
