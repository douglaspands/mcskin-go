# Especificação de Testes Acumulados (ARTS - Accumulated Regression Test Specification)

> [!IMPORTANT]
> Esta especificação define a **Bateria Completa de Testes Regressivos Acumulados** do projeto `mcskin`.
> A execução integral e a aprovação de 100% destes casos de teste é **requisito obrigatório** na skill `feature-qa-reviewer` antes de conceder o parecer `APROVADO` para qualquer feature ou alteração.

---

## 1. Visão Geral e Princípios de Regressão

O projeto `mcskin` evolui através de especificações OpenSpec. A cada nova funcionalidade entregue, o sistema expande suas capacidades, mas deve manter **compatibilidade regressiva irrestrita** com todos os comportamentos e contratos previamente consolidados.

### Princípios Fundamentais
1. **Regressão com Tolerância Zero**: Nenhuma alteração pode quebrar comandos da CLI, formatos de saída `.mcpack`, rotas da API Web, interações da lousa 3D ou contratos de responsividade.
2. **Execução Automatizada & Reprodutível**: Toda a bateria é verificável através do script unificado `./scripts/run-regression-suite.sh`.
3. **Isolamento e Segurança**: Os testes automatizados não dependem de rede externa e não realizam escritas persistentes fora de diretórios temporários controlados.

---

## 2. Matriz de Casos de Teste Acumulados

### Domínio 1: CLI & Mecânica de Conversão

| ID | Cenário / Requisito | Comando / Verificação | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **TC-CLI-01** | Conversão padrão Steve clássico (64x64 RGBA) | `./bin/mcskin files/argentino_pedro.png` | Gera `files/argentino_pedro.mcpack` no mesmo diretório, exit code 0, log indicando sucesso. |
| **TC-CLI-02** | Conversão explícita com flag `--slim` (Alex) | `./bin/mcskin --slim files/argentino_pedro.png` | Gera `.mcpack` com modelo explicitamente configurado como slim. |
| **TC-CLI-03** | Rejeição de dimensões inválidas | `./bin/mcskin files/pedro_mickey.png` (2048x2048) | Falha com exit code != 0 e mensagem amigável explicando dimensões aceitas (64x64 ou 128x128). |
| **TC-CLI-04** | Rejeição de arquivos inexistentes ou corrompidos | `./bin/mcskin non_existent_file.png` | Falha com exit code != 0 e mensagem clara de erro de arquivo. |
| **TC-CLI-05** | Colocação determinística de arquivo | Entrada: `path/to/skin.png` | Saída obrigatória em `path/to/skin.mcpack` (mesmo diretório e base name). |
| **TC-CLI-06** | Flags de controle da CLI | `./bin/mcskin --version`<br>`./bin/mcskin --help` | Exibe versão e instruções de uso sem erros, exit code 0. |

---

### Domínio 2: Conformidade com o Padrão Minecraft Bedrock (`.mcpack`)

| ID | Cenário / Requisito | Ferramenta / Verificação | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **TC-BED-01** | Validação ZIP e separador de caminhos | `unzip -l files/<nome>.mcpack` | Todos os caminhos usam barras normais `/` (`filepath.ToSlash`), sem contra-barras `\`. |
| **TC-BED-02** | Manifesto Bedrock v2 | `unzip -p files/<nome>.mcpack manifest.json` | JSON válido, `format_version: 2`, contém seções `header` e `modules`. |
| **TC-BED-03** | Unicidade de UUIDv4 RFC-4122 | Verificação via script Python | Header UUID e Module UUID são UUIDs v4 válidos e **estritamente distintos**. |
| **TC-BED-04** | Esquema de `skins.json` | `unzip -p files/<nome>.mcpack skins.json` | Contém geometrias Bedrock válidas (`geometry.humanoid.custom` ou `customSlim`), texturas e tipos mapeados. |
| **TC-BED-05** | Localização de texto | `unzip -p files/<nome>.mcpack texts/en_US.lang` | Chave `skinpack.<nome>=<nome>` presente com quebra de linha. |
| **TC-BED-06** | Verificação mecânica profunda | `python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py <arquivo>.mcpack` | Retorna JSON com `"valid": true` e sem violações de esquema. |

---

### Domínio 3: Servidor Web & APIs Embutidas (`mcskin web`)

| ID | Cenário / Requisito | Endpoint / Verificação | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **TC-WEB-01** | Página inicial da aplicação | `GET /` | Retorna status 200, `Content-Type: text/html; charset=utf-8` contendo "CRIE SKINS" e elementos essenciais. |
| **TC-WEB-02** | Descoberta de rede local (Wi-Fi / QR Code) | `GET /api/network` | Retorna JSON com `port`, `addresses` e IP local ativo detectado. |
| **TC-WEB-03** | Conversão web via multipart | `POST /api/convert` | Recebe arquivo `skin`, `name` e `model`; retorna binário `.mcpack` válido e para download. |
| **TC-WEB-04** | Desligamento gracioso | `POST /api/shutdown` | Retorna JSON de confirmação e finaliza o servidor sem travamentos. |
| **TC-WEB-05** | Servimento de assets estáticos | `GET /style.css`<br>`GET /js/app.js`<br>`GET /vendor/three.min.js` | Status 200 com cabeçalhos MIME types corretos (`text/css`, `application/javascript`). |

---

### Domínio 4: Editor 3D & Lousa Interativa

| ID | Cenário / Requisito | Componente / Ação | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **TC-UI-01** | Palco 3D WebGL Three.js | `#stage3D`, `#editor3DCanvas` | Canvas WebGL renderiza o modelo Steve/Alex centrado no frustum com iluminação correta. |
| **TC-UI-02** | Alternância Mãozinha (Girar) vs Pincel (Pintar) | `#btnTouchRotate`, `#btnTouchPaint` | Altera classe do `#stage3D` (`mode-rotate` com cursor grab; `mode-paint` com cursor crosshair). |
| **TC-UI-03** | Rotação livre por movimento | Arrasto do mouse ou toque no palco | O boneco gira suavemente em X e Y (`viewport3D.rotY`, `viewport3D.rotX`). |
| **TC-UI-04** | Ajuste vertical de altura | Botões `#btnPanUp` (`▲`) e `#btnPanDown` (`▼`) | `▲` sobe o boneco (revela pés); `▼` desce o boneco (revela cabeça); arrasto com botão direito/Shift também translada. |
| **TC-UI-05** | Grade de pixels | Botão `#btnToggleGrid` | Alterna classe `.active` (destaque verde Minecraft) e aplica linhas de grade no modelo 3D. |
| **TC-UI-06** | Mannequin de Foco | `#mannequinWidget` (.mannequin-part) | Clicar em Cabeça, Tronco, Braços ou Pernas reposiciona e focaliza a câmera na parte selecionada. |
| **TC-UI-07** | Paleta Minecraft & Cor Personalizada | `#paletteGrid`, `#customColorPicker` | Clicar em swatch ou selecionar cor hexadecimal atualiza a cor ativa e swatch de exibição. |
| **TC-UI-08** | Histórico de Edição | `#btnUndo`, `#btnRedo` | Desfaz e refaz pixels desenhados sincronizando textura 3D instantaneamente. |
| **TC-UI-09** | Faixa de Dicas Reativa | `#dockHintStrip` | Exibe textos e ícones contextuais ao passar o mouse ou focar ferramentas. |

---

### Domínio 5: Responsividade Canônica Multi-Dispositivo

| ID | Resolução / Dispositivo | Regra CSS / Elementos | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **TC-RSP-01** | **Mobile (`<= 640px`)** | `@media (max-width: 640px)` | - Conversor em 1 coluna vertical (`grid-template-columns: 1fr`).<br>- Botões de arquivo em grade 2x2.<br>- Abas do cabeçalho ocultadas (`display: none`).<br>- Menu lateral desktop forçadamente ocultado (`display: none !important`).<br>- Botão hambúrguer `☰` abre o drawer móvel. |
| **TC-RSP-02** | **Tablet (`641px - 1023px`)** | `@media (min-width: 641px) and (max-width: 1023px)` | - Container com largura máxima de 860px centralizado.<br>- Conversor em 2 colunas equilibradas (`1.05fr 1fr`).<br>- Botões de arquivo em 4 colunas.<br>- Abas do cabeçalho visíveis (`display: flex`).<br>- Menu lateral desktop ocultado (`display: none !important`), mantendo o foco na lousa 3D.<br>- Botão hambúrguer `☰` abre drawer com painel de operações. |
| **TC-RSP-03** | **Desktop (`>= 1024px`)** | `@media (min-width: 1024px)` | - Container com largura máxima de 1240px centralizado.<br>- Abas do cabeçalho visíveis com texto de menu (`☰ Menu`).<br>- Menu lateral rápido (`#desktopSidebarMenu`) **visível por padrão** (`display: flex`).<br>- Botão de recolher `▶` colapsa o menu lateral (`.hidden`).<br>- Botão `☰ Menu` alterna o colapso do menu lateral. |

---

### Domínio 6: Governança Técnica, Economia de Tokens & Invariantes de Build

| ID | Cenário / Invariante | Verificação | Critério de Aceitação |
| :--- | :--- | :--- | :--- |
| **TC-GOV-01** | Zero Dependências Externas | `go list -m all` | Exibe unicamente o módulo principal `mcskin`; nenhum módulo de terceiros no `go.mod`. |
| **TC-GOV-02** | Orçamento Token Guardian | `wc -l` e `ls -l` em `internal/web/static/js/*.js` e arquivos `.go` | **Nenhum arquivo de aplicação excede 300 linhas ou 15 KB**. Módulos ES6 desacoplados. |
| **TC-GOV-03** | Verificação de Sintaxe JavaScript | `node --check internal/web/static/js/*.js` | Zero erros de sintaxe ou parsing. |
| **TC-GOV-04** | Compilação Cruzada Nativa | `make build` ou `go build` para Linux e Windows | Gera `bin/mcskin` (ELF Linux) e `bin/mcskin.exe` (PE Windows) sem warnings. |
| **TC-GOV-05** | Isolamento Estrito de Testes Unitários | `go test -count=1 ./...` | 100% dos testes unitários executam em memória (mocked), sem dependência de rede externa. |

---

## 3. Protocolo de Execução do Regressivo

Para executar toda a bateria acumulada descrita nesta especificação:

```bash
./scripts/run-regression-suite.sh
```

### Checklist Obrigatório para o Relatório do PO / QA:
Ao concluir a avaliação, o parecer deve registrar explicitamente o status de cada domínio:

- [ ] **Domínio 1: CLI & Mecânica de Conversão** (TC-CLI-01 a TC-CLI-06)
- [ ] **Domínio 2: Padrão Bedrock & Manifesto** (TC-BED-01 a TC-BED-06)
- [ ] **Domínio 3: Servidor Web & APIs** (TC-WEB-01 a TC-WEB-05)
- [ ] **Domínio 4: Editor 3D & Lousa Interativa** (TC-UI-01 a TC-UI-09)
- [ ] **Domínio 5: Responsividade Multi-Dispositivo** (TC-RSP-01 a TC-RSP-03)
- [ ] **Domínio 6: Governança & Token Guardian** (TC-GOV-01 a TC-GOV-05)
