import { NextResponse } from 'next/server';
import { recordPayment, getOrderById } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const orderId = Number(body.orderId);
    const nama = String(body.nama || '').trim();
    const bank = String(body.bank || '').trim();
    const jumlah = Number(body.jumlah || 0);
    const bukti = String(body.bukti || 'bukti_transfer.jpg');

    if (!orderId || !nama || !bank) {
      return NextResponse.json(
        { ok: false, message: 'Harap lengkapi nama penyetor dan metode pembayaran.' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { ok: false, message: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const paymentAmount = jumlah > 0 ? jumlah : Number(order.total_pembelian || 0);

    const payment = await recordPayment({
      orderId,
      nama,
      bank,
      jumlah: paymentAmount,
      bukti,
    });

    return NextResponse.json({
      ok: true,
      message: 'Pembayaran berhasil dikonfirmasi! Pesanan Anda segera diproses.',
      payment,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { ok: false, message: 'Gagal memproses pembayaran: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ ok: false, message: 'ID pesanan diperlukan' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      order,
      pembayaran: order.pembayaran || null,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: 'Error mengambil data pembayaran: ' + error.message },
      { status: 500 }
    );
  }
}

