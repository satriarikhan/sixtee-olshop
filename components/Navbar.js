import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Link className="brand" href="/">SIXTEE SHOP</Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="/">Beranda</Link>
          <Link href="/katalog">Katalog</Link>
          <Link href="/keranjang">Keranjang</Link>
          <Link href="/ulasan">Ulasan</Link>
          <Link href="/login">Login</Link>
        </nav>
        <Link className="nav-action" href="/katalog">Mulai belanja <span aria-hidden="true">-&gt;</span></Link>
      </div>
    </header>
  );
}
