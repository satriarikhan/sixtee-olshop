import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import { getOrderById } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export default async function NotaPage({ params }) {
  const { id } = await params;
  const order = await getOrderById(id);

  return (
    <>
      <Navbar />
      <main className="shell simple-page" style={{ paddingTop: '36px', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="eyebrow">NOTA TRANSAKSI #{id}</span>
          <h1 style={{ margin: '8px 0 6px', fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Pesanan Berhasil Dibuat
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Simpan nomor pesanan ini untuk bukti dan pengecekan proses pembayaran serta pengiriman barang.
          </p>
        </div>

        {order ? (
          <div className="nota-container">
            {/* Order Status Banner */}
            <div className="nota-banner">
              <div>
                <strong>Status Pesanan: <span className="status-badge">{order.status || 'Pending'}</span></strong>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--muted)' }}>
                  Tanggal Pemesanan: {new Date(order.tanggal_pembelian).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="nota-total-box">
                <span>Total Tagihan</span>
                <strong>Rp {Number(order.total_pembelian).toLocaleString('id-ID')}</strong>
              </div>
            </div>

            {/* Destination Info */}
            <div className="nota-section">
              <h3 style={{ fontSize: '18px', margin: '0 0 12px' }}>Tujuan Pengiriman</h3>
              <div className="nota-address-box">
                <p><strong>Alamat:</strong> {order.alamat}</p>
                <p><strong>Kecamatan / Kabupaten:</strong> {order.kecamatan}, {order.kabupaten}</p>
                <p><strong>Provinsi:</strong> {order.id_prov}</p>
              </div>
            </div>

            {/* Ordered Products Table */}
            <div className="nota-section">
              <h3 style={{ fontSize: '18px', margin: '0 0 12px' }}>Daftar Produk yang Dibeli</h3>
              <div className="nota-table-wrapper">
                <table className="nota-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                      <th style={{ textAlign: 'center' }}>Jumlah</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => {
                      const itemSubtotal = Number(item.harga_produk) * Number(item.jumlah);
                      return (
                        <tr key={item.id_produk}>
                          <td>
                            <strong>{item.nama_produk}</strong>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            Rp {Number(item.harga_produk).toLocaleString('id-ID')}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.jumlah}</td>
                          <td style={{ textAlign: 'right' }}>
                            Rp {itemSubtotal.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                        Biaya Pengiriman (Ongkir)
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        Rp {Number(order.tarif || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="nota-table-total-row">
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>
                        Total Pembayaran
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand)' }}>
                        Rp {Number(order.total_pembelian).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '28px' }}>
              <Link className="button button-primary" href="/">
                Kembali ke Beranda
              </Link>
              <Link className="button button-soft" href="/katalog">
                Lanjut Belanja Lagi
              </Link>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Rincian pesanan #{id} tidak ditemukan.</p>
            <Link className="button button-primary" href="/">
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
