# Tasks: Enforce Archive Git Rules and Main Protection

## 1. Documentation and Guideline Formalization

- [x] 1.1 Update `AGENTS.md` and `GEMINI.md` to specify mandatory archive commits on feature branch and strict main protection
- [x] 1.2 Update `CLAUDE.md` and `.agents/governance.md` with Tier 3 prohibition of direct commits on main
- [x] 1.3 Update `.agents/workflows/opsx-archive.md` and `openspec-archive-change/SKILL.md` to include git commit in archive step and post-PR invariants
- [x] 1.4 Update `openspec/config.yaml` git conventions and archive guidance

## 2. Mechanical Safety Gate Enforcement

- [x] 2.1 Update `.agents/scripts/command-gate.py` to intercept and deny `git commit` commands executed on main
- [x] 2.2 Verify mechanical denial of direct commits on main and permission of squash merge via python test execution

## 3. Verification

- [x] 3.1 Validate OpenSpec artifacts with `openspec validate archive-git-rules-and-main-protection`
- [x] 3.2 Verify test suite execution (`go test ./...`)
