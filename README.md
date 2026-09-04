# Semáforo Inteligente

Simulador web com dois semáforos sincronizados, gêmeo digital, abas e MQTT via WebSocket.

## Como executar

Não abra o arquivo HTML diretamente. Use um servidor local.

### VS Code

1. Abra a pasta 'semaforo'.
2. Instale a extensão Live Server.
3. Clique com o botão direito em 'index.html'.
4. Escolha Open with Live Server.

### Terminal

Com Node.js: 'npx serve .'

Com Python: 'python -m http.server 8000'

Depois abra 'http://localhost:8000'.

## Testes

Execute 'npm test'.

## Demonstração em abas separadas

- Visão geral: 'http://localhost:8000/?aba=visao-geral'
- Semáforo 1: 'http://localhost:8000/?aba=semaforo1'
- Semáforo 2: 'http://localhost:8000/?aba=semaforo2'
- MQTT: 'http://localhost:8000/?aba=comunicacao'

Use a mesma turma e equipe em todos os computadores.

## Arquivos principais

- 'index.html': estrutura das abas.
- 'css/main.css': estilo e responsividade.
- 'js/Semaforo.js': modelo de um semáforo.
- 'js/ControladorCruzamento.js': ciclo e segurança.
- 'js/MqttService.js': conexão e tópicos.
- 'js/Interface.js': atualização da página.
- 'js/main.js': inicialização.
- 'GUIA-DE-ESTUDO.md': explicação para a apresentação.
