# Claude Code Project Guidelines

Please strictly follow the rules and procedures defined in [AGENTS.md](AGENTS.md):
- **Architecture**: Go standard library only (zero external dependencies), cross-platform Linux/Windows/macOS (Apple Silicon arm64), deterministic output. Browser-native ES6 modules only (no npm/bundlers).
- **Token Economy & Modularity ("Nascem Otimizadas")**: All application files in `cmd/`, `internal/`, and `internal/web/static/js/` MUST stay under 300 lines and 15 KB. Third-party vendor libraries reside exclusively in `internal/web/static/vendor/`. Use `./scripts/test-compact.sh` for silent-on-success testing and the `token-guardian` skill to inspect file sizes. Offload verbose investigation loops to subagents.
- **Methodology & TDD**: Strict Test-Driven Development (TDD). Tests must be verified failing (RED) before implementing code (GREEN).
- **Unit Test Mocking**: All unit tests must be 100% mocked with zero external integration (use in-memory buffers/readers; no network or external process calls). Integration tests must be explicitly segregated.
- **Host & Environment Security**: Strictly confined to workspace root. Zero privilege escalation (`sudo`/`su`). Air-gapped test runs. Bounded 30s execution timeouts.
- **OpenSpec**: Use `/opsx-propose`, `/opsx-apply`, and `/opsx-archive` for feature lifecycles.
  - **First Step on Propose**: The first action upon initiating a proposal MUST be `git checkout -b feat/<nome_spec>` for rollback isolation.
  - **Squash Merge or Pull Request on Archive**: After archiving completes, prompt user to choose between local squash merge into `main` (`git checkout main && git merge --squash feat/<nome_spec>`) or creating a GitHub Pull Request (`git push origin feat/<nome_spec> && gh pr create ...`).
- **Allowed Harmless Commands**: `go test ...`, `go build ...`, `go vet ...`, `go run ...`, `go fmt ...`, `go mod tidy`, `make ...`, `./scripts/test-compact.sh`, `./scripts/package-mac-app.sh`, `git status`, `git diff`, `git add`, `git commit`, `git checkout -b feat/...`, `git checkout main`, `git merge --squash ...`, `git push origin feat/...`, `gh pr ...`.
- **Prohibited Destructive Commands**: Never execute `rm -rf` outside build artifacts, `git push --force`, `git reset --hard`, `git clean -f`, or privilege escalation (`sudo`).
- **Governance**: State graph phases, max 3-iteration cap per failure, halt on repeated errors, token optimization.
