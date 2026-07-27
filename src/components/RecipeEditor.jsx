import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import Sheet from './Sheet';
import IngredientPicker from './IngredientPicker';
import { getIngredientLookup, computeRecipeBatchTotals, roundMacros, scaleMacros } from '../lib/items';

export default function RecipeEditor({ initialRecipe, onSave, onCancel, onDelete }) {
  const { state } = useStore();
  const [name, setName] = useState(initialRecipe?.name || '');
  const [ingredients, setIngredients] = useState(initialRecipe?.ingredients || []);
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [totalCookedWeightGrams, setTotalCookedWeightGrams] = useState(
    initialRecipe?.totalCookedWeightGrams ? String(initialRecipe.totalCookedWeightGrams) : ''
  );
  const [showPicker, setShowPicker] = useState(false);

  const lookup = useMemo(() => getIngredientLookup(state.customFoods), [state.customFoods]);

  const { total: batchTotal, totalGrams } = useMemo(
    () => computeRecipeBatchTotals({ ingredients }, lookup),
    [ingredients, lookup]
  );
  const servingsNum = Number(servings) > 0 ? Number(servings) : 1;
  const perServing = roundMacros(scaleMacros(batchTotal, 1 / servingsNum));
  const roundedBatch = roundMacros(batchTotal);

  const canSave = name.trim() && ingredients.length > 0 && servingsNum > 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Recipe name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Aloo Keema"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500"
        />
      </div>

      <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-2.5 text-xs text-sky-200">
        Enter <strong>raw weights</strong> — how you'd weigh things before cooking. Water cooks off but calories
        don't change.
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-xs font-medium text-slate-400">Ingredients</label>
          <button type="button" onClick={() => setShowPicker(true)} className="text-xs font-medium text-emerald-400">
            + Add ingredient
          </button>
        </div>
        <div className="space-y-1.5">
          {ingredients.map((ing, idx) => {
            const food = lookup.get(ing.foodId);
            return (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-100">{food?.name || 'Unknown ingredient'}</div>
                  <div className="text-xs text-slate-500">{ing.grams}g</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                  className="ml-2 shrink-0 text-red-400"
                >
                  ✕
                </button>
              </div>
            );
          })}
          {ingredients.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-800 py-4 text-center text-xs text-slate-600">
              No ingredients yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Batch makes ___ servings</label>
          <input
            type="number"
            inputMode="numeric"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Total cooked weight (g, optional)</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder={totalGrams ? String(Math.round(totalGrams)) : 'e.g. 1800'}
            value={totalCookedWeightGrams}
            onChange={(e) => setTotalCookedWeightGrams(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-xs font-medium text-slate-400">Whole batch total</div>
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-slate-800/60 p-3 text-center text-sm">
          <div>
            <div className="font-semibold text-slate-100">{roundedBatch.cal}</div>
            <div className="text-[10px] text-slate-500">cal</div>
          </div>
          <div>
            <div className="font-semibold text-slate-100">{roundedBatch.protein}g</div>
            <div className="text-[10px] text-slate-500">protein</div>
          </div>
          <div>
            <div className="font-semibold text-slate-100">{roundedBatch.carbs}g</div>
            <div className="text-[10px] text-slate-500">carbs</div>
          </div>
          <div>
            <div className="font-semibold text-slate-100">{roundedBatch.fat}g</div>
            <div className="text-[10px] text-slate-500">fat</div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-xs font-medium text-emerald-400">Per serving ({servingsNum} servings)</div>
        <div className="grid grid-cols-4 gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm">
          <div>
            <div className="font-bold text-emerald-300">{perServing.cal}</div>
            <div className="text-[10px] text-emerald-500/80">cal</div>
          </div>
          <div>
            <div className="font-bold text-emerald-300">{perServing.protein}g</div>
            <div className="text-[10px] text-emerald-500/80">protein</div>
          </div>
          <div>
            <div className="font-bold text-emerald-300">{perServing.carbs}g</div>
            <div className="text-[10px] text-emerald-500/80">carbs</div>
          </div>
          <div>
            <div className="font-bold text-emerald-300">{perServing.fat}g</div>
            <div className="text-[10px] text-emerald-500/80">fat</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-300">
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() =>
            onSave({
              name: name.trim(),
              ingredients,
              servings: servingsNum,
              totalCookedWeightGrams: totalCookedWeightGrams ? Number(totalCookedWeightGrams) : null,
            })
          }
          className="flex-1 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40"
        >
          Save recipe
        </button>
      </div>

      {onDelete && (
        <button type="button" onClick={onDelete} className="w-full rounded-lg bg-red-500/10 py-2.5 text-sm font-medium text-red-400">
          Delete recipe
        </button>
      )}

      <Sheet open={showPicker} onClose={() => setShowPicker(false)} title="Add ingredient">
        <IngredientPicker
          onCancel={() => setShowPicker(false)}
          onAdd={(ing) => {
            setIngredients([...ingredients, ing]);
            setShowPicker(false);
          }}
        />
      </Sheet>
    </div>
  );
}
