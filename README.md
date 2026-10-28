# Ứng dụng mô phỏng các thuật toán tìm kiếm trong không gian trạng thái

Bài tập nhóm môn **Trí tuệ nhân tạo** — xây dựng ứng dụng minh hoạ và so sánh
năm thuật toán tìm kiếm kinh điển trên hai loại không gian trạng thái khác nhau.

| Thuật toán | Thông tin sử dụng | Tối ưu | Đầy đủ |
|---|---|---|---|
| BFS — Breadth First Search | số bước | Chỉ khi mọi cạnh cùng chi phí | Có |
| DFS — Depth First Search | không | Không | Có (đồ thị hữu hạn, có kiểm tra lặp) |
| UCS — Uniform Cost Search | g(n) | **Có** | Có |
| Greedy Best-First Search | h(n) | Không | Có (có kiểm tra lặp) |
| A* Search | g(n) + h(n) | **Có** (khi h admissible) | Có |

## Tính năng

- **Hai không gian trạng thái**
  - *Lưới ô vuông*: vẽ tường bằng chuột, ô địa hình tốn thêm chi phí, 4 hoặc 8 hướng di chuyển, sinh vật cản ngẫu nhiên hoặc sinh mê cung.
  - *Đồ thị thành phố*: đồ thị có trọng số kèm bảng heuristic cho trước (đúng dữ liệu bài tập trên lớp S → G).
- **Mô phỏng từng bước**: tô màu theo đúng thứ tự mở rộng nút, tốc độ điều chỉnh được.
- **So sánh tất cả thuật toán** trên cùng một bản đồ: chi phí, số bước, số nút mở rộng, số nút sinh ra, kích thước frontier lớn nhất, thời gian chạy.
- **Đổi hàm heuristic** ngay trong ứng dụng: Manhattan / Euclid / Chebyshev / Octile / `h = 0` (lúc này A\* suy biến thành UCS — minh hoạ trực quan vai trò của heuristic).
- **Kiểm tra tính chấp nhận được (admissible)** của heuristic bằng Dijkstra ngược từ đích.
- **Chế độ dòng lệnh** để chạy thực nghiệm hàng loạt, không cần giao diện.

## Cài đặt

Yêu cầu: **Python 3.9+**. Ứng dụng chỉ dùng thư viện chuẩn, không cần `pip install`.

```bash
git clone https://github.com/<tai-khoan>/pathfinding-visualizer.git
cd pathfinding-visualizer
python main.py
```

Nếu báo thiếu Tkinter:

```bash
# Ubuntu / Debian
sudo apt install python3-tk
# Windows / macOS: Tkinter có sẵn trong bản Python tải từ python.org
```

## Sử dụng

### Giao diện đồ hoạ

```bash
python main.py
```

| Thao tác | Tác dụng |
|---|---|
| Chuột trái | Vẽ theo công cụ đang chọn (tường / địa hình / điểm bắt đầu / điểm đích) |
| Giữ và kéo chuột trái | Vẽ liên tục |
| Chuột phải | Xoá ô về trạng thái trống |
| ▶ Chạy thuật toán | Chạy thuật toán đang chọn kèm mô phỏng từng bước |
| ⇄ So sánh tất cả | Chạy cả 5 thuật toán, hiển thị bảng số liệu |

### Chế độ dòng lệnh

```bash
# Đồ thị thành phố (bài tập trên lớp): in đường đi của từng thuật toán
python main.py --cli --mode graph

# Một bản đồ lưới ngẫu nhiên cụ thể
python main.py --cli --mode grid --rows 30 --cols 30 --density 0.25 --seed 7

# Thực nghiệm trên nhiều bản đồ ngẫu nhiên
python main.py --cli --mode benchmark --trials 50 --rows 40 --cols 40 --density 0.25
```

Kết quả trên đồ thị bài tập:

```
BFS     -> S -> E -> G                (chi phí 154)
DFS     -> S -> A -> D -> E -> G      (chi phí 227)
UCS     -> S -> B -> F -> G           (chi phí 137)   <- tối ưu
Greedy  -> S -> E -> G                (chi phí 154)
A*      -> S -> B -> F -> G           (chi phí 137)   <- tối ưu, mở rộng 4 nút thay vì 8
```

## Kiểm thử

```bash
python -m unittest discover -s tests -t . -v
```

15 test case kiểm tra: tính tối ưu của UCS và A\*, tính admissible của heuristic,
tính liên tục của đường đi, hành vi khi đích không tới được, và việc A\* luôn mở
rộng không nhiều hơn UCS trên 25 bản đồ ngẫu nhiên.

## Cấu trúc mã nguồn

```
pathfinding-visualizer/
├── main.py                  # điểm khởi động (GUI hoặc CLI)
├── app/
│   ├── algorithms.py        # 5 thuật toán, dùng chung một giao diện Problem
│   ├── problems.py          # GridProblem và GraphProblem + sinh bản đồ
│   ├── gui.py               # giao diện Tkinter, mô phỏng từng bước
│   └── cli.py               # chạy thực nghiệm, in bảng so sánh
├── tests/
│   └── test_algorithms.py   # 15 test case
└── docs/                    # báo cáo, slide, hình minh hoạ
```

Mọi thuật toán nhận vào một đối tượng bài toán có đúng bốn thành phần —
`start`, `is_goal(s)`, `neighbors(s)`, `heuristic(s)` — nên có thể áp dụng cho
bài toán mới (8-puzzle, Tháp Hà Nội, …) mà không sửa một dòng nào trong
`algorithms.py`.

## Kết quả thực nghiệm

Trung bình trên 50 bản đồ lưới 40×40 ngẫu nhiên, mật độ vật cản 25%:

| Thuật toán | Chi phí TB | Số nút mở rộng TB | Thời gian TB (ms) |
|---|---|---|---|
| BFS | 102.86 | 1191.7 | 2.35 |
| DFS | 304.06 | 295.1 | 1.03 |
| UCS | **82.23** | 1190.5 | 2.58 |
| Greedy | 119.49 | **109.1** | **0.40** |
| A\* | **82.23** | 501.5 | 1.29 |

A\* cho lời giải tối ưu giống hệt UCS nhưng chỉ mở rộng khoảng **42%** số nút —
đúng như lý thuyết về vai trò của heuristic admissible.

## Thành viên nhóm

| STT | Họ và tên | MSSV | Nhiệm vụ |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

## Giấy phép

MIT — xem `LICENSE`.
