'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setMessage('');
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message); return; }
    router.push('/admin');
  }
  return <main className="admin-auth"><div className="admin-auth-card"><span className="eyebrow">SIXTEE CONTROL</span><h1>Masuk ke admin.</h1><p>Kelola katalog, pelanggan, dan pesanan dari satu tempat.</p>{message && <div className="form-message">{message}</div>}<form onSubmit={submit}><label>Username<input name="username" required placeholder="Username" /></label><label>Password<input name="password" type="password" required placeholder="Password" /></label><button className="button button-primary">Masuk ke dashboard</button></form></div></main>;
}
