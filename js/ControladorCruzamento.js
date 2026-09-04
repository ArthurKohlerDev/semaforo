import { Semaforo } from './Semaforo.js';

export class ControladorCruzamento {
  constructor({ intervaloSeguranca = 2, aoAtualizar = () => {} } = {}) {
    this.semaforo1 = new Semaforo('semaforo1');
    this.semaforo2 = new Semaforo('semaforo2');
    this.intervaloSeguranca = intervaloSeguranca;
    this.aoAtualizar = aoAtualizar;
    this.executando = false;
    this.alerta = false;
    this.timer = null;
  }

  obterEtapas() {
    const t1 = this.semaforo1.tempos, t2 = this.semaforo2.tempos;
    return [
      { s1:'verde', s2:'vermelho', duracao:t1.verde },
      { s1:'amarelo', s2:'vermelho', duracao:t1.amarelo },
      { s1:'vermelho', s2:'vermelho', duracao:this.intervaloSeguranca },
      { s1:'vermelho', s2:'verde', duracao:t2.verde },
      { s1:'vermelho', s2:'amarelo', duracao:t2.amarelo },
      { s1:'vermelho', s2:'vermelho', duracao:this.intervaloSeguranca }
    ];
  }

  comandoManual(id, cor) {
    const alvo = id === 'semaforo1' ? this.semaforo1 : this.semaforo2;
    const outro = id === 'semaforo1' ? this.semaforo2 : this.semaforo1;
    if (cor === 'verde' && outro.cor === 'verde') throw new Error('Comando bloqueado por segurança');
    alvo.mudarCor(cor, alvo.tempos[cor] || 0);
    this.notificar();
  }

  aplicarEtapa(etapa) {
    this.semaforo1.mudarCor(etapa.s1, etapa.duracao);
    this.semaforo2.mudarCor(etapa.s2, etapa.duracao);
    this.notificar();
  }

  notificar() { this.aoAtualizar(this.semaforo1.obterEstado(), this.semaforo2.obterEstado()); }

  iniciar() {
    if (this.executando) return;
    this.executando = true;
    let indice = 0;
    const executar = () => {
      if (!this.executando) return;
      if (this.alerta) {
        const cor = this.semaforo1.cor === 'amarelo' ? 'vermelho' : 'amarelo';
        this.semaforo1.mudarCor(cor); this.semaforo2.mudarCor(cor); this.notificar();
        this.timer = setTimeout(executar, 500); return;
      }
      const etapa = this.obterEtapas()[indice];
      this.aplicarEtapa(etapa);
      let restante = etapa.duracao;
      this.timer = setInterval(() => {
        restante -= 1;
        this.semaforo1.tempoRestante = restante; this.semaforo2.tempoRestante = restante; this.notificar();
        if (restante <= 0) { clearInterval(this.timer); indice = (indice + 1) % 6; executar(); }
      }, 1000);
    };
    executar();
  }

  parar() { this.executando = false; clearTimeout(this.timer); clearInterval(this.timer); }
  alternarAlerta() { this.alerta = !this.alerta; clearTimeout(this.timer); clearInterval(this.timer); this.executando = false; this.iniciar(); return this.alerta; }
}
