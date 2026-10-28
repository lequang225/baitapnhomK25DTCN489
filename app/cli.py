"""Chế độ dòng lệnh: chạy thực nghiệm và in bảng so sánh (không cần giao diện)."""

from __future__ import annotations

import argparse
import statistics
from typing import List

from .algorithms import ALGORITHMS, SearchResult
from .problems import GraphProblem, GridProblem

HEAD = ("Thuat toan", "Tim thay", "Chi phi", "So buoc", "Mo rong", "Sinh ra", "Frontier max", "ms")


def _table(results: List[SearchResult]) -> str:
    rows = [HEAD]
    for r in results:
        rows.append((
            r.name,
            "Co" if r.found else "Khong",
            f"{r.cost:.2f}" if r.found else "-",
            str(r.path_length - 1) if r.found else "-",
            str(r.nodes_expanded),
            str(r.nodes_generated),
            str(r.max_frontier),
            f"{r.elapsed_ms:.2f}",
        ))
    widths = [max(len(row[i]) for row in rows) for i in range(len(HEAD))]
    sep = "+".join("-" * (w + 2) for w in widths)
    out = []
    for i, row in enumerate(rows):
        out.append(" | ".join(cell.ljust(widths[j]) for j, cell in enumerate(row)))
        if i == 0:
            out.append(sep)
    return "\n".join(out)


def run_graph() -> None:
    gp = GraphProblem()
    ok, violations = gp.is_admissible()
    print("=== BAI TOAN DO THI THANH PHO (S -> G) ===")
    print("Heuristic admissible:", "CO" if ok else "KHONG")
    for v in violations:
        print("   vi pham:", v)
    print()
    results = []
    for name, fn in ALGORITHMS.items():
        r = fn(gp)
        results.append(r)
        print(f"{name:7s} -> " + (" -> ".join(r.path) if r.found else "khong tim thay")
              + (f"   (chi phi {r.cost:g})" if r.found else ""))
    print()
    print(_table(results))


def run_grid(rows: int, cols: int, density: float, seed: int, diagonal: bool) -> None:
    gp = GridProblem(rows=rows, cols=cols, start=(0, 0), goal=(rows - 1, cols - 1),
                     allow_diagonal=diagonal)
    gp.random_obstacles(density=density, seed=seed)
    print(f"=== BAI TOAN LUOI {rows}x{cols} | mat do vat can {density:.0%} | seed {seed} ===")
    results = [fn(gp) for fn in ALGORITHMS.values()]
    print(_table(results))


def run_benchmark(trials: int, rows: int, cols: int, density: float, diagonal: bool) -> None:
    print(f"=== THUC NGHIEM {trials} ban do ngau nhien {rows}x{cols}, vat can {density:.0%} ===")
    stats = {name: {"cost": [], "exp": [], "ms": [], "fail": 0} for name in ALGORITHMS}
    for seed in range(trials):
        gp = GridProblem(rows=rows, cols=cols, start=(0, 0), goal=(rows - 1, cols - 1),
                         allow_diagonal=diagonal)
        gp.random_obstacles(density=density, seed=seed)
        for name, fn in ALGORITHMS.items():
            r = fn(gp)
            if r.found:
                stats[name]["cost"].append(r.cost)
                stats[name]["exp"].append(r.nodes_expanded)
                stats[name]["ms"].append(r.elapsed_ms)
            else:
                stats[name]["fail"] += 1

    header = f"{'Thuat toan':<10} | {'Chi phi TB':>11} | {'Mo rong TB':>11} | {'Thoi gian TB (ms)':>18} | {'Khong tim thay':>15}"
    print(header)
    print("-" * len(header))
    for name, s in stats.items():
        avg = lambda xs: statistics.mean(xs) if xs else float("nan")
        print(f"{name:<10} | {avg(s['cost']):>11.2f} | {avg(s['exp']):>11.1f} | "
              f"{avg(s['ms']):>18.2f} | {s['fail']:>15d}")


def main(argv=None) -> None:
    ap = argparse.ArgumentParser(description="Chay thuc nghiem cac thuat toan tim kiem")
    ap.add_argument("--mode", choices=["graph", "grid", "benchmark"], default="graph")
    ap.add_argument("--rows", type=int, default=30)
    ap.add_argument("--cols", type=int, default=30)
    ap.add_argument("--density", type=float, default=0.25)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--trials", type=int, default=30)
    ap.add_argument("--diagonal", action="store_true")
    args = ap.parse_args(argv)

    if args.mode == "graph":
        run_graph()
    elif args.mode == "grid":
        run_grid(args.rows, args.cols, args.density, args.seed, args.diagonal)
    else:
        run_benchmark(args.trials, args.rows, args.cols, args.density, args.diagonal)
