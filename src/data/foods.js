// Seed food database.
// cal/protein/carbs/fat are PER SERVING as described by servingLabel.
// servingGrams is the weight of one serving in grams (or ml for liquids),
// used for proportional scaling in the recipe builder / "log by weight".
// kind: 'prepared' = ready-to-eat dish, 'raw' = uncooked ingredient for recipes.
// estimate: true flags homemade dishes where values are household estimates.

let _id = 0;
const nextId = (name) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${_id++}`;

function food({ name, category, servingLabel, servingGrams, cal, protein, carbs, fat, kind = 'prepared', estimate = false }) {
  return {
    id: nextId(name),
    name,
    category,
    servingLabel,
    servingGrams,
    cal,
    protein,
    carbs,
    fat,
    kind,
    estimate,
  };
}

export const FOODS = [
  // CURRIES & SALAN (1 cup ~= 250g)
  food({ name: 'Chicken karahi', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 400, protein: 35, carbs: 8, fat: 25, estimate: true }),
  food({ name: 'Chicken korma', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 450, protein: 30, carbs: 10, fat: 32, estimate: true }),
  food({ name: 'Chicken qeema', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 400, protein: 28, carbs: 9, fat: 28, estimate: true }),
  food({ name: 'Beef nihari', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 450, protein: 35, carbs: 10, fat: 30, estimate: true }),
  food({ name: 'Aloo gosht', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 350, protein: 25, carbs: 18, fat: 20, estimate: true }),
  food({ name: 'Chicken curry (ghar ka)', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 320, protein: 30, carbs: 8, fat: 18, estimate: true }),
  food({ name: 'Palak paneer', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 300, protein: 14, carbs: 12, fat: 22, estimate: true }),
  food({ name: 'Chana masala', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 270, protein: 12, carbs: 35, fat: 9, estimate: true }),
  food({ name: 'Daal (chana/masoor)', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 230, protein: 12, carbs: 30, fat: 8, estimate: true }),
  food({ name: 'Daal maash', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 250, protein: 14, carbs: 30, fat: 9, estimate: true }),
  food({ name: 'Haleem', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 330, protein: 20, carbs: 32, fat: 14, estimate: true }),
  food({ name: 'Bhindi / mixed sabzi', category: 'Curries & Salan', servingLabel: '1 cup (250g)', servingGrams: 250, cal: 180, protein: 4, carbs: 18, fat: 11, estimate: true }),

  // RICE & BREAD
  food({ name: 'Chicken biryani', category: 'Rice & Bread', servingLabel: '1 cup', servingGrams: 250, cal: 350, protein: 18, carbs: 42, fat: 12, estimate: true }),
  food({ name: 'Beef biryani', category: 'Rice & Bread', servingLabel: '1 cup', servingGrams: 250, cal: 380, protein: 20, carbs: 42, fat: 14, estimate: true }),
  food({ name: 'Pulao', category: 'Rice & Bread', servingLabel: '1 cup', servingGrams: 250, cal: 300, protein: 8, carbs: 45, fat: 10, estimate: true }),
  food({ name: 'Plain rice', category: 'Rice & Bread', servingLabel: '1 cup', servingGrams: 200, cal: 205, protein: 4, carbs: 45, fat: 0 }),
  food({ name: 'Roti / chapati', category: 'Rice & Bread', servingLabel: '1 piece', servingGrams: 50, cal: 120, protein: 3, carbs: 20, fat: 3 }),
  food({ name: 'Paratha', category: 'Rice & Bread', servingLabel: '1 piece', servingGrams: 70, cal: 260, protein: 5, carbs: 30, fat: 13 }),
  food({ name: 'Naan', category: 'Rice & Bread', servingLabel: '1 piece', servingGrams: 90, cal: 260, protein: 8, carbs: 45, fat: 5 }),

  // GRILLED & FRIED
  food({ name: 'Chicken tikka', category: 'Grilled & Fried', servingLabel: '1 piece', servingGrams: 100, cal: 200, protein: 25, carbs: 2, fat: 10 }),
  food({ name: 'Seekh kabab', category: 'Grilled & Fried', servingLabel: '1 piece', servingGrams: 60, cal: 120, protein: 9, carbs: 2, fat: 8 }),
  food({ name: 'Shami kabab', category: 'Grilled & Fried', servingLabel: '1 piece', servingGrams: 50, cal: 110, protein: 7, carbs: 5, fat: 7 }),
  food({ name: 'Samosa', category: 'Grilled & Fried', servingLabel: '1 piece', servingGrams: 60, cal: 260, protein: 5, carbs: 28, fat: 14 }),
  food({ name: 'Pakora', category: 'Grilled & Fried', servingLabel: '100g', servingGrams: 100, cal: 300, protein: 7, carbs: 30, fat: 17 }),

  // SIDES & DRINKS
  food({ name: 'Raita', category: 'Sides & Drinks', servingLabel: '1/2 cup', servingGrams: 125, cal: 60, protein: 3, carbs: 5, fat: 3 }),
  food({ name: 'Chai w/ whole milk', category: 'Sides & Drinks', servingLabel: '1 cup', servingGrams: 200, cal: 120, protein: 4, carbs: 14, fat: 5 }),
  food({ name: 'Sweet lassi', category: 'Sides & Drinks', servingLabel: '1 glass', servingGrams: 300, cal: 250, protein: 8, carbs: 35, fat: 8 }),
  food({ name: 'Mango lassi', category: 'Sides & Drinks', servingLabel: '1 glass', servingGrams: 300, cal: 300, protein: 8, carbs: 50, fat: 8 }),
  food({ name: 'Kheer', category: 'Sides & Drinks', servingLabel: '1/2 cup', servingGrams: 125, cal: 250, protein: 6, carbs: 38, fat: 9 }),
  food({ name: 'Gulab jamun', category: 'Sides & Drinks', servingLabel: '1 piece', servingGrams: 40, cal: 150, protein: 2, carbs: 22, fat: 6 }),

  // BULK STAPLES
  food({ name: 'Whole milk', category: 'Bulk Staples', servingLabel: '1 cup', servingGrams: 240, cal: 150, protein: 8, carbs: 12, fat: 8 }),
  food({ name: 'Whey scoop', category: 'Bulk Staples', servingLabel: '1 scoop', servingGrams: 32, cal: 120, protein: 25, carbs: 3, fat: 1 }),
  food({ name: 'Egg, large', category: 'Bulk Staples', servingLabel: '1 egg', servingGrams: 50, cal: 72, protein: 6, carbs: 0, fat: 5 }),
  food({ name: 'Peanut butter', category: 'Bulk Staples', servingLabel: '1 tbsp', servingGrams: 16, cal: 95, protein: 4, carbs: 3, fat: 8 }),
  food({ name: 'Banana', category: 'Bulk Staples', servingLabel: '1 banana', servingGrams: 118, cal: 105, protein: 1, carbs: 27, fat: 0 }),
  food({ name: 'Dry oats', category: 'Bulk Staples', servingLabel: '1/2 cup', servingGrams: 40, cal: 150, protein: 5, carbs: 27, fat: 3 }),
  food({ name: 'Greek yogurt', category: 'Bulk Staples', servingLabel: '1/2 cup', servingGrams: 120, cal: 100, protein: 10, carbs: 4, fat: 5 }),
  food({ name: 'Chicken breast (100g)', category: 'Bulk Staples', servingLabel: '100g', servingGrams: 100, cal: 165, protein: 31, carbs: 0, fat: 4 }),
  food({ name: 'THE MASS SHAKE', category: 'Bulk Staples', servingLabel: '1 shake', servingGrams: null, cal: 930, protein: 55, carbs: 95, fat: 40 }),

  // RAW INGREDIENTS (per 100g) — for the recipe builder, but loggable directly too
  food({ name: 'Ground beef 80/20 (raw)', category: 'Raw: Meat', servingLabel: '100g', servingGrams: 100, cal: 254, protein: 17, carbs: 0, fat: 20, kind: 'raw' }),
  food({ name: 'Ground beef 90/10 (raw)', category: 'Raw: Meat', servingLabel: '100g', servingGrams: 100, cal: 176, protein: 20, carbs: 0, fat: 10, kind: 'raw' }),
  food({ name: 'Chicken breast (raw)', category: 'Raw: Meat', servingLabel: '100g', servingGrams: 100, cal: 165, protein: 31, carbs: 0, fat: 4, kind: 'raw' }),
  food({ name: 'Chicken thigh (raw)', category: 'Raw: Meat', servingLabel: '100g', servingGrams: 100, cal: 209, protein: 26, carbs: 0, fat: 11, kind: 'raw' }),
  food({ name: 'Bone-in chicken (raw)', category: 'Raw: Meat', servingLabel: '100g', servingGrams: 100, cal: 190, protein: 24, carbs: 0, fat: 10, kind: 'raw' }),
  food({ name: 'Beef stew meat (raw)', category: 'Raw: Meat', servingLabel: '100g', servingGrams: 100, cal: 200, protein: 22, carbs: 0, fat: 12, kind: 'raw' }),
  food({ name: 'Lamb/mutton (raw)', category: 'Raw: Meat', servingLabel: '100g', servingGrams: 100, cal: 250, protein: 25, carbs: 0, fat: 17, kind: 'raw' }),

  food({ name: 'Potato (raw)', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 77, protein: 2, carbs: 17, fat: 0, kind: 'raw' }),
  food({ name: 'Onion (raw)', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 40, protein: 1, carbs: 9, fat: 0, kind: 'raw' }),
  food({ name: 'Tomato (raw)', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 18, protein: 1, carbs: 4, fat: 0, kind: 'raw' }),
  food({ name: 'Spinach (raw)', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 23, protein: 3, carbs: 4, fat: 0, kind: 'raw' }),
  food({ name: 'Okra (raw)', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 33, protein: 2, carbs: 7, fat: 0, kind: 'raw' }),
  food({ name: 'Cauliflower (raw)', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 25, protein: 2, carbs: 5, fat: 0, kind: 'raw' }),
  food({ name: 'Peas (raw)', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 81, protein: 5, carbs: 14, fat: 0, kind: 'raw' }),
  food({ name: 'Ginger/garlic paste', category: 'Raw: Veg & Aromatics', servingLabel: '100g', servingGrams: 100, cal: 100, protein: 4, carbs: 20, fat: 1, kind: 'raw' }),

  food({ name: 'Cooking oil', category: 'Raw: Fats & Dairy', servingLabel: '100g', servingGrams: 100, cal: 884, protein: 0, carbs: 0, fat: 100, kind: 'raw' }),
  food({ name: 'Ghee', category: 'Raw: Fats & Dairy', servingLabel: '100g', servingGrams: 100, cal: 900, protein: 0, carbs: 0, fat: 100, kind: 'raw' }),
  food({ name: 'Butter', category: 'Raw: Fats & Dairy', servingLabel: '100g', servingGrams: 100, cal: 717, protein: 1, carbs: 0, fat: 81, kind: 'raw' }),
  food({ name: 'Yogurt (whole)', category: 'Raw: Fats & Dairy', servingLabel: '100g', servingGrams: 100, cal: 61, protein: 3, carbs: 5, fat: 3, kind: 'raw' }),
  food({ name: 'Heavy cream', category: 'Raw: Fats & Dairy', servingLabel: '100g', servingGrams: 100, cal: 340, protein: 2, carbs: 3, fat: 36, kind: 'raw' }),

  food({ name: 'Basmati rice, dry', category: 'Raw: Staples', servingLabel: '100g', servingGrams: 100, cal: 360, protein: 7, carbs: 78, fat: 1, kind: 'raw' }),
  food({ name: 'Lentils, dry', category: 'Raw: Staples', servingLabel: '100g', servingGrams: 100, cal: 350, protein: 24, carbs: 60, fat: 1, kind: 'raw' }),
  food({ name: 'Chickpeas, dry', category: 'Raw: Staples', servingLabel: '100g', servingGrams: 100, cal: 364, protein: 19, carbs: 61, fat: 6, kind: 'raw' }),
  food({ name: 'Flour/atta', category: 'Raw: Staples', servingLabel: '100g', servingGrams: 100, cal: 340, protein: 12, carbs: 72, fat: 2, kind: 'raw' }),
];

export const FOOD_CATEGORIES = [...new Set(FOODS.map((f) => f.category))];

export const MEAL_SECTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Shakes'];
