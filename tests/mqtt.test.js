import test from 'node:test';
import assert from 'node:assert/strict';
import { MqttService } from '../js/MqttService.js';

test('monta tópico com turma, equipe, dispositivo e categoria', () => {
  const mqtt = new MqttService({ turma:'si', equipe:'arthur' });
  assert.equal(mqtt.criarTopico('semaforo1','estado'), 'aps1/semaforo/si/arthur/semaforo1/estado');
});

test('publica objeto como JSON', () => {
  let enviado;
  const cliente = { connected:true, publish:(topico,mensagem) => enviado={topico,mensagem} };
  const mqtt = new MqttService({ turma:'si', equipe:'e1', cliente });
  mqtt.publicar('semaforo1','estado',{ cor:'verde' });
  assert.deepEqual(enviado, { topico:'aps1/semaforo/si/e1/semaforo1/estado', mensagem:'{"cor":"verde"}' });
});
