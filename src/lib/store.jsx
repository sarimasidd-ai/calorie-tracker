import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { DEFAULT_STATE, loadState, saveState } from './storage';
import { todayKey } from './date';
import { scaleMacros, roundMacros, itemKey } from './items';

const StoreContext = createContext(null);

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const logItem = useCallback(({ section, item, mode, quantity, grams }) => {
    const servingGramsSnapshot = item.servingGrams || null;
    const unitMacros = { cal: item.cal || 0, protein: item.protein || 0, carbs: item.carbs || 0, fat: item.fat || 0 };

    let finalQuantity = quantity;
    let finalGrams = grams;
    if (mode === 'weight') {
      finalQuantity = servingGramsSnapshot ? grams / servingGramsSnapshot : 0;
    } else {
      finalGrams = servingGramsSnapshot ? servingGramsSnapshot * quantity : null;
    }

    const macros = roundMacros(scaleMacros(unitMacros, finalQuantity));
    const entry = {
      id: uid(),
      section,
      type: item.type,
      refId: item.id,
      name: item.name,
      brand: item.brand || null,
      servingLabel: item.servingLabel,
      mode,
      quantity: finalQuantity,
      grams: finalGrams,
      servingGramsSnapshot,
      unitMacros,
      ...macros,
      loggedAt: new Date().toISOString(),
    };

    const key = todayKey();
    setState((s) => ({
      ...s,
      logsByDate: {
        ...s.logsByDate,
        [key]: [...(s.logsByDate[key] || []), entry],
      },
      recentIds: [itemKey(item), ...s.recentIds.filter((k) => k !== itemKey(item))].slice(0, 30),
    }));
    return entry;
  }, []);

  const updateLogEntry = useCallback((dateKey, entryId, updates) => {
    setState((s) => {
      const list = s.logsByDate[dateKey] || [];
      const newList = list.map((e) => {
        if (e.id !== entryId) return e;
        let quantity = e.quantity;
        let grams = e.grams;
        let mode = updates.mode || e.mode;
        if (updates.grams != null) {
          grams = updates.grams;
          quantity = e.servingGramsSnapshot ? grams / e.servingGramsSnapshot : 0;
          mode = 'weight';
        } else if (updates.quantity != null) {
          quantity = updates.quantity;
          grams = e.servingGramsSnapshot ? e.servingGramsSnapshot * quantity : null;
          mode = 'quantity';
        }
        const section = updates.section || e.section;
        const macros = roundMacros(scaleMacros(e.unitMacros, quantity));
        return { ...e, section, mode, quantity, grams, ...macros };
      });
      return { ...s, logsByDate: { ...s.logsByDate, [dateKey]: newList } };
    });
  }, []);

  const deleteLogEntry = useCallback((dateKey, entryId) => {
    setState((s) => ({
      ...s,
      logsByDate: {
        ...s.logsByDate,
        [dateKey]: (s.logsByDate[dateKey] || []).filter((e) => e.id !== entryId),
      },
    }));
  }, []);

  const addCustomFood = useCallback((data) => {
    const food = {
      id: uid(),
      name: data.name,
      category: 'My Foods',
      servingLabel: data.servingLabel,
      servingGrams: data.servingGrams || null,
      cal: Number(data.cal) || 0,
      protein: Number(data.protein) || 0,
      carbs: Number(data.carbs) || 0,
      fat: Number(data.fat) || 0,
      kind: 'custom',
      barcode: data.barcode || null,
      brand: data.brand || null,
    };
    setState((s) => ({ ...s, customFoods: [...s.customFoods, food] }));
    return food;
  }, []);

  const updateCustomFood = useCallback((id, data) => {
    setState((s) => ({
      ...s,
      customFoods: s.customFoods.map((f) => (f.id === id ? { ...f, ...data } : f)),
    }));
  }, []);

  const addRecipe = useCallback((data) => {
    const recipe = {
      id: uid(),
      name: data.name,
      ingredients: data.ingredients || [],
      servings: data.servings || 4,
      totalCookedWeightGrams: data.totalCookedWeightGrams || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, recipes: [...s.recipes, recipe] }));
    return recipe;
  }, []);

  const updateRecipe = useCallback((id, data) => {
    setState((s) => ({
      ...s,
      recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)),
    }));
  }, []);

  const duplicateRecipe = useCallback((id) => {
    let newRecipe = null;
    setState((s) => {
      const orig = s.recipes.find((r) => r.id === id);
      if (!orig) return s;
      newRecipe = {
        ...orig,
        id: uid(),
        name: `${orig.name} (copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { ...s, recipes: [...s.recipes, newRecipe] };
    });
    return newRecipe;
  }, []);

  const deleteRecipe = useCallback((id) => {
    setState((s) => ({ ...s, recipes: s.recipes.filter((r) => r.id !== id) }));
  }, []);

  const addWeight = useCallback((date, weight) => {
    setState((s) => {
      const existingIdx = s.weights.findIndex((w) => w.date === date);
      const entry = { id: existingIdx >= 0 ? s.weights[existingIdx].id : uid(), date, weight: Number(weight) };
      let weights;
      if (existingIdx >= 0) {
        weights = s.weights.map((w, i) => (i === existingIdx ? entry : w));
      } else {
        weights = [...s.weights, entry];
      }
      weights.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      return { ...s, weights };
    });
  }, []);

  const deleteWeight = useCallback((id) => {
    setState((s) => ({ ...s, weights: s.weights.filter((w) => w.id !== id) }));
  }, []);

  const updateSettings = useCallback((partial) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...partial } }));
  }, []);

  const markEstimateNoteSeen = useCallback(() => {
    setState((s) => ({ ...s, settings: { ...s.settings, seenEstimateNote: true } }));
  }, []);

  const toggleFavorite = useCallback((key) => {
    setState((s) => {
      const has = s.favoriteIds.includes(key);
      return {
        ...s,
        favoriteIds: has ? s.favoriteIds.filter((k) => k !== key) : [key, ...s.favoriteIds],
      };
    });
  }, []);

  const cacheBarcodeProduct = useCallback((barcode, product) => {
    setState((s) => ({
      ...s,
      barcodeProducts: { ...s.barcodeProducts, [barcode]: product },
    }));
  }, []);

  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importData = useCallback((json) => {
    const parsed = JSON.parse(json);
    setState({ ...DEFAULT_STATE(), ...parsed, settings: { ...DEFAULT_STATE().settings, ...(parsed.settings || {}) } });
  }, []);

  const resetAllData = useCallback(() => {
    setState(DEFAULT_STATE());
  }, []);

  const value = useMemo(
    () => ({
      state,
      logItem,
      updateLogEntry,
      deleteLogEntry,
      addCustomFood,
      updateCustomFood,
      addRecipe,
      updateRecipe,
      duplicateRecipe,
      deleteRecipe,
      addWeight,
      deleteWeight,
      updateSettings,
      markEstimateNoteSeen,
      toggleFavorite,
      cacheBarcodeProduct,
      exportData,
      importData,
      resetAllData,
    }),
    [
      state,
      logItem,
      updateLogEntry,
      deleteLogEntry,
      addCustomFood,
      updateCustomFood,
      addRecipe,
      updateRecipe,
      duplicateRecipe,
      deleteRecipe,
      addWeight,
      deleteWeight,
      updateSettings,
      markEstimateNoteSeen,
      toggleFavorite,
      cacheBarcodeProduct,
      exportData,
      importData,
      resetAllData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
