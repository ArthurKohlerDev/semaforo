import { ControladorCruzamento } from './ControladorCruzamento.js';
import { MqttService } from './MqttService.js';
import { Interface } from './Interface.js';
import { Semaforo } from './Semaforo.js';

const turma = localStorage.getItem('mqtt-turma') || 'si';
const equipe = localStorage.getItem('mqtt-equipe') || 'equipe01';


let interfaceWeb;
let controlador;

const semaforoMqtt1 = new Semaforo('semaforo1');
const semaforoMqtt2 = new Semaforo('semaforo2');

function atualizarSemaforosMqtt() {
  document.querySelector('#mqtt-semaforo1').innerHTML =
    interfaceWeb.htmlGemeo(semaforoMqtt1.obterEstado());

  document.querySelector('#mqtt-semaforo2').innerHTML =
    interfaceWeb.htmlGemeo(semaforoMqtt2.obterEstado());
}

function registrarComandoMqtt(dispositivo, mensagem) {
  document.querySelector('#ultimo-comando-mqtt').innerHTML = `
    <div class="evento">
      <time>${new Date().toLocaleTimeString('pt-BR')}</time>
      <strong>${dispositivo}</strong> · ${mensagem}
    </div>
  `;
}

const mqttService = new MqttService({
  turma,
  equipe,

  aoStatus: (online, texto) => {
    interfaceWeb?.atualizarStatus(online, texto);
  },

  aoMensagem: (topico, dados) => {
  const partes = topico.split('/');
  const dispositivo = partes.at(-2);
  const categoria = partes.at(-1);

  interfaceWeb?.registrar(
    'mqtt',
    dispositivo,
    JSON.stringify(dados)
  );

  // Apenas comandos controlam a aba MQTT
  if (categoria !== 'comando') {
    return;
  }

  const semaforosMqtt = {
    semaforo1: semaforoMqtt1,
    semaforo2: semaforoMqtt2
  };

  const semaforo = semaforosMqtt[dispositivo];

  if (!semaforo) {
    return;
  }

  try {
    const cor = String(dados.cor || '').toLowerCase();

    if (!['vermelho', 'amarelo', 'verde'].includes(cor)) {
      throw new Error('Cor inválida');
    }

    const outro =
      dispositivo === 'semaforo1'
        ? semaforoMqtt2
        : semaforoMqtt1;

    if (cor === 'verde' && outro.cor === 'verde') {
      throw new Error(
        'O outro semáforo já está verde'
      );
    }

    semaforo.mudarCor(cor);
    atualizarSemaforosMqtt();

    registrarComandoMqtt(
      dispositivo,
      `Cor alterada para ${cor}`
    );
  } catch (erro) {
    registrarComandoMqtt(
      dispositivo,
      `Comando recusado: ${erro.message}`
    );
  }
}
});

controlador = new ControladorCruzamento({
  aoAtualizar: (s1, s2) => {
    interfaceWeb?.atualizar(s1, s2);
  }
});

interfaceWeb = new Interface(controlador, mqttService);

// Recupera os tempos salvos
for (const id of ['semaforo1', 'semaforo2']) {
  const salvos = JSON.parse(
    localStorage.getItem(`${id}-tempos`) || 'null'
  );

  if (salvos) {
    controlador[id].definirTempos(salvos);
  }
}

interfaceWeb.iniciar();
atualizarSemaforosMqtt();

document.querySelector('#mqtt-turma').value = turma;
document.querySelector('#mqtt-equipe').value = equipe;

document
  .querySelector('#salvar-mqtt')
  .addEventListener('click', () => {
    localStorage.setItem(
      'mqtt-turma',
      document.querySelector('#mqtt-turma').value
    );

    localStorage.setItem(
      'mqtt-equipe',
      document.querySelector('#mqtt-equipe').value
    );

    location.reload();
  });

document
  .querySelector('#reconectar')
  .addEventListener('click', () => {
    mqttService.desconectar();
    mqttService.conectar();
  });

document.querySelector('#topicos-mqtt').textContent = [
  'estado',
  'comando',
  'configuracao',
  'falha',
  'sincronizacao'
]
  .map(tipo => mqttService.criarTopico('<dispositivo>', tipo))
  .join('\n');

mqttService.conectar();
controlador.iniciar();