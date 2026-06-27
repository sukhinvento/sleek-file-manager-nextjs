// Shared utilities for mock handlers

let _seq = 1;
export const genId = () => `mock_${Date.now()}_${_seq++}`;

export const now = () => new Date().toISOString();
export const today = () => new Date().toISOString().split('T')[0];

/** Build a paginated response matching the backend shape */
export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): { data: T[]; total: number; page: number; limit: number; totalPages: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const data = items.slice(start, start + limit);
  return { data, total, page: safePage, limit, totalPages };
}

/** Simple text search across multiple string fields */
export function textSearch<T extends Record<string, any>>(
  items: T[],
  query: string | undefined,
  fields: string[],
): T[] {
  if (!query?.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    fields.some(f => String(item[f] ?? '').toLowerCase().includes(q)),
  );
}

/** Filter by exact/partial field match from query params */
export function applyFilters<T extends Record<string, any>>(
  items: T[],
  params: Record<string, string | undefined>,
  fieldMap: Record<string, string>, // paramKey → itemKey
): T[] {
  let result = items;
  for (const [paramKey, itemKey] of Object.entries(fieldMap)) {
    const val = params[paramKey];
    if (val && val !== 'all' && val !== 'All') {
      result = result.filter(
        item => String(item[itemKey] ?? '').toLowerCase() === val.toLowerCase(),
      );
    }
  }
  return result;
}

/** Parse integer query param with fallback */
export const intParam = (val: string | undefined, fallback: number) =>
  val ? parseInt(val, 10) || fallback : fallback;

/** Simulate async delay (very short in mock) */
export const delay = (ms = 20) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));
