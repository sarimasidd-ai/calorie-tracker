import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../lib/store';
import { todayKey, hoursLeftInDay, defaultMealSection } from '../lib/date';
import { emptyMacros, addMacros, itemKey } from '../lib/items';
import { computeStreak, computeQuickAddItems, computeWeeklyData } from '../lib/stats';
import { MEAL_SECTIONS } from '../data/foods';
import ProgressRing from '../components/ProgressRing';
import MacroBar from '../components/MacroBar';
import Sheet from '../components/Sheet';
import QuantityPicker from '../components/QuantityPicker';

function EstimateNote() {
  const { state, markEstimateNoteSeen } = useStore();
  if (state.settings.seenEstimateNote) return null;
  return (
    <div className="mx-4 mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
      <p>
        Heads up: homemade curry/salan values are household <strong>estimates</strong> — every kitchen cooks
        differently. Consistency matters more than precision, so just log the same way every time.
      </p>
      <button
        type="button"
        onClick={markEstimateNoteSeen}
        className="mt-2 rounded-md bg-amber-500/20 px-2 py-1 font-medium text-amber-100"
      >
        Got it
      </button>
    </div>
  );
}

function EditEntrySheet({ entry, dateKey, onClose }) {
  const { updateLogEntry, deleteLogEntry } = useStore();
  const [section, setSection] = useState(entry?.section);
  if (!entry) return null;

  const pseudoItem = {
    name: entry.name,
    brand: entry.brand,
    servingLabel: entry.servingLabel,
    servingGrams: entry.servingGramsSnapshot,
    cal: entry.unitMacros.cal,
    protein: entry.unitMacros.protein,
    carbs: entry.unitMacros.carbs,
    fat: entry.unitMacros.fat,
  };

  return (
    <Sheet open={!!entry} onClose={onClose} title="Edit entry">
      <QuantityPicker
        item={pseudoItem}
        section={section}
        onSectionChange={setSection}
        onCancel={onClose}
        onConfirm={(payload) => {
          updateLogEntry(dateKey, entry.id, { ...payload, section });
          onClose();
        }}
      />
      <button
        type="button"
        onClick={() => {
          deleteLogEntry(dateKey, entry.id);
          onClose();
        }}
        className="mt-3 w-full rounded-lg bg-red-500/10 py-2.5 text-sm font-medium text-red-400"
      >
        Delete entry
      </button>
    </Sheet>
  );
}

function QuickAddRow() {
  const { state, logItem } = useStore();
  const quickItems = useMemo(() => computeQuickAddItems(state, 6), [state]);
  if (quickItems.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-200">Quick add</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {quickItems.map((item) => (
          <button
            key={itemKey(item)}
            type="button"
            onClick={() => logItem({ section: defaultMealSection(), item, mode: 'quantity', quantity: 1 })}
            className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-left"
          >
            <div className="max-w-[8rem] truncate text-xs font-medium text-slate-100">{item.name}</div>
            <div className="text-[10px] text-slate-500">{item.cal} cal</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WeeklyChart() {
  const { state } = useStore();
  const data = useMemo(() => computeWeeklyData(state, 7), [state]);
  const target = state.settings.calorieTarget;

  return (
    <div className="mt-6 px-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-200">This week</h3>
      <div className="h-40 w-full rounded-lg bg-slate-900 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(148,163,184,0.08)' }}
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#cbd5e1' }}
            />
            <ReferenceLine y={target} stroke="#f472b6" strokeDasharray="4 4" />
            <Bar dataKey="cal" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.cal >= target ? '#34d399' : '#38bdf8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function TodayScreen({ onAddFood }) {
  const { state } = useStore();
  const dateKey = todayKey();
  const entries = state.logsByDate[dateKey] || [];
  const [editingEntry, setEditingEntry] = useState(null);

  const totals = useMemo(() => entries.reduce((acc, e) => addMacros(acc, e), emptyMacros()), [entries]);
  const { calorieTarget, proteinTarget } = state.settings;
  const carbTarget = Math.round((calorieTarget * 0.45) / 4);
  const fatTarget = Math.round((calorieTarget * 0.25) / 9);

  const remaining = calorieTarget - totals.cal;
  const hoursLeft = hoursLeftInDay();
  const showNudge = remaining > 150 && hoursLeft < 4;
  const streak = useMemo(() => computeStreak(state), [state]);

  const bySection = useMemo(() => {
    const map = {};
    for (const s of MEAL_SECTIONS) map[s] = [];
    for (const e of entries) {
      if (!map[e.section]) map[e.section] = [];
      map[e.section].push(e);
    }
    return map;
  }, [entries]);

  return (
    <div className="pb-4">
      <div className="px-4 pt-6">
        {streak > 0 && (
          <div className="mb-3 flex justify-center">
            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-300">
              🔥 {streak} day{streak === 1 ? '' : 's'} at 90%+
            </span>
          </div>
        )}
        <div className="flex flex-col items-center">
          <ProgressRing value={totals.cal} max={calorieTarget}>
            <div className="text-3xl font-bold text-slate-50">{Math.round(totals.cal)}</div>
            <div className="text-xs text-slate-400">of {calorieTarget} cal</div>
            <div className={`mt-1 text-xs font-medium ${remaining >= 0 ? 'text-sky-400' : 'text-emerald-400'}`}>
              {remaining >= 0 ? `${Math.round(remaining)} left` : `+${Math.round(-remaining)} over`}
            </div>
          </ProgressRing>
        </div>

        {showNudge && (
          <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-center text-sm text-sky-200">
            You're <strong>{Math.round(remaining)} cal</strong> short with {hoursLeft.toFixed(1)}h left today —
            add a shake or some peanut butter.
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <MacroBar label="Protein" value={totals.protein} target={proteinTarget} color="bg-emerald-400" />
          <MacroBar label="Carbs" value={totals.carbs} target={carbTarget} color="bg-amber-400" />
          <MacroBar label="Fat" value={totals.fat} target={fatTarget} color="bg-rose-400" />
        </div>

        <QuickAddRow />
      </div>

      <EstimateNote />

      <div className="mt-6 space-y-5 px-4">
        {MEAL_SECTIONS.map((section) => (
          <div key={section}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">{section}</h3>
              <button
                type="button"
                onClick={() => onAddFood(section)}
                className="text-xs font-medium text-emerald-400"
              >
                + Add food
              </button>
            </div>
            <div className="space-y-1.5">
              {(bySection[section] || []).length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-800 py-3 text-center text-xs text-slate-600">
                  Nothing logged yet
                </div>
              )}
              {(bySection[section] || []).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setEditingEntry(entry)}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-900 px-3 py-2.5 text-left"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-100">{entry.name}</div>
                    <div className="text-xs text-slate-500">
                      {entry.mode === 'weight' ? `${Math.round(entry.grams)}g` : `${entry.quantity}x ${entry.servingLabel}`}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0 text-sm font-semibold text-slate-200">{entry.cal} cal</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <WeeklyChart />

      <EditEntrySheet entry={editingEntry} dateKey={dateKey} onClose={() => setEditingEntry(null)} />
    </div>
  );
}
