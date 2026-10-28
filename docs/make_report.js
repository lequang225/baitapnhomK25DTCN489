const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, ImageRun,
  TableOfContents, Header, Footer, PageNumber, LevelFormat, convertInchesToTwip,
} = require('docx');
const fs = require('fs');
const path = require('path');

const FIG = path.join(__dirname, 'figures');
const CONTENT_W = 9500;          // DXA: bề rộng vùng nội dung A4 lề 2cm

// ---------------------------------------------------------------- helpers --
const P = (text, o = {}) => new Paragraph({
  alignment: o.align,
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300, lineRule: 'auto' },
  indent: o.indent,
  children: [new TextRun({
    text, bold: o.bold, italics: o.italics, size: o.size ?? 24,
    color: o.color, font: o.font,
  })],
});

const Rich = (runs, o = {}) => new Paragraph({
  alignment: o.align,
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: 300, lineRule: 'auto' },
  children: runs.map(r => new TextRun({
    text: r.t, bold: r.b, italics: r.i, size: r.s ?? 24, font: r.f, color: r.c,
  })),
});

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 320, after: 180 },
  children: [new TextRun({ text, bold: true, size: 30, color: '184f95' })],
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 140 },
  children: [new TextRun({ text, bold: true, size: 26, color: '256abf' })],
});

const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 120 },
  children: [new TextRun({ text, bold: true, size: 24 })],
});

const Bullet = (text, lvl = 0) => new Paragraph({
  numbering: { reference: 'bullets', level: lvl },
  spacing: { after: 80, line: 300, lineRule: 'auto' },
  children: [new TextRun({ text, size: 24 })],
});

const Code = (lines) => new Paragraph({
  shading: { type: ShadingType.CLEAR, fill: 'F4F4F2', color: 'auto' },
  border: {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D5' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D5' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D5' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D5' },
  },
  spacing: { before: 120, after: 160, line: 260 },
  children: lines.flatMap((l, i) => [
    ...(i ? [new TextRun({ break: 1 })] : []),
    new TextRun({ text: l, font: 'Consolas', size: 19 }),
  ]),
});

function cell(text, o = {}) {
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    shading: o.head
      ? { type: ShadingType.CLEAR, fill: 'DCE6F4', color: 'auto' }
      : (o.alt ? { type: ShadingType.CLEAR, fill: 'F6F8FC', color: 'auto' } : undefined),
    verticalAlign: 'center',
    children: String(text).split('\n').map(line => new Paragraph({
      alignment: o.align ?? (o.head ? AlignmentType.CENTER : AlignmentType.LEFT),
      spacing: { after: 0, line: 260 },
      children: [new TextRun({ text: line, bold: o.head || o.bold, size: o.size ?? 21 })],
    })),
  });
}

function table(header, rows, widths, opts = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  return new Table({
    columnWidths: widths,
    width: { size: total, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'A9B8D0' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'A9B8D0' },
      left: { style: BorderStyle.SINGLE, size: 6, color: 'A9B8D0' },
      right: { style: BorderStyle.SINGLE, size: 6, color: 'A9B8D0' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'C9D4E4' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'C9D4E4' },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((t, i) => cell(t, { w: widths[i], head: true })),
      }),
      ...rows.map((r, ri) => new TableRow({
        children: r.map((t, i) => cell(t, {
          w: widths[i],
          alt: ri % 2 === 1,
          align: i === 0 ? AlignmentType.LEFT : (opts.centerBody ? AlignmentType.CENTER : undefined),
          bold: opts.boldFirst && i === 0,
        })),
      })),
    ],
  });
}

function figure(file, ratio, caption, widthPx = 620) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 60, line: 240, lineRule: 'auto' },
      children: [new ImageRun({
        type: 'png',
        data: fs.readFileSync(path.join(FIG, file)),
        transformation: { width: widthPx, height: Math.round(widthPx * ratio) },
      })],
    }),
    P(caption, { align: AlignmentType.CENTER, italics: true, size: 21, after: 220 }),
  ];
}

const caption = (t) => P(t, { align: AlignmentType.CENTER, italics: true, size: 21, after: 200 });
const tcap = (t) => P(t, { align: AlignmentType.CENTER, italics: true, size: 21, before: 120, after: 80 });

// ------------------------------------------------------------------ nội dung
const c = [];

// ============================== TRANG BÌA ==================================
c.push(
  P('TRƯỜNG ĐẠI HỌC ……………………………………', { align: AlignmentType.CENTER, bold: true, size: 26, after: 60 }),
  P('KHOA CÔNG NGHỆ THÔNG TIN', { align: AlignmentType.CENTER, bold: true, size: 26, after: 900 }),
  P('BÁO CÁO BÀI TẬP NHÓM', { align: AlignmentType.CENTER, bold: true, size: 32, after: 160 }),
  P('MÔN: TRÍ TUỆ NHÂN TẠO', { align: AlignmentType.CENTER, bold: true, size: 28, after: 700 }),
  P('ĐỀ TÀI', { align: AlignmentType.CENTER, size: 26, after: 120 }),
  P('XÂY DỰNG ỨNG DỤNG MÔ PHỎNG VÀ SO SÁNH', { align: AlignmentType.CENTER, bold: true, size: 32, after: 60 }),
  P('CÁC THUẬT TOÁN TÌM KIẾM TRONG KHÔNG GIAN TRẠNG THÁI', { align: AlignmentType.CENTER, bold: true, size: 32, after: 900 }),
  P('Giảng viên hướng dẫn:  ……………………………………', { align: AlignmentType.CENTER, size: 24, after: 100 }),
  P('Nhóm thực hiện:  ……………………………………', { align: AlignmentType.CENTER, size: 24, after: 100 }),
  P('Lớp:  ……………………………………', { align: AlignmentType.CENTER, size: 24, after: 900 }),
  P('Thành phố Hồ Chí Minh, tháng 10 năm 2026', { align: AlignmentType.CENTER, italics: true, size: 24 }),
  new Paragraph({ children: [new PageBreak()] }),
);

// ============================== PHÂN CÔNG ==================================
c.push(H1('DANH SÁCH THÀNH VIÊN VÀ PHÂN CÔNG NHIỆM VỤ'));
c.push(table(
  ['STT', 'Họ và tên', 'MSSV', 'Nhiệm vụ được giao', 'Mức độ\nhoàn thành'],
  [
    ['1', '', '', 'Cài đặt thuật toán UCS, A*; viết unit test', '100%'],
    ['2', '', '', 'Cài đặt BFS, DFS, Greedy; mô hình bài toán', '100%'],
    ['3', '', '', 'Xây dựng giao diện Tkinter, mô phỏng từng bước', '100%'],
    ['4', '', '', 'Thực nghiệm, thống kê số liệu, vẽ biểu đồ', '100%'],
    ['5', '', '', 'Viết báo cáo, slide, quản lý repository GitHub', '100%'],
  ],
  [700, 2500, 1500, 3600, 1200], { centerBody: false },
));
c.push(P('', { after: 240 }));
c.push(Rich([
  { t: 'Link GitHub: ', b: true },
  { t: 'https://github.com/<tài-khoản>/pathfinding-visualizer', f: 'Consolas', s: 22 },
]));
c.push(P('(Nhóm cập nhật đường dẫn thật sau khi đẩy mã nguồn lên GitHub — xem Phụ lục B.)', { italics: true, size: 21 }));
c.push(new Paragraph({ children: [new PageBreak()] }));

// ============================== MỤC LỤC ====================================
c.push(H1('MỤC LỤC'));
c.push(new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }));
c.push(P('(Nhấn chuột phải vào mục lục → Update Field để cập nhật số trang.)', { italics: true, size: 21, before: 160 }));
c.push(new Paragraph({ children: [new PageBreak()] }));

// ============================== CHƯƠNG 1 ===================================
c.push(H1('CHƯƠNG 1. GIỚI THIỆU'));

c.push(H2('1.1. Đặt vấn đề'));
c.push(P('Tìm kiếm là bài toán nền tảng của Trí tuệ nhân tạo. Rất nhiều vấn đề thực tế — ' +
  'dẫn đường GPS, điều hướng robot, tìm đường cho nhân vật trong game, định tuyến gói tin trong ' +
  'mạng máy tính, lập lịch sản xuất — đều có thể phát biểu lại dưới dạng bài toán tìm một đường đi ' +
  'từ trạng thái ban đầu tới trạng thái đích trong một không gian trạng thái.'));
c.push(P('Các giáo trình thường trình bày những thuật toán tìm kiếm (BFS, DFS, UCS, Greedy, A*) dưới ' +
  'dạng mã giả và một vài ví dụ nhỏ làm bằng tay. Cách trình bày này đủ để hiểu cơ chế, nhưng khó ' +
  'cảm nhận được sự khác biệt về hiệu quả giữa chúng: vì sao A* lại được dùng phổ biến trong công ' +
  'nghiệp, trong khi UCS cho cùng một kết quả tối ưu? Vì sao tìm kiếm tham lam chạy rất nhanh nhưng ' +
  'lại không được tin cậy? Những câu hỏi đó chỉ trở nên rõ ràng khi ta quan sát trực tiếp phần không ' +
  'gian trạng thái mà mỗi thuật toán phải duyệt qua.'));

c.push(H2('1.2. Mục tiêu đề tài'));
c.push(Bullet('Cài đặt hoàn chỉnh năm thuật toán tìm kiếm: BFS, DFS, UCS, Greedy Best-First Search và A*.'));
c.push(Bullet('Xây dựng ứng dụng có giao diện đồ hoạ cho phép mô phỏng trực quan từng bước mở rộng nút.'));
c.push(Bullet('Cho phép người dùng tự tạo bài toán: vẽ tường, đặt điểm đầu/đích, sinh bản đồ hoặc mê cung ngẫu nhiên, đổi hàm heuristic.'));
c.push(Bullet('Đo đạc và so sánh định lượng các thuật toán trên cùng một bài toán: chi phí đường đi, số nút mở rộng, số nút sinh ra, thời gian chạy.'));
c.push(Bullet('Kiểm chứng bằng thực nghiệm các kết luận lý thuyết: tính tối ưu của UCS và A*, vai trò của heuristic chấp nhận được (admissible).'));

c.push(H2('1.3. Phạm vi và giới hạn'));
c.push(P('Ứng dụng tập trung vào nhóm thuật toán tìm kiếm có hệ thống (systematic search) trên đồ thị ' +
  'trạng thái tất định, đầy đủ thông tin và tĩnh. Hai không gian trạng thái được cài đặt:'));
c.push(Bullet('Lưới ô vuông (grid map) kích thước tuỳ chọn, có tường chắn và ô địa hình tốn thêm chi phí; di chuyển 4 hoặc 8 hướng.'));
c.push(Bullet('Đồ thị thành phố có trọng số kèm bảng heuristic cho trước — chính là dữ liệu bài tập trên lớp (tìm đường từ S đến G), dùng để đối chiếu kết quả chương trình với lời giải làm bằng tay.'));
c.push(P('Các hướng không nằm trong phạm vi: tìm kiếm cục bộ (leo đồi, luyện kim mô phỏng, giải thuật di ' +
  'truyền), tìm kiếm đối kháng (Minimax, Alpha-Beta), môi trường động hoặc quan sát một phần. Những nội ' +
  'dung này được nêu ở phần hướng phát triển.'));

c.push(new Paragraph({ children: [new PageBreak()] }));

// ============================== CHƯƠNG 2 ===================================
c.push(H1('CHƯƠNG 2. CƠ SỞ LÝ THUYẾT'));

c.push(H2('2.1. Bài toán tìm kiếm trong không gian trạng thái'));
c.push(P('Một bài toán tìm kiếm được xác định bởi năm thành phần:'));
c.push(Bullet('Tập trạng thái S — tất cả cấu hình có thể của bài toán.'));
c.push(Bullet('Trạng thái đầu s₀ ∈ S.'));
c.push(Bullet('Hàm kiểm tra đích GOAL(s) → {đúng, sai}.'));
c.push(Bullet('Hàm sinh trạng thái kế tiếp SUCC(s) → tập các cặp (s′, c) với c là chi phí chuyển từ s sang s′.'));
c.push(Bullet('Hàm chi phí đường đi g(n) — tổng chi phí từ s₀ tới n.'));
c.push(P('Lời giải là một dãy trạng thái s₀, s₁, …, sₖ trong đó sₖ thoả GOAL và mỗi bước nằm trong SUCC ' +
  'của bước trước. Lời giải tối ưu là lời giải có g nhỏ nhất.'));
c.push(P('Mọi thuật toán trong chương trình đều thao tác trên ba cấu trúc:'));
c.push(Bullet('Frontier (biên) — tập các nút đã sinh ra nhưng chưa mở rộng. Cấu trúc dữ liệu dùng cho frontier chính là điểm khác biệt cốt lõi giữa các thuật toán.'));
c.push(Bullet('Explored / visited — tập các nút đã mở rộng, dùng để tránh lặp vô hạn trên đồ thị có chu trình.'));
c.push(Bullet('Bảng cha (parent) — dùng để truy vết ngược lại đường đi khi tìm thấy đích.'));

c.push(H2('2.2. Bốn tiêu chí đánh giá một thuật toán tìm kiếm'));
c.push(table(
  ['Tiêu chí', 'Ý nghĩa'],
  [
    ['Tính đầy đủ\n(Completeness)', 'Thuật toán có chắc chắn tìm được lời giải nếu lời giải tồn tại hay không?'],
    ['Tính tối ưu\n(Optimality)', 'Lời giải tìm được có phải là lời giải chi phí nhỏ nhất hay không?'],
    ['Độ phức tạp thời gian', 'Số nút phải sinh ra / mở rộng trước khi tìm thấy lời giải.'],
    ['Độ phức tạp không gian', 'Số nút phải lưu đồng thời trong bộ nhớ (kích thước frontier lớn nhất).'],
  ],
  [2600, 6900],
));
c.push(tcap('Bảng 2.1. Bốn tiêu chí đánh giá thuật toán tìm kiếm'));

c.push(H2('2.3. Các thuật toán tìm kiếm mù (uninformed search)'));

c.push(H3('2.3.1. Tìm kiếm theo chiều rộng — BFS'));
c.push(P('Frontier là hàng đợi FIFO. BFS mở rộng toàn bộ các nút ở độ sâu d trước khi chuyển sang độ sâu ' +
  'd + 1, do đó luôn tìm ra đường đi có ít bước nhất. Cần nhấn mạnh: BFS tối ưu về số bước, không phải ' +
  'tối ưu về chi phí. Khi các cạnh có trọng số khác nhau (ví dụ ô địa hình tốn chi phí 5 so với ô ' +
  'thường tốn 1), BFS có thể trả về đường đi ít ô hơn nhưng đắt hơn — kết quả thực nghiệm ở Chương 5 ' +
  'cho thấy rõ điều này.'));
c.push(Rich([{ t: 'Độ phức tạp: ', b: true }, { t: 'thời gian O(b^d), không gian O(b^d) với b là hệ số phân nhánh, d là độ sâu của lời giải nông nhất.' }]));

c.push(H3('2.3.2. Tìm kiếm theo chiều sâu — DFS'));
c.push(P('Frontier là ngăn xếp LIFO. DFS đi sâu tối đa theo một nhánh rồi mới quay lui. Ưu điểm lớn nhất ' +
  'là tiết kiệm bộ nhớ: chỉ cần lưu đường đi hiện tại cùng các nhánh anh em chưa duyệt, tức O(b·m). ' +
  'Nhược điểm là không tối ưu và, nếu không giới hạn độ sâu trên không gian vô hạn, có thể không đầy đủ. ' +
  'Trên bản đồ lưới, DFS thường cho đường đi ngoằn ngoèo dài gấp nhiều lần đường tối ưu.'));

c.push(H3('2.3.3. Tìm kiếm chi phí đều — UCS'));
c.push(P('Frontier là hàng đợi ưu tiên theo g(n). Mỗi lần lặp, UCS lấy ra nút có chi phí đường đi tích luỹ ' +
  'nhỏ nhất. Vì nút được mở rộng theo thứ tự chi phí tăng dần, lần đầu tiên đích được lấy ra khỏi ' +
  'frontier cũng chính là lúc ta có đường đi rẻ nhất tới đích.'));
c.push(Rich([
  { t: 'Định lý: ', b: true },
  { t: 'UCS là đầy đủ và tối ưu với mọi đồ thị có chi phí cạnh dương. Thực chất UCS chính là thuật toán Dijkstra được trình bày dưới dạng tìm kiếm trên không gian trạng thái.' },
]));
c.push(P('Điểm yếu của UCS là nó mở rộng theo mọi hướng như nhau — giống như một vòng tròn lan toả đều từ ' +
  'điểm xuất phát — vì nó hoàn toàn không biết gì về vị trí của đích.'));

c.push(H2('2.4. Các thuật toán tìm kiếm có thông tin (informed search)'));
c.push(P('Tìm kiếm có thông tin sử dụng thêm hàm heuristic h(n) — ước lượng chi phí còn lại từ n tới đích. ' +
  'Heuristic là tri thức bổ sung về bài toán, giúp thuật toán ưu tiên những nhánh "có vẻ" dẫn tới đích.'));

c.push(H3('2.4.1. Tìm kiếm tham lam — Greedy Best-First Search'));
c.push(P('Sắp xếp frontier chỉ theo h(n), hoàn toàn bỏ qua chi phí đã đi g(n). Thuật toán luôn lao về phía ' +
  'có vẻ gần đích nhất. Kết quả là nó chạy rất nhanh và mở rộng rất ít nút, nhưng không có gì bảo đảm ' +
  'đường đi tìm được là rẻ nhất: một lối đi trông gần đích có thể dẫn vào ngõ cụt hoặc đi vòng rất xa. ' +
  'Trên đồ thị bài tập, Greedy chọn ngay cạnh S–E vì h(E) = 72 nhỏ nhất, rồi đi tiếp E–G, cho tổng chi ' +
  'phí 154 — đắt hơn lời giải tối ưu 137 là 12,4%.'));

c.push(H3('2.4.2. Thuật toán A*'));
c.push(P('A* kết hợp cả hai nguồn thông tin bằng hàm đánh giá:'));
c.push(P('f(n) = g(n) + h(n)', { align: AlignmentType.CENTER, bold: true, size: 26, before: 80, after: 120 }));
c.push(P('trong đó g(n) là chi phí thực tế đã đi từ s₀ tới n, còn h(n) là chi phí ước lượng còn lại từ n ' +
  'tới đích. Như vậy f(n) là ước lượng tổng chi phí của đường đi tốt nhất đi qua n. Frontier là hàng ' +
  'đợi ưu tiên theo f(n).'));
c.push(Rich([{ t: 'Hai tính chất quan trọng của heuristic:', b: true }]));
c.push(Bullet('Chấp nhận được (admissible): h(n) ≤ h*(n) với mọi n, trong đó h*(n) là chi phí thực tế nhỏ nhất từ n tới đích. Nói cách khác, heuristic không bao giờ đánh giá quá cao. Khi h admissible, A* trên cây tìm kiếm là tối ưu.'));
c.push(Bullet('Nhất quán (consistent / monotone): h(n) ≤ c(n, n′) + h(n′) với mọi cạnh (n, n′). Tính nhất quán mạnh hơn tính chấp nhận được và bảo đảm A* trên đồ thị (có tập explored) vẫn tối ưu, đồng thời mỗi nút chỉ cần mở rộng đúng một lần.'));
c.push(P('Hai trường hợp đặc biệt đáng nhớ: khi h(n) = 0 với mọi n, A* suy biến thành đúng UCS; khi bỏ ' +
  'g(n) đi, A* trở thành tìm kiếm tham lam. A* vì thế nằm chính giữa hai thái cực — và đó là lý do ứng ' +
  'dụng cho phép chọn hàm heuristic "zero" để người học quan sát trực tiếp sự suy biến này.'));

c.push(H3('2.4.3. Các hàm heuristic dùng cho lưới ô vuông'));
c.push(table(
  ['Hàm heuristic', 'Công thức', 'Dùng khi'],
  [
    ['Manhattan', 'h = |Δr| + |Δc|', 'Di chuyển 4 hướng — admissible và nhất quán'],
    ['Euclid', 'h = √(Δr² + Δc²)', 'Di chuyển mọi góc; với lưới 4 hướng thì admissible nhưng yếu hơn Manhattan'],
    ['Chebyshev', 'h = max(|Δr|, |Δc|)', 'Di chuyển 8 hướng với chi phí chéo bằng 1'],
    ['Octile', 'h = (|Δr| + |Δc|) + (√2 − 2)·min(|Δr|, |Δc|)', 'Di chuyển 8 hướng với chi phí chéo bằng √2 — chính xác nhất'],
    ['Zero', 'h = 0', 'Để minh hoạ: A* suy biến thành UCS'],
  ],
  [1900, 3700, 3900],
));
c.push(tcap('Bảng 2.2. Các hàm heuristic được cài đặt trong ứng dụng'));
c.push(P('Một heuristic h₁ được gọi là trội hơn (dominant) h₂ nếu h₁(n) ≥ h₂(n) với mọi n mà vẫn admissible. ' +
  'Heuristic càng trội thì A* càng mở rộng ít nút. Đây là lý do Manhattan tốt hơn Euclid trên lưới 4 ' +
  'hướng: với cùng một cặp điểm, Manhattan luôn cho giá trị lớn hơn hoặc bằng mà không bao giờ vượt quá ' +
  'chi phí thực tế.'));

c.push(H2('2.5. Bảng tổng hợp lý thuyết'));
c.push(table(
  ['Thuật toán', 'Cấu trúc frontier', 'Thông tin\nsử dụng', 'Đầy đủ', 'Tối ưu', 'Thời gian', 'Không gian'],
  [
    ['BFS', 'Hàng đợi FIFO', '—', 'Có', 'Chỉ khi mọi cạnh\ncùng chi phí', 'O(b^d)', 'O(b^d)'],
    ['DFS', 'Ngăn xếp LIFO', '—', 'Có*', 'Không', 'O(b^m)', 'O(b·m)'],
    ['UCS', 'Hàng đợi ưu tiên\ntheo g(n)', 'g(n)', 'Có', 'Có', 'O(b^(1+⌊C*/ε⌋))', 'O(b^(1+⌊C*/ε⌋))'],
    ['Greedy', 'Hàng đợi ưu tiên\ntheo h(n)', 'h(n)', 'Có*', 'Không', 'O(b^m)', 'O(b^m)'],
    ['A*', 'Hàng đợi ưu tiên\ntheo f = g + h', 'g(n) + h(n)', 'Có', 'Có khi h\nadmissible', 'O(b^d) — phụ thuộc\nchất lượng h', 'O(b^d)'],
  ],
  [1200, 1850, 1250, 850, 1250, 1750, 1350], { centerBody: true, boldFirst: true },
));
c.push(tcap('Bảng 2.3. So sánh lý thuyết năm thuật toán (b: hệ số phân nhánh, d: độ sâu lời giải, ' +
  'm: độ sâu tối đa, C*: chi phí tối ưu, ε: chi phí cạnh nhỏ nhất). (*) đầy đủ trên không gian hữu hạn có kiểm tra lặp.'));

c.push(new Paragraph({ children: [new PageBreak()] }));

// ============================== CHƯƠNG 3 ===================================
c.push(H1('CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG'));

c.push(H2('3.1. Yêu cầu chức năng'));
c.push(table(
  ['Mã', 'Yêu cầu chức năng'],
  [
    ['CN01', 'Hiển thị bản đồ dạng lưới và cho phép người dùng vẽ tường, vẽ ô địa hình, đặt điểm bắt đầu và điểm đích bằng chuột.'],
    ['CN02', 'Sinh bản đồ vật cản ngẫu nhiên và sinh mê cung tự động.'],
    ['CN03', 'Chọn và chạy một trong năm thuật toán, mô phỏng trực quan theo đúng thứ tự mở rộng nút.'],
    ['CN04', 'Điều chỉnh tốc độ mô phỏng.'],
    ['CN05', 'Chạy đồng thời cả năm thuật toán trên cùng một bản đồ và hiển thị bảng số liệu so sánh.'],
    ['CN06', 'Chuyển đổi giữa hai không gian trạng thái: lưới ô vuông và đồ thị thành phố có trọng số.'],
    ['CN07', 'Chọn hàm heuristic và bật/tắt di chuyển theo đường chéo.'],
    ['CN08', 'Kiểm tra tính chấp nhận được của bảng heuristic trên đồ thị.'],
    ['CN09', 'Chạy thực nghiệm hàng loạt ở chế độ dòng lệnh, không cần giao diện.'],
  ],
  [900, 8600],
));
c.push(tcap('Bảng 3.1. Danh sách yêu cầu chức năng'));

c.push(H2('3.2. Kiến trúc tổng thể'));
c.push(P('Hệ thống được tách thành bốn tầng độc lập, trong đó tầng thuật toán hoàn toàn không phụ thuộc ' +
  'vào tầng giao diện. Nhờ vậy có thể chạy thực nghiệm trên máy chủ không có màn hình, và có thể thay ' +
  'giao diện Tkinter bằng web mà không sửa một dòng thuật toán nào.'));
c.push(Code([
  '+--------------------------------------------------------------+',
  '|  main.py      - diem khoi dong, chon che do GUI hoac CLI      |',
  '+---------------+----------------------------+-----------------+',
  '                |                            |',
  '    +-----------v----------+     +-----------v----------+',
  '    |  app/gui.py          |     |  app/cli.py          |',
  '    |  Giao dien Tkinter   |     |  Thuc nghiem, bang   |',
  '    |  ve, animation       |     |  so lieu, benchmark  |',
  '    +-----------+----------+     +-----------+----------+',
  '                +-------------+--------------+',
  '                              |',
  '                 +------------v-------------+',
  '                 |  app/algorithms.py       |   BFS, DFS, UCS,',
  '                 |  5 thuat toan            |   Greedy, A*',
  '                 +------------+-------------+',
  '                              |',
  '                 +------------v-------------+',
  '                 |  app/problems.py         |   GridProblem,',
  '                 |  Mo hinh bai toan        |   GraphProblem',
  '                 +--------------------------+',
]));
c.push(caption('Hình 3.1. Kiến trúc phân tầng của ứng dụng'));

c.push(H2('3.3. Trừu tượng hoá bài toán — thiết kế cốt lõi'));
c.push(P('Quyết định thiết kế quan trọng nhất của đồ án là định nghĩa một giao diện chung cho mọi bài ' +
  'toán tìm kiếm. Một "bài toán" chỉ cần cung cấp đúng bốn thành phần:'));
c.push(Code([
  'class Problem:',
  '    start                      # trang thai bat dau',
  '    def is_goal(self, s)       # -> bool',
  '    def neighbors(self, s)     # -> [(trang_thai_ke, chi_phi), ...]',
  '    def heuristic(self, s)     # -> float, uoc luong chi phi con lai',
]));
c.push(P('Năm thuật toán được viết chỉ dựa trên bốn thành phần này, nên hoàn toàn không biết mình đang ' +
  'giải lưới ô vuông hay đồ thị thành phố. Hệ quả thực tế: muốn bổ sung bài toán mới (8-puzzle, Tháp ' +
  'Hà Nội, tô màu đồ thị) chỉ cần viết thêm một lớp bài toán, không sửa một dòng nào trong tệp ' +
  'algorithms.py. Đây chính là nguyên lý đảo ngược phụ thuộc áp dụng cho một đồ án thuật toán.'));

c.push(H2('3.4. Lưu đồ thuật toán A*'));
c.push(Code([
  '   BAT DAU',
  '      |',
  '      v',
  '   [ frontier = { start } voi f(start) = h(start);  g(start) = 0 ]',
  '      |',
  '      v',
  '   < frontier rong? > --- dung ---> [ THAT BAI: khong co duong di ]',
  '      |',
  '      | khong',
  '      v',
  '   [ n = nut co f(n) nho nhat, lay ra khoi frontier ]',
  '      |',
  '      v',
  '   < n da duoc mo rong? > --- dung ---> (quay lai buoc kiem tra frontier)',
  '      |',
  '      | chua',
  '      v',
  '   [ danh dau n da mo rong ]',
  '      |',
  '      v',
  '   < n la dich? > --- dung ---> [ THANH CONG: truy vet parent de lay duong di ]',
  '      |',
  '      | khong',
  '      v',
  '   [ Voi moi (m, c) thuoc neighbors(n):',
  '         g_moi = g(n) + c',
  '         neu m chua co g hoac g_moi < g(m):',
  '             g(m) = g_moi',
  '             parent(m) = n',
  '             day m vao frontier voi f(m) = g(m) + h(m) ]',
  '      |',
  '      v',
  '   (quay lai buoc kiem tra frontier)',
]));
c.push(caption('Hình 3.2. Lưu đồ thuật toán A* như được cài đặt trong ứng dụng'));

c.push(new Paragraph({ children: [new PageBreak()] }));

// ============================== CHƯƠNG 4 ===================================
c.push(H1('CHƯƠNG 4. CÀI ĐẶT ỨNG DỤNG'));

c.push(H2('4.1. Công nghệ sử dụng'));
c.push(table(
  ['Thành phần', 'Lựa chọn', 'Lý do'],
  [
    ['Ngôn ngữ', 'Python 3.9+', 'Cú pháp gần mã giả, thuận lợi cho mục đích học thuật'],
    ['Giao diện', 'Tkinter (thư viện chuẩn)', 'Có sẵn cùng Python, không cần cài thêm gói nào'],
    ['Hàng đợi ưu tiên', 'heapq (thư viện chuẩn)', 'Heap nhị phân, thao tác push/pop O(log n)'],
    ['Kiểm thử', 'unittest (thư viện chuẩn)', '15 test case tự động, chạy bằng một lệnh'],
    ['Biểu đồ báo cáo', 'Matplotlib', 'Chỉ dùng khi sinh hình cho báo cáo, không bắt buộc để chạy ứng dụng'],
    ['Quản lý mã nguồn', 'Git + GitHub', 'Theo yêu cầu nộp bài'],
  ],
  [1900, 3100, 4500],
));
c.push(tcap('Bảng 4.1. Công nghệ sử dụng'));
c.push(P('Toàn bộ ứng dụng chỉ dùng thư viện chuẩn của Python, nên người chấm chỉ cần tải mã nguồn về và ' +
  'chạy một lệnh duy nhất, không phải cài đặt bất kỳ gói phụ thuộc nào.'));

c.push(H2('4.2. Cấu trúc mã nguồn'));
c.push(Code([
  'pathfinding-visualizer/',
  '├── main.py                  # diem khoi dong (GUI hoac CLI)',
  '├── app/',
  '│   ├── algorithms.py        # 5 thuat toan + lop SearchResult',
  '│   ├── problems.py          # GridProblem, GraphProblem, sinh ban do',
  '│   ├── gui.py               # giao dien Tkinter, mo phong tung buoc',
  '│   └── cli.py               # thuc nghiem, in bang so sanh',
  '├── tests/',
  '│   └── test_algorithms.py   # 15 test case kiem thu tu dong',
  '├── docs/                    # bao cao, slide, hinh minh hoa',
  '├── README.md',
  '└── requirements.txt',
]));
c.push(caption('Hình 4.1. Cây thư mục mã nguồn'));

c.push(H2('4.3. Cài đặt các thuật toán'));
c.push(P('Mỗi thuật toán trả về một đối tượng SearchResult chứa đầy đủ thông tin phục vụ cả việc vẽ ' +
  'animation lẫn việc thống kê: đường đi, chi phí, thứ tự mở rộng nút, tập đã duyệt, số nút mở rộng, ' +
  'số nút sinh ra, kích thước frontier lớn nhất và thời gian chạy.'));

c.push(H3('4.3.1. Mã nguồn thuật toán A*'));
c.push(Code([
  'def a_star(problem, trace=False, weight=1.0):',
  '    start = problem.start',
  '    counter = 0',
  '    frontier = [(problem.heuristic(start), counter, 0.0, start)]',
  '    parent = {start: None}',
  '    best   = {start: 0.0}        # chi phi g tot nhat da biet',
  '    visited = set()',
  '',
  '    while frontier:',
  '        _, _, g, node = heapq.heappop(frontier)   # lay f nho nhat',
  '        if node in visited:',
  '            continue',
  '        visited.add(node)',
  '',
  '        if problem.is_goal(node):                 # tim thay dich',
  '            return reconstruct(parent, node), g',
  '',
  '        for nxt, w in problem.neighbors(node):',
  '            if nxt in visited:',
  '                continue',
  '            ng = g + w',
  '            if nxt not in best or ng < best[nxt]:  # tim duoc duong re hon',
  '                best[nxt]   = ng',
  '                parent[nxt] = node',
  '                counter += 1',
  '                f = ng + weight * problem.heuristic(nxt)',
  '                heapq.heappush(frontier, (f, counter, ng, nxt))',
  '    return None, float("inf")                      # khong co duong di',
]));
c.push(P('Ba chi tiết cài đặt đáng lưu ý:'));
c.push(Bullet('Biến counter được đẩy vào tuple làm khoá phụ. Khi hai nút có cùng f, heapq sẽ so sánh phần tử tiếp theo; nếu không có counter, Python sẽ cố so sánh trực tiếp hai trạng thái và gây lỗi, đồng thời thứ tự lấy ra sẽ không xác định.'));
c.push(Bullet('Bảng best lưu chi phí g tốt nhất đã biết của mỗi nút. Khi tìm được đường rẻ hơn tới một nút đã có trong frontier, ta đẩy bản ghi mới vào thay vì cập nhật tại chỗ (lazy deletion) — bản ghi cũ sẽ bị bỏ qua nhờ phép kiểm tra "node in visited".'));
c.push(Bullet('Tham số weight cho phép chạy Weighted A* với f = g + w·h (w > 1): thuật toán nhanh hơn nhưng chi phí đường đi không vượt quá w lần chi phí tối ưu.'));

c.push(H3('4.3.2. Sự khác biệt giữa năm thuật toán trong mã nguồn'));
c.push(P('Điểm thú vị về mặt cài đặt: năm thuật toán gần như giống hệt nhau, chỉ khác ở khoá sắp xếp ' +
  'frontier. Đây chính là minh chứng rõ nhất cho nhận định "cấu trúc frontier quyết định hành vi của ' +
  'thuật toán tìm kiếm".'));
c.push(table(
  ['Thuật toán', 'Cấu trúc frontier', 'Khoá lấy ra'],
  [
    ['BFS', 'collections.deque', 'popleft() — vào trước ra trước'],
    ['DFS', 'list (stack)', 'pop() — vào sau ra trước'],
    ['UCS', 'heapq', 'g(n)'],
    ['Greedy', 'heapq', 'h(n)'],
    ['A*', 'heapq', 'f(n) = g(n) + h(n)'],
  ],
  [2000, 3200, 4300], { boldFirst: true },
));
c.push(tcap('Bảng 4.2. Khác biệt cốt lõi giữa các thuật toán trong cài đặt'));

c.push(H2('4.4. Giao diện người dùng'));
c.push(P('Cửa sổ chính gồm bảng điều khiển bên trái và vùng vẽ bên phải:'));
c.push(Bullet('Bảng điều khiển: chọn không gian trạng thái, chọn thuật toán, chọn hàm heuristic, bật/tắt đi chéo, chọn công cụ vẽ, chỉnh tốc độ, các nút chạy / so sánh / sinh bản đồ / sinh mê cung / xoá, kèm bảng chú thích màu.'));
c.push(Bullet('Vùng vẽ: lưới ô vuông hoặc đồ thị thành phố; thanh trạng thái hiển thị tóm tắt kết quả; bảng số liệu bên dưới hiển thị từng thuật toán theo bảy cột.'));
c.push(P('Về animation: việc mô phỏng không dùng vòng lặp kèm sleep (sẽ làm treo giao diện), mà dùng cơ ' +
  'chế after() của Tkinter — mỗi lần gọi lại chỉ tô thêm một nhóm ô rồi hẹn lượt kế tiếp, nhờ đó cửa sổ ' +
  'vẫn phản hồi thao tác người dùng trong suốt quá trình mô phỏng.'));

c.push(new Paragraph({ children: [new PageBreak()] }));

// ============================== CHƯƠNG 5 ===================================
c.push(H1('CHƯƠNG 5. THỰC NGHIỆM VÀ ĐÁNH GIÁ'));

c.push(H2('5.1. Thực nghiệm 1 — Đối chiếu với lời giải làm bằng tay'));
c.push(P('Mục đích: kiểm chứng tính đúng đắn của chương trình bằng cách so sánh kết quả với lời giải tự ' +
  'làm trên giấy. Dữ liệu là đồ thị thành phố trong bài tập trên lớp, gồm 11 đỉnh, 14 cạnh vô hướng, ' +
  'kèm bảng heuristic cho trước; cần tìm đường từ S đến G.'));
c.push(...figure('fig2_graph.png', 0.6228, 'Hình 5.1. Đồ thị thành phố và đường đi tối ưu S → B → F → G', 520));

c.push(P('Trước hết, chương trình kiểm tra tính chấp nhận được của bảng heuristic bằng thuật toán Dijkstra ' +
  'chạy ngược từ đích: kết quả xác nhận h(n) ≤ h*(n) với mọi đỉnh, nên A* được bảo đảm tối ưu trên ' +
  'đồ thị này. Kết quả chạy năm thuật toán:'));
c.push(table(
  ['Thuật toán', 'Đường đi tìm được', 'Chi phí', 'Số nút\nmở rộng', 'Số nút\nsinh ra', 'Tối ưu'],
  [
    ['BFS', 'S → E → G', '154', '8', '8', 'Không'],
    ['DFS', 'S → A → D → E → G', '227', '5', '8', 'Không'],
    ['UCS', 'S → B → F → G', '137', '8', '9', 'Có'],
    ['Greedy', 'S → E → G', '154', '3', '7', 'Không'],
    ['A*', 'S → B → F → G', '137', '4', '7', 'Có'],
  ],
  [1600, 3100, 1100, 1250, 1250, 1200], { centerBody: true, boldFirst: true },
));
c.push(tcap('Bảng 5.1. Kết quả trên đồ thị thành phố — hoàn toàn trùng khớp với lời giải làm bằng tay'));

c.push(P('Nhận xét:'));
c.push(Bullet('UCS và A* cùng cho lời giải tối ưu S → B → F → G với chi phí 137, đúng như kết quả giải tay.'));
c.push(Bullet('A* chỉ mở rộng 4 nút trong khi UCS phải mở rộng 8 nút — tiết kiệm một nửa công sức tính toán mà kết quả không hề kém đi. Nguyên nhân: nhờ h(n), A* loại bỏ ngay các nhánh A, C, D vì f của chúng (178, 166, …) lớn hơn f(G) = 137.'));
c.push(Bullet('Greedy nhanh nhất (chỉ 3 nút) nhưng cho đường đi đắt hơn 12,4%. Lý do: tại S nó chọn ngay E vì h(E) = 72 nhỏ nhất, mà không biết rằng cạnh E–G về sau rất đắt (82).'));
c.push(Bullet('BFS cho đúng đường đi ít bước nhất (2 bước) nhưng đó lại không phải đường rẻ nhất — minh hoạ rõ sự khác biệt giữa "tối ưu về số bước" và "tối ưu về chi phí".'));
c.push(Bullet('DFS cho kết quả tệ nhất (227) vì đi sâu theo nhánh đầu tiên gặp được mà không cân nhắc chi phí.'));

c.push(H2('5.2. Thực nghiệm 2 — Vùng không gian trạng thái phải duyệt'));
c.push(P('Mục đích: quan sát trực quan "cái giá" của mỗi thuật toán. Cùng một bản đồ lưới 30×30 với 22% ' +
  'vật cản, ba thuật toán cho ra ba vùng duyệt khác nhau rõ rệt.'));
c.push(...figure('fig1_grid_compare.png', 0.3899, 'Hình 5.2. Vùng ô phải mở rộng của UCS, A* và Greedy trên cùng một bản đồ', 640));
c.push(P('Hình ảnh này nói lên gần như toàn bộ nội dung lý thuyết của Chương 2:'));
c.push(Bullet('UCS (668 ô) lan toả đều ra mọi hướng, phủ gần kín bản đồ, vì nó hoàn toàn không biết đích nằm ở đâu.'));
c.push(Bullet('A* (178 ô) tạo thành một "hành lang" hẹp hướng thẳng về đích, chỉ phình ra khi gặp vật cản phải đi vòng. Chi phí đường đi vẫn đúng bằng UCS: 60.'));
c.push(Bullet('Greedy (64 ô) duyệt ít nhất, nhưng đường đi tìm được tốn 78 thay vì 60 — đắt hơn 30%.'));
c.push(P('Nói cách khác, A* tiết kiệm được 73% số nút so với UCS mà không mất gì về chất lượng lời giải; ' +
  'còn Greedy tiết kiệm thêm nữa nhưng phải trả giá bằng chính chất lượng lời giải.'));

c.push(H2('5.3. Thực nghiệm 3 — Thống kê trên 50 bản đồ ngẫu nhiên'));
c.push(P('Mục đích: loại bỏ yếu tố may rủi của một bản đồ cụ thể. Cấu hình: lưới 40×40, mật độ vật cản ' +
  '25%, 50 bản đồ sinh ngẫu nhiên với seed từ 0 đến 49, điểm đầu (0,0) và điểm đích (39,39). Giá trị ' +
  'trong bảng là trung bình trên các bản đồ có lời giải.'));
c.push(...figure('fig3_benchmark.png', 0.3847, 'Hình 5.3. Chi phí đường đi và số nút mở rộng trung bình trên 50 bản đồ', 640));
c.push(table(
  ['Thuật toán', 'Chi phí\nTB', 'So với\ntối ưu', 'Số nút mở rộng\nTB', 'So với UCS', 'Thời gian\nTB (ms)'],
  [
    ['BFS', '102,86', '+25,1%', '1 191,7', '100,1%', '2,35'],
    ['DFS', '304,06', '+269,8%', '295,1', '24,8%', '1,03'],
    ['UCS', '82,23', 'tối ưu', '1 190,5', '100%', '2,58'],
    ['Greedy', '119,49', '+45,3%', '109,1', '9,2%', '0,40'],
    ['A*', '82,23', 'tối ưu', '501,5', '42,1%', '1,29'],
  ],
  [1500, 1300, 1400, 2000, 1600, 1700], { centerBody: true, boldFirst: true },
));
c.push(tcap('Bảng 5.2. Kết quả trung bình trên 50 bản đồ lưới 40×40, mật độ vật cản 25%'));
c.push(P('Kết luận định lượng rút ra từ bảng trên:'));
c.push(Bullet('A* và UCS cho chi phí trung bình giống hệt nhau đến từng chữ số thập phân (82,23) — bằng chứng thực nghiệm cho tính tối ưu của cả hai, và cho thấy heuristic Manhattan quả thực là chấp nhận được.'));
c.push(Bullet('A* chỉ mở rộng 42,1% số nút của UCS và chạy nhanh hơn gấp đôi. Đây chính là lý do A* là lựa chọn mặc định trong công nghiệp.'));
c.push(Bullet('BFS đắt hơn tối ưu 25,1% mặc dù phải duyệt số nút tương đương UCS — tệ nhất ở cả hai tiêu chí trong nhóm thuật toán hoàn chỉnh, do bản đồ có ô địa hình chi phí khác nhau.'));
c.push(Bullet('Greedy rẻ nhất về tính toán (9,2% số nút, 0,40 ms) nhưng đường đi đắt hơn tối ưu 45,3%. Nó phù hợp khi cần phản hồi tức thời và chấp nhận lời giải gần đúng.'));
c.push(Bullet('DFS cho chi phí đường đi gấp gần 3,7 lần tối ưu — xác nhận DFS không phải công cụ để tìm đường đi ngắn nhất.'));

c.push(H2('5.4. Thực nghiệm 4 — Ảnh hưởng của độ phức tạp bản đồ'));
c.push(P('Mục đích: khảo sát xem ưu thế của A* có được giữ vững khi bản đồ thay đổi độ khó hay không. ' +
  'Mật độ vật cản được quét từ 5% đến 35%, mỗi mức chạy 30 bản đồ ngẫu nhiên.'));
c.push(...figure('fig4_density.png', 0.4659, 'Hình 5.4. Số nút mở rộng trung bình theo mật độ vật cản', 600));
c.push(P('Quan sát được ba xu hướng:'));
c.push(Bullet('Đường BFS và UCS gần như trùng khít nhau — cả hai đều buộc phải duyệt toàn bộ vùng khả thi, chỉ khác thứ tự.'));
c.push(Bullet('Khoảng cách giữa A* và UCS lớn nhất ở bản đồ thoáng (mật độ 5%: 1 093 so với 1 515 nút) và thu hẹp dần khi bản đồ dày vật cản. Lý do: vật cản càng nhiều thì heuristic đường chim bay càng sai lệch so với chi phí thực tế, A* càng phải mò mẫm nhiều hơn.'));
c.push(Bullet('Số nút của DFS và Greedy lại tăng theo mật độ vật cản, vì chúng thường xuyên lao vào ngõ cụt và phải quay lui.'));
c.push(P('Kết luận: hiệu quả của A* không phải là hằng số mà phụ thuộc vào chất lượng của heuristic trong ' +
  'từng bài toán cụ thể. Heuristic càng sát chi phí thực tế thì A* càng gần với đường đi thẳng tới đích; ' +
  'khi h(n) = 0, A* trở lại đúng bằng UCS.'));

c.push(H2('5.5. Kiểm thử tự động'));
c.push(P('Bộ kiểm thử gồm 15 test case viết bằng unittest, chạy bằng lệnh:'));
c.push(Code(['python -m unittest discover -s tests -t . -v']));
c.push(table(
  ['Nhóm kiểm thử', 'Nội dung', 'Kết quả'],
  [
    ['Tính đúng đắn', 'UCS và A* trả về đúng đường S → B → F → G, chi phí 137', 'Đạt'],
    ['Tính admissible', 'Bảng heuristic thoả h(n) ≤ h*(n) trên mọi đỉnh', 'Đạt'],
    ['Hiệu quả của heuristic', 'A* mở rộng ít nút hơn UCS', 'Đạt'],
    ['Tính không tối ưu của Greedy', 'Greedy tìm thấy đường nhưng chi phí 154 > 137', 'Đạt'],
    ['Tính hợp lệ của đường đi', 'Mọi bước liên tiếp đều là cặp đỉnh kề; chi phí khớp với tổng trọng số', 'Đạt'],
    ['Trường hợp biên', 'Đích bị tường bao kín / không tới được — cả 5 thuật toán đều báo không có lời giải', 'Đạt'],
    ['Sự suy biến của A*', 'Khi h(n) = 0, A* cho kết quả trùng UCS', 'Đạt'],
    ['Nhất quán trên dữ liệu ngẫu nhiên', 'Trên 25 bản đồ ngẫu nhiên, UCS và A* luôn cho cùng chi phí và A* không mở rộng nhiều nút hơn', 'Đạt'],
    ['Heuristic Octile', 'Khi cho phép đi chéo, A* vẫn tối ưu và bằng đúng 11·√2 trên lưới trống', 'Đạt'],
    ['BFS với địa hình', 'BFS ngắn nhất về số bước nhưng chi phí ≥ UCS', 'Đạt'],
  ],
  [2300, 5900, 1300], { boldFirst: true },
));
c.push(tcap('Bảng 5.3. Tổng hợp kết quả kiểm thử — 15/15 test case đạt'));

c.push(new Paragraph({ children: [new PageBreak()] }));

// ============================== CHƯƠNG 6 ===================================
c.push(H1('CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN'));

c.push(H2('6.1. Kết quả đạt được'));
c.push(Bullet('Cài đặt hoàn chỉnh và kiểm thử năm thuật toán tìm kiếm trên một giao diện bài toán thống nhất, cho phép mở rộng sang bài toán mới mà không sửa mã thuật toán.'));
c.push(Bullet('Xây dựng ứng dụng đồ hoạ mô phỏng từng bước, hỗ trợ hai không gian trạng thái, năm hàm heuristic và nhiều cách sinh bản đồ.'));
c.push(Bullet('Kết quả chương trình trùng khớp hoàn toàn với lời giải làm bằng tay trên đồ thị bài tập (S → B → F → G, chi phí 137).'));
c.push(Bullet('Thực hiện bốn thực nghiệm với tổng cộng hơn 400 lượt chạy, đưa ra số liệu định lượng cho mọi nhận định lý thuyết.'));
c.push(Bullet('Bộ kiểm thử tự động 15 test case, đạt 15/15.'));

c.push(H2('6.2. Bài học rút ra'));
c.push(P('Ba kết luận quan trọng nhất mà nhóm rút ra từ quá trình thực hiện đề tài:'));
c.push(Rich([{ t: 'Thứ nhất, ', b: true }, { t: 'cấu trúc dữ liệu của frontier quyết định toàn bộ hành vi của thuật toán tìm kiếm. Năm thuật toán trong đồ án có mã nguồn gần như giống hệt nhau, chỉ khác ở khoá sắp xếp frontier, nhưng cho ra năm hành vi hoàn toàn khác biệt. Hàng đợi FIFO sinh ra BFS, ngăn xếp sinh ra DFS, hàng đợi ưu tiên theo g sinh ra UCS, theo h sinh ra Greedy, theo g + h sinh ra A*.' }]));
c.push(Rich([{ t: 'Thứ hai, ', b: true }, { t: 'heuristic không làm thay đổi lời giải, nó chỉ làm thay đổi công sức tìm ra lời giải. UCS và A* luôn cho cùng một chi phí tối ưu, nhưng A* đạt được điều đó với chưa tới một nửa số nút phải mở rộng. Điều kiện để sự "miễn phí" này thành hiện thực là tính chấp nhận được của heuristic — nếu heuristic đánh giá quá cao, A* sẽ mất tính tối ưu.' }]));
c.push(Rich([{ t: 'Thứ ba, ', b: true }, { t: 'luôn tồn tại một sự đánh đổi giữa tốc độ và chất lượng lời giải. Greedy nhanh gấp sáu lần A* nhưng cho đường đi đắt hơn 45%. Không có thuật toán nào "tốt nhất" một cách tuyệt đối; lựa chọn phụ thuộc vào việc bài toán cụ thể coi trọng điều gì hơn — độ chính xác hay thời gian phản hồi.' }]));

c.push(H2('6.3. Hạn chế'));
c.push(Bullet('Chỉ xử lý môi trường tĩnh, tất định và quan sát đầy đủ; chưa hỗ trợ bản đồ thay đổi trong lúc đang tìm đường.'));
c.push(Bullet('Giao diện Tkinter tuy gọn nhẹ nhưng vẽ lại chậm trên lưới rất lớn (trên 100×100 ô).'));
c.push(Bullet('Chưa cài đặt các thuật toán nâng cao như IDA*, Jump Point Search hay tìm kiếm hai chiều.'));

c.push(H2('6.4. Hướng phát triển'));
c.push(Bullet('Bổ sung IDA* (tiết kiệm bộ nhớ), Bidirectional Search (tìm kiếm từ hai đầu) và Jump Point Search (tối ưu riêng cho lưới đồng nhất).'));
c.push(Bullet('Thêm bài toán 8-puzzle và Tháp Hà Nội để minh hoạ cùng bộ thuật toán trên không gian trạng thái phi hình học — nhờ thiết kế hiện tại chỉ cần viết thêm một lớp bài toán.'));
c.push(Bullet('Hỗ trợ D* Lite cho môi trường động, mô phỏng tình huống robot phát hiện vật cản mới khi đang di chuyển.'));
c.push(Bullet('Chuyển giao diện sang nền web để chia sẻ bằng đường dẫn, phục vụ giảng dạy trực tuyến.'));
c.push(Bullet('Xuất kết quả thực nghiệm ra tệp CSV và vẽ biểu đồ ngay trong ứng dụng.'));

c.push(new Paragraph({ children: [new PageBreak()] }));

// ========================= TÀI LIỆU THAM KHẢO ==============================
c.push(H1('TÀI LIỆU THAM KHẢO'));
c.push(P('[1] Stuart Russell, Peter Norvig, "Artificial Intelligence: A Modern Approach", 4th Edition, ' +
  'Pearson, 2021 — Chương 3: Solving Problems by Searching.', { after: 140 }));
c.push(P('[2] Peter E. Hart, Nils J. Nilsson, Bertram Raphael, "A Formal Basis for the Heuristic ' +
  'Determination of Minimum Cost Paths", IEEE Transactions on Systems Science and Cybernetics, ' +
  'vol. 4, no. 2, pp. 100–107, 1968.', { after: 140 }));
c.push(P('[3] Edsger W. Dijkstra, "A Note on Two Problems in Connexion with Graphs", Numerische ' +
  'Mathematik, vol. 1, pp. 269–271, 1959.', { after: 140 }));
c.push(P('[4] Amit Patel, "Introduction to the A* Algorithm" và "Heuristics", Red Blob Games, ' +
  'https://www.redblobgames.com/pathfinding/a-star/introduction.html', { after: 140 }));
c.push(P('[5] Thomas H. Cormen và cộng sự, "Introduction to Algorithms", 4th Edition, MIT Press, 2022 — ' +
  'Chương 22: Elementary Graph Algorithms, Chương 24: Single-Source Shortest Paths.', { after: 140 }));
c.push(P('[6] Python Software Foundation, "heapq — Heap queue algorithm" và "tkinter — Python interface ' +
  'to Tcl/Tk", Python 3 Documentation, https://docs.python.org/3/library/', { after: 140 }));

c.push(new Paragraph({ children: [new PageBreak()] }));

// ================================ PHỤ LỤC ==================================
c.push(H1('PHỤ LỤC A. HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG'));
c.push(H2('A.1. Yêu cầu hệ thống'));
c.push(P('Python 3.9 trở lên. Ứng dụng chỉ dùng thư viện chuẩn, không cần cài gói phụ thuộc. Trên Linux, ' +
  'nếu thiếu Tkinter thì cài bằng lệnh sudo apt install python3-tk; trên Windows và macOS, Tkinter đã ' +
  'có sẵn trong bản Python tải từ python.org.'));
c.push(H2('A.2. Chạy ứng dụng'));
c.push(Code([
  'git clone https://github.com/<tai-khoan>/pathfinding-visualizer.git',
  'cd pathfinding-visualizer',
  '',
  '# Mo giao dien do hoa',
  'python main.py',
  '',
  '# Che do dong lenh — do thi bai tap S -> G',
  'python main.py --cli --mode graph',
  '',
  '# Mot ban do luoi cu the',
  'python main.py --cli --mode grid --rows 30 --cols 30 --density 0.25 --seed 7',
  '',
  '# Thuc nghiem tren nhieu ban do ngau nhien',
  'python main.py --cli --mode benchmark --trials 50 --rows 40 --cols 40',
  '',
  '# Chay kiem thu',
  'python -m unittest discover -s tests -t . -v',
]));
c.push(H2('A.3. Thao tác trên giao diện'));
c.push(table(
  ['Thao tác', 'Tác dụng'],
  [
    ['Chuột trái', 'Vẽ theo công cụ đang chọn (tường / địa hình / điểm đầu / điểm đích)'],
    ['Giữ và kéo chuột trái', 'Vẽ liên tục nhiều ô'],
    ['Chuột phải', 'Xoá ô về trạng thái trống'],
    ['Nút ▶ Chạy thuật toán', 'Chạy thuật toán đang chọn kèm mô phỏng từng bước'],
    ['Nút ⇄ So sánh tất cả', 'Chạy cả năm thuật toán và hiện bảng số liệu'],
    ['Nút 🎲 / 🧱', 'Sinh vật cản ngẫu nhiên / sinh mê cung'],
  ],
  [3000, 6500],
));
c.push(tcap('Bảng A.1. Các thao tác trên giao diện'));

c.push(new Paragraph({ children: [new PageBreak()] }));
c.push(H1('PHỤ LỤC B. ĐƯA MÃ NGUỒN LÊN GITHUB'));
c.push(P('Các lệnh nhóm đã dùng để tạo repository và đẩy mã nguồn:'));
c.push(Code([
  'cd pathfinding-visualizer',
  'git init',
  'git add .',
  'git commit -m "Ung dung mo phong cac thuat toan tim kiem BFS/DFS/UCS/Greedy/A*"',
  'git branch -M main',
  'git remote add origin https://github.com/<tai-khoan>/pathfinding-visualizer.git',
  'git push -u origin main',
]));
c.push(P('Sau khi đẩy xong, điền đường dẫn repository vào trang "Danh sách thành viên và phân công nhiệm ' +
  'vụ" ở đầu báo cáo và vào ô nộp bài. Lưu ý đặt repository ở chế độ Public để giảng viên truy cập được.'));

// =============================== TÀI LIỆU ==================================
const doc = new Document({
  creator: 'Nhom bai tap mon Tri tue nhan tao',
  title: 'Bao cao - Ung dung mo phong cac thuat toan tim kiem trong khong gian trang thai',
  description: 'Bai tap nhom mon Tri tue nhan tao',
  styles: {
    default: {
      document: { run: { font: 'Times New Roman', size: 24 } },
      heading1: { run: { font: 'Times New Roman' } },
      heading2: { run: { font: 'Times New Roman' } },
      heading3: { run: { font: 'Times New Roman' } },
    },
  },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.32), hanging: convertInchesToTwip(0.2) } } } },
        { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.62), hanging: convertInchesToTwip(0.2) } } } },
      ],
    }],
  },
  features: { updateFields: true },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, bottom: 1134, left: 1304, right: 964 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })],
        })],
      }),
    },
    children: c,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(path.join(__dirname, 'BaoCao_BTN_TriTueNhanTao.docx'), b);
  console.log('Da tao bao cao.');
});
