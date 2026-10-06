import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

const NEW_PRODUCTS = [
  {
    nama_produk: 'Kaos Polos Oversize Cotton Combed 24s',
    harga_produk: 89000,
    berat_produk: 250,
    foto_produk: 'kaos_oversize_black.jpg',
    deskripsi_produk: 'Kaos oversized berbahan 100% Cotton Combed 24s gramasi tinggi yang adem, menyerap keringat, dan tidak mudah melar. Potongan drop-shoulder modern yang nyaman dipakai seharian.',
  },
  {
    nama_produk: 'Hoodie Pullover Fleece Warm Ash Grey',
    harga_produk: 185000,
    berat_produk: 650,
    foto_produk: 'hoodie_fleece_grey.jpg',
    deskripsi_produk: 'Hoodie pullover dengan material cotton fleece tebal dan lembut di bagian dalam. Dilengkapi saku kanguru luas, tali serut adjustable, dan rib elastis di bagian lengan dan pinggang.',
  },
  {
    nama_produk: 'Kemeja Flannel Tartan Casual Navy',
    harga_produk: 145000,
    berat_produk: 350,
    foto_produk: 'kemeja_flannel_navy.jpg',
    deskripsi_produk: 'Kemeja flannel bermotif tartan klasik bernuansa navy. Menggunakan bahan wool-blend flannel premium yang lembut di kulit, cocok dijadikan kemeja utama maupun outer kasual.',
  },
  {
    nama_produk: 'Celana Chino Slim Fit Stretch Khaki',
    harga_produk: 165000,
    berat_produk: 450,
    foto_produk: 'chino_pants_khaki.jpg',
    deskripsi_produk: 'Celana chino pria model slim fit dengan sentuhan bahan katun twill stretch fleksibel. Memberikan ruang gerak optimal untuk aktivitas harian dari kantor hingga nongkrong santai.',
  },
  {
    nama_produk: 'Jaket Denim Classic Vintage Blue',
    harga_produk: 235000,
    berat_produk: 850,
    foto_produk: 'jaket_denim_vintage.jpg',
    deskripsi_produk: 'Jaket denim bergaya vintage wash berbahan denim 14oz non-stretch tebal dan kuat. Dilengkapi saku dada berkancing khas truck jacket, memberikan tampilan maskulin dan timeless.',
  },
  {
    nama_produk: 'Crewneck Sweatshirt Minimalist Forest Green',
    harga_produk: 155000,
    berat_produk: 500,
    foto_produk: 'crewneck_forest_green.jpg',
    deskripsi_produk: 'Sweatshirt kerah bulat warna hijau botol bernuansa earthy. Bahan baby terry premium yang adem di cuaca hangat dan tetap menghangatkan di ruangan ber-AC.',
  },
  {
    nama_produk: 'Tote Bag Canvas Heavyweight Natural White',
    harga_produk: 69000,
    berat_produk: 300,
    foto_produk: 'totebag_canvas_white.jpg',
    deskripsi_produk: 'Tas jinjing berbahan kanvas tebal 12oz warna broken white natural. Dilengkapi ritsleting utama anti-jatuh dan saku dalam untuk dompet maupun smartphone.',
  },
  {
    nama_produk: 'Topi Baseball Cap Bordir Retro Black',
    harga_produk: 55000,
    berat_produk: 150,
    foto_produk: 'baseball_cap_black.jpg',
    deskripsi_produk: 'Topi baseball berbahan katun twill washed dengan jahitan presisi dan strap besi pengatur ukuran di belakang. Desain simpel cocok untuk segala bentuk kepala.',
  },
  {
    nama_produk: 'Kemeja Linen Kerah Sanghai Olive',
    harga_produk: 159000,
    berat_produk: 280,
    foto_produk: 'kemeja_linen_olive.jpg',
    deskripsi_produk: 'Kemeja lengan panjang berbahan katun linen alami dengan tekstur khas yang adem dan bernapas. Model kerah mandarin (sanghai) memberikan nuansa rapi tapi santai.',
  },
  {
    nama_produk: 'Tas Ransel Laptop Waterproof Urban Black',
    harga_produk: 249000,
    berat_produk: 750,
    foto_produk: 'ransel_laptop_black.jpg',
    deskripsi_produk: 'Ransel harian berkapasitas 22 liter dengan kompartemen busa empuk khusus laptop hingga 15.6 inch. Menggunakan material bimo waterproof tahan percikan hujan deras.',
  },
  {
    nama_produk: 'Sepatu Sneakers Kanvas Low Top Classic White',
    harga_produk: 199000,
    berat_produk: 800,
    foto_produk: 'sneakers_classic_white.jpg',
    deskripsi_produk: 'Sneakers kanvas klasik bertali dengan sol karet vulcanized antiselip. Dilengkapi insole memory foam empuk yang nyaman digunakan berjalan jauh seharian.',
  },
  {
    nama_produk: 'Dompet Kulit Bifold Minimalis Dark Brown',
    harga_produk: 119000,
    berat_produk: 180,
    foto_produk: 'dompet_kulit_brown.jpg',
    deskripsi_produk: 'Dompet pria model lipat dua berbahan kulit sintetis premium bertekstur pull-up. Memiliki 8 slot kartu, 2 kompartemen uang kertas, dan lapisan proteksi RFID.',
  },
];

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ message: 'Database tidak terhubung' }, { status: 500 });
  }

  const client = await db.connect();
  try {
    const inserted = [];
    const skipped = [];

    for (const item of NEW_PRODUCTS) {
      // Check if product with same name already exists
      const existing = await client.query(
        'SELECT id_produk FROM tb_produk WHERE nama_produk = $1 LIMIT 1',
        [item.nama_produk]
      );

      if (existing.rows.length === 0) {
        const res = await client.query(
          `INSERT INTO tb_produk (nama_produk, harga_produk, berat_produk, foto_produk, deskripsi_produk)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id_produk, nama_produk`,
          [item.nama_produk, item.harga_produk, item.berat_produk, item.foto_produk, item.deskripsi_produk]
        );
        inserted.push(res.rows[0]);
      } else {
        skipped.push(item.nama_produk);
      }
    }

    return NextResponse.json({
      message: 'Proses seeding selesai',
      totalProductsAdded: inserted.length,
      inserted,
      skipped,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

