<?php  
  session_start();
  require_once __DIR__ . '/database.php';
  $kataCari = trim($_GET['q'] ?? '');
?>

<!doctype html>
<html lang="id">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link href="public.css" rel="stylesheet">
    <script src="public.js"></script>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <style>
    .wa-chat-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: red;
      color: white;
      padding: 10px 16px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      z-index: 9999;
    }
    .wa-chat-button {
           display: flex;
            align-items: center;
            text-decoration: none;
            color: #333;
            background-color: #f0f0f0;
            border-radius: 20px;
            padding: 10px 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: background-color 0.3s ease;
        }
        .wa-chat-button:hover {
            background-color: #e0e0e0;
        }
        .wa-chat-button img {
            width: 36px;
            height: 36px;
            display: block;
            margin-right: 10px;
        }
        .wa-chat-button span {
             font-size: 20px;
            font-weight: bold;
            line-height: 1;
        }
    footer {
    background-color: #333;
    color: #fff;
    padding-top: 20px;
    font-size: 14px;
}

/* Footer Top Navigation (tetap sama) */
.footer-top-nav {
    background-color: #444;
    padding: 10px 0;
    border-bottom: 1px solid #555;
    text-align: center;
}

.footer-top-nav nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.footer-top-nav nav ul li {
    margin: 0 15px;
}

.footer-top-nav nav ul li a {
    color: #fff;
    text-decoration: none;
    padding: 5px 0;
    display: block;
    transition: color 0.3s ease;
}

.footer-top-nav nav ul li a:hover {
    color: #f0f0f0;
}

/* Main Footer Content (tetap sama) */
.footer-main-content {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    padding: 20px 5%;
    max-width: 1200px;
    margin: 0 auto;
}

.footer-column {
    flex: 1;
    min-width: 200px;
    margin: 20px 15px;
}

.footer-column h3 {
    color: #eee;
    font-size: 16px;
    margin-bottom: 15px;
    text-transform: uppercase;
}

.footer-column ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-column ul li {
    margin-bottom: 8px;
}

.footer-column ul li a {
    color: #ccc;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-column ul li a:hover {
    color: #fff;
}

/* Customer Support Specific Styles (tetap sama) */
.contact-list li {
    display: flex;
    align-items: center;
    color: #ccc;
}

.contact-list li i {
    margin-right: 8px;
    color: #fff;
    width: 20px;
    text-align: center;
}

.contact-list li a {
    color: #ccc;
}
.contact-list li a:hover {
    color: #fff;
}

.sister-site-title {
    margin-top: 20px;
}

/* Payment, Shipping, Security Logos */
.logo-grid {
    display: grid;
    /* Mengatur kolom agar setiap "slot" memiliki lebar yang sama */
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); /* Ubah minmax jika perlu, ini adalah lebar slot minimal */
    gap: 10px;
    margin-top: 10px;
}

/* KUNCI UTAMA UNTUK MENYERAGAMKAN KOTAK GAMBAR */
.logo-grid img {
    /* Mengatur ukuran kotak tempat gambar berada */
    width: 100%; /* Gambar akan mengisi 100% dari lebar kolom gridnya */
    height: 40px; /* Tentukan tinggi tetap untuk semua kotak gambar */
    object-fit: contain; /* PENTING: Menyesuaikan gambar agar pas tanpa terpotong atau terdistorsi */
    background-color: #fff;
    padding: 5px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: block; /* Pastikan gambar berperilaku sebagai blok */
}

/* Social Media Icons (tetap sama) */
.social-icons {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.social-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    background-color: #555;
    color: #fff;
    border-radius: 50%;
    font-size: 18px;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.social-icon:hover {
    background-color: #007bff;
}

/* Footer Bottom Copyright (tetap sama) */
.footer-bottom-copyright {
    background-color: #222;
    text-align: center;
    padding: 15px 0;
    color: #aaa;
    margin-top: 20px;
}

/* Responsive Adjustments (tetap sama) */
@media (max-width: 768px) {
    .footer-main-content {
        flex-direction: column;
        align-items: center;
    }

    .footer-column {
        min-width: 90%;
        text-align: center;
    }

    .footer-column ul {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .footer-top-nav nav ul {
        flex-direction: column;
    }

    .footer-top-nav nav ul li {
        margin: 5px 0;
    }

    .contact-list li {
        justify-content: center;
    }

    .social-icons {
        justify-content: center;
    }

    .logo-grid {
        grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    }

    .logo-grid img {
        height: 35px; /* Sedikit lebih kecil untuk layar mobile jika diinginkan */
        padding: 3px;
    }
}

      </style>
    <title>SIX-TEE OLSHOP</title>
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
        <li class="nav-item active"><a class="nav-link" href="index.php">Beranda</a></li>
        <li class="nav-item"><a class="nav-link" href="katalog.php">Katalog</a></li>
        <li class="nav-item"><a class="nav-link" href="keranjang.php">Keranjang</a></li>
        <li class="nav-item"><a class="nav-link" href="form.php">Ulasan</a></li>
        <li class="nav-item"><a class="nav-link" href="checkout.php">Checkout</a></li>
        <?php if (isset($_SESSION["pelanggan"])) : ?>
          <li class="nav-item"><a class="nav-link" href="riwayat.php">Riwayat</a></li>
          <li class="nav-item"><a class="nav-link" href="logout.php">Keluar</a></li>
        <?php else: ?>
          <li><a class="nav-link" href="login.php">Login</a></li>
        <?php endif ?>
      </ul>
      <form class="form-inline my-2 my-lg-0" method="GET" action="katalog.php">
        <input class="form-control mr-sm-2" type="search" name="q" value="<?= htmlspecialchars($kataCari) ?>" placeholder="Cari produk..." aria-label="Cari produk">
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Cari</button>
      </form>
    </div>
  </div>
</nav>
<br>

<section class="store-hero">
  <div class="container">
    <div class="store-hero__content">
      <span class="eyebrow">PILIHAN HARI INI</span>
      <h1>Temukan barang yang membuat harimu lebih praktis.</h1>
      <p>Belanja produk pilihan dengan proses sederhana, pembayaran mudah, dan layanan yang siap membantu.</p>
      <a href="katalog.php" class="btn btn-primary">Lihat katalog <span aria-hidden="true">&rarr;</span></a>
    </div>
    <div class="store-hero__note"><strong>Gratis ongkir</strong><br>untuk area pilihan</div>
  </div>
</section>

<div class="container mt-4">
  <div class="row">
    <!-- Carousel (KIRI) -->
    <div class="col-md-6 d-flex">
      <div id="promoCarousel" class="carousel slide w-100 rounded shadow-sm" data-ride="carousel">
        <div class="carousel-inner">
          <!-- Slide 1 -->
          <div class="carousel-item active">
            <div class="d-flex align-items-center" style="min-height: 300px;">
              <div style="flex: 1;">
                <img src="3.jpg" class="img-fluid w-100" alt="Promo 1" style="max-height: 300px; object-fit: cover;">
              </div>
              <div class="text-dark p-3" style="flex: 1;">
                <h5 class="mb-3">Promo Menarik!</h5>
                <a href="#" class="btn btn-success btn-sm">Belanja Sekarang</a>
              </div>
            </div>
          </div>

          <!-- Slide 2 -->
          <div class="carousel-item">
            <div class="d-flex align-items-center" style="min-height: 300px;">
              <div style="flex: 1;">
                <img src="4.jpg" class="img-fluid w-100" alt="Promo 2" style="max-height: 300px; object-fit: cover;">
              </div>
              <div class="text-dark p-3" style="flex: 1;">
                <h5 class="mb-3">Diskon Akhir Pekan!</h5>
                <a href="#" class="btn btn-success btn-sm">Cek Sekarang</a>
              </div>
            </div>
          </div>

          <!-- Slide 3 -->
          <div class="carousel-item">
            <div class="d-flex align-items-center" style="min-height: 300px;">
              <div style="flex: 1;">
                <img src="5.jpg" class="img-fluid w-100" alt="Promo 3" style="max-height: 300px; object-fit: cover;">
              </div>
              <div class="text-dark p-3" style="flex: 1;">
                <h5 class="mb-3">Produk Baru Hadir!</h5>
                <a href="#" class="btn btn-success btn-sm">Lihat Sekarang</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigasi Carousel -->
        <a class="carousel-control-prev" href="#promoCarousel" role="button" data-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        </a>
        <a class="carousel-control-next" href="#promoCarousel" role="button" data-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
        </a>
      </div>
    </div>

    <!-- Panel Promo & Produk Highlight (KANAN) -->
    <div class="col-md-6">
      <div class="row">
        <!-- Box 1 -->
        <div class="col-6 mb-2">
          <div class="bg-light p-3 rounded shadow-sm text-center h-100">
            <h6 class="text-danger font-weight-bold">BIAYA ONGKIR</h6>
            <p class="small">Gratis Ongkir untuk Pulau Jawa, Bali & Sumatera</p>
            <a href="" class="btn btn-danger btn-sm">Info Selengkapnya</a>
          </div>
        </div>

        <!-- Box 2 -->
        <div class="col-6 mb-2">
          <div class="bg-light p-3 rounded shadow-sm text-center h-100">
            <h6 class="text-success font-weight-bold">REKOMENDASI PRODUK</h6>
            <p class="small">Produk Terlaris & Terbaik</p>
            <a href="#" class="btn btn-danger btn-sm">Info Selengkapnya</a>
          </div>
        </div>

        <!-- Produk Highlight -->
        <div class="col-12">
          <div class="bg-white p-3 rounded shadow-sm h-100">
            <h6 class="font-weight-bold mb-2">PRODUCT HIGHLIGHT</h6>

            <!-- Produk 1 -->
            <div class="d-flex align-items-start mb-2">
              <img src="3.jpg" width="60" class="mr-3" alt="Clamp">
              <div>
                <p class="mb-1 small font-weight-bold">Jason Superior Clamp</p>
                <p class="mb-1 text-danger font-weight-bold">Rp94.000</p>
                <span class="badge badge-success">Ready Stock</span>
              </div>
            </div>

            <!-- Produk 2 -->
            <div class="d-flex align-items-start">
              <img src="4.jpg" width="60" class="mr-3" alt="Prestone">
              <div>
                <p class="mb-1 small font-weight-bold">Prestone Cor-Guard Super...</p>
                <p class="mb-1 text-danger font-weight-bold">Rp119.900</p>
                <small>3 - 7 hari kerja</small>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Info Tambahan -->
  <div class="bg-light rounded shadow-sm mt-4 p-3">
    <h6 class="font-weight-bold">Kemudahan Belanja di SIXTEE SHOP!</h6>
    <p class="mb-1">Belanja dan dapatkan voucher diskon 10% untuk pembelian pertama.</p>
  </div>
</div>




<!-- AJAKAN KATALOG -->
<section class="catalog-cta container mt-5">
  <div>
    <span class="eyebrow">SIAP BERBELANJA?</span>
    <h2>Semua pilihan ada di satu tempat.</h2>
    <p>Jelajahi katalog lengkap, cari produk favorit, lalu belanja dengan proses yang sederhana.</p>
  </div>
  <a href="katalog.php" class="btn btn-primary">Buka katalog <span aria-hidden="true">&rarr;</span></a>
</section>
<a href="https://wa.me/6282135318740" target="_blank" class="wa-chat-button">
  <img src="wa.jpg" alt="WhatsApp" width="24" height="24">
  <span>Chat</span>
</a>
<footer>
        <div class="footer-top-nav">
            <nav>
                <ul>
                    <li><a href="#">Tentang monotaro.id</a></li>
                    <li><a href="#">Testimonial</a></li>
                    <li><a href="#">Pusat Bantuan</a></li>
                    <li><a href="#">Syarat & Ketentuan</a></li>
                    <li><a href="#">Kebijakan Privasi</a></li>
                    <li><a href="#">Hubungi Kami</a></li>
                </ul>
            </nav>
        </div>

        <div class="footer-main-content">
            <div class="footer-column">
                <h3>Info Kami</h3>
                <ul>
                    <li><a href="#">Berita</a></li>
                    <li><a href="#">Karier</a></li>
                    <li><a href="#">Store Directory</a></li>
                    <li><a href="#">Daftar Kategori Produk</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>data diri</h3>
                <ul class="contact-list">
                    <li><i class="fas fa-phone-alt"></i> zada wirayuda sugiarto</li>
                    <li><i class="fas fa-mobile-alt"></i> satria rikhan ganendra</li>
                    <li><i class="fas fa-envelope"></i> <a href="mailto:cs@monotaro.id">UPN YK</a></li>
                </ul>
            </div>

            <div class="footer-column payment-shipping-security">
                <div class="payment-methods">
                    <h3>Metode Pembayaran</h3>
                    <div class="logo-grid">
                        <img src="pay.jpg" alt="Top Up">
                        <img src="cash.png" alt="Cash On Delivery">
                        <img src="mandiri.jpg" alt="Mandiri">
                        <img src="permata.jpg" alt="Permata">
                        <img src="bni.png" alt="BNI">
                        <img src="bri.jpg" alt="BRI">
                        <img src="gopay.jpeg" alt="Gopay">
                        <img src="bca.jpeg" alt="BCA">
                    </div>
                </div>

                <div class="shipping-methods">
                    <h3>Pengiriman</h3>
                    <div class="logo-grid">
                        <img src="jne.png" alt="JNE Express">
                        <img src="ninja.jpg" alt="Ninja Express">
                        <img src="jt.jpg" alt="Monotaro Delivery">
                        <img src="pos.jpg" alt="Pick Up Service">
                    </div>
                </div>

                <div class="security-info">
                    <h3>Keamanan</h3>
                    <div class="logo-grid">
                        <img src="https://via.placeholder.com/90x40/f0f0f0?text=GoTrust" alt="GoTrust">
                        <img src="https://via.placeholder.com/90x40/f0f0f0?text=Secured" alt="Secured Transaction">
                    </div>
                </div>
            </div>

            <div class="footer-column social-follow">
                <h3>Ikuti Kami</h3>
                <div class="social-icons">
                    <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-youtube"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="social-icon"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>

        <div class="footer-bottom-copyright">
            <p>&copy; RBPL</p>
        </div>
    </footer>

<!-- JavaScript -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
</body>
</html>
