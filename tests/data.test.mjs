import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as data from '../js/data.js';

const { SOURCES, DELIVERY, CHECKLIST, TOOLS, REMINDERS, ALL_CHECK_ITEMS, PROJECT } = data;

function assertUnique(ids, label) {
  const seen = new Set();
  for (const id of ids) {
    assert.ok(id, `${label}: id vazio`);
    assert.ok(!seen.has(id), `${label}: id duplicado ${id}`);
    seen.add(id);
  }
}

test('ids únicos', () => {
  assertUnique(DELIVERY.map(c => c.id), 'categorias');
  assertUnique(DELIVERY.flatMap(c => c.items.map(i => i.id)), 'itens de entrega');
  assertUnique(CHECKLIST.map(r => r.id), 'ambientes');
  assertUnique(CHECKLIST.flatMap(r => r.items.map(i => i.id)), 'itens de checklist');
  assertUnique(TOOLS.map(t => t.id), 'ferramentas');
  assertUnique(REMINDERS.map(r => r.id), 'lembretes');
});

test('campos obrigatórios', () => {
  for (const c of DELIVERY) {
    assert.ok(c.category, `categoria sem nome: ${c.id}`);
    for (const i of c.items) {
      for (const f of ['text', 'source', 'ref']) assert.ok(i[f]?.trim(), `${i.id} sem ${f}`);
    }
  }
  for (const r of CHECKLIST) {
    assert.ok(r.room?.trim(), `ambiente sem nome: ${r.id}`);
    assert.ok(r.items.length > 0, `ambiente vazio: ${r.id}`);
    for (const i of r.items) {
      for (const f of ['what', 'how', 'source']) assert.ok(i[f]?.trim(), `${i.id} sem ${f}`);
    }
  }
  for (const t of TOOLS) {
    assert.ok(t.name?.trim() && t.use?.trim(), `ferramenta incompleta: ${t.id}`);
    assert.equal(typeof t.essential, 'boolean');
  }
  for (const r of REMINDERS) {
    for (const f of ['title', 'detail', 'ref']) assert.ok(r[f]?.trim(), `${r.id} sem ${f}`);
  }
});

test('source válido', () => {
  const valid = Object.keys(SOURCES);
  assert.deepEqual(valid.sort(), ['comprador', 'construtora', 'dkza']);
  for (const i of DELIVERY.flatMap(c => c.items)) assert.ok(valid.includes(i.source), `${i.id}: ${i.source}`);
  for (const i of ALL_CHECK_ITEMS) assert.ok(valid.includes(i.source), `${i.id}: ${i.source}`);
});

test('tools existem', () => {
  const ids = new Set(TOOLS.map(t => t.id));
  for (const i of ALL_CHECK_ITEMS) for (const t of i.tools ?? []) assert.ok(ids.has(t), `${i.id}: ferramenta ${t}`);
});

test('primeira sala é documentos', () => {
  assert.equal(CHECKLIST[0].id, 'documentos');
});

test('salas obrigatórias', () => {
  const ids = CHECKLIST.map(r => r.id);
  for (const id of ['documentos', 'instalacoes', 'sala', 'quarto', 'suite', 'circulacao',
    'banheiro-social', 'banheiro-suite', 'cozinha', 'varanda', 'garden']) {
    assert.ok(ids.includes(id), `falta ${id}`);
  }
});

test('ferramentas essenciais', () => {
  assert.ok(TOOLS.filter(t => t.essential).length >= 10);
});

test('itens do spec 6.5 presentes', () => {
  const byId = Object.fromEntries(ALL_CHECK_ITEMS.map(i => [i.id, i]));
  assert.ok(byId['i-campainha'], 'campainha/interfone');
  assert.match(byId['i-quadro'].how, /DR/, 'DR/DPS no quadro');
  assert.match(byId['d-chaves'].what, /controles/i, 'controles nas chaves');
  for (const p of ['bs', 'bst']) {
    const s = byId[`${p}-soleira`];
    assert.ok(s, `soleira ${p}`);
    assert.equal(s.source, 'dkza');
  }
});

test('lembretes do spec', () => {
  assert.equal(REMINDERS.length, 8);
});

// Termos pessoais (nome, unidade, contas...) ficam num arquivo LOCAL, fora do Git,
// para que o próprio teste não exponha o que protege. Formato: ["regex", ...]
const PRIVATE_TERMS = new URL('./private-terms.local.json', import.meta.url);

test('sem dados pessoais', () => {
  const all = JSON.stringify(data);
  assert.doesNotMatch(all, /\d{3}\.\d{3}\.\d{3}-\d{2}/, 'CPF');
  assert.doesNotMatch(all, /R\$\s?\d{1,3}(\.\d{3})+,\d{2}/, 'valores');
  if (fs.existsSync(PRIVATE_TERMS)) {
    for (const t of JSON.parse(fs.readFileSync(PRIVATE_TERMS, 'utf8'))) {
      assert.doesNotMatch(all, new RegExp(t, 'i'), 'termo privado');
    }
  }
});

test('ALL_CHECK_ITEMS achata o checklist', () => {
  const total = CHECKLIST.reduce((n, r) => n + r.items.length, 0);
  assert.equal(ALL_CHECK_ITEMS.length, total);
  for (const i of ALL_CHECK_ITEMS) assert.ok(i.roomId && i.room);
});

test('PROJECT', () => {
  assert.equal(PROJECT.name, 'Estação Nogueira II');
});
