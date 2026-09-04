import { ControladorCruzamento } from './ControladorCruzamento.js';
import { MqttService } from './MqttService.js';
import { Interface } from './Interface.js';

const turma=localStorage.getItem('mqtt-turma')||'si';
const equipe=localStorage.getItem('mqtt-equipe')||'equipe01';
let interfaceWeb;
const mqttService=new MqttService({turma,equipe,aoStatus:(online,texto)=>interfaceWeb?.atualizarStatus(online,texto),aoMensagem:(topico,dados)=>interfaceWeb?.registrar('mqtt',topico.split('/').at(-2),JSON.stringify(dados))});
const controlador=new ControladorCruzamento({aoAtualizar:(s1,s2)=>interfaceWeb?.atualizar(s1,s2)});
interfaceWeb=new Interface(controlador,mqttService);
for(const id of ['semaforo1','semaforo2']){const salvos=JSON.parse(localStorage.getItem(`${id}-tempos`)||'null');if(salvos)controlador[id].definirTempos(salvos)}
interfaceWeb.iniciar();
document.querySelector('#mqtt-turma').value=turma;
document.querySelector('#mqtt-equipe').value=equipe;
document.querySelector('#salvar-mqtt').addEventListener('click',()=>{localStorage.setItem('mqtt-turma',document.querySelector('#mqtt-turma').value);localStorage.setItem('mqtt-equipe',document.querySelector('#mqtt-equipe').value);location.reload()});
document.querySelector('#reconectar').addEventListener('click',()=>{mqttService.desconectar();mqttService.conectar()});
document.querySelector('#topicos-mqtt').textContent=['estado','comando','configuracao','falha','sincronizacao'].map(tipo=>mqttService.criarTopico('<dispositivo>',tipo)).join('\n');
mqttService.conectar();
controlador.iniciar();
