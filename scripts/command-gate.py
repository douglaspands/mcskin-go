#!/usr/bin/env python3
"""Canonical command safety gate, shared by every supported harness.

Antigravity invokes this via .agents/hooks.json (PreToolUse, run_command),
reading a top-level {"decision": "allow"|"deny"|"ask"} JSON body from stdout.
Claude Code invokes it via .claude/settings.json's PreToolUse hook and
validates stdout JSON against its own schema, which has no top-level
"decision" field for allow/ask (that field is a legacy approve|block-only
shape from other hook events) — it requires
{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision":
"allow"|"deny"|"ask", ...}} instead. The script emits whichever shape matches
the harness that invoked it (see "Polyglot harness input and exit code
compatibility" in specs/agent-governance/spec.md), and a denial still exits
non-zero with the reason on stderr for good measure.
"""
import json
import re
import subprocess
import sys


def evaluate_command(cmd: str):
    cmd_clean = cmd.strip()

    # 1. Deny destructive patterns
    destructive_patterns = [
        (r'\brm\s+-[a-zA-Z]*[rR][a-zA-Z]*\s+(?:/|\*|\.|\.\.|\.git|~|\$HOME)(?:\s|$)', "Unbounded or dangerous recursive deletion", re.IGNORECASE),
        (r'\brm\s+-[a-zA-Z]*[rR][a-zA-Z]*\s*$', "Incomplete dangerous recursive deletion", re.IGNORECASE),
        (r'\bgit\s+push\s+.*(?:--force|-f)\b', "Destructive remote git force-push", re.IGNORECASE),
        (r'\bgit\s+reset\s+--hard\b', "Destructive git hard reset", re.IGNORECASE),
        (r'\bgit\s+clean\s+-[a-zA-Z]*f\b', "Destructive untracked file deletion (git clean -f)", re.IGNORECASE),
        (r'\bgit\s+branch\s+-[a-zA-Z]*D\s+(?!feat/)\S+', "Forced deletion of protected git branch", 0),
        (r'\b(?:mkfs|dd\s+if=|fdisk|parted)\b', "Direct filesystem/disk formatting or partition modification", re.IGNORECASE),
        (r'\b(?:sudo|su)\b', "Superuser privilege escalation prohibited", re.IGNORECASE),
        (r'(?<![/.-])\b(?:shutdown|reboot|poweroff|init\s+0)\b(?![/.-])', "System termination command", re.IGNORECASE),
        (r':\(\)\{\s*:\|:&\s*\};:', "Fork bomb pattern", 0),
        (r'\bchmod\s+-[a-zA-Z]*\s*777\b', "Insecure recursive world-writable permissions change", re.IGNORECASE),
    ]

    for item in destructive_patterns:
        pattern, desc = item[0], item[1]
        flags = item[2] if len(item) > 2 else re.IGNORECASE
        if re.search(pattern, cmd_clean, flags):
            return {
                "decision": "deny",
                "reason": f"Blocked destructive command: {desc} ('{cmd_clean}')",
            }

    # 1.1 Protect main branch against direct commits
    if re.search(r'\bgit\s+commit\b', cmd_clean) and not re.search(r'\bmerge\s+--squash\b', cmd_clean):
        switches_to_main = bool(re.search(r'\bgit\s+checkout\s+main\b', cmd_clean))
        is_on_main = False
        try:
            branch_res = subprocess.run(
                ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
                capture_output=True, text=True, timeout=2,
            )
            if branch_res.returncode == 0 and branch_res.stdout.strip() == "main":
                is_on_main = True
        except Exception:
            pass

        if is_on_main or switches_to_main:
            return {
                "decision": "deny",
                "reason": "Direct commits to 'main' branch are strictly prohibited. All git updates must occur on a feature branch during archive or via PR merge.",
            }

    # 2. Allow harmless commands (union of both harnesses' prior allowlists)
    allowed_patterns = [
        r'^(?:(?:[A-Z0-9_]+=[^\s]+\s+)*)go\s+(?:test|build|vet|run|fmt|mod\s+(?:tidy|verify|download)|version|env|doc|list)\b',
        r'^(?:(?:[A-Z0-9_]+=[^\s]+\s+)*)make(?:\s+[a-zA-Z0-9_-]+)*$',
        r'^\./bin/(?:mcskin|png-to-mcpack)\b',
        r'^\./scripts/(?:test-compact\.sh|package-mac-app\.sh|run-regression-suite\.sh)\b',
        r'^(?:build-linux|build-windows)/(?:mcskin|png-to-mcpack)(?:\.exe)?\b',
        r'^openspec\s+',
        r'^git\s+(?:status|diff|log|show|branch|add|commit|rev-parse|check-ignore|checkout|pull|fetch|remote|merge\s+--squash|push\s+(?:-u\s+)?origin\s+feat/[a-zA-Z0-9_.-]+|push\s+origin\s+--delete\s+feat/[a-zA-Z0-9_.-]+|rm)\b',
        r'^gh\s+(?:pr\s+(?:create|view|list|status|merge)|auth\s+status)\b',
        r'^(?:ls|cat|head|tail|grep|find|which|stat|file|unzip|mkdir|touch|echo|tar|zip|sha256sum|cp|wc|diff)\b',
        r'^chmod\s+\+x\s+',
        r'^rm\s+-rf\s+(?:bin|dist|build-[a-zA-Z0-9_-]+|files/\*\.mcpack|/tmp/.*)\b',
        r'^rm\s+-f\s+files/[a-zA-Z0-9_.-]+\.mcpack\b',
        r'^curl\s+',
        r'^python3?\b',
        r'^uv\b',
        r'^node\b',
        r'^google-chrome\b',
        r'^cd\s+',
    ]

    # Split compound commands separated by &&, ||, ;, or newline
    # Also strip parentheses from subshells e.g. (cd ... && ...)
    cleaned_input = re.sub(r'^[()]|[()]$', '', cmd_clean)
    sub_commands = [s.strip().strip('()') for s in re.split(r'\s*(?:&&|\|\||;|\||\n)\s*', cleaned_input) if s.strip()]
    if not sub_commands:
        return {"decision": "allow"}

    all_allowed = True
    for sub in sub_commands:
        # Strip output redirections e.g. > checksums.txt, 2>&1
        sub_no_redir = re.sub(r'\s*(?:[0-9]*>[>&]?\s*[^\s]+)\s*', ' ', sub).strip()
        if not sub_no_redir or sub_no_redir == "true":
            continue

        sub_allowed = False
        for pattern in allowed_patterns:
            if re.search(pattern, sub_no_redir):
                sub_allowed = True
                break
        if not sub_allowed:
            all_allowed = False
            break

    if all_allowed:
        return {
            "decision": "allow",
            "reason": "Harmless development/build command authorized by project policy.",
        }

    # Default to ask user confirmation for other commands
    return {
        "decision": "ask",
        "reason": f"Command requires user confirmation: '{cmd_clean}'",
    }


def extract_command(payload: dict) -> str:
    """Polyglot extraction across harness stdin schemas."""
    if "toolCall" in payload:
        return payload.get("toolCall", {}).get("args", {}).get("CommandLine", "")
    if "tool_input" in payload:
        return payload.get("tool_input", {}).get("command", "")
    if "input" in payload:
        return payload.get("input", {}).get("command", "")
    return ""


def detect_harness(payload: dict) -> str:
    """Identify which harness's stdin schema this payload matches."""
    if "toolCall" in payload:
        return "antigravity"
    if "tool_input" in payload or "input" in payload:
        return "claude-code"
    return "unknown"


def format_output(harness: str, result: dict) -> dict:
    """Render the decision in whichever JSON shape the calling harness expects."""
    if harness == "claude-code":
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": result["decision"],
            }
        }
        if "reason" in result:
            output["hookSpecificOutput"]["permissionDecisionReason"] = result["reason"]
        return output
    # Antigravity (and unknown/no-payload cases) use the top-level shape.
    return result


def main():
    harness = "unknown"
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            sys.exit(0)

        payload = json.loads(raw_input)
        harness = detect_harness(payload)
        command_line = extract_command(payload)
        result = evaluate_command(command_line)
        print(json.dumps(format_output(harness, result)))

        if result["decision"] == "deny":
            sys.stderr.write(result["reason"] + "\n")
            sys.exit(2)
        sys.exit(0)
    except Exception as e:
        err = {"decision": "ask", "reason": f"Safety gate error evaluating command: {str(e)}"}
        print(json.dumps(format_output(harness, err)))
        sys.exit(0)


if __name__ == "__main__":
    main()
