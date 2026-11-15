// Estado da vistoria — funções puras. O armazenamento entra por parâmetro
// (objeto com getItem/setItem, ou null quando indisponível).

export const STORAGE_KEY = 'en2-vistoria-v1';
const STATUSES = ['ok', 'defeito', 'na'];

export function emptyState(now = new Date()) {
  return { version: 1, startedAt: now.toISOString(), items: {} };
}

export function loadState(storage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || typeof s.items !== 'object' || s.items === null) return emptyState();
    return { version: 1, startedAt: s.startedAt ?? new Date().toISOString(), items: s.items };
  } catch {
    return emptyState();
  }
}

export function saveState(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function withItem(state, id, entry) {
  const items = { ...state.items };
  if (entry === undefined) delete items[id];
  else items[id] = entry;
  return { ...state, items };
}

export function setStatus(state, id, status, now = new Date()) {
  if (status !== null && !STATUSES.includes(status)) throw new Error(`status inválido: ${status}`);
  const note = state.items[id]?.note ?? '';
  if (status === null && !note.trim()) return withItem(state, id, undefined);
  return withItem(state, id, { status, note, updatedAt: now.toISOString() });
}

export function setNote(state, id, note, now = new Date()) {
  const status = state.items[id]?.status ?? null;
  return withItem(state, id, { status, note, updatedAt: now.toISOString() });
}

export function progress(state, items) {
  const r = { total: items.length, done: 0, ok: 0, defeito: 0, na: 0 };
  for (const { id } of items) {
    const st = state.items[id]?.status;
    if (!st) continue;
    r.done++;
    r[st]++;
  }
  return r;
}

export function roomProgress(state, room) {
  const { total, done, defeito } = progress(state, room.items);
  return { total, done, defeito };
}
