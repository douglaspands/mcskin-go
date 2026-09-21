# Design: Reestruturação do README com Foco na Web e Ergonomia Infantil

## Context

O `mcskin` é um conversor e editor de skins Minecraft Bedrock desenvolvido em Go puro (sem dependências externas), focado em fornecer uma experiência segura e sem atritos para crianças pequenas (6+ anos).
O arquivo `README.md` atual contém todas as informações técnicas e capturas de tela do projeto, porém sua hierarquia visual coloca a linha de comando e opções de terminal com peso desproporcional logo no início, ofuscando a facilidade de uso do modo web local e os diferenciais de proteção para os pequenos.

## Goals / Non-Goals

**Goals:**
- Reorganizar o `README.md` seguindo as melhores práticas open-source, estabelecendo uma hierarquia clara de leitura em Português do Brasil.
- Destacar imediatamente o propósito do projeto: uma ferramenta 100% segura, offline, sem anúncios e com botões grandes pensados para crianças.
- Dar protagonismo total ao modo web: fluxo em 3 passos (Iniciar PC -> Conectar Tablet via QR Code -> Pintar e Jogar).
- Exibir com clareza a vitrine da interface web (editor 3D/2D, modal Nova Skin, drawer mobile e importador com IA).
- Organizar a seção técnica (CLI, compilação Go, testes) de forma elegante e não intimidante para usuários comuns.
- Garantir que todos os links relativos de imagens, arquivos e badges permaneçam 100% válidos.

**Non-Goals:**
- Não alterar código Go (`cmd/`, `internal/`) ou modificar comportamento da aplicação.
- Não introduzir múltiplos idiomas neste momento (decisão alinhada com o usuário de focar exclusivamente em Português).
- Não remover informações técnicas essenciais para desenvolvedores (elas serão preservadas e reorganizadas).

## Decisions

### Decisão 1: Hierarquia Orientada ao Usuário Final (Pais & Crianças) Primeiro
- **Abordagem**: Colocar no topo a proposta de valor, a tabela de contraste de segurança ("Internet vs. mcskin"), o guia rápido em 3 passos e a vitrine do editor web.
- **Alternativa considerada**: Manter o CLI no topo e o modo web como uma subseção.
- **Justificativa**: 95% do valor do `mcskin` para famílias está na interface visual sem anúncios. Desenvolvedores e usuários avançados que usam terminal naturalmente rolam até a seção técnica ou usam o sumário.

### Decisão 2: Tabela de Segurança Explícita
- **Abordagem**: Incluir uma tabela comparativa com ícones (❌ vs ✅) mostrando por que sites convencionais são perigosos para crianças (anúncios, botões falsos, malware, rastreamento) e como o `mcskin` resolve com sandbox local, anonimato e 1 toque para o jogo.
- **Alternativa considerada**: Parágrafo corrido de texto.
- **Justificativa**: Tabelas comparativas possuem altíssimo impacto cognitivo e transmitem confiança imediata para pais e educadores.

### Decisão 3: Preservação e Integração dos Screenshots Existentes
- **Abordagem**: Reutilizar as capturas de alta qualidade já presentes em `docs/screenshots/`:
  - `editor-3d-redesign-desktop.jpg` (visão geral do editor 3D e dock)
  - `editor-nova-skin-modal.jpg` (escolha Steve, Alex, em branco)
  - `editor-mobile-drawer.jpg` (experiência móvel/touch)
  - `conversor-skin.png` (fluxo rápido com QR Code)
- **Alternativa considerada**: Gerar novos mockups ou remover imagens.
- **Justificativa**: As imagens já ilustram fielmente o estado real e moderno da aplicação v1.4.0+.

### Decisão 4: Seção Técnica Limpa & Modular
- **Abordagem**: Estruturar os detalhes do CLI, tabela de flags, exemplos práticos e o guia de desenvolvimento (Go 1.25+, Make, TDD) em seções bem delimitadas no final do documento.
- **Alternativa considerada**: Esconder tudo em tags `<details>`.
- **Justificativa**: Manter markdown legível tanto na visualização web do GitHub quanto em leitores de texto puro.

## Risks / Trade-offs

- **[Risco] Links ou caminhos de imagens quebrados após a reorganização**
  → *Mitigação*: Validar estaticamente a integridade de todas as referências para `docs/screenshots/*` e arquivos do repositório.
- **[Risco] Ocultar informações úteis para quem usa exclusivamente linha de comando**
  → *Mitigação*: Incluir atalhos claros no topo e uma seção dedicada com sintaxe, tabela completa de flags e exemplos práticos.

## AI Agent Governance & Test Execution Sequence

- **Governança**: Respeitar o limite máximo de 3 iterações (`max_attempts = 3`) e parada imediata em repetição idêntica de erros.
- **Verificação**:
  1. Validar a renderização do markdown e a inexistência de links ou imagens quebradas.
  2. Executar suíte de testes existente (`./scripts/test-compact.sh` ou `go test ./...`) para garantir que nenhuma regressão foi introduzida.
  3. Acionar automaticamente a skill `feature-qa-reviewer` após conclusão das tarefas.
