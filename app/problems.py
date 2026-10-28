"""Các bài toán (không gian trạng thái) mà ứng dụng hỗ trợ."""

from __future__ import annotations

import math
import random
from typing import Dict, List, Optional, Tuple

State = Tuple[int, int]


# =========================================================================== #
# A. Bài toán tìm đường trên lưới ô vuông (grid map)
# =========================================================================== #
class GridProblem:
    """Tìm đường trên lưới rows x cols.

    - 0 = ô đi được, 1 = vật cản (tường), >1 = ô địa hình tốn thêm chi phí
    - Chi phí đi vào một ô = terrain_cost(ô) (mặc định 1), đường chéo nhân sqrt(2)
    """

    DIRS4 = [(-1, 0), (0, 1), (1, 0), (0, -1)]
    DIRS8 = DIRS4 + [(-1, -1), (-1, 1), (1, 1), (1, -1)]

    def __init__(
        self,
        rows: int = 25,
        cols: int = 40,
        start: State = (0, 0),
        goal: Optional[State] = None,
        allow_diagonal: bool = False,
        heuristic_name: str = "manhattan",
    ) -> None:
        self.rows = rows
        self.cols = cols
        self.cells: List[List[int]] = [[0] * cols for _ in range(rows)]
        self.start = start
        self.goal = goal if goal is not None else (rows - 1, cols - 1)
        self.allow_diagonal = allow_diagonal
        self.heuristic_name = heuristic_name

    # ---------------- thao tác bản đồ ---------------- #
    def in_bounds(self, s: State) -> bool:
        r, c = s
        return 0 <= r < self.rows and 0 <= c < self.cols

    def is_wall(self, s: State) -> bool:
        r, c = s
        return self.cells[r][c] == 1

    def terrain_cost(self, s: State) -> float:
        r, c = s
        v = self.cells[r][c]
        return 1.0 if v in (0, 1) else float(v)

    def set_cell(self, s: State, value: int) -> None:
        if self.in_bounds(s) and s != self.start and s != self.goal:
            r, c = s
            self.cells[r][c] = value

    def clear(self) -> None:
        self.cells = [[0] * self.cols for _ in range(self.rows)]

    def random_obstacles(self, density: float = 0.28, seed: Optional[int] = None) -> None:
        rng = random.Random(seed)
        self.clear()
        for r in range(self.rows):
            for c in range(self.cols):
                if (r, c) in (self.start, self.goal):
                    continue
                if rng.random() < density:
                    self.cells[r][c] = 1
                elif rng.random() < 0.10:
                    self.cells[r][c] = rng.choice([3, 5])   # địa hình tốn chi phí

    def random_maze(self, seed: Optional[int] = None) -> None:
        """Sinh mê cung bằng DFS đục tường (recursive backtracker)."""
        rng = random.Random(seed)
        for r in range(self.rows):
            for c in range(self.cols):
                self.cells[r][c] = 1

        def carve(r: int, c: int) -> None:
            self.cells[r][c] = 0
            dirs = [(-2, 0), (2, 0), (0, -2), (0, 2)]
            rng.shuffle(dirs)
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < self.rows and 0 <= nc < self.cols and self.cells[nr][nc] == 1:
                    self.cells[r + dr // 2][c + dc // 2] = 0
                    carve(nr, nc)

        carve(0, 0)
        for s in (self.start, self.goal):
            r, c = s
            self.cells[r][c] = 0
            for dr, dc in self.DIRS4:                       # đảm bảo start/goal không bị bịt kín
                nr, nc = r + dr, c + dc
                if self.in_bounds((nr, nc)):
                    self.cells[nr][nc] = 0
                    break

    # ---------------- giao diện bài toán ---------------- #
    def is_goal(self, s: State) -> bool:
        return s == self.goal

    def neighbors(self, s: State) -> List[Tuple[State, float]]:
        r, c = s
        out: List[Tuple[State, float]] = []
        dirs = self.DIRS8 if self.allow_diagonal else self.DIRS4
        for dr, dc in dirs:
            nxt = (r + dr, c + dc)
            if not self.in_bounds(nxt) or self.is_wall(nxt):
                continue
            step = math.sqrt(2) if dr != 0 and dc != 0 else 1.0
            out.append((nxt, step * self.terrain_cost(nxt)))
        return out

    def heuristic(self, s: State) -> float:
        r, c = s
        gr, gc = self.goal
        dr, dc = abs(r - gr), abs(c - gc)
        if self.heuristic_name == "euclid":
            return math.hypot(dr, dc)
        if self.heuristic_name == "chebyshev":
            return max(dr, dc)
        if self.heuristic_name == "zero":          # h = 0 -> A* suy biến thành UCS
            return 0.0
        if self.allow_diagonal:                    # octile: admissible khi có đường chéo
            return (dr + dc) + (math.sqrt(2) - 2) * min(dr, dc)
        return dr + dc                             # manhattan


# =========================================================================== #
# B. Bài toán tìm đường trên đồ thị thành phố (graph map)
#    Dữ liệu lấy từ bài tập trên lớp (S -> G), có sẵn heuristic cho trước.
# =========================================================================== #
CITY_GRAPH: Dict[str, Dict[str, float]] = {
    "S": {"A": 55, "E": 72, "B": 42, "C": 48},
    "A": {"S": 55, "D": 45},
    "B": {"S": 42, "C": 40, "F": 40},
    "C": {"S": 48, "B": 40, "F": 68},
    "D": {"A": 45, "E": 45},
    "E": {"S": 72, "D": 45, "G": 82},
    "F": {"B": 40, "C": 68, "G": 55},
    "G": {"E": 82, "F": 55, "I": 47, "K": 38},
    "H": {"I": 50},
    "I": {"G": 47, "H": 50},
    "K": {"G": 38},
}

CITY_HEURISTIC: Dict[str, float] = {
    "S": 125, "A": 123, "B": 82, "C": 118, "D": 115, "E": 72,
    "F": 40, "G": 0, "H": 70, "I": 40, "K": 30,
}

# toạ độ để vẽ (x, y) theo tỉ lệ 0..1
CITY_POS: Dict[str, Tuple[float, float]] = {
    "S": (0.06, 0.62), "A": (0.19, 0.24), "D": (0.39, 0.07), "E": (0.44, 0.38),
    "B": (0.29, 0.69), "C": (0.17, 0.93), "F": (0.52, 0.70), "G": (0.82, 0.70),
    "I": (0.93, 0.38), "H": (0.74, 0.12), "K": (0.88, 0.95),
}


class GraphProblem:
    """Tìm đường trên đồ thị vô hướng có trọng số với heuristic cho trước."""

    def __init__(
        self,
        graph: Optional[Dict[str, Dict[str, float]]] = None,
        heuristic_table: Optional[Dict[str, float]] = None,
        start: str = "S",
        goal: str = "G",
    ) -> None:
        self.graph = graph if graph is not None else CITY_GRAPH
        self.h = heuristic_table if heuristic_table is not None else CITY_HEURISTIC
        self.start = start
        self.goal = goal

    @property
    def nodes(self) -> List[str]:
        return sorted(self.graph.keys())

    def is_goal(self, s: str) -> bool:
        return s == self.goal

    def neighbors(self, s: str) -> List[Tuple[str, float]]:
        return sorted(self.graph.get(s, {}).items())

    def heuristic(self, s: str) -> float:
        return float(self.h.get(s, 0.0))

    def is_admissible(self) -> Tuple[bool, List[str]]:
        """Kiểm tra h(n) <= chi phí thực tế từ n tới đích (dùng Dijkstra ngược)."""
        import heapq

        dist = {self.goal: 0.0}
        pq = [(0.0, self.goal)]
        while pq:
            d, u = heapq.heappop(pq)
            if d > dist.get(u, float("inf")):
                continue
            for v, w in self.graph.get(u, {}).items():
                nd = d + w
                if nd < dist.get(v, float("inf")):
                    dist[v] = nd
                    heapq.heappush(pq, (nd, v))

        violations = [
            f"h({n})={self.heuristic(n):g} > h*({n})={dist[n]:g}"
            for n in self.graph
            if n in dist and self.heuristic(n) > dist[n] + 1e-9
        ]
        return (not violations), violations
