'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setLoading(true); setMessage('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message); setLoading(false); return; }
    router.push('/login');
  }

  return <main className="auth-page"><div className="auth-card"><span className="eyebrow">SIXTEE SHOP</span><h1>Buat akun baru.</h1><p>Daftar sekali, belanja lebih mudah.</p>{message && <div className="form-message">{message}</div>}<form onSubmit={submit}><label>Nama lengkap<input name="name" required placeholder="Nama lengkap" /></label><label>Email<input name="email" type="email" required placeholder="email@example.com" /></label><label>Password<input name="password" type="password" required placeholder="Password" /></label><label>No. telepon<input name="phone" required placeholder="No. telepon" /></label><button className="button button-primary" disabled={loading}>{loading ? 'Memproses...' : 'Daftar'}</button></form><div className="auth-footer">Sudah punya akun? <Link href="/login">Masuk</Link></div></div></main>;
}
