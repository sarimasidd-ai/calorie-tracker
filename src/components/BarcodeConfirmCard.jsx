import { useState } from 'react';

function fieldsFromBasis(product, basis) {
  const src = basis === 'serving' ? product.perServing : product.per100g;
  return {
    servingLabel: basis === 'serving' ? product.servingLabel : '100g',
    servingGrams: basis === 'serving' ? (product.servingGrams ?? '') : 100,
    cal: src.cal ?? '',
    protein: src.protein ?? '',
    carbs: src.carbs ?? '',
    fat: src.fat ?? '',
  };
}

export default function BarcodeConfirmCard({ product, onConfirm, onCancel }) {
  const hasServingBasis = product.servingLabel && (product.perServing.cal != null || product.servingGrams);
  const [basis, setBasis] = useState(hasServingBasis ? 'serving' : '100g');
  const [fields, setFields] = useState(fieldsFromBasis(product, hasServingBasis ? 'serving' : '100g'));

  const switchBasis = (b) => {
    setBasis(b);
    setFields(fieldsFromBasis(product, b));
  };

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const missingSomething = ['cal', 'protein', 'carbs', 'fat'].some((k) => fields[k] === '' || fields[k] == null);
  const canConfirm = fields.cal !== '' && fields.cal != null;

  return (
    <div className="space-y-4">
      <div>
        <div className="font-semibold text-slate-100">{product.name}</div>
        {product.brand && <div className="text-xs text-slate-500">{product.brand}</div>}
        <div className="mt-0.5 text-xs text-slate-600">Barcode: {product.barcode}</div>
      </div>

      {product.per100g && (product.per100g.cal != null || product.perServing.cal != null) && (
        <div className="flex gap-2 rounded-lg bg-slate-800 p-1 text-sm">
          <button
            type="button"
            onClick={() => switchBasis('serving')}
            className={`flex-1 rounded-md py-1.5 font-medium ${basis === 'serving' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          >
            Per serving
          </button>
          <button
            type="button"
            onClick={() => switchBasis('100g')}
            className={`flex-1 rounded-md py-1.5 font-medium ${basis === '100g' ? 'bg-slate-700 text-slate-100' : 'text-slate-400'}`}
          >
            Per 100g
          </button>
        </div>
      )}

      {missingSomething && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
          The label was missing some values — fill in the blanks below.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Serving label</label>
          <input
            type="text"
            value={fields.servingLabel}
            onChange={set('servingLabel')}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Serving weight (g)</label>
          <input
            type="number"
            inputMode="decimal"
            value={fields.servingGrams}
            onChange={set('servingGrams')}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          ['cal', 'Cal'],
          ['protein', 'Protein'],
          ['carbs', 'Carbs'],
          ['fat', 'Fat'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
            <input
              type="number"
              inputMode="decimal"
              value={fields[key]}
              onChange={set(key)}
              placeholder="?"
              className={`w-full rounded-lg border px-2 py-2 text-sm text-slate-100 ${
                fields[key] === '' ? 'border-amber-500/50 bg-amber-500/5' : 'border-slate-700 bg-slate-800'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-300">
          Cancel
        </button>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={() =>
            onConfirm({
              barcode: product.barcode,
              name: product.name,
              brand: product.brand,
              servingLabel: fields.servingLabel || '1 serving',
              servingGrams: fields.servingGrams ? Number(fields.servingGrams) : null,
              cal: Number(fields.cal) || 0,
              protein: Number(fields.protein) || 0,
              carbs: Number(fields.carbs) || 0,
              fat: Number(fields.fat) || 0,
            })
          }
          className="flex-1 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
