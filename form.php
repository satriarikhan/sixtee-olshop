<?php
session_start();
require_once __DIR__ . '/database.php';

if (!isset($_SESSION['pelanggan'])) {
    header('Location: login.php');
    exit;
}

$ulasan = $koneksi->query('SELECT * FROM ulasan ORDER BY created_at DESC');
$namaPelanggan = $_SESSION['pelanggan']['nama_pelanggan'] ?? 'Pelanggan';
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ulasan | SIXTEE SHOP</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">
  <link rel="stylesheet" href="public.css">
  <script src="public.js"></script>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container">
      <a class="navbar-brand" href="index.php">SIXTEE SHOP</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#mainNav" aria-label="Buka navigasi">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item"><a class="nav-link" href="index.php">Beranda</a></li>
          <li class="nav-item"><a class="nav-link" href="katalog.php">Katalog</a></li>
          <li class="nav-item"><a class="nav-link" href="keranjang.php">Keranjang</a></li>
          <li class="nav-item active"><a class="nav-link" href="form.php">Ulasan</a></li>
          <li class="nav-item"><a class="nav-link" href="riwayat.php">Riwayat</a></li>
        </ul>
        <a class="btn btn-outline-secondary" href="logout.php">Keluar</a>
      </div>
    </div>
  </nav>

  <main class="review-page container py-5">
    <div class="review-intro">
      <span class="eyebrow">CERITA PELANGGAN</span>
      <h1>Pengalaman belanja Anda berarti.</h1>
      <p>Bantu kami membuat SIXTEE SHOP lebih baik dengan membagikan pengalaman Anda.</p>
    </div>

    <div class="row align-items-start">
      <div class="col-lg-5 mb-4">
        <form action="submit_ulasan.php" method="POST" class="review-form">
          <span class="review-form__label">ULASAN BARU</span>
          <h2>Bagaimana pengalamanmu, <?= htmlspecialchars($namaPelanggan) ?>?</h2>
          <p class="text-muted">Pilih penilaian dan ceritakan pengalaman belanjamu.</p>
          <fieldset class="rating-picker">
            <legend>Penilaian</legend>
            <div class="rating-options">
              <?php for ($rating = 5; $rating >= 1; $rating--): ?>
                <input type="radio" id="rating-<?= $rating ?>" name="rating" value="<?= $rating ?>" <?= $rating === 5 ? 'required' : '' ?> >
                <label for="rating-<?= $rating ?>" title="<?= $rating ?> dari 5">
                  <span aria-hidden="true">&#9733;</span>
                  <small><?= $rating ?></small>
                </label>
              <?php endfor; ?>
            </div>
          </fieldset>
          <label for="coment">Komentar</label>
          <textarea id="coment" name="coment" rows="5" placeholder="Apa yang paling kamu sukai?" required></textarea>
          <button type="submit" class="btn btn-primary btn-block">Kirim ulasan <span aria-hidden="true">&rarr;</span></button>
        </form>
      </div>

      <div class="col-lg-7">
        <div class="review-list-heading">
          <div>
            <span class="eyebrow">DARI MEREKA</span>
            <h2>Ulasan pelanggan</h2>
          </div>
          <span class="review-count"><?= $ulasan ? $ulasan->num_rows : 0 ?> ulasan</span>
        </div>
        <div class="review-list">
          <?php if (!$ulasan || $ulasan->num_rows === 0): ?>
            <div class="empty-catalog"><h3>Belum ada ulasan</h3><p>Jadilah pelanggan pertama yang berbagi pengalaman.</p></div>
          <?php else: ?>
            <?php while ($item = $ulasan->fetch_assoc()): ?>
              <article class="review-item">
                <div class="review-item__top">
                  <div class="review-avatar"><?= htmlspecialchars(strtoupper(substr($namaPelanggan, 0, 1))) ?></div>
                  <div>
                    <strong>Pelanggan SIXTEE</strong>
                    <div class="review-stars" aria-label="<?= (int) $item['rating'] ?> dari 5 bintang">
                      <?= str_repeat('&#9733;', (int) $item['rating']) ?><span><?= str_repeat('&#9733;', 5 - (int) $item['rating']) ?></span>
                    </div>
                  </div>
                </div>
                <p><?= htmlspecialchars($item['coment']) ?></p>
              </article>
            <?php endwhile; ?>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </main>

  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
</body>
</html>
