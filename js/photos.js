// Fotos dos itens da vistoria: redimensionamento e armazenamento no IndexedDB.
// As fotos ficam só neste aparelho (banco "en2-fotos").

export const MAX_PER_ITEM = 6;
export const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.8;
const DB_NAME = 'en2-fotos';
const STORE = 'photos';

export function fitDimensions(width, height, max = MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

// Reduz a imagem (respeitando a orientação EXIF) e devolve um Blob JPEG.
export async function resizeImage(file, max = MAX_SIDE) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = fitDimensions(bitmap.width, bitmap.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Falha ao converter a imagem'))), 'image/jpeg', JPEG_QUALITY));
}

const req2promise = r => new Promise((resolve, reject) => {
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});

export function openPhotoDb(idb = globalThis.indexedDB) {
  if (!idb) return Promise.reject(new Error('IndexedDB indisponível'));
  const r = idb.open(DB_NAME, 1);
  r.onupgradeneeded = () => {
    const store = r.result.createObjectStore(STORE, { keyPath: 'id' });
    store.createIndex('itemId', 'itemId');
  };
  return req2promise(r);
}

function tx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const result = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error ?? new Error('Transação abortada'));
  });
}

export async function addPhoto(db, itemId, blob, now = new Date()) {
  const rec = { id: `${itemId}-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`, itemId, blob, createdAt: now.toISOString() };
  await tx(db, 'readwrite', s => s.add(rec));
  return rec;
}

// Devolve { [itemId]: [registros em ordem de criação] }
export async function listPhotos(db) {
  const all = await new Promise((resolve, reject) => {
    const r = db.transaction(STORE).objectStore(STORE).getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  const by = {};
  for (const p of all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) (by[p.itemId] ??= []).push(p);
  return by;
}

export const deletePhoto = (db, id) => tx(db, 'readwrite', s => s.delete(id));
export const clearPhotos = db => tx(db, 'readwrite', s => s.clear());
