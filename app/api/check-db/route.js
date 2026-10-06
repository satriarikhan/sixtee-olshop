import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'No db connection' }, { status: 500 });

  try {
    const produkCols = await db.query(
      "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'tb_produk'"
    );

    const pembelianCols = await db.query(
      "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'tb_pembelian'"
    );

    const products = await db.query('SELECT id_produk, nama_produk, harga_produk, foto_produk FROM tb_produk');

    return NextResponse.json({
      tb_produk_schema: produkCols.rows,
      tb_pembelian_schema: pembelianCols.rows,
      existing_products: products.rows,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

