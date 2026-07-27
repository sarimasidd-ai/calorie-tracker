import { useState } from 'react';
import { useStore } from '../lib/store';

export default function CustomFoodForm({ onDone, prefillBarcode }) {
  const { addCustomFood } = useStore();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingLabel, setServingLabel] = useState('1 serving');
  const [servingGrams, setServingGrams] = useState('');
  const [cal, setCal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const canSave = name.trim() && cal !== '';

  const field = (label, value, setValue, opts = {}) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
      <input
        type={opts.number ? 'number' : 'text'}
        inputMode={opts.number ? 'decimal' : undefined}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={opts.placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
      />
    </div>
  );

  return (
    <div className="space-y-3">
      {field('Name', name, setName, { placeholder: 'e.g. Mom\'s aloo paratha' })}
      {field('Brand (optional)', brand, setBrand, { placeholder: 'e.g. Nestle' })}
      <div className="grid grid-cols-2 gap-3">
        {field('Serving label', servingLabel, setServingLabel, { placeholder: '1 piece' })}
        {field('Serving weight (g, optional)', servingGrams, setServingGrams, { number: true, placeholder: '100' })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {field('Cal', cal, setCal, { number: true })}
        {field('Protein', protein, setProtein, { number: true })}
        {field('Carbs', carbs, setCarbs, { number: true })}
        {field('Fat', fat, setFat, { number: true })}
      </div>
      {prefillBarcode && <div className="text-xs text-slate-500">Barcode: {prefillBarcode}</div>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onDone} className="flex-1 rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-300">
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            const saved = addCustomFood({
              name: name.trim(),
              brand: brand.trim() || null,
              servingLabel: servingLabel.trim() || '1 serving',
              servingGrams: servingGrams ? Number(servingGrams) : null,
              cal: Number(cal) || 0,
              protein: Number(protein) || 0,
              carbs: Number(carbs) || 0,
              fat: Number(fat) || 0,
              barcode: prefillBarcode || null,
            });
            onDone(saved);
          }}
          className="flex-1 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-40"
        >
          Save forever
        </button>
      </div>
    </div>
  );
}
