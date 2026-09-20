#!/usr/bin/env bash
# scripts/test-compact.sh
# Runs Go tests compactly: outputs a single summary line on PASS,
# and surfaces only failing tests/errors on FAIL to conserve tokens.

set -o pipefail

TARGET="${1:-./...}"
TMP_OUT=$(mktemp)
trap 'rm -f "$TMP_OUT"' EXIT

if go test "$TARGET" > "$TMP_OUT" 2>&1; then
    echo "PASS: all packages OK"
    exit 0
else
    EXIT_CODE=$?
    echo "FAIL: Test failure detected in $TARGET" >&2
    grep -E "(FAIL|--- FAIL|build failed|cannot find|undefined|panic:)" "$TMP_OUT" >&2 || cat "$TMP_OUT" >&2
    exit "$EXIT_CODE"
fi
