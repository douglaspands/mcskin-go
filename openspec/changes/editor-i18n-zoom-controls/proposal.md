# Proposal

## Why

O `mcskin` foi projetado como uma ferramenta segura, acolhedora e divertida para crianças de 6+ anos criarem e instalarem skins do Minecraft Bedrock diretamente pelo navegador, sem perigos da internet como anúncios invasivos ou vírus. 

Para expandir o alcance da ferramenta internacionalmente e aprimorar a usabilidade tátil em tablets e celulares, este conjunto de mudanças resolve 5 necessidades fundamentais:
1. **Zoom e Navegação no Editor 2D**: Atualmente a folha de textura desdobrada 2D é estática e não oferece controles visuais de zoom ou navegação livre (pan/pinch), dificultando a pintura de detalhes minuciosos.
2. **Internacionalização (i18n)**: A interface atual é 100% em português. É necessário detectar o idioma do sistema/navegador do usuário (pt-BR, es, e fallback para en) com um seletor discreto e arquitetura extensível para novos idiomas no futuro.
3. **Documentação Multilíngue**: O `README.md` (em pt-BR como principal) deve ganhar versões completas em inglês (`README.en.md`) e espanhol (`README.es.md`), destacando com ênfase as motivações de segurança e ergonomia infantil.
4. **Ergonomia do Botão Fullscreen**: O botão de Tela Cheia deve ser movido do cabeçalho superior para o rodapé do menu lateral (drawer footer), posicionado imediatamente acima do botão de desligar o servidor, unificando as ações de controle de aplicativo.
5. **Governança do Servidor via Variáveis de Ambiente**: Habilitar controle de ativação/desativação do QR Code (`MCSKIN_ENABLE_QR`) e do desligamento do servidor (`MCSKIN_ENABLE_SHUTDOWN`) pelo backend Go, essencial para quiosques, escolas e computadores compartilhados com controle parental.

## What Changes

- **Editor 2D com Zoom, Pan e Reset**:
  - Controles visuais verticais flutuantes na visualização 2D (`🔍+`, `🔍−`, `⟲ Recentrar`).
  - Suporte a navegação por arrasto (pan com 2 dedos no touch ou clique e arraste no desktop) quando a folha estiver com zoom ampliado.
  - Suporte a pinça tátil (*pinch-to-zoom*) para aproximar e afastar a folha 2D.
  - Botão de recentralização `⟲` que restaura a folha para escala 1x e posição centralizada instantaneamente.
  - 1 dedo permanece dedicado a pintar pixels com precisão milimétrica.
- **Interação 3D Híbrida Inteligente**:
  - Mantém o botão de segurança `[ 🖐️ Girar | 🖌️ Pintar ]` essencial para crianças pequenas.
  - Permite rotação e pinça de zoom com 2 dedos mesmo quando o modo `Pintar` estiver ativo, oferecendo agilidade a usuários com mais destreza motora.
- **Sistema de Internacionalização Frontend (i18n)**:
  - Criação do módulo modular `internal/web/static/js/i18n.js` com suporte aos idiomas Português do Brasil (`pt-BR`), Espanhol (`es`) e Inglês (`en`).
  - Detecção automática baseada no sistema operacional / navegador (`navigator.languages` / `navigator.language`), ativando `pt-BR` se o prefixo for `pt`, `es` se for `es`, e `en` como fallback universal para qualquer outro idioma.
  - Seletor discreto e elegante de idioma no menu lateral (`[ PT | EN | ES ]`), salvando a preferência no `localStorage`.
  - Dicionário extensível para futuros idiomas sem impacto no código central.
- **Reposicionamento do Botão Fullscreen**:
  - Remoção do botão de tela cheia do cabeçalho superior (`header-right-actions`).
  - Inclusão do botão no rodapé do drawer (`drawer-footer`), posicionado imediatamente acima do botão de desligar o servidor.
- **Controle de QR Code e Desligamento no Backend**:
  - Leitura das variáveis de ambiente `MCSKIN_ENABLE_QR` (default: `true`) e `MCSKIN_ENABLE_SHUTDOWN` (default: `true`) no Go.
  - Inclusão dos estados booleanos no endpoint `/api/info` (`enableQr`, `enableShutdown`).
  - Bloqueio no endpoint `/api/shutdown`: retorna `403 Forbidden` com mensagem explicativa se o desligamento estiver desativado.
  - Ocultação reativa do card de QR Code e/ou do botão de desligar na interface web quando desativados.
- **README nos 3 Idiomas com Destaque Infantil**:
  - Atualização do `README.md` (pt-BR principal) ressaltando ainda mais o compromisso com as crianças de 6+ anos e adicionando barra de alternância de idioma no topo.
  - Criação de `README.en.md` (Inglês) e `README.es.md` (Espanhol) completos com a mesma profundidade técnica e visual.

## Capabilities

### New Capabilities
- `i18n`: Sistema modular de internacionalização frontend do aplicativo web `mcskin`, fornecendo detecção de idioma de sistema/navegador, fallback para inglês, suporte nativo a pt-BR, es e en, seletor discreto de idiomas e dicionários desacoplados extensíveis.

### Modified Capabilities
- `skin-editor`: Requisitos de viewport e touch atualizados para incluir controles de zoom, pinça (*pinch-to-zoom*), arrasto (pan) e recentralização no editor 2D, além do comportamento híbrido com 2 dedos no viewport 3D.
- `web-server`: Requisitos do servidor web e interface expandidos para incluir configuração das variáveis de ambiente `MCSKIN_ENABLE_QR` e `MCSKIN_ENABLE_SHUTDOWN`, proteção 403 no desligamento, exibição condicional na UI e reposicionamento do botão fullscreen no rodapé do menu.

## Impact

- **Backend Go**:
  - `cmd/mcskin/main.go`: Leitura das variáveis de ambiente `MCSKIN_ENABLE_QR` e `MCSKIN_ENABLE_SHUTDOWN` e passagem para a configuração do servidor web.
  - `internal/web/server.go`: Validação de permissão de desligamento no handler `/api/shutdown` (rejeitando com HTTP 403 se desativado).
  - `internal/web/network.go`: Atualização do `ServerInfo` e do endpoint `/api/info` para expor `enableQr` e `enableShutdown`.
  - `internal/web/server_test.go` e `internal/web/network_test.go`: Testes unitários com 100% de isolamento para as novas flags e proteção contra shutdown indevido.
- **Frontend Web**:
  - `internal/web/static/js/i18n.js`: Novo módulo ES6 (< 300 linhas) com dicionários de tradução e reatividade de textos e atributos.
  - `internal/web/static/js/editor2d.js` e `internal/web/static/style.css`: Suporte a escala CSS/transform, controles verticais flutuantes de zoom 2D, pinça tátil e drag/pan.
  - `internal/web/static/js/editor3d.js`: Suporte a gesto duplo de toque para rotação e pinça dentro do modo pintura.
  - `internal/web/static/index.html`: Reposicionamento do botão fullscreen para o rodapé do menu, inserção de atributos declarativos `data-i18n`, controles de zoom 2D e seletor de idiomas.
  - `internal/web/static/js/network.js` e `internal/web/static/js/shutdown.js`: Ocultação condicional dos elementos de QR Code e desligamento baseados no `/api/info`.
- **Documentação**:
  - `README.md`, `README.en.md`, `README.es.md`.
