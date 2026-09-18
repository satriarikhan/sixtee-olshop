import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { getProduct } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return <><Navbar /><main className="shell product-detail"><Link className="back-link" href="/katalog">&lt;- Kembali ke katalog</Link><div className="product-detail-grid"><div className="product-detail-image"><img src={`/images/${product.foto_produk}`} alt={product.nama_produk} /></div><div className="product-detail-copy"><span className="product-tag">READY STOCK</span><h1>{product.nama_produk}</h1><strong className="detail-price">Rp {Number(product.harga_produk).toLocaleString('id-ID')}</strong><p>{product.deskripsi_produk}</p><div className="purchase-box"><label>Jumlah<input type="number" min="1" defaultValue="1" /></label><Link className="button button-primary" href={`/keranjang?id=${product.id_produk}`}>Tambah ke keranjang</Link></div></div></div></main></>;
}
