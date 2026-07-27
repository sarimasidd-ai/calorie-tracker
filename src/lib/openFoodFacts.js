const API_BASE = 'https://world.openfoodfacts.org/api/v2/product';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : null;
}

function hasAny(obj) {
  return Object.values(obj).some((v) => v != null);
}

function parseGramsFromLabel(label) {
  if (!label) return null;
  const match = String(label).match(/([\d.]+)\s*(g|ml)\b/i);
  return match ? Number(match[1]) : null;
}

export function parseOffProduct(product, barcode) {
  const n = product.nutriments || {};

  const per100g = {
    cal: num(n['energy-kcal_100g']),
    protein: num(n.proteins_100g),
    carbs: num(n.carbohydrates_100g),
    fat: num(n.fat_100g),
  };

  let perServing = {
    cal: num(n['energy-kcal_serving']),
    protein: num(n.proteins_serving),
    carbs: num(n.carbohydrates_serving),
    fat: num(n.fat_serving),
  };

  const servingGrams = num(product.serving_quantity) || parseGramsFromLabel(product.serving_size);

  // If the label only gives per-100g values, derive a per-serving estimate so the
  // app can still offer a "per serving" basis.
  if (!hasAny(perServing) && servingGrams && hasAny(per100g)) {
    perServing = {
      cal: per100g.cal != null ? num((per100g.cal * servingGrams) / 100) : null,
      protein: per100g.protein != null ? num((per100g.protein * servingGrams) / 100) : null,
      carbs: per100g.carbs != null ? num((per100g.carbs * servingGrams) / 100) : null,
      fat: per100g.fat != null ? num((per100g.fat * servingGrams) / 100) : null,
    };
  }

  return {
    barcode,
    name: product.product_name || product.generic_name || 'Unknown product',
    brand: product.brands || null,
    servingLabel: product.serving_size || (servingGrams ? `${servingGrams}g` : '1 serving'),
    servingGrams: servingGrams || null,
    per100g,
    perServing,
  };
}

// Returns: parsed product object, or null if the barcode isn't in the database.
// Throws on network/offline errors so the caller can fall back to the local cache.
export async function fetchProductByBarcode(barcode) {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(barcode)}.json`);
  if (!res.ok) throw new Error(`Open Food Facts request failed: ${res.status}`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return parseOffProduct(data.product, barcode);
}
