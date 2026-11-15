import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHECKLIST, SOURCES, PROJECT } from '../js/data.js';
import { emptyState, setStatus, setNote } from '../js/state.js';
import { buildReport } from '../js/report.js';

const data = { CHECKLIST, SOURCES, PROJECT };
const DATE = new Date(2028, 11, 5);
const room = id => CHECKLIST.find(r => r.id === id);
const sala = room('sala');
const cozinha = room('cozinha');
const dkzaItem = CHECKLIST.flatMap(r => r.items).find(i => i.source === 'dkza');

test('cabeçalho', () => {
  const t = buildReport(emptyState(), data, DATE);
  assert.match(t, /^LAUDO DE VISTORIA — Estação Nogueira II$/m);
  assert.match(t, /^Data: 05\/12\/2028$/m);
  const total = CHECKLIST.reduce((n, r) => n + r.items.length, 0);
  assert.match(t, new RegExp(`^Verificados: 0/${total} · Defeitos: 0 · Pendentes: ${total}$`, 'm'));
});

test('só defeitos', () => {
  let s = setStatus(emptyState(), sala.items[0].id, 'ok');
  s = setStatus(s, sala.items[1].id, 'defeito');
  const t = buildReport(s, data, DATE);
  assert.ok(t.includes(`[ ] ${sala.items[1].what} — Responsável: Construtora`));
  assert.ok(!t.includes(`[ ] ${sala.items[0].what}`));
  assert.match(t, /Defeitos: 1/);
});

test('agrupado por ambiente na ordem do checklist', () => {
  let s = setStatus(emptyState(), cozinha.items[0].id, 'defeito');
  s = setStatus(s, sala.items[0].id, 'defeito');
  const t = buildReport(s, data, DATE);
  const a = t.indexOf('== Sala ==');
  const b = t.indexOf(`== ${cozinha.room} ==`);
  assert.ok(a > -1 && b > -1 && a < b);
  assert.equal(t.includes('== Quarto =='), false);
});

test('responsável DKZA', () => {
  const t = buildReport(setStatus(emptyState(), dkzaItem.id, 'defeito'), data, DATE);
  assert.ok(t.includes(`${dkzaItem.what} — Responsável: DKZA`));
});

test('nota multilinha e nota em branco', () => {
  let s = setStatus(emptyState(), sala.items[0].id, 'defeito');
  s = setNote(s, sala.items[0].id, 'a\nb');
  s = setStatus(s, sala.items[1].id, 'defeito');
  s = setNote(s, sala.items[1].id, '   ');
  const lines = buildReport(s, data, DATE).split('\n');
  const i = lines.indexOf('    Obs.: a');
  assert.ok(i > -1);
  assert.equal(lines[i + 1], '          b');
  assert.equal(lines.filter(l => l.includes('Obs.:')).length, 1);
});

test('estado vazio', () => {
  const t = buildReport(emptyState(), data, DATE);
  assert.ok(t.includes('Nenhum defeito registrado.'));
  assert.match(t, /^PENDENTES \(não verificados\): \d+ itens — Documentos a receber: \d+/m);
  assert.ok(t.includes('Promessa cl. 11ª §4'));
});

test('sem pendentes não mostra linha PENDENTES', () => {
  let s = emptyState();
  for (const r of CHECKLIST) for (const i of r.items) s = setStatus(s, i.id, 'ok');
  assert.ok(!buildReport(s, data, DATE).includes('PENDENTES'));
});

test('id órfão ignorado', () => {
  const t = buildReport(setStatus(emptyState(), 'nao-existe', 'defeito'), data, DATE);
  assert.match(t, /Defeitos: 0/);
  assert.ok(t.includes('Nenhum defeito registrado.'));
});
