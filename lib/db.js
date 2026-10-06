import { Pool } from 'pg';

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

export async function getProducts({ search = '', sort = 'terbaru' } = {}) {
  const db = getDb();
  if (!db) return [];

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


