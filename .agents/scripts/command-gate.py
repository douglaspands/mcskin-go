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
        r'^go\s+(?:test|build|vet|run|fmt|mod\s+(?:tidy|verify|download)|version|env|doc|list)\b',
        r'^make(?:\s+(?:all|test|lint|build|build-linux|build-windows|clean))?$',
        r'^\./bin/png-to-mcpack\b',
        r'^openspec\s+',
        r'^git\s+(?:status|diff|log|show|branch|add|commit|rev-parse|check-ignore|checkout|merge\s+--squash)\b',
        r'^(?:ls|cat|head|tail|grep|find|which|stat|file|unzip|mkdir|touch)\b',
        r'^rm\s+-rf\s+(?:bin|files/\*\.mcpack|/tmp/.*)\b',
        r'^python3\s+\.agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack\.py\b',
    ]

    # Split compound commands separated by && or ;
    sub_commands = [s.strip() for s in re.split(r'\s*(?:&&|;)\s*', cmd_clean) if s.strip()]
    if not sub_commands:
        return {"decision": "allow"}

    all_allowed = True
    for sub in sub_commands:
        sub_allowed = False
        for pattern in allowed_patterns:
            if re.search(pattern, sub):
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
