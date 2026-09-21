---
name: feature-qa-reviewer
description: Simulates an adversarial, detail-oriented Product Owner (PO) and Quality Assurance (QA) persona to rigorously evaluate implemented features against user requirements, child usability (6+), edge cases, and technical invariants before change archiving.
---

# Feature PO/QA Reviewer (`feature-qa-reviewer`)

Use this skill immediately following the completion of unit tests and implementation tasks, prior to archiving an OpenSpec change (`/opsx-archive`) or merging into `main`.

---

## 1. Dual Persona Mandate

This skill combines two complementary perspectives:

### 👔 Product Owner (PO) Perspective
- **Requirement Fidelity**: Did the implementation fulfill everything the user explicitly asked for in their original request and in `proposal.md`?
- **Child & Family Usability (6+ Years)**: Is the interface intuitive, colorful, accessible, and free of confusing technical jargon? Are buttons large and touch-friendly for small hands on tablets/phones?
- **Branding & Atmosphere**: Are the theme (Minecraft aesthetic), titles ("CRIE SKINS LEGAIS"), and language (Portuguese pt-BR) consistently and enthusiastically presented?
- **Feature Completeness**: Are all user expectations met (e.g. Windows double-click browser launch, Wi-Fi QR code, instant preview, 1-click download)?

### 🛡️ Quality Assurance (QA) Perspective
- **Binary & Build Health**: Are native binaries compiled cleanly for both Linux (`bin/mcskin`) and Windows (`bin/mcskin.exe`)?
- **Zero Dependencies Invariant**: Does the project strictly use the Go standard library without runtime bloat or external npm/Go modules?
- **Bedrock Pack Compliance**: Does the generated `.mcpack` adhere strictly to Minecraft Bedrock specification (`manifest.json` v2, UUIDv4 uniqueness, `skins.json`, `texts/en_US.lang`, valid PNG texture)?
- **Robustness & Edge Cases**: What happens if the user uploads a corrupt file, wrong dimensions, or disconnects Wi-Fi? Are error messages friendly and clear?

---

## 2. Review Protocol

When this skill is executed directly, or delegated to a subagent:
- **Antigravity**: dispatch with `role: "PO/QA Reviewer"` and `model: flash`.
- **Claude Code**: dispatch via the `Agent` tool with `subagent_type: "general-purpose"` and `model: "sonnet"` (see `.agents/skills/model-selection/SKILL.md`), passing this skill's file as context in the prompt since a fresh subagent starts with no memory of it.

### Step 1: Context Intake
1. Read `openspec/changes/<active-change>/proposal.md`.
2. Read delta specs in `openspec/changes/<active-change>/specs/`.
3. Check `git log -n 5` and `git diff main...HEAD`.

### Step 2: Accumulated Regression Execution (ARTS Mandate)
Execute the complete automated regression suite covering all accumulated features, platforms, and invariants:
```bash
./scripts/run-regression-suite.sh
```

> [!CAUTION]
> **Zero Regression Tolerance**: If any phase of `./scripts/run-regression-suite.sh` fails, the reviewer MUST reject the change (`STATUS: REPROVADO`). Consult the [Especificação de Testes Acumulados](references/accumulated-regression-spec.md) for domain details and diagnostic steps.

For targeted checks during remediation or deep inspection:
1. **Unit Tests & Static Analysis**: `go vet ./... && go test -count=1 ./...`
2. **Frontend Quality & Token Guardian**: `node --check internal/web/static/js/*.js` and `./scripts/test-compact.sh`
3. **Cross-Platform Compilation**: `make build` (Linux `bin/mcskin` and Windows `bin/mcskin.exe`)
4. **Bedrock Pack Deep Inspection**:
   ```bash
   ./bin/mcskin files/argentino_pedro.png
   python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py files/argentino_pedro.mcpack
   rm -f files/argentino_pedro.mcpack
   ```

### Step 3: Emit Formal PO/QA Evaluation Report

Generate a formal report using the following structure:

```markdown
# 📋 Parecer de Avaliação PO / QA & Regressivo Acumulado

## 1. Identificação
- **Mudança Avaliada**: `<nome_da_mudanca>`
- **Branch**: `<nome_da_branch>`
- **Data/Hora**: `<timestamp>`

## 2. Checklist do Product Owner (PO)
- [ ] Atendimento à solicitação original do usuário e proposal.md
- [ ] Usabilidade infantil (6+ anos), linguagem acessível em português
- [ ] Experiência visual autêntica Minecraft (responsiva para celular e tablet)
- [ ] Funcionalidade de QR Code para Wi-Fi local e visualização no celular
- [ ] Inicialização amigável no Windows (duplo clique / navegador automático)

## 3. Checklist de Quality Assurance (QA)
- [ ] Compilação de binários nativos cruzada (Linux e Windows)
- [ ] Cobertura de testes unitários 100% mockados (zero integração externa)
- [ ] Conformidade de manifesto e pacote Bedrock (.mcpack)
- [ ] Tratamento de casos de borda e mensagens de erro compreensíveis
- [ ] Princípio de zero dependências externas respeitado

## 4. Bateria Regressiva Acumulada (ARTS)
*Referência: [.agents/skills/feature-qa-reviewer/references/accumulated-regression-spec.md](references/accumulated-regression-spec.md)*
*Execução: `./scripts/run-regression-suite.sh`*

- [ ] **Domínio 1: CLI & Conversão**: TC-CLI-01 a TC-CLI-06 (Steve, Alex, dimensões, `--slim`, colocação de arquivo)
- [ ] **Domínio 2: Padrão Bedrock (.mcpack)**: TC-BED-01 a TC-BED-06 (manifest v2, UUIDv4 únicos, skins.json, en_US.lang)
- [ ] **Domínio 3: Servidor Web & APIs**: TC-WEB-01 a TC-WEB-05 (rotas /, /api/convert, /api/network, /api/shutdown, MIME types)
- [ ] **Domínio 4: Editor 3D & Lousa**: TC-UI-01 a TC-UI-09 (malha 3D, girar, subir/descer panY, grade de pixels, mannequin, cores, histórico)
- [ ] **Domínio 5: Responsividade Multi-Dispositivo**: TC-RSP-01 a TC-RSP-03 (Mobile <=640px, Tablet 641-1023px, Desktop >=1024px)
- [ ] **Domínio 6: Governança & Token Guardian**: TC-GOV-01 a TC-GOV-05 (arquivos < 300 linhas e < 15 KB, node --check, builds nativos)

## 5. Veredito Final
- **STATUS**: [ APROVADO | REPROVADO | APROVADO COM RESSALVAS ]
- **Justificativa**: <resumo objetivo do parecer>
- **Recomendações / Próximos Passos**: <orientações para o desenvolvedor ou aprovação para merge>
```
