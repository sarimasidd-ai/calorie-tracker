import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { getWeighableIngredients, macrosForGrams, roundMacros } from '../lib/items';

export default function IngredientPicker({ onAdd, onCancel }) {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);
  const [grams, setGrams] = useState('100');

  const ingredients = useMemo(() => getWeighableIngredients(state.customFoods), [state.customFoods]);

  const filtered = useMemo(() => {
    if (!query.trim()) return ingredients;
    const q = query.trim().toLowerCase();
    return ingredients.filter((f) => f.name.toLowerCase().includes(q));
  }, [ingredients, query]);

  if (picked) {
    const macros = roundMacros(macrosForGrams(picked, Number(grams) || 0));
    return (
      <div className="space-y-4">
        <div className="font-semibold text-slate-100">{picked.name}</div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Amount (grams / ml)</label>
          <input
            type="number"
            inputMode="decimal"
            autoFocus
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-slate-800/60 p-3 text-center text-sm">
          <div>
            <div className="font-semibold text-slate-100">{macros.cal}</div>
            <div className="text-[10px] text-slate-500">cal</div>
          </div>
          <div>
            <div className="font-semibold text-slate-100">{macros.protein}g</div>
            <div className="text-[10px] text-slate-500">protein</div>
          </div>
          <div>
            <div className="font-semibold text-slate-100">{macros.carbs}g</div>
            <div className="text-[10px] text-slate-500">carbs</div>
          </div>
          <div>
            <div className="font-semibold text-slate-100">{macros.fat}g</div>
            <div className="text-[10px] text-slate-500">fat</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPicked(null)} className="flex-1 rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-300">
            Back
          </button>
          <button
            type="button"
            disabled={!(Number(grams) > 0)}
            onClick={() => onAdd({ foodId: picked.id, grams: Number(grams) })}
            className="flex-1 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40"
          >
            Add ingredient
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ingredients..."
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500"
      />
      <div className="max-h-80 space-y-1.5 overflow-y-auto">
        {filtered.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setPicked(f)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-800 px-3 py-2.5 text-left"
          >
            <div>
              <div className="text-sm font-medium text-slate-100">{f.name}</div>
              <div className="text-xs text-slate-500">
                per 100g: {Math.round((f.cal / f.servingGrams) * 100)} cal
              </div>
            </div>
            {f.kind === 'custom' && <span className="text-[10px] text-sky-400">custom</span>}
          </button>
        ))}
        {filtered.length === 0 && <div className="py-6 text-center text-sm text-slate-600">No ingredients found</div>}
      </div>
      <button type="button" onClick={onCancel} className="w-full rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-300">
        Cancel
      </button>
    </div>
  );
}
