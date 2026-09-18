import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '../../lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const admin = cookieStore.get('sixtee_admin');
  if (!admin) redirect('/admin/login');
  const db = getDb();
  const stats = db ? await Promise.all([
    db.query('SELECT COUNT(*)::int AS total FROM tb_pelanggan'),
    db.query('SELECT COUNT(*)::int AS total FROM tb_produk'),
    db.query('SELECT COUNT(*)::int AS total FROM tb_pembelian'),
    db.query('SELECT COALESCE(SUM(total_pembelian), 0)::int AS total FROM tb_pembelian'),
  ]) : [];
  const values = stats.map((item) => item.rows[0].total);
  return <main className="admin-shell"><aside className="admin-sidebar"><span className="admin-logo">SIXTEE<span>ADMIN</span></span><nav><Link className="active" href="/admin">Dashboard</Link><Link href="/admin/produk">Produk</Link><Link href="/admin/pembelian">Pembelian</Link><Link href="/admin/pelanggan">Pelanggan</Link><Link href="/admin/pembayaran">Pembayaran</Link><Link href="/">Lihat toko</Link></nav></aside><section className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">CONTROL CENTER</span><h1>Dashboard</h1></div><span className="admin-user">{JSON.parse(admin.value).nama}</span></header><div className="admin-stats"><Stat label="Pelanggan" value={values[0] ?? 0} /><Stat label="Produk aktif" value={values[1] ?? 0} /><Stat label="Total pesanan" value={values[2] ?? 0} /><Stat label="Total penjualan" value={`Rp ${Number(values[3] ?? 0).toLocaleString('id-ID')}`} /></div><section className="admin-welcome"><span className="eyebrow">SIXTEE SHOP</span><h2>Selamat bekerja.</h2><p>Gunakan navigasi di samping untuk mengelola toko dengan cepat.</p></section></section></main>;
}

function Stat({ label, value }) { return <div className="admin-stat"><span>{label}</span><strong>{value}</strong></div>; }
