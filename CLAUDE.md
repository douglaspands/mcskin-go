# Claude Code Project Guidelines

Please strictly follow the rules and procedures defined in [AGENTS.md](AGENTS.md):
- **Architecture**: Go standard library only (zero external dependencies), cross-platform Linux/Windows, deterministic output.
- **Methodology**: Strict Test-Driven Development (TDD). Tests must be written and verified failing (RED) before implementing application logic (GREEN).
- **OpenSpec**: Use `/opsx:propose`, `/opsx:apply`, and `/opsx:archive` for feature lifecycles.
- **Allowed Harmless Commands**: `go test ...`, `go build ...`, `go vet ...`, `go run ...`, `go fmt ...`, `go mod tidy`, `make`, `git status`, `git diff`, `git add`, `git commit`.
- **Prohibited Destructive Commands**: Never execute `rm -rf` outside build artifacts, `git push --force`, `git reset --hard`, `git clean -f`, or privilege escalation (`sudo`).
- **Governance**: State graph phases, max 3-iteration cap per failure, halt on repeated errors, token optimization.
