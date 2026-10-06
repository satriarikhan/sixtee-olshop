import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { getOrderById } from '../../../lib/db';
import PaymentForm from './PaymentForm';

export const dynamic = 'force-dynamic';

export default async function PembayaranPage({ params }) {
  const { id } = await params;
  const order = await getOrderById(id);

  return (
    <>
      <Navbar />
      <main className="shell simple-page" style={{ paddingTop: '36px', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href={`/nota/${id}`} className="back-link">
            &larr; Kembali ke Nota Pesanan
          </Link>
          <span className="eyebrow" style={{ display: 'block' }}>KONFIRMASI PEMBAYARAN</span>
          <h1 style={{ margin: '8px 0 6px', fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Bayar Pesanan #{id}
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Selesaikan pembayaran pesanan Anda menggunakan transfer bank atau QRIS instan.
          </p>
        </div>

        {order ? (
          <PaymentForm order={order} />
        ) : (
          <div className="empty-state">
            <p>Pesanan #{id} tidak ditemukan.</p>
            <Link className="button button-primary" href="/">
              Lanjut Belanja
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

