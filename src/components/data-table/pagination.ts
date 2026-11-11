export function showingRange(page: number, perPage: number, total: number) {
  if (total <= 0 || perPage <= 0) {
    return { from: 0, to: 0 };
  }
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return { from, to };
}

export function showingLabel(page: number, perPage: number, total: number) {
  const { from, to } = showingRange(page, perPage, total);
  return `Showing ${from}–${to} of ${total}`;
}

export function pageLabel(page: number, lastPage: number) {
  return `${page} / ${lastPage}`;
}

export function nextPage(page: number, lastPage: number) {
  if (page >= lastPage) return null;
  return page + 1;
}

export function previousPage(page: number) {
  if (page <= 1) return null;
  return page - 1;
}
