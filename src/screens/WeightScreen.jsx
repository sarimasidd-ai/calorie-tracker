import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useStore } from '../lib/store';
import { todayKey, addDays, daysBetween } from '../lib/date';

function rollingAverageSeries(weights) {
  const sorted = [...weights].sort((a, b) => (a.date < b.date ? -1 : 1));
  return sorted.map((w) => {
    const windowStart = addDays(w.date, -6);
    const windowVals = sorted.filter((x) => x.date >= windowStart && x.date <= w.date);
    const avg7 = windowVals.reduce((s, x) => s + x.weight, 0) / windowVals.length;
    return { date: w.date, weight: w.weight, avg7: Math.round(avg7 * 10) / 10 };
  });
}

function computeWeeklyRate(series) {
  if (series.length < 2) return null;
  const last = series[series.length - 1];
  const spanDays = daysBetween(series[0].date, last.date);
  if (spanDays < 10) return null;

  const targetDate = addDays(last.date, -21);
  let closest = series[0];
  let bestDiff = Infinity;
  for (const p of series) {
    const diff = Math.abs(daysBetween(p.date, targetDate));
    if (diff < bestDiff) {
      bestDiff = diff;
      closest = p;
    }
  }
  const weeksSpan = Math.max(daysBetween(closest.date, last.date) / 7, 0.5);
  const rate = (last.avg7 - closest.avg7) / weeksSpan;
  return { rate, weeksSpan };
}

function shortDate(d) {
  const dt = new Date(`${d}T00:00:00`);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function WeightScreen() {
  const { state, addWeight, deleteWeight } = useStore();
  const [date, setDate] = useState(todayKey());
  const [weight, setWeight] = useState('');

  const series = useMemo(() => rollingAverageSeries(state.weights), [state.weights]);
  const rateInfo = useMemo(() => computeWeeklyRate(series), [series]);
  const goalWeight = state.settings.goalWeight;

  const chartData = series.map((p) => ({ ...p, label: shortDate(p.date) }));

  let rateFlag = null;
  if (rateInfo) {
    if (rateInfo.rate > 1) rateFlag = { text: 'Gaining too fast — likely more fat than muscle. Consider trimming calories slightly.', color: 'text-amber-300 border-amber-500/30 bg-amber-500/10' };
    else if (rateInfo.rate < 0.25) rateFlag = { text: 'Gaining too slowly — bump up calories.', color: 'text-sky-300 border-sky-500/30 bg-sky-500/10' };
    else rateFlag = { text: 'Right in the lean-bulk zone. Keep it up.', color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' };
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="mb-4 text-xl font-bold text-slate-50">Weight</h1>

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        />
        <input
          type="number"
          inputMode="decimal"
          placeholder="lbs"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500"
        />
        <button
          type="button"
          disabled={!weight}
          onClick={() => {
            addWeight(date, weight);
            setWeight('');
          }}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
        >
          Log
        </button>
      </div>

      {chartData.length > 0 ? (
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={30} />
              <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <ReferenceLine y={goalWeight} stroke="#f472b6" strokeDasharray="4 4" label={{ value: `Goal ${goalWeight}`, fill: '#f472b6', fontSize: 11, position: 'insideTopLeft' }} />
              <Line type="monotone" dataKey="weight" stroke="#475569" strokeWidth={1.5} dot={{ r: 2 }} name="Daily" />
              <Line type="monotone" dataKey="avg7" stroke="#34d399" strokeWidth={2.5} dot={false} name="7-day avg" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-slate-800 py-10 text-center text-sm text-slate-600">
          Log your weight to see the chart
        </div>
      )}

      {rateInfo ? (
        <div className={`mt-4 rounded-lg border p-3 text-sm ${rateFlag.color}`}>
          <div className="font-semibold">{rateInfo.rate >= 0 ? '+' : ''}{rateInfo.rate.toFixed(2)} lb/week</div>
          <div className="mt-0.5 text-xs opacity-90">{rateFlag.text}</div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-500">
          Log weight for at least ~10 days to see your weekly rate.
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-slate-200">History</h2>
        <div className="space-y-1.5">
          {[...state.weights]
            .sort((a, b) => (a.date < b.date ? 1 : -1))
            .map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-sm">
                <span className="text-slate-400">{shortDate(w.date)}</span>
                <span className="font-medium text-slate-100">{w.weight} lbs</span>
                <button type="button" onClick={() => deleteWeight(w.id)} className="text-xs text-red-400">
                  Delete
                </button>
              </div>
            ))}
          {state.weights.length === 0 && <div className="text-center text-xs text-slate-600">No entries yet</div>}
        </div>
      </div>
    </div>
  );
}
