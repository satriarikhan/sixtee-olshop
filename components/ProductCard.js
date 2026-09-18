import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link href={`/produk/${product.id_produk}`} className="product-image-wrap">
        <img src={`/images/${product.foto_produk}`} alt={product.nama_produk} />
      </Link>
      <div className="product-card-body">
        <span className="product-tag">READY STOCK</span>
        <h3>{product.nama_produk}</h3>
        <strong className="price">Rp {Number(product.harga_produk).toLocaleString('id-ID')}</strong>
        <p>{product.deskripsi_produk.slice(0, 62)}...</p>
        <div className="product-actions">
          <Link className="button button-primary" href={`/keranjang?id=${product.id_produk}`}>Beli</Link>
          <Link className="button button-soft" href={`/produk/${product.id_produk}`}>Detail</Link>
        </div>
      </div>
    </article>
  );
}
