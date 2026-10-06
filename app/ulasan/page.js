'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [userPurchased, setUserPurchased] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Filter state
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/reviews?userProducts=true');
      const data = await res.json();
      if (data) {
        setReviews(data.reviews || []);
        setUserPurchased(data.userPurchased || []);
        setAllProducts(data.allProducts || []);
        setUser(data.user || null);

        // Pre-select first purchased product if available
        if (data.userPurchased?.length > 0) {
          setSelectedProductId(String(data.userPurchased[0].id_produk));
        } else if (data.allProducts?.length > 0) {
          setSelectedProductId(String(data.allProducts[0].id_produk));
        }
      }
    } catch (e) {
      console.error('Failed to load reviews data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    setFeedback({ message: '', type: '' });

    if (!user) {
      setFeedback({
        message: 'Silakan login terlebih dahulu untuk memberikan ulasan.',
        type: 'error',
      });
      return;
    }

    if (!comment.trim()) {
      setFeedback({
        message: 'Mohon tuliskan isi ulasan atau komentar Anda.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId ? Number(selectedProductId) : null,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ message: data.message || 'Gagal mengirim ulasan.', type: 'error' });
        setSubmitting(false);
        return;
      }

      setFeedback({
        message: 'Ulasan Anda berhasil dikirim! Terima kasih atas ulasan dan masukan Anda.',
        type: 'success',
      });
      setComment('');

      // Reload reviews
      loadData();
    } catch (err) {
      setFeedback({ message: 'Terjadi kesalahan: ' + err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (filterRating === 'all') return reviews;
    return reviews.filter((r) => Number(r.rating) === Number(filterRating));
  }, [reviews, filterRating]);

  // Average rating
  const avgRating = useMemo(() => {
    if (!reviews.length) return 5;
    const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingLabels = {
    1: 'Sangat Buruk (1 bintang)',
    2: 'Kurang Puas (2 bintang)',
    3: 'Cukup Baik (3 bintang)',
    4: 'Puas & Berkualitas (4 bintang)',
    5: 'Sangat Puas & Rekomended! (5 bintang)',
  };

  return (
    <>
      <Navbar />
      <main className="shell simple-page" style={{ paddingTop: '36px', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span className="eyebrow">ULASAN &amp; TESTIMONI</span>
          <h1 style={{ margin: '8px 0 6px', fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Pengalaman Belanja Pembeli
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
            Bagikan ulasan untuk produk yang sudah Anda beli di SIXTEE SHOP atau lihat pengalaman nyata dari pelanggan lainnya.
          </p>
        </div>

        {/* 2-Column Grid: Review Form on Left, Stats & Reviews on Right */}
        <div className="reviews-page-grid">
          {/* Left Column: Form to Write a Review */}
          <div className="review-form-column">
            <div className="review-form-card">
              <h3 style={{ margin: '0 0 6px', fontSize: '20px' }}>Beri Ulasan Produk</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 18px' }}>
                Bantu calon pembeli lain dengan membagikan kualitas produk dan pelayanan kami.
              </p>

              {user ? (
                <form onSubmit={handleSubmitReview} style={{ display: 'grid', gap: '16px' }}>
                  <div className="reviewer-info-pill">
                    <span className="reviewer-avatar">
                      {user.nama_pelanggan ? user.nama_pelanggan.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px' }}>
                        {user.nama_pelanggan || user.email}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#16a34a' }}>
                        ✓ Pembeli Terverifikasi
                      </span>
                    </div>
                  </div>

                  {/* Product Picker */}
                  <label className="checkout-field">
                    <span>Pilih Produk yang Ingin Diulas *</span>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      required
                    >
                      {userPurchased.length > 0 && (
                        <optgroup label="Produk yang Pernah Anda Beli">
                          {userPurchased.map((p) => (
                            <option key={`purchased-${p.id_produk}`} value={p.id_produk}>
                              ★ {p.nama_produk} (Sudah Dibeli)
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <optgroup label="Semua Produk Katalog">
                        {allProducts.map((p) => (
                          <option key={`all-${p.id_produk}`} value={p.id_produk}>
                            {p.nama_produk}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>

                  {/* Interactive Star Rating */}
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Beri Rating *
                    </span>
                    <div className="interactive-stars-wrap">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-pick-btn ${
                            (hoverRating || rating) >= star ? 'active' : ''
                          }`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          title={`${star} Bintang`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="star-rating-hint">
                        {ratingLabels[hoverRating || rating]}
                      </span>
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <label className="checkout-field">
                    <span>Ulasan &amp; Pengalaman Belanja Anda *</span>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Bagikan pengalaman mengenai kualitas bahan, kesesuaian produk, kecepatan pengiriman, dan respon toko..."
                    />
                  </label>

                  {feedback.message && (
                    <div
                      className={
                        feedback.type === 'success'
                          ? 'alert-success-badge'
                          : 'form-message'
                      }
                      style={{ margin: 0 }}
                    >
                      {feedback.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="button button-primary"
                    style={{ width: '100%', padding: '13px' }}
                  >
                    {submitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan Sekarang ->'}
                  </button>
                </form>
              ) : (
                <div className="review-login-prompt">
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>✍️</div>
                  <strong style={{ fontSize: '16px' }}>Ingin memberi ulasan produk?</strong>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '6px 0 18px', maxWidth: '300px' }}>
                    Silakan masuk ke akun Anda terlebih dahulu agar ulasan dapat tercatat dengan nama Anda.
                  </p>
                  <Link href="/login" className="button button-primary" style={{ width: '100%' }}>
                    Login untuk Memberi Ulasan
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reviews List & Rating Filter */}
          <div className="reviews-list-column">
            {/* Reviews Header & Filters */}
            <div className="reviews-summary-bar">
              <div className="rating-overview">
                <span className="rating-big-number">{avgRating}</span>
                <div>
                  <div className="review-stars-next" style={{ fontSize: '18px' }}>
                    {'★'.repeat(Math.round(Number(avgRating)))}
                    <span>{'★'.repeat(5 - Math.round(Number(avgRating)))}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Berdasarkan {reviews.length} ulasan pembeli
                  </span>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="reviews-filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${filterRating === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterRating('all')}
                >
                  Semua ({reviews.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterRating === '5' ? 'active' : ''}`}
                  onClick={() => setFilterRating('5')}
                >
                  ★ 5
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterRating === '4' ? 'active' : ''}`}
                  onClick={() => setFilterRating('4')}
                >
                  ★ 4
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filterRating === '3' ? 'active' : ''}`}
                  onClick={() => setFilterRating('3')}
                >
                  ★ 3
                </button>
              </div>
            </div>

            {/* List of Reviews */}
            {loading ? (
              <div className="empty-state">
                <p>Memuat ulasan pembeli...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="empty-state" style={{ padding: '48px 20px', borderRadius: '14px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
                <h3>Belum ada ulasan untuk filter ini</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '380px', margin: '6px auto 18px' }}>
                  Jadilah pelanggan pertama yang memberikan rating dan ulasan untuk pengalaman belanja Anda!
                </p>
              </div>
            ) : (
              <div className="reviews-cards-list">
                {filteredReviews.map((rev) => {
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="reviewer-avatar sm">
                            {rev.nama_pelanggan
                              ? rev.nama_pelanggan.charAt(0).toUpperCase()
                              : 'P'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', display: 'block' }}>
                              {rev.nama_pelanggan || 'Pelanggan SIXTEE'}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                              ✓ Pembeli Terverifikasi
                            </span>
                          </div>
                        </div>

                        <span className="review-date-badge">{dateStr}</span>
                      </div>

                      {/* Stars */}
                      <div style={{ margin: '10px 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="review-stars-next" style={{ fontSize: '16px' }}>
                          {'★'.repeat(numRating)}
                          <span>{'★'.repeat(5 - numRating)}</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                          {numRating}.0 / 5.0
                        </span>
                      </div>

                      {/* Associated Product (if any) */}
                      {rev.nama_produk && (
                        <div className="reviewed-product-pill">
                          {rev.foto_produk && (
                            <img
                              src={`/images/${rev.foto_produk}`}
                              alt={rev.nama_produk}
                              className="reviewed-product-thumb"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <Link
                            href={rev.id_produk ? `/produk/${rev.id_produk}` : '#'}
                            className="reviewed-product-title"
                          >
                            Produk: <strong>{rev.nama_produk}</strong>
                          </Link>
                        </div>
                      )}

                      {/* Comment text */}
                      <p className="review-comment-body">{rev.coment}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
