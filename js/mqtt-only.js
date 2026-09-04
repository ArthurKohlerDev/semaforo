import { Semaforo } from './Semaforo.js';
import { MqttService } from './MqttService.js';

const turma = localStorage.getItem('mqtt-turma') || 'si';
const equipe = localStorage.getItem('mqtt-equipe') || 'equipe01';

const semaforo1 = new Semaforo('semaforo1');
const semaforo2 = new Semaforo('semaforo2');

function criarHtmlSemaforo(estado) {
  const hora = new Date(
    estado.atualizadoEm
  ).toLocaleTimeString('pt-BR');

  return `
    <div class="semaforo">
      <div class="luz vermelho ${
        estado.cor === 'vermelho' ? 'ligada' : ''
      }"></div>

      <div class="luz amarelo ${
        estado.cor === 'amarelo' ? 'ligada' : ''
      }"></div>

      <div class="luz verde ${
        estado.cor === 'verde' ? 'ligada' : ''
      }"></div>
    </div>

    <div class="dados">
      <div>
        <strong>${estado.cor}</strong>
        <span>Estado</span>
      </div>

      <div>
        <strong>${hora}</strong>
        <span>Atualização</span>
      </div>
    </div>
  `;
}

function atualizarTela() {
  document.querySelector('#mqtt-semaforo1').innerHTML =
    criarHtmlSemaforo(semaforo1.obterEstado());

  document.querySelector('#mqtt-semaforo2').innerHTML =
    criarHtmlSemaforo(semaforo2.obterEstado());
}

function atualizarStatus(conectado, texto) {
  const elemento = document.querySelector('#status-conexao');

  elemento.className =
    `status ${conectado ? 'online' : 'offline'}`;

  elemento.innerHTML = `<span></span> ${texto}`;
}

function registrarMensagem(dispositivo, mensagem) {
  document.querySelector('#mensagem-mqtt').innerHTML = `
    <div class="evento">
      <time>${new Date().toLocaleTimeString('pt-BR')}</time>
      <strong>${dispositivo}</strong> · ${mensagem}
    </div>
  `;
}

const mqttService = new MqttService({
  turma,
  equipe,

  aoStatus: (conectado, texto) => {
    atualizarStatus(conectado, texto);
  },

  aoMensagem: (topico, dados) => {
    const partes = topico.split('/');
    const dispositivo = partes.at(-2);
    const categoria = partes.at(-1);

    // Ignora mensagens que não sejam comandos
    if (categoria !== 'comando') {
      return;
    }

    const semaforos = {
      semaforo1,
      semaforo2
    };

    const semaforo = semaforos[dispositivo];

    if (!semaforo) {
      registrarMensagem(
        dispositivo,
        'Dispositivo desconhecido'
      );

      return;
    }

    try {
      const cor = String(dados.cor || '').toLowerCase();

      if (!['vermelho', 'amarelo', 'verde'].includes(cor)) {
        throw new Error('Cor inválida');
      }

      // Regra de segurança
      const outro =
        dispositivo === 'semaforo1'
          ? semaforo2
          : semaforo1;

      if (cor === 'verde' && outro.cor === 'verde') {
        throw new Error(
          'Comando bloqueado: o outro semáforo está verde'
        );
      }

      semaforo.mudarCor(cor);
      atualizarTela();

      registrarMensagem(
        dispositivo,
        `Cor alterada para ${cor}`
      );

      // Publica o novo estado como confirmação
      mqttService.publicar(
        dispositivo,
        'estado',
        semaforo.obterEstado()
      );
    } catch (erro) {
      registrarMensagem(
        dispositivo,
        `Comando recusado: ${erro.message}`
      );
    }
  }
});

atualizarTela();
mqttService.conectar();