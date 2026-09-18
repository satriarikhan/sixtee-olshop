import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function POST(request) {
  const body = await request.json();
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const db = getDb();
  if (!username || !password || !db) return NextResponse.json({ message: 'Username dan password wajib diisi.' }, { status: 400 });
  const result = await db.query('SELECT id, username, nama FROM tb_admin WHERE username = $1 AND password = $2 LIMIT 1', [username, password]);
  if (!result.rows[0]) return NextResponse.json({ message: 'Username atau password belum benar.' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set('sixtee_admin', JSON.stringify(result.rows[0]), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  return response;
}
