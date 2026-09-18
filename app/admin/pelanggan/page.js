import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export default async function AdminCustomersPage() {
  if (!(await cookies()).get('sixtee_admin')) redirect('/admin/login');
  const db = getDb(); const rows = db ? (await db.query('SELECT id_pelanggan, nama_pelanggan, email, telepon FROM tb_pelanggan ORDER BY id_pelanggan DESC')).rows : [];
  return <main className="admin-shell"><aside className="admin-sidebar"><span className="admin-logo">SIXTEE<span>ADMIN</span></span><nav><Link href="/admin">Dashboard</Link><Link href="/admin/produk">Produk</Link><Link href="/admin/pembelian">Pembelian</Link><Link className="active" href="/admin/pelanggan">Pelanggan</Link><Link href="/">Lihat toko</Link></nav></aside><section className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">CUSTOMER MANAGEMENT</span><h1>Pelanggan</h1></div><Link className="button button-primary" href="/admin">Dashboard</Link></header><div className="admin-table"><div className="admin-table-head"><span>Nama</span><span>Email</span><span>Telepon</span></div>{rows.map((row) => <div className="admin-table-row" key={row.id_pelanggan}><strong>{row.nama_pelanggan}</strong><span>{row.email}</span><span>{row.telepon}</span></div>)}</div></section></main>;
}
