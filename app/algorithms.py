"""Các thuật toán tìm kiếm trong không gian trạng thái.

Tất cả thuật toán dùng chung một giao diện:
    search(problem, trace=False) -> SearchResult

`problem` là một đối tượng bất kỳ có:
    - start                     : trạng thái bắt đầu
    - is_goal(state) -> bool    : kiểm tra đích
    - neighbors(state) -> [(state, cost), ...]
    - heuristic(state) -> float : ước lượng chi phí còn lại tới đích

Nhờ vậy cùng một thuật toán chạy được trên nhiều loại bài toán khác nhau
(lưới ô vuông, đồ thị thành phố, 8-puzzle, ...).
"""

from __future__ import annotations

import heapq
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


@dataclass
class SearchResult:
    """Kết quả một lần chạy thuật toán."""

    name: str
    path: Optional[List[Any]] = None          # dãy trạng thái từ start -> goal
    cost: float = float("inf")                # tổng chi phí đường đi
    expanded_order: List[Any] = field(default_factory=list)   # thứ tự mở rộng
    visited: set = field(default_factory=set)                 # tập đã mở rộng
    frontier_snapshots: List[List[Any]] = field(default_factory=list)
    nodes_expanded: int = 0
    nodes_generated: int = 0
    max_frontier: int = 0
    elapsed_ms: float = 0.0

    @property
    def found(self) -> bool:
        return self.path is not None

    @property
    def path_length(self) -> int:
        return len(self.path) if self.path else 0

    def summary(self) -> str:
        if not self.found:
            return f"{self.name}: KHÔNG tìm thấy đường đi"
        return (
            f"{self.name}: chi phí={self.cost:g} | số bước={self.path_length - 1} | "
            f"mở rộng={self.nodes_expanded} | sinh ra={self.nodes_generated} | "
            f"frontier tối đa={self.max_frontier} | thời gian={self.elapsed_ms:.2f} ms"
        )


def _reconstruct(parent: Dict[Any, Any], goal: Any) -> List[Any]:
    path = [goal]
    while parent.get(path[-1]) is not None:
        path.append(parent[path[-1]])
    path.reverse()
    return path


def _timed(fn: Callable[[], SearchResult]) -> SearchResult:
    t0 = time.perf_counter()
    result = fn()
    result.elapsed_ms = (time.perf_counter() - t0) * 1000.0
    return result


# --------------------------------------------------------------------------- #
# 1. BFS - Breadth First Search (tìm kiếm theo chiều rộng)
# --------------------------------------------------------------------------- #
def bfs(problem, trace: bool = False) -> SearchResult:
    def run() -> SearchResult:
        res = SearchResult("BFS")
        start = problem.start
        frontier = deque([start])
        parent: Dict[Any, Any] = {start: None}
        in_frontier = {start}
        res.nodes_generated = 1

        while frontier:
            res.max_frontier = max(res.max_frontier, len(frontier))
            if trace:
                res.frontier_snapshots.append(list(frontier))

            node = frontier.popleft()
            in_frontier.discard(node)
            if node in res.visited:
                continue
            res.visited.add(node)
            res.expanded_order.append(node)
            res.nodes_expanded += 1

            if problem.is_goal(node):
                res.path = _reconstruct(parent, node)
                res.cost = path_cost(problem, res.path)
                return res

            for nxt, _ in problem.neighbors(node):
                if nxt not in res.visited and nxt not in in_frontier:
                    parent[nxt] = node
                    frontier.append(nxt)
                    in_frontier.add(nxt)
                    res.nodes_generated += 1
        return res

    return _timed(run)


# --------------------------------------------------------------------------- #
# 2. DFS - Depth First Search (tìm kiếm theo chiều sâu)
# --------------------------------------------------------------------------- #
def dfs(problem, trace: bool = False, depth_limit: Optional[int] = None) -> SearchResult:
    def run() -> SearchResult:
        res = SearchResult("DFS")
        start = problem.start
        # mỗi phần tử trong stack mang theo cả đường đi hiện tại
        stack: List[Tuple[Any, List[Any]]] = [(start, [start])]
        res.nodes_generated = 1

        while stack:
            res.max_frontier = max(res.max_frontier, len(stack))
            if trace:
                res.frontier_snapshots.append([s for s, _ in stack])

            node, path = stack.pop()
            if node in res.visited:
                continue
            res.visited.add(node)
            res.expanded_order.append(node)
            res.nodes_expanded += 1

            if problem.is_goal(node):
                res.path = path
                res.cost = path_cost(problem, path)
                return res

            if depth_limit is not None and len(path) - 1 >= depth_limit:
                continue

            # đảo chiều để duyệt đúng thứ tự tự nhiên khi lấy ra từ stack
            for nxt, _ in reversed(problem.neighbors(node)):
                if nxt not in res.visited:
                    stack.append((nxt, path + [nxt]))
                    res.nodes_generated += 1
        return res

    return _timed(run)


# --------------------------------------------------------------------------- #
# 3. UCS - Uniform Cost Search (tìm kiếm chi phí đều)
#    Mở rộng nút có g(n) nhỏ nhất -> luôn tối ưu khi mọi chi phí > 0
# --------------------------------------------------------------------------- #
def ucs(problem, trace: bool = False) -> SearchResult:
    def run() -> SearchResult:
        res = SearchResult("UCS")
        start = problem.start
        counter = 0
        frontier: List[Tuple[float, int, Any]] = [(0.0, counter, start)]
        parent: Dict[Any, Any] = {start: None}
        best: Dict[Any, float] = {start: 0.0}
        res.nodes_generated = 1

        while frontier:
            res.max_frontier = max(res.max_frontier, len(frontier))
            if trace:
                res.frontier_snapshots.append([s for _, _, s in frontier])

            g, _, node = heapq.heappop(frontier)
            if node in res.visited:
                continue
            res.visited.add(node)
            res.expanded_order.append(node)
            res.nodes_expanded += 1

            if problem.is_goal(node):
                res.path = _reconstruct(parent, node)
                res.cost = g
                return res

            for nxt, w in problem.neighbors(node):
                if nxt in res.visited:
                    continue
                ng = g + w
                if nxt not in best or ng < best[nxt]:
                    best[nxt] = ng
                    parent[nxt] = node
                    counter += 1
                    heapq.heappush(frontier, (ng, counter, nxt))
                    res.nodes_generated += 1
        return res

    return _timed(run)


# --------------------------------------------------------------------------- #
# 4. Greedy Best-First Search (tìm kiếm tham lam)
#    Chỉ dùng h(n) -> nhanh nhưng KHÔNG đảm bảo tối ưu
# --------------------------------------------------------------------------- #
def greedy(problem, trace: bool = False) -> SearchResult:
    def run() -> SearchResult:
        res = SearchResult("Greedy")
        start = problem.start
        counter = 0
        frontier: List[Tuple[float, int, Any]] = [(problem.heuristic(start), counter, start)]
        parent: Dict[Any, Any] = {start: None}
        res.nodes_generated = 1

        while frontier:
            res.max_frontier = max(res.max_frontier, len(frontier))
            if trace:
                res.frontier_snapshots.append([s for _, _, s in frontier])

            _, _, node = heapq.heappop(frontier)
            if node in res.visited:
                continue
            res.visited.add(node)
            res.expanded_order.append(node)
            res.nodes_expanded += 1

            if problem.is_goal(node):
                res.path = _reconstruct(parent, node)
                res.cost = path_cost(problem, res.path)
                return res

            for nxt, _ in problem.neighbors(node):
                if nxt in res.visited:
                    continue
                if nxt not in parent:
                    parent[nxt] = node
                counter += 1
                heapq.heappush(frontier, (problem.heuristic(nxt), counter, nxt))
                res.nodes_generated += 1
        return res

    return _timed(run)


# --------------------------------------------------------------------------- #
# 5. A* - kết hợp g(n) + h(n)
#    Tối ưu khi h admissible (h(n) <= chi phí thực tế còn lại)
# --------------------------------------------------------------------------- #
def a_star(problem, trace: bool = False, weight: float = 1.0) -> SearchResult:
    def run() -> SearchResult:
        res = SearchResult("A*" if weight == 1.0 else f"Weighted A* (w={weight:g})")
        start = problem.start
        counter = 0
        h0 = problem.heuristic(start)
        frontier: List[Tuple[float, int, float, Any]] = [(h0 * weight, counter, 0.0, start)]
        parent: Dict[Any, Any] = {start: None}
        best: Dict[Any, float] = {start: 0.0}
        res.nodes_generated = 1

        while frontier:
            res.max_frontier = max(res.max_frontier, len(frontier))
            if trace:
                res.frontier_snapshots.append([s for _, _, _, s in frontier])

            _, _, g, node = heapq.heappop(frontier)
            if node in res.visited:
                continue
            res.visited.add(node)
            res.expanded_order.append(node)
            res.nodes_expanded += 1

            if problem.is_goal(node):
                res.path = _reconstruct(parent, node)
                res.cost = g
                return res

            for nxt, w in problem.neighbors(node):
                if nxt in res.visited:
                    continue
                ng = g + w
                if nxt not in best or ng < best[nxt]:
                    best[nxt] = ng
                    parent[nxt] = node
                    counter += 1
                    f = ng + weight * problem.heuristic(nxt)
                    heapq.heappush(frontier, (f, counter, ng, nxt))
                    res.nodes_generated += 1
        return res

    return _timed(run)


# --------------------------------------------------------------------------- #
# Tiện ích
# --------------------------------------------------------------------------- #
def path_cost(problem, path: Optional[List[Any]]) -> float:
    """Tính tổng chi phí thực tế của một đường đi."""
    if not path or len(path) < 2:
        return 0.0
    total = 0.0
    for u, v in zip(path, path[1:]):
        for nxt, w in problem.neighbors(u):
            if nxt == v:
                total += w
                break
        else:
            return float("inf")
    return total


ALGORITHMS: Dict[str, Callable[..., SearchResult]] = {
    "BFS": bfs,
    "DFS": dfs,
    "UCS": ucs,
    "Greedy": greedy,
    "A*": a_star,
}


def run_all(problem, trace: bool = False) -> List[SearchResult]:
    """Chạy toàn bộ thuật toán trên cùng một bài toán để so sánh."""
    return [fn(problem, trace=trace) for fn in ALGORITHMS.values()]
