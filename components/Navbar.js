import Link from 'next/link';
import CartBadge from './CartBadge';
import UserNav from './UserNav';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Link className="brand" href="/">SIXTEE SHOP</Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="/">Beranda</Link>
          <Link href="/katalog">Katalog</Link>
          <CartBadge />
          <Link href="/ulasan">Ulasan</Link>
          <UserNav />
        </nav>
        <Link className="nav-action" href="/katalog">Mulai belanja <span aria-hidden="true">-&gt;</span></Link>
      </div>
    </header>
  );
}
