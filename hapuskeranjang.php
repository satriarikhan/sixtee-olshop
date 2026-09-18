<?php 

	session_start();
	require_once __DIR__ . '/database.php';
	$id_produk = $_GET["id"];
	unset($_SESSION["keranjang"][$id_produk]);

	echo user_toast('Produk dihapus dari keranjang', 'success');
	echo "<script> location = 'keranjang.php'; </script>";

?>