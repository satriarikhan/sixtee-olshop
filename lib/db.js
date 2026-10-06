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

