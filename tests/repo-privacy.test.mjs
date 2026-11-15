import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Varre TODOS os arquivos de texto versionados (README, docs, código, testes) em busca
// de dados pessoais. Termos específicos ficam em tests/private-terms.local.json (fora do Git).
const root = new URL('../', import.meta.url);
const PRIVATE_TERMS = new URL('./private-terms.local.json', import.meta.url);

function trackedTextFiles() {
  try {
    return execSync('git ls-files', { cwd: root }).toString().trim().split('\n')
      .filter(f => f && !/\.(png|jpe?g|pdf)$/i.test(f) && !f.endsWith('private-terms.local.json'));
  } catch {
    return null; // fora de um repositório git
  }
}

const GENERIC = [
  [/\d{3}\.\d{3}\.\d{3}-\d{2}/, 'CPF'],
  [/R\$\s?\d{1,3}(\.\d{3})+,\d{2}/, 'valor em reais'],
  [/pedido\s*(n[º°o]\.?\s*)?\d{2,}/i, 'número de pedido'],
];

test('nenhum arquivo versionado contém dados pessoais', t => {
  const files = trackedTextFiles();
  if (!files) return t.skip('sem git');
  const extra = fs.existsSync(PRIVATE_TERMS)
    ? JSON.parse(fs.readFileSync(PRIVATE_TERMS, 'utf8')).map(s => [new RegExp(s, 'i'), 'termo privado'])
    : [];
  const hits = [];
  for (const f of files) {
    const lines = fs.readFileSync(new URL(f, root), 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const [re, label] of [...GENERIC, ...extra]) {
        if (f === 'icons/icon.svg' && label === 'termo privado') continue; // coordenadas do desenho
        if (f === 'tests/repo-privacy.test.mjs') continue; // este arquivo define os padrões genéricos
        if (re.test(line)) hits.push(`${f}:${i + 1} (${label})`);
      }
    });
  }
  assert.deepEqual(hits, []);
});
