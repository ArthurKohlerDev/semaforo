export class Semaforo {
  constructor(id, tempos = {}) {
    this.id = id;
    this.cor = 'vermelho';
    this.tempoRestante = 0;
    this.conectado = false;
    this.atualizadoEm = new Date().toISOString();
    this.tempos = { verde: 10, amarelo: 3, vermelho: 10 };
    this.definirTempos({ ...this.tempos, ...tempos });
  }

  definirTempos(tempos) {
    const limitar = valor => Math.min(120, Math.max(1, Number(valor) || 1));
    this.tempos = {
      verde: limitar(tempos.verde),
      amarelo: limitar(tempos.amarelo),
      vermelho: limitar(tempos.vermelho)
    };
    this.atualizadoEm = new Date().toISOString();
  }

  mudarCor(cor, tempo = 0) {
    if (!['vermelho', 'amarelo', 'verde', 'alerta'].includes(cor)) throw new Error('Cor inválida');
    this.cor = cor;
    this.tempoRestante = Math.max(0, Number(tempo) || 0);
    this.atualizadoEm = new Date().toISOString();
  }

  obterEstado() {
    return { dispositivo: this.id, cor: this.cor, tempoRestante: this.tempoRestante,
      conectado: this.conectado, atualizadoEm: this.atualizadoEm };
  }
}
