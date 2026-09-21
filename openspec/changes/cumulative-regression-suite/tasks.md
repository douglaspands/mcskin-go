# Tasks

## 1. Branch & Environment Setup

- [x] 1.1 Confirm work happens on `feat/cumulative-regression-suite` (already created) and verify with `git branch --show-current`
- [x] 1.2 Verify Node/npm are available via the `asdf`-managed toolchain (`node --version`, `npm --version`) without any global install, per `AGENTS.md` Zero Global Installs rule

## 2. Governance & Harness Documentation Sync

- [x] 2.1 Update the proposal-first-step wording identically in `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.agents/governance.md`, `openspec/config.yaml` (`rules.proposal`), `.claude/skills/openspec-propose/SKILL.md`, `.agents/skills/openspec-propose/SKILL.md`, and `.agents/workflows/opsx-propose.md` to require `git checkout main && git pull origin main` before `git checkout -b feat/<name>`, and verify with `grep -rn "pull origin main" <each file>` returning a match in every one
- [x] 2.2 Update the "zero external dependencies" Architecture bullet in `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` to state the production-vs-tooling boundary from the `token-optimization` spec delta (production binary and served frontend stay dependency-free; dev/test tooling may declare dependencies), and verify by re-reading each file for the updated wording
- [x] 2.3 Add the end-of-proposal skill/process-optimization evaluation step to `.claude/skills/openspec-propose/SKILL.md` and `.agents/skills/openspec-propose/SKILL.md`, and verify both files describe the same evaluation step

## 3. Playwright Scaffold (RED)

- [x] 3.1 Create `package.json` (devDependencies only: `@playwright/test`) and verify `npm install` completes with zero entries outside `devDependencies`
- [x] 3.2 Create `playwright.config.ts` with `webServer` launching `go run ./cmd/mcskin --web --port 8990 --no-browser` and three projects (desktop 1280x800, tablet ~800x1024, mobile 420x840, matching `scripts/capture-screenshots.mjs`'s existing viewports) and verify `npx playwright test --list` enumerates all three projects with zero test files yet
- [x] 3.3 Create empty `tests/regression/component-inventory.json` (`[]`) and write `tests/regression/component-inventory.spec.ts` that reads it and asserts each entry; run it and verify it passes trivially on an empty inventory (RED baseline: no coverage yet, not a failing test)
- [x] 3.4 Update `.gitignore` to exclude `node_modules/`, `test-results/`, and `playwright-report/`, and verify `git status -s` shows none of those paths after a local test run

## 4. Component Inventory & Placement Gate (RED -> GREEN)

- [x] 4.1 Port every existing Fase 7 grep check from `scripts/run-regression-suite.sh` (`#editor3DCanvas`, `#btnToggleGrid`, `#btnPanUp`, `#btnPanDown`, `#desktopSidebarMenu`) into `component-inventory.json` entries with `selector`, `expectedRegion` per viewport, and `addedBy: "cumulative-regression-suite"`; run `component-inventory.spec.ts` and verify it now fails (RED) because assertions exist but the gate logic isn't implemented yet
- [x] 4.2 Implement the inventory-driven assertions (visibility, interactability, `boundingBox()` within `expectedRegion`) in `component-inventory.spec.ts` across all three viewport projects, and verify the suite goes GREEN (`npx playwright test component-inventory`)
- [x] 4.3 Verify a deliberately displaced/hidden component fails the gate: temporarily rename one inventoried `id` in a scratch copy, confirm the run fails and names that exact component and viewport, then discard the scratch change

## 5. Behavioral & Visual Regression Specs for Existing Features

- [x] 5.1 Write `tests/regression/skin-editor-3d-2d-toggle.spec.ts` covering `#btnMode2D`/`#btnMode3D` switching behavior (skin-editor spec: "Switching to 2D unwrapped sheet view" / "Toggling from 2D back to 3D view mode"), and verify it fails RED before any snapshot exists, then run `--update-snapshots` once to establish baselines and verify GREEN on a second run
- [x] 5.2 Write `tests/regression/skin-editor-mobile-drawer.spec.ts` covering the hamburger-menu mobile drawer at the 420x840 project, reusing the interaction already scripted in `scripts/capture-screenshots.mjs`, and verify GREEN after baseline capture
- [x] 5.3 Write `tests/regression/converter-tab.spec.ts` covering the PNG-to-mcpack converter tab switch, and verify GREEN after baseline capture
- [x] 5.4 Set `maxDiffPixelRatio` tolerance in `playwright.config.ts` per Design Decision 4, and verify a trivial unrelated CSS whitespace change does not trip a visual failure while a deliberate color change to a tested element does

## 6. Compact Reporter & Pipeline Wiring

- [x] 6.1 Implement `tests/regression/reporters/compact-reporter.ts` (silent-on-success single line; on failure: test title, component/state name, diff-image path only), and verify by running one passing and one intentionally-failing suite and inspecting stdout length/content
- [x] 6.2 Fix `scripts/run-regression-suite.sh` Fase 2 to run `node --test tests/*.test.js` (not only `node --check`), and verify `tests/editor-file-loader.test.js` now actually executes (confirm via the compact runner's pass/fail line changing if a test is intentionally broken)
- [x] 6.3 Replace Fase 7's grep-only checks in `scripts/run-regression-suite.sh` with `npx playwright test --reporter=./tests/regression/reporters/compact-reporter.ts`, and verify a full `./scripts/run-regression-suite.sh` run reports 7 phases still, with Fase 7 now driven by the real suite
- [x] 6.4 Verify the full regression suite executes cleanly on Linux (current environment) and document the equivalent Windows invocation in a short note inside `scripts/run-regression-suite.sh`'s header comment, since Windows execution itself cannot be verified from this environment

## 7. Change-Lifecycle Gate Wiring

- [x] 7.1 Add a precondition step to `openspec/config.yaml` `operations.apply.guidance` requiring `./scripts/run-regression-suite.sh` to pass before `feature-qa-reviewer` runs, and verify by re-reading the updated guidance list
- [x] 7.2 Add the matching precondition to `.claude/skills/openspec-apply-change/SKILL.md` and `.agents/skills/openspec-apply-change/SKILL.md` (or their current equivalents) so every harness enforces the same gate, and verify both files reference the regression suite before the PO/QA step

## 8. Final Verification

- [x] 8.1 Run `./scripts/test-compact.sh` and confirm `PASS: all packages OK` (Go suite untouched by this change)
- [x] 8.2 Run `./scripts/run-regression-suite.sh` end-to-end and confirm all 7 phases pass, including the now-live behavioral, visual, and component-inventory checks
- [x] 8.3 Confirm `go build ./...` and `make build` remain unaffected (no new Go module requires introduced), verifying `go.mod` is unchanged by this branch
- [x] 8.4 Run `feature-qa-reviewer` and record its verdict before requesting `/opsx-archive` — **VERDICT: APROVADO COM RESSALVAS** (7/7 regression phases pass, dependency boundary and governance sync verified against real files, no blocking defects; 2 non-blocking notes: `#dockHintStrip` text-update assertion in `skin-editor-3d-2d-toggle.spec.ts` is only implicitly covered by screenshot diff rather than an explicit assertion, and local `main` is behind `origin/main` — unrelated to this change's diff)
