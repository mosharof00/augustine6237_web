export const SEARCH_DEBOUNCE_MS = 300;

export function scheduleSearch(
  onChange: (value: string) => void,
  value: string,
  delay = SEARCH_DEBOUNCE_MS,
) {
  const timer = setTimeout(() => onChange(value), delay);
  return () => clearTimeout(timer);
}
