import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AddToCartBox from '../../../components/AddToCartBox';
import { getProduct, getReviews } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const reviews = await getReviews(product.id_produk);

  return (
    <>
      <Navbar />
      <main className="shell product-detail">
        <Link className="back-link" href="/katalog">
          &lt;- Kembali ke katalog
        </Link>
        <div className="product-detail-grid">
          <div className="product-detail-image">
            <img src={`/images/${product.foto_produk}`} alt={product.nama_produk} />
          </div>
          <div className="product-detail-copy">
            <span className="product-tag">READY STOCK</span>
            <h1>{product.nama_produk}</h1>
            <strong className="detail-price">
              Rp {Number(product.harga_produk).toLocaleString('id-ID')}
            </strong>
            <p>{product.deskripsi_produk}</p>
            <AddToCartBox productId={product.id_produk} />
          </div>
        </div>

        {/* Product Reviews Section */}
        <section style={{ marginTop: '56px', borderTop: '1px solid var(--line)', paddingTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '24px', margin: '0 0 4px' }}>
                Ulasan Pembeli ({reviews.length})
              </h2>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>
                Pengalaman nyata dari pembeli yang sudah memesan produk ini.
              </p>
            </div>
            <Link href="/ulasan" className="button button-soft" style={{ fontSize: '13px' }}>
              Beri Ulasan Produk Ini -&gt;
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px', borderRadius: '12px' }}>
              <p style={{ margin: 0, color: 'var(--muted)' }}>
                Belum ada ulasan untuk produk ini. Jadilah pembeli pertama yang mengulas!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px', maxWidth: '780px' }}>
              {reviews.map((rev) => {
                const numRating = Number(rev.rating) || 5;
                const dateStr = rev.created_at
                  ? new Date(rev.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Baru saja';

                return (
                  <article key={rev.id || Math.random()} className="review-card-item">
                    <div className="review-card-top">
                      <div>
                        <strong style={{ fontSize: '14px' }}>{rev.nama_pelanggan || 'Pembeli'}</strong>
                        <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: '8px', fontWeight: 600 }}>
                          ✓ Terverifikasi
                        </span>
                      </div>
                      <span className="review-date-badge">{dateStr}</span>
                    </div>
                    <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="review-stars-next">
                        {'★'.repeat(numRating)}
                        <span>{'★'.repeat(5 - numRating)}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{numRating}.0</span>
                    </div>
                    <p className="review-comment-body">{rev.coment}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}


