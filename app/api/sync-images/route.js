import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ensureSeedProducts, getProducts } from '../../../lib/db';

const BRAIN_DIR = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\7f29543b-b9fb-481b-ad0f-997e765d54f4';
const TARGET_DIR = path.join(process.cwd(), 'public', 'images');

const IMAGE_MAPPINGS = [
  { prefix: 'kaos_oversize_black', target: 'kaos_oversize_black.jpg' },
  { prefix: 'hoodie_fleece_grey', target: 'hoodie_fleece_grey.jpg' },
  { prefix: 'kemeja_flannel_navy', target: 'kemeja_flannel_navy.jpg' },
  { prefix: 'chino_pants_khaki', target: 'chino_pants_khaki.jpg' },
  { prefix: 'jaket_denim_vintage', target: 'jaket_denim_vintage.jpg' },
  { prefix: 'crewneck_forest_green', target: 'crewneck_forest_green.jpg' },
  { prefix: 'totebag_canvas_white', target: 'totebag_canvas_white.jpg' },
  { prefix: 'baseball_cap_black', target: 'baseball_cap_black.jpg' },
  { prefix: 'kemeja_linen_olive', target: 'kemeja_linen_olive.jpg' },
  { prefix: 'ransel_laptop_black', target: 'ransel_laptop_black.jpg' },
  { prefix: 'sneakers_classic_white', target: 'sneakers_classic_white.jpg' },
  { prefix: 'dompet_kulit_brown', target: 'dompet_kulit_brown.jpg' },
];

export async function GET() {
  const copied = [];
  const notFound = [];

  try {
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    if (fs.existsSync(BRAIN_DIR)) {
      const brainFiles = fs.readdirSync(BRAIN_DIR);

      for (const map of IMAGE_MAPPINGS) {
        // Find latest file starting with prefix
        const matches = brainFiles.filter((f) => f.startsWith(map.prefix) && f.endsWith('.jpg'));
        if (matches.length > 0) {
          // Sort descending to get latest
          matches.sort().reverse();
          const srcPath = path.join(BRAIN_DIR, matches[0]);
          const destPath = path.join(TARGET_DIR, map.target);
          fs.copyFileSync(srcPath, destPath);
          copied.push({ name: map.target, from: matches[0] });
        } else {
          notFound.push(map.target);
        }
      }
    }

    // Ensure database entries exist
    await ensureSeedProducts();
    const products = await getProducts();

    return NextResponse.json({
      status: 'ok',
      copiedCount: copied.length,
      copied,
      notFound,
      totalProductsInDb: products.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

