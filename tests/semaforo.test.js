import test from 'node:test';
import assert from 'node:assert/strict';
import { Semaforo } from '../js/Semaforo.js';

test('semáforo inicia vermelho e com identificador', () => {
  const sinal = new Semaforo('semaforo1');
  assert.equal(sinal.id, 'semaforo1');
  assert.equal(sinal.cor, 'vermelho');
});

test('tempos são limitados entre 1 e 120 segundos', () => {
  const sinal = new Semaforo('s1');
  sinal.definirTempos({ verde: 0, amarelo: 200, vermelho: 8 });
  assert.deepEqual(sinal.tempos, { verde: 1, amarelo: 120, vermelho: 8 });
});
