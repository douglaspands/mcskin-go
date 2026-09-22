# Claude Code Project Guidelines

Canonical AI agent governance policy (state graph, TDD, loop engineering, permission tiers, command safety gate, host security, I/O optimization, environment tooling) lives in [AGENTS.md](AGENTS.md) — read it first. This file lists only Claude-Code-unique facts.

- **Settings & Hook File**: The command safety gate's `PreToolUse` hook and the `permissions.allow` Tier-1 allowlist are registered in `.claude/settings.json` (project-level, committed).
- **OpenSpec Slash Commands**: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, `/opsx:explore`, `/opsx:sync`, `/opsx:update`.
- **Skills** (`.claude/skills/`): `bedrock-skin-pack-verifier`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-propose`, `openspec-sync-specs`, `openspec-update-change`, `prototype-iteration-loop`, `static-server-dev`, `token-guardian`, `ui-component-library-ref`, `web-prototype-scaffold`.
