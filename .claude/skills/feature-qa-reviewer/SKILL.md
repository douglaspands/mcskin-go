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
- **Antigravity**: dispatch with `role: "PO/QA Reviewer"` and `model: pro`.
- **Claude Code**: dispatch via the `Agent` tool with `subagent_type: "general-purpose"` and `model: "opus"` (see `.agents/skills/model-selection/SKILL.md`), passing this skill's file as context in the prompt since a fresh subagent starts with no memory of it.

### Step 1: Context Intake
1. Read `openspec/changes/<active-change>/proposal.md`.
2. Read delta specs in `openspec/changes/<active-change>/specs/`.
3. Check `git log -n 5` and `git diff main...HEAD`.

### Step 2: Verification Execution
1. Run static analysis and full test suite:
   ```bash
   go vet ./...
   go test -v ./...
   ```
2. Verify binaries compile:
   ```bash
   make build
   ```
3. Test sample skin conversion and verify with the Bedrock verifier skill:
   ```bash
   ./bin/mcskin files/argentino_pedro.png
   python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py files/argentino_pedro.mcpack
   rm -f files/argentino_pedro.mcpack
   ```

### Step 3: Emit Formal PO/QA Evaluation Report

Generate a formal report using the following structure:

```markdown
# 📋 Parecer de Avaliação PO / QA

## 1. Identificação
- **Mudança Avaliada**: `<nome_da_mudanca>`
- **Branch**: `<nome_da_branch>`
- **Data/Hora**: `<timestamp>`

## 2. Checklist do Product Owner (PO)
- [ ] Atendimento à solicitação original do usuário
- [ ] Usabilidade infantil (6+ anos), linguagem acessível em português
- [ ] Experiência visual autêntica Minecraft (responsiva para celular e tablet)
- [ ] Funcionalidade de QR Code para Wi-Fi local
- [ ] Inicialização amigável no Windows (duplo clique / navegador automático)

## 3. Checklist de Quality Assurance (QA)
- [ ] Compilação de binários nativos (Linux e Windows)
- [ ] Cobertura de testes unitários 100% mockados (zero integração externa)
- [ ] Conformidade de manifesto e pacote Bedrock (.mcpack)
- [ ] Tratamento de casos de borda e mensagens de erro compreensíveis
- [ ] Princípio de zero dependências externas respeitado

## 4. Veredito Final
- **STATUS**: [ APROVADO | REPROVADO | APROVADO COM RESSALVAS ]
- **Justificativa**: <resumo objetivo do parecer>
- **Recomendações / Próximos Passos**: <orientações para o desenvolvedor ou aprovação para merge>
```
