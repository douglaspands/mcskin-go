# Gemini & Antigravity Project Rules: `mcskin`

Canonical AI agent governance policy (state graph, TDD, loop engineering, permission tiers, command safety gate, host security, I/O optimization, environment tooling) lives in [AGENTS.md](AGENTS.md) — read it first. [.agents/governance.md](.agents/governance.md) is a legacy pointer to the same document. This file lists only Antigravity/Gemini-unique facts.

- **Hook Registration**: The command safety gate's `PreToolUse` hook is registered in `.agents/hooks.json`, invoking the single canonical `scripts/command-gate.py`. Antigravity's hook contract consumes the script's `allow` / `ask` / `deny` decision directly — no separate allowlist file is needed (unlike Claude Code's two-layer allowlist + hook).
- **Subagent Dispatch Syntax**: Use `invoke_subagent` with its default `Model: inherit` so subagent dispatches always use the model the user selected/configured in Antigravity — see AGENTS.md's Parallel Dispatch & Model Selection section.
- **Tool-Specific I/O Syntax**: Antigravity's file tools use `replace_file_content` for contiguous block replacement and `WaitMsBeforeAsync: 3000-5000` for bounded synchronous command waits.
- **Skills** (`.agents/skills/`): `bedrock-skin-pack-verifier`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-propose`, `openspec-sync-specs`, `openspec-update-change`, `prototype-iteration-loop`, `static-server-dev`, `token-guardian`, `ui-component-library-ref`, `web-prototype-scaffold`.
- **OpenSpec Workflows**: `/openspec-explore`, `/openspec-apply-change`, `/openspec-archive-change`, `/openspec-propose`, `/openspec-sync-specs`, `/openspec-update-change`.
