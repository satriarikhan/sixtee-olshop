import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export default async function AdminOrdersPage() {
  if (!(await cookies()).get('sixtee_admin')) redirect('/admin/login');
  const db = getDb(); const rows = db ? (await db.query('SELECT id_pembelian, id_pelanggan, total_pembelian, status, tanggal_pembelian FROM tb_pembelian ORDER BY id_pembelian DESC')).rows : [];
  return <AdminList title="Pembelian" eyebrow="ORDER MANAGEMENT" headers={['ID pesanan','Pelanggan','Total','Status']} rows={rows.map((row) => [row.id_pembelian, row.id_pelanggan, `Rp ${Number(row.total_pembelian).toLocaleString('id-ID')}`, row.status])} />;
}
function AdminList({ title, eyebrow, headers, rows }) { return <main className="admin-shell"><aside className="admin-sidebar"><span className="admin-logo">SIXTEE<span>ADMIN</span></span><nav><Link href="/admin">Dashboard</Link><Link href="/admin/produk">Produk</Link><Link className="active" href="/admin/pembelian">Pembelian</Link><Link href="/admin/pelanggan">Pelanggan</Link><Link href="/">Lihat toko</Link></nav></aside><section className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div><Link className="button button-primary" href="/admin">Dashboard</Link></header><div className="admin-table"><div className="admin-table-head">{headers.map((header) => <span key={header}>{header}</span>)}</div>{rows.map((row, index) => <div className="admin-table-row" key={index}>{row.map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}</div>)}</div></section></main>; }
