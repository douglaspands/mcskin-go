# Proposal

## Why

Today "regression testing" in mcskin is a single fixed 7-phase script (`scripts/run-regression-suite.sh`) that nobody is required to extend when a feature ships, and it has no coverage for appearance at all: its UI phase greps `id="..."` strings out of `index.html`/`style.css` instead of checking a running page, and `tests/editor-file-loader.test.js` — the one real behavioral test file — is never actually executed (the script only runs `node --check` for syntax, never `node --test`). A component can be visually broken, mispositioned, or covered by another element and the suite still reports green. As the skin editor grows (16 requirements already, spanning 3D viewport, 2D sheet, fullscreen, touch tools), nothing forces each new feature to leave behind a regression test that protects it — and nothing checks that earlier features still render and sit where they should after a new one lands.

## What Changes

- Introduce a cumulative, living regression suite: every feature that touches the UI adds its own test file to a suite that keeps growing and keeps running in full on every future change — true accumulation, not a fixed script.
- Cover both behavior/functionality (interactions, state, DOM presence) and appearance (visual pixel-level comparison against versioned baselines) in the same suite.
- Add a component-inventory gate: at the end of every regression run, every screen component (buttons, panels, controls) is checked to still exist, still function, and still sit in its expected screen region — not just "the id exists somewhere in the HTML source."
- Fix the existing gap where `tests/editor-file-loader.test.js` is written but never executed by the regression pipeline.
- Wire the regression suite into the existing `/opsx-apply` -> `feature-qa-reviewer` -> `/opsx-archive` lifecycle so it becomes a real gate, not a manually-run script.
- **BREAKING (governance)**: relax the absolute "zero external dependency" rule in `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`/`openspec/config.yaml` so development/test tooling may use an appropriate external framework when justified. The production Go binary and the frontend actually served to users remain dependency-free — this change introduces the project's first `package.json` (a devDependency tree for browser-driven testing), never bundled into `bin/mcskin` or `internal/web/static/`.
- Add a token-optimization requirement: at the close of every proposal, evaluate whether a reusable Claude Code skill would reduce future token spend on the same kind of work (test authoring, screenshot capture, diff triage, etc.) and surface that suggestion — and, separately, evaluate the feature's own build process for optimizers (subagent offload points, compact-reporting opportunities) before work starts.
- All new regression tooling follows the project's existing silent-on-success, subagent-offloaded token economy (`./scripts/test-compact.sh` pattern) rather than dumping verbose reports into the AI context window.

## Capabilities

### New Capabilities
- `regression-suite`: Cumulative, living functional + visual regression testing for the mcskin web UI. Defines how each feature contributes its own regression test, how visual baselines are captured and diffed, and how the component-inventory (presence + position + function) gate runs at the end of every regression cycle.

### Modified Capabilities
- `token-optimization`: adds a requirement for end-of-proposal skill/process-optimization suggestions, and a requirement clarifying the boundary between zero-dependency production code and dependency-permitted dev/test tooling (including keeping that tooling's own output token-compact).
- `git-workflow`: adds a requirement that the proposal step of the change lifecycle always synchronizes `main` (`git checkout main && git pull origin main`) before creating the `feat/<name>` isolation branch, formalized identically across every AI harness and agent definition that can initiate a proposal (not just one harness's config).

## Impact

- **New**: `package.json` + lockfile (devDependencies only, first npm usage in this repo), a regression test directory holding one growing set of behavioral + visual test files, versioned visual baseline images, a compact custom test reporter.
- **Modified**: `scripts/run-regression-suite.sh` (wire in the new suite, fix the dead `node --test` gap), `.gitignore` (node_modules/test-artifact exclusions), and the full set of governance/harness files that currently define proposal branching and dependency rules so the pull-before-branch and dependency-boundary directives read identically everywhere: `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.agents/governance.md`, `openspec/config.yaml`, `.claude/skills/openspec-propose/SKILL.md`, `.agents/skills/openspec-propose/SKILL.md`, `.agents/workflows/opsx-propose.md`.
- **Unaffected**: `cmd/`, `internal/` Go packages and the shipped `internal/web/static/` frontend — no runtime code changes, no new Go module requires, no npm/bundler step added to how the app is built or served.
- **Process**: `/opsx-apply` and `/opsx-archive` guidance gain a step requiring the accumulated suite to pass (not just the new feature's own test) before PO/QA sign-off.
