export class MqttService {
  constructor({ turma = 'si', equipe = 'equipe01', cliente = null, aoStatus = () => {}, aoMensagem = () => {} } = {}) {
    this.turma = turma; this.equipe = equipe; this.cliente = cliente;
    this.aoStatus = aoStatus; this.aoMensagem = aoMensagem;
  }

  criarTopico(dispositivo, categoria) {
    return `aps1/semaforo/${this.turma}/${this.equipe}/${dispositivo}/${categoria}`;
  }

  conectar() {
    if (this.cliente) return;
    if (!globalThis.mqtt) { this.aoStatus(false, 'Biblioteca MQTT indisponível'); return; }
    this.cliente = globalThis.mqtt.connect('wss://test.mosquitto.org:8081/mqtt', {
      clientId: `painel_${this.equipe}_${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 3000
    });
    this.cliente.on('connect', () => {
      this.aoStatus(true, 'Conectado');
      this.cliente.subscribe(`aps1/semaforo/${this.turma}/${this.equipe}/+/+`);
    });
    this.cliente.on('reconnect', () => this.aoStatus(false, 'Reconectando...'));
    this.cliente.on('offline', () => this.aoStatus(false, 'Offline - ciclo local ativo'));
    this.cliente.on('error', erro => this.aoStatus(false, erro.message));
    this.cliente.on('message', (topico, mensagem) => {
      try { this.aoMensagem(topico, JSON.parse(mensagem.toString())); }
      catch { this.aoMensagem(topico, { mensagem: mensagem.toString() }); }
    });
  }

  publicar(dispositivo, categoria, dados) {
    if (!this.cliente?.connected) return false;
    this.cliente.publish(this.criarTopico(dispositivo, categoria), JSON.stringify(dados));
    return true;
  }

  desconectar() { this.cliente?.end?.(); this.cliente = null; }
}
