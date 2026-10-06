'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PaymentForm({ order }) {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [payerName, setPayerName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(order.status === 'Sudah Dibayar' || order.status === 'Lunas');

  const banks = {
    BCA: { name: 'Bank BCA', rekening: '8830-1928-1029', atasNama: 'SIXTEE SHOP ID' },
    Mandiri: { name: 'Bank Mandiri', rekening: '137-00-1928371-9', atasNama: 'SIXTEE SHOP ID' },
    BRI: { name: 'Bank BRI', rekening: '0341-01-002891-30-2', atasNama: 'SIXTEE SHOP ID' },
    QRIS: { name: 'QRIS (Semua E-Wallet & Mobile Banking)', rekening: 'Scan QRIS SIXTEE SHOP', atasNama: 'SIXTEE INDONESIA' },
  };

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payerName.trim()) {
      setErrorMsg('Harap masukkan nama pengirim / penyetor.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id_pembelian,
          nama: payerName.trim(),
          bank: banks[selectedBank]?.name || selectedBank,
          jumlah: Number(order.total_pembelian),
          bukti: 'bukti_' + Date.now() + '.jpg',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Pembayaran gagal diproses.');
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        padding: '36px',
        maxWidth: '640px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#e6f7ed',
          color: '#1e7e4a',
          fontSize: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontWeight: 800
        }}>
          ✓
        </div>
        <h2 style={{ fontSize: '26px', margin: '0 0 8px' }}>Pembayaran Berhasil!</h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
          Terima kasih! Pembayaran untuk pesanan #{order.id_pembelian} sebesar{' '}
          <strong style={{ color: 'var(--brand)' }}>
            Rp {Number(order.total_pembelian).toLocaleString('id-ID')}
          </strong>{' '}
          telah kami terima. Pesanan Anda akan segera kami kemas dan kirimkan.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="button button-primary" href={`/nota/${order.id_pembelian}`}>
            Lihat Nota Pesanan
          </Link>
          <Link className="button button-soft" href="/">
            Lanjut Belanja &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '28px', maxWidth: '1000px' }}>
      {/* Left Column: Payment Method & Details */}
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: '18px', margin: '0 0 16px' }}>1. Pilih Metode Pembayaran</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {Object.keys(banks).map((key) => {
            const b = banks[key];
            const isSelected = selectedBank === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedBank(key)}
                style={{
                  background: isSelected ? '#fff5f2' : '#f8fafc',
                  border: isSelected ? '2px solid var(--brand)' : '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all .15s'
                }}
              >
                <strong style={{ color: isSelected ? 'var(--brand)' : 'var(--ink)', fontSize: '15px', display: 'block' }}>
                  {b.name}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                  {key === 'QRIS' ? 'Semua E-Wallet / Mobile' : 'Transfer Otomatis'}
                </span>
              </button>
            );
          })}
        </div>

        <h3 style={{ fontSize: '18px', margin: '0 0 16px' }}>2. Rekening Tujuan Transfer</h3>
        <div style={{ background: '#f8fafc', border: '1px solid var(--line)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          {selectedBank === 'QRIS' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                background: '#fff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  width: '180px',
                  height: '180px',
                  background: 'repeating-linear-gradient(45deg, #182230, #182230 12px, #ffffff 12px, #ffffff 24px)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)'
                }}>
                  QRIS SIXTEE SHOP
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px' }}>
                Buka aplikasi BCA Mobile, GoPay, OVO, Dana, ShopeePay, lalu scan kode QR di atas.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Nomor Rekening {banks[selectedBank]?.name}</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    {banks[selectedBank]?.rekening}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                    Atas Nama: <strong>{banks[selectedBank]?.atasNama}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(banks[selectedBank]?.rekening)}
                  style={{
                    background: copied ? '#e6f7ed' : '#fff',
                    border: copied ? '1px solid #1e7e4a' : '1px solid var(--line)',
                    color: copied ? '#1e7e4a' : 'var(--brand)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? '✓ Tersalin' : 'Salin Rekening'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Confirmation */}
        <h3 style={{ fontSize: '18px', margin: '0 0 16px' }}>3. Konfirmasi Nama Penyetor</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              Nama Pemilik Rekening / Pengirim <span style={{ color: 'var(--brand)' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', padding: '10px 14px', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              className="button button-primary"
              style={{
                flex: 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontSize: '15px',
                padding: '14px',
                textAlign: 'center'
              }}
            >
              {loading ? 'Memproses...' : '💳 Bayar Sekarang'}
            </button>
            <Link className="button button-soft" href="/" style={{ padding: '14px 20px', cursor: 'pointer' }}>
              Lanjut Belanja
            </Link>
          </div>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)', height: 'fit-content' }}>
        <h3 style={{ fontSize: '18px', margin: '0 0 16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          Ringkasan Tagihan
        </h3>

        <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
          {order.items?.map((item) => (
            <div key={item.id_produk} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>{item.nama_produk} &times; {item.jumlah}</span>
              <strong>Rp {(Number(item.harga_produk) * Number(item.jumlah)).toLocaleString('id-ID')}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)', borderTop: '1px dashed var(--line)', paddingTop: '8px' }}>
            <span>Ongkos Kirim</span>
            <span>Rp {Number(order.tarif || 0).toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div style={{ background: '#fffaf7', border: '1px solid #fed7cc', borderRadius: '10px', padding: '16px', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Total yang Harus Dibayar:</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand)', marginTop: '2px' }}>
            Rp {Number(order.total_pembelian).toLocaleString('id-ID')}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <Link href={`/nota/${order.id_pembelian}`} style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'underline' }}>
            &larr; Lihat detail lengkap pada Nota Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}

