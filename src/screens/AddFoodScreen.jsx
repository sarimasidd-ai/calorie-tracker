import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { getAllItems, itemKey } from '../lib/items';
import { defaultMealSection } from '../lib/date';
import Sheet from '../components/Sheet';
import QuantityPicker from '../components/QuantityPicker';
import CustomFoodForm from '../components/CustomFoodForm';
import BarcodeFlow from '../components/BarcodeFlow';

function TypeBadge({ type }) {
  if (type === 'recipe') return <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-300">recipe</span>;
  if (type === 'custom') return <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">custom</span>;
  if (type === 'barcode') return <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-medium text-orange-300">scanned</span>;
  return null;
}

export default function AddFoodScreen({ initialSection, onDone }) {
  const { state, logItem, toggleFavorite } = useStore();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('search');
  const [section, setSection] = useState(initialSection || defaultMealSection());
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const allItems = useMemo(() => getAllItems(state), [state]);

  const list = useMemo(() => {
    let base = allItems;
    if (tab === 'recent') {
      base = state.recentIds
        .map((k) => allItems.find((it) => itemKey(it) === k))
        .filter(Boolean);
    } else if (tab === 'favorites') {
      base = state.favoriteIds
        .map((k) => allItems.find((it) => itemKey(it) === k))
        .filter(Boolean);
    }
    if (!query.trim()) return base;
    const q = query.trim().toLowerCase();
    return base.filter((it) => it.name.toLowerCase().includes(q));
  }, [allItems, tab, query, state.recentIds, state.favoriteIds]);

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="mb-4 text-xl font-bold text-slate-50">Add food</h1>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods, recipes..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500"
        />
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          aria-label="Scan barcode"
          className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-3 text-lg"
        >
          📷
        </button>
      </div>

      <div className="mt-3 flex gap-2 text-sm">
        {[
          ['search', 'All'],
          ['recent', 'Recent'],
          ['favorites', 'Favorites'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === key ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustomForm(true)}
          className="ml-auto rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300"
        >
          + Custom food
        </button>
      </div>

      <div className="mt-4 space-y-1.5">
        {list.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-800 py-6 text-center text-sm text-slate-600">
            No foods found
          </div>
        )}
        {list.map((item) => {
          const key = itemKey(item);
          const isFav = state.favoriteIds.includes(key);
          return (
            <div
              key={key}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5"
            >
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setSelectedItem(item)}>
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-slate-100">{item.name}</span>
                  <TypeBadge type={item.type} />
                </div>
                <div className="text-xs text-slate-500">
                  {item.servingLabel} · {item.cal} cal · {item.protein}g protein
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(key)}
                className={`shrink-0 text-lg ${isFav ? 'text-amber-400' : 'text-slate-700'}`}
                aria-label="Toggle favorite"
              >
                ★
              </button>
            </div>
          );
        })}
      </div>

      <Sheet open={!!selectedItem} onClose={() => setSelectedItem(null)} title="Log food">
        {selectedItem && (
          <QuantityPicker
            item={selectedItem}
            section={section}
            onSectionChange={setSection}
            onCancel={() => setSelectedItem(null)}
            onConfirm={(payload) => {
              logItem({ section, item: selectedItem, ...payload });
              setSelectedItem(null);
              onDone();
            }}
          />
        )}
      </Sheet>

      <Sheet open={showCustomForm} onClose={() => setShowCustomForm(false)} title="Custom food">
        <CustomFoodForm onDone={() => setShowCustomForm(false)} />
      </Sheet>

      <Sheet open={showScanner} onClose={() => setShowScanner(false)} title="Scan barcode">
        {showScanner && (
          <BarcodeFlow
            section={section}
            onSectionChange={setSection}
            onCancel={() => setShowScanner(false)}
            onDone={() => {
              setShowScanner(false);
              onDone();
            }}
          />
        )}
      </Sheet>
    </div>
  );
}
