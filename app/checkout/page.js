'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import { getCartItems, clearCart } from '../../lib/cart';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [productsData, setProductsData] = useState({});
  const [cartLoading, setCartLoading] = useState(true);

  // User state
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Wilayah dropdown states
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedRegency, setSelectedRegency] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [loadingWilayah, setLoadingWilayah] = useState({
    regencies: false,
    districts: false,
    villages: false,
  });

  // Shipping rates state
  const [shippingServices, setShippingServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [calculatingOngkir, setCalculatingOngkir] = useState(false);

  // Submit states
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Initial Load: Check Auth, Cart, and fetch Provinces
  useEffect(() => {
    // Check Auth
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
          setRecipientName(data.user.nama_pelanggan || '');
          setPhoneNumber(data.user.telepon || '');
        }
      })
      .catch((e) => console.error('Auth error:', e))
      .finally(() => setAuthChecked(true));

    // Load Cart
    const items = getCartItems();
    setCartItems(items);

    if (items.length > 0) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: items.map((i) => i.id) }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.products) {
            const map = {};
            for (const p of data.products) {
              map[p.id_produk] = p;
            }
            setProductsData(map);
          }
        })
        .finally(() => setCartLoading(false));
    } else {
      setCartLoading(false);
    }

    // Load Provinces
    fetch('/api/wilayah?type=provinces')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProvinces(data);
      })
      .catch((e) => console.error('Failed to load provinces:', e));
  }, []);

  // Compute Cart Calculations
  const { subtotalPrice, totalWeightGrams, totalWeightKg } = useMemo(() => {
    let subtotal = 0;
    let weight = 0;

    for (const item of cartItems) {
      const p = productsData[item.id];
      const qty = item.quantity;
      if (p) {
        subtotal += Number(p.harga_produk) * qty;
        weight += (Number(p.berat_produk) || 500) * qty;
      }
    }

    return {
      subtotalPrice: subtotal,
      totalWeightGrams: weight || 1000,
      totalWeightKg: Math.max(1, Math.ceil(weight / 1000)),
    };
  }, [cartItems, productsData]);

  // Handle Province Change -> Load Regencies & Calculate Ongkir
  async function handleProvinceChange(e) {
    const provId = e.target.value;
    if (!provId) {
      setSelectedProvince(null);
      setSelectedRegency(null);
      setSelectedDistrict(null);
      setSelectedVillage(null);
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
      setShippingServices([]);
      setSelectedService(null);
      return;
    }

    const provObj = provinces.find((p) => String(p.id) === String(provId));
    setSelectedProvince(provObj);
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setDistricts([]);
    setVillages([]);

    // Fetch Regencies
    setLoadingWilayah((prev) => ({ ...prev, regencies: true }));
    try {
      const res = await fetch(`/api/wilayah?type=regencies&id=${provId}`);
      const data = await res.json();
      setRegencies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch regencies:', err);
    } finally {
      setLoadingWilayah((prev) => ({ ...prev, regencies: false }));
    }

    // Calculate Ongkir based on Province and Weight
    setCalculatingOngkir(true);
    try {
      const res = await fetch(
        `/api/shipping?prov=${encodeURIComponent(provObj?.name || '')}&weight=${totalWeightGrams}`
      );
      const data = await res.json();
      if (data?.services && Array.isArray(data.services)) {
        setShippingServices(data.services);
        setSelectedService(data.services[0]); // Default to first service (Reguler)
      }
    } catch (err) {
      console.error('Failed to calculate shipping:', err);
    } finally {
      setCalculatingOngkir(false);
    }
  }

  // Handle Regency Change -> Load Districts
  async function handleRegencyChange(e) {
    const regencyId = e.target.value;
    if (!regencyId) {
      setSelectedRegency(null);
      setSelectedDistrict(null);
      setSelectedVillage(null);
      setDistricts([]);
      setVillages([]);
      return;
    }

    const regencyObj = regencies.find((r) => String(r.id) === String(regencyId));
    setSelectedRegency(regencyObj);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setVillages([]);

    setLoadingWilayah((prev) => ({ ...prev, districts: true }));
    try {
      const res = await fetch(`/api/wilayah?type=districts&id=${regencyId}`);
      const data = await res.json();
      setDistricts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    } finally {
      setLoadingWilayah((prev) => ({ ...prev, districts: false }));
    }
  }

  // Handle District Change -> Load Villages
  async function handleDistrictChange(e) {
    const districtId = e.target.value;
    if (!districtId) {
      setSelectedDistrict(null);
      setSelectedVillage(null);
      setVillages([]);
      return;
    }

    const distObj = districts.find((d) => String(d.id) === String(districtId));
    setSelectedDistrict(distObj);
    setSelectedVillage(null);

    setLoadingWilayah((prev) => ({ ...prev, villages: true }));
    try {
      const res = await fetch(`/api/wilayah?type=villages&id=${districtId}`);
      const data = await res.json();
      setVillages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch villages:', err);
    } finally {
      setLoadingWilayah((prev) => ({ ...prev, villages: false }));
    }
  }

  // Handle Village Change
  function handleVillageChange(e) {
    const villageId = e.target.value;
    const vilObj = villages.find((v) => String(v.id) === String(villageId));
    setSelectedVillage(vilObj || null);
  }

  // Handle Service Change
  function handleServiceSelect(service) {
    setSelectedService(service);
  }

  // Calculate final total
  const shippingCost = selectedService ? Number(selectedService.cost) : 0;
  const grandTotal = subtotalPrice + shippingCost;

  // Submit Order
  async function handleSubmitOrder(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Silakan login terlebih dahulu untuk menyelesaikan pesanan Anda.');
      return;
    }

    if (!cartItems.length) {
      setErrorMessage('Keranjang belanja Anda kosong.');
      return;
    }

    if (!selectedProvince) {
      setErrorMessage('Silakan pilih Provinsi tujuan pengiriman.');
      return;
    }

    if (!selectedRegency) {
      setErrorMessage('Silakan pilih Kabupaten / Kota tujuan pengiriman.');
      return;
    }

    if (!selectedDistrict) {
      setErrorMessage('Silakan pilih Kecamatan pengiriman.');
      return;
    }

    if (!streetAddress.trim()) {
      setErrorMessage('Silakan isi detail alamat lengkap pengiriman.');
      return;
    }

    setLoadingSubmit(true);

    try {
      // Assemble full address
      let fullAddressParts = [streetAddress.trim()];
      if (selectedVillage?.name) fullAddressParts.push(`Kel/Desa: ${selectedVillage.name}`);
      if (selectedProvince?.name) fullAddressParts.push(`Provinsi: ${selectedProvince.name}`);
      if (postalCode.trim()) fullAddressParts.push(`Kode Pos: ${postalCode.trim()}`);
      if (deliveryNote.trim()) fullAddressParts.push(`(Catatan: ${deliveryNote.trim()})`);
      if (recipientName.trim()) fullAddressParts.push(`Penerima: ${recipientName.trim()}`);
      if (phoneNumber.trim()) fullAddressParts.push(`Telp: ${phoneNumber.trim()}`);

      const fullAddressString = fullAddressParts.join(', ');

      const payload = {
        items: cartItems,
        address: streetAddress.trim(),
        province: selectedProvince.name,
        provinceId: String(selectedProvince.id || '').slice(0, 2),
        district: selectedRegency.name,
        subdistrict: selectedDistrict.name,
        shippingCost: shippingCost,
        shippingService: selectedService?.name || 'Reguler',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Gagal memproses pesanan.');
        setLoadingSubmit(false);
        return;
      }

      // Success
      clearCart();
      window.location.href = `/nota/${data.id}`;
    } catch (err) {
      setErrorMessage('Terjadi kendala koneksi saat membuat pesanan: ' + err.message);
      setLoadingSubmit(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="shell simple-page" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
        <Link className="back-link" href="/keranjang">
          &lt;- Kembali ke Keranjang
        </Link>

        <div style={{ marginBottom: '24px' }}>
          <span className="eyebrow">FORM PEMESANAN &amp; CHECKOUT</span>
          <h1 style={{ margin: '8px 0 6px', fontSize: 'clamp(28px, 4vw, 42px)' }}>
            Lengkapi Pengiriman &amp; Pembayaran
          </h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Pilih wilayah tujuan dan metode kurir pengiriman. Ongkos kirim dihitung otomatis.
          </p>
        </div>

        {/* Auth Banner if not logged in */}
        {authChecked && !user && (
          <div className="login-required-card">
            <div>
              <strong>Anda belum login</strong>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--muted)' }}>
                Silakan login untuk memproses pesanan dan mencatat riwayat transaksi Anda.
              </p>
            </div>
            <Link href="/login" className="button button-primary">
              Login Sekarang
            </Link>
          </div>
        )}

        {errorMessage && <div className="form-message">{errorMessage}</div>}

        {cartLoading ? (
          <div className="empty-state">
            <p>Memuat rincian belanjaan...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
            <h2>Tidak ada produk untuk di-checkout</h2>
            <p style={{ maxWidth: '420px', margin: '8px auto 24px', color: 'var(--muted)' }}>
              Keranjang Anda masih kosong. Silakan pilih produk terlebih dahulu.
            </p>
            <Link className="button button-primary" href="/katalog">
              Pilih Produk di Katalog -&gt;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="checkout-page-grid">
            {/* Left Column: Overhauled Delivery Form */}
            <div className="checkout-form-column">
              {/* Recipient Details */}
              <div className="checkout-panel">
                <h3 className="panel-title">1. Informasi Penerima</h3>
                <div className="form-grid-2">
                  <label className="checkout-field">
                    <span>Nama Penerima</span>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nama lengkap penerima"
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Nomor Handphone / WhatsApp</span>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Contoh: 081234567890"
                    />
                  </label>
                </div>
              </div>

              {/* Overhauled Address Dropdowns (Requirement 3) */}
              <div className="checkout-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ margin: 0 }}>
                    2. Alamat &amp; Wilayah Pengantaran
                  </h3>
                  <span className="badge-pill">Dropdown Bertingkat</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '6px 0 16px' }}>
                  Pilih provinsi, kabupaten/kota, kecamatan, dan kelurahan melalui pilihan dropdown di bawah.
                </p>

                {/* Dropdown Grid */}
                <div className="form-grid-2">
                  {/* Provinsi Dropdown */}
                  <label className="checkout-field">
                    <span>Provinsi *</span>
                    <select
                      required
                      value={selectedProvince?.id || ''}
                      onChange={handleProvinceChange}
                    >
                      <option value="">-- Pilih Provinsi --</option>
                      {provinces.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Kabupaten / Kota Dropdown */}
                  <label className="checkout-field">
                    <span>
                      Kabupaten / Kota *{' '}
                      {loadingWilayah.regencies && <small>(Memuat...)</small>}
                    </span>
                    <select
                      required
                      disabled={!selectedProvince || loadingWilayah.regencies}
                      value={selectedRegency?.id || ''}
                      onChange={handleRegencyChange}
                    >
                      <option value="">
                        {!selectedProvince
                          ? '-- Pilih Provinsi dahulu --'
                          : loadingWilayah.regencies
                          ? 'Memuat kabupaten/kota...'
                          : '-- Pilih Kabupaten / Kota --'}
                      </option>
                      {regencies.map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-grid-2" style={{ marginTop: '14px' }}>
                  {/* Kecamatan Dropdown */}
                  <label className="checkout-field">
                    <span>
                      Kecamatan *{' '}
                      {loadingWilayah.districts && <small>(Memuat...)</small>}
                    </span>
                    <select
                      required
                      disabled={!selectedRegency || loadingWilayah.districts}
                      value={selectedDistrict?.id || ''}
                      onChange={handleDistrictChange}
                    >
                      <option value="">
                        {!selectedRegency
                          ? '-- Pilih Kabupaten dahulu --'
                          : loadingWilayah.districts
                          ? 'Memuat kecamatan...'
                          : '-- Pilih Kecamatan --'}
                      </option>
                      {districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>
                          {dist.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Kelurahan / Desa Dropdown */}
                  <label className="checkout-field">
                    <span>
                      Kelurahan / Desa{' '}
                      {loadingWilayah.villages && <small>(Memuat...)</small>}
                    </span>
                    <select
                      disabled={!selectedDistrict || loadingWilayah.villages}
                      value={selectedVillage?.id || ''}
                      onChange={handleVillageChange}
                    >
                      <option value="">
                        {!selectedDistrict
                          ? '-- Pilih Kecamatan dahulu --'
                          : loadingWilayah.villages
                          ? 'Memuat kelurahan...'
                          : '-- Pilih Kelurahan / Desa --'}
                      </option>
                      {villages.map((vil) => (
                        <option key={vil.id} value={vil.id}>
                          {vil.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Kode Pos */}
                <div style={{ marginTop: '14px' }}>
                  <label className="checkout-field">
                    <span>Kode Pos (Opsional)</span>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Contoh: 55281"
                      maxLength={10}
                    />
                  </label>
                </div>

                {/* Alamat Lengkap */}
                <div style={{ marginTop: '14px' }}>
                  <label className="checkout-field">
                    <span>Alamat Lengkap (Jalan, RT/RW, No. Rumah) *</span>
                    <textarea
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Contoh: Jl. Kaliurang KM 5 No. 12, RT 02/RW 05, Depan Apotek Kimia Farma"
                      rows={3}
                    />
                  </label>
                </div>

                {/* Catatan untuk kurir */}
                <div style={{ marginTop: '14px' }}>
                  <label className="checkout-field">
                    <span>Catatan Pengiriman (Opsional)</span>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Contoh: Titipkan ke satpam jika penerima tidak di tempat"
                    />
                  </label>
                </div>
              </div>

              {/* Shipping Method & Ongkir Calculation */}
              <div className="checkout-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="panel-title" style={{ margin: 0 }}>
                    3. Layanan Kurir &amp; Ongkos Kirim
                  </h3>
                  {calculatingOngkir && <span className="badge-pill">Menghitung tarif...</span>}
                </div>

                {!selectedProvince ? (
                  <div className="shipping-placeholder">
                    Pilih <strong>Provinsi</strong> pada form alamat di atas untuk melihat pilihan kurir dan perhitungan ongkos kirim.
                  </div>
                ) : (
                  <div className="shipping-services-list">
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '8px 0 14px' }}>
                      Tarif dihitung untuk tujuan <strong>{selectedProvince.name}</strong> dengan estimasi berat <strong>±{totalWeightKg} kg</strong>:
                    </p>

                    <div className="service-options-grid">
                      {shippingServices.map((service) => {
                        const isSelected = selectedService?.id === service.id;
                        return (
                          <div
                            key={service.id}
                            className={`service-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleServiceSelect(service)}
                          >
                            <div className="service-card-radio">
                              <input
                                type="radio"
                                name="shipping_service"
                                checked={isSelected}
                                onChange={() => handleServiceSelect(service)}
                              />
                            </div>
                            <div className="service-card-info">
                              <strong>{service.name}</strong>
                              <span className="service-etd">Estimasi: {service.etd}</span>
                            </div>
                            <div className="service-card-price">
                              Rp {Number(service.cost).toLocaleString('id-ID')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Confirmation */}
            <div className="checkout-summary-column">
              <div className="checkout-summary-card">
                <h3>Ringkasan Pesanan</h3>

                {/* Ordered Items Preview */}
                <div className="summary-items-list">
                  {cartItems.map((item) => {
                    const product = productsData[item.id];
                    const price = product ? Number(product.harga_produk) : 0;
                    return (
                      <div key={item.id} className="summary-item-row">
                        <img
                          src={product ? `/images/${product.foto_produk}` : '/images/placeholder.png'}
                          alt={product?.nama_produk || 'Produk'}
                          className="summary-item-thumb"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="summary-item-meta">
                          <span className="summary-item-title">
                            {product ? product.nama_produk : `Produk #${item.id}`}
                          </span>
                          <span className="summary-item-qty">
                            {item.quantity} x Rp {price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span className="summary-item-subtotal">
                          Rp {(price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="summary-divider" />

                <div className="summary-row">
                  <span>Subtotal Produk</span>
                  <strong>Rp {subtotalPrice.toLocaleString('id-ID')}</strong>
                </div>

                <div className="summary-row">
                  <span>Estimasi Berat</span>
                  <span>± {totalWeightKg} kg</span>
                </div>

                <div className="summary-row">
                  <span>Ongkos Kirim</span>
                  <strong>
                    {selectedService
                      ? `Rp ${shippingCost.toLocaleString('id-ID')}`
                      : 'Pilih alamat'}
                  </strong>
                </div>

                {selectedService && (
                  <div className="summary-courier-tag">
                    Layanan: {selectedService.name} ({selectedService.etd})
                  </div>
                )}

                <div className="summary-divider" />

                <div className="summary-total-row">
                  <span>Total Pembayaran</span>
                  <strong className="total-highlight">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </strong>
                </div>

                <button
                  type="submit"
                  disabled={loadingSubmit || !user}
                  className="button button-primary"
                  style={{ width: '100%', marginTop: '20px', padding: '14px' }}
                >
                  {loadingSubmit
                    ? 'Memproses Pesanan...'
                    : !user
                    ? 'Login untuk Buat Pesanan'
                    : `Buat Pesanan (Rp ${grandTotal.toLocaleString('id-ID')}) ->`}
                </button>

                {!user && (
                  <p style={{ fontSize: '12px', color: 'var(--brand)', textAlign: 'center', margin: '10px 0 0' }}>
                    * Anda harus login terlebih dahulu agar pesanan dapat diproses.
                  </p>
                )}

                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Link href="/keranjang" className="back-link" style={{ fontSize: '13px' }}>
                    &lt;- Edit barang di keranjang
                  </Link>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
