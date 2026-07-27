import { FOODS } from '../data/foods';

const MACRO_KEYS = ['cal', 'protein', 'carbs', 'fat'];

export function emptyMacros() {
  return { cal: 0, protein: 0, carbs: 0, fat: 0 };
}

export function scaleMacros(base, factor) {
  const out = {};
  for (const k of MACRO_KEYS) out[k] = (base[k] || 0) * factor;
  return out;
}

export function addMacros(a, b) {
  const out = {};
  for (const k of MACRO_KEYS) out[k] = (a[k] || 0) + (b[k] || 0);
  return out;
}

export function roundMacros(m) {
  const out = {};
  for (const k of MACRO_KEYS) out[k] = Math.round(m[k] || 0);
  return out;
}

// Build a lookup of everything that can be used as an INGREDIENT in a recipe:
// base foods + custom foods, restricted to ones with a known servingGrams so
// we can scale by weight.
export function getIngredientLookup(customFoods) {
  const all = [...FOODS, ...customFoods.map((f) => ({ ...f, type: 'custom' }))];
  const map = new Map();
  for (const f of all) map.set(f.id, f);
  return map;
}

export function getWeighableIngredients(customFoods) {
  return [...FOODS, ...customFoods.map((f) => ({ ...f, type: 'custom' }))].filter(
    (f) => f.servingGrams && f.servingGrams > 0
  );
}

// Macros for `grams` of a given ingredient food item (per-100g style or any servingGrams).
export function macrosForGrams(food, grams) {
  if (!food.servingGrams) return emptyMacros();
  const perGram = scaleMacros(food, 1 / food.servingGrams);
  return scaleMacros(perGram, grams);
}

export function computeRecipeBatchTotals(recipe, ingredientLookup) {
  let total = emptyMacros();
  let totalGrams = 0;
  for (const ing of recipe.ingredients) {
    const food = ingredientLookup.get(ing.foodId);
    if (!food) continue;
    total = addMacros(total, macrosForGrams(food, ing.grams));
    totalGrams += ing.grams;
  }
  return { total, totalGrams };
}

export function computeRecipePerServing(recipe, ingredientLookup) {
  const { total, totalGrams } = computeRecipeBatchTotals(recipe, ingredientLookup);
  const servings = recipe.servings > 0 ? recipe.servings : 1;
  return { perServing: scaleMacros(total, 1 / servings), total, totalGrams };
}

export function recipeToItem(recipe, ingredientLookup) {
  const { perServing, totalGrams } = computeRecipePerServing(recipe, ingredientLookup);
  const cookedWeight = recipe.totalCookedWeightGrams || null;
  return {
    id: recipe.id,
    type: 'recipe',
    name: recipe.name,
    category: 'My Recipes',
    servingLabel: '1 serving',
    servingGrams: cookedWeight ? cookedWeight / recipe.servings : null,
    ...roundMacros(perServing),
    servings: recipe.servings,
    totalCookedWeightGrams: cookedWeight,
    rawTotalGrams: totalGrams,
  };
}

export function customFoodToItem(cf) {
  return { ...cf, type: 'custom' };
}

export function baseFoodToItem(f) {
  return { ...f, type: 'food' };
}

export function barcodeProductToItem(barcode, p) {
  return { ...p, id: barcode, barcode, type: 'barcode' };
}

export function getAllItems(state) {
  return [
    ...FOODS.map(baseFoodToItem),
    ...state.customFoods.map(customFoodToItem),
    ...state.recipes.map((r) => recipeToItem(r, getIngredientLookup(state.customFoods))),
    ...Object.entries(state.barcodeProducts).map(([code, p]) => barcodeProductToItem(code, p)),
  ];
}

export function itemKey(item) {
  return `${item.type}:${item.id}`;
}

export function findItemByKey(state, key) {
  const [type, ...rest] = key.split(':');
  const id = rest.join(':');
  const all = getAllItems(state);
  return all.find((it) => it.type === type && String(it.id) === id);
}
