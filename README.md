# Bulk Tracker

A mobile-first calorie/macro tracker built for a lean bulk, with a desi-food-first
database, a batch-recipe builder, and barcode scanning. React + Vite + Tailwind,
all data stored in `localStorage` — no backend, no login, no accounts.

## Running it

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. For phone testing on your local network, run
`npm run dev -- --host` and open the printed LAN URL from your phone (same Wi-Fi).

## Camera / barcode scanning requires HTTPS

Browsers only grant camera access (`getUserMedia`) on secure contexts. That means:

- **`localhost` works during development** — Chrome/Safari treat it as secure even
  over plain HTTP, so `npm run dev` is fine for testing on the same machine.
- **Any other host (including your phone over LAN) needs HTTPS.** Once you deploy
  (Vercel, Netlify, GitHub Pages, etc. all give you HTTPS for free), scanning will
  work on your phone. Testing over `http://<lan-ip>:5173` from a phone will NOT be
  able to open the camera — use the manual barcode entry field in that case, or
  deploy behind HTTPS first.
- If camera permission is denied or no camera is available, the scanner screen
  falls back to a manual barcode-number entry field automatically.

## Screens

- **Today** — calorie ring, protein/carb/fat bars, meals grouped by
  Breakfast/Lunch/Dinner/Snacks/Shakes, a streak counter, quick-add tiles for your
  most-logged foods, and a 7-day bar chart vs. your target.
- **Add food** — search the food database (desi dishes, raw ingredients, your
  custom foods, your saved recipes, and scanned barcode products all in one list),
  or scan a barcode.
- **My Recipes** — build batch recipes from raw ingredients (enter raw/uncooked
  weights), see live per-batch and per-serving macros, and log a recipe by
  servings or by the actual grams you ate. Editing a recipe never changes the
  macros of things you already logged — each log entry snapshots its own macros.
- **Weight** — log weight, see a 7-day rolling average against your goal line,
  and your lbs/week rate over the last 3 weeks with a flag if you're bulking too
  fast (>1 lb/wk) or too slow (<0.25 lb/wk).
- **Settings** — edit your targets, export/import all your data as JSON.

## Data

Everything lives in a single `localStorage` key. Use Settings → Export to back it
up as a JSON file, and Import to restore it (e.g. after switching browsers or
devices). There's no server — nothing leaves your device except the Open Food
Facts lookup when you scan a barcode you haven't seen before (scanned products
are then cached locally so repeat scans work offline).
