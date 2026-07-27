import { useState } from 'react';
import { StoreProvider } from './lib/store';
import TodayScreen from './screens/TodayScreen';
import AddFoodScreen from './screens/AddFoodScreen';
import WeightScreen from './screens/WeightScreen';
import RecipesScreen from './screens/RecipesScreen';
import SettingsScreen from './screens/SettingsScreen';

const TABS = [
  { key: 'today', label: 'Today', icon: '🔥' },
  { key: 'add', label: 'Add', icon: '➕' },
  { key: 'weight', label: 'Weight', icon: '⚖️' },
  { key: 'recipes', label: 'Recipes', icon: '📖' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

function App() {
  const [tab, setTab] = useState('today');
  const [addFoodTarget, setAddFoodTarget] = useState(null); // { section } when launched from Today

  const goToAddFood = (section) => {
    setAddFoodTarget({ section: section || 'Snacks' });
    setTab('add');
  };

  return (
    <StoreProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-950 text-slate-100">
        <main className="flex-1 overflow-y-auto pb-24">
          {tab === 'today' && <TodayScreen onAddFood={goToAddFood} />}
          {tab === 'add' && (
            <AddFoodScreen
              initialSection={addFoodTarget?.section}
              onDone={() => {
                setAddFoodTarget(null);
                setTab('today');
              }}
            />
          )}
          {tab === 'weight' && <WeightScreen />}
          {tab === 'recipes' && <RecipesScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </main>

        <nav className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-md justify-around border-t border-slate-800 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                if (t.key === 'add') setAddFoodTarget(null);
                setTab(t.key);
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                tab === t.key ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </StoreProvider>
  );
}

export default App;
