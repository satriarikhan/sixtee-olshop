<?php
session_start();
require_once __DIR__ . '/database.php';

$kataCari = trim($_GET['q'] ?? '');
$sort = $_GET['sort'] ?? 'terbaru';
$order = $sort === 'termurah' ? 'harga_produk ASC' : ($sort === 'termahal' ? 'harga_produk DESC' : 'id_produk DESC');
$filter = $kataCari ? " WHERE nama_produk ILIKE '%" . $koneksi->real_escape_string($kataCari) . "%'" : '';
$ambil = $koneksi->query("SELECT * FROM tb_produk{$filter} ORDER BY {$order}");
$jumlahProduk = $ambil ? $ambil->num_rows : 0;
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Katalog | SIXTEE SHOP</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="public.css">
  <script src="public.js"></script>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container">
      <a class="navbar-brand" href="index.php">SIXTEE SHOP</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mainNav" aria-label="Buka navigasi"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item"><a class="nav-link" href="index.php">Beranda</a></li>
          <li class="nav-item active"><a class="nav-link" href="katalog.php">Katalog</a></li>
          <li class="nav-item"><a class="nav-link" href="keranjang.php">Keranjang</a></li>
          <li class="nav-item"><a class="nav-link" href="form.php">Ulasan</a></li>
          <li class="nav-item"><a class="nav-link" href="checkout.php">Checkout</a></li>
          <?php if (isset($_SESSION['pelanggan'])): ?>
            <li class="nav-item"><a class="nav-link" href="riwayat.php">Riwayat</a></li>
            <li class="nav-item"><a class="nav-link" href="logout.php">Keluar</a></li>
          <?php else: ?>
            <li class="nav-item"><a class="nav-link" href="login.php">Login</a></li>
          <?php endif; ?>
        </ul>
        <form class="form-inline my-2 my-lg-0" method="GET">
          <input class="form-control mr-sm-2" type="search" name="q" value="<?= htmlspecialchars($kataCari) ?>" placeholder="Cari produk..." aria-label="Cari produk">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Cari</button>
        </form>
      </div>
    </div>
  </nav>

  <main class="catalog-page container py-5">
    <div class="catalog-hero">
      <div>
        <span class="eyebrow">SIXTEE SELECTS</span>
        <h1>Temukan barang favoritmu.</h1>
        <p>Jelajahi koleksi pilihan kami dan temukan produk yang pas untuk kebutuhanmu.</p>
      </div>
      <div class="catalog-hero__number">01<br><small>KOLEKSI</small></div>
    </div>

    <div class="catalog-toolbar">
      <div><strong><?= $jumlahProduk ?></strong> produk tersedia<?= $kataCari ? ' untuk "' . htmlspecialchars($kataCari) . '"' : '' ?></div>
      <form method="GET" class="catalog-sort">
        <input type="hidden" name="q" value="<?= htmlspecialchars($kataCari) ?>">
        <label for="sort">Urutkan</label>
        <select id="sort" name="sort" onchange="this.form.submit()">
          <option value="terbaru" <?= $sort === 'terbaru' ? 'selected' : '' ?>>Terbaru</option>
          <option value="termurah" <?= $sort === 'termurah' ? 'selected' : '' ?>>Harga terendah</option>
          <option value="termahal" <?= $sort === 'termahal' ? 'selected' : '' ?>>Harga tertinggi</option>
        </select>
      </form>
    </div>

    <div class="row">
      <?php if ($jumlahProduk === 0): ?>
        <div class="col-12"><div class="empty-catalog"><span class="empty-catalog__icon">+</span><h3>Produk tidak ditemukan</h3><p>Coba kata kunci lain untuk menemukan produk yang kamu cari.</p><a href="katalog.php" class="btn btn-warning">Tampilkan semua produk</a></div></div>
      <?php else: ?>
        <?php while ($produk = $ambil->fetch_assoc()): ?>
          <div class="col-sm-6 col-lg-3">
            <article class="card product-card mb-4">
              <a href="detailproduk.php?id=<?= $produk['id_produk'] ?>" class="product-card__image-link">
                <img src="images/<?= htmlspecialchars($produk['foto_produk']) ?>" class="card-img-top product-image" alt="<?= htmlspecialchars($produk['nama_produk']) ?>" height="240">
              </a>
              <div class="card-body">
                <span class="product-card__tag">READY STOCK</span>
                <h2 class="card-title h6"><?= htmlspecialchars($produk['nama_produk']) ?></h2>
                <div class="product-price">Rp <?= number_format($produk['harga_produk'], 0, ',', '.') ?></div>
                <p class="card-text"><?= htmlspecialchars(substr($produk['deskripsi_produk'], 0, 58)) ?>...</p>
                <div class="product-actions"><a href="beli.php?id=<?= $produk['id_produk'] ?>" class="btn btn-primary">Beli</a><a href="detailproduk.php?id=<?= $produk['id_produk'] ?>" class="btn btn-warning">Detail</a></div>
              </div>
            </article>
          </div>
        <?php endwhile; ?>
      <?php endif; ?>
    </div>
  </main>

  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
</body>
</html>
