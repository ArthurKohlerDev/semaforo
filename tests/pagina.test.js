import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('página contém as quatro abas e os dois gêmeos digitais', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['visao-geral','semaforo1','semaforo2','comunicacao','gemeo-semaforo1','gemeo-semaforo2']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /mqtt\.min\.js/);
  assert.match(html, /type="module"/);
});
