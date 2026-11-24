// Kale haritası: yukarıdan bakışlı küçük bir piksel büyücü okulu.
// Molada serbestçe gezilir; odak başlayınca karakter kütüphanede bir masaya yürüyüp oturur.
// app.js'teki global durumu (data, mode, running, today, toast) ve scene.js'teki renkleri (Scene.*) kullanır.
const Castle = (() => {
  const T = 16;                // karo boyu (piksel)
  const VW = 213, VH = 160;    // görünen alan (640px genişlikte ~3x piksel ölçeği)
  const MW = 34, MH = 21;      // harita (karo)

  // ---------- Harita ----------
  // Duvarlar: '#' taş  'W' pencere  'P' portre  'i' meşale  'G' sera camı  'S' büyülü tavan
  // Zeminler: '.' taş  ',' ahşap  'r' halı  'g' çimen  'f' çiçek  'p' patika  'D' kapı  'q' zindan  'y' sera
  // Eşyalar (geçilmez): 'B' kitaplık  'd' masa  'T' uzun masa  'H' baş masa  'F' çeşme  't' ağaç
  //   'o' baykuş tüneği  'c' kazan  'J' kavanoz rafı  'L' saksı sırası  'm' çığlık kökü  'v' boşluk (merdiven)
  const grid = Array.from({ length: MH }, () => Array(MW).fill('#'));
  const fill = (x0, y0, x1, y1, ch) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = ch;
  };
  const put = (list, ch) => list.forEach(([x, y]) => (grid[y][x] = ch));

  // Yeni dekor: 'k' sandalye  'u' halı  'K' küre  'Y' şamdan  'V' şömine  'A' zırh  'n' saksı
  //   'x' fıçı  'z' bank  'e' çit  'l' fener
  // Kütüphane (sol üst)
  fill(1, 2, 9, 8, ',');
  fill(1, 2, 3, 2, 'B'); fill(6, 2, 9, 2, 'B'); fill(1, 6, 1, 8, 'B'); fill(9, 6, 9, 8, 'B');
  fill(4, 1, 5, 1, 'V');
  fill(4, 2, 5, 4, 'u');
  put([[2, 4], [3, 4], [6, 4], [7, 4], [2, 7], [3, 7], [6, 7], [7, 7]], 'd');
  put([[2, 5], [3, 5], [6, 5], [7, 5], [2, 8], [3, 8], [6, 8], [7, 8]], 'k');
  put([[5, 6]], 'K'); put([[9, 4]], 'Y'); put([[1, 4]], 'n');
  put([[2, 1], [8, 1]], 'W');
  // Büyük Salon ve büyülü tavanı (orta üst)
  fill(11, 0, 23, 1, 'S');
  fill(11, 2, 23, 8, '.');
  fill(16, 3, 18, 8, 'r');
  fill(14, 2, 20, 2, 'H');
  for (const x of [13, 15, 19, 21]) fill(x, 4, x, 7, 'T');
  put([[12, 2], [22, 2]], 'Y'); put([[11, 8], [23, 8]], 'A');
  put([[13, 8], [15, 8], [19, 8], [21, 8]], 'k');
  // Kule: tepede baykuşhane, ortada hareketli merdivenler (sağ üst)
  fill(25, 2, 32, 3, '.');
  put([[26, 2], [28, 2], [30, 2], [32, 2]], 'o');
  fill(25, 4, 32, 6, 'v');
  fill(25, 7, 32, 8, '.');
  put([[27, 1], [30, 1]], 'W'); put([[32, 8]], 'x'); put([[25, 8]], 'n');
  // Koridor
  fill(1, 10, 32, 11, '.');
  fill(2, 10, 31, 11, 'r');
  put([[1, 10], [32, 10]], 'n');
  fill(4, 9, 5, 9, 'D'); fill(16, 9, 18, 9, 'D'); fill(28, 9, 29, 9, 'D');
  put([[2, 9], [10, 9], [24, 9], [32, 9]], 'i');
  put([[7, 9], [13, 9], [21, 9], [26, 9]], 'P');
  fill(4, 12, 5, 12, 'D'); fill(15, 12, 17, 12, 'p'); fill(27, 12, 28, 12, 'D');
  put([[2, 12], [8, 12], [13, 12], [19, 12], [25, 12], [31, 12]], 'i');
  put([[11, 12], [21, 12]], 'P');
  // İksir zindanı (sol alt)
  fill(1, 13, 8, 19, 'q');
  fill(1, 13, 3, 13, 'J'); fill(6, 13, 8, 13, 'J');
  put([[2, 15], [7, 15], [2, 18], [7, 18]], 'c');
  put([[1, 17], [8, 17], [8, 19]], 'x');
  fill(4, 18, 5, 18, 'd');
  // Avlu (orta alt)
  fill(10, 13, 22, 19, 'g');
  fill(15, 13, 17, 14, 'p');
  fill(14, 15, 19, 18, 'p');
  fill(16, 16, 17, 17, 'F');
  put([[10, 13], [22, 13], [10, 19], [22, 19]], 't');
  put([[12, 13], [20, 13], [11, 17], [21, 17]], 'e');
  put([[13, 16], [20, 16]], 'z');
  put([[14, 14], [18, 14]], 'l');
  put([[11, 15], [21, 15], [13, 19], [19, 19], [16, 19], [12, 18]], 'f');
  // Sera (sağ alt)
  fill(23, 13, 23, 20, 'G'); fill(33, 13, 33, 20, 'G'); fill(23, 20, 33, 20, 'G');
  fill(24, 13, 32, 19, 'y');
  fill(24, 14, 26, 14, 'L'); fill(29, 14, 31, 14, 'L'); fill(24, 17, 26, 17, 'L'); fill(29, 17, 31, 17, 'L');
  put([[24, 19], [26, 19], [30, 19], [32, 19]], 'm');
  put([[32, 14]], 'x'); put([[32, 16]], 'n');

  const SOLID = new Set(['#', 'W', 'P', 'i', 'V', 'G', 'S', 'B', 'd', 'T', 'H', 'F', 't', 'o', 'c', 'J', 'L', 'm', 'K', 'Y', 'A', 'n', 'x', 'z', 'e', 'l']);
  const isWall = ch => ch === '#' || ch === 'W' || ch === 'P' || ch === 'i' || ch === 'V';
  // Eşyanın altındaki zemin, bulunduğu bölgeye göre
  const region = (x, y) => (y >= 13 ? (x <= 8 ? 'q' : x <= 22 ? 'g' : 'y') : y <= 8 && x <= 9 ? ',' : '.');
  const at = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH ? '#' : grid[y][x]);
  const tilesOf = ch => grid.flatMap((row, y) => row.map((c, x) => (c === ch ? [x, y] : null)).filter(Boolean));

  // ---------- Hareketli merdiven ----------
  // 2 karo genişliğinde bir merdiven 6 saniyede bir başka sütuna kayar; üstündeysen seni de taşır.
  const STAIR = { cols: [25, 28, 31], order: [0, 1, 2, 1], step: 1, from: 1, to: 1, k: 1, wait: 6 };
  const stairCol = () => {
    const e = STAIR.k < 0.5 ? 2 * STAIR.k * STAIR.k : 1 - Math.pow(-2 * STAIR.k + 2, 2) / 2;
    return STAIR.cols[STAIR.from] + (STAIR.cols[STAIR.to] - STAIR.cols[STAIR.from]) * e;
  };
  const stairFixed = () => STAIR.k >= 1;
  function walkable(x, y) {
    const ch = at(x, y);
    if (ch === 'v') return stairFixed() && y >= 4 && y <= 6 && (x === STAIR.cols[STAIR.to] || x === STAIR.cols[STAIR.to] + 1);
    return !SOLID.has(ch);
  }

  // Kütüphanedeki çalışma sandalyeleri (masanın hemen altı); Rose hep (7,8)'de oturur
  const SEATS = [[2, 5], [3, 5], [6, 5], [7, 5], [2, 8], [3, 8], [6, 8], [13, 8], [15, 8], [19, 8], [21, 8]];
  const CANDLES = [[12.3, 3.2], [14.2, 5.4], [17, 4], [19.8, 5.6], [22.3, 3.4], [13.8, 7.8], [20.6, 7.9], [16.4, 6.6], [18.4, 2.8]];
  const BANNERS = [[13, 'kizil'], [15, 'zumrut'], [19, 'safir'], [21, 'kehribar']];

  // ---------- Minik yuvarlak karakter sprite'ları (12x12) ----------
  // K kontur  R/r/Q saç (ana/gölge/parlak)  S ten  E göz  B yanak  O cübbe  C/c bina renkleri  w sakal
  const DOWN = [
    '...KKKKKK...', '..KQRRRRRK..', '.KQRRRRRRrK.', '.KRSSSSSSRK.',
    '.KSESSSSESK.', '.KSBSSSSBSK.', '..KSSSSSSK..', '...KKKKKK...',
    '..KOCcCcOK..', '.KSOOCcOOSK.', '..KOOOOOOK..', '...KK..KK...',
  ];
  const UP = [
    '...KKKKKK...', '..KQRRRRRK..', '.KQRRRRRRrK.', '.KRRRRRRRrK.',
    '.KRRRRRRRrK.', '.KrRRRRRRrK.', '..KrRRRRrK..', '...KKKKKK...',
    '..KOOccOOK..', '.KSOOOOOOSK.', '..KOOOOOOK..', '...KK..KK...',
  ];
  const SIDE = [
    '...KKKKKK...', '..KQRRRRRK..', '.KQRRRRRRRK.', '.KRRRRRSSSK.',
    '.KRRRRSSESK.', '.KrRRRSSBSK.', '..KrRRSSSK..', '...KKKKKK...',
    '...KOcCOK...', '..KOOOOSOK..', '..KOOOOOOK..', '...KK.KK....',
  ];
  const FEET_B = { down: { 11: '..KK....KK..' }, up: { 11: '..KK....KK..' }, side: { 11: '..KK...KK...' } };
  // Uzun saç: yüzü çerçeveler ve omuzlara dökülür (sadece ilgili satırları değiştirir)
  const LONG = {
    down: { 4: 'KRSESSSSESRK', 5: 'KRSBSSSSBSRK', 6: 'KRrSSSSSSrRK', 7: 'KRrKKKKKKrRK', 8: 'KRrOCcCcOrRK' },
    up: { 6: '.KrRRRRRRrK.', 7: '.KrRRRRRRrK.', 8: '.KRRRRRRRRK.', 9: '.KSrRRRRrSK.' },
    side: { 6: '.KrRRRSSSK..', 7: '.KrRKKKKK...', 8: '.KrROcCOK...', 9: '.KrOOOOSOK..' },
  };
  const BEARD = {
    down: { 6: '..KwwwwwwK..', 7: '..KwwwwwwK..', 8: '..KOwwwwOK..', 9: '.KSOOwwOOSK.' },
    side: { 6: '..KrRRSwwK..', 7: '...KKwwwK...', 8: '...KOwwOK...' },
  };
  // Şapka ve bere tam ortalı; şapkanın kenarı saçın 2. satırına oturur
  const HAT = ['.....KK.....', '....KHHK....', '...KHHhHK...', '..KCCcCCcK..', 'KKHHHHHHHHKK'];
  const BEANIE = ['.KK......KK.', '.KPK....KPK.', 'KHPHKKKKHPHK', 'KCcCcCcCcCcK'];

  const CAT = ['......K.K', '......KKK', 'K.KKKKKYK', '.KKKKKKKK', '..KKKKKK.', '..K.K.KK.'];
  const CAT_B = '...K.K.K.';
  const GHOST = [
    '..GGGGG..', '.GGGGGGG.', 'GGGGGGGGG', 'GGEGGGEGG', 'GGEGGGEGG',
    'GBGGGGGBG', 'GGGGoGGGG', 'GGGGGGGGG', 'GGGGGGGGG', 'G.GG.GG.G',
  ];
  const TOAD = ['.gg.gg.', 'gEgggEg', 'ggggggg', 'gllllgg', 'g.g.g.g'];
  const OWL = ['.K...K.', 'KbbbbbK', 'KWEbEWK', 'KbbYbbK', 'KblllbK', '.KlllK.', '..YKY..'];
  const OWL_BLINK = { 2: 'KbbbbbK' };

  let ctx, bg, visible = false, t = 0, last = 0;
  const cam = { x: 0, y: 0 };
  const keys = new Set();
  let bubble = null;      // { name, text, until, anchor }
  let mailOwl = null, pendingMail = null;

  function hash(a, b) {
    let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function sprite(c, rows, pal, ox, oy, flip, over) {
    for (let y = 0; y < rows.length; y++) {
      const row = (over && over[y]) || rows[y];
      for (let x = 0; x < row.length; x++) {
        const col = pal[row[flip ? row.length - 1 - x : x]];
        if (col) px(c, ox + x, oy + y, 1, 1, col);
      }
    }
  }
  function disc(c, cx, cy, r, colFn) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const d = dx * dx + dy * dy;
      if (d <= r * r + r) { const col = colFn(d, dx, dy); if (col) px(c, cx + dx, cy + dy, 1, 1, col); }
    }
  }

  // ---------- Statik harita çizimi ----------
  function floorStone(c, X, Y, x, y, base = '#8f857c', line = '#82786f', spot = '#9b9188') {
    px(c, X, Y, T, T, base);
    px(c, X, Y, T, 1, line); px(c, X, Y, 1, T, line);
    px(c, X, Y + 8, T, 1, line);
    px(c, X + (hash(x, y) > 0.5 ? 8 : 4), Y + 1, 1, 7, line);
    px(c, X + 1, Y + 1, 3, 1, spot);
    if (hash(x + 3, y) > 0.7) px(c, X + 3 + Math.floor(hash(x, y + 9) * 9), Y + 10 + Math.floor(hash(y, x) * 4), 2, 1, spot);
  }
  function baseFloor(c, X, Y, x, y) {
    const r = region(x, y);
    if (r === ',') floorWood(c, X, Y, x, y);
    else if (r === 'q') floorStone(c, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62');
    else if (r === 'g') grass(c, X, Y, x, y);
    else if (r === 'y') { px(c, X, Y, T, T, '#c4a080'); px(c, X, Y, T, 1, '#b08e70'); px(c, X, Y, 1, T, '#b08e70'); }
    else floorStone(c, X, Y, x, y);
  }
  function floorWood(c, X, Y, x, y) {
    px(c, X, Y, T, T, '#9a7656');
    for (let k = 0; k < 4; k++) {
      px(c, X, Y + k * 4, T, 1, '#8a6848');
      px(c, X, Y + k * 4 + 1, T, 1, '#a8845f');
      px(c, X + Math.floor(hash(x * 4 + k, y) * 16), Y + k * 4, 1, 4, '#8a6848');
    }
  }
  function grass(c, X, Y, x, y) {
    px(c, X, Y, T, T, '#7fb46e');
    for (let k = 0; k < 8; k++) {
      const gx = Math.floor(hash(x * 7 + k, y) * 15), gy = Math.floor(hash(y * 7 + k, x) * 14);
      px(c, X + gx, Y + gy, 1, 2, k % 3 ? '#8fc27c' : '#72a663');
    }
  }
  function path(c, X, Y, x, y) {
    px(c, X, Y, T, T, '#a39582');
    for (let k = 0; k < 4; k++) {
      const sx = (k % 2) * 8 + ((Math.floor(k / 2) + y) % 2) * 3, sy = Math.floor(k / 2) * 8;
      px(c, X + sx + 1, Y + sy + 1, 6, 6, hash(x + k, y) > 0.5 ? '#c2b199' : '#b8a78f');
      px(c, X + sx + 1, Y + sy + 1, 6, 1, '#d2c3ab');
    }
  }
  function wallFace(c, X, Y, x, y) {
    px(c, X, Y, T, T, '#6e625a');
    for (let r = 0; r < 4; r++) {
      const off = (r + y) % 2 ? 4 : 0;
      for (let bx = -off; bx < T; bx += 8) {
        const x0 = Math.max(bx + 1, 0), x1 = Math.min(bx + 8, T);
        const v = hash(x * 8 + bx + 20, y * 4 + r);
        px(c, X + x0, Y + r * 4 + 1, x1 - x0, 3, v < 0.2 ? '#998b80' : v < 0.8 ? '#a6978a' : '#b0a294');
        px(c, X + x0, Y + r * 4 + 1, x1 - x0, 1, '#bcae9f');
      }
    }
    px(c, X, Y, T, 2, '#5a4c46');
    px(c, X, Y + 15, T, 1, '#5a4c46');
  }
  function wallTop(c, X, Y) { px(c, X, Y, T, T, '#5a4c46'); px(c, X + 2, Y + 2, T - 4, T - 4, '#5e5046'); }

  let fountain = null;
  function buildBg() {
    bg = document.createElement('canvas');
    bg.width = MW * T; bg.height = MH * T;
    const c = bg.getContext('2d');
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      const ch = grid[y][x], X = x * T, Y = y * T;
      switch (ch) {
        case '#': (isWall(at(x, y + 1)) || at(x, y + 1) === 'G' || at(x, y + 1) === 'S') ? wallTop(c, X, Y) : wallFace(c, X, Y, x, y); break;
        case 'W':
          wallFace(c, X, Y, x, y);
          px(c, X + 4, Y + 3, 8, 11, '#8a6a4a'); px(c, X + 5, Y + 2, 6, 1, '#8a6a4a');
          px(c, X + 5, Y + 4, 6, 9, '#3a4c8a'); px(c, X + 6, Y + 3, 4, 1, '#3a4c8a');
          px(c, X + 7, Y + 3, 1, 10, '#8a6a4a'); px(c, X + 5, Y + 8, 6, 1, '#8a6a4a');
          px(c, X + 6, Y + 5, 1, 1, '#ffffff'); px(c, X + 9, Y + 10, 1, 1, '#9fb0e8');
          px(c, X + 3, Y + 14, 10, 1, '#a8845f');
          break;
        case 'P':
          wallFace(c, X, Y, x, y);
          px(c, X + 2, Y + 1, 12, 13, '#d8b870'); px(c, X + 3, Y + 2, 10, 11, '#a88a5a');
          px(c, X + 2, Y + 1, 12, 1, '#ecd59a');
          break;
        case 'i':
          wallFace(c, X, Y, x, y);
          px(c, X + 6, Y + 8, 4, 2, '#5a4a3a'); px(c, X + 7, Y + 6, 2, 6, '#3a2e24');
          break;
        case 'G':
          px(c, X, Y, T, T, '#8fb6c8'); px(c, X + 1, Y + 1, 6, 6, '#b8d8e4'); px(c, X + 9, Y + 9, 6, 6, '#b8d8e4');
          px(c, X, Y, T, 1, '#5a7a8a'); px(c, X, Y, 1, T, '#5a7a8a'); px(c, X + 8, Y, 1, T, '#5a7a8a'); px(c, X, Y + 8, T, 1, '#5a7a8a');
          px(c, X + 2, Y + 5, 3, 1, '#ffffff'); px(c, X + 10, Y + 13, 3, 1, '#ffffff');
          break;
        case 'S': px(c, X, Y, T, T, '#26305e'); break;
        case '.': floorStone(c, X, Y, x, y); break;
        case 'q': floorStone(c, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62'); break;
        case 'D': floorStone(c, X, Y, x, y); px(c, X, Y, T, 4, 'rgba(40,30,30,0.18)'); break;
        case ',': floorWood(c, X, Y, x, y); break;
        case 'y':
          px(c, X, Y, T, T, '#c4a080'); px(c, X, Y, T, 1, '#b08e70'); px(c, X, Y, 1, T, '#b08e70');
          px(c, X + 8, Y, 1, T, '#b08e70'); px(c, X, Y + 8, T, 1, '#b08e70');
          if (hash(x, y) > 0.6) px(c, X + 3, Y + 11, 2, 2, '#6a9a4a');
          break;
        case 'r': {
          px(c, X, Y, T, T, '#b05a68');
          for (let k = 0; k < 4; k++) px(c, X + 2 + (k % 2) * 8, Y + 2 + Math.floor(k / 2) * 8, 4, 4, '#bc6a76');
          const r = (dx, dy) => at(x + dx, y + dy) === 'r';
          if (!r(-1, 0)) px(c, X, Y, 1, T, '#ecd08a');
          if (!r(1, 0)) px(c, X + 15, Y, 1, T, '#ecd08a');
          if (!r(0, -1)) px(c, X, Y, T, 1, '#ecd08a');
          if (!r(0, 1)) px(c, X, Y + 15, T, 1, '#ecd08a');
          break;
        }
        case 'g': grass(c, X, Y, x, y); break;
        case 'f': {
          grass(c, X, Y, x, y);
          const cols = ['#f6a8c8', '#f6e478', '#a8c8f6'];
          for (let k = 0; k < 3; k++) {
            const fx = X + 2 + Math.floor(hash(x + k, y * 3) * 11), fy = Y + 2 + Math.floor(hash(y + k, x * 3) * 11);
            px(c, fx, fy, 3, 1, cols[k]); px(c, fx + 1, fy - 1, 1, 3, cols[k]); px(c, fx + 1, fy, 1, 1, '#fff6c0');
          }
          break;
        }
        case 'p': case 'F': path(c, X, Y, x, y); if (ch === 'F' && !fountain) fountain = { x: X + T, y: Y + T }; break;
        case 'B': {
          px(c, X, Y, T, T, '#8a6244'); px(c, X + 1, Y + 1, 14, 14, '#5a4030');
          const bookCols = ['#c86a6a', '#6a8ac8', '#6aae84', '#c8aa6a', '#a07ab8', '#d08a62'];
          for (let s = 0; s < 3; s++) {
            const sy = Y + 1 + s * 5;
            for (let bx = 0; bx < 14; bx += 2) {
              const hgt = 3 + Math.floor(hash(x * 16 + bx, y * 3 + s) * 2);
              px(c, X + 1 + bx, sy + 4 - hgt, 2, hgt, bookCols[Math.floor(hash(bx + s, x + y) * 6)]);
            }
            px(c, X, sy + 4, T, 1, '#a07a58');
          }
          break;
        }
        case 'd':
          baseFloor(c, X, Y, x, y);
          px(c, X, Y + 3, T, 11, '#b88a5e'); px(c, X, Y + 3, T, 1, '#c89a6c'); px(c, X, Y + 13, T, 2, '#8a6446');
          if (at(x - 1, y) !== 'd') px(c, X, Y + 3, 1, 12, '#8a6446');
          if (at(x + 1, y) !== 'd') px(c, X + 15, Y + 3, 1, 12, '#8a6446');
          if (hash(x, y) > 0.5) { px(c, X + 3, Y + 6, 7, 5, '#f2e8c0'); px(c, X + 4, Y + 7, 5, 1, '#b8ac88'); px(c, X + 4, Y + 9, 4, 1, '#b8ac88'); }
          else { px(c, X + 4, Y + 5, 5, 6, '#6a8ac8'); px(c, X + 9, Y + 6, 1, 5, '#e8dcb0'); px(c, X + 11, Y + 6, 2, 3, '#1c1c2a'); }
          break;
        case 'T':
          floorStone(c, X, Y, x, y);
          px(c, X + 2, Y, 12, T, '#a07454'); px(c, X + 2, Y, 1, T, '#8a6244'); px(c, X + 13, Y, 1, T, '#8a6244');
          if (at(x, y - 1) !== 'T') px(c, X + 2, Y, 12, 2, '#b88a5e');
          if (at(x, y + 1) !== 'T') px(c, X + 2, Y + 13, 12, 3, '#7a5a40');
          px(c, X + 4, Y + 4, 3, 3, '#ecd59a'); px(c, X + 9, Y + 10, 3, 3, '#ecd59a');
          px(c, X + 10, Y + 3, 1, 2, '#d8d0ff'); px(c, X + 5, Y + 11, 2, 1, '#f08a3a');
          break;
        case 'H':
          floorStone(c, X, Y, x, y);
          px(c, X, Y + 2, T, 10, '#a07454'); px(c, X, Y + 2, T, 1, '#b88a5e'); px(c, X, Y + 12, T, 2, '#7a5a40');
          if (at(x - 1, y) !== 'H') px(c, X, Y + 2, 1, 12, '#7a5a40');
          if (at(x + 1, y) !== 'H') px(c, X + 15, Y + 2, 1, 12, '#7a5a40');
          px(c, X + 6, Y + 5, 3, 3, '#e3b23c');
          break;
        case 't':
          grass(c, X, Y, x, y);
          px(c, X + 3, Y + 13, 10, 2, 'rgba(0,0,0,0.25)');
          px(c, X + 6, Y + 9, 4, 6, '#8a6446');
          disc(c, X + 8, Y + 6, 7, (d, dx, dy) => (d > 46 ? '#5a9a58' : dx + dy < -3 && hash(dx + x, dy + y) > 0.4 ? '#9acc84' : '#78b46a'));
          if (hash(x, y) > 0.4) { px(c, X + 5, Y + 4, 2, 2, '#f08080'); px(c, X + 10, Y + 7, 2, 2, '#f08080'); }
          break;
        case 'o':
          floorStone(c, X, Y, x, y);
          px(c, X + 2, Y + 9, 12, 2, '#a07a58'); px(c, X + 7, Y + 10, 2, 6, '#8a6244');
          break;
        case 'c':
          floorStone(c, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62');
          px(c, X + 3, Y + 13, 10, 2, 'rgba(0,0,0,0.3)');
          disc(c, X + 8, Y + 9, 6, d => (d > 30 ? '#3e3850' : '#4a4458'));
          px(c, X + 2, Y + 4, 12, 2, '#5a5468'); px(c, X + 3, Y + 4, 10, 1, '#6a6478');
          break;
        case 'J': {
          floorStone(c, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62');
          px(c, X, Y, T, T, '#7a5a40'); px(c, X + 1, Y + 1, 14, 14, '#4e3a2c');
          const jar = ['#6ac86a', '#c86ab8', '#e0a040', '#6aa8e0', '#e06a6a'];
          for (let s = 0; s < 2; s++) {
            for (let j = 0; j < 3; j++) {
              const jx = X + 2 + j * 4 + (s % 2), jy = Y + 2 + s * 7;
              px(c, jx, jy + 1, 3, 4, jar[Math.floor(hash(x * 3 + j, y + s) * 5)]); px(c, jx, jy, 3, 1, '#c8c8d0');
              px(c, jx, jy + 2, 1, 1, 'rgba(255,255,255,0.5)');
            }
            px(c, X, Y + 6 + s * 7, T, 1, '#8a6446');
          }
          break;
        }
        case 'L':
          px(c, X, Y, T, T, '#c4a080');
          px(c, X, Y + 6, T, 9, '#8a6446'); px(c, X, Y + 6, T, 2, '#5e4632');
          for (let k = 0; k < 3; k++) {
            const lx = X + 2 + k * 5;
            px(c, lx, Y + 1 + (k % 2), 3, 6, '#4a9a4a'); px(c, lx + 1, Y + (k % 2), 1, 2, '#6aba5a');
            if (hash(x + k, y) > 0.5) px(c, lx + 1, Y + (k % 2), 1, 1, ['#f6a8c8', '#f6e478', '#c8a8f6'][k]);
          }
          break;
        case 'm':
          px(c, X, Y, T, T, '#c4a080');
          px(c, X + 3, Y + 8, 10, 7, '#c06a3a'); px(c, X + 2, Y + 7, 12, 2, '#d07a4a'); px(c, X + 4, Y + 9, 2, 5, '#d8845a');
          px(c, X + 7, Y + 2, 2, 6, '#3a8a3a'); px(c, X + 4, Y + 3, 3, 2, '#5aaa4a'); px(c, X + 9, Y + 2, 3, 2, '#5aaa4a');
          break;
        case 'k': // sandalye (üstüne oturulur)
          baseFloor(c, X, Y, x, y);
          px(c, X + 3, Y + 3, 10, 9, '#a87c58'); px(c, X + 3, Y + 3, 10, 1, '#c09470');
          px(c, X + 3, Y + 11, 10, 3, '#8a6446'); px(c, X + 4, Y + 14, 2, 2, '#7a5a40'); px(c, X + 10, Y + 14, 2, 2, '#7a5a40');
          break;
        case 'u': { // halı
          floorWood(c, X, Y, x, y);
          const u = (dx, dy) => at(x + dx, y + dy) === 'u';
          px(c, X, Y, T, T, '#7e72b0');
          for (let k = 0; k < 4; k++) px(c, X + 3 + (k % 2) * 8, Y + 3 + Math.floor(k / 2) * 8, 2, 2, '#c8b8e8');
          if (!u(-1, 0)) px(c, X, Y, 2, T, '#d8c890'); if (!u(1, 0)) px(c, X + 14, Y, 2, T, '#d8c890');
          if (!u(0, -1)) px(c, X, Y, T, 1, '#d8c890'); if (!u(0, 1)) { px(c, X, Y + 15, T, 1, '#d8c890'); for (let k = 1; k < 16; k += 3) px(c, X + k, Y + 15, 1, 1, '#f0e6c0'); }
          break;
        }
        case 'K': // küre
          baseFloor(c, X, Y, x, y);
          px(c, X + 5, Y + 13, 6, 2, '#8a6446'); px(c, X + 7, Y + 10, 2, 4, '#a07a58');
          disc(c, X + 8, Y + 6, 5, (d, dx, dy) => (d > 24 ? '#d8b870' : (dx + dy) % 5 === 0 || (dx > 0 && dy < 0) ? '#8ac28a' : '#6a9ad8'));
          px(c, X + 6, Y + 4, 1, 1, '#ffffff');
          break;
        case 'Y': // şamdan (alevi ve ışığı dinamik)
          baseFloor(c, X, Y, x, y);
          px(c, X + 7, Y + 6, 2, 9, '#d8b870'); px(c, X + 5, Y + 14, 6, 1, '#a88a5a');
          px(c, X + 3, Y + 6, 10, 1, '#d8b870'); px(c, X + 3, Y + 4, 2, 2, '#f4ecd8'); px(c, X + 7, Y + 3, 2, 3, '#f4ecd8'); px(c, X + 11, Y + 4, 2, 2, '#f4ecd8');
          break;
        case 'V': // şömine (ateşi dinamik)
          wallFace(c, X, Y, x, y);
          { const left = at(x + 1, y) === 'V'; // iki karolu şöminenin sol yarısı mı
            px(c, X + (left ? 2 : 0), Y + 3, 14, 13, '#a89a8a'); px(c, X + (left ? 4 : 0), Y + 6, 12, 10, '#2a2024'); }
          px(c, X, Y + 2, T, 2, '#c0b2a0');
          break;
        case 'A': // zırh
          baseFloor(c, X, Y, x, y);
          px(c, X + 4, Y + 14, 8, 2, '#6a6472');
          px(c, X + 5, Y + 4, 6, 10, '#b8bcc8'); px(c, X + 5, Y + 4, 2, 10, '#d8dce6'); px(c, X + 6, Y + 1, 4, 4, '#c8ccd6');
          px(c, X + 6, Y + 2, 4, 1, '#4a4458'); px(c, X + 7, Y, 2, 1, '#d86a6a'); px(c, X + 12, Y + 2, 1, 12, '#8a8494'); px(c, X + 11, Y + 1, 3, 2, '#c8ccd6');
          break;
        case 'n': // saksı bitkisi
          baseFloor(c, X, Y, x, y);
          px(c, X + 4, Y + 10, 8, 5, '#c87a52'); px(c, X + 3, Y + 9, 10, 2, '#d88a62');
          disc(c, X + 8, Y + 6, 4, (d, dx, dy) => (d > 12 ? '#5a9a58' : dx + dy < 0 ? '#9acc84' : '#78b46a'));
          break;
        case 'x': // fıçı
          baseFloor(c, X, Y, x, y);
          px(c, X + 3, Y + 3, 10, 12, '#9a7050'); px(c, X + 3, Y + 3, 10, 2, '#b08462');
          px(c, X + 3, Y + 6, 10, 1, '#6a6472'); px(c, X + 3, Y + 12, 10, 1, '#6a6472'); px(c, X + 5, Y + 4, 1, 10, '#b08462');
          break;
        case 'z': // bank
          grass(c, X, Y, x, y);
          px(c, X + 1, Y + 6, 14, 5, '#a87c58'); px(c, X + 1, Y + 6, 14, 1, '#c09470'); px(c, X + 1, Y + 9, 14, 1, '#8a6446');
          px(c, X + 2, Y + 11, 2, 3, '#7a5a40'); px(c, X + 12, Y + 11, 2, 3, '#7a5a40');
          break;
        case 'e': // çit / çalı
          grass(c, X, Y, x, y);
          disc(c, X + 8, Y + 8, 7, (d, dx, dy) => (d > 40 ? '#5a9a58' : dx + dy < -2 ? '#9acc84' : '#78b46a'));
          if (hash(x, y) > 0.3) { px(c, X + 5, Y + 6, 2, 2, '#f6a8c8'); px(c, X + 10, Y + 9, 2, 2, '#f6e478'); }
          break;
        case 'l': // fener direği (alevi ve ışığı dinamik)
          grass(c, X, Y, x, y);
          px(c, X + 7, Y + 5, 2, 10, '#5a5468'); px(c, X + 5, Y + 14, 6, 1, '#4a4458');
          px(c, X + 5, Y + 1, 6, 5, '#4a4458'); px(c, X + 6, Y + 2, 4, 3, '#f6e0a0');
          break;
        case 'v':
          px(c, X, Y, T, T, '#1a1828');
          if (hash(x, y) > 0.6) px(c, X + Math.floor(hash(y, x) * 14), Y + Math.floor(hash(x + 1, y) * 14), 1, 1, '#2a2840');
          if (at(x, y - 1) !== 'v') px(c, X, Y, T, 3, '#2a2638');
          break;
      }
    }
    // Eşyaların zemine düşen yumuşak gölgesi (alta ve sağa)
    const CASTS = new Set(['B', 'd', 'T', 'H', 'J', 'L', 'c', 'o', 'K', 'Y', 'A', 'n', 'x', 'z', 'e', 'l']);
    for (let y = 0; y < MH - 1; y++) for (let x = 0; x < MW; x++) {
      if (!CASTS.has(grid[y][x])) continue;
      if (!SOLID.has(grid[y + 1][x])) { px(c, x * T + 1, (y + 1) * T, T - 1, 3, 'rgba(60,40,30,0.18)'); px(c, x * T + 2, (y + 1) * T + 3, T - 3, 1, 'rgba(60,40,30,0.08)'); }
      if (x + 1 < MW && !SOLID.has(grid[y][x + 1]) && grid[y][x] !== 'B' && grid[y][x] !== 'J') px(c, (x + 1) * T, y * T + 4, 2, T - 3, 'rgba(60,40,30,0.12)');
    }
    // Duvarların dibine yumuşak gölge
    for (let y = 1; y < MH; y++) for (let x = 0; x < MW; x++) {
      const above = at(x, y - 1);
      if (!SOLID.has(grid[y][x]) && (isWall(above) || above === 'S' || above === 'G')) {
        px(c, x * T, y * T, T, 3, 'rgba(60,40,30,0.16)'); px(c, x * T, y * T + 3, T, 2, 'rgba(60,40,30,0.07)');
      }
    }
    if (fountain) {
      disc(c, fountain.x, fountain.y, 15, d => (d > 180 ? '#9a9aac' : d > 160 ? '#7a7a8c' : d > 120 ? '#3a78c8' : '#4a88d8'));
      px(c, fountain.x - 2, fountain.y - 7, 4, 9, '#aaaabc'); px(c, fountain.x - 3, fountain.y - 8, 6, 2, '#c0c0d0');
    }
  }

  // ---------- Karakterler ----------
  function tone(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const ch = v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))).toString(16).padStart(2, '0');
    return '#' + ch(n >> 16) + ch((n >> 8) & 255) + ch(n & 255);
  }
  function lookPal(lk, extra) {
    const h = Scene.HOUSES[lk.house] || Scene.HOUSES.kizil;
    const of = Scene.OUTFITS[lk.outfit] || {};
    const p = {
      K: '#6a4e62', H: '#4a4068', h: '#6a5e90', C: h.a, c: h.b, W: '#ffffff', w: '#f2f2f6',
      R: Scene.HAIR[lk.hair] || Scene.HAIR.kahve, S: Scene.SKIN[lk.skin] ?? Scene.SKIN[1],
      E: '#3a2a3e', B: '#f6a6b0', M: '#c0605a', O: '#3e3850', P: '#f0a0b0', L: '#5a4444',
      ...(of.pal || {}), ...extra,
    };
    if (of.pal) for (const k of ['O', 'H', 'h']) if (of.pal[k]) p[k] = tone(p[k], 1.3);
    return { ...p, r: tone(p.R, 0.82), Q: tone(p.R, 1.3), s: tone(p.S, 0.9), o: tone(p.O, 0.8) };
  }

  const tileCenter = (tx, ty) => ({ x: tx * T + 8, y: ty * T + 13 });
  const player = { x: 0, y: 0, dir: 'down', moving: false, path: [], seated: false, toSeat: null, pendingTalk: null };
  Object.assign(player, tileCenter(6, 11));

  const student = (house, hair, skin) => ({ look: { house, hair, skin, outfit: 'klasik' } });
  const NPCS = [
    { name: 'Headmaster Thornbury', look: { house: 'kehribar', hair: 'gumus', skin: 0 }, hat: 'hat', beard: true,
      extra: { H: '#9a4a58', h: '#b05a68', O: '#7a3a48', C: '#e3b23c', c: '#d8b870', R: '#e8e8f0' },
      area: [12, 3, 22, 3], start: [17, 3], speed: 20,
      lines: ['Hoş geldin! Bu kalede her gün biraz daha bilge oluruz.', 'Mumlar, çalışanlar için hep yanar.', 'Bugün {pomos} oturum mu? Okulumuz seninle gurur duyuyor!', 'Kısa molalar, uzun büyülerin sırrıdır.'],
      focus: 'Odaklan genç büyücü; sihir sabır ister.' },
    { name: 'Professor Ashdown', look: { house: 'zumrut', hair: 'kizil', skin: 1 }, hat: 'hat', long: true,
      extra: { H: '#5a8a5a', h: '#4a8a4a', O: '#4a6e4e' }, area: [1, 14, 8, 19], start: [4, 16],
      lines: ['Kazanlara dokunma! Hele mor olana hiç.', 'Odak iksiri: iki damla sabır, bir tutam uyku, bolca pomodoro.', 'Bu duman normal… sanırım.'],
      focus: 'İksir kaynıyor, sen de çalış!' },
    { name: 'Professor Bramble', look: { house: 'kehribar', hair: 'kahve', skin: 2 }, hat: 'hat',
      extra: { H: '#c8a060', h: '#e0c080', O: '#7a6a4a', C: '#9acc84', c: '#78b46a' }, area: [24, 15, 32, 19], start: [28, 15],
      lines: ['Çığlık köklerine yaklaşırken kulaklarını kapat!', 'Bitkiler de senin gibi düzenli bakım ister.', 'Seranın en sevdiğim köşesi burası.'],
      focus: 'Bitkiler sessizce büyür, sen de sessizce çalış.' },
    { name: 'Madam Quillby', look: { house: 'zumrut', hair: 'gumus', skin: 0 }, hat: 'hat', long: true,
      extra: { H: '#6a5a8a', h: '#6a5a8a', O: '#5a5070' }, area: [1, 3, 9, 8], start: [5, 3],
      lines: ['Şşş! Burası çalışma alanı.', 'Kitapları yerine koymayı unutma, olur mu?', 'Bugün {min} dakika mı çalıştın? Fena değil!', 'Sessizlik en güçlü büyüdür.'],
      focus: 'Şşş! Odak zamanı.' },
    { name: 'Rose', ...student('safir', 'siyah', 2), long: true, seat: [7, 8],
      lines: ['Dört oturum bitirince uzun mola veriyorum.', 'Birlikte çalışmak daha kolay, değil mi?', 'Bugün {pomos} oturum mu yaptın? Harika!'],
      focus: '(Rose başını kaldırmadan çalışıyor)' },
    { name: 'Oliver', ...student('kehribar', 'kahve', 3), area: [11, 3, 23, 8], start: [14, 8],
      lines: ['Bugünkü tatlı balkabağı turtası!', 'Bu salonun mumları hiç erimiyor, fark ettin mi?', 'Çalışmadan önce iyi bir kahvaltı şart.'],
      focus: 'Molada görüşürüz!' },
    { name: 'Ivy', ...student('kizil', 'sari', 0), long: true, area: [11, 3, 23, 8], start: [20, 8],
      lines: ['Tavana bak! Gerçek gökyüzünü gösteriyor.', 'Kayan yıldız görürsen dilek tut!', 'Kahvaltıdan sonra kütüphaneye gidiyorum.'],
      focus: 'Molada görüşürüz!' },
    { name: 'Theo', ...student('zumrut', 'siyah', 1), area: [1, 10, 32, 11], start: [20, 11],
      lines: ['Merdivenler yine yer değiştirdi, dikkat et!', 'Baykuşhaneye mektup göndermeye gidiyorum.', 'Koridordaki portreler çok geveze.'],
      focus: 'Molada görüşürüz!' },
    { name: 'Felix', ...student('kizil', 'kizil', 1), area: [10, 13, 22, 19], start: [12, 17],
      lines: ['Avlunun havası kafa açıyor!', 'Molada biraz yürümek iyi gelir.', 'Çeşmeye dilek tuttum: bol odak!'],
      focus: 'Molada görüşürüz!' },
    { name: 'Pip', kind: 'owl', start: [29, 3],
      lines: ['Huu! Oturum bitince sana mektup getiririm.', 'Baykuşhane kulenin en tepesinde.', 'Huu huu! Kanatlarım hazır.'],
      focus: 'Huu… odaklan.' },
    { name: 'Inkwell', kind: 'cat', area: [1, 10, 22, 19], start: [11, 11], speed: 34,
      lines: ['Miyav.', 'Mrrr…', '(seni süzüp uzaklaşıyor)'], focus: 'Mrr.' },
    { name: 'Mossy', kind: 'toad', area: [24, 15, 32, 19], start: [28, 18], speed: 26,
      lines: ['Vırak.', 'Vıraaak!', '(gözlerini kırpıştırıyor)'], focus: 'Vırak.' },
    { name: 'Wisp', kind: 'ghost', speed: 14, start: [17, 6],
      lines: ['Ooooo… beş yüz yıldır mola veriyorum.', 'Duvarlardan geçmek mi? Pratik meselesi.', 'Bir pomodoro daha, sonra birlikte süzülelim.'],
      focus: 'Ooo… odaklan, odaklan…' },
  ];
  for (const n of NPCS) {
    const [sx, sy] = n.seat || n.start;
    Object.assign(n, tileCenter(sx, sy), { dir: n.seat ? 'up' : 'down', path: [], wait: 1 + Math.random() * 3, moving: false });
    if (n.seat) n.y -= 7;
    if (n.look) n.pal = lookPal(n.look, n.extra);
  }
  const FREE_FLYERS = new Set(['ghost']);

  // Portreler, çığlık kökleri, meşaleler, kazanlar, tünekler: haritadan okunur
  const PORTRAIT_KINDS = [
    { name: 'Sir Percival Stonewick', kind: 'knight', lines: ['Dur! Kim gidiyor? Ah, çalışkan bir öğrenci. Geçebilirsin!', 'Bir pomodoro daha ve zafer senin!'] },
    { name: 'Lady Isolde Fairweather', kind: 'lady', lines: ['Ne zarif bir pelerin!', 'Molada biraz dinlenmek şart, canım.'] },
    { name: 'Count Dozwell', kind: 'sleepy', lines: ['Zzz… ha? Ders mi başladı?', 'Ben de bir ara çalışacağım… yarın.'] },
    { name: 'Captain Halloway', kind: 'captain', lines: ['Kuzeyde kütüphane ve salon, güneyde avlu. Kaybolma!', 'Kule merdivenleri baykuşhaneye çıkar!'] },
    { name: 'The Fruit Bowl', kind: 'fruit', lines: ['Bana kimse bakmıyor, ben sadece bir meyve tabağıyım.', 'Bir elma? Hayır mı? Peki.'] },
  ];
  const portraits = tilesOf('P').map(([x, y], i) => ({ x: x * T + 8, y: y * T + 18, X: x * T, Y: y * T, ...PORTRAIT_KINDS[i % PORTRAIT_KINDS.length], cool: 0 }));
  const roots = tilesOf('m').map(([x, y]) => ({ x: x * T + 8, y: y * T + 10, X: x * T, Y: y * T, cool: 0, pop: 0 }));
  const fireplaces = tilesOf('V');
  const flames = [...tilesOf('Y').map(p => [...p, 'Y']), ...tilesOf('l').map(p => [...p, 'l'])];
  const torches = tilesOf('i').map(([x, y]) => ({ X: x * T, Y: y * T }));
  const cauldrons = tilesOf('c').map(([x, y], i) => ({ X: x * T, Y: y * T, col: ['#7ae07a', '#c07ae0', '#f0a040', '#6ac8f0'][i % 4] }));
  const perches = tilesOf('o').map(([x, y], i) => ({ X: x * T, Y: y * T, col: ['#8a6a4a', '#a8a8b0', '#6a4a3a', '#b08050', '#7a7a6a'][i % 5], p: i * 1.7 }));
  const SKY_STARS = Array.from({ length: 40 }, (_, i) => ({ x: Math.floor(hash(i, 51) * 206), y: Math.floor(hash(i, 52) * 30), p: hash(i, 53) * 6 }));

  // ---------- Yol bulma (karo ızgarasında BFS) ----------
  function findPath(sx, sy, tx, ty) {
    if (sx === tx && sy === ty) return [];
    const key = (x, y) => y * MW + x;
    const prev = new Map([[key(sx, sy), -1]]);
    const q = [[sx, sy]];
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (!walkable(nx, ny) || prev.has(k)) continue;
        prev.set(k, key(x, y));
        if (nx === tx && ny === ty) {
          const out = [];
          for (let c = k; c !== key(sx, sy); c = prev.get(c)) out.unshift([c % MW, Math.floor(c / MW)]);
          return out;
        }
        q.push([nx, ny]);
      }
    }
    return null;
  }
  const tileOf = a => [Math.floor(a.x / T), Math.floor((a.y - 4) / T)];

  function follow(a, speed, dt) {
    if (!a.path.length) { a.moving = false; return true; }
    if (!walkable(...a.path[0])) { a.path = []; a.moving = false; return false; } // merdiven kaydıysa dur
    const target = tileCenter(...a.path[0]);
    const dx = target.x - a.x, dy = target.y - a.y, d = Math.hypot(dx, dy);
    const step = speed * dt;
    a.moving = true;
    if (Math.abs(dx) > Math.abs(dy)) a.dir = dx > 0 ? 'right' : 'left'; else if (d > 0.5) a.dir = dy > 0 ? 'down' : 'up';
    if (d <= step) { a.x = target.x; a.y = target.y; a.path.shift(); return !a.path.length; }
    a.x += dx / d * step; a.y += dy / d * step;
    return false;
  }

  function blocked(x, y) {
    for (const [cx, cy] of [[x - 4, y - 4], [x + 3, y - 4], [x - 4, y], [x + 3, y]]) {
      if (!walkable(Math.floor(cx / T), Math.floor(cy / T))) return true;
    }
    return false;
  }

  // ---------- Güncelleme ----------
  const focusing = () => mode === 'focus' && running;
  const onStair = () => { const [tx, ty] = tileOf(player); return at(tx, ty) === 'v'; };

  function sitDown() {
    const taken = new Set(NPCS.filter(n => n.seat).map(n => n.seat.join()));
    const [px0, py0] = tileOf(player);
    let best = null;
    for (const s of SEATS) {
      if (taken.has(s.join())) continue;
      const p = findPath(px0, py0, s[0], s[1]);
      if (p && (!best || p.length < best.path.length)) best = { seat: s, path: p };
    }
    if (!best) { const s = SEATS[0]; Object.assign(player, tileCenter(s[0], s[1])); best = { seat: s, path: [] }; }
    player.toSeat = best.seat;
    player.path = best.path;
    player.pendingTalk = null;
  }

  function updateStair(dt) {
    const before = stairCol();
    if (stairFixed()) {
      STAIR.wait -= dt;
      if (STAIR.wait <= 0) {
        STAIR.step = (STAIR.step + 1) % STAIR.order.length;
        STAIR.from = STAIR.to; STAIR.to = STAIR.order[STAIR.step]; STAIR.k = 0;
      }
    } else {
      STAIR.k = Math.min(1, STAIR.k + dt / 1.2);
      if (stairFixed()) STAIR.wait = 6;
    }
    const delta = (stairCol() - before) * T;
    if (delta && onStair()) { player.x += delta; player.path = []; } // üstündeysen seni de taşır
  }

  function update(dt) {
    updateStair(dt);
    if (focusing() && !player.seated && !player.toSeat && !onStair()) sitDown();
    if (!focusing() && (player.seated || player.toSeat)) {
      if (player.seated) player.y += 7;
      player.seated = false; player.toSeat = null; player.path = [];
    }

    if (!player.seated) {
      let vx = 0, vy = 0;
      if (!player.toSeat && (stairFixed() || !onStair())) {
        if (keys.has('ArrowLeft') || keys.has('KeyA')) vx--;
        if (keys.has('ArrowRight') || keys.has('KeyD')) vx++;
        if (keys.has('ArrowUp') || keys.has('KeyW')) vy--;
        if (keys.has('ArrowDown') || keys.has('KeyS')) vy++;
      }
      if (vx || vy) {
        player.path = []; player.pendingTalk = null;
        const len = Math.hypot(vx, vy), sp = 66 * dt;
        const nx = player.x + vx / len * sp, ny = player.y + vy / len * sp;
        if (!blocked(nx, player.y)) player.x = nx;
        if (!blocked(player.x, ny)) player.y = ny;
        player.dir = vx ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
        player.moving = true;
      } else if (follow(player, player.toSeat ? 74 : 66, dt)) {
        if (player.toSeat) { player.seated = true; player.toSeat = null; player.dir = 'up'; player.y -= 7; }
        if (player.pendingTalk) { talk(player.pendingTalk); player.pendingTalk = null; }
      }
    } else player.moving = false;

    for (const n of NPCS) updateNpc(n, dt);
    updateMail(dt);
    if (bubble && t > bubble.until) bubble = null;
    if (!bubble) proximityChatter();
    if (isBreak() && fountain && !quests().c.fountain && Math.hypot(player.x - fountain.x, player.y - fountain.y - 8) < 30) {
      say('Felix', 'Çeşmenin şırıltısı ne kadar dinlendirici, değil mi?', { x: fountain.x, y: fountain.y - 14 });
      bump('fountain');
    }

    cam.x = Math.round(Math.max(0, Math.min(MW * T - VW, player.x - VW / 2)));
    cam.y = Math.round(Math.max(0, Math.min(MH * T - VH, player.y - 8 - VH / 2)));
  }

  function updateNpc(n, dt) {
    if (n.seat || n.kind === 'owl') return;
    if (bubble?.anchor === n) { n.moving = false; if (!FREE_FLYERS.has(n.kind)) faceTo(n, player); return; }
    if (FREE_FLYERS.has(n.kind)) {
      if (!n.target || Math.hypot(n.target.x - n.x, n.target.y - n.y) < 2) {
        n.target = { x: 24 + Math.random() * (MW * T - 48), y: 40 + Math.random() * (MH * T - 80) };
      }
      const dx = n.target.x - n.x, dy = n.target.y - n.y, d = Math.hypot(dx, dy);
      n.x += dx / d * n.speed * dt; n.y += dy / d * n.speed * dt;
      n.dir = dx > 0 ? 'right' : 'left';
      return;
    }
    if (n.wait > 0) { n.wait -= dt; n.moving = false; return; }
    if (!n.path.length) {
      const [x0, y0, x1, y1] = n.area;
      for (let i = 0; i < 12; i++) {
        const tx = x0 + Math.floor(Math.random() * (x1 - x0 + 1)), ty = y0 + Math.floor(Math.random() * (y1 - y0 + 1));
        if (!walkable(tx, ty) || at(tx, ty) === 'v') continue;
        const p = findPath(...tileOf(n), tx, ty);
        if (p && p.length && !p.some(([x, y]) => at(x, y) === 'v')) { n.path = n.kind === 'toad' ? p.slice(0, 2) : p; break; }
      }
      if (!n.path.length) { n.wait = 1; return; }
    }
    if (follow(n, n.speed || 30, dt)) n.wait = n.kind === 'toad' ? 0.6 + Math.random() * 1.5 : 1.5 + Math.random() * 3.5;
  }

  function faceTo(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }

  // Çığlık kökleri yaklaşınca bağırır (portreler sadece E / tıklama ile konuşur)
  function proximityChatter() {
    for (const r of roots) {
      if (t < r.cool || Math.hypot(player.x - r.x, player.y - r.y) > 24) continue;
      r.cool = t + 15; r.pop = t + 2.5;
      say('Screamroot', 'AAAAAAA!', { x: r.x, y: r.y - 10 });
      return;
    }
  }

  // ---------- Günün görevleri ----------
  // Her gün 3 görev seçilir; ilerleme odak oturumları, molada yapılan kale etkinlikleri ve görev listesinden gelir.
  // Tamamlanınca görevi veren karakterle konuşup altın ödülü alınır.
  const QUEST_POOL = [
    { id: 'lib2', giver: 'Madam Quillby', where: 'Kütüphane', reward: 3, ask: 'Kütüphanede 2 odak oturumu tamamla.', need: 2, count: c => c.lib },
    { id: 'hall1', giver: 'Oliver', where: 'Büyük Salon', reward: 2, ask: "Büyük Salon'daki masalarda 1 oturum çalış.", need: 1, count: c => c.hall },
    { id: 'sess3', giver: 'Professor Ashdown', where: 'İksir zindanı', reward: 4, ask: 'Bugün 3 odak oturumu tamamla. İksirin gücü sabırdadır.', need: 3, count: () => today().pomos },
    { id: 'goal', giver: 'Headmaster Thornbury', where: 'Büyük Salon', reward: 3, ask: 'Günlük hedefinin yarısına ulaş.', need: () => Math.ceil(data.settings.goal / 2), count: () => Math.floor(today().sec / 60), unit: ' dk' },
    { id: 'water', giver: 'Professor Bramble', where: 'Sera', reward: 2, ask: 'Bir molada seraya gel, bir çığlık kökünü sula (yanına gidip E).', need: 1, count: c => c.water },
    { id: 'task', giver: 'Pip', where: 'Baykuşhane', reward: 2, ask: 'Görev listenden bir işi bitir, haberini ben uçurayım.', need: 1, count: c => c.tasks },
    { id: 'fount', giver: 'Felix', where: 'Avlu', reward: 1, ask: 'Bir molada avludaki çeşmenin başında dinlen.', need: 1, count: c => c.fountain },
    { id: 'tasksess', giver: 'Rose', where: 'Kütüphane', reward: 3, ask: 'Seçili bir görevine 2 odak oturumu ayır.', need: 2, count: c => c.taskSess },
  ];
  const isBreak = () => mode === 'short' || mode === 'long';
  const roomOf = (x, y) => (y <= 8 ? (x <= 9 ? 'lib' : x <= 23 ? 'hall' : 'tower') : y <= 11 ? 'corridor' : x <= 8 ? 'dungeon' : x <= 22 ? 'courtyard' : 'greenhouse');

  function quests() {
    const key = todayKey();
    if (!data.quests || data.quests.date !== key) {
      const seed = [...key].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1000003, 7);
      const ids = QUEST_POOL.map((q, i) => [q.id, hash(i + 1, seed)]).sort((p, q) => p[1] - q[1]).map(p => p[0]);
      data.quests = { date: key, ids: ids.slice(0, 3), c: { lib: 0, hall: 0, water: 0, tasks: 0, fountain: 0, taskSess: 0 }, claimed: {}, seen: {} };
      save();
    }
    return data.quests;
  }
  const todays = () => quests().ids.map(id => QUEST_POOL.find(q => q.id === id));
  function progress(q) {
    const need = typeof q.need === 'function' ? q.need() : q.need;
    return [Math.min(q.count(quests().c), need), need];
  }
  const questOf = n => todays().find(q => q.giver === n.name && !quests().claimed[q.id]);
  const isDone = q => { const [cur, need] = progress(q); return cur >= need; };

  function bump(key) {
    quests().c[key]++;
    save();
    renderQuests();
    const ready = todays().find(q => !quests().claimed[q.id] && isDone(q) && !quests().seen['ready:' + q.id]);
    if (ready) { quests().seen['ready:' + ready.id] = true; save(); toast(`Görev tamam! Ödül için ${ready.giver} ile konuş (${ready.where}).`); }
  }

  function renderQuests() {
    const list = document.getElementById('questList');
    if (!list) return;
    list.innerHTML = '';
    for (const q of todays()) {
      const [cur, need] = progress(q), claimed = quests().claimed[q.id], done = cur >= need;
      const li = document.createElement('li');
      li.className = 'quest' + (claimed ? ' claimed' : done ? ' ready' : '');
      li.innerHTML = '<b></b><span></span><em></em>';
      li.querySelector('b').textContent = `${q.giver} · ${q.where}`;
      li.querySelector('span').textContent = claimed ? 'Tamamlandı' : done ? 'Bitti! Ödülünü almak için yanına git.' : q.ask;
      li.querySelector('em').textContent = claimed ? '✓' : `${cur}/${need}${q.unit || ''} · ${q.reward} altın`;
      list.appendChild(li);
    }
  }

  // ---------- Konuşma ve baykuş postası ----------
  function say(name, text, anchor, secs = 4) { bubble = { name, text, anchor, until: t + secs }; }

  function talk(n) {
    const q = questOf(n);
    if (q && isDone(q)) {
      quests().claimed[q.id] = true;
      const mult = data.wisdom ? 2 : 1; // bilgelik iksiri
      data.wisdom = false;
      data.coins += q.reward * mult;
      save(); render(); renderQuests();
      const c = document.querySelector('.coins');
      c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
      say(n.name, `Harika iş! Ödülün: +${q.reward * mult} altın.${mult > 1 ? ' (Bilgelik iksiri!)' : ''}`, n);
      if (!player.seated) faceTo(player, n);
      return;
    }
    if (q && (!quests().seen[q.id] || Math.random() < 0.5)) {
      quests().seen[q.id] = true; save();
      const [cur, need] = progress(q);
      say(n.name, `${q.ask} (${cur}/${need}${q.unit || ''})`, n, 5);
      if (!player.seated) faceTo(player, n);
      return;
    }
    const d = today();
    const zero = d.pomos === 0 || d.sec < 60; // "Bugün 0 oturum, harika!" demesinler
    const pool = focusing() ? [n.focus] : n.lines.filter(l => !(zero && /\{(min|pomos)\}/.test(l)));
    const text = pool[Math.floor(Math.random() * pool.length)]
      .replace('{min}', Math.floor(d.sec / 60)).replace('{pomos}', d.pomos);
    say(n.name, text, n);
    if (!player.seated) faceTo(player, n);
  }

  function waterRoot(r) {
    r.pop = t + 2.5; r.cool = t + 15;
    if (!isBreak()) return say('Screamroot', 'AAAA! Molada gel, şimdi çalışma zamanı!', { x: r.x, y: r.y - 10 });
    if (quests().c.water) return say('Screamroot', 'Glub… yeterince suladın, teşekkürler!', { x: r.x, y: r.y - 10 });
    say('Screamroot', 'Glub glub… ahh, teşekkürler!', { x: r.x, y: r.y - 10 });
    bump('water');
  }

  const nearPortrait = () => portraits.find(p => Math.hypot(player.x - p.x, player.y - p.y - 10) < 30);
  function talkPortrait(p) {
    say(p.name, p.lines[Math.floor(Math.random() * p.lines.length)], { x: p.x, y: p.y - 4 });
  }

  function nearestNpc() {
    let best = null, bd = 26;
    for (const n of NPCS) {
      const d = Math.hypot(n.x - player.x, n.y - player.y);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  function sendMail(text) {
    if (!visible) { pendingMail = text; return; }
    mailOwl = { x: cam.x + VW + 12, y: cam.y - 12, text, phase: 'in', left: 0 };
  }
  function updateMail(dt) {
    const m = mailOwl;
    if (!m) return;
    const tx = m.phase === 'in' ? player.x + 10 : cam.x - 30, ty = m.phase === 'in' ? player.y - 20 : cam.y - 30;
    const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy), sp = 90 * dt;
    if (m.phase === 'wait') {
      m.x = player.x + 10; m.y = player.y - 20;
      if ((m.left -= dt) <= 0) m.phase = 'out';
      return;
    }
    if (d <= sp) {
      if (m.phase === 'in') { m.phase = 'wait'; m.left = 4.5; say('Owl Mail', m.text, { x: player.x - 6, y: player.y - 30 }, 4.5); }
      else mailOwl = null;
      return;
    }
    m.x += dx / d * sp; m.y += dy / d * sp;
  }

  // ---------- Çizim ----------
  function drawChar(a) {
    const pal = a === player ? lookPal(data.look) : a.pal;
    const dir = a.dir === 'left' || a.dir === 'right' ? 'side' : a.dir;
    const rows = dir === 'side' ? SIDE : dir === 'up' ? UP : DOWN;
    const step = a.moving && Math.floor(t * 8) % 2;
    const over = {};
    if (step) Object.assign(over, FEET_B[dir]);
    const longHair = a === player ? data.look.hairStyle !== 'kisa' : a.long;
    if (longHair) Object.assign(over, LONG[dir]);
    if (a.beard && dir !== 'up') Object.assign(over, BEARD[dir]);
    const flip = a.dir === 'left';
    const x = Math.round(a.x - cam.x), gy = Math.round(a.y - cam.y), y = gy - (step ? 1 : 0);
    px(ctx, x - 4, gy - 1, 8, 2, 'rgba(40,25,30,0.22)'); px(ctx, x - 5, gy - 1, 10, 1, 'rgba(40,25,30,0.12)'); px(ctx, x - 3, gy + 1, 6, 1, 'rgba(40,25,30,0.10)');
    sprite(ctx, rows, pal, x - 6, y - 12, flip, over);
    const hat = a === player ? (data.look.outfit === 'kedi' ? 'beanie' : 'hat') : a.hat;
    if (hat === 'hat') sprite(ctx, HAT, pal, x - 6, y - 15, flip);
    if (hat === 'beanie') sprite(ctx, BEANIE, pal, x - 6, y - 14, flip);
  }

  function drawActor(a) {
    const x = Math.round(a.x - cam.x), y = Math.round(a.y - cam.y);
    if (a.kind === 'cat') {
      const step = a.moving && Math.floor(t * 8) % 2;
      sprite(ctx, CAT, { K: '#4e4260', Y: '#f0d040' }, x - 4, y - 6, a.dir === 'left', step ? { 5: CAT_B } : null);
    } else if (a.kind === 'toad') {
      const hop = a.moving ? Math.round(Math.abs(Math.sin(t * 10)) * 3) : 0;
      px(ctx, x - 3, y - 1, 7, 1, 'rgba(0,0,0,0.25)');
      sprite(ctx, TOAD, { g: '#6a9a3a', E: '#3a2a3e', l: '#d8e8a0' }, x - 3, y - 5 - hop, a.dir === 'left',
        (t % 4) < 0.15 ? { 1: 'ggggggg' } : null);
    } else if (a.kind === 'owl') {
      sprite(ctx, OWL, { K: '#4e4260', b: '#8a6a4a', W: '#f0d890', E: '#3a2a3e', Y: '#e8a030', l: '#d8c0a0' }, x - 3, y - 8,
        false, (t % 3.7) < 0.15 ? OWL_BLINK : null);
    } else drawChar(a);
  }

  function drawFlyer(n) {
    const x = Math.round(n.x - cam.x), y = Math.round(n.y - cam.y + Math.sin(t * 2 + n.speed) * 2);
    if (n.kind === 'ghost') {
      ctx.globalAlpha = 0.7;
      sprite(ctx, GHOST, { G: '#eef0ff', E: '#2a2440', B: '#f8c0d0', o: '#2a2440' }, x - 4, y - 12, n.dir === 'left',
        { 9: Math.floor(t * 3) % 2 ? 'G.GG.GG.G' : '.GG.GG.GG' });
      ctx.globalAlpha = 1;
    }
  }

  function drawCandle(cx, cy, p) {
    const x = Math.round(cx * T - cam.x), y = Math.round(cy * T - cam.y + Math.sin(t * 1.5 + p) * 1.5);
    px(ctx, x, y, 3, 6, '#f4ecd8'); px(ctx, x + 2, y, 1, 6, '#d4c8aa');
    px(ctx, x + 1, y - 3, 1, 2, '#ffd46b');
    px(ctx, hash(Math.floor(t * 8), Math.floor(p * 10)) > 0.5 ? x : x + 2, y - 2, 1, 1, '#ff9a3c');
  }

  // Büyülü tavan: canlı gece gökyüzü, bulutlar, kayan yıldız ve sancaklar
  function drawSky() {
    const X0 = 11 * T - cam.x, Y0 = -cam.y, Wd = 13 * T, Hd = 2 * T;
    if (Y0 + Hd < 0 || X0 > VW || X0 + Wd < 0) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(X0, Y0, Wd, Hd); ctx.clip();
    px(ctx, X0, Y0, Wd, 11, '#26305e'); px(ctx, X0, Y0 + 11, Wd, 11, '#2e3b74'); px(ctx, X0, Y0 + 22, Wd, 10, '#38488a');
    for (const s of SKY_STARS) {
      const v = Math.sin(t * 2 + s.p);
      if (v > -0.4) px(ctx, X0 + s.x, Y0 + s.y, 1, 1, v > 0.6 ? '#ffffff' : '#9fb0e8');
    }
    disc(ctx, X0 + 176, Y0 + 9, 5, d => (d > 20 ? '#e8dcb0' : '#f6eed0'));
    for (let i = 0; i < 3; i++) {
      const cx = X0 + ((t * 5 + i * 95) % (Wd + 40)) - 20, cy = Y0 + 6 + i * 8;
      ctx.fillStyle = 'rgba(220,225,255,0.22)';
      ctx.fillRect(Math.round(cx), cy, 22, 4); ctx.fillRect(Math.round(cx) + 4, cy - 2, 12, 3);
    }
    const sp = (t % 7) / 0.8;
    if (sp < 1) for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = 1 - i * 0.18;
      px(ctx, X0 + 150 - sp * 40 + i * 2, Y0 + 4 + sp * 14 - i, 1, 1, '#ffffff');
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    for (const [col, house] of BANNERS) {
      const h = Scene.HOUSES[house], bx = col * T - cam.x + 4, by = Y0 + 14 + Math.round(Math.sin(t * 1.2 + col) * 0.6);
      px(ctx, bx - 1, by, 10, 1, '#d8b870');
      px(ctx, bx, by + 1, 8, 13, h.a);
      px(ctx, bx, by + 14, 3, 2, h.a); px(ctx, bx + 5, by + 14, 3, 2, h.a);
      px(ctx, bx + 2, by + 4, 4, 4, h.b); px(ctx, bx + 3, by + 8, 2, 1, h.b);
    }
  }

  function drawStair() {
    const sx = Math.round(stairCol() * T - cam.x), sy = 4 * T - cam.y;
    px(ctx, sx + 2, sy + 3 * T, 28, 4, 'rgba(0,0,0,0.5)');
    for (let i = 0; i < 6; i++) {
      px(ctx, sx + 2, sy + i * 8, 28, 8, i % 2 ? '#9a8a74' : '#a8987e');
      px(ctx, sx + 2, sy + i * 8, 28, 1, '#c0ae92');
      px(ctx, sx + 2, sy + i * 8 + 7, 28, 1, '#7a6a58');
    }
    px(ctx, sx, sy, 2, 3 * T, '#8a6446'); px(ctx, sx + 30, sy, 2, 3 * T, '#8a6446');
    for (let i = 0; i < 3; i++) { px(ctx, sx, sy + i * T + 2, 2, 2, '#d8b870'); px(ctx, sx + 30, sy + i * T + 2, 2, 2, '#d8b870'); }
    if (!stairFixed()) px(ctx, sx + 14 + Math.round(Math.sin(t * 20)), sy - 4, 4, 2, 'rgba(255,240,200,0.6)');
  }

  function drawPortrait(p) {
    const X = p.X - cam.x, Y = p.Y - cam.y;
    if (X < -T || X > VW || Y < -T || Y > VH) return;
    const near = Math.hypot(player.x - p.x, player.y - p.y - 10) < 48;
    const look = near ? Math.sign(Math.round((player.x - p.x) / 12)) : 0;
    const blink = (t + p.x) % 4 < 0.15;
    const bgCol = { knight: '#3a4a6a', lady: '#5a2a4a', sleepy: '#2a4a3a', captain: '#3a3a5a', fruit: '#4a3a2a' }[p.kind];
    px(ctx, X + 3, Y + 2, 10, 11, bgCol);
    const eyes = (ey, col = '#3a2a3e') => {
      if (blink) { px(ctx, X + 5 + look, ey + 1, 2, 1, col); px(ctx, X + 9 + look, ey + 1, 2, 1, col); return; }
      px(ctx, X + 6 + look, ey, 1, 2, col); px(ctx, X + 9 + look, ey, 1, 2, col);
    };
    if (p.kind === 'knight') {
      px(ctx, X + 4, Y + 3, 8, 9, '#a8b0c0'); px(ctx, X + 4, Y + 3, 8, 1, '#c8d0e0');
      px(ctx, X + 5, Y + 6, 6, 2, '#2a2a3a'); if (!blink) { px(ctx, X + 6 + look, Y + 6, 1, 1, '#ffe080'); px(ctx, X + 9 + look, Y + 6, 1, 1, '#ffe080'); }
      px(ctx, X + 7, Y + 1, 2, 2, '#c03a3a');
    } else if (p.kind === 'fruit') {
      px(ctx, X + 4, Y + 9, 8, 3, '#d8b870');
      disc(ctx, X + 6, Y + 7, 2, () => '#e04a4a'); disc(ctx, X + 10, Y + 7, 2, () => '#8ac04a'); disc(ctx, X + 8, Y + 5, 2, () => '#f0d040');
      if (near && !blink) { px(ctx, X + 7, Y + 5, 1, 1, '#3a2a3e'); px(ctx, X + 9, Y + 5, 1, 1, '#3a2a3e'); }
    } else {
      const skin = p.kind === 'captain' ? '#d8a080' : '#f2ccb0';
      px(ctx, X + 5, Y + 4, 6, 7, skin);
      if (p.kind === 'lady') { px(ctx, X + 4, Y + 3, 8, 2, '#7a4220'); px(ctx, X + 4, Y + 5, 1, 6, '#7a4220'); px(ctx, X + 11, Y + 5, 1, 6, '#7a4220'); px(ctx, X + 4, Y + 11, 8, 2, '#c86a9a'); }
      if (p.kind === 'sleepy') { px(ctx, X + 4, Y + 2, 8, 2, '#c03a3a'); px(ctx, X + 11, Y + 4, 2, 2, '#ffffff'); }
      if (p.kind === 'captain') { px(ctx, X + 3, Y + 2, 10, 2, '#1a1a24'); px(ctx, X + 5, Y + 9, 6, 2, '#6a4a2a'); }
      if (p.kind === 'sleepy' && !near) { px(ctx, X + 6, Y + 7, 2, 1, '#3a2a3e'); px(ctx, X + 9, Y + 7, 2, 1, '#3a2a3e'); }
      else eyes(Y + 6);
      px(ctx, X + 5, Y + 8, 1, 1, '#f0a0a8'); px(ctx, X + 10, Y + 8, 1, 1, '#f0a0a8');
    }
  }

  function drawDynamic() {
    // Şömine ateşi
    for (const [x, y] of fireplaces) {
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      for (let i = 0; i < 5; i++) {
        const h = 3 + Math.round(Math.abs(Math.sin(t * 7 + i * 1.9)) * 4);
        px(ctx, X + 2 + i * 2, Y + 15 - h, 2, h, i % 2 ? '#ffb050' : '#ff8a3c');
        px(ctx, X + 2 + i * 2, Y + 15 - Math.ceil(h / 2), 2, 1, '#ffe08a');
      }
      px(ctx, X + 1, Y + 14, 14, 2, '#7a5238');
    }
    // Şamdan ve fener alevleri
    for (const [x, y, kind] of flames) {
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      const f = hash(Math.floor(t * 8), x * 7 + y) > 0.5;
      if (kind === 'Y') for (const [fx, fy] of [[3, 2], [7, 1], [11, 2]]) { px(ctx, X + fx + (f ? 0 : 1), Y + fy, 1, 2, '#ffd46b'); }
      else px(ctx, X + 7, Y + 2 + (f ? 0 : 1), 2, 2, '#ffd46b');
    }
    // Meşaleler
    for (const tc of torches) {
      const X = tc.X - cam.x, Y = tc.Y - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      ctx.fillStyle = 'rgba(255,170,80,0.12)'; ctx.fillRect(X - 2, Y - 2, 20, 20);
      const f = hash(Math.floor(t * 9), tc.X) > 0.5;
      px(ctx, X + 7, Y + 3, 2, 3, '#ffd46b'); px(ctx, f ? X + 6 : X + 9, Y + 4, 1, 2, '#ff9a3c'); if (f) px(ctx, X + 7, Y + 2, 1, 1, '#fff2b0');
    }
    // Kazanlar fokurdar
    for (const k of cauldrons) {
      const X = k.X - cam.x, Y = k.Y - cam.y;
      if (X < -T || X > VW || Y < -2 * T || Y > VH) continue;
      px(ctx, X + 4, Y + 5, 8, 2, k.col);
      for (let i = 0; i < 3; i++) {
        const q = (t * 0.6 + i / 3 + k.X) % 1;
        ctx.globalAlpha = 1 - q;
        px(ctx, X + 5 + i * 3 + Math.round(Math.sin(t * 3 + i)), Y + 4 - q * 12, 2, 2, k.col);
      }
      ctx.globalAlpha = 1;
    }
    // Tüneklerde baykuşlar
    for (const o of perches) {
      const X = o.X - cam.x, Y = o.Y - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      sprite(ctx, OWL, { K: '#4e4260', b: o.col, W: '#f0d890', E: '#3a2a3e', Y: '#e8a030', l: '#e8d8c0' }, X + 4, Y + 2,
        Math.sin(t * 0.5 + o.p) > 0.6, (t + o.p) % 3.3 < 0.15 ? OWL_BLINK : null);
    }
    // Çığlık kökleri
    for (const r of roots) {
      if (t > r.pop) continue;
      const X = r.X - cam.x, Y = r.Y - cam.y, shake = Math.round(Math.sin(t * 40));
      px(ctx, X + 4 + shake, Y - 1, 8, 7, '#e8c8a0'); px(ctx, X + 5 + shake, Y + 1, 1, 1, '#3a2a3e'); px(ctx, X + 10 + shake, Y + 1, 1, 1, '#3a2a3e');
      px(ctx, X + 6 + shake, Y + 3, 4, 2, '#5a1a1a'); px(ctx, X + 6 + shake, Y - 3, 4, 2, '#4a9a4a');
    }
    // Çeşme
    if (fountain) {
      for (let i = 0; i < 6; i++) {
        const k = (t * 0.8 + i / 6) % 1, a = i * 1.05;
        px(ctx, fountain.x - cam.x + Math.cos(a) * (3 + k * 9), fountain.y - cam.y - 6 + Math.sin(a) * (2 + k * 7) + k * 6, 1, 1, '#c8e4ff');
      }
      px(ctx, fountain.x - cam.x - 1, fountain.y - cam.y - 10 - (Math.floor(t * 6) % 2), 2, 2, '#e0f0ff');
    }
  }

  function drawQuestMarks() {
    for (const n of NPCS) {
      const q = questOf(n);
      if (!q) continue;
      const ready = isDone(q);
      const x = Math.round(n.x - cam.x), y = Math.round(n.y - cam.y) - 24 - (Math.floor(t * 2) % 2);
      if (x < -8 || x > VW + 8 || y < -8 || y > VH) continue;
      px(ctx, x - 3, y - 1, 7, 9, '#4a3a4e'); px(ctx, x - 2, y, 5, 7, ready ? '#f2d27a' : '#f4eee4');
      const col = ready ? '#8a4a2a' : '#6a5a8a';
      if (ready) { px(ctx, x, y + 1, 1, 3, col); px(ctx, x, y + 5, 1, 1, col); }
      else { px(ctx, x - 1, y + 1, 2, 1, col); px(ctx, x + 1, y + 2, 1, 1, col); px(ctx, x, y + 3, 1, 1, col); px(ctx, x, y + 5, 1, 1, col); }
    }
  }

  function drawMailOwl() {
    const m = mailOwl;
    if (!m) return;
    const x = Math.round(m.x - cam.x), y = Math.round(m.y - cam.y), up = Math.floor(t * 10) % 2;
    sprite(ctx, OWL, { K: '#4e4260', b: '#8a6a4a', W: '#f0d890', E: '#3a2a3e', Y: '#e8a030', l: '#d8c0a0' }, x - 3, y - 4, m.x > player.x + 10);
    px(ctx, x - 7, y - 2 + (up ? -2 : 1), 4, 3, '#7a5a3a'); px(ctx, x + 4, y - 2 + (up ? -2 : 1), 4, 3, '#7a5a3a');
    px(ctx, x - 1, y + 4, 4, 3, '#f6eed8'); px(ctx, x, y + 5, 2, 1, '#c03a3a');
  }

  function draw() {
    ctx.drawImage(bg, cam.x, cam.y, VW, VH, 0, 0, VW, VH);
    drawSky();
    drawStair();
    for (const p of portraits) drawPortrait(p);
    drawDynamic();
    const actors = [...NPCS.filter(n => !FREE_FLYERS.has(n.kind)), player].sort((a, b) => a.y - b.y);
    for (const a of actors) drawActor(a);
    if (player.seated && Math.sin(t * 5) > 0.3) px(ctx, Math.round(player.x - cam.x + 5), Math.round(player.y - cam.y - 2), 1, 1, '#ffe9a0');
    for (const n of NPCS) if (n.seat && Math.sin(t * 5 + n.x) > 0.3) px(ctx, Math.round(n.x - cam.x + 5), Math.round(n.y - cam.y - 2), 1, 1, '#ffe9a0');
    CANDLES.forEach(([cx, cy], i) => drawCandle(cx, cy, i * 1.3));
    NPCS.filter(n => FREE_FLYERS.has(n.kind)).forEach(drawFlyer);
    drawQuestMarks();
    drawMailOwl();
    drawLighting();
    drawOverlays();
  }

  // ---------- Işıklandırma ----------
  // Önce her yeri hafif gece rengiyle örter, sonra ışık kaynaklarının çevresini açar ve renkli parıltı ekler.
  // Düşük çözünürlükte çizildiği için büyütülünce yumuşak, pikselli halkalar oluşur.
  let LIGHTS = null; // çeşme konumu buildBg sonrası belli olduğu için ilk çizimde kurulur
  const buildLights = () => [
    ...torches.map(tc => ({ x: tc.X + 8, y: tc.Y + 12, r: 46, a: 0.95, col: '255,170,90', glow: 0.22, flick: 1 })),
    ...CANDLES.map(([cx, cy], i) => ({ x: cx * T + 1, y: cy * T - 2, r: 28, a: 0.7, col: '255,200,120', glow: 0.14, flick: 0.5, bob: i * 1.3 })),
    ...tilesOf('W').map(([x, y]) => ({ x: x * T + 8, y: y * T + 22, r: 30, a: 0.55, col: '150,180,255', glow: 0.12 })),
    ...cauldrons.map(k => ({ x: k.X + 8, y: k.Y + 6, r: 26, a: 0.6, col: k.col === '#7ae07a' ? '120,230,120' : k.col === '#c07ae0' ? '200,130,240' : k.col === '#f0a040' ? '250,170,70' : '110,200,250', glow: 0.18, flick: 0.6 })),
    ...(fountain ? [{ x: fountain.x, y: fountain.y, r: 34, a: 0.6, col: '150,210,255', glow: 0.12 }] : []),
    ...fireplaces.map(([x, y]) => ({ x: x * T + 8, y: y * T + 18, r: 44, a: 0.85, col: '255,150,70', glow: 0.2, flick: 1.4 })),
    ...flames.map(([x, y, k]) => ({ x: x * T + 8, y: y * T + 4, r: k === 'Y' ? 34 : 40, a: 0.8, col: '255,200,120', glow: 0.16, flick: 0.7 })),
  ];
  const AMBIENT = 'rgba(30,22,58,0.40)';
  let lightCv, lc;

  function drawLighting() {
    if (!lightCv) { lightCv = document.createElement('canvas'); lightCv.width = VW; lightCv.height = VH; lc = lightCv.getContext('2d'); }
    if (!LIGHTS) LIGHTS = buildLights();
    const live = [...LIGHTS, { x: player.x, y: player.y - 8, r: 40, a: 0.55, col: '255,230,200', glow: 0 }];
    // Büyülü tavan da salona hafif bir ışık verir
    live.push({ x: 17.5 * T, y: 1 * T, r: 110, a: 0.35, col: '160,170,255', glow: 0.05 });
    lc.globalCompositeOperation = 'source-over';
    lc.clearRect(0, 0, VW, VH);
    lc.fillStyle = AMBIENT;
    lc.fillRect(0, 0, VW, VH);
    lc.globalCompositeOperation = 'destination-out';
    const vis = [];
    for (const L of live) {
      const f = L.flick ? 1 + Math.sin(t * 9 + L.x) * 0.04 * L.flick + Math.sin(t * 23 + L.y) * 0.03 * L.flick : 1;
      const x = L.x - cam.x, y = L.y - cam.y + (L.bob !== undefined ? Math.sin(t * 1.5 + L.bob) * 1.5 : 0), r = L.r * f;
      if (x < -r || x > VW + r || y < -r || y > VH + r) continue;
      vis.push({ ...L, x, y, r });
      const g = lc.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${L.a})`); g.addColorStop(0.55, `rgba(0,0,0,${L.a * 0.55})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      lc.fillStyle = g;
      lc.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.drawImage(lightCv, 0, 0);
    // Renkli parıltı (ekranı aydınlatarak karışır)
    ctx.globalCompositeOperation = 'screen';
    for (const L of vis) {
      if (!L.glow) continue;
      const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r * 0.8);
      g.addColorStop(0, `rgba(${L.col},${L.glow})`); g.addColorStop(1, `rgba(${L.col},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function placeAt(el, x, y) {
    el.style.left = ((x - cam.x) / VW * 100) + '%';
    el.style.top = ((y - cam.y) / VH * 100) + '%';
  }
  function drawOverlays() {
    const b = document.getElementById('mapBubble'), hint = document.getElementById('mapHint');
    if (bubble) {
      b.hidden = false;
      b.querySelector('b').textContent = bubble.name;
      b.querySelector('span').textContent = bubble.text;
      const bx = Math.max(cam.x + VW * 0.2, Math.min(cam.x + VW * 0.8, bubble.anchor.x));
      const by = Math.max(cam.y + 22, bubble.anchor.y - (bubble.anchor === player || NPCS.includes(bubble.anchor) ? 20 : 0));
      placeAt(b, bx, by);
    } else b.hidden = true;
    const npc = !bubble && !player.seated && nearestNpc();
    const pic = !bubble && !player.seated && !npc && nearPortrait();
    hint.hidden = !npc && !pic;
    if (npc) placeAt(hint, npc.x, npc.y - 20);
    else if (pic) placeAt(hint, pic.x, pic.Y + 2);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!visible) return;
    t += dt;
    if (Math.floor(t) !== Math.floor(t - dt)) renderQuests();
    update(dt);
    draw();
  }

  // ---------- Girdi ----------
  const typing = e => e.target.closest?.('input, textarea, select, dialog[open] form');
  function onKey(e, down) {
    if (!visible || typing(e)) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    if (down) keys.add(e.code); else keys.delete(e.code);
    if (down && e.code === 'KeyE' && !e.repeat) {
      const root = roots.find(r => Math.hypot(player.x - r.x, player.y - r.y) < 24);
      if (root) return waterRoot(root);
      const n = nearestNpc();
      if (n) talk(n);
      else { const p = nearPortrait(); if (p) talkPortrait(p); }
    }
  }

  function onClick(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width * VW + cam.x, my = (e.clientY - r.top) / r.height * VH + cam.y;
    const hit = NPCS.find(n => Math.abs(n.x - mx) < 8 && my > n.y - 17 && my < n.y + 3);
    if (hit) {
      if (Math.hypot(hit.x - player.x, hit.y - player.y) < 30 || player.seated || FREE_FLYERS.has(hit.kind)) return talk(hit);
      if (player.toSeat) return;
      const [tx, ty] = tileOf(hit);
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const p = findPath(...tileOf(player), tx + dx, ty + dy);
        if (p) { player.path = p; player.pendingTalk = hit; return; }
      }
      return;
    }
    const pic = portraits.find(p => mx >= p.X && mx < p.X + T && my >= p.Y && my < p.Y + T);
    if (pic) return Math.hypot(player.x - pic.x, player.y - pic.y - 10) < 40 ? talkPortrait(pic) : toast('Portreyle konuşmak için yanına git.');
    const root = roots.find(r => Math.abs(r.x - mx) < 8 && Math.abs(r.y - my) < 10);
    if (root && Math.hypot(player.x - root.x, player.y - root.y) < 30) return waterRoot(root);
    if (player.seated || player.toSeat) return toast('Odak bitince gezebilirsin!');
    const tx = Math.floor(mx / T), ty = Math.floor(my / T);
    const p = walkable(tx, ty) && findPath(...tileOf(player), tx, ty);
    if (p) { player.path = p; player.pendingTalk = null; }
    else if (at(tx, ty) === 'v') toast('Merdivenin yerine oturmasını bekle!');
  }

  function init(canvas) {
    ctx = canvas.getContext('2d');
    buildBg();
    canvas.addEventListener('click', onClick);
    addEventListener('keydown', e => onKey(e, true));
    addEventListener('keyup', e => onKey(e, false));
    addEventListener('blur', () => keys.clear());
    requestAnimationFrame(frame);
  }

  return {
    init,
    show(v) {
      visible = v;
      if (!v) {
        keys.clear(); bubble = null;
        document.getElementById('mapBubble').hidden = true;
        document.getElementById('mapHint').hidden = true;
        return;
      }
      renderQuests();
      if (pendingMail) { const m = pendingMail; pendingMail = null; setTimeout(() => sendMail(m), 600); }
    },
    mail: sendMail,
    // Odak oturumu bitti: oturduğun yere göre görev sayacı (haritayı hiç açmadıysan kütüphane sayılır)
    onSession(withTask) {
      const room = player.seated ? roomOf(...tileOf(player)) : 'lib';
      if (room === 'lib' || room === 'hall') bump(room);
      if (withTask) bump('taskSess');
      renderQuests();
    },
    onTaskDone(text) {
      bump('tasks');
      sendMail(`"${text}" görevini tamamladın! Haberini kaleye uçurdum.`);
    },
    refresh: renderQuests,
  };
})();
