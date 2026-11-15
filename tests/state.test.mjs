import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHECKLIST, ALL_CHECK_ITEMS } from '../js/data.js';
import {
  STORAGE_KEY, emptyState, loadState, saveState, setStatus, setNote, progress, roomProgress,
} from '../js/state.js';

function memStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}
const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
const ID = ALL_CHECK_ITEMS[0].id;
const ID2 = ALL_CHECK_ITEMS[1].id;

test('STORAGE_KEY', () => assert.equal(STORAGE_KEY, 'en2-vistoria-v1'));

test('loadState vazio', () => {
  const s = loadState(memStorage());
  assert.equal(s.version, 1);
  assert.deepEqual(s.items, {});
  assert.ok(!Number.isNaN(Date.parse(s.startedAt)));
});

test('loadState JSON inválido', () => {
  assert.deepEqual(loadState(memStorage({ [STORAGE_KEY]: '{x' })).items, {});
});

test('loadState version 2', () => {
  const raw = JSON.stringify({ version: 2, startedAt: 'x', items: { a: { status: 'ok' } } });
  assert.deepEqual(loadState(memStorage({ [STORAGE_KEY]: raw })).items, {});
});

test('loadState storage que lança', () => {
  assert.deepEqual(loadState(throwing).items, {});
});

test('loadState storage nulo', () => {
  assert.deepEqual(loadState(null).items, {});
});

test('saveState', () => {
  assert.equal(saveState(throwing, emptyState()), false);
  assert.equal(saveState(null, emptyState()), false);
  const st = memStorage();
  const s = setStatus(emptyState(), ID, 'ok');
  assert.equal(saveState(st, s), true);
  assert.deepEqual(loadState(st), s);
});

test('setStatus não muta', () => {
  const s0 = emptyState();
  const s1 = setStatus(s0, ID, 'defeito');
  assert.deepEqual(s0.items, {});
  assert.equal(s1.items[ID].status, 'defeito');
  assert.equal(s1.items[ID].note, '');
  assert.ok(!Number.isNaN(Date.parse(s1.items[ID].updatedAt)));
});

test('defeito → ok mantém a nota', () => {
  let s = setStatus(emptyState(), ID, 'defeito');
  s = setNote(s, ID, 'trinca');
  s = setStatus(s, ID, 'ok');
  assert.equal(s.items[ID].note, 'trinca');
  assert.equal(s.items[ID].status, 'ok');
});

test('setNote sem status cria entrada sem status', () => {
  const s = setNote(emptyState(), ID, 'olhar depois');
  assert.equal(s.items[ID].note, 'olhar depois');
  assert.equal(s.items[ID].status, null);
});

test('setStatus null sem nota remove a entrada', () => {
  let s = setStatus(emptyState(), ID, 'ok');
  s = setStatus(s, ID, null);
  assert.equal(ID in s.items, false);
});

test('setStatus null com nota mantém a nota', () => {
  let s = setStatus(emptyState(), ID, 'defeito');
  s = setNote(s, ID, 'x');
  s = setStatus(s, ID, null);
  assert.equal(s.items[ID].status, null);
  assert.equal(s.items[ID].note, 'x');
});

test('setStatus rejeita status inválido', () => {
  assert.throws(() => setStatus(emptyState(), ID, 'talvez'));
});

test('progress ignora id órfão', () => {
  let s = setStatus(emptyState(), 'nao-existe', 'defeito');
  s = setStatus(s, ID, 'defeito');
  s = setNote(s, ID2, 'só nota');
  assert.deepEqual(progress(s, ALL_CHECK_ITEMS), {
    total: ALL_CHECK_ITEMS.length, done: 1, ok: 0, defeito: 1, na: 0,
  });
});

test('roomProgress', () => {
  const room = CHECKLIST[0];
  let s = setStatus(emptyState(), room.items[0].id, 'ok');
  s = setStatus(s, room.items[1].id, 'defeito');
  assert.deepEqual(roomProgress(s, room), { total: room.items.length, done: 2, defeito: 1 });
});
