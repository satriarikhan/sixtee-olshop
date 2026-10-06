import { NextResponse } from 'next/server';
import { getProductsByIds } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    const products = await getProductsByIds(ids);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam.split(',').map(Number).filter(Boolean);
    const products = await getProductsByIds(ids);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

