import Link from 'next/link';
import Navbar from '../../../components/Navbar';

export default async function NotaPage({ params }) {
  const { id } = await params;
  return <><Navbar /><main className="shell simple-page"><span className="eyebrow">PESANAN #{id}</span><h1>Pesanan berhasil dibuat.</h1><p>Simpan nomor pesanan ini untuk melihat proses pembayaran dan status transaksi.</p><div className="purchase-box"><strong>Status: Pending</strong><p>Pesanan akan diproses setelah pembayaran dikonfirmasi.</p><Link className="button button-primary" href="/">Kembali ke beranda</Link></div></main></>;
}
