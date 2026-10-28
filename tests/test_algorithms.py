"""Kiểm thử tính đúng đắn của các thuật toán.

Chạy:  python -m unittest discover -s tests -v
"""

import math
import unittest

from app.algorithms import a_star, bfs, dfs, greedy, path_cost, ucs
from app.problems import GraphProblem, GridProblem

OPTIMAL = [ucs, a_star]
ALL_ALGOS = [bfs, dfs, ucs, greedy, a_star]


class TestGraphProblem(unittest.TestCase):
    """Đồ thị bài tập trên lớp: đáp án đúng là S -> B -> F -> G, chi phí 137."""

    def setUp(self):
        self.p = GraphProblem()

    def test_heuristic_admissible(self):
        ok, violations = self.p.is_admissible()
        self.assertTrue(ok, f"Heuristic không admissible: {violations}")

    def test_ucs_optimal(self):
        r = ucs(self.p)
        self.assertEqual(r.path, ["S", "B", "F", "G"])
        self.assertEqual(r.cost, 137)

    def test_astar_optimal(self):
        r = a_star(self.p)
        self.assertEqual(r.path, ["S", "B", "F", "G"])
        self.assertEqual(r.cost, 137)

    def test_astar_expands_fewer_than_ucs(self):
        self.assertLess(a_star(self.p).nodes_expanded, ucs(self.p).nodes_expanded)

    def test_greedy_found_but_suboptimal(self):
        r = greedy(self.p)
        self.assertTrue(r.found)
        self.assertEqual(r.path, ["S", "E", "G"])
        self.assertEqual(r.cost, 154)
        self.assertGreater(r.cost, 137)

    def test_all_paths_are_valid(self):
        for fn in ALL_ALGOS:
            r = fn(self.p)
            with self.subTest(algo=r.name):
                self.assertTrue(r.found)
                self.assertEqual(r.path[0], "S")
                self.assertEqual(r.path[-1], "G")
                self.assertEqual(r.cost, path_cost(self.p, r.path))

    def test_zero_heuristic_makes_astar_equal_ucs(self):
        p = GraphProblem(heuristic_table={n: 0 for n in GraphProblem().nodes})
        self.assertEqual(a_star(p).cost, ucs(p).cost)

    def test_unreachable_goal(self):
        p = GraphProblem(graph={"X": {"Y": 1}, "Y": {"X": 1}, "Z": {}},
                         heuristic_table={"X": 0, "Y": 0, "Z": 0},
                         start="X", goal="Z")
        for fn in ALL_ALGOS:
            with self.subTest(algo=fn.__name__):
                self.assertFalse(fn(p).found)


class TestGridProblem(unittest.TestCase):

    def test_empty_grid_manhattan(self):
        p = GridProblem(rows=10, cols=10, start=(0, 0), goal=(9, 9))
        for fn in OPTIMAL:
            with self.subTest(algo=fn.__name__):
                self.assertAlmostEqual(fn(p).cost, 18.0)

    def test_bfs_minimises_steps_not_cost(self):
        """Khi có địa hình tốn chi phí, BFS ngắn về số bước nhưng không tối ưu chi phí."""
        p = GridProblem(rows=1, cols=5, start=(0, 0), goal=(0, 4))
        p.cells[0][2] = 9
        self.assertEqual(bfs(p).path_length, ucs(p).path_length)
        self.assertGreaterEqual(bfs(p).cost, ucs(p).cost)

    def test_walls_are_blocking(self):
        p = GridProblem(rows=5, cols=5, start=(0, 0), goal=(4, 4))
        for r in range(5):
            p.cells[r][2] = 1
        for fn in ALL_ALGOS:
            with self.subTest(algo=fn.__name__):
                self.assertFalse(fn(p).found)

    def test_ucs_and_astar_agree_on_random_maps(self):
        for seed in range(25):
            p = GridProblem(rows=20, cols=20, start=(0, 0), goal=(19, 19))
            p.random_obstacles(density=0.22, seed=seed)
            ru, ra = ucs(p), a_star(p)
            with self.subTest(seed=seed):
                self.assertEqual(ru.found, ra.found)
                if ru.found:
                    self.assertAlmostEqual(ru.cost, ra.cost, places=6)
                    self.assertLessEqual(ra.nodes_expanded, ru.nodes_expanded)

    def test_octile_heuristic_admissible_with_diagonal(self):
        p = GridProblem(rows=12, cols=12, start=(0, 0), goal=(11, 11), allow_diagonal=True)
        self.assertAlmostEqual(a_star(p).cost, ucs(p).cost, places=6)
        self.assertAlmostEqual(a_star(p).cost, 11 * math.sqrt(2), places=6)

    def test_path_is_contiguous(self):
        p = GridProblem(rows=15, cols=15, start=(0, 0), goal=(14, 14))
        p.random_obstacles(density=0.2, seed=3)
        for fn in ALL_ALGOS:
            r = fn(p)
            if not r.found:
                continue
            with self.subTest(algo=r.name):
                for u, v in zip(r.path, r.path[1:]):
                    self.assertIn(v, [n for n, _ in p.neighbors(u)])

    def test_dfs_finds_a_path_even_if_long(self):
        p = GridProblem(rows=12, cols=12, start=(0, 0), goal=(11, 11))
        r = dfs(p)
        self.assertTrue(r.found)
        self.assertGreaterEqual(r.cost, ucs(p).cost)


if __name__ == "__main__":
    unittest.main()
