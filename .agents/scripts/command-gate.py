#!/usr/bin/env python3
import json
import re
import sys

def evaluate_command(cmd: str):
    cmd_clean = cmd.strip()

    # 1. Deny destructive patterns
    destructive_patterns = [
        (r'\brm\s+-[a-zA-Z]*[rR][a-zA-Z]*\s+(?:/|\*|\.|\.\.|\.git|~|\$HOME)(?:\s|$)', "Unbounded or dangerous recursive deletion"),
        (r'\brm\s+-[a-zA-Z]*[rR][a-zA-Z]*\s*$', "Incomplete dangerous recursive deletion"),
        (r'\bgit\s+push\s+.*(?:--force|-f)\b', "Destructive remote git force-push"),
        (r'\bgit\s+reset\s+--hard\b', "Destructive git hard reset"),
        (r'\bgit\s+clean\s+-[a-zA-Z]*f\b', "Destructive untracked file deletion (git clean -f)"),
        (r'\bgit\s+branch\s+-D\b', "Forced git branch deletion"),
        (r'\b(?:mkfs|dd\s+if=|fdisk|parted)\b', "Direct filesystem/disk formatting or partition modification"),
        (r'\b(?:sudo|su)\b', "Superuser privilege escalation prohibited"),
        (r'\b(?:shutdown|reboot|poweroff|init\s+0)\b', "System termination command"),
        (r':\(\)\{\s*:\|:&\s*\};:', "Fork bomb pattern"),
        (r'\bchmod\s+-[a-zA-Z]*\s*777\b', "Insecure recursive world-writable permissions change"),
    ]

    for pattern, desc in destructive_patterns:
        if re.search(pattern, cmd_clean, re.IGNORECASE):
            return {
                "decision": "deny",
                "reason": f"Blocked destructive command: {desc} ('{cmd_clean}')"
            }

    # 2. Allow harmless commands
    allowed_patterns = [
        r'^(?:(?:[A-Z0-9_]+=[^\s]+\s+)*)go\s+(?:test|build|vet|run|fmt|mod\s+(?:tidy|verify|download)|version|env|doc|list)\b',
        r'^(?:(?:[A-Z0-9_]+=[^\s]+\s+)*)make(?:\s+[a-zA-Z0-9_-]+)*$',
        r'^\./bin/(?:mcskin|png-to-mcpack)\b',
        r'^(?:build-linux|build-windows)/(?:mcskin|png-to-mcpack)(?:\.exe)?\b',
        r'^openspec\s+',
        r'^git\s+(?:status|diff|log|show|branch|add|commit|rev-parse|check-ignore|checkout|merge\s+--squash|push\s+(?:-u\s+)?origin\s+feat/[a-zA-Z0-9_.-]+|rm)\b',
        r'^gh\s+(?:pr\s+(?:create|view|list|status|merge)|auth\s+status)\b',
        r'^(?:ls|cat|head|tail|grep|find|which|stat|file|unzip|mkdir|touch|echo|tar|zip|sha256sum|cp)\b',
        r'^chmod\s+\+x\s+',
        r'^rm\s+-rf\s+(?:bin|dist|build-[a-zA-Z0-9_-]+|files/\*\.mcpack|/tmp/.*)\b',
        r'^rm\s+-f\s+files/[a-zA-Z0-9_.-]+\.mcpack\b',
        r'^curl\s+',
        r'^python3\b',
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
            "reason": "Harmless development/build command authorized by project policy."
        }

    # Default to ask user confirmation for other commands
    return {
        "decision": "ask",
        "reason": f"Command requires user confirmation: '{cmd_clean}'"
    }

def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            print(json.dumps({"decision": "allow"}))
            return

        payload = json.loads(raw_input)
        tool_call = payload.get("toolCall", {})
        args = tool_call.get("args", {})
        command_line = args.get("CommandLine", "")

        result = evaluate_command(command_line)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "decision": "ask",
            "reason": f"Safety gate error evaluating command: {str(e)}"
        }))

if __name__ == "__main__":
    main()
