import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProducts } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get('sixtee_admin')) redirect('/admin/login');
  const products = await getProducts();
  return <main className="admin-shell"><aside className="admin-sidebar"><span className="admin-logo">SIXTEE<span>ADMIN</span></span><nav><Link href="/admin">Dashboard</Link><Link className="active" href="/admin/produk">Produk</Link><Link href="/admin/pembelian">Pembelian</Link><Link href="/admin/pelanggan">Pelanggan</Link><Link href="/">Lihat toko</Link></nav></aside><section className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">CATALOG MANAGEMENT</span><h1>Produk</h1></div><Link className="button button-primary" href="/admin">Kembali</Link></header><div className="admin-table"><div className="admin-table-head"><span>Produk</span><span>Harga</span><span>Status</span></div>{products.map((product) => <div className="admin-table-row" key={product.id_produk}><strong>{product.nama_produk}</strong><span>Rp {Number(product.harga_produk).toLocaleString('id-ID')}</span><span className="status-ready">Ready stock</span></div>)}</div></section></main>;
}
