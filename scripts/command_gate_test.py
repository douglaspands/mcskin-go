#!/usr/bin/env python3
"""RED/GREEN evidence harness for scripts/command-gate.py's allow/deny decisions.

Exercises representative Tier-1/2/3 commands against the canonical gate script
via its Antigravity stdin contract (toolCall.args.CommandLine), and separately
via the Claude Code stdin contract (tool_input.command) to confirm polyglot
parsing. Not a go test / pytest suite - a standalone evidence script per
tasks.md 1.1/1.2 (mechanically-checkable RED-before-GREEN verification).
"""
import json
import subprocess
import sys

GATE = "scripts/command-gate.py"

CASES = [
    ("go test ./...", "allow", "tier1 go test"),
    ("git status -s", "allow", "tier1 git status"),
    ("openspec status --change x --json", "allow", "tier1 openspec"),
    ("gh pr create --base main --head feat/x --title t", "allow", "tier1 gh pr allowlist"),
    ("git push --force origin feat/x", "deny", "tier3 force push"),
    ("rm -rf /", "deny", "tier3 unbounded rm"),
    ("sudo rm -rf /var", "deny", "tier3 sudo"),
    ("git checkout main && git commit -m oops", "deny", "tier3 direct commit on main"),
]


def run_case_antigravity(cmd):
    payload = json.dumps({"toolCall": {"args": {"CommandLine": cmd}}})
    proc = subprocess.run([sys.executable, GATE], input=payload, capture_output=True, text=True, timeout=5)
    try:
        return json.loads(proc.stdout), proc.returncode
    except json.JSONDecodeError:
        return {"decision": "ERROR", "reason": proc.stdout + proc.stderr}, proc.returncode


def run_case_claude(cmd):
    payload = json.dumps({"tool_input": {"command": cmd}})
    proc = subprocess.run([sys.executable, GATE], input=payload, capture_output=True, text=True, timeout=5)
    return proc.returncode, proc.stderr.strip()


def main():
    failures = []
    print("== Antigravity schema (toolCall.args.CommandLine) ==")
    for cmd, expected, note in CASES:
        result, _rc = run_case_antigravity(cmd)
        actual = result.get("decision")
        status = "PASS" if actual == expected else "FAIL"
        print(f"[{status}] {note}: '{cmd}' -> expected={expected} actual={actual} ({result.get('reason', '')})")
        if status == "FAIL":
            failures.append(f"antigravity:{note}")

    print("\n== Claude Code schema (tool_input.command), exit-code contract ==")
    for cmd, expected, note in CASES:
        rc, stderr = run_case_claude(cmd)
        expect_nonzero = expected == "deny"
        actual_nonzero = rc != 0
        status = "PASS" if actual_nonzero == expect_nonzero else "FAIL"
        print(f"[{status}] {note}: '{cmd}' -> expected_exit={'nonzero' if expect_nonzero else '0'} actual_exit={rc} ({stderr})")
        if status == "FAIL":
            failures.append(f"claude:{note}")

    total = len(CASES) * 2
    print(f"\n{total - len(failures)}/{total} passed")
    if failures:
        print(f"FAILED: {failures}")
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
