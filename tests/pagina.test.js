import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('página contém as abas principais, cadastro e monitoramento', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const id of ['visao-geral','semaforos-funcionamento','semaforo1','semaforo2','comunicacao','novo-semaforo','gemeo-semaforo1','gemeo-semaforo2','form-novo-semaforo','lista-semaforos-funcionamento']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /mqtt\.min\.js/);
  assert.match(html, /type="module"/);
  assert.match(html, /Registrar novo semáforo/);
});
