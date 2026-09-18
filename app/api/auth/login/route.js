import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function POST(request) {
  const body = await request.json();
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  const db = getDb();

  if (!email || !password || !db) {
    return NextResponse.json({ message: 'Email dan password wajib diisi.' }, { status: 400 });
  }

  const result = await db.query('SELECT id_pelanggan, email, nama_pelanggan, telepon FROM tb_pelanggan WHERE email = $1 AND password = $2 LIMIT 1', [email, password]);
  if (!result.rows[0]) return NextResponse.json({ message: 'Email atau password belum benar.' }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set('sixtee_user', JSON.stringify(result.rows[0]), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return response;
}
