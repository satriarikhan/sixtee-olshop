<?php 

	require_once __DIR__ . '/database.php';
	$ambildata = $koneksi->query("SELECT * FROM provinsi WHERE id_prov='$_GET[id_prov]'")->fetch_assoc();
	$data_ongkir = array('ongkir'   =>  $ambildata['ongkir']);
    
 	echo json_encode($data_ongkir);
?>