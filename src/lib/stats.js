import { todayKey, addDays } from './date';
import { getAllItems, itemKey } from './items';

export function dayTotalCal(state, dateKey) {
  return (state.logsByDate[dateKey] || []).reduce((sum, e) => sum + e.cal, 0);
}

// Consecutive days (working backwards) hitting at least 90% of the calorie
// target. Today only counts once it already clears the bar, so logging
// earlier in the day never looks like a broken streak.
export function computeStreak(state) {
  const target = state.settings.calorieTarget;
  if (!target) return 0;
  let cursor = todayKey();
  if (dayTotalCal(state, cursor) < target * 0.9) {
    cursor = addDays(cursor, -1);
  }
  let streak = 0;
  while (dayTotalCal(state, cursor) >= target * 0.9) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeQuickAddItems(state, limit = 6) {
  const counts = new Map();
  for (const entries of Object.values(state.logsByDate)) {
    for (const e of entries) {
      const k = `${e.type}:${e.refId}`;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
  }
  if (counts.size === 0) return [];
  const allItems = getAllItems(state);
  return allItems
    .map((item) => ({ item, count: counts.get(itemKey(item)) || 0 }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((x) => x.item);
}

export function computeWeeklyData(state, days = 7) {
  const target = state.settings.calorieTarget;
  const today = todayKey();
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const d = new Date(`${date}T00:00:00`);
    result.push({
      date,
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      cal: Math.round(dayTotalCal(state, date)),
      target,
    });
  }
  return result;
}
