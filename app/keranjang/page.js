'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const current = JSON.parse(localStorage.getItem('sixtee_cart') || '[]');
    if (id && !current.includes(id)) current.push(id);
    localStorage.setItem('sixtee_cart', JSON.stringify(current));
    setCart(current);
  }, []);
  return <><header className="site-header"><div className="shell nav-inner"><Link className="brand" href="/">SIXTEE SHOP</Link><nav className="main-nav"><Link href="/katalog">Katalog</Link><Link href="/checkout">Checkout</Link></nav></div></header><main className="shell simple-page"><span className="eyebrow">KERANJANG</span><h1>Siap melanjutkan?</h1><p>{cart.length ? `${cart.length} produk tersimpan di keranjang.` : 'Keranjangmu masih kosong.'}</p>{cart.length ? <Link className="button button-primary" href="/checkout">Lanjut checkout -&gt;</Link> : <Link className="button button-primary" href="/katalog">Pilih produk</Link>}</main></>;
}
