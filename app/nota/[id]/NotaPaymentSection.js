'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NotaPaymentSection({ order }) {
  const [status, setStatus] = useState(order.status || 'Pending');
  const [paymentData, setPaymentData] = useState(order.pembayaran || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('BCA');
  const [payerName, setPayerName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handlePaySubmit = async (e) => {
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

      setStatus('Sudah Dibayar');
      setPaymentData(data.payment);
      setSuccessMsg('Pembayaran Anda berhasil dikonfirmasi! Pesanan sedang disiapkan.');
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const isPaid = status === 'Sudah Dibayar' || status === 'Lunas' || Boolean(paymentData);

  return (
    <div>
      {/* Payment Success Alert if already paid */}
      {isPaid ? (
        <div style={{
          background: '#e6f7ed',
          border: '1px solid #b7ebd0',
          borderRadius: '12px',
          padding: '20px 24px',
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: '#1e7e4a',
            color: '#fff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 800,
            flexShrink: 0
          }}>
            ✓
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px', color: '#1e7e4a', fontSize: '16px' }}>
              Pembayaran Berhasil Dikonfirmasi
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#2b523b' }}>
              {successMsg || 'Pesanan telah lunas. Tim kami sedang memverifikasi dan menyiapkan barang untuk pengiriman ke alamat Anda.'}
            </p>
            {paymentData && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#476352' }}>
                <span>Metode: <strong>{paymentData.bank}</strong></span> &bull; <span>Penyetor: <strong>{paymentData.nama}</strong></span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        marginTop: '28px',
        alignItems: 'center'
      }}>
        {!isPaid ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => setIsModalOpen(true)}
            style={{
              cursor: 'pointer',
              fontSize: '15px',
              padding: '14px 26px',
              boxShadow: '0 4px 14px rgba(232, 93, 63, 0.35)',
            }}
          >
            💳 Bayar Sekarang
          </button>
        ) : (
          <span style={{
            background: '#e6f7ed',
            color: '#1e7e4a',
            fontWeight: 700,
            fontSize: '14px',
            padding: '12px 20px',
            borderRadius: '9px',
            border: '1px solid #b7ebd0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✓ Pembayaran Lunas
          </span>
        )}

        {/* Lanjut Belanja directing to Beranda (/) as requested */}
        <Link
          className="button button-soft"
          href="/"
          style={{
            cursor: 'pointer',
            fontSize: '15px',
            padding: '14px 24px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Lanjut Belanja &rarr;
        </Link>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(24, 34, 48, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--line)',
            padding: '28px',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span className="eyebrow">PEMBAYARAN INSTAN</span>
                <h3 style={{ margin: '4px 0 0', fontSize: '22px' }}>
                  Bayar Pesanan #{order.id_pembelian}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 0,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
            </div>

            {/* Total to pay banner */}
            <div style={{
              background: '#fffaf7',
              border: '1px solid #fed7cc',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Total Pembayaran</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--brand)' }}>
                  Rp {Number(order.total_pembelian).toLocaleString('id-ID')}
                </div>
              </div>
              <span style={{
                background: '#ffede8',
                color: 'var(--brand)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                Menunggu Pembayaran
              </span>
            </div>

            {/* Bank/Method Selection */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Pilih Metode Pembayaran
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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
                        borderRadius: '10px',
                        padding: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--brand)' : 'var(--ink)' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        {key === 'QRIS' ? 'QR Code Instan' : 'Transfer Bank'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Bank Details */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                {selectedBank === 'QRIS' ? 'Instruksi QRIS:' : 'Nomor Rekening Tujuan:'}
              </div>

              {selectedBank === 'QRIS' ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{
                    display: 'inline-block',
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}>
                    {/* Visual QR Code Representation */}
                    <div style={{
                      width: '140px',
                      height: '140px',
                      background: 'repeating-linear-gradient(45deg, #182230, #182230 10px, #ffffff 10px, #ffffff 20px)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 700,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                    }}>
                      QRIS SIXTEE
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                    Mendukung GoPay, OVO, DANA, ShopeePay, LinkAja & BCA Mobile
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--ink)' }}>
                      {banks[selectedBank]?.rekening}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                      a.n. <strong>{banks[selectedBank]?.atasNama}</strong>
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
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? '✓ Tersalin' : 'Salin Rekening'}
                  </button>
                </div>
              )}
            </div>

            {/* Payment Confirmation Form */}
            <form onSubmit={handlePaySubmit}>
              <div style={{ display: 'grid', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Nama Pengirim / Pemilik Rekening <span style={{ color: 'var(--brand)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{
                  background: '#fbfcfd',
                  border: '1px dashed var(--line)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  color: 'var(--muted)'
                }}>
                  ℹ️ Sistem akan secara otomatis memverifikasi dan menandai pesanan Anda sebagai <strong>Lunas</strong> setelah Anda menekan tombol di bawah.
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '13px',
                  padding: '10px 14px',
                  marginBottom: '16px'
                }}>
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
                  {loading ? 'Memproses Pembayaran...' : '✓ Konfirmasi & Selesaikan Pembayaran'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="button"
                  style={{
                    background: '#f1f5f9',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    padding: '14px 20px',
                    fontSize: '14px'
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

