# Online-Shop-Dengan-PHP
Pengembangan online shop yang dibangun dengan PHP Native.

## Menjalankan dengan PostgreSQL

Project ini sekarang memakai PDO PostgreSQL melalui `database.php`.

1. Pastikan PostgreSQL berjalan pada port `5432`.
2. Buat database:

```sql
CREATE DATABASE toko;
```

3. Import struktur tabel:

```powershell
psql -U postgres -d toko -f Database\toko_postgres.sql
```

4. Atur kredensial sebelum menjalankan server. Default yang digunakan adalah user `postgres` dan password `postgres`.
  Jika berbeda, set environment variable PowerShell:

```powershell
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "password-postgres-anda"
$env:DB_HOST = "127.0.0.1"
$env:DB_PORT = "5432"
$env:DB_NAME = "toko"
```

5. Jalankan aplikasi:

```powershell
php -S localhost:8000
```

Data lama dari MySQL perlu diekspor ulang melalui tool migrasi MySQL ke PostgreSQL atau dimasukkan kembali ke tabel PostgreSQL.

Alur aplikasi / sistem :
  - Pelanggan melakukan register/daftar ke sistem
  - Pelanggan memassukkan produk dalam keranjang belanja
  - pelanggan melakukan checkout
  - Pembayaran dilakakukan masih via manual, yaitu pelanggan transfer ke Bank penjual
  - Transaksi selesai
