import { NextResponse } from 'next/server';
import { getProvinces } from '../../../lib/db';

// Fallback base rates per province region in Indonesia (in Rupiah per kg)
const REGION_RATES = {
  'DI YOGYAKARTA': 10000,
  'JAWA TENGAH': 12000,
  'JAWA TIMUR': 16000,
  'JAWA BARAT': 18000,
  'DKI JAKARTA': 18000,
  'BANTEN': 18000,
  'BALI': 25000,
  'LAMPUNG': 28000,
  'SUMATERA SELATAN': 30000,
  'BENGKULU': 32000,
  'JAMBI': 32000,
  'SUMATERA BARAT': 35000,
  'RIAU': 35000,
  'KEPULAUAN RIAU': 38000,
  'SUMATERA UTARA': 40000,
  'ACEH': 42000,
  'BANGKA BELITUNG': 35000,
  'NUSA TENGGARA BARAT': 35000,
  'NUSA TENGGARA TIMUR': 38000,
  'KALIMANTAN BARAT': 38000,
  'KALIMANTAN TENGAH': 40000,
  'KALIMANTAN SELATAN': 40000,
  'KALIMANTAN TIMUR': 42000,
  'KALIMANTAN UTARA': 45000,
  'SULAWESI SELATAN': 42000,
  'SULAWESI BARAT': 44000,
  'SULAWESI TENGAH': 45000,
  'SULAWESI TENGGARA': 45000,
  'GORONTALO': 46000,
  'SULAWESI UTARA': 48000,
  'MALUKU': 65000,
  'MALUKU UTARA': 70000,
  'PAPUA': 80000,
  'PAPUA BARAT': 80000,
  'PAPUA SELATAN': 85000,
  'PAPUA TENGAH': 85000,
  'PAPUA PEGUNUNGAN': 90000,
  'PAPUA BARAT DAYA': 85000,
};

export async function GET(request) {
  try {
    const dbProvinces = await getProvinces();
    const { searchParams } = new URL(request.url);
    const provQuery = (searchParams.get('prov') || '').toUpperCase().trim();
    const weightGrams = Number(searchParams.get('weight') || 1000);
    const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));

    let baseRate = 20000;

    // Check DB first if matched
    if (provQuery && dbProvinces.length > 0) {
      const match = dbProvinces.find(
        (p) =>
          String(p.id_prov) === provQuery ||
          p.nama?.toUpperCase().includes(provQuery) ||
          provQuery.includes(p.nama?.toUpperCase())
      );
      if (match && Number(match.ongkir) > 0) {
        baseRate = Number(match.ongkir);
      }
    }

    if (baseRate === 20000 && provQuery) {
      for (const [region, rate] of Object.entries(REGION_RATES)) {
        if (provQuery.includes(region) || region.includes(provQuery)) {
          baseRate = rate;
          break;
        }
      }
    }

    // Shipping services
    const services = [
      {
        id: 'reg',
        name: 'Reguler (JNE / SiCepat)',
        etd: '2 - 3 Hari',
        cost: baseRate * weightKg,
      },
      {
        id: 'exp',
        name: 'Express / Next Day (J&T Express)',
        etd: '1 - 2 Hari',
        cost: Math.round(baseRate * 1.4 * weightKg),
      },
      {
        id: 'eco',
        name: 'Hemat / Kargo',
        etd: '3 - 6 Hari',
        cost: Math.max(12000, Math.round(baseRate * 0.75 * weightKg)),
      },
    ];

    return NextResponse.json({
      dbProvinces,
      weightKg,
      baseRate,
      services,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

