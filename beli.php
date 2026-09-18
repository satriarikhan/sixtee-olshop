<?php 

	// pertama membuat session
	session_start();
	require_once __DIR__ . '/database.php';

	// Mengambil id dari URL
	$id_produk = $_GET['id'];

	// Jika produk ada dikeranjang maka +1 dari produk yang dibeli

	if (isset($_SESSION['keranjang'][$id_produk])) {
		$_SESSION['keranjang'][$id_produk]+=1;
	} else{
		$_SESSION['keranjang'][$id_produk]=1;
	}

	echo user_toast('Produk ditambahkan ke keranjang', 'success');
	echo "<script>location='keranjang.php';</script>";
 ?>

