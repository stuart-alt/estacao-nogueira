import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitDimensions, MAX_PER_ITEM, MAX_SIDE } from '../js/photos.js';

test('constantes', () => {
  assert.equal(MAX_PER_ITEM, 6);
  assert.equal(MAX_SIDE, 1600);
});

test('fitDimensions reduz o lado maior para o limite mantendo a proporção', () => {
  assert.deepEqual(fitDimensions(4000, 3000), { width: 1600, height: 1200 });
  assert.deepEqual(fitDimensions(3000, 4000), { width: 1200, height: 1600 });
});

test('fitDimensions não amplia imagem pequena', () => {
  assert.deepEqual(fitDimensions(800, 600), { width: 800, height: 600 });
});

test('fitDimensions arredonda e nunca devolve zero', () => {
  assert.deepEqual(fitDimensions(4001, 3), { width: 1600, height: 1 });
  assert.deepEqual(fitDimensions(1601, 1601, 1600), { width: 1600, height: 1600 });
});
