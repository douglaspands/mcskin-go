# Tasks

> **Skills de referência para este change:**
> - `web-prototype-scaffold` — estrutura canônica de módulos JS/HTML antes de criar qualquer arquivo
> - `ui-component-library-ref` — paleta, classes e índice de módulos (substitui leitura do style.css)
> - `prototype-iteration-loop` — loop de revisão bounded (máx 2 iterações antes de pedir input)
> - `model-selection` — modelo recomendado por task (ver anotações abaixo e tabela de resumo)

---

## 1. Backend Favicon Delivery (TDD)

- [x] 1.1 Write unit tests in `internal/web/server_test.go` for GET `/favicon.ico` verifying HTTP status 200, Content-Type `image/png`, and non-empty icon body, and verify the test fails (RED phase) via `go test -v -run TestFavicon ./internal/web/...`
      <!-- model: flash (AGY) / sonnet (Claude) | signal: 1-file mocked unit test, spec completo -->

- [x] 1.2 Implement the `/favicon.ico` handler in `internal/web/server.go` serving the embedded `assets/mcskin.png` icon, and verify the test passes (GREEN phase) via `go test -v -run TestFavicon ./internal/web/...`
      <!-- model: flash (AGY) / sonnet (Claude) | signal: 1-file mechanical, handler simples -->

## 2. Layout & Zero-Scroll CSS Architecture

> **Antes de editar qualquer arquivo**: ler `web-prototype-scaffold` (estrutura) e `ui-component-library-ref` (CSS vars e classes existentes).

- [x] 2.1 Refactor `internal/web/static/style.css` (actual path — no `css/` subdir exists) to establish the zero-scroll flexbox pipeline (`100dvh`, `.app-root`, `.desktop-layout-split`, `.main-workspace-content`, `.editor-container`, flex-fill 3D stage), docked hint strip styling, submenu tree styling, and right-aligned desktop sidebar, and verify responsive styling across breakpoints
      <!-- model: flash (AGY) / claude-sonnet-4-5 (Claude) | signal: multi-regra CSS com breakpoints, requer raciocínio de layout -->

- [x] 2.2 Update `internal/web/static/index.html` to integrate the full zero-scroll DOM structure, `#dockHintStrip`, navigation submenu under "🎨 Criador de Skins 3D" (desktop sidebar + mobile drawer), "Nova Skin" preset modal markup, mobile header fullscreen toggle, hamburger drawer trigger, and favicon link tag `<link rel="icon">`. Also fixed a latent bug: `#viewEditor` had inline `style="display:none"` with no `.active` override, meaning the tab never actually showed pre-existing markup.
      <!-- model: flash (AGY) / claude-sonnet-4-5 (Claude) | signal: estrutura HTML multi-componente, prose spec -->

## 3. Modular Frontend Implementation (< 300 lines / 15 KB)

> **Antes de criar qualquer módulo JS**: ler `web-prototype-scaffold` (template de módulo ES6).
> **Para revisão de iterações**: usar `prototype-iteration-loop` (máx 2 passes por módulo antes de pedir feedback).

- [x] 3.1 Create `internal/web/static/js/editor-layout.js` (< 300 lines) to manage dynamic stage sizing, `ResizeObserver` / visual viewport listeners, mobile header fullscreen toggle, and reactive `#dockHintStrip` hover and tap notifications
      <!-- model: flash (AGY) / claude-sonnet-4-5 (Claude) | signal: novo módulo JS a partir de prose, multi-listener -->

- [x] 3.2 Create `internal/web/static/js/editor-menu.js` (< 300 lines) to manage the editor submenu expand/collapse toggle, state synchronization between desktop sidebar and mobile drawer, and the "Nova Skin" preset modal dialog
      <!-- model: flash (AGY) / sonnet (Claude) | signal: novo módulo JS, state sync cross-component -->

- [x] 3.3 Create `internal/web/static/js/editor-file-loader.js` (< 300 lines) implementing asynchronous skin PNG loading via `FileReader`, dimension validation (64x64, 64x32, 128x128), and arm alpha inspection for classic vs. slim auto-detection
      <!-- model: flash (AGY) / sonnet (Claude) | signal: novo módulo JS, lógica de validação não-trivial -->

- [x] 3.4 Update `internal/web/static/js/converter.js` (actual filename — no `converter-ui.js` exists) to render the responsive 2-column layout on wide viewports (already present at 768px breakpoint), streamline upload actions, and align the Wi-Fi IP display with 1-click clipboard copy feedback (`.btn-copy` widened to match `.network-url-pill`)
      <!-- model: flash (AGY) / sonnet (Claude) | signal: refactor módulo existente, multi-file coordination -->

- [x] 3.5 Integrate and wire modules in `internal/web/static/js/app.js` and `internal/web/static/js/editor3d.js` (actual filename — no `editor-3d.js` exists), verifying that all modules import cleanly with zero console syntax errors and remain under 300 lines and 15 KB
      <!-- model: flash (AGY) / sonnet (Claude) | signal: integração multi-módulo, wiring de imports -->

## 4. Verification & QA Review

- [x] 4.1 Run `./scripts/test-compact.sh` and `go build ./...` to verify all Go test suites pass and build cleanly with zero regressions
      <!-- model: flash (AGY) / sonnet (Claude) | signal: execução de script, verificação mecânica -->

- [x] 4.2 Inspect all modified and created frontend files in `internal/web/static/` to verify strict adherence to the file budget (< 300 lines and < 15 KB) via `wc -l` and `stat`
      <!-- model: flash (AGY) / sonnet (Claude) | signal: inspeção/grep, sem raciocínio complexo -->

- [x] 4.3 Execute `feature-qa-reviewer` persona to validate Bedrock package compatibility, zero-scroll ergonomics, and child usability (6+)
      <!-- model: pro (AGY) / opus (Claude) | signal: PO/QA eval, julgamento amplo -->

---

## Model Selection Summary

| Task | Tier | Model (AGY) | Model (Claude) | Signal |
|---|---|---|---|---|
| 1.1 Unit test favicon (RED) | mid | `flash` | `sonnet` | 1-file mocked, spec completo |
| 1.2 Implementar handler favicon (GREEN) | mid | `flash` | `sonnet` | 1-file mechanical |
| 2.1 CSS zero-scroll layout | mid | `flash` | `claude-sonnet-4-5` | multi-regra CSS, breakpoints |
| 2.2 HTML DOM zero-scroll | mid | `flash` | `claude-sonnet-4-5` | estrutura multi-componente |
| 3.1 editor-layout.js | mid | `flash` | `claude-sonnet-4-5` | novo módulo JS, prose spec |
| 3.2 editor-menu.js | mid | `flash` | `claude-sonnet-4-5` | novo módulo JS, state sync |
| 3.3 editor-file-loader.js | mid | `flash` | `claude-sonnet-4-5` | novo módulo JS, validação |
| 3.4 converter-ui.js (refactor) | mid | `flash` | `claude-sonnet-4-5` | refactor multi-file |
| 3.5 Integração app.js / editor-3d.js | mid | `flash` | `claude-sonnet-4-5` | wiring multi-módulo |
| 4.1 test-compact + build | mid | `flash` | `sonnet` | execução mecânica |
| 4.2 token-guardian check | mid | `flash` | `sonnet` | inspeção/grep |
| 4.3 feature-qa-reviewer | deep | `pro` | `claude-opus-4-5` | QA eval / julgamento amplo |

> Gerado pela skill `model-selection`. Atualizar outcomes em `.agents/model-log.md` durante o apply.

### Skills ativas neste change

| Skill | Quando usar |
|---|---|
| `web-prototype-scaffold` | Antes de criar qualquer módulo JS ou HTML (tasks 2.x, 3.x) |
| `ui-component-library-ref` | Para consultar CSS vars, classes e módulos sem ler style.css (tasks 2.x, 3.x) |
| `prototype-iteration-loop` | Para revisões de módulos frontend — máx 2 iterações (tasks 3.x) |
| `static-server-dev` | Para preview local em porta 8787 durante desenvolvimento (tasks 2.x, 3.x) |
| `token-guardian` | Verificação de budget antes de marcar task completa (task 4.2) |
| `model-selection` | Consultar Decision Table para qualquer subagente disparado |

---

## Addendum: Rodada 2 — Correção de defeitos da QA + fidelidade ao protótipo

Após a rodada 1 de PO/QA (veredito REPROVADO), e a pedido explícito do usuário para seguir `docs/prototypes/web-skin-editor-prototype.html` à risca (com exceção do motor 3D real, que permanece o WebGL/Skin3D existente em vez do mockup CSS do protótipo):

- [x] Corrigido D-1: coordenada de detecção classic/slim em `editor-file-loader.js` (era x=47, coluna opaca em ambos os modelos; agora x=54-56, única coluna vazia em skins slim reais)
- [x] Corrigido D-2: modelo detectado no upload agora propaga para `currentModelType` via novo `setModelType()` exportado em `palette.js`, corrigindo o payload do `.mcpack` gerado
- [x] Corrigido D-3: fullscreen agora aplica-se a `document.documentElement` (não mais a `.editor-card`), com um único botão de alternância no header, eliminando a classe de bug "sem saída da tela cheia no mobile"
- [x] Adicionados controles "Subir/Descer" (`btnPanUp`/`btnPanDown`) no HUD do palco 3D
- [x] Bug pré-existente (não relacionado a esta mudança) descoberto e corrigido: `editor3d.js` chamava `viewport3D.updateTexture()`, método inexistente no motor — o boneco 3D nunca renderizava. Corrigido para `viewport3D.setTexture(canvas, uvWidth, uvHeight)`.
- [x] Reformulação completa da tela do editor para bater com o protótipo: barra superior compacta (Desfazer/Refazer em ícone, pílula Modelo Steve/Alex, pílula Boneco 3D/Folha 2D, Formato, Grade, Nome da Skin), pílula flutuante Pintar/Girar centralizada no palco, dock inferior de 6 ferramentas uniformes (Lápis/Balde/**Trocar**/Apagar/Cores/Camada), gaveta de cores deslizante. **Trade-offs confirmados explicitamente pelo usuário**: removidos "Modo Vidro" (transparência 50%), "Ocultar Partes" (visibilidade por parte do corpo) e a ferramenta Pipeta; adicionada a ferramenta "Trocar" (substituir todos os pixels da mesma cor). Mantidos (por pedido explícito, pois o protótipo não cobria): alternância Boneco 3D/Folha 2D, seletor de formato 64x64/64x32/128x128, e nome/renomeação da skin.
- [x] `specs/skin-editor/spec.md` atualizado para refletir os requisitos MODIFICADOS (dock em vez de sidebar, Trocar substituindo Pipeta, remoção do toggle de visibilidade por parte)
- [x] **Concluído**: reexecutar `feature-qa-reviewer` (rodada 3) com veredito APROVADO
- [x] **Rodada 3 — Alinhamento 1:1 Estrito com o Protótipo**: Removidas todas as divergências residuais (header antigo, banner redundante, cards soltos). A UI agora espelha 100% `docs/prototypes/web-skin-editor-prototype.html` em classes, layout zero-scroll `100dvh`, cabeçalho compacto (~44px), grade responsiva de 2 colunas no conversor, dock inferior de 6 ferramentas com "Trocar", lousa 3D com Three.js real (`editor3DCanvas`), controles HUD discretos (`🔍+`, `🔍−`, `▲`, `▼`, `⟲`), pílula flutuante Girar/Pintar, gaveta de cores deslizante, bonequinho mannequin de foco, e menu lateral desktop / gaveta mobile com submenu e card Wi-Fi/QR Code.
