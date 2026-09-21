# Proposal: Melhorar README com Foco na Interface Web e Uso Infantil

## Why

O `mcskin` foi concebido como um ambiente seguro, lúdico e intuitivo para que crianças pequenas (a partir de 6 anos) possam criar e instalar suas próprias skins no Minecraft Bedrock sem as armadilhas comuns da internet (anúncios invasivos, botões falsos de download, riscos de vírus ou cadastros obrigatórios).

Atualmente, o `README.md` ainda inicia com ênfase técnica e opções de linha de comando (CLI), competindo espaço com o verdadeiro diferencial do projeto: a interface web ("CRIE SKINS LEGAIS") que roda no navegador, sem necessidade de instalação, acessível em celulares e tablets via QR Code na rede Wi-Fi local. É necessário reestruturar o README seguindo as melhores práticas open-source para dar protagonismo imediato à experiência web e à usabilidade infantil, mantendo o guia técnico bem organizado e não intimidante.

## What Changes

- **Reestruturação da Abertura & Hero**: Badges visuais de destaque (Crianças 6+, 100% Offline, Zero Anúncios, Go 1.25+, Bedrock Oficial) e proposta de valor clara focada em segurança familiar e facilidade de uso.
- **Seção "Por que o `mcskin` foi criado?"**: Tabela comparativa e direta contrastando o ambiente hostil de criadores de skins na web com a segurança, anonimato e privacidade local do `mcskin`.
- **Guia Rápido em 3 Passos**: Passo a passo ilustrado para pais e crianças (1. Iniciar no PC, 2. Conectar tablet/celular via QR Code, 3. Pintar e abrir no Minecraft com 1 toque).
- **Vitrine Completa da Interface Web**: Destaque das capturas de tela do editor 3D/2D, modal de nova skin, navegação móvel e conversor rápido, ressaltando a ergonomia infantil (botões de 64px+, alternador "Pintar/Girar" anti-borrão, layout 100dvh sem rolagem e importação inteligente de imagens geradas por IA).
- **Passo a Passo de Instalação Bedrock Acolhedor**: Instruções claras de como importar o `.mcpack` no Windows e em dispositivos móveis (Vestiário > Capas Clássicas).
- **Organização Limpa do Modo CLI & Guia do Desenvolvedor**: Movimentação das flags avançadas de linha de comando e do guia de compilação Go para seções dedicadas e organizadas, sem poluir a experiência inicial do usuário comum.

## Capabilities

### New Capabilities

*(Nenhuma nova funcionalidade no sistema; mudança estritamente focada em documentação e apresentação do repositório)*

### Modified Capabilities

*(Nenhuma alteração em requisitos funcionais de software; change configurada com `skip_specs: true`)*

## Impact

- **Documentação**: Atualização substancial do arquivo `README.md` na raiz do repositório.
- **Código & Binários**: Nenhum impacto no código Go (`cmd/`, `internal/`) ou dependências (zero dependências externas mantido).
