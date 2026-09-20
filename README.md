# png-to-mcpack

> Ferramenta CLI em Go de alta performance, leve e sem dependências externas para converter texturas de skins de Minecraft (`.png`) em pacotes prontos para importação no Minecraft Bedrock (`.mcpack`).

[![Go Version](https://img.shields.io/badge/go-1.25%2B-blue.svg)](https://golang.org)
[![Platform](https://img.shields.io/badge/plataformas-linux%20%7C%20windows-lightgrey.svg)]()
[![Zero Dependências](https://img.shields.io/badge/depend%C3%AAncias-zero-brightgreen.svg)]()
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)

---

## 🚀 Como Usar

O `png-to-mcpack` foi desenvolvido para ser direto e simples: basta passar o caminho da imagem da sua skin PNG e o pacote `.mcpack` será gerado automaticamente no mesmo diretório.

### Sintaxe Básica

```bash
png-to-mcpack [opções] <caminho/para/skin.png>
```

### Opções Disponíveis

| Opção | Descrição |
| :--- | :--- |
| `--slim` | Define o modelo com geometria humanoide fina (braços de 3px / Alex). Padrão: clássico (4px / Steve). |
| `--force` | Sobrescreve o arquivo `.mcpack` de saída se ele já existir (padrão: `true`). |
| `-i`, `--input` | Informa o caminho do arquivo PNG de entrada via parâmetro nomeado. |
| `-h`, `--help` | Exibe a mensagem de ajuda com todos os parâmetros. |

---

### Exemplos Práticos

#### 1. Conversão Padrão (Modelo Clássico - Steve, braços de 4px)

```bash
./bin/png-to-mcpack minhas_skins/guerreiro.png
```

**Resultado:**
- O arquivo `minhas_skins/guerreiro.mcpack` é criado imediatamente na mesma pasta.

#### 2. Modelo Fino / Slim (Alex, braços de 3px)

Para skins desenhadas no formato Slim (braços com 3 pixels de largura):

```bash
./bin/png-to-mcpack --slim minhas_skins/arqueira.png
```

#### 3. No Windows (Prompt de Comando ou PowerShell)

```cmd
bin\png-to-mcpack.exe C:\Users\SeuUsuario\Imagens\skin_personalizada.png
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
   - O seu pacote com o nome da skin aparecerá na lista de capas disponíveis.
   - Clique na skin e selecione **Equipar**!

---

## 📦 Estrutura do Pacote Gerado

O arquivo `.mcpack` gerado é um arquivo ZIP válido em conformidade com o padrão oficial do Minecraft Bedrock:

```text
[nome_da_skin].mcpack
├── manifest.json       # Manifesto com UUIDs v4 (RFC-4122) únicos para identificação do pacote
├── skins.json          # Registro da skin e mapeamento de geometria (geometry.humanoid.custom ou customSlim)
├── texts/
│   └── en_US.lang      # Chaves de localização para exibição do nome do pacote e da skin
└── [nome_da_skin].png  # Imagem da textura copiada para a raiz do pacote
```

### Requisitos da Imagem de Entrada

- **Formato**: PNG válido (RGBA).
- **Dimensões aceitas**:
  - `64x64` pixels (padrão moderno do Minecraft).
  - `128x128` pixels (skins de alta resolução em conformidade Bedrock).

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
# Compila os binários para Linux e Windows na pasta bin/
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

### Compilação Manual (sem Make)

Você pode compilar diretamente utilizando os comandos do Go:

#### Para Linux (`amd64`):
```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/png-to-mcpack ./cmd/png-to-mcpack
```

#### Para Windows (`amd64`):
```bash
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/png-to-mcpack.exe ./cmd/png-to-mcpack
```

---

### Execução dos Testes

O projeto segue rigorosamente o padrão **Test-Driven Development (TDD)** e **isolamento total de testes unitários**:

```bash
# Executa a suíte de testes com detalhes
go test -v ./...

# Executa apenas um teste específico (exemplo)
go test -v -run TestValidateSkin ./internal/skin/...
```

> **Regra de Isolamento**: Todos os testes unitários são 100% mockados em memória (`bytes.Buffer`, `bytes.Reader`). Nenhum teste unitário faz requisições de rede ou cria arquivos persistentes fora de diretórios temporários transitórios (`t.TempDir()`).

---

### Estrutura dos Pacotes

```text
.
├── cmd/
│   └── png-to-mcpack/      # Ponto de entrada CLI (parse de argumentos e saída)
├── internal/
│   ├── skin/               # Validação de dimensões PNG (64x64, 128x128) e decodificação
│   ├── bedrock/            # Geração de manifest.json, skins.json, en_US.lang e UUIDv4
│   ├── pack/               # Criação do arquivo ZIP/.mcpack com caminhos sanitizados
│   └── converter/          # Orquestração do pipeline (leitura, geração e escrita no disco)
├── .agents/                # Governança de IA, políticas de autonomia, scripts e skills
└── openspec/               # Especificações formais e ciclo de vida OpenSpec
```

---

### Princípios de Arquitetura e Governança

- **Zero Dependências Externas**: Utilização exclusiva de pacotes nativos da biblioteca padrão do Go (`image/png`, `archive/zip`, `crypto/rand`, `encoding/json`, `path/filepath`).
- **Compatibilidade Cruzada**: Caminhos dentro do arquivo `.mcpack` utilizam obrigatoriamente `filepath.ToSlash()` para garantir compatibilidade entre Linux, Windows e consoles.
- **Governança de Agentes de IA (Harnesses)**:
  - O projeto possui regras formais documentadas em [`AGENTS.md`](AGENTS.md), [`GEMINI.md`](GEMINI.md) e [`.agents/governance.md`](.agents/governance.md).
  - **Isolamento Mandatório de Branch**: Todo comando `/opsx-propose` inicia obrigatoriamente com a criação da branch `feat/<nome_spec>` (`git checkout -b feat/<nome_spec>`).
  - **Squash Merge na Conclusão**: Ao arquivar uma alteração via `/opsx-archive`, é solicitada a confirmação do usuário para realizar o merge em `main` via método squash (`git checkout main && git merge --squash feat/<nome_spec>`).
  - **Gate Mecânico de Segurança**: O script `.agents/scripts/command-gate.py` inspeciona e autoriza apenas comandos seguros de compilação, testes e inspeção, bloqueando comandos destrutivos.

---

## 📄 Licença

Este projeto está licenciado sob os termos da licença [MIT](LICENSE). Livre para uso pessoal e comercial.
