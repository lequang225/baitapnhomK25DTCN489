const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require('/mnt/skills/public/pptx/scripts/apply_theme.js');

const FIG = path.join(__dirname, 'figures');
const OUT = path.join(__dirname, 'Slide_BTN_TriTueNhanTao.pptx');

const THEME = {
  name: 'Ocean Pathfinding',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '16203F',   // midnight - nền tối
    lt1: 'FFFFFF',
    dk2: '065A82',   // deep blue - màu chủ đạo
    lt2: 'EEF3F7',   // nền sáng phụ
    accent1: '065A82',
    accent2: '1C7293',
    accent3: '21295C',
    accent4: 'E8A33D',
    accent5: '9FB8C8',
    accent6: 'C94F4F',
    hlink: '1C7293',
    folHlink: '9FB8C8',
  },
};

const NAVY = '16203F';
const DEEP = '065A82';
const TEAL = '1C7293';
const GOLD = 'E8A33D';
const RED = 'C94F4F';
const MUTED = '6B7C8C';
const LIGHT = 'EEF3F7';
const WHITE = 'FFFFFF';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';            // 13.3 x 7.5 inch
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = 'Nhom bai tap mon Tri tue nhan tao';
pres.title = 'Ung dung mo phong cac thuat toan tim kiem trong khong gian trang thai';

// ----------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: 'TITLE_DARK',
  background: { color: NAVY },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.9, y: 1.85, w: 11.5, h: 2.4,
        fontSize: 34, bold: true, color: WHITE, align: 'center', valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 1.6, y: 4.55, w: 10.1, h: 1.7,
        fontSize: 16, color: '9FB8C8', align: 'center', valign: 'top' }, text: '' } },
  ],
});

pres.defineSlideMaster({
  title: 'SECTION',
  background: { color: DEEP },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 1.1, y: 2.85, w: 11.1, h: 1.2,
        fontSize: 36, bold: true, color: WHITE, align: 'left', valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 1.1, y: 4.1, w: 11.1, h: 1.0,
        fontSize: 16, color: 'CFE1EC', align: 'left', valign: 'top' }, text: '' } },
  ],
});

pres.defineSlideMaster({
  title: 'CONTENT',
  background: { color: WHITE },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.62, y: 0.42, w: 12.1, h: 0.78,
        fontSize: 32, bold: true, color: NAVY, align: 'left', valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.62, y: 1.32, w: 12.1, h: 5.4,
        fontSize: 16, color: '32414F', align: 'left', valign: 'top' }, text: '' } },
    { text: { text: 'Trí tuệ nhân tạo — Thuật toán tìm kiếm trong không gian trạng thái',
        options: { x: 0.62, y: 6.92, w: 9.0, h: 0.32, fontSize: 10, color: MUTED, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: 12.3, y: 6.92, w: 0.5, h: 0.32, fontSize: 10, color: MUTED, align: 'right' },
});

pres.defineSlideMaster({
  title: 'CONTENT_TINT',
  background: { color: LIGHT },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.62, y: 0.42, w: 12.1, h: 0.78,
        fontSize: 32, bold: true, color: NAVY, align: 'left', valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: 0.62, y: 1.32, w: 12.1, h: 5.4,
        fontSize: 16, color: '32414F', align: 'left', valign: 'top' }, text: '' } },
    { text: { text: 'Trí tuệ nhân tạo — Thuật toán tìm kiếm trong không gian trạng thái',
        options: { x: 0.62, y: 6.92, w: 9.0, h: 0.32, fontSize: 10, color: MUTED, isTextBox: true, margin: 0 } } },
  ],
  slideNumber: { x: 12.3, y: 6.92, w: 0.5, h: 0.32, fontSize: 10, color: MUTED, align: 'right' },
});

const C = pres.SchemeColor;

// tiện ích: thẻ nội dung bo góc
function card(slide, { x, y, w, h, fill, name }) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1, fill: { color: fill },
    line: { color: fill }, objectName: name,
    shadow: { type: 'outer', color: '16203F', blur: 10, offset: 2, angle: 90, opacity: 0.12 },
  });
}

function badge(slide, { x, y, d = 0.52, fill, text, color = WHITE, name }) {
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name,
  });
  slide.addText(text, {
    x, y, w: d, h: d, fontSize: 15, bold: true, color, align: 'center', valign: 'middle',
    isTextBox: true, margin: 0,
  });
}

// =========================================================== 1. TITLE
pres.addSection({ title: 'Mở đầu' });
let s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Mở đầu' });
s.addText('ỨNG DỤNG MÔ PHỎNG VÀ SO SÁNH\nCÁC THUẬT TOÁN TÌM KIẾM\nTRONG KHÔNG GIAN TRẠNG THÁI',
  { placeholder: 'title' });
s.addText([
  { text: 'Bài tập nhóm — Môn Trí tuệ nhân tạo', options: { breakLine: true, bold: true, color: WHITE } },
  { text: 'BFS  ·  DFS  ·  UCS  ·  Greedy Best-First  ·  A*', options: { breakLine: true, color: GOLD } },
  { text: 'Tháng 10 năm 2026', options: {} },
], { placeholder: 'body' });
s.addNotes('Chao thay co va cac ban. Nhom chung em thuc hien de tai xay dung ung dung mo phong ' +
  'va so sanh nam thuat toan tim kiem trong khong gian trang thai.');

// =========================================================== 2. AGENDA
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Mở đầu' });
s.addText('Nội dung trình bày', { placeholder: 'title' });
const agenda = [
  ['01', 'Đặt vấn đề', 'Vì sao cần mô phỏng trực quan các thuật toán tìm kiếm', DEEP],
  ['02', 'Cơ sở lý thuyết', 'Không gian trạng thái, năm thuật toán, vai trò của heuristic', TEAL],
  ['03', 'Ứng dụng đã xây dựng', 'Kiến trúc, tính năng, công nghệ sử dụng', DEEP],
  ['04', 'Kết quả thực nghiệm', 'Bốn thực nghiệm, hơn 400 lượt chạy', TEAL],
  ['05', 'Kết luận', 'Ba bài học và hướng phát triển', NAVY],
];
agenda.forEach(([num, title, desc, color], i) => {
  const y = 1.45 + i * 1.04;
  badge(s, { x: 0.68, y: y + 0.12, d: 0.56, fill: color, text: num, name: `agenda-badge-${i}` });
  s.addText(title, { x: 1.46, y: y + 0.04, w: 4.0, h: 0.38, fontSize: 19, bold: true,
    color: NAVY, isTextBox: true, margin: 0, valign: 'middle' });
  s.addText(desc, { x: 1.46, y: y + 0.44, w: 10.6, h: 0.34, fontSize: 14, color: MUTED,
    isTextBox: true, margin: 0, valign: 'middle' });
});
s.addNotes('Bai trinh bay gom nam phan. Em se danh phan lon thoi gian cho phan bon - ket qua thuc nghiem.');

// =========================================================== 3. ĐẶT VẤN ĐỀ
s = pres.addSlide({ masterName: 'CONTENT_TINT', sectionTitle: 'Mở đầu' });
s.addText('Đặt vấn đề', { placeholder: 'title' });
s.addText([
  { text: 'Rất nhiều bài toán thực tế đều quy về tìm một đường đi trong không gian trạng thái: ' +
          'dẫn đường GPS, điều hướng robot, tìm đường cho nhân vật trong game, định tuyến gói tin.',
    options: { breakLine: true, paraSpaceAfter: 12 } },
  { text: 'Giáo trình trình bày các thuật toán bằng mã giả và vài ví dụ nhỏ làm bằng tay — ' +
          'đủ để hiểu cơ chế, nhưng khó thấy được sự khác biệt về hiệu quả.',
    options: { breakLine: true, paraSpaceAfter: 12 } },
  { text: 'Ba câu hỏi đặt ra:', options: { breakLine: true, bold: true, color: NAVY, paraSpaceAfter: 6 } },
  { text: 'Vì sao A* được dùng phổ biến trong khi UCS cho cùng kết quả tối ưu?',
    options: { bullet: true, breakLine: true, paraSpaceAfter: 4 } },
  { text: 'Vì sao tìm kiếm tham lam chạy rất nhanh nhưng không được tin cậy?',
    options: { bullet: true, breakLine: true, paraSpaceAfter: 4 } },
  { text: 'Heuristic thực sự giúp được bao nhiêu, và đổi lại phải trả giá gì?',
    options: { bullet: true } },
], { x: 0.62, y: 1.4, w: 7.1, h: 4.6, fontSize: 15, color: '32414F', isTextBox: true, valign: 'top' });

card(s, { x: 8.15, y: 1.5, w: 4.55, h: 2.05, fill: DEEP, name: 'stat-1' });
s.addText('73%', { x: 8.15, y: 1.62, w: 4.55, h: 1.0, fontSize: 54, bold: true, color: WHITE,
  align: 'center', isTextBox: true, margin: 0 });
s.addText('số nút A* tiết kiệm được so với UCS\nmà lời giải vẫn tối ưu y hệt',
  { x: 8.3, y: 2.62, w: 4.25, h: 0.8, fontSize: 13, color: 'CFE1EC', align: 'center',
    isTextBox: true, margin: 0 });

card(s, { x: 8.15, y: 3.78, w: 4.55, h: 2.05, fill: WHITE, name: 'stat-2' });
s.addText('+45%', { x: 8.15, y: 3.9, w: 4.55, h: 1.0, fontSize: 54, bold: true, color: RED,
  align: 'center', isTextBox: true, margin: 0 });
s.addText('chi phí đường đi mà tìm kiếm tham lam\nphải trả thêm để đổi lấy tốc độ',
  { x: 8.3, y: 4.9, w: 4.25, h: 0.8, fontSize: 13, color: MUTED, align: 'center',
    isTextBox: true, margin: 0 });
s.addText('Hai con số này là kết quả thực nghiệm của nhóm — sẽ chứng minh ở phần 4',
  { x: 8.15, y: 6.0, w: 4.55, h: 0.4, fontSize: 11, italic: true, color: MUTED,
    align: 'center', isTextBox: true, margin: 0 });
s.addNotes('Hai con so ben phai la ket qua thuc nghiem cua nhom, se duoc chung minh o phan bon.');

// =========================================================== 4. KHÔNG GIAN TRẠNG THÁI
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Mở đầu' });
s.addText('Bài toán tìm kiếm trong không gian trạng thái', { placeholder: 'title' });
s.addText('Mọi thuật toán trong ứng dụng đều thao tác trên đúng ba cấu trúc dữ liệu — ' +
  'và chính cấu trúc của frontier quyết định thuật toán đó là gì.',
  { x: 0.62, y: 1.3, w: 12.1, h: 0.5, fontSize: 15, color: '32414F', isTextBox: true, margin: 0 });

const structs = [
  ['Frontier (biên)', 'Tập các nút đã sinh ra nhưng chưa mở rộng.\n\nFIFO → BFS\nLIFO → DFS\nHàng đợi ưu tiên → UCS, Greedy, A*', DEEP, WHITE, 'CFE1EC'],
  ['Explored (đã duyệt)', 'Tập các nút đã mở rộng.\n\nDùng để tránh lặp vô hạn trên đồ thị có chu trình, và để không mở rộng lại một nút hai lần.', WHITE, NAVY, '32414F'],
  ['Parent (bảng cha)', 'Lưu nút cha của mỗi nút.\n\nKhi tìm thấy đích, truy vết ngược theo bảng này để dựng lại đường đi hoàn chỉnh.', WHITE, NAVY, '32414F'],
];
structs.forEach(([title, body, fill, tcolor, bcolor], i) => {
  const x = 0.62 + i * 4.08;
  card(s, { x, y: 2.0, w: 3.78, h: 3.6, fill, name: `struct-${i}` });
  s.addText(title, { x: x + 0.28, y: 2.26, w: 3.22, h: 0.5, fontSize: 18, bold: true,
    color: tcolor, isTextBox: true, margin: 0 });
  s.addText(body, { x: x + 0.28, y: 2.82, w: 3.22, h: 2.5, fontSize: 13.5, color: bcolor,
    isTextBox: true, margin: 0, valign: 'top', lineSpacingMultiple: 1.1 });
});
s.addText('Hệ quả thiết kế: năm thuật toán trong mã nguồn gần như giống hệt nhau, chỉ khác khoá sắp xếp frontier.',
  { x: 0.62, y: 5.85, w: 12.1, h: 0.45, fontSize: 14, italic: true, bold: true, color: DEEP,
    isTextBox: true, margin: 0 });
s.addNotes('Day la y quan trong nhat ve mat cai dat: frontier quyet dinh hanh vi thuat toan.');

// =========================================================== 5. SECTION 2
pres.addSection({ title: 'Cơ sở lý thuyết' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: 'Cơ sở lý thuyết' });
s.addText('02  ·  Năm thuật toán tìm kiếm', { placeholder: 'title' });
s.addText('Hai nhóm: tìm kiếm mù (không dùng thông tin về đích) và tìm kiếm có thông tin (dùng heuristic)',
  { placeholder: 'body' });

// =========================================================== 6. TÌM KIẾM MÙ
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Cơ sở lý thuyết' });
s.addText('Nhóm 1 — Tìm kiếm mù (uninformed search)', { placeholder: 'title' });
const blind = [
  ['BFS', 'Hàng đợi FIFO', [
    'Mở rộng hết độ sâu d rồi mới sang d + 1',
    'Tối ưu về SỐ BƯỚC, không phải về CHI PHÍ',
    'Tốn bộ nhớ: O(b^d)',
  ], TEAL],
  ['DFS', 'Ngăn xếp LIFO', [
    'Đi sâu tối đa một nhánh rồi mới quay lui',
    'Rất tiết kiệm bộ nhớ: O(b·m)',
    'Không tối ưu — đường đi thường rất dài',
  ], MUTED],
  ['UCS', 'Hàng đợi ưu tiên theo g(n)', [
    'Luôn mở rộng nút có chi phí tích luỹ nhỏ nhất',
    'ĐẦY ĐỦ và TỐI ƯU với mọi chi phí dương',
    'Chính là thuật toán Dijkstra',
  ], DEEP],
];
blind.forEach(([name, frontier, points, color], i) => {
  const x = 0.62 + i * 4.08;
  card(s, { x, y: 1.42, w: 3.78, h: 4.3, fill: WHITE, name: `blind-${i}` });
  badge(s, { x: x + 0.28, y: 1.68, d: 0.5, fill: color, text: String(i + 1), name: `blind-badge-${i}` });
  s.addText(name, { x: x + 0.92, y: 1.66, w: 2.6, h: 0.52, fontSize: 24, bold: true,
    color, isTextBox: true, margin: 0, valign: 'middle' });
  s.addText(frontier, { x: x + 0.28, y: 2.3, w: 3.22, h: 0.5, fontSize: 13, italic: true,
    color: MUTED, isTextBox: true, margin: 0 });
  s.addText(points.map((t, j) => ({
    text: t, options: { bullet: true, breakLine: j < points.length - 1, paraSpaceAfter: 8 },
  })), { x: x + 0.28, y: 2.88, w: 3.22, h: 2.6, fontSize: 13.5, color: '32414F', isTextBox: true, valign: 'top' });
});
s.addText('Điểm chung: cả ba đều không biết gì về vị trí của đích, nên phải lan toả theo mọi hướng.',
  { x: 0.62, y: 5.92, w: 12.1, h: 0.45, fontSize: 14, italic: true, color: MUTED,
    isTextBox: true, margin: 0 });

// =========================================================== 7. TÌM KIẾM CÓ THÔNG TIN
s = pres.addSlide({ masterName: 'CONTENT_TINT', sectionTitle: 'Cơ sở lý thuyết' });
s.addText('Nhóm 2 — Tìm kiếm có thông tin (informed search)', { placeholder: 'title' });

card(s, { x: 0.62, y: 1.4, w: 6.0, h: 2.0, fill: WHITE, name: 'greedy-card' });
s.addText('Greedy Best-First Search', { x: 0.95, y: 1.6, w: 5.4, h: 0.45, fontSize: 20,
  bold: true, color: GOLD, isTextBox: true, margin: 0 });
s.addText('Sắp xếp frontier chỉ theo h(n) — bỏ qua hoàn toàn chi phí đã đi g(n). ' +
  'Luôn lao về phía có vẻ gần đích nhất.',
  { x: 0.95, y: 2.1, w: 5.4, h: 0.8, fontSize: 14, color: '32414F', isTextBox: true, margin: 0 });
s.addText('→ Rất nhanh, nhưng KHÔNG tối ưu', { x: 0.95, y: 2.88, w: 5.4, h: 0.38, fontSize: 14,
  bold: true, color: RED, isTextBox: true, margin: 0 });

card(s, { x: 6.9, y: 1.4, w: 5.8, h: 2.0, fill: DEEP, name: 'astar-card' });
s.addText('A* Search', { x: 7.23, y: 1.6, w: 5.2, h: 0.45, fontSize: 20, bold: true,
  color: WHITE, isTextBox: true, margin: 0 });
s.addText('Kết hợp cả hai nguồn thông tin: chi phí thực tế đã đi cộng với chi phí ước lượng còn lại.',
  { x: 7.23, y: 2.1, w: 5.2, h: 0.8, fontSize: 14, color: 'CFE1EC', isTextBox: true, margin: 0 });
s.addText('→ Tối ưu khi h chấp nhận được', { x: 7.23, y: 2.88, w: 5.2, h: 0.38, fontSize: 14,
  bold: true, color: GOLD, isTextBox: true, margin: 0 });

card(s, { x: 0.62, y: 3.62, w: 12.08, h: 1.12, fill: NAVY, name: 'formula-card' });
s.addText([
  { text: 'f(n) = ', options: { color: WHITE } },
  { text: 'g(n)', options: { color: GOLD } },
  { text: ' + ', options: { color: WHITE } },
  { text: 'h(n)', options: { color: '7FC4E8' } },
], { x: 0.62, y: 3.72, w: 12.08, h: 0.58, fontSize: 32, bold: true, align: 'center',
  isTextBox: true, margin: 0 });
s.addText([
  { text: 'g(n) = chi phí thực tế đã đi từ điểm xuất phát tới n', options: { color: GOLD } },
  { text: '          |          ', options: { color: '4A5A78' } },
  { text: 'h(n) = chi phí ƯỚC LƯỢNG còn lại từ n tới đích', options: { color: '7FC4E8' } },
], { x: 0.62, y: 4.3, w: 12.08, h: 0.36, fontSize: 13, align: 'center', isTextBox: true, margin: 0 });

s.addText('Hai điều kiện của heuristic', { x: 0.62, y: 4.98, w: 5.9, h: 0.4, fontSize: 17,
  bold: true, color: NAVY, isTextBox: true, margin: 0 });
s.addText([
  { text: 'Chấp nhận được (admissible): h(n) ≤ h*(n) — không bao giờ đánh giá quá cao. ' +
          'Điều kiện để A* tối ưu.', options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'Nhất quán (consistent): h(n) ≤ c(n, n′) + h(n′) — bảo đảm mỗi nút chỉ cần mở rộng một lần.',
    options: { bullet: true } },
], { x: 0.62, y: 5.4, w: 5.9, h: 1.3, fontSize: 13.5, color: '32414F', isTextBox: true, valign: 'top' });

s.addText('Hai trường hợp suy biến', { x: 6.9, y: 4.98, w: 5.8, h: 0.4, fontSize: 17,
  bold: true, color: NAVY, isTextBox: true, margin: 0 });
s.addText([
  { text: 'Khi h(n) = 0 với mọi n  →  A* trở thành đúng UCS',
    options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'Khi bỏ g(n) đi  →  A* trở thành tìm kiếm tham lam',
    options: { bullet: true } },
], { x: 6.9, y: 5.4, w: 5.8, h: 1.3, fontSize: 13.5, color: '32414F', isTextBox: true, valign: 'top' });
s.addNotes('A* nam chinh giua hai thai cuc UCS va Greedy. Ung dung cho phep chon heuristic zero ' +
  'de nguoi hoc quan sat truc tiep su suy bien nay.');

// =========================================================== 8. SECTION 3
pres.addSection({ title: 'Ứng dụng' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: 'Ứng dụng' });
s.addText('03  ·  Ứng dụng đã xây dựng', { placeholder: 'title' });
s.addText('Python 3 + Tkinter — chỉ dùng thư viện chuẩn, không cần cài gói phụ thuộc nào',
  { placeholder: 'body' });

// =========================================================== 9. KIẾN TRÚC
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Ứng dụng' });
s.addText('Kiến trúc và quyết định thiết kế cốt lõi', { placeholder: 'title' });

s.addText('Mọi bài toán chỉ cần cung cấp đúng bốn thành phần:',
  { x: 0.62, y: 1.3, w: 6.1, h: 0.4, fontSize: 15, bold: true, color: NAVY, isTextBox: true, margin: 0 });
card(s, { x: 0.62, y: 1.78, w: 6.1, h: 1.95, fill: NAVY, name: 'iface-card' });
s.addText('class Problem:\n    start                  # trạng thái bắt đầu\n' +
  '    def is_goal(self, s)   # -> bool\n    def neighbors(self, s) # -> [(kế, chi_phí)]\n' +
  '    def heuristic(self, s) # -> float',
  { x: 0.92, y: 1.95, w: 5.6, h: 1.62, fontSize: 12.5, color: 'CFE1EC', fontFace: 'Courier New',
    isTextBox: true, margin: 0 });
s.addText('Năm thuật toán chỉ dựa trên bốn thành phần này nên hoàn toàn không biết mình đang giải ' +
  'lưới ô vuông hay đồ thị thành phố. Muốn thêm bài toán mới (8-puzzle, Tháp Hà Nội) chỉ cần viết ' +
  'thêm một lớp — không sửa một dòng nào trong algorithms.py.',
  { x: 0.62, y: 3.85, w: 6.1, h: 1.3, fontSize: 13.5, color: '32414F', isTextBox: true, margin: 0 });

s.addText('Tính năng chính', { x: 7.1, y: 1.3, w: 5.6, h: 0.4, fontSize: 15, bold: true,
  color: NAVY, isTextBox: true, margin: 0 });
const feats = [
  'Hai không gian trạng thái: lưới ô vuông và đồ thị thành phố có trọng số',
  'Vẽ tường, địa hình tốn chi phí, đặt điểm đầu/đích bằng chuột',
  'Sinh vật cản ngẫu nhiên và sinh mê cung tự động',
  'Mô phỏng từng bước mở rộng nút, tốc độ điều chỉnh được',
  'So sánh cả năm thuật toán trên cùng một bản đồ',
  'Năm hàm heuristic: Manhattan, Euclid, Chebyshev, Octile, Zero',
  'Kiểm tra tính chấp nhận được của heuristic bằng Dijkstra ngược',
  'Chế độ dòng lệnh để chạy thực nghiệm hàng loạt',
];
s.addText(feats.map((t, i) => ({
  text: t, options: { bullet: true, breakLine: i < feats.length - 1, paraSpaceAfter: 7 },
})), { x: 7.1, y: 1.78, w: 5.6, h: 4.3, fontSize: 13.5, color: '32414F', isTextBox: true, valign: 'top' });

card(s, { x: 0.62, y: 5.3, w: 6.1, h: 1.02, fill: LIGHT, name: 'test-card' });
s.addText('15 / 15', { x: 0.88, y: 5.42, w: 1.5, h: 0.78, fontSize: 28, bold: true, color: DEEP,
  align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
s.addText('test case tự động đều đạt\n(unittest, chạy bằng một lệnh)',
  { x: 2.42, y: 5.46, w: 4.1, h: 0.72, fontSize: 12.5, color: '32414F', valign: 'middle',
    isTextBox: true, margin: 0 });

// =========================================================== 10. SECTION 4
pres.addSection({ title: 'Thực nghiệm' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: 'Thực nghiệm' });
s.addText('04  ·  Kết quả thực nghiệm', { placeholder: 'title' });
s.addText('Bốn thực nghiệm, hơn 400 lượt chạy — mọi nhận định lý thuyết đều có số liệu kèm theo',
  { placeholder: 'body' });

// =========================================================== 11. TN1
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Thực nghiệm' });
s.addText('Thực nghiệm 1 — Đối chiếu với lời giải làm bằng tay', { placeholder: 'title' });
s.addImage({ path: path.join(FIG, 'fig2_graph.png'), x: 0.62, y: 1.35, w: 6.1, h: 3.8 });
s.addText('Đồ thị bài tập trên lớp: 11 đỉnh, 14 cạnh, có sẵn bảng heuristic. Tìm đường S → G.',
  { x: 0.62, y: 5.22, w: 6.1, h: 0.5, fontSize: 12, italic: true, color: MUTED,
    isTextBox: true, margin: 0 });

s.addTable([
  [{ text: 'Thuật toán', options: { bold: true, color: WHITE, fill: { color: DEEP } } },
   { text: 'Đường đi', options: { bold: true, color: WHITE, fill: { color: DEEP } } },
   { text: 'Chi phí', options: { bold: true, color: WHITE, fill: { color: DEEP }, align: 'center' } },
   { text: 'Mở rộng', options: { bold: true, color: WHITE, fill: { color: DEEP }, align: 'center' } }],
  ['BFS', 'S → E → G', { text: '154', options: { align: 'center' } }, { text: '8', options: { align: 'center' } }],
  ['DFS', 'S → A → D → E → G', { text: '227', options: { align: 'center' } }, { text: '5', options: { align: 'center' } }],
  [{ text: 'UCS', options: { bold: true } }, { text: 'S → B → F → G', options: { bold: true } },
   { text: '137', options: { align: 'center', bold: true, color: DEEP } }, { text: '8', options: { align: 'center' } }],
  ['Greedy', 'S → E → G', { text: '154', options: { align: 'center' } }, { text: '3', options: { align: 'center' } }],
  [{ text: 'A*', options: { bold: true } }, { text: 'S → B → F → G', options: { bold: true } },
   { text: '137', options: { align: 'center', bold: true, color: DEEP } },
   { text: '4', options: { align: 'center', bold: true, color: DEEP } }],
], {
  x: 7.1, y: 1.42, w: 5.6, colW: [1.35, 2.2, 1.0, 1.05], rowH: 0.42,
  fontSize: 12.5, color: '32414F', border: { type: 'solid', color: 'C9D4E4', pt: 0.5 },
  valign: 'middle', fill: { color: WHITE },
});
s.addText([
  { text: 'Kết quả trùng khớp hoàn toàn với lời giải giải tay.',
    options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'A* chỉ mở rộng 4 nút thay vì 8 của UCS mà vẫn cho cùng chi phí tối ưu 137.',
    options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: 'Greedy nhanh nhất (3 nút) nhưng đắt hơn 12,4% — vì chọn E do h(E) = 72 nhỏ nhất, ' +
          'mà không biết cạnh E–G về sau rất đắt.', options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: 'BFS cho đường ít bước nhất nhưng không rẻ nhất.', options: { bullet: true } },
], { x: 7.1, y: 4.3, w: 5.6, h: 2.3, fontSize: 12.5, color: '32414F', isTextBox: true, valign: 'top' });

// =========================================================== 12. TN2
s = pres.addSlide({ masterName: 'CONTENT_TINT', sectionTitle: 'Thực nghiệm' });
s.addText('Thực nghiệm 2 — Vùng không gian trạng thái phải duyệt', { placeholder: 'title' });
s.addImage({ path: path.join(FIG, 'fig1_grid_compare.png'), x: 0.7, y: 1.3, w: 11.94, h: 4.66 });
s.addText([
  { text: 'UCS (668 ô) lan toả đều ra mọi hướng  ·  ', options: { color: '32414F' } },
  { text: 'A* (178 ô) tạo hành lang hẹp hướng thẳng về đích, chi phí vẫn đúng bằng UCS  ·  ',
    options: { bold: true, color: DEEP } },
  { text: 'Greedy (64 ô) duyệt ít nhất nhưng đường đi đắt hơn 30%', options: { color: RED } },
], { x: 0.62, y: 6.1, w: 12.1, h: 0.5, fontSize: 13, align: 'center', isTextBox: true, margin: 0 });
s.addNotes('Hinh nay noi len gan nhu toan bo noi dung ly thuyet. A* tiet kiem 73% so nut so voi UCS ' +
  'ma khong mat gi ve chat luong loi giai.');

// =========================================================== 13. TN3 - chart
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Thực nghiệm' });
s.addText('Thực nghiệm 3 — Thống kê trên 50 bản đồ ngẫu nhiên', { placeholder: 'title' });
s.addText('Lưới 40×40, mật độ vật cản 25%, 50 bản đồ sinh ngẫu nhiên — giá trị là trung bình.',
  { x: 0.62, y: 1.26, w: 12.1, h: 0.4, fontSize: 13.5, color: MUTED, isTextBox: true, margin: 0 });

const algos = ['BFS', 'DFS', 'UCS', 'Greedy', 'A*'];
s.addChart(pres.ChartType.bar, [{
  name: 'Chi phí đường đi trung bình',
  labels: algos,
  values: [102.86, 304.06, 82.23, 119.49, 82.23],
}], {
  x: 0.62, y: 1.78, w: 5.95, h: 3.9, barDir: 'bar',
  showTitle: true, title: 'Chi phí đường đi trung bình (càng thấp càng tốt)',
  titleFontSize: 13, titleColor: NAVY, titleFontFace: '+mn-lt',
  chartColors: [DEEP], showLegend: false,
  showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 11,
  dataLabelColor: '32414F', dataLabelFontFace: '+mn-lt',
  catAxisLabelColor: '32414F', catAxisLabelFontSize: 12, catAxisLabelFontFace: '+mn-lt',
  valAxisLabelColor: MUTED, valAxisLabelFontSize: 10, valAxisLabelFontFace: '+mn-lt',
  valGridLine: { color: 'E1E6EC', size: 0.5 }, catGridLine: { style: 'none' },
  valAxisMinVal: 0, valAxisMaxVal: 360, barGapWidthPct: 60,
});

s.addChart(pres.ChartType.bar, [{
  name: 'Số nút mở rộng trung bình',
  labels: algos,
  values: [1191.7, 295.1, 1190.5, 109.1, 501.5],
}], {
  x: 6.75, y: 1.78, w: 5.95, h: 3.9, barDir: 'bar',
  showTitle: true, title: 'Số nút phải mở rộng trung bình (càng thấp càng nhanh)',
  titleFontSize: 13, titleColor: NAVY, titleFontFace: '+mn-lt',
  chartColors: [TEAL], showLegend: false,
  showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 11,
  dataLabelColor: '32414F', dataLabelFontFace: '+mn-lt',
  catAxisLabelColor: '32414F', catAxisLabelFontSize: 12, catAxisLabelFontFace: '+mn-lt',
  valAxisLabelColor: MUTED, valAxisLabelFontSize: 10, valAxisLabelFontFace: '+mn-lt',
  valGridLine: { color: 'E1E6EC', size: 0.5 }, catGridLine: { style: 'none' },
  valAxisMinVal: 0, valAxisMaxVal: 1400, barGapWidthPct: 60,
});

card(s, { x: 0.62, y: 5.82, w: 12.08, h: 0.78, fill: NAVY, name: 'tn3-note' });
s.addText([
  { text: 'A* và UCS cho chi phí giống hệt nhau đến từng chữ số thập phân (82,23)', options: { color: GOLD, bold: true } },
  { text: '  —  nhưng A* chỉ mở rộng 42,1% số nút và chạy nhanh hơn gấp đôi.', options: { color: 'CFE1EC' } },
], { x: 0.62, y: 5.94, w: 12.08, h: 0.54, fontSize: 14, align: 'center', valign: 'middle',
  isTextBox: true, margin: 0 });

// =========================================================== 14. TN4
s = pres.addSlide({ masterName: 'CONTENT_TINT', sectionTitle: 'Thực nghiệm' });
s.addText('Thực nghiệm 4 — Ưu thế của A* có luôn giữ vững không?', { placeholder: 'title' });
s.addImage({ path: path.join(FIG, 'fig4_density.png'), x: 1.55, y: 1.3, w: 8.0, h: 3.73 });
s.addText([
  { text: 'Ba quan sát', options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 10 } },
  { text: 'BFS và UCS gần như trùng khít — cả hai đều phải duyệt toàn bộ vùng khả thi.',
    options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'Khoảng cách A* — UCS lớn nhất ở bản đồ thoáng và thu hẹp dần khi vật cản dày: ' +
          'vật cản càng nhiều thì heuristic đường chim bay càng sai lệch.',
    options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
  { text: 'DFS và Greedy lại tăng số nút theo mật độ vì thường lao vào ngõ cụt rồi quay lui.',
    options: { bullet: true } },
], { x: 9.75, y: 1.4, w: 3.0, h: 3.7, fontSize: 12.5, color: '32414F', isTextBox: true, valign: 'top' });
s.addText('Kết luận: hiệu quả của A* không phải hằng số — nó phụ thuộc vào chất lượng của heuristic ' +
  'trong từng bài toán cụ thể. Heuristic càng sát chi phí thực tế, A* càng gần đường đi thẳng tới đích.',
  { x: 0.62, y: 5.3, w: 12.1, h: 0.8, fontSize: 14, color: '32414F', isTextBox: true, margin: 0 });

// =========================================================== 15. KẾT LUẬN
pres.addSection({ title: 'Kết luận' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'Kết luận' });
s.addText('Ba bài học rút ra', { placeholder: 'title' });
const lessons = [
  ['01', 'Frontier quyết định tất cả',
   'Năm thuật toán có mã nguồn gần như giống hệt nhau, chỉ khác khoá sắp xếp frontier — ' +
   'nhưng cho ra năm hành vi hoàn toàn khác biệt.', DEEP],
  ['02', 'Heuristic không đổi lời giải, chỉ đổi công sức',
   'UCS và A* luôn cho cùng chi phí tối ưu, nhưng A* đạt được điều đó với chưa tới một nửa số nút. ' +
   'Điều kiện là heuristic phải chấp nhận được.', TEAL],
  ['03', 'Luôn có đánh đổi giữa tốc độ và chất lượng',
   'Greedy nhanh gấp sáu lần A* nhưng đường đi đắt hơn 45%. Không có thuật toán nào tốt nhất tuyệt đối — ' +
   'lựa chọn phụ thuộc vào điều bài toán coi trọng.', NAVY],
];
lessons.forEach(([num, title, body, color], i) => {
  const y = 1.45 + i * 1.72;
  card(s, { x: 0.62, y, w: 12.08, h: 1.5, fill: i === 1 ? LIGHT : WHITE, name: `lesson-${i}` });
  badge(s, { x: 0.95, y: y + 0.48, d: 0.56, fill: color, text: num, name: `lesson-badge-${i}` });
  s.addText(title, { x: 1.78, y: y + 0.25, w: 10.4, h: 0.45, fontSize: 19, bold: true,
    color: NAVY, isTextBox: true, margin: 0, valign: 'middle' });
  s.addText(body, { x: 1.78, y: y + 0.72, w: 10.4, h: 0.6, fontSize: 13.5, color: '32414F',
    isTextBox: true, margin: 0 });
});
s.addText('Hướng phát triển: IDA*, Bidirectional Search, Jump Point Search  ·  bài toán 8-puzzle và ' +
  'Tháp Hà Nội  ·  D* Lite cho môi trường động  ·  chuyển giao diện sang nền web',
  { x: 0.62, y: 6.5, w: 12.08, h: 0.45, fontSize: 12.5, italic: true, color: MUTED,
    isTextBox: true, margin: 0 });

// =========================================================== 16. DEMO / Q&A
s = pres.addSlide({ masterName: 'TITLE_DARK', sectionTitle: 'Kết luận' });
s.addText('DEMO ỨNG DỤNG\n& THẢO LUẬN', { placeholder: 'title' });
s.addText([
  { text: 'github.com/<tài-khoản>/pathfinding-visualizer', options: { breakLine: true, color: GOLD, bold: true } },
  { text: 'python main.py', options: { breakLine: true, fontFace: 'Courier New', color: 'CFE1EC' } },
  { text: 'Cảm ơn thầy cô và các bạn đã lắng nghe', options: {} },
], { placeholder: 'body' });

// =========================================================== build
(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('Da tao slide:', OUT);
})();
