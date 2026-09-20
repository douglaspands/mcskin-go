# mcskin

> **Crie skins do Minecraft Bedrock direto no navegador — sem propaganda, sem cadastro, sem instalar nada.** Um editor 3D/2D completo que roda localmente no seu computador e abre em qualquer celular ou tablet da mesma rede Wi-Fi via QR Code.

[![Go Version](https://img.shields.io/badge/go-1.25%2B-blue.svg)](https://golang.org)
[![Platform](https://img.shields.io/badge/plataformas-linux%20%7C%20windows-lightgrey.svg)]()
[![Zero Dependências](https://img.shields.io/badge/depend%C3%AAncias-zero-brightgreen.svg)]()
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)

---

## 💡 Por que o `mcskin` existe

A maioria dos "criadores de skin" na internet são sites cheios de anúncios piscando, pop-ups, botões de download falsos e pedidos de cadastro — uma armadilha para uma criança de 6 anos que só quer pintar a própria skin. O `mcskin` nasceu para resolver isso:

- 🚫 **Zero propaganda, zero rastreamento, zero cadastro**: o servidor roda no computador de casa, dentro da sua própria rede Wi-Fi. Nada é enviado para a internet, não existe conta para criar nem anúncio para clicar.
- 🧒 **Feito para mãos pequenas**: botões grandes (64px+), linguagem simples em português, efeitos sonoros de "level up" e uma estética autêntica de blocos — pensado desde o início para crianças de 6 anos ou mais.
- 📴 **100% offline e auto-contido**: um único binário Go, sem Node/NPM, sem CDN externo, sem dependências. Funciona até sem internet, contanto que o computador e o celular estejam na mesma rede local.
- 📱 **Sem instalar app nenhum**: a criança aponta a câmera do tablet ou celular para o QR Code na tela do computador, abre no navegador e já está editando — e ao terminar, baixa o `.mcpack` e instala no Minecraft com 1 toque.

---

## 🌐 Modo Web — Editor de Skins 3D e 2D no Navegador

Este é o coração do projeto: um servidor web local ("CRIE SKINS LEGAIS") com um **editor de skins 3D e 2D completo**, redesenhado para caber inteiro na tela sem precisar rolar, com um menu lateral discreto e um "Nova Skin" que já sugere um ponto de partida.

```bash
# Inicia o servidor web na porta padrão (8080) e abre o navegador automaticamente
./bin/mcskin --web
```

> No Windows, basta dar duplo clique em `mcskin.exe` sem nenhum argumento — o modo web já inicia sozinho.

<p align="center">
  <img src="docs/screenshots/editor-3d-redesign-desktop.jpg" alt="Editor 3D redesenhado, com menu lateral e submenu de ações da skin" width="760"><br>
  <sub>Editor 3D com o novo layout sem rolagem: menu lateral à direita, submenu com Nova Skin / Abrir / Salvar / Baixar .mcpack.</sub>
</p>

<p align="center">
  <img src="docs/screenshots/editor-nova-skin-modal.jpg" alt="Modal Nova Skin com opções Steve, Alex e Tela em Branco" width="420">
  &nbsp;&nbsp;
  <img src="docs/screenshots/editor-mobile-drawer.jpg" alt="Menu de navegação em gaveta no celular" width="240">
</p>
<p align="center"><sub>Esquerda: modal "Nova Skin" para começar do Steve, do Alex ou de uma tela em branco. Direita: a mesma navegação em uma gaveta deslizante no celular.</sub></p>

- 🎨 **Criador de Skins 3D e 2D**: pinte diretamente sobre um boneco 3D interativo ou numa folha 2D desenrolada, sincronizados em tempo real.
- 🧭 **Navegação sem rolagem**: tudo cabe na tela — menu lateral no desktop, gaveta deslizante no celular, e uma dica contextual que explica cada ferramenta ao passar o mouse ou tocar.
- 🆕 **"Nova Skin" com presets**: comece do Steve (4px), do Alex (3px) ou de uma tela em branco, sem precisar caçar botões escondidos.
- 📂 **Abrir uma skin existente**: carregue um PNG do próprio aparelho — o editor detecta automaticamente se é um modelo clássico ou fino pela transparência dos braços.
- 🖥️ **Tela Cheia e Zoom de Precisão**: controles de zoom (botões, roda do mouse, pinça no toque) e um botão de tela cheia para aproveitar todo o espaço do aparelho.
- 🔲 **Grade de Pixels**: liga/desliga linhas finas nas fronteiras de cada pixel, facilitando encontrar o pixel certo antes de pintar.
- 📦 **Exportação Direta**: baixe a skin editada como PNG ou gere o `.mcpack` pronto para instalar, sem sair do navegador.

### 📦 Conversor Rápido (sem editar)

Já tem uma skin pronta em PNG? A tela de Conversor gera o `.mcpack` na hora e mostra um QR Code para abrir a mesma tela direto no celular ou tablet, sem cabos.

<img src="docs/screenshots/conversor-skin.png" alt="Tela do Conversor de Skin" width="420">

---

## 🎯 Proposta & Missão

- 📱 **Foco Mobile (Tablets e Celulares)**: conexão sem fios instantânea via QR Code local (Wi-Fi) — a criança abre a interface e baixa o `.mcpack` direto no aparelho, instalando no jogo com 1 toque (*"Abrir com o Minecraft"*).
- 🔄 **Atualização Ágil**: reempacotamento rápido de texturas sem perder compatibilidade com o vestiário do jogo.
- 👥 **Dual-Model por Padrão**: gera ambos os modelos (Steve 4px e Alex 3px) compartilhando uma única textura. Zero desperdício de espaço!
- ⚡ **Zero Dependências & Air-Gapped**: 100% Go standard library, sem Node/NPM, sem CDNs externos, funcionando totalmente offline.

---

## 🚀 Uso via Linha de Comando (CLI)

Além do modo web acima, o `mcskin` também funciona como uma ferramenta de linha de comando direta: basta passar o caminho da imagem da sua skin PNG e o pacote `.mcpack` será gerado automaticamente no mesmo diretório.

### Sintaxe Básica

```bash
mcskin [opções] <caminho/para/skin.png>
```

### Opções Disponíveis

| Opção | Descrição |
| :--- | :--- |
| *(sem flag)* | **Padrão:** Gera ambos os modelos (Clássico 4px e Slim 3px) no mesmo pacote. |
| `--both` | Força explicitamente a inclusão dos dois modelos (Clássico e Slim). |
| `--classic` | Restringe a geração apenas ao modelo clássico (braços de 4px / Steve). |
| `--slim` | Restringe a geração apenas ao modelo fino (braços de 3px / Alex). |
| `--force` | Sobrescreve o arquivo `.mcpack` de saída se ele já existir (padrão: `true`). |
| `-i`, `--input` | Informa o caminho do arquivo PNG de entrada via parâmetro nomeado. |
| `-w`, `--web` | Inicia o servidor web local com o Conversor e o Criador de Skins 3D/2D (ver seção "Modo Web" no início deste documento). |
| `-p`, `--port` | Define a porta do servidor web (padrão: `8080`). Usado apenas com `--web`. |
| `--no-browser` | No modo web, não abre o navegador padrão automaticamente. |
| `-v`, `--version` | Exibe a versão, commit e data de compilação do binário. |
| `-h`, `--help` | Exibe a mensagem de ajuda com todos os parâmetros. |

> **Nota:** As opções `--classic` e `--slim` são mutuamente exclusivas e não podem ser combinadas.

---

### Exemplos Práticos

#### 1. Conversão Padrão (Ambos os Modelos: Clássico e Slim)

Por padrão, quando nenhum modelo for especificado, o pacote gerará ambas as variantes:

```bash
./bin/mcskin minhas_skins/guerreiro.png
```

**Saída:**
```text
Successfully converted "guerreiro" to Bedrock skin pack [both (classic & slim)]:
  Output: minhas_skins/guerreiro.mcpack (2855 bytes)
```
- O arquivo `minhas_skins/guerreiro.mcpack` é criado imediatamente contendo as skins `guerreiro (Classic)` e `guerreiro (Slim)`.

#### 2. Restringir Apenas ao Modelo Clássico (Steve, braços de 4px)

```bash
./bin/mcskin --classic minhas_skins/steve_custom.png
```

#### 3. Restringir Apenas ao Modelo Fino / Slim (Alex, braços de 3px)

```bash
./bin/mcskin --slim minhas_skins/alex_custom.png
```

#### 4. Consultar Versão do Binário

```bash
./bin/mcskin --version
# Exemplo: mcskin version v1.0.0 (commit: 9b600f4, built at: 2026-09-20T03:21:18Z)
```

#### 5. No Windows (Prompt de Comando ou PowerShell)

```cmd
bin\mcskin.exe C:\Users\SeuUsuario\Imagens\skin_personalizada.png
```

---

## 🎮 Como Importar a Skin no Minecraft Bedrock

Após gerar o arquivo `.mcpack`, a importação no jogo é automática:

1. **Windows 10 / 11:**
   - Dê um duplo clique no arquivo `.mcpack` gerado.
   - O Minecraft Bedrock iniciará automaticamente exibindo a notificação: `Importação iniciada...` seguida por `Importação de pacote de capa bem-sucedida`.
2. **Android / iOS:**
   - Envie ou compartilhe o arquivo `.mcpack` para o seu dispositivo móvel.
   - Toque no arquivo e selecione **"Abrir com o Minecraft"**.
3. **Equipando a Skin no Jogo:**
   - No menu principal do Minecraft, acesse o **Vestiário** (Dressing Room) > ícone de cabide (**Capas Clássicas**).
   - O seu pacote aparecerá na lista de capas disponíveis.
   - Se gerado com a opção padrão (dual-model), você verá duas capas:
     - **`<Nome> (Classic)`** (braços normais de 4 pixels)
     - **`<Nome> (Slim)`** (braços finos de 3 pixels)
   - Clique no modelo desejado e selecione **Equipar**!

---

## 📦 Estrutura do Pacote Gerado

O arquivo `.mcpack` gerado é um arquivo ZIP válido em conformidade com o padrão oficial do Minecraft Bedrock:

```text
[nome_da_skin].mcpack
├── manifest.json       # Manifesto com UUIDs v4 (RFC-4122) únicos para identificação do pacote
├── skins.json          # Registro das skins e mapeamento de geometria (classic e slim)
├── texts/
│   └── en_US.lang      # Chaves de localização para exibição dos nomes das skins no jogo
└── [nome_da_skin].png  # Imagem da textura compartilhada na raiz do pacote
```

### Exemplo de `skins.json` (Dual-Model Padrão)

```json
{
  "skins": [
    {
      "localization_name": "guerreiro_classic",
      "geometry": "geometry.humanoid.custom",
      "texture": "guerreiro.png",
      "type": "free"
    },
    {
      "localization_name": "guerreiro_slim",
      "geometry": "geometry.humanoid.customSlim",
      "texture": "guerreiro.png",
      "type": "free"
    }
  ],
  "serialize_name": "guerreiro"
}
```

### Requisitos da Imagem de Entrada

- **Formato**: PNG válido (RGBA).
- **Dimensões aceitas**:
  - `64x64` pixels (padrão moderno do Minecraft).
  - `64x32` pixels (formato clássico, legado do Minecraft pré-1.8).
  - `128x128` pixels (skins de alta resolução em conformidade Bedrock).

---

## 📥 Downloads das Releases (GitHub Actions CI/CD)

As versões oficiais são geradas automaticamente através do workflow de integração contínua [`.github/workflows/release.yml`](.github/workflows/release.yml) sempre que uma tag de versão (`v*`) é criada:

- **Linux (`amd64`)**: Arquivo `mcskin_<tag>_linux_amd64.tar.gz` contendo o executável estático e a documentação.
- **Windows (`amd64`)**: Arquivo `mcskin_<tag>_windows_amd64.zip` contendo o `mcskin.exe` e a documentação.
- **Integridade**: Cada release acompanha o arquivo `checksums.txt` com as somas de verificação SHA256 de todos os pacotes.

Para baixar a versão mais recente, acesse a página de **[Releases no GitHub](https://github.com/douglas/mcskin/releases)**.

---

## 🛠️ Guia para Desenvolvedores

Esta seção é destinada a quem deseja compilar o projeto do código-fonte, rodar testes ou contribuir.

### Pré-requisitos

- [Go](https://go.dev/dl/) versão 1.25 ou superior.
- Git.
- `make` (opcional, para uso dos atalhos de automação).

---

### Compilação com Make

O repositório inclui um `Makefile` com comandos prontos:

```bash
# Compila os binários para Linux e Windows na pasta bin/ com injeção de versão
make build

# Compila apenas para Linux (amd64)
make build-linux

# Compila apenas para Windows (.exe, amd64)
make build-windows

# Executa todos os testes unitários
make test

# Executa o linter oficial (go vet)
make lint

# Limpa binários compilados e arquivos temporários
make clean
```

---

### Execução dos Testes

O projeto segue rigorosamente o padrão **Test-Driven Development (TDD)** e **isolamento total de testes unitários**:

```bash
# Executa a suíte completa de testes
go test -v ./...

# Executa testes direcionados por pacote
go test -v ./internal/bedrock/...
go test -v ./internal/converter/...
go test -v ./cmd/mcskin/...
```

> **Regra de Isolamento**: Todos os testes unitários são 100% mockados em memória (`bytes.Buffer`, `bytes.Reader`). Nenhum teste unitário faz requisições de rede ou cria arquivos persistentes fora de diretórios temporários transitórios (`t.TempDir()`).

---

### Verificação com a Skill Bedrock Verifier

Para validar a integridade técnica de um `.mcpack` gerado (UUIDs, esquemas JSON, geometrias e dimensões):

```bash
python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py caminho/para/skin.mcpack
```

---

## 📄 Licença

Este projeto está licenciado sob os termos da licença [MIT](LICENSE). Livre para uso pessoal e comercial.
