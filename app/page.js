import Link from 'next/link';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main>
        <section className="home-hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">PILIHAN HARI INI</span>
              <h1>Barang pilihan untuk hari yang lebih praktis.</h1>
              <p>Temukan koleksi yang dikurasi dengan proses belanja sederhana dan layanan yang bisa diandalkan.</p>
              <Link className="button button-primary" href="/katalog">Jelajahi katalog <span aria-hidden="true">-&gt;</span></Link>
            </div>
            <div className="hero-note"><strong>Belanja lebih tenang.</strong><br />Pilihan jelas, proses ringkas.</div>
          </div>
        </section>
        <section className="shell home-section">
          <div className="section-heading"><div><span className="eyebrow">SIXTEE SHOP</span><h2>Belanja tanpa berputar-putar.</h2></div><Link href="/katalog">Lihat semua -&gt;</Link></div>
          <div className="feature-row"><div><b>01</b><h3>Pilihan terkurasi</h3><p>Produk yang mudah ditemukan dan dipahami.</p></div><div><b>02</b><h3>Checkout sederhana</h3><p>Alur belanja dibuat singkat sampai selesai.</p></div><div><b>03</b><h3>Dukungan langsung</h3><p>Hubungi kami saat membutuhkan bantuan.</p></div></div>
        </section>
        <section className="shell home-section">
          <div className="section-heading"><div><span className="eyebrow">PREVIEW KATALOG</span><h2>Beberapa favorit minggu ini.</h2></div><Link href="/katalog">Buka katalog -&gt;</Link></div>
          <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id_produk} product={product} />)}</div>
        </section>
      </main>
    </>
  );
}
