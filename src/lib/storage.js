export const STORAGE_KEY = 'bulk-tracker:v1';

export const DEFAULT_STATE = () => ({
  settings: {
    calorieTarget: 2900,
    proteinTarget: 120,
    goalWeight: 125,
    startWeight: 106,
    seenEstimateNote: false,
  },
  logsByDate: {}, // { 'YYYY-MM-DD': [entry, ...] }
  customFoods: [], // user-added foods, same shape as data/foods.js items
  recipes: [], // { id, name, ingredients:[{foodId,grams}], servings, totalCookedWeightGrams, createdAt, updatedAt }
  weights: [], // { id, date: 'YYYY-MM-DD', weight }
  recentIds: [], // 'type:id' most-recent-first
  favoriteIds: [], // 'type:id'
  barcodeProducts: {}, // barcode -> product
});

export function loadState() {
  const fallback = DEFAULT_STATE();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      settings: { ...fallback.settings, ...(parsed.settings || {}) },
    };
  } catch (e) {
    console.error('Failed to load saved data, starting fresh.', e);
    return fallback;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}
