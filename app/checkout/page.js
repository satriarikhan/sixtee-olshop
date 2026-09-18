'use client';

import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useState } from 'react';

export default function CheckoutPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form);
    body.items = JSON.parse(localStorage.getItem('sixtee_cart') || '[]');
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message); setLoading(false); return; }
    localStorage.removeItem('sixtee_cart');
    window.location.href = `/nota/${data.id}`;
  }
  return <><Navbar /><main className="shell simple-page"><span className="eyebrow">CHECKOUT</span><h1>Lengkapi pengiriman.</h1><p>Masukkan alamat lengkap agar pesanan dapat diproses.</p>{message && <div className="form-message">{message}</div>}<form className="checkout-card" onSubmit={submit}><label>Alamat lengkap<textarea name="address" required placeholder="Alamat pengiriman" /></label><label>Provinsi<input name="province" required placeholder="Contoh: 34" /></label><label>Kabupaten/Kota<input name="district" required placeholder="Nama kabupaten/kota" /></label><label>Kecamatan<input name="subdistrict" required placeholder="Nama kecamatan" /></label><button className="button button-primary" type="submit" disabled={loading}>{loading ? 'Membuat pesanan...' : 'Buat pesanan ->'}</button></form><Link className="back-link" href="/keranjang">&lt;- Kembali ke keranjang</Link></main></>;
}
