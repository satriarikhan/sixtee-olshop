import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('sixtee_user');
  return NextResponse.json({ ok: true });
}

export async function GET(request) {
  const cookieStore = await cookies();
  cookieStore.delete('sixtee_user');
  return NextResponse.redirect(new URL('/', request.url));
}

