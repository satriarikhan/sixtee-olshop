'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToCart } from '../lib/cart';

export default function AddToCartBox({ productId }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(productId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addToCart(productId, quantity);
    router.push('/keranjang');
  }

  return (
    <div className="purchase-box">
      <label>
        Jumlah Pembelian
        <div className="qty-picker">
          <button
            type="button"
            className="qty-btn"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="qty-input"
          />
          <button
            type="button"
            className="qty-btn"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
      </label>

      {added && (
        <div className="alert-success-badge">
          Berhasil ditambahkan ke keranjang!
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
        <button
          type="button"
          className="button button-soft"
          style={{ flex: 1 }}
          onClick={handleAdd}
        >
          + Tambah ke Keranjang
        </button>
        <button
          type="button"
          className="button button-primary"
          style={{ flex: 1 }}
          onClick={handleBuyNow}
        >
          Beli Sekarang -&gt;
        </button>
      </div>
    </div>
  );
}

