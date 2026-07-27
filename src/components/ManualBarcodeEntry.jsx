import { useState } from 'react';

export default function ManualBarcodeEntry({ onSubmit }) {
  const [code, setCode] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="text"
        inputMode="numeric"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="Enter barcode number"
        className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
      />
      <button
        type="button"
        disabled={!code}
        onClick={() => onSubmit(code)}
        className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 disabled:opacity-40"
      >
        Look up
      </button>
    </div>
  );
}
