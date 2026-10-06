'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import { getCartItems, addToCart, updateCartQuantity, removeFromCart, clearCart } from '../../lib/cart';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [productsData, setProductsData] = useState({});
  const [loading, setLoading] = useState(true);

  // Initialize and handle URL ?id= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const qty = Math.max(1, Number(params.get('qty') || 1));

    let items = getCartItems();

    if (id) {
      items = addToCart(id, qty);
      // Clean query parameter from URL without page reload
      window.history.replaceState({}, '', '/keranjang');
    }

    setCartItems(items);

    if (items.length > 0) {
      fetchProducts(items.map((i) => i.id));
    } else {
      setLoading(false);
    }

    const handleCartUpdate = () => {
      const updated = getCartItems();
      setCartItems(updated);
      if (updated.length > 0) {
        fetchProducts(updated.map((i) => i.id));
      }
    };

    window.addEventListener('sixtee_cart_updated', handleCartUpdate);
    return () => window.removeEventListener('sixtee_cart_updated', handleCartUpdate);
  }, []);

  async function fetchProducts(ids) {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data?.products) {
        const map = {};
        for (const p of data.products) {
          map[p.id_produk] = p;
        }
        setProductsData(map);
      }
    } catch (e) {
      console.error('Error fetching cart products:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleIncrement(id) {
    const current = cartItems.find((i) => i.id === id);
    if (current) {
      const updated = updateCartQuantity(id, current.quantity + 1);
      setCartItems(updated);
    }
  }

  function handleDecrement(id) {
    const current = cartItems.find((i) => i.id === id);
    if (current) {
      if (current.quantity > 1) {
        const updated = updateCartQuantity(id, current.quantity - 1);
        setCartItems(updated);
      } else {
        handleRemove(id);
      }
    }
  }

  function handleRemove(id) {
    if (confirm('Batalkan dan hapus produk ini dari keranjang?')) {
      const updated = removeFromCart(id);
      setCartItems(updated);
    }
  }

  function handleClear() {
    if (confirm('Kosongkan semua produk dalam keranjang?')) {
      clearCart();
      setCartItems([]);
    }
  }

  // Calculate totals
  const { totalItems, subtotalPrice, totalWeightKg } = useMemo(() => {
    let itemsCount = 0;
    let price = 0;
    let weight = 0;

    for (const item of cartItems) {
      const p = productsData[item.id];
      const qty = item.quantity;
      itemsCount += qty;
      if (p) {
        price += Number(p.harga_produk) * qty;
        weight += (Number(p.berat_produk) || 500) * qty;
      }
    }

    return {
      totalItems: itemsCount,
      subtotalPrice: price,
      totalWeightKg: Math.max(1, Math.ceil(weight / 1000)),
    };
  }, [cartItems, productsData]);

  return (
    <>
      <Navbar />
      <main className="shell simple-page" style={{ paddingTop: '36px', paddingBottom: '70px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="eyebrow">KERANJANG BELANJA</span>
          <h1 style={{ margin: '8px 0 6px', fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Kelola Produk Pilihan Anda
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Periksa kembali barang belanjaan Anda, sesuaikan jumlah, atau batalkan sebelum melanjutkan checkout.
          </p>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Memuat keranjang belanja...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
            <h2>Keranjang belanja Anda masih kosong</h2>
            <p style={{ maxWidth: '420px', margin: '8px auto 24px', color: 'var(--muted)' }}>
              Belum ada produk yang dipilih. Silakan jelajahi katalog untuk menemukan produk yang Anda butuhkan.
            </p>
            <Link className="button button-primary" href="/katalog">
              Mulai Belanja -&gt;
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            {/* Left Column: Product List */}
            <div className="cart-items-column">
              <div className="cart-card">
                <div className="cart-header-row">
                  <span>Produk ({totalItems} barang)</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="cart-clear-btn"
                  >
                    Kosongkan Keranjang
                  </button>
                </div>

                <div className="cart-list">
                  {cartItems.map((item) => {
                    const product = productsData[item.id];
                    const price = product ? Number(product.harga_produk) : 0;
                    const itemSubtotal = price * item.quantity;

                    return (
                      <div key={item.id} className="cart-row">
                        <div className="cart-img-wrapper">
                          <img
                            src={product ? `/images/${product.foto_produk}` : '/images/placeholder.png'}
                            alt={product?.nama_produk || 'Produk'}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="cart-item-details">
                          <Link
                            href={`/produk/${item.id}`}
                            className="cart-item-name"
                          >
                            {product ? product.nama_produk : `Produk #${item.id}`}
                          </Link>
                          <div className="cart-item-price">
                            Rp {price.toLocaleString('id-ID')}
                            {product?.berat_produk && (
                              <span className="cart-item-weight">
                                ({product.berat_produk}g / pcs)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="cart-stepper-wrap">
                          <div className="qty-picker">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleDecrement(item.id)}
                              title={item.quantity === 1 ? 'Hapus barang' : 'Kurangi jumlah'}
                            >
                              -
                            </button>
                            <span className="qty-number">{item.quantity}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleIncrement(item.id)}
                              title="Tambah jumlah"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="cart-subtotal-wrap">
                          <span className="cart-subtotal-label">Subtotal:</span>
                          <strong className="cart-subtotal-val">
                            Rp {itemSubtotal.toLocaleString('id-ID')}
                          </strong>
                        </div>

                        {/* Remove Action */}
                        <div className="cart-action-wrap">
                          <button
                            type="button"
                            className="cart-remove-btn"
                            onClick={() => handleRemove(item.id)}
                            title="Batalkan / Hapus produk"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-footer-nav">
                  <Link className="back-link" href="/katalog" style={{ margin: 0 }}>
                    &lt;- Lanjut Belanja Produk Lainnya
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="cart-summary-column">
              <div className="checkout-summary-card">
                <h3>Ringkasan Belanja</h3>

                <div className="summary-row">
                  <span>Total Jumlah Barang</span>
                  <strong>{totalItems} item</strong>
                </div>

                <div className="summary-row">
                  <span>Estimasi Berat Total</span>
                  <span>± {totalWeightKg} kg</span>
                </div>

                <div className="summary-row">
                  <span>Total Harga Produk</span>
                  <strong>Rp {subtotalPrice.toLocaleString('id-ID')}</strong>
                </div>

                <div className="summary-divider" />

                <div className="summary-total-row">
                  <span>Total Belanja</span>
                  <strong className="total-highlight">
                    Rp {subtotalPrice.toLocaleString('id-ID')}
                  </strong>
                </div>

                <p className="summary-shipping-note">
                  * Biaya ongkos kirim akan dihitung secara otomatis pada halaman checkout berdasarkan alamat tujuan pengiriman Anda.
                </p>

                <Link
                  href="/checkout"
                  className="button button-primary"
                  style={{ width: '100%', textAlign: 'center', marginTop: '16px' }}
                >
                  Lanjut ke Checkout -&gt;
                </Link>

                <Link
                  href="/katalog"
                  className="button button-soft"
                  style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}
                >
                  Tambah Produk Lain
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
