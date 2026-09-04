# Guia de estudo - Semáforo Inteligente

## Explicação curta

O sistema simula dois semáforos de um cruzamento. O ControladorCruzamento decide as cores permitidas, a Interface mostra os estados e o MqttService troca mensagens com outras abas ou computadores.

O ciclo local continua mesmo sem internet. Quando o MQTT estiver disponível, os estados são publicados novamente.

## Ordem de inicialização

1. O navegador carrega 'index.html'.
2. O HTML carrega o CSS, MQTT.js e 'main.js'.
3. 'main.js' cria o serviço MQTT.
4. Cria o controlador e seus dois objetos Semaforo.
5. Cria a interface e liga os eventos dos botões.
6. O MQTT tenta se conectar.
7. O controlador inicia o ciclo automático.
8. Cada mudança atualiza o gêmeo digital e publica o estado.

## O que cada arquivo faz

### index.html

Guarda a estrutura da página. Existem quatro seções: visão geral, semáforo 1, semáforo 2 e comunicação. Somente a seção com a classe 'ativa' aparece.

### css/main.css

Define cores, tamanhos, cards, luzes e responsividade. As cores principais ficam nas variáveis do início do arquivo. A combinação das classes 'luz', 'ligada' e o nome da cor acende cada lâmpada.

### js/Semaforo.js

Representa um único semáforo. Guarda identificador, cor, tempo restante, configuração e última atualização.

- 'definirTempos()': valida tempos entre 1 e 120 segundos.
- 'mudarCor()': altera cor e contador.
- 'obterEstado()': devolve os dados que serão exibidos e enviados em JSON.

### js/ControladorCruzamento.js

Coordena os dois dispositivos. A sequência é:

1. Semáforo 1 verde e Semáforo 2 vermelho.
2. Semáforo 1 amarelo.
3. Ambos vermelhos no intervalo de segurança.
4. Semáforo 2 verde.
5. Semáforo 2 amarelo.
6. Ambos vermelhos novamente.

'comandoManual()' bloqueia um novo verde quando o outro sinal já está verde. 'iniciar()' usa temporizadores para executar o ciclo e atualizar o contador.

### js/MqttService.js

Centraliza a conexão MQTT. 'criarTopico()' monta o padrão:

    aps1/semaforo/<turma>/<equipe>/<dispositivo>/<categoria>

'publicar()' transforma o objeto em texto com JSON.stringify. Ao receber uma mensagem, JSON.parse transforma o texto novamente em objeto.

### js/Interface.js

Liga o JavaScript ao HTML.

- 'abrirAba()': troca a seção visível.
- 'htmlGemeo()': cria as luzes e os dados do gêmeo digital.
- 'atualizar()': atualiza os dois dispositivos.
- 'criarControles()': liga os campos e botões.
- 'registrar()': adiciona eventos ao histórico.

### js/main.js

É o ponto de entrada. Cria os objetos, conecta as partes, recupera configurações do localStorage e inicia MQTT e controlador.

## Conceitos para explicar

### Classe e objeto

Semaforo é a classe, ou seja, o modelo. semaforo1 e semaforo2 são objetos criados a partir dela.

### Importação

'import' permite usar uma classe localizada em outro arquivo.

### Callback

O controlador recebe uma função 'aoAtualizar'. Ele chama essa função quando o estado muda, sem precisar conhecer o HTML.

### Temporizadores

'setInterval' repete a contagem a cada segundo. 'setTimeout' agenda a próxima mudança no modo alerta.

### MQTT

MQTT usa publicação e assinatura. Um cliente publica em um tópico, o broker recebe e distribui para os clientes inscritos.

### WebSocket

Mantém uma conexão bidirecional entre navegador e broker. Isso permite receber mensagens sem atualizar a página.

### Gêmeo digital

É a representação virtual do dispositivo. Quando o simulador muda, as luzes, o contador e o horário mudam na tela.

## Alterações que o professor pode pedir

### Alterar o tempo verde padrão

Em 'Semaforo.js', modifique o valor 'verde: 10' dentro de 'this.tempos'.

### Alterar o intervalo de segurança

Em 'ControladorCruzamento.js', modifique 'intervaloSeguranca = 2'.

### Adicionar uma aba

1. Crie um botão com 'data-aba'.
2. Crie uma seção com o mesmo valor no 'id'.
3. O método 'abrirAba()' já reconhecerá a nova aba.

### Trocar o padrão dos tópicos

Altere somente 'criarTopico()' em 'MqttService.js'.

### Mudar uma cor

Altere as variáveis no início de 'main.css'.

### Adicionar um comando

1. Crie o botão em 'criarControles()'.
2. Adicione a regra no controlador.
3. Publique usando 'this.mqtt.publicar()'.
4. Crie um teste para a nova regra.

## Roteiro da apresentação

1. Explique os dois fluxos conflitantes.
2. Mostre o ciclo na visão geral.
3. Mostre a passagem obrigatória pelo amarelo.
4. Aponte o intervalo em que ambos ficam vermelhos.
5. Abra as abas individuais e altere um tempo.
6. Tente colocar os dois verdes e mostre o bloqueio.
7. Ative o modo alerta.
8. Mostre broker, tópicos e histórico.
9. Abra outra aba ou computador com a mesma equipe.
10. Explique que sem MQTT o ciclo local continua.

## Perguntas prováveis

**Por que separar em arquivos?** Para separar responsabilidades, facilitar testes, manutenção e explicação.

**O que impede dois verdes?** O ControladorCruzamento verifica o outro dispositivo antes de aceitar o comando.

**Por que JSON?** É leve, legível e fácil de usar com JavaScript e MQTT.

**O que acontece sem MQTT?** O painel indica offline, mas o ciclo local continua.

**Simulador e gêmeo digital são iguais?** Não. O simulador produz o comportamento; o gêmeo digital mostra esse estado virtualmente.

**Como usar ESP32 no futuro?** O ESP32 publicará e receberá nos mesmos tópicos; o painel poderá continuar o mesmo.

## Plano de estudo

- Dia 1: HTML e abas.
- Dia 2: CSS e luzes.
- Dia 3: classe Semaforo.
- Dia 4: controlador e sequência.
- Dia 5: MQTT, tópicos e JSON.
- Dia 6: pratique as alterações sugeridas.
- Dia 7: apresente tudo sem ler.
