# mcskin

> Ferramenta em Go de alta performance, leve e sem dependências externas para **criação, atualização e instalação** de skins no Minecraft Bedrock (`.mcpack`), com **foco primordial em smartphones e tablets** (iPads, celulares Android e tablets).

[![Go Version](https://img.shields.io/badge/go-1.25%2B-blue.svg)](https://golang.org)
[![Platform](https://img.shields.io/badge/plataformas-linux%20%7C%20windows-lightgrey.svg)]()
[![Zero Dependências](https://img.shields.io/badge/depend%C3%AAncias-zero-brightgreen.svg)]()
[![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)](LICENSE)

---

## 🎯 Proposta & Missão

O `mcskin` nasceu para eliminar as barreiras na customização de skins no Minecraft Bedrock:
- 📱 **Foco Mobile (Tablets e Celulares)**: Conexão sem fios instantânea via QR Code local (Wi-Fi). A criança aponta a câmera do tablet para a tela do computador, abre a interface e baixa o `.mcpack` direto no aparelho, instalando no jogo com 1 toque (*"Abrir com o Minecraft"*).
- ⛏️ **Criação Descomplicada ("CRIE SKINS LEGAIS")**: Interface lúdica com estética autêntica de blocos, botões grandes táteis (64px+) para dedos pequenos (6+ anos) e áudio feedback de level up.
- 🔄 **Atualização Ágil**: Reempacotamento rápido de texturas sem perder compatibilidade com o vestiário do jogo.
- 👥 **Dual-Model por Padrão**: Gera ambos os modelos (Steve 4px e Alex 3px) compartilhando uma única textura. Zero desperdício de espaço!
- ⚡ **Zero Dependências & Air-Gapped**: 100% Go standard library, sem Node/NPM, sem CDNs externos, funcionando totalmente offline.

---

## 🚀 Como Usar

O `mcskin` foi desenvolvido para ser direto e simples: basta passar o caminho da imagem da sua skin PNG e o pacote `.mcpack` será gerado automaticamente no mesmo diretório.

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
