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

const idsReservados = new Set(['semaforo1', 'semaforo2']);

function lerSemaforosCadastrados() {
  try {
    const dados = JSON.parse(localStorage.getItem('semaforos-cadastrados') || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarSemaforosCadastrados(dados) {
  localStorage.setItem('semaforos-cadastrados', JSON.stringify(dados));
}

// Identificadores entram nos tópicos MQTT. Por isso, "Semaforo 4"
// vira "semaforo-4", evitando espaços e caracteres incompatíveis.
function normalizarIdentificador(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

function renderizarSemaforosCadastrados() {
  const lista = document.querySelector('#lista-novos-semaforos');
  if (!lista) return;
  const cadastros = lerSemaforosCadastrados();
  lista.replaceChildren();
  if (!cadastros.length) {
    lista.innerHTML = '<p class="vazio">Nenhum novo semáforo cadastrado.</p>';
    return;
  }
  for (const cadastro of cadastros) {
    const item = document.createElement('article');
    item.className = 'cadastro-item';
    item.innerHTML = `<h4>${cadastro.nome} (${cadastro.id}) <button class="remover" type="button" data-remover-cadastro="${cadastro.id}">Remover</button></h4><p>Fluxo: ${cadastro.fluxo}</p><p>Tempos: verde ${cadastro.tempos.verde}s · amarelo ${cadastro.tempos.amarelo}s · vermelho ${cadastro.tempos.vermelho}s</p>`;
    lista.append(item);
  }
}

function renderizarSemaforosFuncionamento() {
  const lista = document.querySelector('#lista-semaforos-funcionamento');
  if (!lista) return;
  const cadastros = lerSemaforosCadastrados();
  lista.replaceChildren();
  if (!cadastros.length) {
    lista.innerHTML = '<p class="vazio">Nenhum novo semáforo registrado.</p>';
    return;
  }
  for (const cadastro of cadastros) {
    const item = document.createElement('article');
    item.className = 'funcionamento-item';
    item.innerHTML = `<div class="cabecalho-funcionamento"><h4>${cadastro.nome} (${cadastro.id})</h4><span class="status-dispositivo cadastrado">Cadastrado</span></div><p>Fluxo: ${cadastro.fluxo}</p><p>Tempos: verde ${cadastro.tempos.verde}s · amarelo ${cadastro.tempos.amarelo}s · vermelho ${cadastro.tempos.vermelho}s</p><p class="observacao-dispositivo">Aguardando vínculo com dispositivo MQTT.</p>`;
    lista.append(item);
  }
}

document.querySelector('#form-novo-semaforo')?.addEventListener('submit', evento => {
  evento.preventDefault();
  const formulario = new FormData(evento.currentTarget);
  const cadastro = {
    id: normalizarIdentificador(formulario.get('id')),
    nome: String(formulario.get('nome') || '').trim(),
    fluxo: String(formulario.get('fluxo') || '').trim(),
    tempos: { verde: Number(formulario.get('verde')), amarelo: Number(formulario.get('amarelo')), vermelho: Number(formulario.get('vermelho')) }
  };
  const mensagem = document.querySelector('#mensagem-novo-semaforo');
  const valido = /^[a-z0-9_-]{1,40}$/.test(cadastro.id) && cadastro.nome && cadastro.fluxo && Object.values(cadastro.tempos).every(tempo => Number.isInteger(tempo) && tempo >= 1 && tempo <= 120);
  const cadastros = lerSemaforosCadastrados();
  if (!valido) {
    mensagem.textContent = 'Preencha os dados e use tempos inteiros entre 1 e 120 segundos.';
    mensagem.className = 'mensagem erro';
    return;
  }
  if (idsReservados.has(cadastro.id) || cadastros.some(item => item.id === cadastro.id)) {
    mensagem.textContent = 'Esse identificador já está cadastrado.';
    mensagem.className = 'mensagem erro';
    return;
  }
  salvarSemaforosCadastrados([...cadastros, cadastro]);
  evento.currentTarget.reset();
  mensagem.textContent = `Semáforo cadastrado no painel com identificador ${cadastro.id}.`;
  mensagem.className = 'mensagem sucesso';
  renderizarSemaforosCadastrados();
  renderizarSemaforosFuncionamento();
});

document.querySelector('#lista-novos-semaforos')?.addEventListener('click', evento => {
  const botao = evento.target.closest('[data-remover-cadastro]');
  if (!botao) return;
  salvarSemaforosCadastrados(lerSemaforosCadastrados().filter(item => item.id !== botao.dataset.removerCadastro));
  renderizarSemaforosCadastrados();
  renderizarSemaforosFuncionamento();
});

document.querySelector('#limpar-cadastros')?.addEventListener('click', () => {
  salvarSemaforosCadastrados([]);
  renderizarSemaforosCadastrados();
  renderizarSemaforosFuncionamento();
});

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
renderizarSemaforosCadastrados();
renderizarSemaforosFuncionamento();
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
