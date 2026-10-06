'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Login gagal.');
      setLoading(false);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect') || '/';
    router.push(redirectUrl);
    router.refresh();
  }

  return <main className="auth-page"><div className="auth-card"><span className="eyebrow">SIXTEE SHOP</span><h1>Selamat datang kembali.</h1><p>Masuk untuk melanjutkan belanja.</p>{message && <div className="form-message">{message}</div>}<form onSubmit={submit}><label>Email<input name="email" type="email" required placeholder="email@example.com" /></label><label>Password<input name="password" type="password" required placeholder="Password" /></label><button className="button button-primary" disabled={loading}>{loading ? 'Memproses...' : 'Masuk'}</button></form><div className="auth-footer">Belum punya akun? <Link href="/daftar">Daftar sekarang</Link></div></div></main>;
}
