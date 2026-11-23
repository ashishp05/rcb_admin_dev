// Consecutive-hour selection: adjacent hours extend, the ends trim, anything else restarts.
export const toggleHour = (selected: number[], hour: number): { hours: number[]; reset: boolean } => {
  if (selected.length === 0) return { hours: [hour], reset: false };
  const min = Math.min(...selected);
  const max = Math.max(...selected);
  if (selected.includes(hour)) {
    if (hour === min || hour === max) return { hours: selected.filter((h) => h !== hour), reset: false };
    return { hours: [hour], reset: true };
  }
  if (hour === max + 1 || hour === min - 1) return { hours: [...selected, hour].sort((a, b) => a - b), reset: false };
  return { hours: [hour], reset: true };
};
