import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function POST(request) {
  const body = await request.json();
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const db = getDb();

  if (!email || !password || !name || !phone || !db) return NextResponse.json({ message: 'Lengkapi semua data.' }, { status: 400 });
  try {
    await db.query('INSERT INTO tb_pelanggan (email, password, nama_pelanggan, telepon) VALUES ($1, $2, $3, $4)', [email, password, name, phone]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: 'Email tersebut sudah digunakan atau data tidak valid.' }, { status: 409 });
  }
}
