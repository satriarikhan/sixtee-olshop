import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getReviews, addReview, getUserPurchasedProducts, getProducts } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const getUserProducts = searchParams.get('userProducts') === 'true';

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('sixtee_user');
    let user = null;
    let userPurchased = [];

    if (userCookie?.value) {
      try {
        user = JSON.parse(userCookie.value);
        if (getUserProducts && user?.id_pelanggan) {
          userPurchased = await getUserPurchasedProducts(user.id_pelanggan);
        }
      } catch {
        // Ignore parse error
      }
    }

    const reviews = await getReviews(productId ? Number(productId) : null);
    const allProducts = await getProducts();

    return NextResponse.json({
      reviews,
      userPurchased,
      allProducts: allProducts.map((p) => ({
        id_produk: p.id_produk,
        nama_produk: p.nama_produk,
        foto_produk: p.foto_produk,
      })),
      user,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('sixtee_user');

    if (!userCookie?.value) {
      return NextResponse.json(
        { message: 'Silakan login terlebih dahulu untuk memberikan ulasan.' },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(userCookie.value);
    } catch {
      return NextResponse.json({ message: 'Sesi login tidak valid.' }, { status: 401 });
    }

    const body = await request.json();
    const productId = body.productId ? Number(body.productId) : null;
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const comment = String(body.comment || '').trim();

    if (!comment) {
      return NextResponse.json(
        { message: 'Tuliskan ulasan atau pengalaman Anda terlebih dahulu.' },
        { status: 400 }
      );
    }

    const review = await addReview({
      userId: user.id_pelanggan,
      productId,
      rating,
      comment,
    });

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal mengirim ulasan: ' + error.message },
      { status: 500 }
    );
  }
}

