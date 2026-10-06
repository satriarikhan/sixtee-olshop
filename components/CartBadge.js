'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCartItems } from '../lib/cart';

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function update() {
      const items = getCartItems();
      const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCount(total);
    }

    update();
    window.addEventListener('sixtee_cart_updated', update);
    window.addEventListener('storage', update);

    return () => {
      window.removeEventListener('sixtee_cart_updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return (
    <Link href="/keranjang" className="nav-cart-link">
      Keranjang
      {count > 0 && <span className="nav-cart-badge">{count}</span>}
    </Link>
  );
}

