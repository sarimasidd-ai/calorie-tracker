import { useState } from 'react';
import { MEAL_SECTIONS } from '../data/foods';
import { scaleMacros, roundMacros } from '../lib/items';

const PRESETS = [0.5, 1, 1.5, 2];

export default function QuantityPicker({ item, section, onSectionChange, onConfirm, onCancel }) {
  const canWeigh = !!item.servingGrams;
  const [mode, setMode] = useState('quantity');
  const [quantity, setQuantity] = useState(1);
  const [customQty, setCustomQty] = useState('');
  const [useCustomQty, setUseCustomQty] = useState(false);
  const [grams, setGrams] = useState(item.servingGrams ? String(item.servingGrams) : '');

  const effectiveQuantity = mode === 'quantity' ? (useCustomQty ? Number(customQty) || 0 : quantity) : (Number(grams) || 0) / (item.servingGrams || 1);

  const macros = roundMacros(scaleMacros(item, effectiveQuantity));

  const canConfirm = mode === 'quantity' ? effectiveQuantity > 0 : Number(grams) > 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="font-semibold text-slate-100">{item.name}</div>
        {item.brand && <div className="text-xs text-slate-500">{item.brand}</div>}
        <div className="text-xs text-slate-500">{item.servingLabel}</div>
      </div>

      <div>
        <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">Meal</div>
        <div className="flex flex-wrap gap-1.5">
          {MEAL_SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSectionChange(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                section === s ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {canWeigh && (
        <div className="flex gap-2 rounded-lg bg-slate-800 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('quantity')}
            className={`flex-1 rounded-md py-1.5 font-medium ${mode === 'quantity' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          >
            Servings
          </button>
          <button
            type="button"
            onClick={() => setMode('weight')}
            className={`flex-1 rounded-md py-1.5 font-medium ${mode === 'weight' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          >
            By weight (g)
          </button>
        </div>
      )}

      {mode === 'quantity' ? (
        <div>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setQuantity(p);
                  setUseCustomQty(false);
                }}
                className={`rounded-lg py-2 text-sm font-semibold ${
                  !useCustomQty && quantity === p ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
              >
                {p}x
              </button>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="Custom quantity"
              value={customQty}
              onFocus={() => setUseCustomQty(true)}
              onChange={(e) => {
                setUseCustomQty(true);
                setCustomQty(e.target.value);
              }}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                useCustomQty ? 'border-emerald-500 bg-slate-800' : 'border-slate-700 bg-slate-800'
              } text-slate-100 placeholder-slate-500`}
            />
          </div>
        </div>
      ) : (
        <div>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Grams eaten"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
          />
          <div className="mt-1 text-xs text-slate-500">1 serving = {item.servingGrams}g</div>
        </div>
      )}

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
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-300"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={() =>
            onConfirm(
              mode === 'quantity'
                ? { mode: 'quantity', quantity: effectiveQuantity }
                : { mode: 'weight', grams: Number(grams) }
            )
          }
          className="flex-1 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40"
        >
          Add to log
        </button>
      </div>
    </div>
  );
}
