import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import { getProducts } from '../../lib/db';

export const dynamic = 'force-dynamic';

export default async function CatalogPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.q || '';
  const sort = params?.sort || 'terbaru';
  const products = await getProducts({ search, sort });

  return (
    <>
      <Navbar />
      <main className="shell catalog-page">
        <section className="catalog-hero"><div><span className="eyebrow">SIXTEE SELECTS</span><h1>Temukan barang favoritmu.</h1><p>Jelajahi koleksi pilihan kami dan temukan produk yang pas untuk kebutuhanmu.</p></div><strong>01<small> KOLEKSI</small></strong></section>
        <form className="catalog-toolbar" method="GET">
          <label className="search-box"><span aria-hidden="true">⌕</span><input name="q" defaultValue={search} placeholder="Cari nama produk..." /></label>
          <label className="sort-box">Urutkan<select name="sort" defaultValue={sort}><option value="terbaru">Terbaru</option><option value="termurah">Harga terendah</option><option value="termahal">Harga tertinggi</option></select><button className="button button-soft" type="submit">Terapkan</button></label>
        </form>
        <div className="catalog-meta"><strong>{products.length}</strong> produk ditemukan</div>
        <div className="product-grid">{products.map((product) => <ProductCard key={product.id_produk} product={product} />)}</div>
        {products.length === 0 && <div className="empty-state"><h2>Produk belum ditemukan</h2><p>Coba kata kunci yang berbeda.</p></div>}
      </main>
    </>
  );
}
