'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserNav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  }

  if (user) {
    const displayName = user.nama_pelanggan
      ? user.nama_pelanggan.split(' ')[0]
      : 'Akun';

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
          {displayName}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: '13px',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Keluar
        </button>
      </div>
    );
  }

  return <Link href="/login">Login</Link>;
}

