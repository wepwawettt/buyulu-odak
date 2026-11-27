// Kale haritası: yukarıdan bakışlı küçük bir piksel büyücü okulu.
// Molada serbestçe gezilir; odak başlayınca karakter kütüphanede bir masaya yürüyüp oturur.
// app.js'teki global durumu (data, mode, running, today, toast) ve scene.js'teki renkleri (Scene.*) kullanır.
const Castle = (() => {
  const T = 16;                // karo boyu (piksel)
  const VW = 213, VH = 160;    // görünen alan (640px genişlikte ~3x piksel ölçeği)
  const MW = 51, MH = 31, NORTH = 0; // NORTH: 0. satırın üstüne eklenen kuzey kanadı satırları (y = -14 … -1)      // harita (karo); 34. sütundan sonrası doğu kanadı, 43'ten sonrası Kehanet Kulesi, 21. satırdan sonra okul bahçesi

  // ---------- Harita ----------
  // Duvarlar: '#' taş  'W' pencere  'P' portre  'i' meşale  'G' sera camı  'S' büyülü tavan
  // Zeminler: '.' taş  ',' ahşap  'r' halı  'g' çimen  'f' çiçek  'p' patika  'D' kapı  'q' zindan  'y' sera
  // Eşyalar (geçilmez): 'B' kitaplık  'd' masa  'T' uzun masa  'H' baş masa  'F' çeşme  't' ağaç
  //   'o' baykuş tüneği  'c' kazan  'J' kavanoz rafı  'L' saksı sırası  'm' çığlık kökü  'v' boşluk (merdiven)
  const grid = Array.from({ length: MH + NORTH }, () => Array(MW).fill('#'));
  const fill = (x0, y0, x1, y1, ch) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y + NORTH][x] = ch;
  };
  const put = (list, ch) => list.forEach(([x, y]) => (grid[y + NORTH][x] = ch));

  // Yeni dekor: 'k' sandalye  'u' halı  'K' küre  'Y' şamdan  'V' şömine  'A' zırh  'n' saksı
  //   'x' fıçı  'z' bank  'e' çit  'l' fener
  // Kütüphane (sol üst)
  fill(1, 2, 9, 8, ',');
  fill(1, 2, 3, 2, 'B'); fill(6, 2, 9, 2, 'B'); fill(1, 6, 1, 8, 'B'); fill(9, 6, 9, 8, 'B');
  fill(4, 1, 5, 1, 'V');
  fill(4, 2, 5, 8, 'u'); // şömineden kapıya uzanan halı
  put([[2, 4], [3, 4], [6, 4], [7, 4], [2, 7], [3, 7], [6, 7], [7, 7]], 'd');
  put([[2, 5], [3, 5], [6, 5], [7, 5], [2, 8], [3, 8], [6, 8], [7, 8]], 'k');
  put([[8, 3]], 'K'); put([[9, 4]], 'Y'); put([[1, 4]], 'n');
  put([[2, 1], [8, 1]], 'W');
  // Büyük Salon ve büyülü tavanı (orta üst): masa sütunları ve her masanın bina rengi
  const HALL_TABLES = [12, 15, 19, 22];
  const HALL_HOUSE = { 12: 'kizil', 15: 'zumrut', 19: 'safir', 22: 'kehribar' };
  fill(11, 0, 23, 1, 'S');
  //   'a' öğretmen kürsüsü (ahşap)  'h' müdürün koltuğu  'j' bank (oturulur)  'w' altın baykuşlu kürsü
  fill(11, 2, 23, 8, '.');
  fill(13, 2, 21, 2, 'a'); put([[17, 2]], 'h');
  fill(13, 3, 21, 3, 'H');
  put([[12, 2], [22, 2]], 'Y');
  //   'E' bina kum saati (haftalık odak puanı)
  const GLASSES = [[11, 2, 'kizil'], [11, 3, 'zumrut'], [23, 2, 'safir'], [23, 3, 'kehribar']];
  for (const [x, y] of GLASSES) put([[x, y]], 'E');
  fill(17, 4, 17, 8, 'r'); put([[17, 4]], 'w');
  for (const x of HALL_TABLES) { fill(x, 5, x, 8, 'T'); fill(x - 1, 5, x - 1, 8, 'j'); fill(x + 1, 5, x + 1, 8, 'j'); }
  // Kule: tepede baykuşhane, ortada hareketli merdivenler (sağ üst)
  fill(25, 2, 32, 3, '.');
  put([[26, 2], [28, 2], [30, 2], [32, 2]], 'o');
  fill(25, 4, 32, 6, 'v');
  fill(25, 7, 32, 8, '.');
  put([[27, 1], [30, 1]], 'W'); put([[32, 8]], 'x'); put([[25, 8]], 'n');
  // Koridor
  fill(1, 10, 32, 11, '.');
  fill(2, 10, 31, 11, 'r');
  put([[1, 10]], 'n');
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
  // Avlu (orta alt): 16. sütun ekseninde tam simetrik
  fill(10, 13, 22, 19, 'g');
  fill(15, 13, 17, 14, 'p');                 // koridordan meydana
  fill(13, 15, 19, 18, 'p');                 // meydan
  fill(15, 15, 17, 17, 'F');                 // büyük çeşme (3x3)
  fill(15, 19, 17, 19, 'p');                 // çeşmeden bahçe kapısına
  put([[10, 13], [12, 13], [20, 13], [22, 13], [10, 19], [12, 19], [20, 19], [22, 19]], 'e'); // kesilmiş yuvarlak çalılar
  put([[12, 16], [20, 16]], 'z');
  put([[13, 14], [19, 14]], 'l');
  //   '@' büyülü bitki yatağı  '[' taş grifon heykeli
  fill(10, 16, 11, 18, '@'); fill(21, 16, 22, 18, '@'); put([[11, 15], [21, 15]], '['); // karşılıklı
  // Sera (sağ alt)
  fill(23, 13, 23, 20, 'G'); fill(33, 13, 33, 20, 'G'); fill(23, 20, 33, 20, 'G');
  fill(24, 13, 32, 19, 'y');
  fill(24, 14, 26, 14, 'L'); fill(29, 14, 31, 14, 'L'); fill(24, 17, 26, 17, 'L'); fill(29, 17, 31, 17, 'L');
  put([[24, 19], [26, 19], [30, 19], [32, 19]], 'm');
  put([[32, 14]], 'x'); put([[32, 16]], 'n');
  // Doğu kanadı: koridor sağa uzar. 'Q' Gözlemevi kapısı (3. Sınıf), 'U' Gizli Kütüphane kapısı (6. Sınıf)
  //   'X' teleskop  'O' kürsüde eski kitap
  fill(32, 10, 48, 11, 'r'); fill(49, 10, 49, 11, '.'); put([[49, 10]], 'n');
  // Kehanet Kulesi (en doğu): 's' mor tahta zemin  '(' kristal küreli yuvarlak masa  ')' minder
  fill(43, 2, 49, 8, 's');
  put([[44, 1], [48, 1]], 'W'); fill(45, 9, 46, 9, 'D');
  fill(45, 4, 47, 6, 'u');
  put([[46, 2], [44, 4], [48, 4], [44, 7], [48, 7]], '(');
  put([[44, 5], [48, 5], [44, 8], [48, 8], [45, 2], [47, 2]], ')');
  put([[43, 2], [49, 2]], 'J'); put([[43, 8], [49, 8]], 'Y'); put([[43, 5]], 'n');
  put([[43, 9]], 'i');
  // Kupa Odası (Kehanet Kulesi'nin altı): '!' kupa dolabı (kazandığın rozetler)  '?' büyük bina kupası  '|' rekor tahtası
  fill(43, 13, 49, 19, ',');
  put([[46, 12]], 'D');
  const CABINETS = [[44, 13], [45, 13], [47, 13], [48, 13], [43, 15], [43, 17], [49, 15], [49, 17]];
  put(CABINETS, '!');
  put([[46, 17]], '?'); put([[46, 19]], '|');
  put([[43, 13], [49, 13]], 'A'); put([[43, 19], [49, 19]], 'Y'); put([[44, 19], [48, 19]], 'n');
  put([[35, 9], [40, 9], [35, 12], [40, 12]], 'i');
  fill(37, 9, 38, 9, 'Q'); fill(37, 12, 38, 12, 'U');
  // Gözlemevi (sağ üst)
  fill(34, 2, 41, 8, '.');
  put([[35, 1], [38, 1], [41, 1]], 'W');
  fill(36, 4, 39, 6, 'u');
  put([[40, 3]], 'X'); put([[34, 3]], 'K'); put([[34, 8], [41, 8]], 'Y'); put([[41, 5]], 'B');
  // Gizli Kütüphane (sağ alt)
  fill(34, 13, 41, 19, ',');
  fill(34, 13, 36, 13, 'B'); fill(39, 13, 41, 13, 'B'); fill(34, 15, 34, 19, 'B'); fill(41, 15, 41, 19, 'B');
  put([[37, 16]], 'O'); put([[36, 18], [39, 18]], 'd'); put([[36, 19], [39, 19]], 'k'); put([[38, 19]], 'Y');

  // Okul bahçesi (kalenin güneyi, avludan kapıyla çıkılır)
  //   'b' göl  '$' nilüfer  '%' saz  '_' toprak patika  '~' sürülmüş tarla  'N' balkabağı  '=' çit  '&' korkuluk
  //   'C' bahçıvan kulübesi  '+' yön tabelası  '*' çiçekli ağaç  '^' çam  'I' uçuş sahası  'M' halka  'Z' orman
  fill(1, 21, MW - 2, 29, 'g');
  fill(0, 21, 0, 30, 'Z'); fill(MW - 1, 21, MW - 1, 30, 'Z'); fill(0, 30, MW - 1, 30, 'Z');
  for (const x of [1, 10, 11, 41, 44, 48, 49]) put([[x, 29]], 'Z');
  fill(42, 21, MW - 1, 30, 'Z'); // bahçe uçuş sahasının doğusunda ormanla biter
  fill(15, 20, 17, 20, 'D');
  // Kıvrımlı toprak patikalar: kapıdan göle, tarlaya, kulübeye ve sahaya
  put([[16, 21], [16, 22], [16, 23], [15, 23], [14, 23], [13, 23], [12, 24], [11, 24], [10, 24], [9, 24], [8, 24], [7, 24],
    [17, 23], [18, 23], [19, 23], [20, 24], [16, 24], [23, 25], [23, 26], [23, 27], [22, 27], [21, 27]], '_');
  fill(21, 24, 37, 24, '_');
  // Yuvarlak göl, iskele, nilüferler ve sazlar
  for (const [y, x0, x1] of [[24, 3, 6], [25, 2, 9], [26, 2, 9], [27, 2, 9], [28, 3, 8]]) fill(x0, y, x1, y, 'b');
  fill(7, 24, 7, 27, ','); // iskele kıyıdaki ahşap başlıktan suya uzanır
  put([[9, 27], [3, 25], [6, 28], [2, 26]], '$');
  fill(3, 26, 4, 27, 'g'); put([[3, 26]], '*'); put([[4, 27]], 'f'); // gölün ortasında çiçekli ağaçlı küçük ada
  put([[10, 25], [10, 26], [9, 28], [2, 24], [7, 29], [2, 28], [10, 27]], '%');
  // Balkabağı tarlası: çitle çevrili sürülmüş toprak, ortada korkuluk
  fill(12, 25, 20, 25, '='); fill(12, 26, 12, 28, '='); fill(20, 26, 20, 28, '='); put([[16, 25]], '_');
  fill(13, 26, 19, 28, '~');
  put([[13, 26], [15, 26], [18, 26], [14, 28], [17, 28], [19, 27], [13, 28]], 'N');
  put([[16, 27]], '&');
  // Kulübe
  fill(21, 25, 22, 26, 'C');
  put([[21, 28], [22, 28]], 'f');
  // Uçuş sahası, halkalar ve seyirci kuleleri
  fill(25, 25, 40, 29, 'I');
  put([[25, 26], [25, 27], [25, 28], [40, 26], [40, 27], [40, 28]], 'M');
  //   'R' bina renginde seyirci kulesi
  const TOWERS = [[27, 'kizil'], [31, 'zumrut'], [35, 'safir'], [39, 'kehribar']];
  for (const [x] of TOWERS) put([[x, 23]], 'R');
  for (const x of [29, 37]) put([[x, 23]], 'z');
  // Ağaçlar, fenerler, çiçekler, tabela
  put([[3, 22], [11, 22], [22, 22]], '*');
  put([[1, 22], [25, 22], [41, 22], [24, 28], [41, 26]], '^');
  put([[19, 22]], 't');
  put([[15, 22], [17, 22], [8, 23], [33, 23]], 'l');
  put([[14, 21], [18, 21], [26, 23], [4, 23]], 'e');
  put([[6, 22], [26, 22], [10, 22], [36, 21], [2, 23], [19, 22], [24, 23]], 'f');
  put([[18, 22]], '+');

  const SOLID = new Set(['@', '[', '5', '6', '7', '!', '?', '|', '(', '$', '=', '&', '+', '*', '^', 'E', 'R', 'b', 'M', 'N', 'C', 'Z', '#', 'W', 'P', 'i', 'V', 'G', 'S', 'B', 'd', 'T', 'H', 'h', 'w', 'F', 't', 'o', 'c', 'J', 'L', 'm', 'K', 'Y', 'A', 'n', 'x', 'z', 'e', 'l', 'X', 'O']);
  const LOCKS = { Q: { name: 'Gözlemevi', open: () => Levels.observatory(), lv: () => Levels.OBSERVATORY },
    U: { name: 'Gizli Kütüphane', open: () => Levels.library(), lv: () => Levels.LIBRARY } };
  const isWall = ch => ch === '#' || ch === 'W' || ch === 'P' || ch === 'i' || ch === 'V';
  // Eşyanın altındaki zemin, bulunduğu bölgeye göre
  const region = (x, y) => (y < 0 ? (x >= 12 && x <= 21 && y >= -11 && y <= -4 ? 'g' : x >= 34 && x <= 41 ? ',' : '.') : y >= 21 ? 'g' : x >= 43 && y <= 8 ? 's' : x >= 43 && y >= 13 ? ',' : y <= 8 && x >= 11 && x <= 23 ? '.' : x >= 34 ? (y >= 13 ? ',' : '.') : y >= 13 ? (x <= 8 ? 'q' : x <= 22 ? 'g' : 'y') : y <= 8 && x <= 9 ? ',' : '.');
  const at = (x, y) => (x < 0 || y < -NORTH || x >= MW || y >= MH ? '#' : grid[y + NORTH][x]);
  const tilesOf = ch => grid.flatMap((row, y) => row.map((c, x) => (c === ch ? [x, y - NORTH] : null)).filter(Boolean));

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
    if (LOCKS[ch]) return LOCKS[ch].open(); // sınıfı gelene kadar kilitli
    return !SOLID.has(ch);
  }

  // Kütüphanedeki çalışma sandalyeleri (masanın hemen altı); Rose hep (7,8)'de oturur
  const SEATS = [[2, 5], [3, 5], [6, 5], [7, 5], [2, 8], [3, 8], [6, 8]];
  for (const x of HALL_TABLES) for (let y = 5; y <= 8; y++) SEATS.push([x - 1, y, 'right'], [x + 1, y, 'left']);
  SEATS.push([44, 5], [48, 5], [44, 8], [48, 8]); // Kehanet Kulesi minderleri
  // Oturunca karakter masaya doğru kayar
  const SEAT_OFF = { up: [0, -7], right: [4, -3], left: [-4, -3] };
  const seatOff = s => SEAT_OFF[s[2] || 'up'];
  const CANDLES = [[12.3, 4.2], [14.2, 5.4], [16.2, 4.4], [18.1, 4.6], [19.8, 5.6], [22.3, 4.4], [13.6, 7.8], [20.6, 7.9],
    [16.4, 6.6], [18.4, 7.2], [11.6, 6.3], [23.4, 6.5], [15.2, 3.4], [21, 3.3], [13.5, 2.6], [20.4, 2.4]];
  const BANNERS = HALL_TABLES.map(x => [x, HALL_HOUSE[x]]);

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
    else if (r === 's') { px(c, X, Y, T, T, '#5a3a62'); for (let k = 0; k < 4; k++) px(c, X, Y + k * 4 + 3, T, 1, '#4a2e52'); }
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
  // Taş zeminde küçük ayrıntılar: çatlak, yosun, düşmüş parşömen ya da tüy
  function floorBits(c, X, Y, x, y) {
    const h = hash(x * 5 + 3, y * 7 + 1), ox = 2 + Math.floor(hash(y, x * 3) * 9), oy = 2 + Math.floor(hash(x * 2, y) * 9);
    if (h > 0.95) { px(c, X + ox, Y + oy, 5, 4, '#efe3b8'); px(c, X + ox + 1, Y + oy + 1, 3, 1, '#b8ac88'); px(c, X + ox + 4, Y + oy, 1, 4, '#d8cca0'); }
    else if (h > 0.91) { px(c, X + ox, Y + oy, 1, 3, '#4e4658'); px(c, X + ox + 1, Y + oy + 3, 3, 1, '#4e4658'); px(c, X + ox + 4, Y + oy + 4, 1, 2, '#4e4658'); }
    else if (h > 0.88) { px(c, X + ox, Y + oy, 4, 2, '#6a8a5a'); px(c, X + ox + 1, Y + oy + 2, 2, 1, '#5a7a4a'); }
    else if (h > 0.86) { px(c, X + ox, Y + oy + 2, 4, 1, '#f3ead2'); px(c, X + ox + 3, Y + oy + 1, 2, 1, '#f3ead2'); px(c, X + ox + 4, Y + oy, 1, 1, '#cfc4a8'); }
  }
  // Yaprak kümelerinden oluşan gölgeli ağaç tepesi: sol üstten ışık, koyu dış hat, hafif doku
  function canopy(c, X, Y, blobs, pal, seed, shine = false) {
    const [line, dark, mid, light, hi] = pal;
    for (const [bx, by, r] of blobs) for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
      if (dx * dx + dy * dy <= (r + 1) * (r + 1) - 1) px(c, X + bx + dx, Y + by + dy, 1, 1, line);
    }
    for (const [bx, by, r] of blobs) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const n = (-dx * 0.75 - dy) / r; // sol üstten gelen ışık
      px(c, X + bx + dx, Y + by + dy, 1, 1, n > 0.8 ? hi : n > 0.2 ? light : n > -0.55 ? mid : dark);
    }
    for (const [bx, by, r] of blobs) { // büyük kümelerde tek bir yumuşak yaprak kıvrımı (‿)
      if (r < 5) continue;
      const ox = X + bx + 1 + Math.round((hash(seed + bx, by) - 0.3) * 2), oy = Y + by + 1 + Math.round(hash(by, seed + bx) * 2);
      px(c, ox - 1, oy, 1, 1, mid); px(c, ox, oy + 1, 1, 1, mid); px(c, ox + 1, oy, 1, 1, mid);
    }
    if (!shine) return;
    const top = blobs.reduce((a, b) => (b[1] - b[2] < a[1] - a[2] ? b : a)); // en üstteki küme
    const sx = X + top[0] - Math.ceil(top[2] / 2), sy = Y + top[1] - Math.ceil(top[2] / 2);
    px(c, sx, sy + 1, 1, 2, '#ffffff'); px(c, sx + 1, sy, 2, 1, '#ffffff'); px(c, sx + 1, sy + 1, 1, 1, hi); // parlak parıltı
  }
  function trunk(c, X, Y, h) { // (çalılar ve saksılar için kısa gövde)
    const t0 = Y + 16 - h;
    px(c, X + 5, t0, 6, h, '#3a2a1e'); px(c, X + 6, t0, 4, h, '#5e4430'); px(c, X + 6, t0, 1, h, '#7a5a40');
  }
  const LEAF = ['#2e5a36', '#3e7444', '#558e52', '#74a864', '#9cc27e'];
  const OAK = ['#16281c', '#223e2a', '#2f5536', '#436e44', '#62885a'];
  const FIR = ['#101e18', '#182c22', '#22402e', '#30543a', '#4a6e50'];
  const WILLOW = ['#1e3424', '#2e4a32', '#40623e', '#5a7c50', '#7e9a68'];
  // Gölgeli, yosunlu, köklü, kalın gövde ve tepeye uzanan iki çatallı dal
  function oldTrunk(c, X, Y, top) {
    const L = '#2a1e16', B = '#4e3a2a', H = '#6e5640', S = '#3a2a1e', MOSS = '#4a6a3a';
    for (let yy = top; yy <= 15; yy++) { // aşağıda kalın, yukarıda incelir
      const w = yy > 12 ? 6 : yy > 6 ? 5 : 4, x0 = 8 - Math.ceil(w / 2);
      px(c, X + x0 - 1, Y + yy, w + 2, 1, L); px(c, X + x0, Y + yy, w, 1, B); px(c, X + x0, Y + yy, 1, 1, H); px(c, X + x0 + w - 1, Y + yy, 1, 1, S);
    }
    px(c, X + 2, Y + 14, 3, 2, L); px(c, X + 3, Y + 14, 2, 1, B); px(c, X + 11, Y + 14, 3, 2, L); px(c, X + 11, Y + 14, 2, 1, B); // kökler
    px(c, X + 5, Y + 11, 2, 2, MOSS); px(c, X + 6, Y + 9, 1, 1, MOSS); // yosun
    px(c, X + 8, Y + 7, 2, 2, '#1a120c'); // baykuş kovuğu
    for (let k = 0; k < 4; k++) { px(c, X + 6 - k, Y + top - k, 2, 1, L); px(c, X + 9 + k, Y + top - 1 - k, 2, 1, L); } // çatallı dallar
  }
  // Yaşlı meşe ('t'), salkım söğüt ('*'), uzun köknar ('^'): yukarı taşar
  function drawTree(c, x, y) {
    const ch = at(x, y), X = x * T, Y = y * T, sd = x * 7 + y * 13;
    if (ch === '^') { // uzun, koyu köknar: sarkık dal katları, sol yanı ışık alır
      px(c, X + 7, Y + 10, 2, 6, '#3a2a1e'); px(c, X + 7, Y + 10, 1, 6, '#5e4430');
      const tiers = [[-19, 2, 4], [-15, 3, 5], [-10, 4, 5], [-5, 5, 6], [0, 6, 6], [5, 7, 6]];
      for (const [ty, w, hgt] of tiers) for (let k = 0; k < hgt; k++) {
        const yy = Y + ty + k, half = Math.max(1, Math.round(w * (k + 1) / hgt));
        px(c, X + 8 - half - 1, yy, half * 2 + 2, 1, FIR[0]);
        for (let dx = -half; dx < half; dx++) {
          const n = -(dx + 0.5) / half - k / hgt * 0.6;
          px(c, X + 8 + dx, yy, 1, 1, n > 0.5 ? FIR[4] : n > 0 ? FIR[3] : n > -0.6 ? FIR[2] : FIR[1]);
        }
        if (k === hgt - 1) for (let dx = -half; dx <= half; dx += 2) px(c, X + 8 + dx, yy + 1, 1, 1, FIR[0]); // sarkan dal uçları
      }
      return;
    }
    if (ch === '*') { // salkım söğüt: kubbe tepesi ve yere doğru sarkan saçaklar
      oldTrunk(c, X, Y, 6);
      const W = WILLOW;
      // tek parça siluet: yuvarlak kubbe + aşağı doğru genişleyen etek (altta ortası açık, gövde görünür)
      const inShape = (dx, dy) => {
        if ((dx - 8) ** 2 + (dy + 8) ** 2 <= 37 || (dx - 4) ** 2 + (dy + 5) ** 2 <= 17 || (dx - 12) ** 2 + (dy + 5) ** 2 <= 17) return true;
        if (dy < -5 || dy > 5) return false;
        const half = 6 + Math.round((dy + 5) * 0.22);
        return dx >= 8 - half && dx < 8 + half && !(dy > 2 && Math.abs(dx - 7.5) < 2);
      };
      for (let dy = -16; dy <= 6; dy++) for (let dx = -2; dx <= 18; dx++) {
        if (inShape(dx, dy)) {
          const n = (-(dx - 8) * 0.7 - (dy + 5)) / 9; // sol üstten ışık, bütün şekle birlikte
          let col = n > 0.75 ? W[4] : n > 0.25 ? W[3] : n > -0.4 ? W[2] : W[1];
          if (dy > -6 && (dx + 16) % 3 === 0 && n < 0.6) col = n > -0.4 ? W[1] : W[0]; // sarkan saçak çizgileri
          px(c, X + dx, Y + dy, 1, 1, col);
        } else if (inShape(dx - 1, dy) || inShape(dx + 1, dy) || inShape(dx, dy - 1) || inShape(dx, dy + 1)) px(c, X + dx, Y + dy, 1, 1, W[0]); // yalnız dış hat
      }
      for (let dx = -8; dx < 8; dx++) { // en altta serbest saçak uçları
        if (Math.abs(dx + 0.5) < 2) continue;
        const len = 2 + Math.floor(hash(sd + dx, 9) * 5), sx = X + 8 + dx;
        px(c, sx, Y + 6, 1, len, dx % 2 ? W[2] : W[1]); px(c, sx, Y + 6 + len, 1, 1, W[0]);
      }
      return;
    }
    // yaşlı meşe: düzensiz, koyu yaprak kümeleri ve aralarında gölgeli boşluklar
    oldTrunk(c, X, Y, 5);
    const blobs = [[7, -3, 6], [2, 0, 4], [13, -1, 5], [4, -8, 4], [11, -9, 4], [9, 3, 4], [14, 4, 3]];
    canopy(c, X, Y, blobs, OAK, sd, false);
    for (const [hx, hy] of [[6, 1], [11, -5], [3, -4]]) px(c, X + hx, Y + hy, 2, 1, OAK[1]); // yapraklar arası gölge
    if (y >= 21 && hash(x, y) > 0.55) for (const [ax, ay] of [[4, -1], [12, 2]]) { px(c, X + ax, Y + ay, 2, 2, '#a8722a'); px(c, X + ax, Y + ay, 1, 1, '#c89a4a'); } // palamut
  }

  function grass(c, X, Y, x, y) {
    px(c, X, Y, T, T, '#6a9a5a');
    for (let k = 0; k < 8; k++) {
      const gx = Math.floor(hash(x * 7 + k, y) * 15), gy = Math.floor(hash(y * 7 + k, x) * 14);
      px(c, X + gx, Y + gy, 1, 2, k % 3 ? '#78a866' : '#5e8c50');
    }
    if (y >= 13 && y <= 19 && x >= 10 && x <= 22) { if (x % 2) px(c, X, Y, T, T, 'rgba(255,255,230,0.05)'); else px(c, X, Y, T, T, 'rgba(20,40,20,0.05)'); return; } // avluda bakımlı çim şeritleri
    if (y < 21) return;
    const n = hash(Math.floor(x / 2) + 11, Math.floor(y / 2) + 5); // geniş, yumuşak ton lekeleri
    if (n > 0.62) px(c, X, Y, T, T, 'rgba(150,190,110,0.14)'); else if (n < 0.22) px(c, X, Y, T, T, 'rgba(30,60,40,0.16)');
    for (let k = 0; k < 3; k++) { // ot demetleri
      const tx = X + 1 + Math.floor(hash(x * 11 + k, y) * 13), ty = Y + 2 + Math.floor(hash(y * 11 + k, x) * 12);
      px(c, tx, ty, 1, 2, '#5a8a4e'); px(c, tx + 1, ty - 1, 1, 3, '#4e7e46'); px(c, tx + 2, ty, 1, 2, '#5a8a4e');
    }
    if (at(x, y) !== 'g') return; // okul bahçesinde çiçek, mantar ve taşlar
    const h = hash(x * 3 + 1, y * 5 + 2), ox = 3 + Math.floor(hash(y, x * 2) * 8), oy = 3 + Math.floor(hash(x, y * 3) * 8);
    if (h > 0.9) { for (const [dx, dy] of [[0, 0], [2, 1], [1, 3], [4, 2]]) { px(c, X + ox + dx, Y + oy + dy, 1, 2, '#9a62a8'); } } // funda tutamı
    else if (h > 0.86) { px(c, X + ox, Y + oy, 2, 2, '#6a7ad8'); px(c, X + ox + 4, Y + oy + 3, 2, 2, '#6a7ad8'); px(c, X + ox + 2, Y + oy + 5, 1, 2, '#3e6a3a'); } // çan çiçekleri
    else if (h > 0.8) { px(c, X + ox, Y + oy + 2, 2, 2, '#e8dcc0'); px(c, X + ox - 1, Y + oy, 4, 2, '#d84a4a'); px(c, X + ox, Y + oy, 1, 1, '#ffffff'); }
    else if (h > 0.76) { px(c, X + ox, Y + oy, 5, 3, '#9a9488'); px(c, X + ox + 1, Y + oy, 3, 1, '#b8b2a6'); }
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
  function wallTop(c, X, Y, x = 0, y = 0) {
    px(c, X, Y, T, T, '#4a3e40');
    for (let r = 0; r < 2; r++) for (let q = 0; q < 2; q++) { // 8x8 taş levhalar, sıralar kaydırmalı
      const sx = X + q * 8 + ((y + r) % 2 ? 4 : 0), sy = Y + r * 8, v = hash(x * 2 + q, y * 2 + r);
      const col = v < 0.3 ? '#5e5254' : v < 0.75 ? '#665a5a' : '#6e6260';
      for (const ox of [0, -16]) { // kaydırılan levha karoya taşarsa öbür yanda devam etsin
        const x0 = Math.max(sx + ox + 1, X), x1 = Math.min(sx + ox + 8, X + T);
        if (x1 <= x0) continue;
        px(c, x0, sy + 1, x1 - x0, 6, col); px(c, x0, sy + 1, x1 - x0, 1, '#7a6e6a');
        px(c, x0, sy + 6, x1 - x0, 1, '#54484a');
      }
    }
    if (hash(x + 5, y * 3) > 0.84) { px(c, X + 3 + Math.floor(hash(y, x) * 8), Y + 9, 3, 2, '#5a7a4a'); px(c, X + 4 + Math.floor(hash(y, x) * 8), Y + 8, 2, 1, '#6a8a56'); }
  }

  let fountain = null;
  function buildBg() {
    bg = document.createElement('canvas');
    bg.width = MW * T; bg.height = (MH + NORTH) * T;
    const c = bg.getContext('2d');
    c.translate(0, NORTH * T); // çizimler dünya koordinatında (kuzey kanadı negatif y)
    for (let y = -NORTH; y < MH; y++) for (let x = 0; x < MW; x++) {
      const ch = at(x, y), X = x * T, Y = y * T;
      switch (ch) {
        case '#': (isWall(at(x, y + 1)) || at(x, y + 1) === 'G' || at(x, y + 1) === 'S') ? wallTop(c, X, Y, x, y) : wallFace(c, X, Y, x, y); break;
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
        case '.': floorStone(c, X, Y, x, y); floorBits(c, X, Y, x, y); break;
        case 'q': floorStone(c, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62'); break;
        case 'D': case 'Q': case 'U': floorStone(c, X, Y, x, y); px(c, X, Y, T, 4, 'rgba(40,30,30,0.18)'); break;
        case 'X': // teleskop (pirinç boru, üç ayak)
          baseFloor(c, X, Y, x, y);
          px(c, X + 3, Y + 12, 1, 4, '#5a4a3a'); px(c, X + 12, Y + 12, 1, 4, '#5a4a3a'); px(c, X + 7, Y + 9, 2, 7, '#6a5a4a');
          for (let k = 0; k < 9; k++) px(c, X + 2 + k, Y + 10 - k, 3, 3, k < 2 ? '#a07a40' : '#d8b870');
          px(c, X + 11, Y + 1, 3, 3, '#f0d890'); px(c, X + 12, Y + 2, 1, 1, '#8ab0e8');
          break;
        case 'O': // kürsüde açık eski kitap
          baseFloor(c, X, Y, x, y);
          px(c, X + 6, Y + 8, 4, 6, '#7a5a40'); px(c, X + 4, Y + 14, 8, 2, '#6a4a34');
          px(c, X + 2, Y + 4, 12, 5, '#a07454'); px(c, X + 3, Y + 3, 5, 4, '#f2e8c0'); px(c, X + 8, Y + 3, 5, 4, '#e8dcb0');
          px(c, X + 4, Y + 4, 3, 1, '#b8ac88'); px(c, X + 9, Y + 4, 3, 1, '#b8ac88'); px(c, X + 4, Y + 6, 2, 1, '#b8ac88');
          break;
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
        case 'b': case '$': { // göl: ortası derin, kıyısı yumuşak kumlu ve yuvarlak köşeli
          const wet = (dx, dy) => 'b,$'.includes(at(x + dx, y + dy));
          let deep = 0;
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) deep += wet(dx, dy);
          grass(c, X, Y, x, y);
          px(c, X, Y, T, T, deep >= 8 ? '#366ea0' : '#3a72a4');
          if (hash(x, y) > 0.4) px(c, X + 3, Y + 5, 5, 1, '#5a92c4');
          if (hash(y, x) > 0.5) px(c, X + 9, Y + 11, 4, 1, '#5a92c4');
          const sand = '#e8d8a8', foam = '#a8d4f0';
          if (!wet(0, -1)) { px(c, X, Y, T, 4, sand); px(c, X, Y + 4, T, 1, foam); }
          if (!wet(0, 1)) { px(c, X, Y + 12, T, 4, sand); px(c, X, Y + 11, T, 1, foam); }
          if (!wet(-1, 0)) { px(c, X, Y, 4, T, sand); px(c, X + 4, Y + 1, 1, T - 2, foam); }
          if (!wet(1, 0)) { px(c, X + 12, Y, 4, T, sand); px(c, X + 11, Y + 1, 1, T - 2, foam); }
          // köşeleri yuvarla: iki komşu kıyıysa köşeye çimen
          const g = '#6a9a5a';
          if (!wet(0, -1) && !wet(-1, 0)) { px(c, X, Y, 3, 1, g); px(c, X, Y, 1, 3, g); }
          if (!wet(0, -1) && !wet(1, 0)) { px(c, X + 13, Y, 3, 1, g); px(c, X + 15, Y, 1, 3, g); }
          if (!wet(0, 1) && !wet(-1, 0)) { px(c, X, Y + 15, 3, 1, g); px(c, X, Y + 13, 1, 3, g); }
          if (!wet(0, 1) && !wet(1, 0)) { px(c, X + 13, Y + 15, 3, 1, g); px(c, X + 15, Y + 13, 1, 3, g); }
          if (ch === '$') { // nilüfer yaprağı ve pembe çiçek
            px(c, X + 3, Y + 6, 9, 5, '#5aa85a'); px(c, X + 4, Y + 5, 7, 7, '#5aa85a'); px(c, X + 7, Y + 5, 2, 3, '#3a72a4');
            px(c, X + 5, Y + 7, 3, 1, '#7ac87a'); px(c, X + 9, Y + 8, 2, 2, '#f6a8c8'); px(c, X + 10, Y + 7, 1, 1, '#ffd0e0');
          }
          break;
        }
        case '%': // kıyıda sazlar (üstünden geçilir)
          grass(c, X, Y, x, y);
          for (let k = 0; k < 4; k++) {
            const sx = X + 2 + k * 3 + Math.floor(hash(x + k, y) * 2), sh = 7 + Math.floor(hash(y + k, x) * 4);
            px(c, sx, Y + 15 - sh, 1, sh, '#4a8a4a');
            if (k % 2 === 0) { px(c, sx - 1, Y + 14 - sh, 2, 3, '#8a5a3a'); px(c, sx, Y + 13 - sh, 1, 1, '#4a8a4a'); }
          }
          break;
        case '_': { // toprak patika: kenarları çimenle yumuşar
          grass(c, X, Y, x, y);
          const on = (dx, dy) => '_D,'.includes(at(x + dx, y + dy));
          const l = on(-1, 0) ? 0 : 3, r = on(1, 0) ? 0 : 3, u = on(0, -1) ? 0 : 3, d = on(0, 1) ? 0 : 3;
          px(c, X + l, Y + u, T - l - r, T - u - d, '#a88a64');
          px(c, X + l + 1, Y + u + 1, T - l - r - 2, T - u - d - 2, '#b4966e');
          for (let k = 0; k < 4; k++) px(c, X + 3 + Math.floor(hash(x * 5 + k, y) * 10), Y + 3 + Math.floor(hash(y * 5 + k, x) * 10), 2, 1, '#8e7254');
          break;
        }
        case '~': // sürülmüş tarla toprağı
          px(c, X, Y, T, T, '#8a6444');
          for (let k = 0; k < 4; k++) { px(c, X, Y + 2 + k * 4, T, 1, '#6e4e34'); px(c, X, Y + 3 + k * 4, T, 1, '#9a7454'); }
          if (hash(x, y) > 0.5) { px(c, X + 4, Y + 6, 2, 2, '#5aa84a'); px(c, X + 11, Y + 12, 2, 2, '#5aa84a'); } // filiz
          break;
        case '=': { // ahşap çit: komşuya göre yatay ya da dikey
          grass(c, X, Y, x, y);
          const hz = at(x - 1, y) === '=' || at(x + 1, y) === '=';
          if (hz) { px(c, X, Y + 6, T, 2, '#b08a5e'); px(c, X, Y + 11, T, 2, '#9a7650'); px(c, X + 6, Y + 3, 3, 12, '#c09a6c'); px(c, X + 6, Y + 3, 3, 1, '#d8b888'); }
          else { px(c, X + 5, Y, 2, T, '#b08a5e'); px(c, X + 10, Y, 2, T, '#9a7650'); px(c, X + 4, Y + 5, 9, 3, '#c09a6c'); px(c, X + 4, Y + 5, 9, 1, '#d8b888'); }
          break;
        }
        case '&': // korkuluk: hasır şapka, ekose gömlek, yayılmış kollar
          px(c, X, Y, T, T, '#8a6444');
          for (let k = 0; k < 4; k++) px(c, X, Y + 2 + k * 4, T, 1, '#6e4e34');
          px(c, X + 7, Y + 4, 2, 12, '#7a5a3a'); px(c, X + 1, Y + 7, 14, 2, '#7a5a3a');
          px(c, X + 4, Y + 6, 8, 6, '#c84a4a'); px(c, X + 4, Y + 8, 8, 1, '#e8c070'); px(c, X + 7, Y + 6, 1, 6, '#e8c070');
          px(c, X + 5, Y + 1, 6, 5, '#f0d8a0'); px(c, X + 6, Y + 3, 1, 1, '#3a2a1e'); px(c, X + 9, Y + 3, 1, 1, '#3a2a1e');
          px(c, X + 3, Y + 1, 10, 1, '#d8b860'); px(c, X + 5, Y - 1, 6, 2, '#e8c870');
          px(c, X, Y + 6, 2, 3, '#e8c870'); px(c, X + 14, Y + 6, 2, 3, '#e8c870'); // saman eller
          break;
        case '+': // yön tabelası
          grass(c, X, Y, x, y);
          px(c, X + 7, Y + 4, 2, 12, '#7a5a3a');
          px(c, X + 1, Y + 2, 10, 4, '#c09a6c'); px(c, X, Y + 3, 1, 2, '#c09a6c'); px(c, X + 3, Y + 3, 6, 1, '#7a5a3a');
          px(c, X + 6, Y + 7, 10, 4, '#b08a5e'); px(c, X + 15, Y + 8, 1, 2, '#b08a5e'); px(c, X + 8, Y + 8, 6, 1, '#6a4a2e');
          break;
        case 'I': case 'M': { // uçuş sahası: biçilmiş çim şeritleri ve tebeşir çizgileri
          px(c, X, Y, T, T, x % 2 ? '#64965a' : '#5c8e52');
          const inP = (dx, dy) => 'IM'.includes(at(x + dx, y + dy));
          if (!inP(0, -1)) px(c, X, Y + 1, T, 1, '#f0f0e0');
          if (!inP(0, 1)) px(c, X, Y + 14, T, 1, '#f0f0e0');
          if (!inP(-1, 0)) px(c, X + 1, Y, 1, T, '#f0f0e0');
          if (!inP(1, 0)) px(c, X + 14, Y, 1, T, '#f0f0e0');
          if (x === 33) px(c, X, Y, 1, T, '#f0f0e0');
          for (let yy = 0; yy < T; yy++) for (let xx = 0; xx < T; xx++) { // orta yuvarlak ve kale önü yayları
            const wx = X + xx, wy = Y + yy, dc = Math.hypot(wx - 33 * T, wy - 27.5 * T);
            if (Math.abs(dc - 22) < 0.6 || dc < 1.5) px(c, wx, wy, 1, 1, '#f0f0e0');
            for (const gx of [25.5 * T, 40.5 * T]) { const dg = Math.hypot(wx - gx, wy - 27.5 * T); if (Math.abs(dg - 36) < 0.6 && Math.abs(wx - gx) < 36) px(c, wx, wy, 1, 1, 'rgba(240,240,224,0.8)'); }
          }
          if ((x <= 27 || x >= 38) && hash(x, y) > 0.55) { px(c, X + 3, Y + 5, 6, 4, '#7a9060'); px(c, X + 4, Y + 6, 4, 2, '#8a9a68'); } // kale önünde aşınmış çim
          if (ch === 'M') { // altın halka direği
            px(c, X + 7, Y + 7, 2, 9, '#a88a50');
            for (let a = 0; a < 16; a++) px(c, X + 7.5 + Math.cos(a / 16 * 6.283) * 4, Y + 4 + Math.sin(a / 16 * 6.283) * 4, 1, 1, '#e3b23c');
          }
          break;
        }
        case 'E': // kum saati (gövde; dolum dinamik çizilir)
          floorStone(c, X, Y, x, y);
          px(c, X + 3, Y, 10, 2, '#c9a24a'); px(c, X + 3, Y + 14, 10, 2, '#c9a24a');
          px(c, X + 3, Y + 2, 1, 12, '#a8845f'); px(c, X + 12, Y + 2, 1, 12, '#a8845f');
          px(c, X + 4, Y + 2, 8, 5, 'rgba(220,230,255,0.25)'); px(c, X + 7, Y + 7, 2, 2, 'rgba(220,230,255,0.25)'); px(c, X + 4, Y + 9, 8, 5, 'rgba(220,230,255,0.25)');
          break;
        case 'R': // seyirci kulesinin ayakları (üstü sonradan çizilir)
          grass(c, X, Y, x, y);
          px(c, X + 2, Y, 2, T, '#6a4a30'); px(c, X + 12, Y, 2, T, '#6a4a30'); px(c, X + 4, Y + 6, 8, 1, '#7a5a40');
          break;
        case '!': { // kupa dolabı: koyu ahşap gövde, altın taç, kırmızı kadife arka, cam yansıması, üç raf (ödüller dinamik)
          baseFloor(c, X, Y, x, y);
          px(c, X + 1, Y, 14, T, '#4a2e1e'); px(c, X + 1, Y, 14, 2, '#c9a24a'); px(c, X + 5, Y - 1, 6, 1, '#e3b23c');
          px(c, X + 2, Y + 2, 12, 13, '#6a1e2a'); px(c, X + 2, Y + 2, 12, 1, '#4a1420');
          px(c, X + 2, Y + 6, 12, 1, '#8a6a46'); px(c, X + 2, Y + 11, 12, 1, '#8a6a46');
          px(c, X + 3, Y + 3, 1, 3, 'rgba(255,255,255,0.3)'); px(c, X + 12, Y + 8, 1, 2, 'rgba(255,255,255,0.2)');
          px(c, X + 1, Y + 15, 14, 1, '#2e1c12');
          break;
        }
        case '?': // büyük bina kupası (kaidesi; kupa dinamik parlar)
          baseFloor(c, X, Y, x, y);
          px(c, X + 3, Y + 10, 10, 6, '#3a2a2e'); px(c, X + 3, Y + 10, 10, 1, '#c9a24a'); px(c, X + 4, Y + 11, 8, 4, '#6a1e2a'); px(c, X + 6, Y + 12, 4, 1, '#e3b23c');
          break;
        case '|': // rekor tahtası: altın çerçeveli koyu ahşap pano, altın harfler
          baseFloor(c, X, Y, x, y);
          px(c, X + 2, Y + 1, 12, 11, '#c9a24a'); px(c, X + 3, Y + 2, 10, 9, '#4a2e1e');
          px(c, X + 5, Y + 3, 6, 1, '#e3b23c');
          for (let k = 0; k < 3; k++) px(c, X + 4, Y + 5 + k * 2, 4 + ((k * 3) % 5), 1, '#d8b870');
          px(c, X + 4, Y + 12, 2, 4, '#4a2e1e'); px(c, X + 10, Y + 12, 2, 4, '#4a2e1e');
          break;
        case '5': // revir yatağı: beyaz çarşaf, yastık, demir başlık
          baseFloor(c, X, Y, x, y);
          px(c, X + 2, Y + 1, 12, 14, '#6a6a7a'); px(c, X + 3, Y + 2, 10, 12, '#eef0f6'); px(c, X + 3, Y + 2, 10, 3, '#ffffff');
          px(c, X + 4, Y + 3, 8, 2, '#dce0ea'); px(c, X + 3, Y + 7, 10, 7, '#c8d8e8'); px(c, X + 3, Y + 7, 10, 1, '#a8bcd0');
          px(c, X + 2, Y, 12, 2, '#8a8a9a'); px(c, X + 2, Y + 14, 1, 2, '#5a5a6a'); px(c, X + 13, Y + 14, 1, 2, '#5a5a6a');
          break;
        case '6': // revak sütunu: taş gövde, başlık ve kaide
          baseFloor(c, X, Y, x, y);
          px(c, X + 4, Y - 5, 8, 19, '#9a92a0'); px(c, X + 4, Y - 5, 2, 19, '#b8b0bc'); px(c, X + 11, Y - 5, 1, 19, '#7a7280');
          px(c, X + 3, Y - 6, 10, 2, '#c0b8c4'); px(c, X + 3, Y + 13, 10, 3, '#8a8290'); px(c, X + 3, Y + 13, 10, 1, '#b0a8b4');
          break;
        case '7': // taş kuyu, küçük çatı ve kova
          baseFloor(c, X, Y, x, y);
          px(c, X + 2, Y + 7, 12, 8, '#7a7280'); px(c, X + 2, Y + 7, 12, 2, '#9a92a0'); px(c, X + 4, Y + 8, 8, 2, '#2a3a4a');
          px(c, X + 3, Y + 1, 1, 7, '#6a4a30'); px(c, X + 12, Y + 1, 1, 7, '#6a4a30'); px(c, X + 1, Y - 1, 14, 3, '#8a4a3a'); px(c, X + 1, Y - 1, 14, 1, '#aa6a50');
          px(c, X + 7, Y + 3, 2, 3, '#8a6a4a');
          break;
        case '8': { // büyük merdiven: geniş taş basamaklar, kenarlarda korkuluk
          const k = y + 12; // üstte en geride
          px(c, X, Y, T, T, k % 2 ? '#8e8690' : '#a49ca6'); px(c, X, Y, T, 2, '#bcb4be'); px(c, X, Y + 14, T, 2, '#6e6670');
          if (at(x - 1, y) !== '8') { px(c, X, Y - 2, 3, T + 2, '#5a4a3a'); px(c, X, Y - 2, 3, 1, '#c9a24a'); }
          if (at(x + 1, y) !== '8') { px(c, X + 13, Y - 2, 3, T + 2, '#5a4a3a'); px(c, X + 13, Y - 2, 3, 1, '#c9a24a'); }
          if (x >= 28 && x <= 29) { px(c, X, Y + 2, T, 12, '#9c2a32'); px(c, X, Y + 2, T, 1, '#c84a52'); if (x === 28) px(c, X, Y + 2, 1, 12, '#e3b23c'); else px(c, X + 15, Y + 2, 1, 12, '#e3b23c'); }
          break;
        }
        case 's': // Kehanet Kulesi: mor tahta zemin, ara sıra altın yıldız kakması
          px(c, X, Y, T, T, '#5a3a62');
          for (let k = 0; k < 4; k++) { px(c, X, Y + k * 4 + 3, T, 1, '#4a2e52'); px(c, X + Math.floor(hash(x * 4 + k, y) * 16), Y + k * 4, 1, 4, '#4a2e52'); }
          if (hash(x, y) > 0.75) { px(c, X + 7, Y + 6, 3, 1, '#d8b870'); px(c, X + 8, Y + 5, 1, 3, '#d8b870'); }
          break;
        case '(': // yuvarlak masa, mor örtü ve kristal küre (küre dinamik parlar)
          px(c, X, Y, T, T, '#5a3a62');
          disc(c, X + 8, Y + 9, 7, (d) => (d > 40 ? '#3a2240' : '#7a4a8a'));
          for (let k = 0; k < 5; k++) px(c, X + 3 + k * 2, Y + 15, 1, 1, '#d8b870');
          px(c, X + 5, Y + 10, 6, 2, '#c9a24a');
          disc(c, X + 8, Y + 6, 4, (d, dx, dy) => (dx + dy < -2 ? '#e8e0ff' : '#a890e0'));
          break;
        case ')': // minder
          px(c, X, Y, T, T, '#5a3a62');
          disc(c, X + 8, Y + 9, 6, (d, dx, dy) => (d > 26 ? '#8a3a5a' : dx + dy < -2 ? '#e88ab0' : '#c85a8a'));
          px(c, X + 7, Y + 8, 2, 2, '#e3b23c'); px(c, X + 2, Y + 9, 1, 1, '#e3b23c'); px(c, X + 13, Y + 9, 1, 1, '#e3b23c');
          break;
        case '@': { // büyülü bitki yatağı: taş saksı içinde dokunaçlı sarmaşık, çığlık kökü ya da ay çiçeği
          grass(c, X, Y, x, y);
          const u = (dx, dy) => at(x + dx, y + dy) === '@', B = '#9a92a0', BL = '#bcb4c0', BD = '#6e6676';
          px(c, X, Y, T, T, '#4a3828'); for (let k = 0; k < 3; k++) px(c, X + 2 + Math.floor(hash(x + k, y) * 11), Y + 4 + k * 4, 2, 1, '#3a2a1e');
          if (!u(0, -1)) { px(c, X, Y, T, 3, B); px(c, X, Y, T, 1, BL); }
          if (!u(0, 1)) { px(c, X, Y + 13, T, 3, BD); px(c, X, Y + 13, T, 1, B); }
          if (!u(-1, 0)) { px(c, X, Y, 3, T, B); px(c, X, Y, 1, T, BL); }
          if (!u(1, 0)) { px(c, X + 13, Y, 3, T, BD); }
          const kind = (Math.min(x, 32 - x) + y) % 3;
          if (kind === 0) { // çığlık kökü: geniş yapraklar ve topraktan bakan minik surat
            for (const [lx, ly, d] of [[5, 6, -1], [10, 5, 1], [7, 4, 0]]) { px(c, X + lx, Y + ly, 3, 2, '#4e8a3e'); px(c, X + lx + d, Y + ly - 1, 2, 1, '#6aaa52'); }
            px(c, X + 6, Y + 9, 5, 3, '#c8a07a'); px(c, X + 7, Y + 10, 1, 1, '#2a1a12'); px(c, X + 9, Y + 10, 1, 1, '#2a1a12'); px(c, X + 8, Y + 11, 1, 1, '#6a3a2a');
          } else if (kind === 1) { // ay çiçeği: soluk mavi taç yapraklar (gece ışıldar)
            for (const [fx, fy] of [[5, 6], [10, 9], [7, 11]]) { px(c, X + fx + 1, Y + fy + 2, 1, 3, '#3e6a3a'); px(c, X + fx, Y + fy, 3, 1, '#a8d8f0'); px(c, X + fx + 1, Y + fy - 1, 1, 3, '#a8d8f0'); px(c, X + fx + 1, Y + fy, 1, 1, '#ffffff'); }
          } else { // dokunaçlı sarmaşığın kökü (kollar canlı çizilir)
            px(c, X + 5, Y + 9, 6, 3, '#4a2a4e'); px(c, X + 6, Y + 8, 4, 1, '#6a3a6e');
          }
          break;
        }
        case '[': { // taş baykuş heykeli: kaide, yuvarlak gövde, iri gözler, kulak tüyleri (yukarı taşar)
          grass(c, X, Y, x, y);
          const L = '#4a4452', S = '#8e8690', SL = '#aaa2ac', SD = '#6e6676';
          px(c, X + 2, Y + 9, 12, 7, L); px(c, X + 3, Y + 9, 10, 6, '#7a7280'); px(c, X + 3, Y + 9, 10, 1, '#a49ca6'); px(c, X + 3, Y + 13, 10, 1, SD); // kaide
          for (let dy = -6; dy <= 9; dy++) for (let dx = -6; dx <= 6; dx++) { // gövde (yumurta biçimi)
            const e = (dx * dx) / 36 + ((dy - 1.5) * (dy - 1.5)) / 64;
            if (e > 1.08) continue;
            px(c, X + 8 + dx, Y + dy, 1, 1, e > 0.82 ? L : (-dx - dy * 0.5) > 3 ? SL : dx > 2 ? SD : S);
          }
          px(c, X + 3, Y - 7, 2, 3, L); px(c, X + 4, Y - 7, 1, 2, S); px(c, X + 11, Y - 7, 2, 3, L); px(c, X + 11, Y - 7, 1, 2, S); // kulak tüyleri
          for (const ex of [5, 11]) { px(c, X + ex - 2, Y - 3, 4, 4, '#c8c0ca'); px(c, X + ex - 1, Y - 2, 2, 2, '#3a3442'); px(c, X + ex - 1, Y - 2, 1, 1, '#e8e0ea'); } // iri gözler
          px(c, X + 7, Y + 1, 2, 2, '#c9a24a'); px(c, X + 7, Y + 3, 2, 1, '#a8842c'); // gaga
          for (let k = 0; k < 3; k++) { px(c, X + 3, Y + 3 + k * 2, 2, 1, SD); px(c, X + 11, Y + 3 + k * 2, 2, 1, SD); } // kanat tüyleri
          px(c, X + 6, Y + 8, 1, 1, L); px(c, X + 9, Y + 8, 1, 1, L); // pençeler
          break;
        }
        case 'N': // balkabağı (tarlada toprağın üstünde)
          px(c, X, Y, T, T, '#8a6444');
          for (let k = 0; k < 4; k++) px(c, X, Y + 2 + k * 4, T, 1, '#6e4e34');
          px(c, X + 3, Y + 7, 10, 7, '#e07a2a'); px(c, X + 2, Y + 8, 12, 5, '#e07a2a');
          px(c, X + 6, Y + 7, 1, 7, '#b85a1a'); px(c, X + 9, Y + 7, 1, 7, '#b85a1a'); px(c, X + 4, Y + 8, 1, 2, '#f5a547');
          px(c, X + 7, Y + 5, 2, 2, '#4a7a3a'); px(c, X + 9, Y + 4, 3, 2, '#5aaa4a');
          break;
        case 'C': // bahçıvan kulübesi (2x2): üstte saman çatı, altta taş duvar ve kapı
          grass(c, X, Y, x, y);
          if (at(x, y - 1) !== 'C') {
            px(c, X, Y + 4, T, 12, '#9a7a44');
            for (let k = 0; k < 4; k++) px(c, X, Y + 6 + k * 3, T, 1, '#7a5e30');
            px(c, X, Y + 3, T, 2, '#b89858');
            if (at(x + 1, y) !== 'C') { px(c, X + 9, Y - 2, 4, 6, '#6e625a'); px(c, X + 9, Y - 2, 4, 1, '#8a7e74'); }
          } else {
            px(c, X, Y, T, 14, '#9a8e82'); px(c, X, Y + 14, T, 2, '#6e625a');
            for (let k = 0; k < 3; k++) px(c, X + (k % 2) * 6, Y + 3 + k * 4, 9, 1, '#857a70');
            if (at(x - 1, y) !== 'C') { px(c, X + 5, Y + 4, 7, 10, '#6a4a2e'); px(c, X + 10, Y + 9, 1, 1, '#e3b23c'); }
            else {
              px(c, X + 4, Y + 4, 7, 5, '#ffe7a0'); px(c, X + 4, Y + 4, 7, 1, '#6a4a2e'); px(c, X + 7, Y + 4, 1, 5, '#6a4a2e'); // sıcak ışıklı pencere
              px(c, X + 3, Y + 9, 9, 2, '#8a5a3a'); px(c, X + 4, Y + 8, 2, 1, '#f6a8c8'); px(c, X + 7, Y + 8, 2, 1, '#ffe060'); px(c, X + 10, Y + 8, 1, 1, '#f6a8c8');
            }
          }
          break;
        case 'Z': // orman: iç içe yuvarlak ağaç tepeleri, dipte mantar ve böğürtlen
          px(c, X, Y, T, T, '#2a4a34');
          disc(c, X + 5, Y + 6, 6, (d, dx, dy) => (d > 30 ? '#2e5a3a' : dx + dy < -3 ? '#5a9a62' : '#3e7a4a'));
          disc(c, X + 12, Y + 10, 6, (d, dx, dy) => (d > 30 ? '#2a5234' : dx + dy < -3 ? '#4e8e58' : '#366c42'));
          if (hash(x, y) > 0.6) { px(c, X + 3, Y + 4, 1, 1, '#e05a6a'); px(c, X + 6, Y + 7, 1, 1, '#e05a6a'); }
          if (hash(y, x) > 0.7 && at(x, y - 1) !== 'Z') { px(c, X + 9, Y + 13, 3, 2, '#d84a4a'); px(c, X + 10, Y + 15, 1, 1, '#e8dcc0'); }
          break;
        case 'f': {
          if (y >= 13 && y <= 19 && x >= 10 && x <= 22) { // avludaki tarh: toprak ve alçak taş bordür
            px(c, X, Y, T, T, '#5e4632'); for (let k = 0; k < 4; k++) px(c, X + Math.floor(hash(x + k, y) * 14), Y + 2 + k * 4, 2, 1, '#4e3828');
            const f = (dx, dy) => at(x + dx, y + dy) === 'f', B = '#a49ca0', BS = '#7a7276';
            if (!f(0, -1)) { px(c, X, Y, T, 2, B); px(c, X, Y + 2, T, 1, BS); }
            if (!f(0, 1)) { px(c, X, Y + 14, T, 2, B); }
            if (!f(-1, 0)) { px(c, X, Y, 2, T, B); px(c, X + 2, Y + 2, 1, T - 2, BS); }
            if (!f(1, 0)) { px(c, X + 14, Y, 2, T, B); }
          } else grass(c, X, Y, x, y);
          for (let k = 0; k < 3; k++) {
            const fx = X + 2 + k * 5 + Math.floor(hash(x + k, y * 3) * 2), fy = Y + 4 + Math.floor(hash(y + k, x * 3) * 6), kind = (k + x * 3 + y) % 3;
            px(c, fx + 1, fy + 2, 1, 14 - (fy - Y) - 2, '#3e6a3a'); // sap
            if (kind === 0) { px(c, fx, fy, 3, 2, '#8a4aa0'); px(c, fx + 1, fy - 1, 1, 1, '#b07ac4'); px(c, fx, fy + 2, 3, 1, '#5a8a4a'); } // devedikeni
            else if (kind === 1) { for (let j = 0; j < 3; j++) px(c, fx + (j % 2 ? 2 : 0), fy + j * 2, 2, 2, j ? '#c86a9a' : '#e0a0c4'); } // yüksük otu
            else { px(c, fx, fy, 2, 2, '#6a7ad8'); px(c, fx + 2, fy + 2, 2, 2, '#8a9ae8'); } // çan çiçeği
          }
          break;
        }
        case 'p': case 'F': path(c, X, Y, x, y); if (ch === 'F' && !fountain) fountain = { x: X + T + 8, y: Y + T + 8 }; break; // 3x3 çeşmenin ortası
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
        case 'T': { // uzun bina masası
          floorStone(c, X, Y, x, y);
          const hs = Scene.HOUSES[HALL_HOUSE[x] || 'kizil'];
          px(c, X + 1, Y, 14, T, '#a07454'); px(c, X + 1, Y, 1, T, '#8a6244'); px(c, X + 14, Y, 1, T, '#8a6244');
          px(c, X + 6, Y, 4, T, hs.a); px(c, X + 6, Y, 1, T, hs.b); px(c, X + 9, Y, 1, T, hs.b); // örtü
          if (at(x, y - 1) !== 'T') px(c, X + 1, Y, 14, 2, '#b88a5e');
          if (at(x, y + 1) !== 'T') px(c, X + 1, Y + 13, 14, 3, '#7a5a40');
          for (const ty of [3, 10]) { // iki yanda altın tabaklar ve kadehler
            px(c, X + 2, Y + ty, 3, 3, '#ecd59a'); px(c, X + 3, Y + ty + 1, 1, 1, '#c9a24a');
            px(c, X + 11, Y + ty, 3, 3, '#ecd59a'); px(c, X + 12, Y + ty + 1, 1, 1, '#c9a24a');
          }
          px(c, X + 4, Y + 7, 1, 2, '#e3b23c'); px(c, X + 11, Y + 7, 1, 2, '#e3b23c');
          const food = hash(x, y);
          if (food > 0.66) { px(c, X + 6, Y + 6, 4, 3, '#e08a3a'); px(c, X + 7, Y + 5, 2, 1, '#f0b060'); } // turta
          else if (food > 0.33) { px(c, X + 6, Y + 6, 4, 3, '#c8c8d8'); px(c, X + 7, Y + 6, 1, 1, '#e05050'); px(c, X + 8, Y + 7, 1, 1, '#80c050'); } // meyve tabağı
          break;
        }
        case 'j': { // bank (masanın yanında, üstüne oturulur)
          floorStone(c, X, Y, x, y);
          const left = at(x - 1, y) === 'T', bx = left ? X + 1 : X + 6;
          px(c, bx, Y, 9, T, '#8a6446'); px(c, bx, Y, 9, 1, '#a87c58');
          if (at(x, y - 1) !== 'j') px(c, bx, Y, 9, 2, '#a87c58');
          px(c, bx + 1, Y + 3, 7, 1, '#7a5a40'); px(c, bx + 1, Y + 10, 7, 1, '#7a5a40');
          break;
        }
        case 'a': // öğretmenlerin yükseltilmiş kürsüsü
          floorWood(c, X, Y, x, y);
          px(c, X, Y + 14, T, 2, '#d8b870');
          break;
        case 'h': // müdürün yüksek arkalıklı koltuğu
          floorWood(c, X, Y, x, y);
          px(c, X + 3, Y + 1, 10, 13, '#7a2a3a'); px(c, X + 2, Y, 12, 2, '#e3b23c'); px(c, X + 7, Y - 2, 2, 2, '#e3b23c');
          px(c, X + 5, Y + 3, 6, 8, '#9a3a4a'); px(c, X + 2, Y + 8, 2, 6, '#c9a24a'); px(c, X + 12, Y + 8, 2, 6, '#c9a24a');
          break;
        case 'w': // altın baykuşlu kürsü
          baseFloor(c, X, Y, x, y);
          px(c, X + 5, Y + 9, 6, 6, '#a07a40'); px(c, X + 3, Y + 14, 10, 2, '#7a5a30');
          px(c, X + 4, Y + 2, 8, 7, '#e3b23c'); px(c, X + 3, Y + 6, 2, 4, '#c9a24a'); px(c, X + 11, Y + 6, 2, 4, '#c9a24a');
          px(c, X + 5, Y + 4, 2, 2, '#fff6d0'); px(c, X + 9, Y + 4, 2, 2, '#fff6d0'); px(c, X + 6, Y + 5, 1, 1, '#3a2a1a'); px(c, X + 9, Y + 5, 1, 1, '#3a2a1a');
          px(c, X + 7, Y + 6, 2, 2, '#e08a3a'); px(c, X + 5, Y + 1, 1, 1, '#c9a24a'); px(c, X + 10, Y + 1, 1, 1, '#c9a24a');
          break;
        case 'H':
          floorWood(c, X, Y, x, y);
          px(c, X, Y + 2, T, 10, '#a07454'); px(c, X, Y + 2, T, 1, '#b88a5e'); px(c, X, Y + 12, T, 2, '#7a5a40');
          if (at(x - 1, y) !== 'H') px(c, X, Y + 2, 1, 12, '#7a5a40');
          if (at(x + 1, y) !== 'H') px(c, X + 15, Y + 2, 1, 12, '#7a5a40');
          px(c, X + 6, Y + 5, 3, 3, '#e3b23c');
          break;
        case 't': case '*': case '^': // ağaç: burada zemin ve gölge, ağacın kendisi "uzun eşyalar" aşamasında
          grass(c, X, Y, x, y);
          for (let k = 0; k < 4; k++) px(c, X + 1 + k, Y + 11 + (k > 1 ? 1 : 0), 14 - k * 2, 4 - (k > 1 ? 1 : 0), 'rgba(30,50,30,0.1)');
          break;
        case 'o':
          floorStone(c, X, Y, x, y);
          px(c, X + 2, Y + 9, 12, 2, '#a07a58'); px(c, X + 7, Y + 10, 2, 6, '#8a6244');
          break;
        case 'c':
          if (y < 0) baseFloor(c, X, Y, x, y); else floorStone(c, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62');
          px(c, X + 3, Y + 13, 10, 2, 'rgba(0,0,0,0.3)');
          disc(c, X + 8, Y + 9, 6, d => (d > 30 ? '#3e3850' : '#4a4458'));
          px(c, X + 2, Y + 4, 12, 2, '#5a5468'); px(c, X + 3, Y + 4, 10, 1, '#6a6478');
          break;
        case 'J': {
          if (y < 0) baseFloor(c, X, Y, x, y); else floorStone(c, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62');
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
        case 'L': { // sera sırası: ahşap saksı kutusu, içinde karışık bitkiler (lahana, filiz, çiçek)
          px(c, X, Y, T, T, '#c4a080');
          px(c, X, Y + 8, T, 8, '#8a6446'); px(c, X, Y + 8, T, 1, '#a87c58'); px(c, X, Y + 15, T, 1, '#5e4632');
          px(c, X, Y + 7, T, 2, '#5a3e2a');
          if (at(x - 1, y) !== 'L') px(c, X, Y + 8, 1, 8, '#5e4632'); if (at(x + 1, y) !== 'L') px(c, X + 15, Y + 8, 1, 8, '#5e4632');
          const kind = Math.floor(hash(x, y) * 3);
          if (kind === 0) canopy(c, X, Y, [[4, 5, 3], [11, 5, 3]], LEAF, x * 3 + y); // yuvarlak yapraklı
          else if (kind === 1) for (let k = 0; k < 5; k++) { const lx = X + 2 + k * 3; px(c, lx, Y + 2 + (k % 2), 1, 6, '#3a7a3a'); px(c, lx + 1, Y + 1 + (k % 2), 1, 5, '#55a04a'); px(c, lx + 1, Y + 1 + (k % 2), 1, 1, '#a8dc80'); } // ince filizler
          else { canopy(c, X, Y, [[5, 5, 3], [11, 5, 3]], LEAF, x + y * 3); for (const [fx, fy] of [[4, 3], [10, 2], [12, 5], [6, 6]]) { px(c, X + fx, Y + fy, 2, 2, ['#f6a8c8', '#fff0a0', '#c8a8f6', '#f08a6a'][(fx + fy) % 4]); px(c, X + fx, Y + fy, 1, 1, '#ffffff'); } }
          break;
        }
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
        case 'A': { // şövalye zırhı: kaide, tüylü miğfer, omuzluklar, göğüs zırhı, bacaklar ve baltalı mızrak (yukarı taşar)
          baseFloor(c, X, Y, x, y);
          const L = '#34323e', HI = '#e4e8f0', MD = '#aeb4c2', DK = '#767c8c';
          const part = (x0, y0, w, h, lit = true) => { // dış hatlı metal parça: sol yan parlak, sağ yan gölgeli
            px(c, X + x0 - 1, Y + y0 - 1, w + 2, h + 2, L); px(c, X + x0, Y + y0, w, h, MD);
            if (lit) px(c, X + x0, Y + y0, 1, h, HI); px(c, X + x0 + w - 1, Y + y0, 1, h, DK);
          };
          px(c, X + 2, Y + 13, 12, 3, L); px(c, X + 3, Y + 13, 10, 2, '#8a8290'); px(c, X + 3, Y + 13, 10, 1, '#aaa2ae'); // taş kaide
          px(c, X + 14, Y - 9, 1, 22, '#5a3e2a'); px(c, X + 14, Y - 9, 1, 22, '#7a5a3e'); // mızrak sapı
          part(4, 6, 3, 7); part(9, 6, 3, 7); // bacaklar
          px(c, X + 4, Y + 8, 3, 1, HI); px(c, X + 9, Y + 8, 3, 1, HI); // diz kapakları
          part(3, 11, 4, 2); part(9, 11, 4, 2); // ayaklar
          part(4, -1, 8, 8); // göğüs zırhı
          px(c, X + 7, Y, 2, 6, HI); px(c, X + 4, Y + 5, 8, 1, DK); px(c, X + 4, Y + 6, 8, 1, '#5a5a6a'); // orta sırt çizgisi, kemer
          part(2, 0, 2, 6); part(12, 0, 2, 5, false); // kollar
          px(c, X + 1, Y - 2, 4, 3, L); px(c, X + 2, Y - 1, 3, 2, MD); px(c, X + 2, Y - 1, 2, 1, HI); // sol omuzluk
          px(c, X + 11, Y - 2, 4, 3, L); px(c, X + 11, Y - 1, 3, 2, MD); px(c, X + 13, Y - 1, 1, 2, DK); // sağ omuzluk
          px(c, X + 12, Y + 4, 3, 2, DK); // mızrağı tutan eldiven
          part(5, -7, 6, 6); // miğfer
          px(c, X + 6, Y - 4, 4, 1, '#1a1822'); px(c, X + 6, Y - 3, 4, 1, DK); // göz yarığı
          px(c, X + 6, Y - 7, 4, 1, HI);
          px(c, X + 7, Y - 10, 2, 3, '#c83a3a'); px(c, X + 5, Y - 9, 2, 2, '#c83a3a'); px(c, X + 4, Y - 8, 1, 2, '#a02a2a'); px(c, X + 8, Y - 10, 1, 1, '#e86868'); // kırmızı tüy
          px(c, X + 13, Y - 10, 3, 5, L); px(c, X + 13, Y - 9, 2, 3, MD); px(c, X + 13, Y - 9, 1, 3, HI); px(c, X + 14, Y - 12, 1, 2, MD); // balta başı ve sivri uç
          break;
        }
        case 'n': { // saksı bitkisi: toprak saksı ve sarkan geniş yapraklar
          baseFloor(c, X, Y, x, y);
          px(c, X + 3, Y + 14, 10, 2, 'rgba(0,0,0,0.18)');
          px(c, X + 4, Y + 10, 8, 5, '#b8683e'); px(c, X + 4, Y + 10, 2, 5, '#d08458'); px(c, X + 11, Y + 10, 1, 5, '#8a4a2a');
          px(c, X + 3, Y + 8, 10, 3, '#d88a62'); px(c, X + 3, Y + 8, 10, 1, '#f0a880'); px(c, X + 4, Y + 9, 8, 1, '#4a3020');
          const leaf = (lx, ly, dir) => { for (let k = 0; k < 5; k++) { px(c, X + lx + dir * k, Y + ly - Math.round(Math.sin(k / 4 * Math.PI) * 2) , 2, 2, k < 2 ? '#3a7a3a' : '#55a04a'); } px(c, X + lx + dir * 4, Y + ly, 1, 1, '#a8dc80'); };
          px(c, X + 7, Y + 2, 2, 7, '#3a7a3a');
          leaf(7, 6, -1); leaf(8, 5, 1); leaf(7, 3, -1); leaf(8, 2, 1);
          px(c, X + 7, Y + 1, 2, 2, '#78c060'); px(c, X + 7, Y + 1, 1, 1, '#a8dc80');
          break;
        }
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
        case 'e': if (y >= 13 && y <= 19 && x >= 10 && x <= 22) { // avluda: taş saksıda kesilmiş koni şimşir
          grass(c, X, Y, x, y);
          px(c, X + 4, Y + 11, 8, 5, '#4a4452'); px(c, X + 5, Y + 11, 6, 4, '#9a92a0'); px(c, X + 5, Y + 11, 6, 1, '#bcb4c0'); px(c, X + 9, Y + 12, 2, 3, '#7a7280');
          for (let k = 0; k < 13; k++) { const yy = Y - 3 + k, half = Math.max(1, Math.round(k * 0.45)); px(c, X + 8 - half - 1, yy, half * 2 + 2, 1, '#1e3a26'); for (let dx = -half; dx < half; dx++) px(c, X + 8 + dx, yy, 1, 1, dx < -half / 3 ? '#4e8a4e' : dx < half / 3 ? '#3a7040' : '#2e5a34'); }
          px(c, X + 7, Y - 4, 2, 1, '#4e8a4e');
          break;
        } // avlu dışı: çalı
        { // çalı: gölgeli yaprak kümeleri, çiçek ya da böğürtlen
          grass(c, X, Y, x, y);
          px(c, X + 2, Y + 13, 12, 2, 'rgba(30,50,30,0.15)');
          if (y < 21) { // çobanpüskülü çit: koyu parlak yapraklar, kırmızı meyveler
            canopy(c, X, Y, [[5, 10, 4], [11, 10, 4], [8, 6, 5]], OAK, x * 5 + y, false);
            for (const [bx, by] of [[4, 8], [10, 6], [7, 11], [12, 10]]) { px(c, X + bx, Y + by, 2, 2, '#b8262e'); px(c, X + bx, Y + by, 1, 1, '#e86068'); }
          } else { // funda: alçak mor çiçekli küme
            canopy(c, X, Y, [[5, 11, 4], [11, 11, 4], [8, 9, 4]], ['#2a3a24', '#3e5232', '#4e6a3e', '#62804c', '#7a9660'], x * 5 + y, false);
            for (let k = 0; k < 14; k++) { const fx = X + 2 + Math.floor(hash(x * 3 + k, y) * 12), fy = Y + 6 + Math.floor(hash(y * 3 + k, x) * 8); px(c, fx, fy, 1, 2, k % 3 ? '#9a62a8' : '#c08ad0'); }
          }
          break;
        }
        case 'l': // fener direği (alevi ve ışığı dinamik)
          grass(c, X, Y, x, y);
          px(c, X + 7, Y + 5, 2, 10, '#5a5468'); px(c, X + 5, Y + 14, 6, 1, '#4a4458');
          px(c, X + 5, Y + 1, 6, 5, '#4a4458'); px(c, X + 6, Y + 2, 4, 3, '#f6e0a0');
          break;
        case 'v': { // merdiven boşluğu: aşağıda yıldızlı, büyülü bir derinlik
          const k = (y - 4) / 3;
          px(c, X, Y, T, T, k < 0.34 ? '#20204a' : k < 0.67 ? '#1a1a3e' : '#141432');
          for (let i = 0; i < 3; i++) { const h = hash(x * 3 + i, y * 7); if (h > 0.4) px(c, X + Math.floor(hash(y + i, x) * 15), Y + Math.floor(hash(x + i, y + 2) * 15), 1, 1, h > 0.85 ? '#ffffff' : '#7a7ac8'); }
          if (hash(x, y) > 0.8) { px(c, X + 6, Y + 6, 3, 1, '#c8b8ff'); px(c, X + 7, Y + 5, 1, 3, '#c8b8ff'); }
          if (at(x, y - 1) !== 'v') { px(c, X, Y, T, 3, '#3a3460'); px(c, X, Y + 1, T, 1, '#d8b870'); for (let r = 1; r < T; r += 5) px(c, X + r, Y - 3, 1, 4, '#d8b870'); px(c, X, Y - 3, T, 1, '#e3c27a'); }
          if (at(x, y + 1) !== 'v') { px(c, X, Y + 13, T, 3, '#3a3460'); px(c, X, Y + 13, T, 1, '#d8b870'); }
          break;
        }
      }
    }
    // Ortak çizim tarzı: eşyaların piksellerini zeminden ayır (aynı karonun yalnız zeminiyle karşılaştır);
    // en sonda bu maskenin çevresine karakterlerdeki gibi koyu bir dış hat çizilir
    const soil = (c2, X, Y) => { px(c2, X, Y, T, T, '#8a6444'); for (let k = 0; k < 4; k++) px(c2, X, Y + 2 + k * 4, T, 1, '#6e4e34'); };
    const PROP_FLOOR = {};
    for (const ch of 'dOKYAnwkx!?|XB567') PROP_FLOOR[ch] = baseFloor;
    for (const ch of 'TjoE') PROP_FLOOR[ch] = (c2, X, Y, x, y) => floorStone(c2, X, Y, x, y);
    for (const ch of 'cJ') PROP_FLOOR[ch] = (c2, X, Y, x, y) => (y < 0 ? baseFloor(c2, X, Y, x, y) : floorStone(c2, X, Y, x, y, '#5e566a', '#544c60', '#6a7a62'));
    for (const ch of 'Hh') PROP_FLOOR[ch] = floorWood;
    for (const ch of 'Rzel=+C@[') PROP_FLOOR[ch] = grass;
    for (const ch of 'N&') PROP_FLOOR[ch] = soil;
    for (const ch of '()') PROP_FLOOR[ch] = (c2, X, Y) => px(c2, X, Y, T, T, '#5a3a62');
    for (const ch of 'Lm') PROP_FLOOR[ch] = (c2, X, Y) => px(c2, X, Y, T, T, '#c4a080');
    const BW = MW * T, BH = (MH + NORTH) * T, before = c.getImageData(0, 0, BW, BH).data;
    const fc = document.createElement('canvas'); fc.width = BW; fc.height = BH;
    const f2 = fc.getContext('2d'); f2.drawImage(bg, 0, 0); f2.translate(0, NORTH * T);
    const propTiles = [];
    for (let y = -NORTH; y < MH; y++) for (let x = 0; x < MW; x++) if (PROP_FLOOR[at(x, y)]) { PROP_FLOOR[at(x, y)](f2, x * T, y * T, x, y); propTiles.push([x, y]); }
    const floorOnly = f2.getImageData(0, 0, BW, BH).data, propMask = new Uint8Array(BW * BH);
    for (const [x, y] of propTiles) for (let yy = y * T; yy < y * T + T; yy++) for (let xx = x * T; xx < x * T + T; xx++) {
      const i = (yy + NORTH * T) * BW + xx, k = i * 4;
      if (before[k] !== floorOnly[k] || before[k + 1] !== floorOnly[k + 1] || before[k + 2] !== floorOnly[k + 2]) propMask[i] = 1;
    }

    // Eşyaların zemine düşen yumuşak gölgesi (alta ve sağa)
    const CASTS = new Set(['B', 'd', 'T', 'H', 'J', 'L', 'c', 'o', 'K', 'Y', 'A', 'n', 'x', 'z', 'e', 'l', 'X', 'O', 'N', 'C', 'M', 'E', '=', '&', '+', '*', '^', '5', '6', '7', '[']);
    for (let y = -NORTH; y < MH - 1; y++) for (let x = 0; x < MW; x++) {
      if (!CASTS.has(at(x, y))) continue;
      if (!SOLID.has(at(x, y + 1))) { px(c, x * T + 1, (y + 1) * T, T - 1, 3, 'rgba(60,40,30,0.18)'); px(c, x * T + 2, (y + 1) * T + 3, T - 3, 1, 'rgba(60,40,30,0.08)'); }
      if (x + 1 < MW && !SOLID.has(at(x + 1, y)) && at(x, y) !== 'B' && at(x, y) !== 'J') px(c, (x + 1) * T, y * T + 4, 2, T - 3, 'rgba(60,40,30,0.12)');
    }
    // Göl: karoların köşeli kıyısı yerine kavisli kıyı. Su karolarının merkezlerine uzaklıkla şekil, kıyıya uzaklıkla derinlik
    const lakeC = [...tilesOf('b'), ...tilesOf('$'), ...tilesOf(',').filter(([x, y]) => y >= 25)].map(([x, y]) => [x * T + 8, y * T + 8]);
    // Yumuşak kıyı: her su karesi bir "metaball"; toplam alan eşiği geçen yer su olur (köşesiz, birleşik bir göl)
    const LX = 13 * T, LY0 = 22 * T, LH = 9 * T, field = new Float32Array(LX * LH), wet = new Uint8Array(LX * LH);
    for (let j = 0; j < LH; j++) for (let qx = 0; qx < LX; qx++) {
      const py = LY0 + j;
      let f = 0;
      for (const [cx, cy] of lakeC) { const d2 = (qx - cx) * (qx - cx) + (py - cy) * (py - cy); if (d2 < 900) f += Math.exp(-d2 / 128); }
      f += Math.sin(qx * 0.29 + py * 0.13) * 0.03;
      field[j * LX + qx] = f;
      const tch = at(Math.floor(qx / T), Math.floor(py / T));
      wet[j * LX + qx] = f > 0.55 && tch !== 'Z' ? 1 : 0;
    }
    // Derinlik: her su pikselinin kıyıya uzaklığı (iki geçişli mesafe dönüşümü)
    const dist = new Float32Array(LX * LH);
    for (let i = 0; i < dist.length; i++) dist[i] = wet[i] ? 1e9 : 0;
    for (let j = 0; j < LH; j++) for (let q = 0; q < LX; q++) {
      const i = j * LX + q; if (!dist[i]) continue;
      if (q > 0) dist[i] = Math.min(dist[i], dist[i - 1] + 1);
      if (j > 0) { dist[i] = Math.min(dist[i], dist[i - LX] + 1); if (q > 0) dist[i] = Math.min(dist[i], dist[i - LX - 1] + 1.4); if (q < LX - 1) dist[i] = Math.min(dist[i], dist[i - LX + 1] + 1.4); }
    }
    for (let j = LH - 1; j >= 0; j--) for (let q = LX - 1; q >= 0; q--) {
      const i = j * LX + q; if (!dist[i]) continue;
      if (q < LX - 1) dist[i] = Math.min(dist[i], dist[i + 1] + 1);
      if (j < LH - 1) { dist[i] = Math.min(dist[i], dist[i + LX] + 1); if (q < LX - 1) dist[i] = Math.min(dist[i], dist[i + LX + 1] + 1.4); if (q > 0) dist[i] = Math.min(dist[i], dist[i + LX - 1] + 1.4); }
    }
    for (let j = 0; j < LH; j++) for (let qx = 0; qx < LX; qx++) {
      const i = j * LX + qx, py = LY0 + j, tch = at(Math.floor(qx / T), Math.floor(py / T));
      if (tch === ',' || (SOLID.has(tch) && !'b$'.includes(tch))) continue; // iskele, çalı, fener, ağaç olduğu gibi kalsın
      if (wet[i]) { // kıyıdan derine: dama dokulu yumuşak geçiş (keskin halkalar olmasın)
        const d = dist[i] + ((qx + py) % 2) * 1.6 - 0.8;
        px(c, qx, py, 1, 1, dist[i] < 1.5 ? '#a8d0dc' : d < 4 ? '#3f7a8c' : d < 9 ? '#336a7e' : d < 14 ? '#2a596e' : '#204a5e');
      }
      else if (field[i] > 0.3 && !'b$'.includes(tch)) px(c, qx, py, 1, 1, field[i] > 0.45 ? '#a8946c' : '#c4b48a'); // ıslak ve kuru kum
    }
    for (const [cx, cy] of lakeC) { // durgun su çizgileri ve kıyıda çakıllar
      if (at(Math.floor(cx / T), Math.floor(cy / T)) === ',') continue;
      if (hash(cx, cy) > 0.5) px(c, cx - 3, cy + 2, 5, 1, '#4e8a9c');
      if (hash(cy, cx) > 0.6) px(c, cx + 1, cy - 4, 3, 1, '#4e8a9c');
    }
    for (let i = 0; i < 26; i++) { const ang = hash(i, 71) * 6.283, [cx, cy] = lakeC[Math.floor(hash(i, 73) * lakeC.length)]; const qx = Math.round(cx + Math.cos(ang) * 15), py = Math.round(cy + Math.sin(ang) * 15), tch = at(Math.floor(qx / T), Math.floor(py / T)); if (!'b$,'.includes(tch)) px(c, qx, py, 2, 1, '#a8a090'); }
    for (const [x, y] of tilesOf(',').filter(([, y]) => y >= 21)) { // iskele: kenar kirişleri ve suya inen dikmeler
      const X = x * T, Y = y * T;
      px(c, X, Y, 1, T, '#4a3020'); px(c, X + 15, Y, 1, T, '#4a3020');
      if (y >= 25) { px(c, X - 1, Y + 12, 2, 5, '#3a2618'); px(c, X + 15, Y + 12, 2, 5, '#3a2618'); px(c, X - 1, Y + 16, 2, 1, '#a8d0dc'); px(c, X + 15, Y + 16, 2, 1, '#a8d0dc'); }
      if (at(x, y + 1) !== ',') px(c, X, Y + 15, T, 1, '#3a2618');
    }
    for (const [x, y] of tilesOf('$')) { // nilüferler suyun üstünde
      const X = x * T, Y = y * T;
      px(c, X + 3, Y + 6, 9, 5, '#4e8a4e'); px(c, X + 4, Y + 5, 7, 7, '#5a9a56'); px(c, X + 7, Y + 5, 2, 3, '#336a7e');
      px(c, X + 5, Y + 7, 3, 1, '#7ac87a'); px(c, X + 9, Y + 8, 2, 2, '#f6a8c8'); px(c, X + 10, Y + 7, 1, 1, '#ffd0e0');
    }
    for (const [x, y] of tilesOf('%')) { // sazlar kumun üstünde yeniden
      const X = x * T, Y = y * T;
      for (let k = 0; k < 4; k++) {
        const sx = X + 2 + k * 3 + Math.floor(hash(x + k, y) * 2), sh = 7 + Math.floor(hash(y + k, x) * 4);
        px(c, sx, Y + 15 - sh, 1, sh, '#4a8a4a');
        if (k % 2 === 0) { px(c, sx - 1, Y + 14 - sh, 2, 3, '#8a5a3a'); px(c, sx, Y + 13 - sh, 1, 1, '#4a8a4a'); }
      }
    }
    // Ağaçlar: karoların hepsinden sonra, yukarıdan aşağıya (alttaki ağaç üsttekinin önünde kalır)
    for (let y = -NORTH; y < MH; y++) for (let x = 0; x < MW; x++) if ('t*^'.includes(at(x, y))) drawTree(c, x, y);
    // Seyirci kuleleri: bina renginde bez, sivri çatı ve bayrak (bir karo yukarı taşar)
    for (const [x, house] of TOWERS) {
      const X = x * T, Y = 23 * T, h = Scene.HOUSES[house];
      px(c, X + 1, Y - 12, 14, 12, h.a); px(c, X + 1, Y - 12, 14, 2, h.b); px(c, X + 1, Y - 2, 14, 2, h.b);
      px(c, X + 3, Y - 9, 2, 5, '#3a2a1e'); px(c, X + 7, Y - 9, 2, 5, '#3a2a1e'); px(c, X + 11, Y - 9, 2, 5, '#3a2a1e');
      for (let k = 0; k < 6; k++) px(c, X + 2 + k, Y - 13 - k, 12 - k * 2, 1, h.b);
      px(c, X + 7, Y - 22, 1, 4, '#5a4a3a'); px(c, X + 8, Y - 22, 4, 2, h.a);
    }
    // Koridor halısı: altın kenar ve aralıklı motifler
    for (let x = 2; x <= 48; x++) {
      if (at(x, 10) !== 'r') continue;
      px(c, x * T, 10 * T + 4, T, 1, '#e3c27a'); px(c, x * T, 12 * T - 4, T, 1, '#e3c27a');
      if (x % 4 === 0) { const cx = x * T + 8, cy = 11 * T; for (let k = 0; k < 4; k++) px(c, cx - k, cy - 3 + k, k * 2 + 1, 1, '#e3c27a'); for (let k = 0; k < 3; k++) px(c, cx - 2 + k, cy + 1 + k, 5 - k * 2, 1, '#e3c27a'); px(c, cx, cy, 1, 1, '#9c1c1c'); }
    }
    // Koridor duvarında bina renklerinde duvar halıları
    const tapCols = ['kizil', 'zumrut', 'safir', 'kehribar'];
    [3, 8, 11, 14, 19, 23, 31, 33, 39, 47].forEach((x, i) => {
      if (at(x, 9) !== '#') return;
      const h = Scene.HOUSES[tapCols[i % 4]], X = x * T + 4, Y = 9 * T + 1;
      px(c, X - 1, Y, 10, 1, '#8a6a3a'); px(c, X, Y + 1, 8, 11, h.a); px(c, X, Y + 1, 1, 11, h.b); px(c, X + 7, Y + 1, 1, 11, h.b);
      px(c, X + 2, Y + 4, 4, 4, h.b); px(c, X + 3, Y + 5, 2, 2, h.a);
      px(c, X, Y + 12, 2, 2, h.a); px(c, X + 3, Y + 12, 2, 2, h.a); px(c, X + 6, Y + 12, 2, 2, h.a);
    });
    // İksir zindanı: köşelerde örümcek ağı, yerde mantar ve mum kümeleri, yeşil iksir lekeleri
    const web = (X, Y, fx) => { for (let k = 0; k < 7; k++) { px(c, X + (fx ? 15 - k : k), Y, 1, 1, '#b8b0c8'); px(c, X + (fx ? 15 : 0), Y + k, 1, 1, '#b8b0c8'); px(c, X + (fx ? 15 - k : k), Y + 6 - k, 1, 1, 'rgba(200,190,220,0.7)'); } px(c, X + (fx ? 12 : 3), Y + 2, 1, 1, '#b8b0c8'); };
    web(1 * T, 14 * T, false); web(8 * T, 14 * T, true); web(1 * T, 19 * T + 6, false);
    const candleSet = (X, Y) => { for (const [dx, h] of [[0, 6], [4, 4], [7, 7]]) { px(c, X + dx, Y - h, 2, h, '#efe6cf'); px(c, X + dx, Y - h, 1, h, '#fff8e6'); px(c, X + dx, Y - h - 3, 2, 2, '#ffd46b'); px(c, X + dx, Y - h - 4, 1, 1, '#fff2b0'); px(c, X + dx + 1, Y - h - 1, 1, 1, '#ff9a3c'); } };
    candleSet(1 * T + 3, 16 * T + 14); candleSet(8 * T + 3, 16 * T + 14); candleSet(5 * T + 3, 14 * T + 14);
    const shroom = (X, Y, col) => { px(c, X + 1, Y + 2, 1, 2, '#e8dcc0'); px(c, X, Y, 3, 2, col); px(c, X + 4, Y + 3, 1, 1, '#e8dcc0'); px(c, X + 3, Y + 2, 3, 1, col); };
    shroom(3 * T + 2, 14 * T + 10, '#9a6ad8'); shroom(6 * T + 9, 19 * T + 8, '#5ac8a0'); shroom(1 * T + 9, 18 * T + 3, '#9a6ad8');
    for (const [x, y] of [[4, 16], [6, 14], [3, 19]]) { px(c, x * T + 2, y * T + 6, 10, 4, 'rgba(110,230,120,0.35)'); px(c, x * T + 4, y * T + 5, 6, 6, 'rgba(110,230,120,0.25)'); }
    // Gözlemevi: halıda altın takımyıldızlar, zeminde yıldız kakmaları
    const cons = [[36, 4, 2, 3], [37, 5, 12, 2], [38, 4, 8, 6], [39, 6, 4, 10], [37, 6, 6, 12]];
    for (let i = 0; i < cons.length; i++) {
      const [x, y, dx, dy] = cons[i], X = x * T + dx, Y = y * T + dy;
      px(c, X, Y, 2, 2, '#fff0a0');
      if (i) { const [px0, py0, ddx, ddy] = cons[i - 1], X0 = px0 * T + ddx, Y0 = py0 * T + ddy, n = Math.max(Math.abs(X - X0), Math.abs(Y - Y0)); for (let k = 2; k < n; k += 2) px(c, Math.round(X0 + (X - X0) * k / n), Math.round(Y0 + (Y - Y0) * k / n), 1, 1, '#e3c27a'); }
    }
    for (const [x, y] of [[35, 7], [40, 7], [34, 5], [38, 2], [35, 2]]) { const X = x * T + 8, Y = y * T + 8; px(c, X - 2, Y, 5, 1, '#c9a24a'); px(c, X, Y - 2, 1, 5, '#c9a24a'); }
    // Gizli Kütüphane: kürsünün çevresinde yuvarlak mor halı
    for (let yy = -18; yy <= 18; yy++) for (let xx = -26; xx <= 26; xx++) {
      const d = (xx * xx) / (26 * 26) + (yy * yy) / (18 * 18);
      if (d > 1) continue;
      const X = 37 * T + 8 + xx, Y = 16 * T + 8 + yy;
      if (at(Math.floor(X / T), Math.floor(Y / T)) !== ',') continue;
      px(c, X, Y, 1, 1, d > 0.86 ? '#d8b870' : d > 0.72 ? '#5a3a7a' : (xx + yy) % 6 === 0 ? '#7a5aa0' : '#6a4a8a');
    }
    // Sera: cam duvarlardan sarkan sarmaşıklar ve ara sıra çiçek
    for (let y = 13; y <= 19; y++) for (const x of [23, 33]) {
      if (at(x, y) !== 'G') continue;
      const X = x * T + (x === 23 ? 10 : 1), Y = y * T;
      for (let k = 0; k < T; k += 2) px(c, X + Math.round(Math.sin((y * T + k) * 0.4) * 2), Y + k, 2, 2, k % 6 === 0 ? '#6ab06a' : '#4a8a4a');
      if (hash(x, y) > 0.5) { px(c, X, Y + 7, 3, 3, '#f6a8c8'); px(c, X + 1, Y + 8, 1, 1, '#ffe060'); }
    }
    // Kule: tepede baykuşhane samanı ve tüyler, altta mavi yuvarlak halı
    for (let x = 25; x <= 32; x++) for (let y = 2; y <= 3; y++) {
      if (at(x, y) !== '.') continue;
      for (let k = 0; k < 6; k++) { const X = x * T + Math.floor(hash(x * 9 + k, y) * 14), Y = y * T + Math.floor(hash(y * 9 + k, x) * 14); px(c, X, Y, 3, 1, k % 2 ? '#d8c070' : '#c8a850'); }
      if (hash(x, y) > 0.5) { const X = x * T + 5, Y = y * T + 9; px(c, X, Y, 1, 1, '#f3ead2'); px(c, X + 1, Y - 1, 1, 1, '#f3ead2'); px(c, X + 2, Y - 2, 2, 1, '#cfc4a8'); }
    }
    for (let yy = -12; yy <= 12; yy++) for (let xx = -40; xx <= 40; xx++) {
      const d = (xx * xx) / 1600 + (yy * yy) / 144, X = 28.5 * T + xx, Y = 7.5 * T + yy;
      if (d > 1 || at(Math.floor(X / T), Math.floor(Y / T)) !== '.') continue;
      px(c, X, Y, 1, 1, d > 0.85 ? '#d8b870' : d > 0.65 ? '#2a3a7a' : (xx * 3 + yy) % 9 === 0 ? '#e3c27a' : '#3a4c8a');
    }
    // Kupa Odası: kapıdan kupaya uzanan kırmızı-altın halı ve kupanın çevresinde yuvarlak halı
    for (let y = 13 * T; y < 16 * T + 4; y++) for (let x = 46 * T + 2; x < 47 * T - 2; x++) {
      const e = x === 46 * T + 2 || x === 47 * T - 3;
      px(c, x, y, 1, 1, e ? '#e3b23c' : (y % 8 === 3 && Math.abs(x - 46 * T - 8) < 2) ? '#e3b23c' : '#9c2a32');
    }
    for (let yy = -15; yy <= 15; yy++) for (let xx = -24; xx <= 24; xx++) {
      const d = (xx * xx) / 576 + (yy * yy) / 225, X = 46 * T + 8 + xx, Y = 17 * T + 8 + yy;
      if (d > 1 || at(Math.floor(X / T), Math.floor(Y / T)) !== ',') continue;
      px(c, X, Y, 1, 1, d > 0.86 ? '#e3b23c' : d > 0.74 ? '#7a1e26' : (Math.abs(xx) + Math.abs(yy)) % 7 === 0 ? '#c84a52' : '#9c2a32');
    }
    // Kupa Odası duvarında bina sancakları
    [[44, 'kizil'], [45, 'zumrut'], [47, 'safir'], [48, 'kehribar']].forEach(([x, hs]) => {
      const h = Scene.HOUSES[hs], X = x * T + 4, Y = 12 * T + 1;
      px(c, X - 1, Y, 10, 1, '#c9a24a'); px(c, X, Y + 1, 8, 10, h.a); px(c, X, Y + 1, 1, 10, h.b); px(c, X + 7, Y + 1, 1, 10, h.b);
      px(c, X + 2, Y + 3, 4, 4, h.b); for (let k = 0; k < 4; k++) px(c, X + k, Y + 11 + k, 8 - k * 2, 1, h.a);
    });
    // Kule sahanlığında baykuş postası: mektup ve paket yığınları
    const parcel = (X, Y, w, h, col) => { px(c, X, Y, w, h, col); px(c, X, Y, w, 1, '#e8dcb0'); px(c, X + (w >> 1), Y, 1, h, '#c03a3a'); px(c, X, Y + (h >> 1), w, 1, '#c03a3a'); };
    parcel(26 * T + 2, 7 * T + 4, 9, 6, '#b08a5e'); parcel(26 * T + 4, 7 * T, 6, 4, '#c8a070'); parcel(31 * T + 3, 7 * T + 6, 8, 5, '#a07a50');
    for (const [dx, dy] of [[0, 0], [3, 2], [6, -1], [2, 5]]) { const X = 29 * T + 2 + dx, Y = 7 * T + 4 + dy; px(c, X, Y, 6, 4, '#f6eed8'); px(c, X + 2, Y + 1, 2, 1, '#c03a3a'); }
    // Uçuş sahasının köşe bayrakları
    for (const [x, y] of [[25, 25], [40, 25], [25, 29], [40, 29]]) {
      const X = x * T + (x === 25 ? 2 : 12), Y = y * T + (y === 25 ? 2 : 6);
      px(c, X, Y - 6, 1, 8, '#e8e0d0'); px(c, X + 1, Y - 6, 4, 3, y === 25 ? '#e05a50' : '#5aa8e0');
    }
    // Kuleler arasında renkli bayrak dizisi
    const flagCols = ['#e05a50', '#f0c040', '#5aa8e0', '#7ac06a', '#f6a8c8'];
    for (let i = 0; i < TOWERS.length - 1; i++) {
      const x0 = TOWERS[i][0] * T + 14, x1 = TOWERS[i + 1][0] * T + 2, y0 = 23 * T - 12;
      for (let x = x0; x <= x1; x++) {
        const k = (x - x0) / (x1 - x0), y = Math.round(y0 + Math.sin(k * Math.PI) * 6);
        px(c, x, y, 1, 1, '#5a4a3a');
        if ((x - x0) % 6 === 2) { const col = flagCols[((x - x0) / 6 + i) % flagCols.length | 0]; px(c, x - 1, y + 1, 3, 2, col); px(c, x, y + 3, 1, 1, col); }
      }
    }
    // Eşyaların dış hattı (maskenin hemen dışındaki pikseller koyulaşır)
    const outImg = c.getImageData(0, 0, BW, BH), od = outImg.data;
    for (let yy = 1; yy < BH - 1; yy++) for (let xx = 1; xx < BW - 1; xx++) {
      const i = yy * BW + xx;
      if (propMask[i]) continue;
      // eşya yukarıdaysa (piksel altında kalıyor) koyu, yanlardaysa orta, aşağıdaysa çok hafif
      const a = propMask[i - BW] ? 0.5 : propMask[i - 1] || propMask[i + 1] ? 0.32 : propMask[i + BW] ? 0.16 : 0;
      if (!a) continue;
      const k = i * 4;
      od[k] = od[k] * (1 - a) + 30 * a; od[k + 1] = od[k + 1] * (1 - a) + 22 * a; od[k + 2] = od[k + 2] * (1 - a) + 38 * a;
    }
    c.putImageData(outImg, 0, 0);
    // Duvarların dibine yumuşak gölge
    for (let y = -NORTH + 1; y < MH; y++) for (let x = 0; x < MW; x++) {
      const above = at(x, y - 1);
      if (!SOLID.has(at(x, y)) && (isWall(above) || above === 'S' || above === 'G')) {
        px(c, x * T, y * T, T, 3, 'rgba(60,40,30,0.16)'); px(c, x * T, y * T + 3, T, 2, 'rgba(60,40,30,0.07)');
      }
    }
    if (fountain) { // çeşmenin çevresinde taş döşemeye işlenmiş halka ve ışınlar; meydanın kenarında bordür
      const fx = fountain.x, fy = fountain.y;
      for (let dy = -40; dy <= 40; dy++) for (let dx = -40; dx <= 40; dx++) {
        const X = fx + dx, Y = fy + dy, d = Math.hypot(dx, dy);
        if (at(Math.floor(X / T), Math.floor(Y / T)) !== 'p' || d < 24) continue;
        if (Math.abs(d - 30) < 1.2) px(c, X, Y, 1, 1, '#d8ccb4');
        else if (Math.abs(d - 33) < 0.6) px(c, X, Y, 1, 1, '#8e8070');
        else if (d < 30 && Math.abs(((Math.atan2(dy, dx) + Math.PI) * 8 / Math.PI) % 2 - 1) < 0.06) px(c, X, Y, 1, 1, '#a89a84');
      }
      for (let y = 13; y <= 19; y++) for (let x = 10; x <= 22; x++) {
        if (at(x, y) !== 'p') continue;
        const X = x * T, Y = y * T, e = (dx, dy) => at(x + dx, y + dy) !== 'p' && at(x + dx, y + dy) !== 'F' && at(x + dx, y + dy) !== '#';
        if (e(-1, 0)) { px(c, X, Y, 2, T, '#7a6e60'); px(c, X + 2, Y, 1, T, '#c8bca4'); }
        if (e(1, 0)) { px(c, X + 14, Y, 2, T, '#7a6e60'); px(c, X + 13, Y, 1, T, '#c8bca4'); }
        if (e(0, -1)) { px(c, X, Y, T, 2, '#7a6e60'); px(c, X, Y + 2, T, 1, '#c8bca4'); }
        if (e(0, 1)) { px(c, X, Y + 14, T, 2, '#7a6e60'); }
      }
    }
    if (fountain) { // büyük taş çeşme: kenar, derzler, derinleşen su, ortada kademeli havuzcuk
      const fx = fountain.x, fy = fountain.y, R = 22;
      for (let dy = -R - 2; dy <= R + 2; dy++) for (let dx = -R - 2; dx <= R + 2; dx++) {
        const d = Math.hypot(dx, dy);
        if (d > R + 1.5) continue;
        let col;
        if (d > R + 0.5) col = dy > 0 ? 'rgba(30,22,38,0.55)' : 'rgba(30,22,38,0.35)'; // dış hat ve gölge
        else if (d > R - 3) { // taş kenar: sol üst aydınlık, sağ alt gölge; aralıklı derzler
          const lit = (-dx - dy) / R, seg = Math.round((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 8));
          col = Math.abs((Math.atan2(dy, dx) + Math.PI) / (Math.PI / 8) - seg) < 0.08 ? '#6e6670' : lit > 0.3 ? '#cdc6d0' : lit > -0.3 ? '#aaa2ae' : '#87808c';
        } else if (d > R - 4) col = '#5a5462'; // iç kenar gölgesi
        else col = d > R - 7 ? '#6aa8da' : d > 11 ? '#4a8ccc' : '#3e7ec0'; // su: kenarda açık, ortada koyu
        px(c, fx + dx, fy + dy, 1, 1, col);
      }
      for (const [a, r] of [[0.6, 15], [2.2, 13], [3.9, 16], [5.1, 12]]) { const x = Math.round(fx + Math.cos(a) * r), y = Math.round(fy + Math.sin(a) * r); px(c, x, y, 2, 1, '#e3b23c'); px(c, x, y, 1, 1, '#fff0a0'); } // dilek paraları
      for (let dy = -9; dy <= 9; dy++) for (let dx = -9; dx <= 9; dx++) { // orta kaide ve üst havuzcuk
        const d = Math.hypot(dx, dy + 2);
        if (d > 8.5) continue;
        px(c, fx + dx, fy + dy, 1, 1, d > 7.5 ? '#4a4450' : d > 5.5 ? ((-dx - dy) > 0 ? '#d8d0da' : '#9e96a2') : d > 4.6 ? '#5a5462' : '#78b4e2');
      }
      px(c, fx - 2, fy - 6, 4, 4, '#4a4450'); px(c, fx - 1, fy - 7, 2, 5, '#b8b0ba'); px(c, fx - 1, fy - 7, 1, 1, '#e8e0ea'); // fıskiye
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
  const player = { x: 0, y: 0, dir: 'down', moving: false, path: [], seated: false, toSeat: null, seatOff: [0, 0], pendingTalk: null };
  const othersMap = new Map(); // ortak odadaki arkadaşlar: id -> { name, look, x, y, tx, ty, dir, seated, ... }
  let seatRank = 0; // ortak odadaki sıram (0 = oda sahibi); oturma çakışmasını önler
  Object.assign(player, tileCenter(6, 11));

  const student = (house, hair, skin) => ({ look: { house, hair, skin, outfit: 'klasik' } });
  const NPCS = [
    { name: 'Headmaster Thornbury', look: { house: 'kehribar', hair: 'gumus', skin: 0 }, hat: 'hat', beard: true,
      extra: { H: '#9a4a58', h: '#b05a68', O: '#7a3a48', C: '#e3b23c', c: '#d8b870', R: '#e8e8f0' },
      area: [12, 4, 22, 4], start: [15, 4], speed: 20,
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
    { name: 'Maya', ...student('zumrut', 'kahve', 1), long: true, seat: [14, 6, 'right'],
      lines: ['Bu salonda yemek yemek de çalışmak da çok keyifli.', 'Masamızın rengi yeşil, gördün mü?', 'Tavandaki mumlar hiç düşmüyor, nasıl oluyor acaba?'],
      focus: '(Maya notlarını karıştırıyor)' },
    { name: 'Leo', ...student('safir', 'sari', 2), seat: [20, 7, 'left'],
      lines: ['Bugünkü ödevim tam üç parşömen!', 'Altın tabaklar hep parlıyor, kim siliyor bunları?', 'Sınavdan önce burada tekrar yapıyorum.'],
      focus: '(Leo kalemini çiğneyerek düşünüyor)' },
    { name: 'Oliver', ...student('kehribar', 'kahve', 3), area: [11, 4, 23, 8], start: [17, 7],
      lines: ['Bugünkü tatlı balkabağı turtası!', 'Bu salonun mumları hiç erimiyor, fark ettin mi?', 'Çalışmadan önce iyi bir kahvaltı şart.'],
      focus: 'Molada görüşürüz!' },
    { name: 'Ivy', ...student('kizil', 'sari', 0), long: true, area: [11, 4, 23, 8], start: [16, 8],
      lines: ['Tavana bak! Gerçek gökyüzünü gösteriyor.', 'Kayan yıldız görürsen dilek tut!', 'Kahvaltıdan sonra kütüphaneye gidiyorum.'],
      focus: 'Molada görüşürüz!' },
    { name: 'Theo', ...student('zumrut', 'siyah', 1), area: [1, 10, 32, 11], start: [20, 11],
      lines: ['Merdivenler yine yer değiştirdi, dikkat et!', 'Baykuşhaneye mektup göndermeye gidiyorum.', 'Koridordaki portreler çok geveze.'],
      focus: 'Molada görüşürüz!' },
    { name: 'Felix', ...student('kizil', 'kizil', 1), area: [10, 13, 22, 19], start: [12, 17],
      lines: ['Avlunun havası kafa açıyor!', 'Molada biraz yürümek iyi gelir.', 'Çeşmeye dilek tuttum: bol odak!'],
      focus: 'Molada görüşürüz!' },
    { name: 'Professor Lumen', look: { house: 'safir', hair: 'gumus', skin: 2 }, hat: 'hat', beard: true,
      extra: { H: '#2a3a6a', h: '#3a5a9a', O: '#24304e', C: '#e3b23c', c: '#d8b870' }, area: [35, 3, 40, 7], start: [36, 7],
      lines: ['Gözlemevine hoş geldin! Teleskoba bak, yıldızlar sana bir şey söyleyecek.', 'Her gece aynı yıldızlar… ama her gece biraz farklı.', 'Sabır, gökyüzünün en büyük dersidir.'],
      focus: 'Yıldızlar acele etmez; sen de odaklan.' },
    { name: 'Madam Inkridge', look: { house: 'kizil', hair: 'siyah', skin: 1 }, hat: 'hat', long: true,
      extra: { H: '#3a2a3a', h: '#5a4a5a', O: '#2e2430' }, area: [35, 14, 40, 17], start: [39, 15],
      lines: ['Bu raflardaki kitapları çok az kişi okudu.', 'Kürsüdeki eski kitabı oku; her gün başka bir sayfası açılır.', 'Sessizce… kitaplar uyuyor.'],
      focus: 'Şşş… bilgi sessizlikte büyür.' },
    { name: 'Bahçıvan Hollis', look: { house: 'kehribar', hair: 'kahve', skin: 2 }, beard: true,
      extra: { H: '#6a5a3a', h: '#8a7a4a', O: '#4a3e2a', C: '#7a9a4a', c: '#5a7a3a', R: '#8a6a4a' }, area: [12, 23, 20, 24], start: [18, 23],
      lines: ['Bu balkabakları Cadılar Gecesi\'ne yetişecek!', 'Gölün kıyısında yürümek kafayı dinlendirir.', 'Toprağa sabır ekersen başarı biçersin.', 'Ormana fazla yaklaşma; oradaki gözler hep uyanık.'],
      focus: 'Ben tarlaya bakarım, sen derslerine.' },
    { name: 'Hoca Swift', look: { house: 'safir', hair: 'sari', skin: 1 }, hat: 'hat',
      extra: { H: '#c8c8d0', h: '#e0e0e8', O: '#5a6a8a' }, area: [26, 25, 39, 29], start: [32, 27],
      lines: ['Uçuş sahasına hoş geldin! Süpürgeni sıkı tut.', 'Halkalardan geçen sayı alır; ama önce ödevler!', 'Odak da uçuş gibidir: dengeyi bulunca kolaylaşır.'],
      focus: 'Uçuş molada; şimdi ders zamanı!' },
    { name: 'Pıtpıt', kind: 'toad', area: [8, 23, 11, 24], start: [9, 24], speed: 22,
      lines: ['Vırak!', '(göle bakıp iç çekiyor)', 'Vıraak… vırak.'], focus: 'Vırak.' },
    { name: 'Madam Velora', look: { house: 'safir', hair: 'gumus', skin: 2 }, hat: 'hat', long: true,
      extra: { H: '#6a3a7a', h: '#8a5a9a', O: '#4a2a5a', C: '#e3b23c', c: '#d8b870' }, area: [45, 7, 47, 8], start: [46, 8],
      lines: ['Kehanet Kulesi\'ne hoş geldin. Büyük küreye bak; sis bugün sana bir şey söyleyecek.', 'Gelecek, bugün çalıştığın sayfalarda yazılı.', 'Minderlere otur, çayını yudumla, zihnini dinlendir.'],
      focus: 'Şşş… kürenin sisi odaklananları sever.' },
    { name: 'Nia', ...student('kizil', 'mavi', 1), long: true, area: [44, 14, 48, 18], start: [44, 18],
      lines: ['Dolaplardaki kupalar senin rozetlerin! Her yenisinde bir kupa daha parlıyor.', 'Ortadaki büyük kupa, haftayı kazanan binanın.', 'Rekor tahtasına bak; en uzun serin orada yazıyor.'],
      focus: '(Nia kupaları parlatıyor)' },
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
    Object.assign(n, tileCenter(sx, sy), { dir: n.seat ? n.seat[2] || 'up' : 'down', path: [], wait: 1 + Math.random() * 3, moving: false });
    if (n.seat) { const [dx, dy] = seatOff(n.seat); n.x += dx; n.y += dy; }
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
  const lakeTiles = tilesOf('b'), ballTiles = tilesOf('(');
  const cauldrons = tilesOf('c').map(([x, y], i) => ({ X: x * T, Y: y * T, col: ['#7ae07a', '#c07ae0', '#f0a040', '#6ac8f0'][i % 4] }));
  const perches = tilesOf('o').map(([x, y], i) => ({ X: x * T, Y: y * T, col: ['#8a6a4a', '#a8a8b0', '#6a4a3a', '#b08050', '#7a7a6a'][i % 5], p: i * 1.7 }));
  const SKY_STARS = Array.from({ length: 40 }, (_, i) => ({ x: Math.floor(hash(i, 51) * 206), y: Math.floor(hash(i, 52) * 30), p: hash(i, 53) * 6 }));

  // ---------- Doğu kanadı: kilitli kapılar, teleskop ve eski kitap ----------
  const lockTiles = [...tilesOf('Q'), ...tilesOf('U')];
  const scope = tilesOf('X')[0], lectern = tilesOf('O')[0];
  const FORTUNES = [
    'Yıldızlar diyor ki: bugün başladığın işi bitireceksin.',
    'Kuzey yıldızı parlıyor: küçük adımlar seni uzağa götürecek.',
    'Bir kuyruklu yıldız geçti: bugün beklenmedik bir fikir gelecek.',
    'Ay yarım ama sen tamsın: bir oturum daha, sonra dinlen.',
    'Takımyıldızlar sıralanmış: zor konu bugün kolaylaşacak.',
    'Gökyüzü açık: dikkatin de öyle olacak.',
    'Yıldız tozu masana düştü: bugün odaklanmak kolay.',
    'Parlak bir gezegen yükseliyor: arkadaşınla çalışmak iyi gelecek.',
  ];
  const PAGES = [
    'Bir konuyu birine anlatabiliyorsan, gerçekten öğrenmişsin.',
    'Zor işe günün en dinç saatinde başla.',
    'Molada ekrana değil uzağa bak; gözlerin de dinlensin.',
    'Büyük bir işi en küçük ilk adımına böl ve sadece onu yap.',
    'Unutmak öğrenmenin parçası; tekrar etmek büyünün kendisi.',
    'Telefonunu başka odada bırakan büyücü iki kat hızlı öğrenir.',
    'Su iç. Beyin de bir iksir kazanı gibi sıvı ister.',
    'Bugün dünkünden biraz daha iyi olmak yeter.',
  ];
  const lockMsg = ch => { const L = LOCKS[ch], need = Levels.need(L.lv()); return `${L.name} kilitli: ${need.name}'a geçince açılır (toplam ${need.h} sa odak).`; };
  // Günde bir kez +2 altın veren keşif noktaları
  // Kale etkinlikleri (balık, halka yarışı, teleskop, eski kitap): yalnızca gerçek molada ve bir mola hakkıyla
  // (🎟, her odak oturumunda 1) açılır. Hak, etkinlik başarıyla bitince harcanır; altın her etkinlikte günde bir kez.
  function canPlay(what) {
    if (focusing()) return `${what} molaya kalsın; şimdi odak zamanı!`;
    if (!isBreak()) return `${what} için önce bir odak oturumu bitir, sonra molada gel.`;
    if (!(data.breakTickets > 0)) return 'Mola hakkın kalmadı. Bir odak oturumu bitirince 🎟 kazanırsın.';
    return null;
  }
  function spendTicket(dayKey, coins, label) {
    data.breakTickets = Math.max(0, (data.breakTickets || 0) - 1);
    let txt = '';
    if (data[dayKey] !== todayKey()) { data[dayKey] = todayKey(); data.coins += coins; txt = ` +${coins} altın${label ? ` (${label})` : ''}`; }
    save(); render();
    return txt;
  }
  function dailyBonus(dayKey, flag, who, list, anchor, bumpKey) {
    if (data[dayKey] === todayKey()) return say(who, 'Bugün buna zaten baktın; yarın yine gel!', anchor, 4);
    const no = canPlay(who);
    if (no) return say(who, no, anchor, 5);
    (data.flags ||= {})[flag] = true;
    say(who, list[Math.floor(Math.random() * list.length)] + spendTicket(dayKey, 2), anchor, 6);
    if (bumpKey) bump(bumpKey);
  }
  // Kehanet Kulesi: büyük kristal küre
  const BALL = [
    'Kürede bir anahtar görüyorum: bugün başladığın iş, yarın kapı açacak.',
    'Sis dağılıyor… Küçük adımların toplamı, sandığından büyük.',
    'Bir yıldız parlıyor: zor konuyu sabah çalışırsan kolaylaşacak.',
    'Kürede bir kum saati var. Mola vermeyi unutma; o da büyünün parçası.',
    'Mor bir ışık… Bugün birine yardım edersen, sen de daha iyi öğreneceksin.',
    'Bir kitap açılıyor: aradığın cevap, tekrar ettiğin notlarda saklı.',
  ];
  const bigBall = [46, 2];
  const gazeBall = () => dailyBonus('ballDay', 'ball', 'Kristal küre', BALL, { x: bigBall[0] * T + 8, y: bigBall[1] * T }, 'ball');

  // Baykuşhane: dört tünekteki baykuşu sırayla besle (hak, dördü de doyunca harcanır)
  const perchTiles = tilesOf('o');
  const owlState = () => { if (data.owlFeed?.date !== todayKey()) data.owlFeed = { date: todayKey(), fed: [] }; return data.owlFeed; };
  function feedOwl(i) {
    const st = owlState(), [x, y] = perchTiles[i], anchor = { x: x * T + 8, y: y * T };
    if (data.owlDay === todayKey()) return say('Baykuşhane', 'Baykuşlar bugün tok; yarın yine besle!', anchor, 4);
    if (st.fed.includes(i)) return say('Baykuş', 'Huu! Bu baykuş zaten yedi; diğerlerine bak.', anchor, 3);
    const no = canPlay('Baykuş beslemek');
    if (no) return say('Baykuşhane', no, anchor, 4);
    st.fed.push(i);
    if (st.fed.length < perchTiles.length) { save(); return say('Baykuş', `Huu huu! Mutlu bir baykuş. (${st.fed.length}/${perchTiles.length})`, anchor, 3); }
    say('Pip', `Bütün baykuşlar doydu, kanatları parlıyor!${spendTicket('owlDay', 2)}`, anchor, 5);
    bump('owls');
  }
  const perchNear = () => { let best = -1, bd = 24; perchTiles.forEach(([x, y], i) => { const d = tileDist([x, y]); if (d < bd) { bd = d; best = i; } }); return best; };

  // Kayıp kitaplar: Madam Quillby'den görev; kalede 3 parlayan kitap belirir, bulup ona getirirsin
  let hunt = null; // { books: [{ x, y, got }] }
  function startHunt(n) {
    const [px0, py0] = tileOf(player), books = [];
    const zones = [[11, 4, 23, 8], [2, 10, 40, 11], [11, 13, 22, 19], [24, 15, 32, 19], [2, 14, 8, 19], [25, 7, 32, 8], [3, 21, 40, 24], [43, 3, 49, 7]];
    for (let k = 0; k < 60 && books.length < 3; k++) {
      const [x0, y0, x1, y1] = zones[Math.floor(Math.random() * zones.length)];
      const x = x0 + Math.floor(Math.random() * (x1 - x0 + 1)), y = y0 + Math.floor(Math.random() * (y1 - y0 + 1));
      if (!walkable(x, y) || '_vjD'.includes(at(x, y)) || books.some(b => Math.abs(b.x - x) + Math.abs(b.y - y) < 8)) continue;
      if (findPath(px0, py0, x, y)) books.push({ x, y, got: false });
    }
    hunt = { books };
    say(n.name, 'Üç kitabım kalede kayboldu! Parıldayan kitapları bul, bana getir. (Molada ara.)', n, 5);
  }
  function updateHunt() {
    if (!hunt || !isBreak()) return;
    for (const b of hunt.books) {
      if (b.got || Math.hypot(player.x - b.x * T - 8, player.y - b.y * T - 10) > 14) continue;
      b.got = true;
      const n = hunt.books.filter(q => q.got).length;
      say('Kayıp kitap', n < 3 ? `Bir kitap buldun! (${n}/3)` : 'Üç kitabın hepsini buldun! Madam Quillby\'ye götür.', player, 3);
    }
  }
  function drawHunt() {
    if (!hunt) return;
    for (const b of hunt.books) {
      if (b.got) continue;
      const X = b.x * T + 8 - cam.x, Y = b.y * T + 6 - cam.y + Math.round(Math.sin(t * 3 + b.x) * 1.5);
      if (X < -10 || X > VW + 10 || Y < -10 || Y > VH + 10) continue;
      ctx.fillStyle = `rgba(255,240,170,${0.18 + 0.1 * Math.sin(t * 4)})`; ctx.fillRect(X - 6, Y - 6, 12, 11);
      px(ctx, X - 4, Y - 2, 8, 5, '#7a3a6a'); px(ctx, X - 4, Y - 2, 8, 1, '#a85a8a'); px(ctx, X - 3, Y + 3, 7, 1, '#efe3b8'); px(ctx, X - 1, Y - 1, 2, 2, '#e3b23c');
      if (Math.sin(t * 5 + b.y) > 0.5) px(ctx, X + 4, Y - 5, 1, 1, '#ffffff');
    }
  }
  function drawOwlHearts() {
    const st = data.owlFeed?.date === todayKey() ? data.owlFeed.fed : [];
    for (const i of st) {
      const [x, y] = perchTiles[i], X = x * T + 9 - cam.x, Y = y * T - 6 - cam.y - (t * 4 + i) % 4;
      if (X < -6 || X > VW || Y < -6 || Y > VH) continue;
      px(ctx, X, Y, 2, 1, '#f080a0'); px(ctx, X + 3, Y, 2, 1, '#f080a0'); px(ctx, X, Y + 1, 5, 1, '#f080a0'); px(ctx, X + 1, Y + 2, 3, 1, '#f080a0'); px(ctx, X + 2, Y + 3, 1, 1, '#f080a0');
    }
  }
  // Kupa Odası: kazandığın her rozet dolaplarda bir kupa olarak parlar (dolap başına 3 raf)
  const cabTiles = tilesOf('!'), bigCup = tilesOf('?')[0], recordBoard = tilesOf('|')[0];
  function drawTrophies() {
    const got = Badges.count();
    cabTiles.forEach(([x, y], ci) => {
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) return;
      for (let s = 0; s < 3; s++) {
        const i = ci * 3 + s, sx = X + 6, sy = Y + 2 + s * 5;
        if (i >= got.total) continue;
        if (i >= got.n) { px(ctx, sx + 1, sy + 3, 2, 1, 'rgba(255,220,220,0.18)'); continue; } // boş yer
        const [m, d] = [['#e3b23c', '#a8842c'], ['#d8dce8', '#9098b0'], ['#d08a52', '#8a5a32']][i % 3], kind = Math.floor(i / 3) % 3;
        if (kind === 0) { // kupa
          px(ctx, sx, sy, 4, 2, m); px(ctx, sx - 1, sy, 1, 1, m); px(ctx, sx + 4, sy, 1, 1, m); px(ctx, sx + 1, sy + 2, 2, 1, d); px(ctx, sx, sy + 3, 4, 1, d);
        } else if (kind === 1) { // kalkan
          px(ctx, sx, sy, 4, 2, m); px(ctx, sx + 1, sy + 2, 2, 1, m); px(ctx, sx + 1, sy, 2, 1, d); px(ctx, sx, sy + 3, 4, 1, '#3a2a1e');
        } else { // madalya
          px(ctx, sx + 1, sy - 1, 2, 1, '#2a4a8a'); px(ctx, sx, sy, 4, 3, m); px(ctx, sx + 1, sy + 1, 2, 1, d); px(ctx, sx, sy + 3, 4, 1, '#3a2a1e');
        }
        if (Math.sin(t * 2 + i) > 0.85) px(ctx, sx + 1, sy, 1, 1, '#ffffff');
      }
    });
    if (bigCup) {
      const X = bigCup[0] * T - cam.x, Y = bigCup[1] * T - cam.y;
      if (X > -T && X < VW && Y > -T && Y < VH) {
        const wins = data.houseWins || 0, col = Scene.HOUSES[data.look.house];
        if (wins) { ctx.fillStyle = `rgba(255,220,120,${0.12 + 0.06 * Math.sin(t * 2)})`; ctx.fillRect(X - 2, Y - 6, 20, 20); }
        px(ctx, X + 4, Y - 2, 8, 6, '#e3b23c'); px(ctx, X + 5, Y + 4, 6, 2, '#c9a24a'); px(ctx, X + 7, Y + 6, 2, 3, '#c9a24a'); px(ctx, X + 5, Y + 9, 6, 2, '#a8842c');
        px(ctx, X + 2, Y - 1, 2, 3, '#e3b23c'); px(ctx, X + 12, Y - 1, 2, 3, '#e3b23c'); px(ctx, X + 6, Y, 4, 2, col.a);
        if (wins && Math.sin(t * 3) > 0.5) px(ctx, X + 5, Y - 1, 1, 1, '#ffffff');
      }
    }
  }
  function readTrophies(i) {
    const got = Badges.count();
    say('Kupa dolabı', `Kazandığın her rozet burada bir kupa: ${got.n}/${got.total}.${got.last ? ` Son kupan: ${got.last}.` : ' İlk rozetini kazan, ilk kupa parlasın!'}`, { x: cabTiles[i][0] * T + 8, y: cabTiles[i][1] * T }, 5);
  }
  function readCup() {
    const w = data.houseWins || 0;
    say('Bina Kupası', w ? `${Scene.HOUSES[data.look.house].name} binası bu kupayı ${w} kez kazandı! Bu hafta da salonun kum saatlerini doldur.` : 'Haftanın kazanan binası bu kupayı alır. Büyük Salon\'daki kum saatlerinde binanı öne geçir!', { x: bigCup[0] * T + 8, y: bigCup[1] * T - 8 }, 5);
  }
  function readRecords() {
    const hrs = Math.floor(Object.values(data.days).reduce((a, d) => a + (d.sec || 0), 0) / 3600), fish = Object.keys(data.fishBook || {}).length;
    say('Rekor tahtası', `En uzun seri: ${Badges.longest()} gün · Toplam odak: ${hrs} sa · Halka yarışı: ${data.raceBest ? data.raceBest.toFixed(1) + ' sn' : '—'} · Balık defteri: ${fish}/6 · Bina kupası: ${data.houseWins || 0}`, { x: recordBoard[0] * T + 8, y: recordBoard[1] * T }, 7);
  }
  const cabNear = () => { let best = -1, bd = 22; cabTiles.forEach(([x, y], i) => { const d = tileDist([x, y]); if (d < bd) { bd = d; best = i; } }); return best; };

  function drawBalls() { // kristal kürelerin içinde dönen sis
    for (const [x, y] of ballTiles) {
      const X = x * T + 8 - cam.x, Y = y * T + 6 - cam.y;
      if (X < -8 || X > VW + 8 || Y < -8 || Y > VH + 8) continue;
      for (let k = 0; k < 3; k++) { const a = t * 1.5 + k * 2.1 + x; px(ctx, X + Math.round(Math.cos(a) * 2), Y + Math.round(Math.sin(a) * 2), 1, 1, ['#ffffff', '#f0c0ff', '#a0e8ff'][k]); }
    }
  }
  const lookScope = () => dailyBonus('skyDay', 'sky', 'Teleskop', FORTUNES, { x: scope[0] * T + 8, y: scope[1] * T });
  const readBook = () => dailyBonus('bookDay', 'book', 'Eski kitap', PAGES, { x: lectern[0] * T + 8, y: lectern[1] * T });
  const tileDist = ([tx, ty]) => Math.hypot(player.x - tx * T - 8, player.y - ty * T - 10);
  const nearTile = (p, r = 26) => tileDist(p) < r;
  // E tuşu: yakındaki teleskop, kitap ya da kilitli kapı → { fn, d } (d: uzaklık, NPC ile kıyaslanır)
  function specialNear() {
    if (scope && nearTile(scope)) return { fn: lookScope, d: tileDist(scope) };
    if (nearTile(DOCK, 16)) return { fn: startFishing, d: tileDist(DOCK) };
    // Bekleyen etkinlik varsa yakındaki NPC'den önce gelir (d: 0)
    if (nearTile(bigBall, 24)) return { fn: gazeBall, d: data.ballDay === todayKey() ? tileDist(bigBall) : 0 };
    const pi = perchNear();
    if (pi >= 0) return { fn: () => feedOwl(pi), d: data.owlDay === todayKey() || owlState().fed.includes(pi) ? tileDist(perchTiles[pi]) : 0 };
    if (bigCup && nearTile(bigCup, 24)) return { fn: readCup, d: tileDist(bigCup) };
    if (recordBoard && nearTile(recordBoard, 22)) return { fn: readRecords, d: tileDist(recordBoard) };
    const ci = cabNear();
    if (ci >= 0) return { fn: () => readTrophies(ci), d: tileDist(cabTiles[ci]) };
    const mg = magicNear();
    if (mg) return { fn: () => readMagic(mg), d: tileDist(mg) };
    if (signNear()) return { fn: () => say('Tabela', '← Göl ve iskele (balık) · ↓ Balkabağı tarlası ve kulübe · Uçuş sahası (halka yarışı) →', { x: 18 * T + 8, y: 22 * T }, 5), d: tileDist([18, 22]) };
    for (const [x, y] of GLASSES) if (nearTile([x, y], 24)) return { fn: readGlasses, d: tileDist([x, y]) };
    const rm = roamerNear();
    if (rm) return { fn: () => say(rm.name, `${rm.name} ${ROAM_LINES[Math.floor(Math.random() * ROAM_LINES.length)]}`, rm, 3), d: Math.hypot(rm.x - player.x, rm.y - player.y) };
    if (lectern && nearTile(lectern)) return { fn: readBook, d: tileDist(lectern) };
    for (const [x, y] of lockTiles) {
      const ch = at(x, y);
      if (!LOCKS[ch].open() && nearTile([x, y], 22)) return { fn: () => say(LOCKS[ch].name, lockMsg(ch), { x: x * T + 8, y: y * T }, 5), d: tileDist([x, y]) };
    }
    return null;
  }
  // Kilitli kapılar: tahta kapı ve ortasında altın kilit
  function drawLocks() {
    const shut = lockTiles.filter(([x, y]) => !LOCKS[at(x, y)].open());
    for (const [x, y] of shut) {
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      px(ctx, X, Y, T, T, '#6a4a30');
      for (let k = 3; k < T; k += 4) px(ctx, X + k, Y, 1, T, '#553a24');
      px(ctx, X, Y + 3, T, 1, '#8a6a4a'); px(ctx, X, Y + 12, T, 1, '#8a6a4a');
    }
    for (const [x, y] of shut) {
      if (at(x + 1, y) !== at(x, y)) continue; // kilit iki kanadın ortasında
      const X = x * T - cam.x, Y = y * T - cam.y;
      px(ctx, X + 13, Y + 6, 6, 5, '#e3b23c'); px(ctx, X + 14, Y + 4, 4, 2, '#c8a040'); px(ctx, X + 15, Y + 8, 2, 2, '#5a4030');
    }
  }

  // ---------- Yol bulma (karo ızgarasında BFS) ----------
  function findPath(sx, sy, tx, ty) {
    if (sx === tx && sy === ty) return [];
    const key = (x, y) => (y + NORTH) * MW + x;
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
          for (let c = k; c !== key(sx, sy); c = prev.get(c)) out.unshift([c % MW, Math.floor(c / MW) - NORTH]);
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
    const taken = new Set(NPCS.filter(n => n.seat).map(n => n.seat.slice(0, 2).join()));
    for (const o of othersMap.values()) if (o.seated) for (const s of SEATS) { // arkadaşın oturduğu yer
      const c = tileCenter(s[0], s[1]), [dx, dy] = seatOff(s);
      if (Math.hypot(c.x + dx - o.x, c.y + dy - o.y) < 6) taken.add(s.slice(0, 2).join());
    }
    const [px0, py0] = tileOf(player);
    const options = [];
    for (const s of SEATS) {
      if (taken.has(s.slice(0, 2).join())) continue;
      const p = findPath(px0, py0, s[0], s[1]);
      if (p) options.push({ seat: s, path: p });
    }
    options.sort((a, b) => a.path.length - b.path.length);
    // Ortak odada herkes aynı anda oturur: sıra numarası kadar ileri sandalyeyi seç ki çakışmasın
    let best = options[Math.min(seatRank, options.length - 1)];
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
      if (player.seated) { player.x -= player.seatOff[0]; player.y -= player.seatOff[1]; }
      player.seated = false; player.toSeat = null; player.path = [];
    }

    if (data.autoWalk && visible && !focusing() && !player.seated && !player.toSeat && !player.path.length && !keys.size
      && t - lastInput > 6 && t > nextWander && !mailOwl) wander();

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
        const len = Math.hypot(vx, vy), sp = (race ? 115 : 66) * dt;
        const nx = player.x + vx / len * sp, ny = player.y + vy / len * sp;
        if (!blocked(nx, player.y)) player.x = nx;
        if (!blocked(player.x, ny)) player.y = ny;
        player.dir = vx ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
        player.moving = true;
      } else if (follow(player, player.toSeat ? 74 : race ? 115 : 66, dt)) {
        if (player.toSeat) {
          const off = seatOff(player.toSeat);
          player.seated = true; player.dir = player.toSeat[2] || 'up'; player.seatOff = off;
          player.x += off[0]; player.y += off[1]; player.toSeat = null;
        }
        if (player.pendingTalk) { talk(player.pendingTalk); player.pendingTalk = null; }
      }
    } else player.moving = false;

    for (const n of NPCS) updateNpc(n, dt);
    updateFishing(); updateRace(); updateRoamers(dt); updateHunt();
    for (const o of othersMap.values()) {
      const dx = o.tx - o.x, dy = o.ty - o.y, d = Math.hypot(dx, dy);
      if (d > 80) { o.x = o.tx; o.y = o.ty; } // çok uzaksa ışınla (ör. masaya oturdu)
      else if (d > 0.5) { const s = Math.min(d, 90 * dt); o.x += dx / d * s; o.y += dy / d * s; }
      o.walking = o.moving || d > 1.5;
    }
    updateMail(dt);
    if (bubble && t > bubble.until) bubble = null;
    if (!bubble) proximityChatter();
    if (isBreak() && fountain && !quests().c.fountain && Math.hypot(player.x - fountain.x, player.y - fountain.y - 8) < 40) {
      say('Felix', 'Çeşmenin şırıltısı ne kadar dinlendirici, değil mi?', { x: fountain.x, y: fountain.y - 14 });
      bump('fountain');
    }

    cam.x = Math.round(Math.max(0, Math.min(MW * T - VW, player.x - VW / 2)));
    cam.y = Math.round(Math.max(-NORTH * T, Math.min(MH * T - VH, player.y - 8 - VH / 2)));
  }

  function updateNpc(n, dt) {
    if (n.seat || n.kind === 'owl') return;
    if (bubble?.anchor === n) { n.moving = false; if (!FREE_FLYERS.has(n.kind)) faceTo(n, player); return; }
    if (FREE_FLYERS.has(n.kind)) {
      if (!n.target || Math.hypot(n.target.x - n.x, n.target.y - n.y) < 2) {
        n.target = { x: 24 + Math.random() * (MW * T - 48), y: -NORTH * T + 40 + Math.random() * ((MH + NORTH) * T - 80) };
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
    { id: 'fish1', giver: 'Bahçıvan Hollis', where: 'Göl', reward: 2, ask: 'Bir molada iskelenin ucunda bir balık yakala.', need: 1, count: c => c.fish || 0 },
    { id: 'race1', giver: 'Hoca Swift', where: 'Uçuş sahası', reward: 2, ask: 'Bir molada halka yarışını bitir.', need: 1, count: c => c.race || 0 },
    { id: 'owls', giver: 'Pip', where: 'Baykuşhane', reward: 2, ask: 'Bir molada baykuşhanedeki dört baykuşu besle (tüneklerine gidip E).', need: 1, count: c => c.owls || 0 },
    { id: 'books', giver: 'Madam Quillby', where: 'Kütüphane', reward: 2, ask: 'Bir molada kalede kaybolan üç kitabımı bulup getir.', need: 1, count: c => c.books || 0 },
    { id: 'ball', giver: 'Madam Velora', where: 'Kehanet Kulesi', reward: 2, ask: 'Bir molada büyük kristal küreye bak.', need: 1, count: c => c.ball || 0 },
    { id: 'tasksess', giver: 'Rose', where: 'Kütüphane', reward: 3, ask: 'Seçili bir görevine 2 odak oturumu ayır.', need: 2, count: c => c.taskSess },
  ];
  const isBreak = () => mode === 'short' || mode === 'long';
  const roomOf = (x, y) => (y < 0 ? 'north' : y >= 21 ? 'grounds' : y <= 8 ? (x <= 9 ? 'lib' : x <= 23 ? 'hall' : x >= 43 ? 'seer' : 'tower') : y <= 11 ? 'corridor' : x <= 8 ? 'dungeon' : x <= 22 ? 'courtyard' : 'greenhouse');

  function quests() {
    const key = todayKey();
    if (!data.quests || data.quests.date !== key) {
      const seed = [...key].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1000003, 7);
      const ids = QUEST_POOL.map((q, i) => [q.id, hash(i + 1, seed)]).sort((p, q) => p[1] - q[1]).map(p => p[0]);
      data.quests = { date: key, ids: ids.slice(0, 3), c: { lib: 0, hall: 0, water: 0, tasks: 0, fountain: 0, taskSess: 0, fish: 0, race: 0 }, claimed: {}, seen: {} };
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
    quests().c[key] = (quests().c[key] || 0) + 1;
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

  // ===== Büyük Salon: bina kum saatleri =====
  // Her binanın puanı = sınıf arkadaşlarının (benzetim) + senin bu haftaki odak dakikaların (kendi binana)
  const weekStart = off => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7) + off * 7); };
  function housePoints(off = 0) {
    const ws = weekStart(off), elapsed = off < 0 ? 7 : Math.min(7, (Date.now() - ws) / 864e5);
    let mine = 0;
    for (let i = 0; i < 7; i++) { const d = new Date(ws); d.setDate(d.getDate() + i); mine += data.days[d.toLocaleDateString('sv')]?.sec || 0; }
    const pts = {};
    for (const h of Object.keys(Scene.HOUSES)) {
      const rate = 35 + hash(ws.getDate() * 7 + h.charCodeAt(0), ws.getMonth() * 13 + h.length) * 55; // günde dk
      pts[h] = Math.round(rate * elapsed) + (h === data.look.house ? Math.floor(mine / 60) : 0);
    }
    return pts;
  }
  function readGlasses() {
    const p = housePoints(), list = Object.entries(p).sort((a, b) => b[1] - a[1]);
    const txt = list.map(([h, v]) => `${Scene.HOUSES[h].name.split(' ')[0]} ${v}`).join(' · ');
    say('Bina kum saatleri', `Bu hafta: ${txt}. Odak dakikaların binana puan olur; pazartesi kazanan binaya +5 altın!`, { x: 17.5 * T, y: 3 * T }, 7);
  }
  // Pazartesi: geçen haftanın kupası
  function checkHouseWeek() {
    const wk = weekStart(-1).toLocaleDateString('sv'), end = weekStart(0).toLocaleDateString('sv');
    if (data.houseWeek === wk) return;
    data.houseWeek = wk;
    if (Object.keys(data.days).some(k => k >= wk && k < end && data.days[k].pomos)) {
      const win = Object.entries(housePoints(-1)).sort((a, b) => b[1] - a[1])[0][0];
      if (win === data.look.house) { data.coins += 5; data.houseWins = (data.houseWins || 0) + 1; toastLater(`Geçen haftanın bina kupası senin binanın: ${Scene.HOUSES[win].name}! Katkın için +5 altın`); }
      else toastLater(`Geçen haftanın bina kupasını ${Scene.HOUSES[win].name} kazandı. Bu hafta binan için çalış!`);
    }
    save();
  }
  function drawGlasses() {
    const p = housePoints(), max = Math.max(60, ...Object.values(p)) * 1.15;
    for (const [x, y, house] of GLASSES) {
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      const col = Scene.HOUSES[house].a, f = p[house] / max, low = Math.round(f * 5), up = 5 - low;
      if (up) px(ctx, X + 4, Y + 7 - up, 8, up, col);
      if (low) px(ctx, X + 4, Y + 14 - low, 8, low, col);
      if (Math.sin(t * 6 + x) > -0.6) px(ctx, X + 7, Y + 7 + (Math.floor(t * 8) % 2), 2, 1, col); // akan taşlar
      if (Math.sin(t * 2 + y) > 0.7) px(ctx, X + 5, Y + 3, 1, 1, '#ffffff');
    }
  }

  // ===== Göl: iskelenin ucunda balık tutma (molada) =====
  const FISH = [
    { id: 'gumus', name: 'Gümüş Pullu', w: 30, col: '#c8d0dc' }, { id: 'kirmizi', name: 'Kırmızı Yüzgeç', w: 25, col: '#e05a50' },
    { id: 'camur', name: 'Çamur Kedisi', w: 20, col: '#8a7a56' }, { id: 'ay', name: 'Ay Balığı', w: 14, col: '#ece4a8' },
    { id: 'altin', name: 'Altın Sazan', w: 8, col: '#f0c040', rare: 'Nadir' }, { id: 'murekkep', name: 'Mürekkep Yavrusu', w: 3, col: '#7a5aa0', rare: 'Çok nadir' },
  ];
  const DOCK = [7, 27];
  let fishing = null; // { phase: 'wait' | 'bite', until }
  function startFishing() {
    const no = canPlay('Balık tutmak');
    if (no) return say('İskele', no, player, 4);
    fishing = { phase: 'wait', until: t + 2 + Math.random() * 4 };
    player.dir = 'down'; player.path = [];
    say('İskele', 'Oltayı attın… Mantar suya batınca hemen E!', player, 2.5);
  }
  function updateFishing() {
    if (!fishing) return;
    if (player.moving || !isBreak() || focusing() || !nearTile(DOCK, 16)) { fishing = null; return; }
    if (fishing.phase === 'wait' && t > fishing.until) { fishing.phase = 'bite'; fishing.until = t + 1.2; }
    else if (fishing.phase === 'bite' && t > fishing.until) { fishing = null; say('İskele', 'Kaçtı! Bir daha dene.', player, 2.5); }
  }
  function reel() {
    const bite = fishing.phase === 'bite';
    fishing = null;
    if (!bite) return say('İskele', 'Çok erken çektin; balık ürktü.', player, 2.5);
    let r = Math.random() * FISH.reduce((a, f) => a + f.w, 0), f = FISH[0];
    for (const x of FISH) if ((r -= x.w) < 0) { f = x; break; }
    const book = (data.fishBook ||= {}), isNew = !book[f.id];
    book[f.id] = (book[f.id] || 0) + 1;
    const bonus = spendTicket('fishDay', 1, 'günün ilk balığı');
    bump('fish');
    save();
    say('İskele', `${f.name} yakaladın!${isNew ? ' Yeni tür!' : ''}${bonus} Balık defterin (Hayvanlar paneli): ${Object.keys(book).length}/${FISH.length}`, player, 5);
  }
  function drawFishing() {
    if (!fishing) return;
    const bx = DOCK[0] * T + 8 - cam.x, by = (DOCK[1] + 1) * T + 6 - cam.y, hx = Math.round(player.x - cam.x) + 5, hy = Math.round(player.y - cam.y) - 12;
    for (let k = 0; k <= 10; k++) px(ctx, hx + (bx - hx) * k / 10, hy + (by - hy) * k / 10 + Math.sin(k / 10 * Math.PI) * 3, 1, 1, '#e8e8f0');
    const dip = fishing.phase === 'bite' ? 2 : Math.round(Math.sin(t * 3));
    px(ctx, bx - 1, by - 2 + dip, 3, 2, '#e04848'); px(ctx, bx - 1, by + dip, 3, 1, '#ffffff');
    if (fishing.phase === 'bite') { px(ctx, bx - 4, by + 3, 9, 1, '#a8d0f0'); px(ctx, bx + 4, by - 12, 2, 6, '#ffe890'); px(ctx, bx + 4, by - 4, 2, 2, '#ffe890'); }
  }

  // ===== Uçuş sahası: süpürgeyle halka yarışı (Hoca Swift) =====
  const RINGS = [[27, 27], [30, 25], [33, 28], [36, 26], [38, 28], [34, 27]].map(([x, y]) => ({ x: x * T + 8, y: y * T + 6 }));
  let race = null; // { i, start }
  const swift = () => NPCS.find(n => n.name === 'Hoca Swift');
  function startRace(n) {
    race = { i: 0, start: t };
    const best = data.raceBest ? ` En iyi süren: ${data.raceBest.toFixed(1)} sn.` : '';
    say(n.name, `Süpürgene bin! Altın halkalardan sırayla geç, 45 saniyen var.${best}`, n, 3);
  }
  function updateRace() {
    if (!race) return;
    if (focusing() || !isBreak()) { race = null; return; }
    const r = RINGS[race.i], el = t - race.start;
    if (Math.hypot(player.x - r.x, player.y - 8 - r.y) < 11) {
      if (++race.i === RINGS.length) {
        race = null;
        const best = !data.raceBest || el < data.raceBest;
        if (best) data.raceBest = el;
        const bonus = spendTicket('raceDay', 2);
        bump('race');
        save();
        return say('Hoca Swift', `Bitti! ${el.toFixed(1)} saniye${best ? ', yeni rekor' : ''}.${bonus}`, swift(), 5);
      }
    } else if (el > 45) { race = null; return say('Hoca Swift', 'Süre doldu! Nefeslen, bir daha dene.', swift(), 4); }
    if (el > 3) bubble = { name: 'Halka yarışı', text: `${race.i}/${RINGS.length} halka · ${el.toFixed(1)} sn`, anchor: player, until: t + 0.3 };
  }
  function drawRings() {
    if (!race) return;
    RINGS.forEach((r, i) => {
      if (i < race.i) return;
      const X = r.x - cam.x, Y = r.y - cam.y, cur = i === race.i, rad = cur ? 6 + Math.sin(t * 6) : 5;
      for (let a = 0; a < 20; a++) px(ctx, X + Math.cos(a / 20 * 6.283) * rad, Y + Math.sin(a / 20 * 6.283) * rad, 1, 1, cur ? '#ffe060' : 'rgba(255,224,96,0.35)');
      if (cur) px(ctx, X - 1 + Math.cos(t * 5) * rad, Y - 1 + Math.sin(t * 5) * rad, 2, 2, '#ffffff');
    });
  }

  // ===== Kulübe: diğer evcil hayvanların bahçede dolaşır =====
  let roamers = [];
  function updateRoamers(dt) {
    const list = Pet.roam();
    if (list.length !== roamers.length || list.some((p, i) => p.id !== roamers[i].id)) {
      roamers = list.map((p, i) => ({ ...p, kind: 'roam', x: (18 + i) * T + 8, y: 27 * T + 12, tx: 0, ty: 0, wait: Math.random() * 2 }));
    } else list.forEach((p, i) => (roamers[i].info = p.info));
    for (const r of roamers) {
      if ((r.wait -= dt) > 0) continue;
      const dx = r.tx - r.x, dy = r.ty - r.y, d = Math.hypot(dx, dy);
      if (!r.tx || d < 1) {
        for (let k = 0; k < 10; k++) {
          const gx = 11 + Math.floor(Math.random() * 13), gy = 26 + Math.floor(Math.random() * 3);
          if (!SOLID.has(at(gx, gy))) { r.tx = gx * T + 4 + Math.random() * 8; r.ty = gy * T + 10 + Math.random() * 4; break; }
        }
        r.wait = 1 + Math.random() * 3;
        continue;
      }
      const s = Math.min(d, 16 * dt);
      r.x += dx / d * s; r.y += dy / d * s; r.dir = dx < 0 ? 'left' : 'right';
    }
  }
  const roamerNear = () => roamers.find(r => Math.hypot(r.x - player.x, r.y - player.y) < 18);
  const ROAM_LINES = ['mutlu mutlu dolaşıyor.', 'balkabaklarını kokluyor.', 'seni görünce sevindi!', 'Hollis\'in kulübesinin önünde güneşleniyor.'];

  // ===== Göl süsleri: sandallar, ara sıra dev ahtapot, ay yansıması =====
  function drawLake() {
    const boat = (wx, wy, p) => {
      const X = Math.round(wx - cam.x), Y = Math.round(wy - cam.y + Math.sin(t * 1.6 + p) * 1);
      if (X < -20 || X > VW + 4 || Y < -10 || Y > VH + 10) return;
      px(ctx, X, Y + 3, 14, 3, '#7a5236'); px(ctx, X + 1, Y + 6, 12, 1, '#5a3a24'); px(ctx, X + 1, Y + 3, 12, 1, '#a07454');
      px(ctx, X + 10, Y - 4, 1, 7, '#5a4a3a'); px(ctx, X + 9, Y - 6, 3, 3, '#ffd46b');
    };
    boat(8 * T + 2, 26 * T + 4, 0); boat(2 * T + 2, 27 * T + 8, 2);
    for (let i = 0; i < 3; i++) { // suya düşen damlaların halkaları
      const cyc = Math.floor(t / 3 + i * 0.33), k = (t / 3 + i * 0.33) % 1, lt = lakeTiles[Math.floor(hash(cyc, i + 11) * lakeTiles.length)];
      const X = Math.round(lt[0] * T + 8 - cam.x), Y = Math.round(lt[1] * T + 8 - cam.y), r = 1 + k * 5;
      if (X < -10 || X > VW + 10 || Y < -10 || Y > VH + 10) continue;
      ctx.globalAlpha = 0.55 * (1 - k);
      for (let a = 0; a < 12; a++) px(ctx, X + Math.cos(a / 12 * 6.283) * r, Y + Math.sin(a / 12 * 6.283) * r * 0.5, 1, 1, '#c8e8f0');
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 3; i++) { // ördek ailesi: anne önde, iki yavru arkada
      const a = t * 0.18 - i * 0.22, wx = 4.2 * T + Math.cos(a) * 2.2 * T, wy = 26.8 * T + Math.sin(a) * 1.3 * T;
      const X = Math.round(wx - cam.x), Y = Math.round(wy - cam.y + Math.sin(t * 3 + i) * 0.6), big = i === 0, left = Math.sin(a) > 0;
      if (X < -8 || X > VW + 8 || Y < -8 || Y > VH + 8) continue;
      const w = big ? 6 : 4;
      px(ctx, X - w / 2, Y, w, big ? 3 : 2, big ? '#f4f0e8' : '#ffe070');
      px(ctx, left ? X - w / 2 - 1 : X + w / 2 - 1, Y - 2, 2, 2, big ? '#3a8a4a' : '#ffe070');
      px(ctx, left ? X - w / 2 - 2 : X + w / 2 + 1, Y - 1, 1, 1, '#f08a3a');
      if (Math.sin(t * 2 + i) > 0.5) px(ctx, X - w / 2 - 1, Y + (big ? 3 : 2), w + 2, 1, 'rgba(200,230,255,0.6)');
    }
    const cyc = Math.floor(t / 22), k = t % 22;
    if (k < 4) { // dev ahtapotun kolu yükselir, kıvrılır, batar
      const lt = lakeTiles[Math.floor(hash(cyc, 4) * lakeTiles.length)], lx = lt[0] * T + 8, ly = lt[1] * T + 10;
      const X = Math.round(lx - cam.x), Y = Math.round(ly - cam.y), hgt = Math.round(Math.sin(k / 4 * Math.PI) * 14);
      for (let i = 0; i < hgt; i++) px(ctx, X + Math.round(Math.sin(i * 0.35 + t * 2) * 2), Y - i, 3, 1, i % 4 === 1 ? '#c87aa8' : '#9a4a7a');
      if (hgt > 2) px(ctx, X - 3, Y, 9, 1, '#a8d0f0');
    }
    if (Scene.skyPhase() === 'night') for (let i = 0; i < 5; i++) { // ay yansıması
      const X = Math.round(5 * T + 4 - cam.x + Math.sin(t * 2 + i) * 2), Y = Math.round(26 * T + 4 + i * 5 - cam.y);
      px(ctx, X, Y, 6 - i, 1, 'rgba(255,250,210,0.55)');
    }
    for (const [x, y] of lakeTiles) { // suda parıltılar
      if (hash(x + Math.floor(t * 1.5), y) < 0.88) continue;
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      px(ctx, X + 4 + Math.floor(hash(y, x) * 8), Y + 4 + Math.floor(hash(x, y) * 8), 3, 1, '#a8d4f8');
    }
  }

  // Bahçenin canlı ayrıntıları: kelebekler (gündüz), baca dumanı, gece ormanda parlayan gözler
  const hutChimney = { x: 22 * T + 11, y: 25 * T - 2 };
  const forestEyes = tilesOf('Z').filter(([x, y]) => y >= 29 && hash(x, y * 3) > 0.72);
  function drawGrounds() {
    const phase = Scene.skyPhase();
    for (let i = 0; i < 4; i++) { // baca dumanı
      const k = (t * 0.35 + i / 4) % 1, X = Math.round(hutChimney.x - cam.x + Math.sin(t + i * 2) * 2 + k * 4), Y = Math.round(hutChimney.y - cam.y - k * 18);
      if (X < -6 || X > VW || Y < -6 || Y > VH) continue;
      ctx.globalAlpha = 0.5 * (1 - k); px(ctx, X, Y, 3 + Math.round(k * 2), 3, '#e8e8f0');
    }
    ctx.globalAlpha = 1;
    if (phase !== 'night') for (let i = 0; i < 7; i++) { // kelebekler
      const wx = (3 + hash(i, 21) * 36) * T + Math.sin(t * 0.4 + i * 2) * 26, wy = (21.4 + hash(i, 22) * 2.2) * T + Math.sin(t * 0.9 + i) * 10;
      const X = Math.round(wx - cam.x), Y = Math.round(wy - cam.y), col = ['#ffb0d0', '#fff070', '#a8d0ff', '#ffffff'][i % 4], up = Math.floor(t * 9 + i) % 2;
      if (X < 0 || X > VW || Y < 0 || Y > VH) continue;
      px(ctx, X - 2, Y - up, 2, up ? 2 : 1, col); px(ctx, X + 1, Y - up, 2, up ? 2 : 1, col); px(ctx, X, Y, 1, 2, '#3a2a3e');
    }
    if (phase === 'night') for (const [x, y] of forestEyes) { // gece ormanda göz kırpan gözler
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH || (t + x) % 5 < 0.2) continue;
      px(ctx, X + 5, Y + 9, 1, 1, '#e8f060'); px(ctx, X + 8, Y + 9, 1, 1, '#e8f060');
    }
  }
  const signNear = () => nearTile([18, 22], 22);
  const blossomTrees = tilesOf('t').filter(([x, y]) => hash(x, y * 2) > 0.4);
  function drawPetals() {
    blossomTrees.forEach(([x, y], ti) => {
      for (let i = 0; i < 1; i++) {
        const k = (t * 0.12 + i * 0.5 + ti * 0.37) % 1, wx = x * T + 4 + hash(ti, i) * 10 + Math.sin(t * 1.3 + i + ti) * 4 + k * 8, wy = y * T - 4 + k * 20;
        const X = Math.round(wx - cam.x), Y = Math.round(wy - cam.y);
        if (X < 0 || X > VW || Y < 0 || Y > VH) continue;
        ctx.globalAlpha = Math.min(1, (1 - k) * 2); px(ctx, X, Y, 2, 1, i ? '#c8782a' : '#a85a22'); px(ctx, X + (Math.sin(t * 4 + i) > 0 ? 1 : 0), Y + 1, 1, 1, '#7a4a1a');
      }
    });
    ctx.globalAlpha = 1;
  }
  const voidTiles = tilesOf('v');
  const FLY_BOOKS = [{ cx: 37.5, cy: 16, r: 2.2, sp: 0.5 }, { cx: 37.5, cy: 15.5, r: 1.4, sp: -0.7 }, { cx: 5, cy: 5.5, r: 2.4, sp: 0.35 }];
  function drawRooms() {
    for (const [x, y] of voidTiles) { // kule boşluğunda göz kırpan yıldızlar
      if (hash(x * 5 + Math.floor(t * 2), y) < 0.82) continue;
      const X = x * T - cam.x + Math.floor(hash(y, x + Math.floor(t * 2)) * 14), Y = y * T - cam.y + Math.floor(hash(x, y + Math.floor(t * 2)) * 14);
      if (X < 0 || X > VW || Y < 0 || Y > VH) continue;
      px(ctx, X, Y, 1, 1, '#ffffff'); px(ctx, X - 1, Y, 3, 1, 'rgba(200,190,255,0.6)'); px(ctx, X, Y - 1, 1, 3, 'rgba(200,190,255,0.6)');
    }
    for (let i = 0; i < 6; i++) { // zindanda yükselen yeşil buhar
      const k = (t * 0.25 + i / 6) % 1, wx = (1.5 + hash(i, 41) * 7) * T + Math.sin(t + i) * 4, wy = (19.5 - k * 6) * T;
      const X = Math.round(wx - cam.x), Y = Math.round(wy - cam.y);
      if (X < 0 || X > VW || Y < 0 || Y > VH) continue;
      ctx.globalAlpha = 0.35 * Math.sin(k * Math.PI); px(ctx, X, Y, 3, 2, '#8af09a');
    }
    ctx.globalAlpha = 1;
    for (const b of FLY_BOOKS) { // kitaplar kendi kendine süzülür, sayfalarını çırpar
      const a = t * b.sp, X = Math.round(b.cx * T + Math.cos(a) * b.r * T - cam.x), Y = Math.round(b.cy * T + Math.sin(a) * b.r * T * 0.5 - 10 - cam.y + Math.sin(t * 3) * 1.5);
      if (X < -8 || X > VW + 8 || Y < -8 || Y > VH + 8) continue;
      const f = Math.floor(t * 6 + b.cx) % 2;
      px(ctx, X - 4, Y + (f ? 0 : 1), 4, 2, '#f2e8c0'); px(ctx, X, Y + (f ? 0 : 1), 4, 2, '#e8dcb0'); px(ctx, X - 1, Y + 2, 2, 2, '#7a2a3a');
      px(ctx, X - 4, Y + 6, 8, 1, 'rgba(0,0,0,0.18)');
    }
    if (Scene.skyPhase() !== 'night') for (let i = 0; i < 6; i++) { // serada ve avluda kelebekler
      const inG = i < 3, wx = (inG ? 25 + hash(i, 51) * 7 : 11 + hash(i, 52) * 10) * T + Math.sin(t * 0.5 + i * 2) * 18, wy = (14 + hash(i, 53) * 4) * T + Math.sin(t * 0.8 + i) * 8;
      const X = Math.round(wx - cam.x), Y = Math.round(wy - cam.y), col = ['#ffb0d0', '#fff070', '#a8d0ff'][i % 3], up = Math.floor(t * 9 + i) % 2;
      if (X < 0 || X > VW || Y < 0 || Y > VH) continue;
      px(ctx, X - 2, Y - up, 2, up ? 2 : 1, col); px(ctx, X + 1, Y - up, 2, up ? 2 : 1, col); px(ctx, X, Y, 1, 2, '#3a2a3e');
    }
  }

  // Avludaki büyülü bitkiler ve grifon heykelleri
  const magicBeds = tilesOf('@'), griffins = tilesOf('[');
  function drawMagicGarden() {
    const night = Scene.skyPhase() !== 'day';
    for (const [x, y] of magicBeds) {
      const X = x * T - cam.x, Y = y * T - cam.y, kind = (Math.min(x, 32 - x) + y) % 3;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      if (kind === 2) for (let k = 0; k < 3; k++) { // mor dokunaçlar salınır
        const bx = X + 6 + k * 2;
        for (let j = 0; j < 7; j++) px(ctx, bx + Math.round(Math.sin(t * 2 + k * 1.7 + j * 0.5) * (j / 3)), Y + 8 - j, 1, 1, j > 4 ? '#c87ad0' : '#8a4a92');
      } else if (kind === 1 && night) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(140,200,255,${0.16 + 0.06 * Math.sin(t * 2 + x)})`; ctx.fillRect(X + 3, Y + 3, 10, 10); ctx.globalCompositeOperation = 'source-over'; }
    }
    if (night) for (const [x, y] of griffins) { const X = x * T - cam.x, Y = y * T - cam.y; if (X < -T || X > VW || Y < -T || Y > VH) continue; for (const ex of [5, 11]) { px(ctx, X + ex - 1, Y - 2, 2, 2, '#ffd060'); px(ctx, X + ex - 1, Y - 2, 1, 1, '#fff6c0'); } }
  }
  const BED_LINES = [
    ['Çığlık kökü', 'Şşş! Uyuyor. Uyanırsa kulaklarını kapat!'],
    ['Ay çiçeği', 'Gece olunca yaprakları ay ışığı gibi parlar.'],
    ['Dokunaçlı sarmaşık', 'Dokunma! Kollarını sana doğru uzatıyor…'],
  ];
  const magicNear = () => { for (const [x, y] of [...magicBeds, ...griffins]) if (nearTile([x, y], 20)) return [x, y]; return null; };
  function readMagic([x, y]) {
    if (at(x, y) === '[') return say('Taş baykuş', 'Taş baykuş iri gözleriyle seni süzüyor. Derler ki gece olunca gözleri altın gibi parlar.', { x: x * T + 8, y: y * T - 8 }, 4);
    const [who, line] = BED_LINES[(Math.min(x, 32 - x) + y) % 3];
    say(who, line, { x: x * T + 8, y: y * T }, 4);
  }

  function talk(n) {
    const q = questOf(n);
    if (q && isDone(q)) {
      quests().claimed[q.id] = true;
      const mult = data.wisdom ? 2 : 1; // bilgelik iksiri
      data.wisdom = false;
      data.coins += q.reward * mult;
      data.questsDone = (data.questsDone || 0) + 1; // başarımlar için
      save(); render(); renderQuests();
      const c = document.querySelector('.coins');
      c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
      say(n.name, `Harika iş! Ödülün: +${q.reward * mult} altın.${mult > 1 ? ' (Bilgelik iksiri!)' : ''}`, n);
      if (!player.seated) faceTo(player, n);
      return;
    }
    if (n.name === 'Madam Quillby' && !(q && isDone(q)) && (hunt || data.huntDay !== todayKey())) {
      if (hunt && hunt.books.every(b => b.got)) { hunt = null; say(n.name, `Kitaplarım! Çok teşekkürler.${spendTicket('huntDay', 2)}`, n, 5); bump('books'); }
      else if (hunt) say(n.name, `Daha ${hunt.books.filter(b => !b.got).length} kitap kayıp. Parıltıya bak!`, n, 4);
      else { const no = canPlay('Kitap avı'); if (no) say(n.name, no, n, 4); else startHunt(n); }
      if (!player.seated) faceTo(player, n);
      return;
    }
    if (n.name === 'Hoca Swift' && !race && !(q && isDone(q))) {
      const no = canPlay('Halka yarışı');
      if (no) say(n.name, no, n, 4); else startRace(n);
      if (!player.seated) faceTo(player, n);
      return;
    }
    if (n.name === 'Professor Ashdown' && !focusing()) {
      const next = Odam.nextRecipe();
      if (next === 'gold' || next === 'wisdom') {
        const p = Odam.learnRecipe();
        say(n.name, `Sana ${p.name} tarifini öğreteyim! Odandaki iksir şişesinde demleyebilirsin.`, n, 5);
        toast(`Yeni tarif öğrendin: ${p.name}`);
        if (!player.seated) faceTo(player, n);
        return;
      }
      if (next === 'wait' && Math.random() < 0.5) {
        say(n.name, 'Önce bir iksiri sonuna kadar demleyip iç; sonra sana Bilgelik İksiri tarifini öğretirim.', n, 5);
        if (!player.seated) faceTo(player, n);
        return;
      }
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

  // ---------- İksir malzemeleri ----------
  // Her nokta günde bir kez toplanır; odak sırasında toplanamaz. Malzemeler odadaki iksirlerde kullanılır.
  // Kilerde her malzemeden en fazla PANTRY_MAX tutulur (biriktirilemesin, her gün toplamak anlamlı olsun).
  const INGREDIENTS = { leaf: 'Ay Yaprağı', dust: 'Kristal Toz', feather: 'Baykuş Tüyü' };
  const PANTRY_MAX = 3;
  const GATHER = [
    { id: 'g1', kind: 'leaf', x: 24, y: 14 }, { id: 'g2', kind: 'leaf', x: 30, y: 14 },
    { id: 'g5', kind: 'dust', x: 2, y: 13 }, { id: 'g6', kind: 'dust', x: 7, y: 13 },
    { id: 'g7', kind: 'feather', x: 26, y: 2 }, { id: 'g8', kind: 'feather', x: 30, y: 2 },
  ];
  function gatherDay() {
    const key = todayKey();
    if (!data.gather || data.gather.date !== key) data.gather = { date: key, done: {} };
    return data.gather;
  }
  const canGather = g => !gatherDay().done[g.id];
  const gatherNear = () => GATHER.find(g => canGather(g) && Math.hypot(player.x - g.x * T - 8, player.y - g.y * T - 8) < 26);
  function gather(g) {
    const at = { x: g.x * T + 8, y: g.y * T };
    if (focusing()) return say(INGREDIENTS[g.kind], 'Odak bitince topla; şimdi çalışma zamanı!', at);
    data.pantry ||= { leaf: 0, dust: 0, feather: 0 };
    if (data.pantry[g.kind] >= PANTRY_MAX) { // nokta harcanmaz, iksir yapınca gelip alabilirsin
      return say(INGREDIENTS[g.kind], `Kilerin dolu: en fazla ${PANTRY_MAX} ${INGREDIENTS[g.kind]} tutabilirsin. Önce bir iksir demle!`, at, 5);
    }
    gatherDay().done[g.id] = true;
    data.pantry[g.kind]++;
    save();
    say('Malzeme', `+1 ${INGREDIENTS[g.kind]} (sende ${data.pantry[g.kind]})`, at);
    toast(`+1 ${INGREDIENTS[g.kind]}: odandaki kazanda kullanabilirsin`);
    Odam.renderBrew();
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
    const lk = a === player ? data.look : a.other ? a.look : null; // oyuncu ve ortak odadaki arkadaşlar
    const pal = lk ? lookPal(lk) : a.pal;
    const dir = a.dir === 'left' || a.dir === 'right' ? 'side' : a.dir;
    const rows = dir === 'side' ? SIDE : dir === 'up' ? UP : DOWN;
    const step = (a.other ? a.walking : a.moving) && Math.floor(t * 8) % 2;
    const over = {};
    if (step) Object.assign(over, FEET_B[dir]);
    const longHair = lk ? lk.hairStyle !== 'kisa' : a.long;
    if (longHair) Object.assign(over, LONG[dir]);
    if (a.beard && dir !== 'up') Object.assign(over, BEARD[dir]);
    const flip = a.dir === 'left';
    const x = Math.round(a.x - cam.x), gy = Math.round(a.y - cam.y), y = gy - (step ? 1 : 0);
    px(ctx, x - 4, gy - 1, 8, 2, 'rgba(40,25,30,0.22)'); px(ctx, x - 5, gy - 1, 10, 1, 'rgba(40,25,30,0.12)'); px(ctx, x - 3, gy + 1, 6, 1, 'rgba(40,25,30,0.10)');
    if (a === player && race) { // süpürge sapı ve çalı
      const bx = x - 9, by = gy - 4;
      px(ctx, bx, by, 18, 2, '#8a6446'); px(ctx, bx, by, 18, 1, '#a87c58');
      px(ctx, a.dir === 'left' ? bx + 15 : bx - 3, by - 2, 6, 6, '#c9a24a');
    }
    sprite(ctx, rows, pal, x - 6, y - 12, flip, over);
    const hat = lk ? (lk.outfit === 'kedi' ? 'beanie' : 'hat') : a.hat;
    if (hat === 'hat') sprite(ctx, HAT, pal, x - 6, y - 15, flip);
    if (hat === 'beanie') sprite(ctx, BEANIE, pal, x - 6, y - 14, flip);
  }

  // Evcil hayvan: oyuncunun yürüdüğü yolu birkaç adım geriden izler (duvarlardan geçmez)
  const petFollow = { x: 0, y: 0, trail: [] };
  function updatePet() {
    const tr = petFollow.trail, lastP = tr[tr.length - 1];
    const d = lastP ? Math.hypot(player.x - lastP.x, player.y - lastP.y) : Infinity;
    if (d > 40) { // ilk kez ya da oyuncu bir anda yer değiştirdi (merdiven vb.)
      tr.length = 0; tr.push({ x: player.x, y: player.y });
      Object.assign(petFollow, { x: player.x - 10, y: player.y });
      return;
    }
    if (d >= 1) tr.push({ x: player.x, y: player.y });
    while (tr.length > 16) { const p = tr.shift(); petFollow.x = p.x; petFollow.y = p.y; }
  }

  function drawActor(a) {
    const x = Math.round(a.x - cam.x), y = Math.round(a.y - cam.y);
    if (a.kind === 'roam') {
      px(ctx, x - 4, y - 1, 8, 2, 'rgba(40,25,30,0.2)');
      Scene.drawPet(ctx, x, y, a.info, t + a.x);
    } else if (a.kind === 'pet') {
      px(ctx, x - 4, y - 1, 8, 2, 'rgba(40,25,30,0.2)');
      Scene.drawPet(ctx, x, y, Pet.info(), t);
    } else if (a.kind === 'cat') {
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

  const CEIL_SKY = {
    night: ['#26305e', '#2e3b74', '#38488a'],
    dusk: ['#3a3468', '#8a5070', '#d0805a'],
    day: ['#5a92d8', '#78ace6', '#9cc8f0'],
  };
  // Büyülü tavan: dışarıdaki gökyüzü (gerçek saate göre), bulutlar, kayan yıldız ve sancaklar
  function drawSky() {
    const X0 = 11 * T - cam.x, Y0 = -cam.y, Wd = 13 * T, Hd = 2 * T;
    if (Y0 + Hd < 0 || X0 > VW || X0 + Wd < 0) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(X0, Y0, Wd, Hd); ctx.clip();
    const phase = Scene.skyPhase(), sky = CEIL_SKY[phase]; // tavan gerçek saate göre
    px(ctx, X0, Y0, Wd, 11, sky[0]); px(ctx, X0, Y0 + 11, Wd, 11, sky[1]); px(ctx, X0, Y0 + 22, Wd, 10, sky[2]);
    if (phase === 'night') for (const s of SKY_STARS) {
      const v = Math.sin(t * 2 + s.p);
      if (v > -0.4) px(ctx, X0 + s.x, Y0 + s.y, 1, 1, v > 0.6 ? '#ffffff' : '#9fb0e8');
    }
    if (phase === 'night') disc(ctx, X0 + 176, Y0 + 9, 5, d => (d > 20 ? '#e8dcb0' : '#f6eed0'));
    else if (phase === 'day') disc(ctx, X0 + 176, Y0 + 9, 5, d => (d > 20 ? '#ffe9a0' : '#fff6d0'));
    else disc(ctx, X0 + 176, Y0 + 24, 5, () => '#ffb468');
    for (let i = 0; i < 3; i++) {
      const cx = X0 + ((t * 5 + i * 95) % (Wd + 40)) - 20, cy = Y0 + 6 + i * 8;
      ctx.fillStyle = phase === 'day' ? 'rgba(255,255,255,0.6)' : 'rgba(220,225,255,0.22)';
      ctx.fillRect(Math.round(cx), cy, 22, 4); ctx.fillRect(Math.round(cx) + 4, cy - 2, 12, 3);
    }
    const sp = (t % 7) / 0.8;
    if (sp < 1 && phase === 'night') for (let i = 0; i < 5; i++) {
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
      if (at(x - 1, y) === 'V') continue; // iki karolu şöminenin ateşi sol yarıdan bir kez çizilir
      const wide = at(x + 1, y) === 'V';
      const X = x * T - cam.x + (wide ? 5 : 3), Y = y * T - cam.y, n = wide ? 11 : 5; // ocak ağzının içi
      if (X < -2 * T || X > VW || Y < -T || Y > VH) continue;
      for (let i = 0; i < n; i++) {
        const mid = 1 - Math.abs(i - (n - 1) / 2) / ((n + 1) / 2); // ortada daha yüksek alev
        const h = 2 + Math.round((Math.abs(Math.sin(t * 7 + i * 1.9)) * 3 + 2) * mid + 1);
        px(ctx, X + i * 2, Y + 15 - h, 2, h, i % 2 ? '#ffb050' : '#ff8a3c');
        px(ctx, X + i * 2, Y + 15 - Math.ceil(h / 2), 2, 1, '#ffe08a');
      }
      px(ctx, X - 1, Y + 14, n * 2 + 2, 2, '#7a5238');
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
    // Toplanabilir malzemeler parıldar
    if (!focusing()) for (const g of GATHER) {
      if (!canGather(g)) continue;
      const X = g.x * T - cam.x, Y = g.y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      const k = Math.sin(t * 4 + g.x);
      const col = { leaf: '#c8ff90', dust: '#a8e0ff', feather: '#ffe890' }[g.kind];
      const sx = X + 8, sy = Y + 2 + Math.round(Math.sin(t * 2 + g.y));
      ctx.fillStyle = 'rgba(255,250,210,' + (0.18 + 0.12 * k) + ')'; ctx.fillRect(sx - 4, sy - 4, 9, 9);
      px(ctx, sx, sy - 3, 1, 7, col); px(ctx, sx - 3, sy, 7, 1, col);
      px(ctx, sx - 1, sy - 1, 3, 3, col); px(ctx, sx, sy, 1, 1, '#ffffff');
      if (k > 0.3) { px(ctx, sx - 3, sy - 3, 1, 1, '#ffffff'); px(ctx, sx + 3, sy + 3, 1, 1, '#ffffff'); }
    }
    // Çığlık kökleri
    for (const r of roots) {
      if (t > r.pop) continue;
      const X = r.X - cam.x, Y = r.Y - cam.y, shake = Math.round(Math.sin(t * 40));
      px(ctx, X + 4 + shake, Y - 1, 8, 7, '#e8c8a0'); px(ctx, X + 5 + shake, Y + 1, 1, 1, '#3a2a3e'); px(ctx, X + 10 + shake, Y + 1, 1, 1, '#3a2a3e');
      px(ctx, X + 6 + shake, Y + 3, 4, 2, '#5a1a1a'); px(ctx, X + 6 + shake, Y - 3, 4, 2, '#4a9a4a');
    }
    // Çeşme
    if (fountain) { // fıskiyeden sekiz yöne kavisle düşen su, düştüğü yerde halkalar, havuzda parıltı
      const fx = fountain.x - cam.x, fy = fountain.y - cam.y;
      if (fx > -40 && fx < VW + 40 && fy > -40 && fy < VH + 40) {
        for (let j = 0; j < 8; j++) {
          const a = j * Math.PI / 4 + 0.2, ca = Math.cos(a), sa = Math.sin(a);
          for (let q = 0; q < 3; q++) {
            const k = (t * 0.9 + q / 3 + j * 0.07) % 1, r = 3 + k * 11, h = Math.sin(k * Math.PI) * 7;
            px(ctx, fx + ca * r, fy - 7 + sa * r * 0.8 - h + k * 7, 1, 1, k < 0.85 ? '#d8f0ff' : '#a8d8f8');
          }
          const k2 = (t * 0.9 + j * 0.13) % 1; // düşüş halkası
          if (k2 < 0.5) { ctx.globalAlpha = 0.6 * (1 - k2 * 2); const rx = fx + ca * 14, ry = fy + sa * 11; px(ctx, rx - 1 - k2 * 2, ry, 3 + k2 * 4, 1, '#e8f6ff'); ctx.globalAlpha = 1; }
        }
        px(ctx, fx - 1, fy - 10 - (Math.floor(t * 6) % 2), 2, 2, '#f0faff'); px(ctx, fx, fy - 12 - (Math.floor(t * 5) % 2), 1, 1, '#ffffff');
        for (let i = 0; i < 3; i++) { const a = hash(Math.floor(t * 2) + i, 5) * 6.283, r = 10 + hash(i, Math.floor(t * 2)) * 6; px(ctx, fx + Math.cos(a) * r, fy + Math.sin(a) * r, 2, 1, '#bfe4ff'); }
      }
    }
  }

  // Etkinlik süsleri: avludaki ağaçlarda ışıklar, avluya kar (kış) ya da pembe yaprak (bahar) yağar
  const FEST_TREES = [...tilesOf('t'), ...tilesOf('*'), ...tilesOf('^')];
  const FEST = {
    kis: { lights: ['#ff6a6a', '#ffd46b', '#7ad0ff', '#9aff8a'], star: true, fall: '#f4f8ff', n: 70, speed: 10 },
    bahar: { lights: ['#ffb0d0', '#fff0a0', '#ffffff', '#f080b0'], fall: '#ffb0d0', n: 40, speed: 6 },
    cadi: { lights: ['#ff9a3c', '#b070ff', '#9aff6a', '#ff9a3c'], lantern: true },
  };
  function drawFest() {
    const F = FEST[Events.active()];
    if (!F) return;
    for (const [x, y] of FEST_TREES) {
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -T || Y > VH) continue;
      [[3, 1], [12, 0], [6, 5], [10, 6], [8, -5], [4, 6], [13, 3]].forEach(([dx, dy], i) => {
        if (Math.sin(t * 3 + i * 1.7 + x) > -0.3) px(ctx, X + dx, Y + dy, 2, 2, F.lights[(i + x) % 4]);
      });
      if (F.star) {
        px(ctx, X + 7, Y - 13, 2, 4, '#ffe890'); px(ctx, X + 6, Y - 12, 4, 2, '#ffe890');
        if (Math.sin(t * 4 + y) > 0) { px(ctx, X + 5, Y - 11, 1, 1, '#fff6c0'); px(ctx, X + 10, Y - 11, 1, 1, '#fff6c0'); px(ctx, X + 7, Y - 14, 2, 1, '#fff6c0'); }
      }
      if (F.lantern) { // ağacın dibinde oyma balkabağı feneri
        px(ctx, X + 10, Y + 11, 6, 5, '#e07a2a'); px(ctx, X + 12, Y + 10, 2, 1, '#4a7a3a');
        if (Math.sin(t * 6 + x) > -0.5) { px(ctx, X + 11, Y + 12, 1, 1, '#ffe08a'); px(ctx, X + 14, Y + 12, 1, 1, '#ffe08a'); px(ctx, X + 12, Y + 14, 2, 1, '#ffe08a'); }
      }
    }
    if (!F.fall) return;
    const x0 = 10 * T, y0 = 13 * T, w = 13 * T, h = 7 * T; // avlu
    for (let i = 0; i < F.n; i++) {
      const sx = x0 + ((hash(i, 3) * w + Math.sin(t * 0.8 + i) * 4) % w), sy = y0 + ((hash(i, 7) * h + t * (F.speed + hash(i, 5) * 8)) % h);
      const X = Math.round(sx - cam.x), Y = Math.round(sy - cam.y);
      if (X >= 0 && X < VW && Y >= 0 && Y < VH) px(ctx, X, Y, 1, 1, F.fall);
    }
  }

  function drawQuestMarks() {
    for (const n of NPCS) {
      const q = questOf(n);
      const teach = n.name === 'Professor Ashdown' && ['gold', 'wisdom'].includes(Odam.nextRecipe());
      if (!q && !teach) continue;
      const ready = teach || isDone(q);
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
    ctx.drawImage(bg, cam.x, cam.y + NORTH * T, VW, VH, 0, 0, VW, VH);
    drawSky();
    drawStair();
    drawLocks();
    for (const p of portraits) drawPortrait(p);
    drawDynamic();
    updatePet();
    const petActor = { kind: 'pet', x: petFollow.x, y: petFollow.y - 0.5 }; // aynı hizadaysa oyuncunun arkasında
    drawLake(); drawGrounds(); drawRooms(); drawPetals(); drawMagicGarden(); drawGlasses(); drawRings(); drawBalls(); drawOwlHearts(); drawHunt(); drawTrophies();
    const actors = [...NPCS.filter(n => !FREE_FLYERS.has(n.kind)), player, petActor, ...othersMap.values(), ...roamers].sort((a, b) => a.y - b.y);
    for (const a of actors) drawActor(a);
    if (player.seated && Math.sin(t * 5) > 0.3) px(ctx, Math.round(player.x - cam.x + 5), Math.round(player.y - cam.y - 2), 1, 1, '#ffe9a0');
    for (const n of NPCS) if (n.seat && Math.sin(t * 5 + n.x) > 0.3) px(ctx, Math.round(n.x - cam.x + 5), Math.round(n.y - cam.y - 2), 1, 1, '#ffe9a0');
    CANDLES.forEach(([cx, cy], i) => drawCandle(cx, cy, i * 1.3));
    NPCS.filter(n => FREE_FLYERS.has(n.kind)).forEach(drawFlyer);
    drawQuestMarks();
    drawMailOwl();
    drawLighting();
    drawFest(); // şenlik ışıkları karanlıkta da parlasın
    drawFishing();
    drawAtmosphere();
    drawOverlays();
  }

  // ---------- Işıklandırma ----------
  // Önce her yeri hafif gece rengiyle örter, sonra ışık kaynaklarının çevresini açar ve renkli parıltı ekler.
  // Düşük çözünürlükte çizildiği için büyütülünce yumuşak, pikselli halkalar oluşur.
  let LIGHTS = null; // çeşme konumu buildBg sonrası belli olduğu için ilk çizimde kurulur
  const buildLights = () => [
    { x: 46 * T + 8, y: 16 * T + 4, r: 46, a: 0.5, col: '255,220,140', glow: 0.12 },
    ...tilesOf('(').map(([x, y]) => ({ x: x * T + 8, y: y * T + 6, r: 30, a: 0.55, col: '200,160,255', glow: 0.14, flick: 0.3 })),
    ...[[1, 16], [8, 16], [5, 14]].map(([x, y]) => ({ x: x * T + 7, y: y * T + 8, r: 26, a: 0.6, col: '255,200,120', glow: 0.14, flick: 0.6 })),
    { x: 28.5 * T, y: 5.5 * T, r: 60, a: 0.35, col: '150,140,255', glow: 0.1 },
    { x: 37.5 * T, y: 16 * T, r: 40, a: 0.4, col: '200,160,255', glow: 0.1 },
    ...torches.map(tc => ({ x: tc.X + 8, y: tc.Y + 12, r: 46, a: 0.95, col: '255,170,90', glow: 0.22, flick: 1 })),
    ...CANDLES.map(([cx, cy], i) => ({ x: cx * T + 1, y: cy * T - 2, r: 28, a: 0.7, col: '255,200,120', glow: 0.14, flick: 0.5, bob: i * 1.3 })),
    ...tilesOf('W').map(([x, y]) => ({ x: x * T + 8, y: y * T + 22, r: 30, a: 0.55, col: '150,180,255', glow: 0.12, win: true })),
    ...cauldrons.map(k => ({ x: k.X + 8, y: k.Y + 6, r: 26, a: 0.6, col: k.col === '#7ae07a' ? '120,230,120' : k.col === '#c07ae0' ? '200,130,240' : k.col === '#f0a040' ? '250,170,70' : '110,200,250', glow: 0.18, flick: 0.6 })),
    ...(fountain ? [{ x: fountain.x, y: fountain.y, r: 34, a: 0.6, col: '150,210,255', glow: 0.12 }] : []),
    ...fireplaces.map(([x, y]) => ({ x: x * T + 8, y: y * T + 18, r: 44, a: 0.85, col: '255,150,70', glow: 0.2, flick: 1.4 })),
    ...flames.map(([x, y, k]) => ({ x: x * T + 8, y: y * T + 4, r: k === 'Y' ? 34 : 40, a: 0.8, col: '255,200,120', glow: 0.16, flick: 0.7 })),
  ];
  // Gerçek saate göre genel karanlık ve pencerelerden giren ışık
  const DAYLIGHT = {
    night: { ambient: 'rgba(30,22,58,0.40)', win: null },
    dusk: { ambient: 'rgba(52,26,50,0.32)', win: { r: 36, a: 0.65, col: '255,180,130', glow: 0.16 } },
    day: { ambient: 'rgba(30,22,58,0.15)', win: { r: 42, a: 0.8, col: '255,245,215', glow: 0.2 } },
  };
  let lightCv, lc;

  const winTiles = tilesOf('W');
  let vignette = null;
  function drawAtmosphere() {
    const phase = Scene.skyPhase();
    ctx.globalCompositeOperation = 'screen';
    if (phase !== 'night') { // gündüz pencerelerden içeri eğik ışık huzmesi
      ctx.fillStyle = phase === 'day' ? 'rgba(255,240,200,0.07)' : 'rgba(255,170,120,0.07)';
      for (const [x, y] of winTiles) {
        const X = x * T - cam.x, Y = y * T - cam.y + 14;
        if (X < -40 || X > VW + 10 || Y < -T || Y > VH) continue;
        ctx.beginPath(); ctx.moveTo(X + 4, Y); ctx.lineTo(X + 12, Y); ctx.lineTo(X + 26, Y + 40); ctx.lineTo(X + 10, Y + 40); ctx.closePath(); ctx.fill();
      }
    }
    if (phase !== 'day') for (let i = 0; i < 18; i++) { // akşam ve gece bahçede ateş böcekleri
      const wx = (1 + hash(i, 9) * 40) * T + Math.sin(t * 0.5 + i) * 14, wy = (21.5 + hash(i, 3) * 8) * T + Math.sin(t * 0.7 + i * 2) * 8;
      const X = Math.round(wx - cam.x), Y = Math.round(wy - cam.y), g = (Math.sin(t * 2 + i * 1.3) + 1) / 2;
      if (X < 0 || X > VW || Y < 0 || Y > VH || g < 0.2) continue;
      ctx.globalAlpha = g * 0.5; px(ctx, X - 1, Y - 1, 3, 3, '#d8ff8a');
      ctx.globalAlpha = g; px(ctx, X, Y, 1, 1, '#f4ffc0');
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (!vignette) { // kenarlarda hafif karartma: göz ortaya toplanır
      vignette = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VW * 0.72);
      vignette.addColorStop(0, 'rgba(12,8,24,0)'); vignette.addColorStop(1, 'rgba(12,8,24,0.38)');
    }
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, VW, VH);
  }

  function drawLighting() {
    if (!lightCv) { lightCv = document.createElement('canvas'); lightCv.width = VW; lightCv.height = VH; lc = lightCv.getContext('2d'); }
    if (!LIGHTS) LIGHTS = buildLights();
    const D = DAYLIGHT[Scene.skyPhase()];
    const live = [...(D.win ? LIGHTS.map(L => (L.win ? { ...L, ...D.win } : L)) : LIGHTS),
      { x: player.x, y: player.y - 8, r: 40, a: 0.55, col: '255,230,200', glow: 0 }];
    // Büyülü tavan da salona hafif bir ışık verir
    live.push({ x: 17.5 * T, y: 1 * T, r: 110, a: 0.35, col: '160,170,255', glow: 0.05 });
    lc.globalCompositeOperation = 'source-over';
    lc.clearRect(0, 0, VW, VH);
    lc.fillStyle = D.ambient;
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
  // Arkadaşların başının üstündeki ad etiketleri (HTML)
  function drawTags() {
    const box = document.getElementById('mapTags');
    for (const o of othersMap.values()) {
      let tag = box.querySelector(`[data-id="${CSS.escape(o.id)}"]`);
      if (!tag) { tag = document.createElement('span'); tag.className = 'map-tag'; tag.dataset.id = o.id; box.appendChild(tag); }
      tag.textContent = o.name;
      placeAt(tag, o.x, o.y - (o.look?.outfit === 'kedi' ? 19 : 21));
    }
    for (const tag of [...box.children]) if (!othersMap.has(tag.dataset.id)) tag.remove();
  }

  function drawOverlays() {
    drawTags();
    const b = document.getElementById('mapBubble'), hint = document.getElementById('mapHint');
    if (bubble) {
      const a = bubble.anchor;
      const off = a.x < cam.x - 4 || a.x > cam.x + VW + 4 || a.y < cam.y - 4 || a.y > cam.y + VH + 20;
      if (off || (a !== player && Math.hypot(a.x - player.x, a.y - player.y) > 6 * T)) bubble = null;
    }
    if (bubble) {
      b.hidden = false;
      b.querySelector('b').textContent = bubble.name;
      b.querySelector('span').textContent = bubble.text;
      const bx = Math.max(cam.x + VW * 0.25, Math.min(cam.x + VW * 0.75, bubble.anchor.x));
      const by = Math.max(cam.y + 22, bubble.anchor.y - (bubble.anchor === player || NPCS.includes(bubble.anchor) ? 20 : 0));
      placeAt(b, bx, by);
    } else b.hidden = true;
    const npc = !bubble && !player.seated && nearestNpc();
    const pic = !bubble && !player.seated && !npc && nearPortrait();
    const spot = !bubble && !player.seated && !npc && !focusing() && gatherNear();
    const spc = !bubble && !player.seated && !npc && !pic && !spot && !fishing && specialNear();
    hint.hidden = !npc && !pic && !spot && !spc;
    if (spc) placeAt(hint, player.x, player.y - 26);
    if (spot && !pic) placeAt(hint, spot.x * T + 8, spot.y * T - 2);
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
  // Kendi kendine gezinti (data.autoWalk): 6 sn dokunulmazsa karakter kalede dolaşır, NPC'lerin yanına gider.
  // Konuşmaz, malzeme toplamaz, ödül almaz; bir tuşa basınca ya da tıklayınca kontrol hemen sana geçer.
  let lastInput = 0, nextWander = 0;
  function wander() {
    nextWander = t + 3 + Math.random() * 5;
    const [px0, py0] = tileOf(player);
    const toNpc = Math.random() < 0.5;
    const npcs = NPCS.filter(n => !FREE_FLYERS.has(n.kind));
    for (let k = 0; k < 25; k++) {
      let tx, ty;
      if (toNpc) { const n = npcs[Math.floor(Math.random() * npcs.length)]; [tx, ty] = tileOf(n); ty += 1; }
      else { tx = 1 + Math.floor(Math.random() * (MW - 2)); ty = -NORTH + 1 + Math.floor(Math.random() * (MH + NORTH - 2)); }
      if (!walkable(tx, ty) || at(tx, ty) === 'v' || at(tx, ty) === 'j') continue;
      const p = findPath(px0, py0, tx, ty);
      if (p && p.length > 2 && p.length < 45) { player.path = p; player.pendingTalk = null; return; }
    }
  }

  function onKey(e, down) {
    if (!visible || typing(e)) return;
    if (down) lastInput = t;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    if (down) keys.add(e.code); else keys.delete(e.code);
    if (down && e.code === 'KeyE' && !e.repeat && fishing) return reel();
    if (down && e.code === 'KeyE' && !e.repeat) {
      const root = roots.find(r => Math.hypot(player.x - r.x, player.y - r.y) < 24);
      if (root) return waterRoot(root);
      const g = gatherNear();
      if (g) return gather(g);
      const pot = cauldrons.find(k => Math.hypot(player.x - k.X - 8, player.y - k.Y - 10) < 24);
      if (pot && !nearestNpc()) return say('Kazan', Odam.brewStatus(), { x: pot.X + 8, y: pot.Y });
      const sp = specialNear(), n = nearestNpc();
      if (sp && (!n || sp.d <= Math.hypot(n.x - player.x, n.y - player.y))) return sp.fn(); // hangisi yakınsa
      if (n) talk(n);
      else { const p = nearPortrait(); if (p) talkPortrait(p); }
    }
  }

  function onClick(e) {
    lastInput = t;
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
    const spot = GATHER.find(g => canGather(g) && mx >= g.x * T && mx < g.x * T + T && my >= g.y * T && my < g.y * T + T);
    if (spot) return Math.hypot(player.x - spot.x * T - 8, player.y - spot.y * T - 8) < 40 ? gather(spot) : toast('Toplamak için yanına git.');
    const pot = cauldrons.find(k => mx >= k.X && mx < k.X + T && my >= k.Y && my < k.Y + T);
    if (pot && Math.hypot(player.x - pot.X - 8, player.y - pot.Y - 10) < 40) return say('Kazan', Odam.brewStatus(), { x: pot.X + 8, y: pot.Y });
    const tx = Math.floor(mx / T), ty = Math.floor(my / T);
    if (LOCKS[at(tx, ty)] && !LOCKS[at(tx, ty)].open()) return toast(lockMsg(at(tx, ty)));
    if (scope && tx === scope[0] && ty === scope[1]) return nearTile(scope, 40) ? lookScope() : toast('Teleskoba bakmak için yanına git.');
    if (lectern && tx === lectern[0] && ty === lectern[1]) return nearTile(lectern, 40) ? readBook() : toast('Kitabı okumak için yanına git.');
    if (player.seated || player.toSeat) return toast('Odak bitince gezebilirsin!');
    const p = walkable(tx, ty) && findPath(...tileOf(player), tx, ty);
    if (p) { player.path = p; player.pendingTalk = null; }
    else if (at(tx, ty) === 'v') toast('Merdivenin yerine oturmasını bekle!');
  }

  function init(canvas) {
    setTimeout(checkHouseWeek, 1500);
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
        document.getElementById('mapTags').innerHTML = '';
        document.getElementById('mapBubble').hidden = true;
        document.getElementById('mapHint').hidden = true;
        return;
      }
      renderQuests();
      if (pendingMail) { const m = pendingMail; pendingMail = null; setTimeout(() => sendMail(m), 600); }
    },
    mail: sendMail,
    // Ortak oda: benim konumum ve diğer oyuncular
    FISH: () => FISH,
    myPos: () => ({ x: Math.round(player.x), y: Math.round(player.y), dir: player.dir, moving: !!player.moving, seated: !!player.seated }),
    setOthers(list) {
      const ids = new Set(list.map(o => o.id));
      for (const id of [...othersMap.keys()]) if (!ids.has(id)) othersMap.delete(id);
      for (const o of list) {
        let cur = othersMap.get(o.id);
        if (!cur) {
          cur = { id: o.id, other: true, dir: 'down', ...tileCenter(6, 11) };
          cur.tx = cur.x; cur.ty = cur.y;
          othersMap.set(o.id, cur);
        }
        cur.name = o.name; cur.look = o.look || {};
        if (o.pos) Castle.movePlayer(o.id, o.pos, !cur.seen);
      }
    },
    setRank(n) { seatRank = Math.max(0, n | 0); },
    movePlayer(id, p, snap) {
      const o = othersMap.get(id);
      if (!o) return;
      if (snap || !o.seen) { o.x = p.x; o.y = p.y; o.seen = true; }
      o.tx = p.x; o.ty = p.y; o.dir = p.dir; o.moving = p.moving; o.seated = p.seated;
    },
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
