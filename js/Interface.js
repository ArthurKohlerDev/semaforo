export class Interface {
  constructor(controlador,mqtt){this.controlador=controlador;this.mqtt=mqtt;this.historico=[]}

  iniciar(){
    this.criarControles('semaforo1');this.criarControles('semaforo2');
    document.querySelectorAll('.aba').forEach(botao=>botao.addEventListener('click',()=>this.abrirAba(botao.dataset.aba)));
    document.querySelector('#alternar-alerta').addEventListener('click',evento=>{const ativo=this.controlador.alternarAlerta();evento.target.textContent=ativo?'Desativar modo alerta':'Ativar modo alerta';this.registrar('painel','cruzamento',ativo?'alerta ativado':'alerta desativado')});
    document.querySelector('#limpar-historico').addEventListener('click',()=>{this.historico=[];this.renderizarHistorico()});
    const aba=new URLSearchParams(location.search).get('aba');if(document.getElementById(aba))this.abrirAba(aba);
  }

  abrirAba(id){
    document.querySelectorAll('.pagina,.aba').forEach(elemento=>elemento.classList.remove('ativa'));
    document.getElementById(id).classList.add('ativa');
    document.querySelector(`[data-aba="${id}"]`).classList.add('ativa');
    history.replaceState({},'',`?aba=${id}`);
  }

  htmlGemeo(estado){
    const hora=new Date(estado.atualizadoEm).toLocaleTimeString('pt-BR');
    return `<div class="semaforo"><div class="luz vermelho ${estado.cor==='vermelho'?'ligada':''}"></div><div class="luz amarelo ${estado.cor==='amarelo'?'ligada':''}"></div><div class="luz verde ${estado.cor==='verde'?'ligada':''}"></div></div><div class="dados"><div><strong>${estado.cor}</strong><span>Estado</span></div><div><strong>${estado.tempoRestante}s</strong><span>Restante</span></div><div><strong>${hora}</strong><span>Atualização</span></div></div>`;
  }

  atualizar(s1,s2){
    for(const estado of [s1,s2]){
      document.querySelector(`#gemeo-${estado.dispositivo}`).innerHTML=this.htmlGemeo(estado);
      document.querySelector(`#detalhe-${estado.dispositivo}`).innerHTML=this.htmlGemeo(estado);
      this.mqtt.publicar(estado.dispositivo,'estado',estado);
    }
  }

  criarControles(id){
    const semaforo=this.controlador[id];
    const area=document.querySelector(`#controles-${id}`);
    area.innerHTML=`<h3>Configuração e comandos</h3><div class="campo"><label>Tempo verde (1–120 s)<input data-tempo="verde" type="number" min="1" max="120" value="${semaforo.tempos.verde}"></label></div><div class="campo"><label>Tempo amarelo (1–120 s)<input data-tempo="amarelo" type="number" min="1" max="120" value="${semaforo.tempos.amarelo}"></label></div><button class="botao primario salvar">Salvar tempos</button><h3>Comando manual</h3><div class="linha-botoes"><button class="botao comando" data-cor="vermelho">Vermelho</button><button class="botao comando" data-cor="amarelo">Amarelo</button><button class="botao comando" data-cor="verde">Verde</button></div><p class="mensagem"></p>`;
    area.querySelector('.salvar').addEventListener('click',()=>{semaforo.definirTempos({vermelho:semaforo.tempos.vermelho,verde:area.querySelector('[data-tempo="verde"]').value,amarelo:area.querySelector('[data-tempo="amarelo"]').value});localStorage.setItem(`${id}-tempos`,JSON.stringify(semaforo.tempos));this.mqtt.publicar(id,'configuracao',semaforo.tempos);this.registrar('painel',id,'tempos atualizados')});
    area.querySelectorAll('.comando').forEach(botao=>botao.addEventListener('click',()=>{try{this.controlador.comandoManual(id,botao.dataset.cor);area.querySelector('.mensagem').textContent='Comando executado com segurança.';this.mqtt.publicar(id,'comando',{cor:botao.dataset.cor});this.registrar('painel',id,`comando: ${botao.dataset.cor}`)}catch(erro){area.querySelector('.mensagem').textContent=erro.message;this.registrar('painel',id,erro.message)}}));
  }

  atualizarStatus(conectado,texto){const elemento=document.querySelector('#status-conexao');elemento.className=`status ${conectado?'online':'offline'}`;elemento.innerHTML=`<span></span> ${texto}`}
  registrar(origem,dispositivo,mensagem){this.historico.unshift({hora:new Date().toLocaleTimeString('pt-BR'),origem,dispositivo,mensagem});this.historico=this.historico.slice(0,50);this.renderizarHistorico()}
  renderizarHistorico(){const lista=document.querySelector('#lista-historico');lista.innerHTML=this.historico.length?this.historico.map(evento=>`<div class="evento"><time>${evento.hora}</time><strong>${evento.dispositivo}</strong> · ${evento.mensagem}</div>`).join(''):'<p class="vazio">Aguardando mensagens...</p>'}
}
