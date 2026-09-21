# Design: editor-i18n-zoom-controls

## Context

O `mcskin` combina um servidor HTTP leve em Go (padrão zero dependências) com um frontend web em ES6 modular nativo. Atualmente, a interface é hardcoded em Português (`pt-BR`), a folha 2D desdobrada não possui controles visuais de zoom ou navegação livre (pan/pinch), o botão de tela cheia fica isolado no cabeçalho superior e os recursos de QR Code e desligamento do servidor estão sempre habilitados no backend sem suporte a variáveis de ambiente.

Este documento de design estabelece as escolhas arquiteturais e a sequência TDD para implementar internacionalização, controles de zoom 2D, interação híbrida 3D touch, reposicionamento do botão fullscreen e governança das funcionalidades via variáveis de ambiente.

## Goals / Non-Goals

**Goals:**
- Implementar módulo ES6 desacoplado e extensível `internal/web/static/js/i18n.js` (< 300 linhas) suportando `pt-BR`, `es` e `en`, com detecção de idioma e seletor discreto.
- Implementar zoom suave (1x a 4x), pinça tátil (*pinch-to-zoom*), arrasto/pan e recentralização no editor 2D, mantendo acurácia pixel a pixel nos eventos de desenho.
- Permitir rotação e pinça de zoom com 2 dedos no editor 3D mesmo com o modo "Pintar" ativo, mantendo a trava infantil [ Girar | Pintar ].
- Mover o botão de Fullscreen para o rodapé do menu lateral/drawer, acima do botão de desligar o servidor.
- Controlar o QR Code e o botão de desligar servidor via variáveis de ambiente (`MCSKIN_ENABLE_QR` e `MCSKIN_ENABLE_SHUTDOWN`) com proteção 403 no backend Go e reatividade no frontend.
- Atualizar `README.md` (pt-BR) com links de idiomas e foco na usabilidade infantil (6+), gerando `README.en.md` e `README.es.md`.

**Non-Goals:**
- Não introduzir frameworks ou bibliotecas externas de i18n ou canvas (zero external dependencies).
- Não alterar os formatos de pacotes Bedrock `.mcpack` existentes ou a lógica central de conversão de skins.
- Não remover a alternância visual [ 🖐️ Girar | 🖌️ Pintar ], preservando a ergonomia protetiva para crianças pequenas.

## Decisions

### 1. Zoom e Navegação 2D: Canvas Transform & Coordinate Mapping
- **Decisão**: Controlar o zoom 2D via fator de escala (`zoomFactor2D` entre 1.0x e 4.0x) e deslocamento de pan (`panOffsetX`, `panOffsetY`), aplicando transformações CSS no container interno da folha (`#editor2DCanvas`) e calculando as coordenadas do pixel via `canvas.getBoundingClientRect()`:
  $$\text{pixelX} = \lfloor \frac{\text{clientX} - \text{rect.left}}{\text{rect.width}} \times \text{texW} \rfloor$$
- **Rationale**: Como `getBoundingClientRect()` já leva em consideração a escala CSS e o deslocamento de tela, a fórmula de mapeamento existente em `editor2d.js` permanece invariante e precisa, sem necessidade de re-renderizar a grade ou recalcular buffers a cada milissegundo de gesto.
- **Alternativas consideradas**:
  - *Redimensionar o buffer do canvas nativo (`canvas.width = 512 * zoom`)*: Descartado porque quebra limites de memória em celulares mais simples e causa cintilação no canvas durante gestos de pinça contínuos.

### 2. Gesto Duplo Híbrido no Editor 3D
- **Decisão**: Em `editor3d.js`, interceptar eventos touch com `e.touches.length === 2`:
  - Se 2 dedos forem detectados, calcular a distância para pinça (zoom na câmera Three.js) e o deslocamento do ponto médio para rotação do personagem (`viewport3D.rotX` e `viewport3D.rotY`), sem invocar `onPaintPixel`.
  - Se apenas 1 dedo for detectado: seguir estritamente o modo selecionado (`paint` pinta pixels, `rotate` gira a câmera).
- **Rationale**: Une o melhor dos dois mundos: crianças pequenas de 6 anos mantêm a segurança da trava visual [ Girar | Pintar ] sem borrar o desenho por engano, enquanto crianças maiores e pais podem desenhar e rotacionar rapidamente sem alternar botões.

### 3. Arquitetura de Internacionalização (i18n)
- **Decisão**: Criar `internal/web/static/js/i18n.js` contendo:
  - Dicionários literais indexados por código de idioma (`pt-BR`, `es`, `en`).
  - Função de tradução `t(key, params)` que busca valores com fallback para `en` se a chave estiver ausente.
  - Função `applyTranslations()` que varre o DOM atualizando nós com `data-i18n` (conteúdo de texto) e `data-i18n-attr` (atributos como `title`, `placeholder`).
  - Detecção via `navigator.languages || [navigator.language]`, checando prefixos `pt` e `es`, com fallback para `en`, e leitura prioritária de `localStorage.getItem("mcskin_lang")`.
- **Rationale**: Extremamente leve (< 300 linhas, < 15 KB), zero dependências e permite plugar novos idiomas no futuro apenas adicionando uma nova chave no objeto de traduções.

### 4. Backend Go: Variáveis de Ambiente e Feature Gating
- **Decisão**:
  - Em `cmd/mcskin/main.go`, ler `os.Getenv("MCSKIN_ENABLE_QR")` e `os.Getenv("MCSKIN_ENABLE_SHUTDOWN")`, tratando strings vazias ou valores `"1"`, `"true"`, `"yes"`, `"on"` como habilitados (`true`).
  - Em `internal/web/server.go`, estender `web.Config` com `EnableQR bool` e `EnableShutdown bool`.
  - Em `internal/web/network.go`, estender `ServerInfo` com campos JSON `"enableQr"` e `"enableShutdown"`.
  - No handler `/api/shutdown`, se `!cfg.EnableShutdown`, retornar `http.StatusForbidden` (`403`) com corpo JSON descritivo.
- **Rationale**: Garante segurança de ponta a ponta: a desativação não é apenas cosmética no frontend, mas aplicada mecanicamente na camada HTTP do servidor Go.

### 5. Layout do Drawer Footer (Fullscreen e Desligamento)
- **Decisão**: Mover o botão `#btnHeaderFullscreen` do cabeçalho superior para o rodapé do menu lateral/drawer (`drawer-footer`), renomeando ou adaptando sua classe para visual de botão de menu estilizado Minecraft (`btn-drawer-fullscreen`), posicionado imediatamente acima de `#drawerBtnShutdown`.
- **Rationale**: Libera espaço no cabeçalho para foco exclusivo na marca e abas de navegação, enquanto agrupa todas as ações de controle de aplicativo e sessão no menu lateral.

### 6. Sequência de Execução TDD (Test-Driven Development)
1. **RED**: Escrever testes unitários em `internal/web/server_test.go` e `internal/web/network_test.go` validando os campos `enableQr` e `enableShutdown` no `/api/info`, e a rejeição com código 403 no `/api/shutdown` quando desativado.
2. **GREEN**: Implementar a leitura de configuração em `server.go`, `network.go` e `cmd/mcskin/main.go`.
3. **RED/GREEN Frontend**: Implementar e validar testes automatizados / comportamentais para i18n, zoom 2D e touch híbrido 3D.
4. **REFACTOR**: Garantir que todos os arquivos estejam em conformidade com o limite de 300 linhas e rodar a suíte de regressão `./scripts/run-regression-suite.sh`.

### 7. Governança e Limites de Loop da IA
- Conforme diretrizes do projeto: máximo de 3 iterações de reparo para qualquer teste falho. Interromper imediatamente se o mesmo erro persistir por 2 ciclos.
- Operar estritamente dentro da raiz do repositório, com execução offline e comandos de teste compactos (`./scripts/test-compact.sh`).

## Risks / Trade-offs

- **[Risco: Conflito entre arrasto (pan) e pintura (draw) no editor 2D]** → **Mitigação**: 1 dedo sempre desenha pixels, enquanto 2 dedos no touch realizam pan e zoom. No desktop, o clique do mouse com botão esquerdo desenha, enquanto arrasto com botão do meio ou com tecla modificadora (ou controles visuais) move a folha.
- **[Risco: Chaves de tradução desatualizadas ao adicionar novos componentes]** → **Mitigação**: A função `t(key)` utiliza fallback encadeado para inglês e para o próprio texto padrão caso a chave não exista no idioma ativo.
- **[Risco: Exceder o limite de 300 linhas em arquivos JavaScript]** → **Mitigação**: Manter o i18n em arquivo isolado `i18n.js` e respeitar modularidade estrita em `editor2d.js` e `editor3d.js`.

## Migration Plan

1. Nenhuma migração de banco de dados ou formato de arquivo necessária.
2. Compatibilidade retroativa total: se as variáveis de ambiente `MCSKIN_ENABLE_QR` e `MCSKIN_ENABLE_SHUTDOWN` não forem definidas, o comportamento padrão permanece 100% ativo como na versão anterior.
