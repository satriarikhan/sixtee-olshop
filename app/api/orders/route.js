import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../lib/db';

export async function POST(request) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('sixtee_user');
  const db = getDb();
  if (!userCookie || !db) {
    return NextResponse.json({ message: 'Silakan login terlebih dahulu untuk melakukan checkout.' }, { status: 401 });
  }

  const body = await request.json();
  const rawItems = Array.isArray(body.items) ? body.items : [];

  // Parse items whether array of numbers or objects { id, quantity }
  const qtyMap = new Map();
  for (const item of rawItems) {
    if (typeof item === 'object' && item !== null) {
      const id = Number(item.id || item.id_produk);
      const qty = Math.max(1, Number(item.quantity || item.qty || 1));
      if (id) qtyMap.set(id, (qtyMap.get(id) || 0) + qty);
    } else {
      const id = Number(item);
      if (id) qtyMap.set(id, (qtyMap.get(id) || 0) + 1);
    }
  }

  const productIds = Array.from(qtyMap.keys());
  const address = String(body.address || '').trim();
  const province = String(body.province || '').trim();
  const district = String(body.district || '').trim();
  const subdistrict = String(body.subdistrict || '').trim();
  const shippingCost = Math.max(0, Number(body.shippingCost ?? body.tarif ?? 0));

  if (!productIds.length || !address || !province || !district || !subdistrict) {
    return NextResponse.json({ message: 'Lengkapi produk dan data alamat pengiriman.' }, { status: 400 });
  }

  const client = await db.connect();
  try {
    const user = JSON.parse(userCookie.value);
    const products = await client.query(
      'SELECT id_produk, nama_produk, harga_produk FROM tb_produk WHERE id_produk = ANY($1::int[])',
      [productIds]
    );

    if (!products.rows.length) {
      return NextResponse.json({ message: 'Produk yang dipilih tidak ditemukan.' }, { status: 404 });
    }

    const subtotal = products.rows.reduce((sum, product) => {
      const qty = qtyMap.get(Number(product.id_produk)) || 1;
      return sum + Number(product.harga_produk) * qty;
    }, 0);

    const totalPembelian = subtotal + shippingCost;

    await client.query('BEGIN');

    const order = await client.query(
      `INSERT INTO tb_pembelian 
       (id_pelanggan, id_prov, kabupaten, kecamatan, tanggal_pembelian, total_pembelian, tarif, alamat, status) 
       VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8) 
       RETURNING id_pembelian`,
      [user.id_pelanggan, province, district, subdistrict, totalPembelian, shippingCost, address, 'Pending']
    );

    const orderId = order.rows[0].id_pembelian;

    for (const product of products.rows) {
      const qty = qtyMap.get(Number(product.id_produk)) || 1;
      await client.query(
        'INSERT INTO tb_pembelian_produk (id_pembelian, id_produk, jumlah) VALUES ($1, $2, $3)',
        [orderId, product.id_produk, qty]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ ok: true, id: orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    return NextResponse.json({ message: 'Pesanan gagal diproses: ' + error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
