import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHECKLIST, SOURCES, PROJECT } from '../js/data.js';
import { emptyState, setStatus, setNote } from '../js/state.js';
import { buildReportHtml } from '../js/report-html.js';

const data = { CHECKLIST, SOURCES, PROJECT };
const DATE = new Date(2028, 11, 5);
const room = id => CHECKLIST.find(r => r.id === id);
const sala = room('sala');
const cozinha = room('cozinha');
const docs = room('documentos');
const dkzaItem = cozinha.items.find(i => i.source === 'dkza');
const stat = (html, k) => Number(html.match(new RegExp(`data-stat="${k}">(\\d+)<`))?.[1]);

test('cabeçalho, data e campos para preencher à mão', () => {
  const h = buildReportHtml(emptyState(), data, DATE);
  assert.match(h, /Laudo de Vistoria de Entrega/);
  assert.ok(h.includes('Estação Nogueira II'));
  assert.ok(h.includes('05/12/2028'));
  for (const f of ['Proprietário', 'Unidade', 'Representante da construtora']) assert.ok(h.includes(f), f);
});

test('resumo com contagens e defeitos por responsável', () => {
  let s = setStatus(emptyState(), sala.items[0].id, 'defeito');
  s = setStatus(s, dkzaItem.id, 'defeito');
  s = setStatus(s, sala.items[1].id, 'ok');
  s = setStatus(s, sala.items[2].id, 'na');
  const h = buildReportHtml(s, data, DATE);
  const total = CHECKLIST.reduce((n, r) => n + r.items.length, 0);
  assert.equal(stat(h, 'total'), total);
  assert.equal(stat(h, 'done'), 4);
  assert.equal(stat(h, 'ok'), 1);
  assert.equal(stat(h, 'defeito'), 2);
  assert.equal(stat(h, 'pendentes'), total - 4);
  assert.equal(stat(h, 'defeito-construtora'), 1);
  assert.equal(stat(h, 'defeito-dkza'), 1);
});

test('defeitos agrupados por ambiente na ordem do checklist, com responsável e coluna de correção', () => {
  let s = setStatus(emptyState(), cozinha.items[0].id, 'defeito');
  s = setStatus(s, sala.items[0].id, 'defeito');
  s = setStatus(s, dkzaItem.id, 'defeito');
  const h = buildReportHtml(s, data, DATE);
  const a = h.indexOf('>Sala<');
  const b = h.indexOf(`>${cozinha.room}<`);
  assert.ok(a > -1 && b > -1 && a < b);
  assert.ok(!h.includes('>Quarto<'));
  assert.ok(h.includes('Corrigido em'));
  assert.match(h, /class="badge badge-dkza">DKZA</);
  assert.match(h, /class="badge badge-construtora">Construtora</);
});

test('numeração sequencial dos defeitos', () => {
  let s = setStatus(emptyState(), sala.items[0].id, 'defeito');
  s = setStatus(s, cozinha.items[0].id, 'defeito');
  const h = buildReportHtml(s, data, DATE);
  assert.match(h, /<td class="num">1<\/td>[\s\S]*<td class="num">2<\/td>/);
});

test('escapa texto do usuário e converte quebras de linha', () => {
  let s = setStatus(emptyState(), sala.items[0].id, 'defeito');
  s = setNote(s, sala.items[0].id, '<script>alert(1)</script>\nlinha 2');
  const h = buildReportHtml(s, data, DATE);
  assert.ok(!h.includes('<script>'));
  assert.ok(h.includes('&lt;script&gt;alert(1)&lt;/script&gt;<br>linha 2'));
});

test('documentos com situação e fora da tabela de defeitos', () => {
  let s = setStatus(emptyState(), docs.items[0].id, 'ok');
  s = setStatus(s, docs.items[1].id, 'defeito');
  s = setNote(s, docs.items[1].id, 'sem carimbo');
  const h = buildReportHtml(s, data, DATE);
  const docSec = h.slice(h.indexOf('data-section="documentos"'), h.indexOf('data-section="defeitos"'));
  assert.ok(docSec.includes(docs.items[0].what) && docSec.includes('Recebido'));
  assert.ok(docSec.includes('Com problema') && docSec.includes('sem carimbo'));
  assert.ok(docSec.includes('Pendente'));
  const defSec = h.slice(h.indexOf('data-section="defeitos"'));
  assert.ok(!defSec.includes(`>${docs.room}<`));
});

test('sem defeitos', () => {
  assert.ok(buildReportHtml(emptyState(), data, DATE).includes('Nenhum defeito registrado'));
});

test('pendentes por ambiente e omissão quando não há', () => {
  const h = buildReportHtml(emptyState(), data, DATE);
  assert.ok(h.includes('data-section="pendentes"'));
  assert.ok(h.includes(`${sala.room}: ${sala.items.length}`));
  let s = emptyState();
  for (const r of CHECKLIST) for (const i of r.items) s = setStatus(s, i.id, 'ok');
  assert.ok(!buildReportHtml(s, data, DATE).includes('data-section="pendentes"'));
});

test('base contratual e assinaturas', () => {
  const h = buildReportHtml(emptyState(), data, DATE);
  assert.ok(h.includes('cl. 11ª §4') && h.includes('NBR 15.575'));
  const sig = h.slice(h.indexOf('data-section="assinaturas"'));
  for (const p of ['Proprietário', 'Construtora', 'DKZA']) assert.ok(sig.includes(p), p);
});

test('id órfão ignorado', () => {
  const h = buildReportHtml(setStatus(emptyState(), 'nao-existe', 'defeito'), data, DATE);
  assert.equal(stat(h, 'defeito'), 0);
});
