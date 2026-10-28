"""Sinh các hình minh hoạ dùng trong báo cáo (lưu vào docs/figures)."""

from __future__ import annotations

import os
import statistics
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.algorithms import ALGORITHMS, a_star, greedy, ucs            # noqa: E402
from app.problems import CITY_POS, GraphProblem, GridProblem          # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "figures")
os.makedirs(OUT, exist_ok=True)

SURFACE   = "#fcfcfb"
INK       = "#0b0b0b"
INK_2     = "#52514e"
MUTED     = "#898781"
GRIDLINE  = "#e1e0d9"
BLUE      = "#2a78d6"
BLUE_LT   = "#cde2fb"
BLUE_MD   = "#9ec5f4"
ORANGE    = "#eb6834"
YELLOW    = "#eda100"
GREEN     = "#008300"
RED       = "#e34948"
WALL      = "#383835"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 10,
    "axes.edgecolor": GRIDLINE,
    "axes.labelcolor": INK_2,
    "text.color": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "figure.facecolor": SURFACE,
    "axes.facecolor": SURFACE,
    "savefig.facecolor": SURFACE,
})


# --------------------------------------------------------------------------- #
def fig_grid_compare() -> None:
    """Hình 1: cùng một bản đồ, so sánh vùng đã duyệt của UCS / A* / Greedy."""
    algos = [("UCS", ucs), ("A*", a_star), ("Greedy", greedy)]
    fig, axes = plt.subplots(1, 3, figsize=(12.6, 4.4))

    for ax, (name, fn) in zip(axes, algos):
        p = GridProblem(rows=30, cols=30, start=(0, 0), goal=(29, 29))
        p.random_obstacles(density=0.22, seed=5)
        r = fn(p)
        assert r.found, f"{name}: ban do khong co loi giai, hay doi seed"

        # 0 trống, 1 tường, 2 địa hình, 3 đã duyệt, 4 đường đi, 5 start, 6 goal
        img = [[0] * p.cols for _ in range(p.rows)]
        for i in range(p.rows):
            for j in range(p.cols):
                v = p.cells[i][j]
                img[i][j] = 1 if v == 1 else (2 if v > 1 else 0)
        for (i, j) in r.visited:
            if img[i][j] == 0:
                img[i][j] = 3
        for (i, j) in (r.path or []):
            img[i][j] = 4
        img[p.start[0]][p.start[1]] = 5
        img[p.goal[0]][p.goal[1]] = 6

        cmap = ListedColormap(["#ffffff", WALL, "#d9c7a7", BLUE_MD, YELLOW, GREEN, RED])
        ax.imshow(img, cmap=cmap, vmin=0, vmax=6, interpolation="nearest")
        ax.set_xticks([]); ax.set_yticks([])
        for s in ax.spines.values():
            s.set_edgecolor(GRIDLINE)
        ax.set_title(f"{name} — mở rộng {r.nodes_expanded} nút, chi phí {r.cost:.0f}",
                     fontsize=11, color=INK, pad=8)

    legend = [
        Patch(facecolor=GREEN, label="Điểm bắt đầu"),
        Patch(facecolor=RED, label="Điểm đích"),
        Patch(facecolor=WALL, label="Tường"),
        Patch(facecolor="#d9c7a7", label="Địa hình chậm"),
        Patch(facecolor=BLUE_MD, label="Ô đã mở rộng"),
        Patch(facecolor=YELLOW, label="Đường đi tìm được"),
    ]
    fig.legend(handles=legend, loc="lower center", ncol=6, frameon=False,
               bbox_to_anchor=(0.5, -0.02), fontsize=9)
    fig.suptitle("Vùng không gian trạng thái mà mỗi thuật toán phải duyệt (lưới 30×30, vật cản 22%)",
                 fontsize=12.5, color=INK, y=1.0)
    fig.tight_layout(rect=(0, 0.05, 1, 0.96))
    fig.savefig(os.path.join(OUT, "fig1_grid_compare.png"), dpi=170, bbox_inches="tight")
    plt.close(fig)


# --------------------------------------------------------------------------- #
def fig_graph() -> None:
    """Hình 2: đồ thị thành phố và đường đi tối ưu S -> B -> F -> G."""
    g = GraphProblem()
    r = a_star(g)
    path_edges = {frozenset(e) for e in zip(r.path, r.path[1:])}

    fig, ax = plt.subplots(figsize=(8.6, 5.4))
    drawn = set()
    for u in g.graph:
        for v, w in g.graph[u].items():
            key = frozenset((u, v))
            if key in drawn:
                continue
            drawn.add(key)
            x1, y1 = CITY_POS[u]; x2, y2 = CITY_POS[v]
            on = key in path_edges
            ax.plot([x1, x2], [1 - y1, 1 - y2],
                    color=YELLOW if on else GRIDLINE, lw=3.2 if on else 1.6,
                    zorder=2 if on else 1, solid_capstyle="round")
            ax.text((x1 + x2) / 2, (1 - (y1 + y2) / 2) + 0.025, f"{w:g}",
                    ha="center", va="bottom", fontsize=9, color=INK_2, zorder=3)

    for n in g.nodes:
        x, y = CITY_POS[n]
        if n == g.start:
            fc, tc = GREEN, "white"
        elif n == g.goal:
            fc, tc = RED, "white"
        elif n in r.path:
            fc, tc = YELLOW, INK
        else:
            fc, tc = "#ffffff", INK
        ax.scatter([x], [1 - y], s=900, c=fc, edgecolors=INK_2, linewidths=1.2, zorder=4)
        ax.text(x, 1 - y, n, ha="center", va="center", fontsize=12, fontweight="bold",
                color=tc, zorder=5)
        ax.text(x + 0.035, 1 - y + 0.05, f"h={g.heuristic(n):g}",
                fontsize=8.5, color=MUTED, zorder=5)

    ax.set_xlim(-0.05, 1.05); ax.set_ylim(-0.08, 1.12)
    ax.axis("off")
    ax.set_title("Đồ thị thành phố — đường đi tối ưu S → B → F → G, chi phí 137\n"
                 "(số trên cạnh là chi phí, h là giá trị heuristic của đỉnh)",
                 fontsize=12, color=INK, pad=10)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig2_graph.png"), dpi=170, bbox_inches="tight")
    plt.close(fig)


# --------------------------------------------------------------------------- #
def _benchmark(density: float, trials: int = 50):
    stats = {n: {"cost": [], "exp": []} for n in ALGORITHMS}
    for seed in range(trials):
        p = GridProblem(rows=40, cols=40, start=(0, 0), goal=(39, 39))
        p.random_obstacles(density=density, seed=seed)
        for n, fn in ALGORITHMS.items():
            r = fn(p)
            if r.found:
                stats[n]["cost"].append(r.cost)
                stats[n]["exp"].append(r.nodes_expanded)
    return {n: (statistics.mean(s["cost"]), statistics.mean(s["exp"]))
            for n, s in stats.items() if s["cost"]}


def fig_bars() -> None:
    """Hình 3: hai biểu đồ riêng (không dùng 2 trục) — chi phí TB và số nút mở rộng TB."""
    data = _benchmark(0.25)
    names = list(data.keys())
    costs = [data[n][0] for n in names]
    exps = [data[n][1] for n in names]

    fig, axes = plt.subplots(1, 2, figsize=(11.4, 4.2))

    for ax, vals, title, unit in (
        (axes[0], costs, "Chi phí đường đi trung bình", ""),
        (axes[1], exps, "Số nút phải mở rộng trung bình", " nút"),
    ):
        y = range(len(names))
        ax.barh(list(y), vals, height=0.58, color=BLUE, zorder=3)
        ax.set_yticks(list(y)); ax.set_yticklabels(names, color=INK, fontsize=10.5)
        ax.invert_yaxis()
        ax.set_title(title, fontsize=11.5, color=INK, pad=8, loc="left")
        ax.xaxis.grid(True, color=GRIDLINE, lw=0.8, zorder=0)
        ax.set_axisbelow(True)
        ax.spines[["top", "right", "left"]].set_visible(False)
        ax.spines["bottom"].set_color("#c3c2b7")
        ax.tick_params(axis="y", length=0)
        span = max(vals)
        for i, v in enumerate(vals):
            ax.text(v + span * 0.015, i, f"{v:,.1f}{unit}", va="center",
                    fontsize=9.5, color=INK_2)
        ax.set_xlim(0, span * 1.18)

    fig.suptitle("Trung bình trên 50 bản đồ lưới 40×40 ngẫu nhiên, mật độ vật cản 25%",
                 fontsize=12.5, color=INK, y=1.02)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig3_benchmark.png"), dpi=170, bbox_inches="tight")
    plt.close(fig)


def fig_density() -> None:
    """Hình 4: số nút mở rộng của UCS và A* khi mật độ vật cản thay đổi."""
    densities = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35]
    series = {n: [] for n in ALGORITHMS}
    for d in densities:
        data = _benchmark(d, trials=30)
        for n in series:
            series[n].append(data.get(n, (0, 0))[1])

    colors = {"BFS": ORANGE, "DFS": "#1baf7a", "UCS": BLUE, "Greedy": YELLOW, "A*": "#6250d6"}
    # UCS và BFS mở rộng gần như cùng số nút -> vẽ UCS trước, BFS nét đứt đè lên
    order = ["UCS", "BFS", "A*", "DFS", "Greedy"]
    fig, ax = plt.subplots(figsize=(9.6, 4.6))
    xs = [d * 100 for d in densities]
    for n in order:
        dashed = n == "BFS"
        ax.plot(xs, series[n], marker="o", ms=5.5, lw=2,
                ls="--" if dashed else "-", color=colors[n], label=n,
                zorder=4 if dashed else 3)

    # dàn nhãn cuối đường để không chồng lên nhau
    ends = sorted(((series[n][-1], n) for n in order), reverse=True)
    min_gap = max(v for v, _ in ends) * 0.075
    placed: list[float] = []
    for v, n in ends:
        y = v
        for p in placed:
            if abs(y - p) < min_gap:
                y = p - min_gap
        placed.append(y)
        ax.annotate(n, (xs[-1] + 0.7, y), color=colors[n],
                    fontsize=10, fontweight="bold", va="center")
    ax.annotate("BFS và UCS gần như trùng nhau\n(cùng duyệt toàn bộ vùng khả thi)",
                xy=(xs[3], series["UCS"][3]), xytext=(xs[1] - 0.5, series["UCS"][0] * 0.74),
                fontsize=9, color=INK_2,
                arrowprops=dict(arrowstyle="->", color=MUTED, lw=1))

    ax.set_xlabel("Mật độ vật cản (%)")
    ax.set_ylabel("Số nút mở rộng trung bình")
    ax.yaxis.grid(True, color=GRIDLINE, lw=0.8, zorder=0)
    ax.set_axisbelow(True)
    ax.spines[["top", "right"]].set_visible(False)
    ax.spines[["left", "bottom"]].set_color("#c3c2b7")
    ax.set_xlim(3, 40)
    ax.legend(frameon=False, ncol=5, loc="upper center", bbox_to_anchor=(0.5, -0.17), fontsize=9.5)
    ax.set_title("Chi phí tính toán thay đổi theo độ phức tạp của bản đồ (lưới 40×40, 30 lần/mức)",
                 fontsize=12, color=INK, pad=10, loc="left")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig4_density.png"), dpi=170, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    fig_grid_compare()
    fig_graph()
    fig_bars()
    fig_density()
    print("Da sinh hinh trong:", OUT)
    for f in sorted(os.listdir(OUT)):
        print("  -", f)
