# Design

## Context

See `proposal.md` - Why/What Changes for motivation. Relevant current state:

- `scripts/run-regression-suite.sh` is a fixed 7-phase bash script. Its "UI" phase (Fase 7) greps `id="..."` strings out of `internal/web/static/index.html`/`style.css` — it never loads a browser.
- `scripts/capture-screenshots.mjs` already proves out a zero-npm pattern for driving headless `google-chrome` via raw Chrome DevTools Protocol (CDP) calls over a `WebSocket`, but it only saves JPGs for docs — no baseline, no diff, no assertion, no pass/fail.
- `tests/editor-file-loader.test.js` is a real `node --test` unit suite for pure functions, but `run-regression-suite.sh` Fase 2 only runs `node --check` (syntax), so it never actually executes.
- `cmd/mcskin --web --port <p> --no-browser` starts the embedded HTTP server headlessly on a given port (`cmd/mcskin/main.go`) — this is how the app under test gets served; nothing currently automates starting/stopping it for a test run.
- No `package.json` exists anywhere in the repo today.

## Goals / Non-Goals

**Goals:**
- Define the concrete mechanism by which each future feature contributes exactly one growing regression artifact (test file + component-inventory entries), not a one-off script edit.
- Define how visual baselines are stored, diffed, and updated deliberately (vs. drifting silently).
- Define the component-inventory data shape and how it generalizes today's hardcoded Fase 7 greps into live, cross-viewport DOM assertions.
- Keep the regression tooling's own token footprint small (compact reporter, targeted subagent execution).

**Non-Goals:**
- Not introducing CI (GitHub Actions) wiring — `run-regression-suite.sh` stays a locally/agent-invoked script for now; CI wiring is a separate, later decision once the suite has proven stable.
- Not touching `cmd/`, `internal/` production packages, or how the app is built/served — this is test-tooling only.
- Not redesigning `feature-qa-reviewer`'s PO/QA checklist itself — this change only adds a precondition (accumulated suite must pass) before that review runs.

## Decisions

### 1. Test framework: Playwright (Node devDependency), not a hand-rolled CDP extension

`capture-screenshots.mjs` (~225 lines) already hand-rolls a CDP client (`WebSocket` + JSON-RPC id/pending map) just to take screenshots with no assertions. Extending that by hand to also do: retries on flaky renders, pixel-diff against baselines with tolerance, per-viewport projects, and readable failure reports, is reinventing a mature tool at high token/maintenance cost over time (this is exactly the kind of repetitive investigation loop `token-optimization` asks to avoid). Playwright provides `expect(page).toHaveScreenshot()` (accumulating, auto-managed baselines with tolerance config), `locator.boundingBox()`/`isVisible()` for the component-inventory gate, and a `webServer` config option to start/stop the app under test automatically.

Alternatives considered:
- **Extend `capture-screenshots.mjs` + write a Go stdlib `image/png` pixel-diff tool** — stays "zero dependency" in the strictest sense, but doubles the surface to maintain (custom CDP driver *and* custom diff tool) for something a standard tool already solves well; rejected per the governance decision in `proposal.md` to permit dev/test-only dependencies.
- **Puppeteer** — comparable CDP wrapper, but no first-class visual-regression assertion (`toHaveScreenshot`) or multi-viewport `projects` config; would still need a bolted-on diff library.
- **Go-based headless browser (chromedp)** — stays inside the Go module graph (no `package.json`), but `chromedp` has no built-in snapshot/diff tooling either, so it doesn't remove the "hand-roll the diff logic" problem, and it would pull an external dependency into the same module graph as the production binary (`go.mod`), which is a sharper line to cross than a devDependency-only `package.json` that never touches `go build`.

### 2. Directory layout and accumulation mechanism

```
package.json                          <- new, devDependencies only (@playwright/test)
playwright.config.ts                  <- webServer: `go run ./cmd/mcskin --web --port <p> --no-browser`
                                          projects: desktop (1280x800) / tablet (~800x1024) / mobile (420x840),
                                          reusing the exact viewports capture-screenshots.mjs already uses
tests/regression/
  component-inventory.json            <- ADDED TO, never replaced wholesale: {id, selector, expectedRegion, addedBy: "<change-name>"}
  <feature-slug>.spec.ts              <- one file per feature that touched the UI, e.g.
                                          skin-editor-2d-mode.spec.ts, skin-editor-fullscreen.spec.ts
  <feature-slug>.spec.ts-snapshots/   <- Playwright-managed baseline PNGs, one dir per spec file
  reporters/compact-reporter.ts       <- silent-on-success custom Reporter
```

The accumulation rule from the spec ("each change adds a test file, none are deleted without justification") is enforced structurally: a new feature's task list requires (a) a new `<feature-slug>.spec.ts` file and (b) new entries appended to `component-inventory.json` tagged with `addedBy: "<change-name>"` — never replacing the array. `run-regression-suite.sh` always runs the *entire* `tests/regression/` directory, so old spec files execute by default; there is nothing to "wire in" per feature beyond adding the file.

### 3. Component-inventory gate replaces the Fase 7 greps

Today's Fase 7 checks (`grep -q 'id="editor3DCanvas"'`, etc.) become entries in `component-inventory.json`. A single generic Playwright test (`tests/regression/component-inventory.spec.ts`) reads that JSON and, per `projects` (desktop/tablet/mobile), asserts each entry's selector is visible, interactable, and its `boundingBox()` falls inside `expectedRegion`. This is the concrete implementation of the spec's "Component Inventory & Placement Gate" and "Cross-Viewport Component Check" requirements, and it turns a hardcoded bash list into a data file every future change extends.

### 4. Visual diff tolerance and baseline updates

`playwright.config.ts` sets a single project-wide `maxDiffPixelRatio` (small, e.g. 1%) to absorb anti-aliasing/font-rendering noise between machines while catching real drift. A baseline is only ever updated deliberately (`playwright test --update-snapshots`, run and committed intentionally as part of a change's tasks), never silently regenerated by a normal run — matching the spec's "deliberate baseline update... justified" scenario.

### 5. Compact reporter for token economy

`tests/regression/reporters/compact-reporter.ts` implements Playwright's `Reporter` interface: on success, one line (`PASS: N regression checks OK`); on failure, only the failing test title, the component/screen-state name, and the path to Playwright's generated diff image — never the full HTML report. `scripts/run-regression-suite.sh` invokes it via `npx playwright test --reporter=./tests/regression/reporters/compact-reporter.ts`, and its Fase 2 is corrected to also run `node --test tests/*.test.js` (fixing the dead unit-test gap) before the Playwright pass.

### 6. Proposal-closure optimization check and git-pull-before-branch directive

Both are documentation/governance changes with no runtime component: the `token-optimization` delta requirement is satisfied by adding an explicit checklist step to the proposal-authoring instructions (`.claude/skills/openspec-propose/SKILL.md`, `.agents/skills/openspec-propose/SKILL.md`) that prompts for the optimization evaluation before a proposal is considered done; the `git-workflow` delta requirement is satisfied by editing the "first step" wording identically into every harness/agent file listed in `proposal.md` - Impact. No new scripts are needed for either.

## Risks / Trade-offs

- **[Risk] Playwright's browser binaries (`npx playwright install chromium`) require a download the first time, conflicting with "air-gapped test runs."** → Mitigation: this download happens once during environment setup (like `go mod download` or `asdf install`), not on every test run; document it as a one-time setup step alongside the existing `.tool-versions`-driven runtime install, and note in `AGENTS.md` that CI/agent environments should pre-provision the Chromium binary rather than fetching it mid-run.
- **[Risk] Visual baselines are binary PNGs committed to git, which can bloat repo size and diff review over time.** → Mitigation: keep baselines small (viewport-cropped where possible, as `capture-screenshots.mjs` already does for the modal shot) and JPEG-quality-equivalent compression where Playwright allows it; revisit storage strategy (e.g. Git LFS) only if the baseline directory grows large enough to matter.
- **[Risk] Cross-machine font/GPU rendering differences cause false-positive visual failures.** → Mitigation: the `maxDiffPixelRatio` tolerance (Decision 4) and pinning a single browser engine (Chromium, matching the project's `/usr/bin/google-chrome` convention) rather than running the multi-browser matrix Playwright supports by default.
- **[Trade-off] Introducing `package.json` is a one-way architectural door for this repo (first-ever npm dependency tree).** → Accepted per explicit user confirmation in exploration; scoped tightly to devDependencies via the new `token-optimization` requirement (Development & Test Tooling Dependency Boundary) so it cannot silently expand into production code.
