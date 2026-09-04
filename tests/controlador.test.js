import test from 'node:test';
import assert from 'node:assert/strict';
import { ControladorCruzamento } from '../js/ControladorCruzamento.js';

test('controlador nunca permite dois verdes', () => {
  const controle = new ControladorCruzamento();
  controle.comandoManual('semaforo1', 'verde');
  assert.throws(() => controle.comandoManual('semaforo2', 'verde'), /segurança/i);
});

test('sequência inclui amarelo e intervalo com ambos vermelhos', () => {
  const controle = new ControladorCruzamento();
  assert.deepEqual(controle.obterEtapas().map(e => [e.s1, e.s2]), [
    ['verde','vermelho'], ['amarelo','vermelho'], ['vermelho','vermelho'],
    ['vermelho','verde'], ['vermelho','amarelo'], ['vermelho','vermelho']
  ]);
});
