"""Giao diện đồ hoạ Tkinter cho ứng dụng tìm đường."""

from __future__ import annotations

import tkinter as tk
from tkinter import messagebox, ttk
from typing import Dict, List, Optional

from .algorithms import ALGORITHMS, SearchResult, run_all
from .problems import CITY_POS, GraphProblem, GridProblem

# ------------------------------- bảng màu ---------------------------------- #
C_BG        = "#1e1e2e"
C_PANEL     = "#282a36"
C_GRID      = "#313244"
C_EMPTY     = "#45475a"
C_WALL      = "#11111b"
C_TERRAIN   = "#7f5539"
C_VISITED   = "#4c6ef5"
C_FRONTIER  = "#94a3b8"
C_PATH      = "#f9e2af"
C_START     = "#40c057"
C_GOAL      = "#e03131"
C_TEXT      = "#cdd6f4"


class PathfindingApp(tk.Tk):
    CELL = 22

    def __init__(self) -> None:
        super().__init__()
        self.title("Ứng dụng mô phỏng các thuật toán tìm kiếm đường đi — BFS / DFS / UCS / Greedy / A*")
        self.configure(bg=C_BG)
        self.resizable(False, False)

        self.grid_problem = GridProblem(rows=24, cols=38, start=(2, 2), goal=(21, 35))
        self.graph_problem = GraphProblem()

        self.mode = tk.StringVar(value="grid")
        self.algo = tk.StringVar(value="A*")
        self.heur = tk.StringVar(value="manhattan")
        self.diagonal = tk.BooleanVar(value=False)
        self.speed = tk.IntVar(value=12)
        self.paint = tk.StringVar(value="wall")

        self._anim_job: Optional[str] = None
        self._last_results: List[SearchResult] = []

        self._build_ui()
        self.draw()

    # ------------------------------------------------------------------ UI #
    def _build_ui(self) -> None:
        style = ttk.Style(self)
        try:
            style.theme_use("clam")
        except tk.TclError:
            pass
        style.configure("TLabel", background=C_PANEL, foreground=C_TEXT)
        style.configure("TButton", padding=4)
        style.configure("TRadiobutton", background=C_PANEL, foreground=C_TEXT)
        style.configure("TCheckbutton", background=C_PANEL, foreground=C_TEXT)
        style.configure("TLabelframe", background=C_PANEL, foreground=C_TEXT)
        style.configure("TLabelframe.Label", background=C_PANEL, foreground=C_TEXT)

        wrap = tk.Frame(self, bg=C_BG)
        wrap.pack(fill="both", expand=True, padx=10, pady=10)

        # --- bảng điều khiển bên trái --- #
        side = tk.Frame(wrap, bg=C_PANEL, padx=10, pady=10)
        side.pack(side="left", fill="y")

        tk.Label(side, text="BẢNG ĐIỀU KHIỂN", bg=C_PANEL, fg=C_TEXT,
                 font=("Segoe UI", 11, "bold")).pack(anchor="w", pady=(0, 8))

        box = ttk.LabelFrame(side, text="Không gian trạng thái")
        box.pack(fill="x", pady=4)
        for txt, val in (("Lưới ô vuông (grid)", "grid"), ("Đồ thị thành phố (graph)", "graph")):
            ttk.Radiobutton(box, text=txt, value=val, variable=self.mode,
                            command=self.on_mode_change).pack(anchor="w")

        box = ttk.LabelFrame(side, text="Thuật toán")
        box.pack(fill="x", pady=4)
        for name in ALGORITHMS:
            ttk.Radiobutton(box, text=name, value=name, variable=self.algo).pack(anchor="w")

        box = ttk.LabelFrame(side, text="Hàm heuristic (chế độ lưới)")
        box.pack(fill="x", pady=4)
        self.heur_combo = ttk.Combobox(
            box, state="readonly", textvariable=self.heur,
            values=["manhattan", "euclid", "chebyshev", "zero"], width=16)
        self.heur_combo.pack(anchor="w", padx=4, pady=2)
        ttk.Checkbutton(box, text="Cho phép đi chéo (8 hướng)",
                        variable=self.diagonal).pack(anchor="w")

        box = ttk.LabelFrame(side, text="Công cụ vẽ bản đồ")
        box.pack(fill="x", pady=4)
        for txt, val in (("Tường (chuột trái)", "wall"),
                         ("Địa hình chậm, cost 5", "terrain"),
                         ("Đặt điểm bắt đầu", "start"),
                         ("Đặt điểm đích", "goal")):
            ttk.Radiobutton(box, text=txt, value=val, variable=self.paint).pack(anchor="w")

        box = ttk.LabelFrame(side, text="Tốc độ mô phỏng")
        box.pack(fill="x", pady=4)
        tk.Scale(box, from_=1, to=60, orient="horizontal", variable=self.speed,
                 bg=C_PANEL, fg=C_TEXT, highlightthickness=0,
                 troughcolor=C_GRID, length=170).pack()

        for text, cmd in (
            ("▶  Chạy thuật toán", self.run_selected),
            ("⇄  So sánh tất cả", self.compare_all),
            ("🎲  Vật cản ngẫu nhiên", self.gen_obstacles),
            ("🧱  Sinh mê cung", self.gen_maze),
            ("🧹  Xoá bản đồ", self.reset_map),
        ):
            tk.Button(side, text=text, command=cmd, width=24, relief="flat",
                      bg=C_GRID, fg=C_TEXT, activebackground=C_VISITED,
                      activeforeground="white", pady=5).pack(pady=3)

        legend = ttk.LabelFrame(side, text="Chú thích")
        legend.pack(fill="x", pady=(8, 0))
        for color, text in ((C_START, "Điểm bắt đầu"), (C_GOAL, "Điểm đích"),
                            (C_WALL, "Tường"), (C_TERRAIN, "Địa hình chậm"),
                            (C_VISITED, "Đã duyệt"), (C_FRONTIER, "Trong frontier"),
                            (C_PATH, "Đường đi tìm được")):
            row = tk.Frame(legend, bg=C_PANEL)
            row.pack(anchor="w", pady=1)
            tk.Canvas(row, width=14, height=14, bg=color, highlightthickness=0).pack(side="left", padx=4)
            tk.Label(row, text=text, bg=C_PANEL, fg=C_TEXT).pack(side="left")

        # --- khu vực vẽ bên phải --- #
        right = tk.Frame(wrap, bg=C_BG)
        right.pack(side="left", fill="both", expand=True, padx=(10, 0))

        w = self.grid_problem.cols * self.CELL
        h = self.grid_problem.rows * self.CELL
        self.canvas = tk.Canvas(right, width=w, height=h, bg=C_BG, highlightthickness=0)
        self.canvas.pack()
        self.canvas.bind("<Button-1>", self.on_click)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<Button-3>", self.on_right_click)
        self.canvas.bind("<B3-Motion>", self.on_right_click)

        self.status = tk.Label(right, text="Sẵn sàng.", bg=C_PANEL, fg=C_TEXT,
                               anchor="w", padx=10, pady=6, font=("Consolas", 10))
        self.status.pack(fill="x", pady=(8, 0))

        cols = ("algo", "found", "cost", "steps", "expanded", "generated", "time")
        heads = ("Thuật toán", "Tìm thấy", "Chi phí", "Số bước",
                 "Số nút mở rộng", "Số nút sinh ra", "Thời gian (ms)")
        self.table = ttk.Treeview(right, columns=cols, show="headings", height=6)
        for c, head in zip(cols, heads):
            self.table.heading(c, text=head)
            self.table.column(c, width=120 if c == "algo" else 110, anchor="center")
        self.table.pack(fill="x", pady=(8, 0))

    # -------------------------------------------------------------- vẽ hình #
    def draw(self) -> None:
        self.canvas.delete("all")
        if self.mode.get() == "grid":
            self._draw_grid()
        else:
            self._draw_graph()

    def _cell_color(self, r: int, c: int) -> str:
        v = self.grid_problem.cells[r][c]
        if v == 1:
            return C_WALL
        if v > 1:
            return C_TERRAIN
        return C_EMPTY

    def _draw_grid(self) -> None:
        gp = self.grid_problem
        s = self.CELL
        for r in range(gp.rows):
            for c in range(gp.cols):
                self.canvas.create_rectangle(
                    c * s, r * s, c * s + s, r * s + s,
                    fill=self._cell_color(r, c), outline=C_GRID,
                    tags=f"cell_{r}_{c}")
        self._mark(gp.start, C_START)
        self._mark(gp.goal, C_GOAL)

    def _mark(self, state, color: str) -> None:
        r, c = state
        s = self.CELL
        self.canvas.create_rectangle(c * s + 2, r * s + 2, c * s + s - 2, r * s + s - 2,
                                     fill=color, outline="")

    def _paint_cell(self, state, color: str) -> None:
        gp = self.grid_problem
        if state in (gp.start, gp.goal):
            return
        r, c = state
        s = self.CELL
        self.canvas.create_rectangle(c * s + 1, r * s + 1, c * s + s - 1, r * s + s - 1,
                                     fill=color, outline="")

    def _graph_xy(self, node: str):
        w = int(self.canvas["width"])
        h = int(self.canvas["height"])
        x, y = CITY_POS.get(node, (0.5, 0.5))
        return 60 + x * (w - 120), 40 + y * (h - 90)

    def _draw_graph(self, path: Optional[List[str]] = None,
                    visited: Optional[set] = None) -> None:
        g = self.graph_problem
        path_edges = set()
        if path:
            for u, v in zip(path, path[1:]):
                path_edges.add(frozenset((u, v)))

        drawn = set()
        for u in g.graph:
            for v, w in g.graph[u].items():
                key = frozenset((u, v))
                if key in drawn:
                    continue
                drawn.add(key)
                x1, y1 = self._graph_xy(u)
                x2, y2 = self._graph_xy(v)
                on_path = key in path_edges
                self.canvas.create_line(x1, y1, x2, y2,
                                        fill=C_PATH if on_path else C_EMPTY,
                                        width=5 if on_path else 2)
                self.canvas.create_text((x1 + x2) / 2, (y1 + y2) / 2 - 10,
                                        text=f"{w:g}", fill=C_TEXT,
                                        font=("Consolas", 10, "bold"))

        for n in g.nodes:
            x, y = self._graph_xy(n)
            if n == g.start:
                fill = C_START
            elif n == g.goal:
                fill = C_GOAL
            elif path and n in path:
                fill = C_PATH
            elif visited and n in visited:
                fill = C_VISITED
            else:
                fill = C_GRID
            self.canvas.create_oval(x - 20, y - 20, x + 20, y + 20, fill=fill, outline=C_TEXT, width=2)
            self.canvas.create_text(x, y, text=n, fill="#11111b" if fill != C_GRID else C_TEXT,
                                    font=("Segoe UI", 12, "bold"))
            self.canvas.create_text(x + 28, y - 22, text=f"h={g.heuristic(n):g}",
                                    fill=C_FRONTIER, font=("Consolas", 9))

    # ------------------------------------------------------------ tương tác #
    def _event_cell(self, event):
        r, c = event.y // self.CELL, event.x // self.CELL
        return (int(r), int(c))

    def on_click(self, event) -> None:
        if self.mode.get() != "grid":
            return
        gp = self.grid_problem
        s = self._event_cell(event)
        if not gp.in_bounds(s):
            return
        tool = self.paint.get()
        if tool == "start" and not gp.is_wall(s) and s != gp.goal:
            gp.start = s
        elif tool == "goal" and not gp.is_wall(s) and s != gp.start:
            gp.goal = s
        elif tool == "wall":
            gp.set_cell(s, 1)
        elif tool == "terrain":
            gp.set_cell(s, 5)
        self.draw()

    def on_drag(self, event) -> None:
        if self.mode.get() != "grid" or self.paint.get() not in ("wall", "terrain"):
            return
        gp = self.grid_problem
        s = self._event_cell(event)
        if gp.in_bounds(s):
            gp.set_cell(s, 1 if self.paint.get() == "wall" else 5)
            self.draw()

    def on_right_click(self, event) -> None:
        if self.mode.get() != "grid":
            return
        gp = self.grid_problem
        s = self._event_cell(event)
        if gp.in_bounds(s):
            gp.set_cell(s, 0)
            self.draw()

    def on_mode_change(self) -> None:
        self._cancel_anim()
        self.draw()
        self.status.config(text="Sẵn sàng.")

    def reset_map(self) -> None:
        self._cancel_anim()
        self.grid_problem.clear()
        self.draw()

    def gen_obstacles(self) -> None:
        self._cancel_anim()
        self.mode.set("grid")
        self.grid_problem.random_obstacles(density=0.26)
        self.draw()

    def gen_maze(self) -> None:
        self._cancel_anim()
        self.mode.set("grid")
        import sys
        sys.setrecursionlimit(10000)
        self.grid_problem.random_maze()
        self.draw()

    # ---------------------------------------------------------- chạy & vẽ #
    def _current_problem(self):
        if self.mode.get() == "grid":
            gp = self.grid_problem
            gp.allow_diagonal = self.diagonal.get()
            gp.heuristic_name = self.heur.get()
            return gp
        return self.graph_problem

    def _cancel_anim(self) -> None:
        if self._anim_job is not None:
            self.after_cancel(self._anim_job)
            self._anim_job = None

    def run_selected(self) -> None:
        self._cancel_anim()
        self.draw()
        problem = self._current_problem()
        result = ALGORITHMS[self.algo.get()](problem, trace=True)
        self._last_results = [result]
        self._fill_table([result])
        self.status.config(text=result.summary())
        self._animate(result)

    def compare_all(self) -> None:
        self._cancel_anim()
        self.draw()
        problem = self._current_problem()
        results = run_all(problem)
        self._last_results = results
        self._fill_table(results)
        best = min((r for r in results if r.found), key=lambda r: r.cost, default=None)
        if best:
            self.status.config(
                text=f"Tối ưu: {best.cost:g} — "
                     + " | ".join(f"{r.name}={r.cost:g}" if r.found else f"{r.name}=X" for r in results))
        if self.mode.get() == "graph" and best:
            self._draw_graph(path=best.path, visited=best.visited)

    def _fill_table(self, results: List[SearchResult]) -> None:
        self.table.delete(*self.table.get_children())
        for r in results:
            self.table.insert("", "end", values=(
                r.name,
                "Có" if r.found else "Không",
                f"{r.cost:.2f}" if r.found else "-",
                r.path_length - 1 if r.found else "-",
                r.nodes_expanded,
                r.nodes_generated,
                f"{r.elapsed_ms:.2f}",
            ))

    def _animate(self, result: SearchResult) -> None:
        if self.mode.get() == "graph":
            self._draw_graph(path=result.path, visited=result.visited)
            return

        order = list(result.expanded_order)
        path = list(result.path or [])
        gp = self.grid_problem
        idx = {"i": 0, "p": 0}
        step = max(1, self.speed.get() // 3)

        def tick() -> None:
            n = 0
            while idx["i"] < len(order) and n < step:
                self._paint_cell(order[idx["i"]], C_VISITED)
                idx["i"] += 1
                n += 1
            if idx["i"] < len(order):
                self._anim_job = self.after(max(1, 60 // self.speed.get()), tick)
                return
            n = 0
            while idx["p"] < len(path) and n < max(1, step // 2):
                self._paint_cell(path[idx["p"]], C_PATH)
                idx["p"] += 1
                n += 1
            if idx["p"] < len(path):
                self._anim_job = self.after(max(1, 60 // self.speed.get()), tick)
            else:
                self._mark(gp.start, C_START)
                self._mark(gp.goal, C_GOAL)
                self._anim_job = None
                if not result.found:
                    messagebox.showinfo("Kết quả", "Không tồn tại đường đi tới đích.")

        tick()


def main() -> None:
    PathfindingApp().mainloop()
