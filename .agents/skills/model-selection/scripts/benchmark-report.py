#!/usr/bin/env python3
"""
benchmark-report.py
Gera relatório de benchmark de seleção de modelos a partir de .agents/model-benchmark.jsonl
Uso: python3 .agents/skills/model-selection/scripts/benchmark-report.py
"""
import json
import sys
from collections import defaultdict
from pathlib import Path

JSONL = Path(".agents/model-benchmark.jsonl")
TIERS = ["flash_lite", "flash", "pro"]

def load_entries():
    entries = []
    if not JSONL.exists():
        print(f"Arquivo não encontrado: {JSONL}", file=sys.stderr)
        sys.exit(1)
    with open(JSONL) as f:
        for i, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
                if e.get("outcome") not in ("pending", None) and "model_tier" in e:
                    entries.append(e)
            except json.JSONDecodeError:
                print(f"[warn] linha {i} inválida, ignorada", file=sys.stderr)
    return entries

def stats_by_tier(entries):
    stats = defaultdict(lambda: defaultdict(int))
    turns = defaultdict(list)
    for e in entries:
        tier = e["model_tier"]
        stats[tier][e["outcome"]] += 1
        if e.get("turns") is not None:
            turns[tier].append(e["turns"])
    return stats, turns

def undertier_rate(s):
    total = sum(s.values())
    if total == 0:
        return 0.0
    return s["fail-undertier"] / total * 100

def overtier_rate(s):
    total = sum(s.values())
    if total == 0:
        return 0.0
    return s["ok-overtier"] / total * 100

def print_report(entries):
    stats, turns = stats_by_tier(entries)

    print(f"\n{'='*60}")
    print("  BENCHMARK DE SELEÇÃO DE MODELOS — mcskin")
    print(f"  Entradas analisadas: {len(entries)}")
    print(f"{'='*60}\n")

    # Tabela por tier
    print(f"{'Tier':<13} | {'ok':>4} | {'overtier':>8} | {'undertier':>9} | {'other':>5} | {'total':>5} | avg turns")
    print("-" * 70)
    for tier in TIERS:
        s = stats[tier]
        total = sum(s.values())
        avg = f"{sum(turns[tier])/len(turns[tier]):.1f}" if turns[tier] else "n/a"
        print(f"{tier:<13} | {s['ok']:>4} | {s['ok-overtier']:>8} | {s['fail-undertier']:>9} | {s['fail-other']:>5} | {total:>5} | {avg}")

    print()

    # Alertas de ajuste
    print("ALERTAS DE AJUSTE:")
    for tier in TIERS:
        s = stats[tier]
        total = sum(s.values())
        if total < 5:
            continue
        ur = undertier_rate(s)
        or_ = overtier_rate(s)
        if ur > 30:
            print(f"  ⬆️  [{tier}] undertier rate {ur:.0f}% > 30% → subir um tier na Decision Table")
        if or_ > 50:
            print(f"  ⬇️  [{tier}] overtier rate {or_:.0f}% > 50% → descer um tier na Decision Table")
    print()

    # Escalações registradas
    escalations = [e for e in entries if e.get("escalated_to")]
    if escalations:
        print(f"ESCALAÇÕES ({len(escalations)}):")
        for e in escalations:
            print(f"  {e['date']} | {e['task']} | {e['model_tier']} → {e['escalated_to']}")
        print()

    # Por harness
    print("POR HARNESS:")
    for harness in ["antigravity", "claude"]:
        sub = [e for e in entries if e.get("harness") == harness]
        if sub:
            ok = sum(1 for e in sub if e["outcome"] == "ok")
            print(f"  {harness:<15}: {len(sub)} tarefas, {ok} ok ({ok/len(sub)*100:.0f}%)")
    print()

if __name__ == "__main__":
    entries = load_entries()
    if not entries:
        print("Nenhuma entrada com outcome resolvido encontrada.")
        sys.exit(0)
    print_report(entries)
