import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../lib/db';

export async function POST(request) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('sixtee_user');
  const db = getDb();
  if (!userCookie || !db) return NextResponse.json({ message: 'Silakan login terlebih dahulu.' }, { status: 401 });

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items.map(Number).filter(Boolean) : [];
  const address = String(body.address || '').trim();
  const province = String(body.province || '').trim();
  const district = String(body.district || '').trim();
  const subdistrict = String(body.subdistrict || '').trim();
  if (!items.length || !address || !province || !district || !subdistrict) return NextResponse.json({ message: 'Lengkapi produk dan alamat pengiriman.' }, { status: 400 });

  const client = await db.connect();
  try {
    const user = JSON.parse(userCookie.value);
    const products = await client.query('SELECT id_produk, harga_produk FROM tb_produk WHERE id_produk = ANY($1::int[])', [items]);
    if (!products.rows.length) return NextResponse.json({ message: 'Produk tidak ditemukan.' }, { status: 404 });
    const total = products.rows.reduce((sum, product) => sum + Number(product.harga_produk), 0);
    await client.query('BEGIN');
    const order = await client.query('INSERT INTO tb_pembelian (id_pelanggan, id_prov, kabupaten, kecamatan, tanggal_pembelian, total_pembelian, tarif, alamat, status) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 0, $6, $7) RETURNING id_pembelian', [user.id_pelanggan, province, district, subdistrict, total, address, 'Pending']);
    for (const product of products.rows) await client.query('INSERT INTO tb_pembelian_produk (id_pembelian, id_produk, jumlah) VALUES ($1, $2, 1)', [order.rows[0].id_pembelian, product.id_produk]);
    await client.query('COMMIT');
    return NextResponse.json({ ok: true, id: order.rows[0].id_pembelian });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ message: 'Pesanan gagal dibuat.' }, { status: 500 });
  } finally { client.release(); }
}
