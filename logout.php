<?php
require_once __DIR__ . '/database.php';
	session_start();

	session_destroy();
	echo user_toast('Anda berhasil keluar', 'success');
	echo "<script>location='index.php';</script>";
 ?>