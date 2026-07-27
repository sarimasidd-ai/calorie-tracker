import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { getIngredientLookup, computeRecipePerServing, roundMacros } from '../lib/items';
import Sheet from '../components/Sheet';
import RecipeEditor from '../components/RecipeEditor';

export default function RecipesScreen() {
  const { state, addRecipe, updateRecipe, duplicateRecipe, deleteRecipe } = useStore();
  const [editing, setEditing] = useState(null); // null | 'new' | recipe object

  const lookup = useMemo(() => getIngredientLookup(state.customFoods), [state.customFoods]);

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-50">My Recipes</h1>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
        >
          + New recipe
        </button>
      </div>

      <div className="space-y-2">
        {state.recipes.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-800 py-8 text-center text-sm text-slate-600">
            No recipes yet. Batch-cook something and save it here.
          </div>
        )}
        {state.recipes.map((r) => {
          const { perServing } = computeRecipePerServing(r, lookup);
          const rounded = roundMacros(perServing);
          return (
            <div key={r.id} className="rounded-lg bg-slate-900 p-3">
              <button type="button" onClick={() => setEditing(r)} className="block w-full text-left">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-100">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.servings} servings</div>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {rounded.cal} cal · {rounded.protein}g P · {rounded.carbs}g C · {rounded.fat}g F{' '}
                  <span className="text-slate-600">/ serving</span>
                </div>
                {r.totalCookedWeightGrams && (
                  <div className="mt-0.5 text-xs text-slate-600">
                    Cooked batch: {r.totalCookedWeightGrams}g ({Math.round(r.totalCookedWeightGrams / r.servings)}g/serving)
                  </div>
                )}
              </button>
              <div className="mt-2 flex gap-3 text-xs">
                <button type="button" onClick={() => duplicateRecipe(r.id)} className="font-medium text-sky-400">
                  Save as copy
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New recipe' : 'Edit recipe'}
      >
        {editing && (
          <RecipeEditor
            initialRecipe={editing === 'new' ? null : editing}
            onCancel={() => setEditing(null)}
            onSave={(data) => {
              if (editing === 'new') addRecipe(data);
              else updateRecipe(editing.id, data);
              setEditing(null);
            }}
            onDelete={
              editing !== 'new'
                ? () => {
                    if (confirm(`Delete "${editing.name}"? Past logged entries keep their saved macros.`)) {
                      deleteRecipe(editing.id);
                      setEditing(null);
                    }
                  }
                : undefined
            }
          />
        )}
      </Sheet>
    </div>
  );
}
