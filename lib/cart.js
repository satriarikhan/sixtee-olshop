'use client';

const CART_KEY = 'sixtee_cart';

export function getCartItems() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Standardize to [{ id: number, quantity: number }]
    const standardized = [];
    for (const item of parsed) {
      if (typeof item === 'object' && item !== null) {
        const id = Number(item.id || item.id_produk);
        const quantity = Math.max(1, Number(item.quantity || item.qty || 1));
        if (id) {
          const existing = standardized.find((x) => x.id === id);
          if (existing) {
            existing.quantity += quantity;
          } else {
            standardized.push({ id, quantity });
          }
        }
      } else {
        const id = Number(item);
        if (id) {
          const existing = standardized.find((x) => x.id === id);
          if (existing) {
            existing.quantity += 1;
          } else {
            standardized.push({ id, quantity: 1 });
          }
        }
      }
    }
    return standardized;
  } catch {
    return [];
  }
}

export function saveCartItems(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('sixtee_cart_updated'));
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

export function addToCart(id, qty = 1) {
  const numId = Number(id);
  const quantity = Math.max(1, Number(qty));
  if (!numId) return [];

  const current = getCartItems();
  const existingIndex = current.findIndex((item) => item.id === numId);

  if (existingIndex >= 0) {
    current[existingIndex].quantity += quantity;
  } else {
    current.push({ id: numId, quantity });
  }

  saveCartItems(current);
  return current;
}

export function updateCartQuantity(id, newQty) {
  const numId = Number(id);
  const quantity = Number(newQty);
  let current = getCartItems();

  if (quantity <= 0) {
    current = current.filter((item) => item.id !== numId);
  } else {
    const target = current.find((item) => item.id === numId);
    if (target) {
      target.quantity = quantity;
    }
  }

  saveCartItems(current);
  return current;
}

export function removeFromCart(id) {
  const numId = Number(id);
  const current = getCartItems().filter((item) => item.id !== numId);
  saveCartItems(current);
  return current;
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('sixtee_cart_updated'));
}

