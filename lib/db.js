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
