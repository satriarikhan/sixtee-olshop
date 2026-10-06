import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let pool;

export function getDb() {
  const connectionString = process.env.DATABASE_URL || `postgresql://${encodeURIComponent(process.env.DB_USER || 'postgres')}:${encodeURIComponent(process.env.DB_PASSWORD || 'postgres')}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'toko'}`;

  if (!connectionString) {
    return null;
  }

  pool ??= new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

let seeded = false;

export async function ensureSeedProducts() {
  const db = getDb();
  if (!db) return;
  try {
    const NEW_PRODUCTS = [
      ['Kaos Polos Oversize Cotton Combed 24s', 89000, 250, 'kaos_oversize_black.jpg', 'Kaos oversized berbahan 100% Cotton Combed 24s gramasi tinggi yang adem, menyerap keringat, dan tidak mudah melar.'],
      ['Hoodie Pullover Fleece Warm Ash Grey', 185000, 650, 'hoodie_fleece_grey.jpg', 'Hoodie pullover dengan material cotton fleece tebal dan lembut di bagian dalam. Dilengkapi saku kanguru luas dan tali serut.'],
      ['Kemeja Flannel Tartan Casual Navy', 145000, 350, 'kemeja_flannel_navy.jpg', 'Kemeja flannel bermotif tartan klasik bernuansa navy. Menggunakan bahan wool-blend flannel premium yang lembut di kulit.'],
      ['Celana Chino Slim Fit Stretch Khaki', 165000, 450, 'chino_pants_khaki.jpg', 'Celana chino pria model slim fit dengan sentuhan bahan katun twill stretch fleksibel.'],
      ['Jaket Denim Classic Vintage Blue', 235000, 850, 'jaket_denim_vintage.jpg', 'Jaket denim bergaya vintage wash berbahan denim 14oz non-stretch tebal dan kuat.'],
      ['Crewneck Sweatshirt Minimalist Forest Green', 155000, 500, 'crewneck_forest_green.jpg', 'Sweatshirt kerah bulat warna hijau botol bernuansa earthy berbahan baby terry premium.'],
      ['Tote Bag Canvas Heavyweight Natural White', 69000, 300, 'totebag_canvas_white.jpg', 'Tas jinjing berbahan kanvas tebal 12oz warna broken white natural dilengkapi ritsleting utama.'],
      ['Topi Baseball Cap Bordir Retro Black', 55000, 150, 'baseball_cap_black.jpg', 'Topi baseball berbahan katun twill washed dengan jahitan presisi dan strap pengatur ukuran.'],
      ['Kemeja Linen Kerah Sanghai Olive', 159000, 280, 'kemeja_linen_olive.jpg', 'Kemeja lengan panjang berbahan katun linen alami dengan tekstur khas yang adem dan kerah sanghai.'],
      ['Tas Ransel Laptop Waterproof Urban Black', 249000, 750, 'ransel_laptop_black.jpg', 'Ransel harian kapasitas 22L dengan kompartemen laptop 15.6 inch berbahan bimo waterproof.'],
      ['Sepatu Sneakers Kanvas Low Top Classic White', 199000, 800, 'sneakers_classic_white.jpg', 'Sneakers kanvas klasik bertali dengan sol karet vulcanized antiselip dan insole memory foam empuk.'],
      ['Dompet Kulit Bifold Minimalis Dark Brown', 119000, 180, 'dompet_kulit_brown.jpg', 'Dompet pria model lipat dua berbahan kulit sintetis premium bertekstur pull-up dengan proteksi RFID.']
    ];

    for (const p of NEW_PRODUCTS) {
      await db.query(
        `INSERT INTO tb_produk (nama_produk, harga_produk, berat_produk, foto_produk, deskripsi_produk)
         SELECT $1, $2, $3, $4, $5
         WHERE NOT EXISTS (SELECT 1 FROM tb_produk WHERE nama_produk = $1)`,
        p
      );
    }
    try {
      const brainDirs = [
        'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\7f29543b-b9fb-481b-ad0f-997e765d54f4',
        'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\780e9897-5c2e-4322-94a1-a47cfda58520',
      ];
      const targetDir = path.join(process.cwd(), 'public', 'images');
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      for (const p of NEW_PRODUCTS) {
        const targetName = p[3];
        const prefix = targetName.replace(/\.jpg$/, '');
        const dest = path.join(targetDir, targetName);

        if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
          for (const bDir of brainDirs) {
            if (fs.existsSync(bDir)) {
              const bFiles = fs.readdirSync(bDir);
              const matches = bFiles.filter((f) => f.startsWith(prefix) && f.endsWith('.jpg')).sort().reverse();
              if (matches.length > 0) {
                fs.copyFileSync(path.join(bDir, matches[0]), dest);
                break;
              }
            }
          }
        }
      }
    } catch (errSync) {
      console.warn('Sync images notice:', errSync.message);
    }

    seeded = true;
  } catch (e) {
    console.error('ensureSeedProducts error:', e.message);
  }
}

export async function getProducts({ search = '', sort = 'terbaru' } = {}) {
  const db = getDb();
  if (!db) return [];

  await ensureSeedProducts();

  const order = sort === 'termurah' ? 'harga_produk ASC' : sort === 'termahal' ? 'harga_produk DESC' : 'id_produk DESC';
  const values = [];
  const where = search ? 'WHERE nama_produk ILIKE $1' : '';
  if (search) values.push(`%${search}%`);

  const result = await db.query(`SELECT id_produk, nama_produk, harga_produk, foto_produk, deskripsi_produk FROM tb_produk ${where} ORDER BY ${order}`, values);
  return result.rows;
}

export async function getProduct(id) {
  const db = getDb();
  if (!db) return null;
  const result = await db.query('SELECT id_produk, nama_produk, harga_produk, berat_produk, foto_produk, deskripsi_produk FROM tb_produk WHERE id_produk = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
}

export async function getProductsByIds(ids) {
  const db = getDb();
  if (!db || !Array.isArray(ids) || ids.length === 0) return [];
  const cleanIds = ids.map(Number).filter(Boolean);
  if (!cleanIds.length) return [];
  const result = await db.query(
    'SELECT id_produk, nama_produk, harga_produk, berat_produk, foto_produk, deskripsi_produk FROM tb_produk WHERE id_produk = ANY($1::int[])',
    [cleanIds]
  );
  return result.rows;
}

export async function getProvinces() {
  const db = getDb();
  if (!db) return [];
  try {
    const result = await db.query('SELECT id_prov, nama, ongkir FROM provinsi ORDER BY nama ASC');
    return result.rows;
  } catch {
    return [];
  }
}

export async function getOrderById(id) {
  const db = getDb();
  if (!db) return null;
  const orderRes = await db.query('SELECT * FROM tb_pembelian WHERE id_pembelian = $1 LIMIT 1', [id]);
  if (!orderRes.rows[0]) return null;
  const itemsRes = await db.query(
    `SELECT pp.jumlah, p.id_produk, p.nama_produk, p.harga_produk, p.foto_produk
     FROM tb_pembelian_produk pp
     JOIN tb_produk p ON pp.id_produk = p.id_produk
     WHERE pp.id_pembelian = $1`,
    [id]
  );
  return {
    ...orderRes.rows[0],
    items: itemsRes.rows,
  };
}

export async function ensureReviewsTable() {
  const db = getDb();
  if (!db) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulasan (
        id SERIAL PRIMARY KEY,
        id_pelanggan INT,
        id_produk INT,
        rating INT DEFAULT 5,
        coment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query('ALTER TABLE ulasan ADD COLUMN IF NOT EXISTS id_pelanggan INT');
    await db.query('ALTER TABLE ulasan ADD COLUMN IF NOT EXISTS id_produk INT');
    await db.query('ALTER TABLE ulasan ADD COLUMN IF NOT EXISTS rating INT DEFAULT 5');
    await db.query('ALTER TABLE ulasan ADD COLUMN IF NOT EXISTS coment TEXT');
    await db.query('ALTER TABLE ulasan ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  } catch (err) {
    console.error('Error ensuring reviews table:', err.message);
  }
}

export async function getReviews(productId = null) {
  const db = getDb();
  if (!db) return [];
  await ensureReviewsTable();
  try {
    let query = `
      SELECT 
        u.id, 
        u.rating, 
        u.coment, 
        u.created_at, 
        u.id_pelanggan, 
        u.id_produk,
        pel.nama_pelanggan,
        prod.nama_produk,
        prod.foto_produk
      FROM ulasan u
      LEFT JOIN tb_pelanggan pel ON u.id_pelanggan = pel.id_pelanggan
      LEFT JOIN tb_produk prod ON u.id_produk = prod.id_produk
    `;
    const params = [];
    if (productId) {
      query += ' WHERE u.id_produk = $1';
      params.push(productId);
    }
    query += ' ORDER BY u.created_at DESC';
    const result = await db.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    return [];
  }
}

export async function getUserPurchasedProducts(userId) {
  const db = getDb();
  if (!db || !userId) return [];
  try {
    const result = await db.query(
      `SELECT DISTINCT p.id_produk, p.nama_produk, p.foto_produk, p.harga_produk
       FROM tb_pembelian_produk pp
       JOIN tb_pembelian pem ON pp.id_pembelian = pem.id_pembelian
       JOIN tb_produk p ON pp.id_produk = p.id_produk
       WHERE pem.id_pelanggan = $1
       ORDER BY p.nama_produk ASC`,
      [userId]
    );
    return result.rows;
  } catch (err) {
    console.error('Error fetching user purchased products:', err.message);
    return [];
  }
}

export async function addReview({ userId, productId, rating, comment }) {
  const db = getDb();
  if (!db) throw new Error('Database tidak terhubung.');
  await ensureReviewsTable();
  const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const res = await db.query(
    `INSERT INTO ulasan (id_pelanggan, id_produk, rating, coment, created_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     RETURNING id, id_pelanggan, id_produk, rating, coment, created_at`,
    [userId ? Number(userId) : null, productId ? Number(productId) : null, numRating, String(comment).trim()]
  );
  return res.rows[0];
}


