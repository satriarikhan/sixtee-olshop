<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// Koneksi ke database
require_once __DIR__ . '/database.php';
if ($koneksi->connect_error) {
    die("Koneksi gagal: " . $koneksi->connect_error);
}

// Periksa parameter ID pembelian
if (!isset($_GET['id'])) {
    die("ID pembayaran tidak ditemukan.");
}
$id_pembayaran = $koneksi->real_escape_string($_GET['id']);

// Ambil data pembelian
$query = "SELECT * FROM tb_pembelian WHERE id_pembelian='$id_pembayaran'";
$ambil = $koneksi->query($query);
if (!$ambil) {
    die("Query error: " . $koneksi->error);
}
$pecah = $ambil->fetch_assoc();
if (!$pecah) {
    die("Data pembelian tidak ditemukan.");
}

// Validasi session pelanggan
if (!isset($_SESSION['pelanggan'])) {
    die("Session pelanggan tidak ditemukan.");
}
$id_pelanggan_login = $_SESSION['pelanggan']['id_pelanggan'];
$id_pelanggan_beli = $pecah['id_pelanggan'];

if ($id_pelanggan_beli != $id_pelanggan_login) {
    echo user_toast('Pesanan ini tidak dapat diakses.', 'error');
    echo "<script>location='riwayat.php';</script>";
    exit();
}

// Ambil data pembayaran
$queryPembayaran = "SELECT * FROM tb_pembayaran WHERE id_pembelian='$id_pembayaran'";
$ambilPembayaran = $koneksi->query($queryPembayaran);
$row = $ambilPembayaran->fetch_assoc();

$bank_pengiriman = $row['bank'] ?? $pecah['bank_pengiriman'] ?? '';
$jumlah_pembayaran = $row['jumlah'] ?? $pecah['total_pembelian'] ?? 0;
$tanggal_pembayaran = $row['tanggal'] ?? '';
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="public.css">
    <script src="public.js"></script>
    <title>SIXTEE OLSHOP</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar navbar-expand-lg navbar-light bg-warning">
    <div class="container">
        <a class="navbar-brand" href="#">SIXTEE SHOP</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item"><a class="nav-link" href="index.php">Beranda</a></li>
                <li class="nav-item"><a class="nav-link" href="keranjang.php">Keranjang</a></li>
                <li class="nav-item"><a class="nav-link" href="checkout.php">Checkout</a></li>
                <?php if (isset($_SESSION["pelanggan"])) : ?>
                    <li class="nav-item active"><a href="riwayat.php" class="nav-link">Riwayat</a></li>
                    <li class="nav-item"><a class="nav-link" href="logout.php">Log Out</a></li>
                <?php else : ?>
                    <li class="nav-item"><a class="nav-link" href="login.php">Login</a></li>
                <?php endif; ?>
            </ul>
            <form class="form-inline my-2 my-lg-0">
                <input class="form-control mr-sm-2" type="search" placeholder="Search">
                <button class="btn btn-outline-success" type="submit">Search</button>
            </form>
        </div>
    </div>
</nav>

<!-- KONTEN -->
<div class="container mt-4">
    <h3>Konfirmasi Pembayaran</h3>
    <form method="POST" enctype="multipart/form-data">
        <div class="col-md-6">
            <div class="form-group">
                <label>Nama Penyetor</label>
                <input type="text" class="form-control" name="nama" required>

                <label>Bank Pengirim</label>
                <input type="text" class="form-control" name="bank_pengirim" value="<?php echo htmlspecialchars($bank_pengiriman); ?>" required>   

                <label>Jumlah</label>
                <input type="text" class="form-control" name="jumlah" value="Rp. <?php echo number_format($jumlah_pembayaran, 2); ?>" readonly>                

                <label>Tanggal Pembayaran</label>
                <input type="date" class="form-control" name="tanggal" value="<?php echo $tanggal_pembayaran; ?>" required>

                <label>Upload Foto Bukti Transfer</label><br>
                <input type="file" name="bukti" accept="image/jpeg" required>
                <p class="text-danger">Foto Harus Format *JPG</p>

                <button class="btn btn-primary" name="kirim">Kirim</button>
            </div>
        </div>
    </form>
</div>

<?php
if (isset($_POST['kirim'])) {
    // Validasi file upload
    $allowed = ['jpg', 'jpeg'];
    $ext = strtolower(pathinfo($_FILES['bukti']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        die("Format file harus JPG.");
    }

    // Upload file
    $namabukti = $_FILES['bukti']['name'];
    $lokasibukti = $_FILES['bukti']['tmp_name'];
    $namafoto = date('YmdHis') . '_' . $namabukti;
    if (!move_uploaded_file($lokasibukti, "foto_bukti/$namafoto")) {
        die("Gagal mengupload file.");
    }

    // Ambil data dari form
    $nama = $koneksi->real_escape_string($_POST['nama']);
    $bank = $koneksi->real_escape_string($_POST['bank_pengirim']);
    $jumlah = $jumlah_pembayaran; // jumlah dari pesanan sebelumnya
    $tanggal = $koneksi->real_escape_string($_POST['tanggal']);

    // Simpan ke tabel pembayaran
    $query = "INSERT INTO tb_pembayaran (id_pembelian, nama, bank, jumlah, tanggal, bukti)
              VALUES ('$id_pembayaran', '$nama', '$bank', '$jumlah', '$tanggal', '$namafoto')";
    if (!$koneksi->query($query)) {
        die("Query error saat insert pembayaran: " . $koneksi->error);
    }

    // Update status pembelian
    $query = "UPDATE tb_pembelian SET status='Menunggu Konfirmasi' WHERE id_pembelian='$id_pembayaran'";
    if (!$koneksi->query($query)) {
        die("Query error saat update status: " . $koneksi->error);
    }

    echo user_toast('Terima kasih, bukti pembayaran berhasil dikirim.', 'success');
    echo "<script>location = 'riwayat.php';</script>";
}
?>

<!-- JS -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
</body>
</html>
    