import { useRef, useState } from 'react';
import { useStore } from '../lib/store';

export default function SettingsScreen() {
  const { state, updateSettings, exportData, importData, resetAllData } = useStore();
  const { settings } = state;
  const [calorieTarget, setCalorieTarget] = useState(settings.calorieTarget);
  const [proteinTarget, setProteinTarget] = useState(settings.proteinTarget);
  const [goalWeight, setGoalWeight] = useState(settings.goalWeight);
  const [startWeight, setStartWeight] = useState(settings.startWeight);
  const [importError, setImportError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const save = () => {
    updateSettings({
      calorieTarget: Number(calorieTarget) || 0,
      proteinTarget: Number(proteinTarget) || 0,
      goalWeight: Number(goalWeight) || 0,
      startWeight: Number(startWeight) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result);
      } catch {
        setImportError('Could not read that file — make sure it is a JSON export from this app.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const field = (label, value, setValue, unit) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        />
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="mb-4 text-xl font-bold text-slate-50">Settings</h1>

      <div className="space-y-3">
        {field('Daily calorie target', calorieTarget, setCalorieTarget, 'cal')}
        {field('Daily protein target', proteinTarget, setProteinTarget, 'g')}
        {field('Goal weight', goalWeight, setGoalWeight, 'lbs')}
        {field('Starting weight', startWeight, setStartWeight, 'lbs')}
        <button
          type="button"
          onClick={save}
          className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-slate-950"
        >
          {saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-slate-200">Data</h2>
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleExport}
            className="w-full rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-200"
          >
            Export all data (JSON)
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-200"
          >
            Import data
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          {importError && <p className="text-xs text-red-400">{importError}</p>}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-sm font-semibold text-red-400">Danger zone</h2>
        <button
          type="button"
          onClick={() => {
            if (confirm('This will erase all logged foods, weights, and recipes on this device. Export a backup first if you want to keep it. Continue?')) {
              resetAllData();
            }
          }}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-3 text-sm font-medium text-red-400"
        >
          Erase all data
        </button>
      </div>
    </div>
  );
}
