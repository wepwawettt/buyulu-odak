// Piksel sahne: her şey 160x120 "mantıksal piksel" üzerinde çizilir,
// CSS ile büyütülür (image-rendering: pixelated).
const Scene = (() => {
  const W = 160, H = 120;

  // Bina renkleri (isimler özgün; istersen değiştir)
  const HOUSES = {
    kizil:    { name: 'Kızıl & Altın',    a: '#9c1c1c', b: '#e3b23c' },
    zumrut:   { name: 'Zümrüt & Gümüş',   a: '#1f5e3a', b: '#b9c0c7' },
    safir:    { name: 'Safir & Bronz',    a: '#1f3f8a', b: '#b07a3a' },
    kehribar: { name: 'Kehribar & Siyah', a: '#d9a520', b: '#2a2a2a' },
  };
  const HAIR = {
    siyah: '#2b1d16', kahve: '#6b3e1f', kizil: '#b5481f', sari: '#e3c46a', gumus: '#cfcbe0',
  };
  const SKIN = ['#f6d2b5', '#e8b48f', '#c98a5e', '#8d5a3b'];

  // Karakter (26x34, chibi). En alt satırlar masanın hemen üstünde biter.
  const CHAR = [
    '...............KK.........',
    '..............KHK.........',
    '.............KHHK.........',
    '............KHHHK.........',
    '...........KHHHHK.........',
    '..........KHHHhHK.........',
    '..........KHHHHhHK........',
    '.........KHHHHHhHK........',
    '........KHHHHHHhHHK.......',
    '.......KCCcCCcCCcCK.......',
    '.......KcCCcCCcCCcK.......',
    '...KKKKHHHHHHHHHHHHKKKK...',
    '.KKHHHHHHHHHHHHHHHHHHHHKK.',
    '..KKKKKKKKKKKKKKKKKKKKKK..',
    '...KRRRRRRRRRRRRRRRRRRK...',
    '...KRRRRRRRRRRRRRRRRRRK...',
    '...KRRRSRRRRSSRRRRSRRRK...',
    '...KRRSSSRRSSSSRRSSSRRK...',
    '...KRSSSSSSSSSSSSSSSSRK...',
    '...KRSSSSSSSSSSSSSSSSRK...',
    '...KRSSWESSSSSSSSWESSRK...',
    '...KRSSEESSSSSSSSEESSRK...',
    '...KRSSEESSSSSSSSEESSRK...',
    '...KRSBBSSSSSSSSSSBBSRK...',
    '...KRSSSSSSSMMSSSSSSSRK...',
    '...KRRSSSSSSSSSSSSSSRRK...',
    '...KRRRSSSSSSSSSSSSRRRK...',
    '...KRRRKSSSSSSSSSSKRRRK...',
    '...KRRRKCcCcCcCcCcKRRRK...',
    '..KOKRRKCcCcCcCcCcKRRKOK..',
    '.KOOOOOOOOcCOOOOOOOOOOOOK.',
    '.KOOOOOOOOCcOOOOOOOOOOOOK.',
    'KOOOOOOOOOcCOOOOOOOOcOOOOK',
    'KOOOOOOOOOCcOOOOOOOOOOOOOK',
  ];
  // Kısa saç: yandaki uzun saç tutamlarını kaldırır
  const SHORT_HAIR = {
    18: '....KSSSSSSSSSSSSSSSSK....', 19: '....KSSSSSSSSSSSSSSSSK....',
    20: '....KSSWESSSSSSSSWESSK....', 21: '....KSSEESSSSSSSSEESSK....', 22: '....KSSEESSSSSSSSEESSK....',
    23: '....KSBBSSSSSSSSSSBBSK....', 24: '....KSSSSSSSMMSSSSSSSK....', 25: '.....KSSSSSSSSSSSSSSK.....',
    26: '......KSSSSSSSSSSSSK......', 27: '.......KSSSSSSSSSSK.......', 28: '.......KCcCcCcCcCcK.......',
    29: '..KOKOOKCcCcCcCcCcKOOKOK..',
  };
  const EYES_CLOSED_SHORT = {
    20: '....KSSSSSSSSSSSSSSSSK....', 21: '....KSSSSSSSSSSSSSSSSK....', 22: '....KSSKKSSSSSSSSKKSSK....',
  };
  const EYES_CLOSED = {
    20: '...KRSSSSSSSSSSSSSSSSRK...',
    21: '...KRSSSSSSSSSSSSSSSSRK...',
    22: '...KRSSKKSSSSSSSSKKSSRK...',
  };

  // Baykuş (9x9)
  const OWL = [
    '.K.....K.',
    '.KbbbbbK.',
    'KbWWbWWbK',
    'KbWEbWEbK',
    'KbbbYbbbK',
    'KblllllbK',
    'KblLlLlbK',
    '.KblllbK.',
    '..KYKYK..',
  ];
  const OWL_BLINK = { 2: 'KbbbbbbbK', 3: 'KbKKbKKbK' };
  const OWL_PAL = { K: '#1e1726', b: '#8a6a4a', W: '#f0d890', E: '#1a1a1a', Y: '#e8a030', l: '#c8a878', L: '#a88858' };

  const CANDLES = [
    { x: 26, y: 5, p: 0 }, { x: 58, y: 15, p: 1.7 }, { x: 98, y: 8, p: 3.1 }, { x: 140, y: 11, p: 4.4 },
  ];

  const WIN = { x: 12, y: 12, w: 34, h: 50 };

  // Gerçek saate göre gökyüzü (oda penceresi ve kale tavanı): 08–17 gündüz, 06–08 ve 17–20 alacakaranlık
  function skyPhase(d = new Date()) {
    const h = d.getHours();
    return h >= 8 && h < 17 ? 'day' : (h >= 6 && h < 8) || (h >= 17 && h < 20) ? 'dusk' : 'night';
  }
  // Mevsim süsleri: Aralık–Şubat kar, 20–31 Ekim balkabağı
  function season(d = new Date()) {
    const m = d.getMonth() + 1;
    return m === 12 || m <= 2 ? 'winter' : m === 10 && d.getDate() >= 20 ? 'pumpkin' : '';
  }
  const WIN_SKY = {
    night: { sky: ['#141a3d', '#1c2a5c', '#2b3c78'], hill: '#0e1128' },
    dusk: { sky: ['#2e2a5e', '#8a4a6a', '#e08a5a'], hill: '#2a1a2a' },
    day: { sky: ['#4a8ad0', '#6aa8e0', '#9ccaf0'], hill: '#3a4a68' },
  };
  let skyKey = '';

  // Oda temaları (dükkandan alınır): duvar deseni ve renkleri, zemin. b: üç tuğla/tahta tonu, hl: üst kenar
  const THEMES = {
    tas:      { wall: '#26222f', b: ['#3a3448', '#433c52', '#4b4459'], hl: '#544c63', floor: '#4a3222', fl: '#3b2719', edge: '#2d1f16' },
    gece:     { wall: '#121633', b: ['#1c2450', '#222c5c', '#29346a'], hl: '#34427a', floor: '#2a2640', fl: '#1e1a30', edge: '#151226', spark: '#c8d4ff' },
    orman:    { kind: 'plank', wall: '#3a2414', b: ['#6a4428', '#74502e', '#7e5a34'], hl: '#4e321c', floor: '#3e4a28', fl: '#2e3a1e', edge: '#2a2414' },
    kristal:  { wall: '#2e2648', b: ['#4a3e6e', '#54487a', '#5e5288'], hl: '#6e62a0', floor: '#38344e', fl: '#2a2640', edge: '#221e34', spark: '#e8d8ff', spark2: '#a8e0ff' },
    kraliyet: { kind: 'paper', wall: '#2a1436', b: ['#3e2616', '#3a1e48', '#4a2e1a'], hl: '#c9a24a', floor: '#3a2418', fl: '#2a180e', edge: '#20120a' },
    buz:      { wall: '#3a5a7a', b: ['#6a90b8', '#7aa0c6', '#8ab0d2'], hl: '#b8d4ee', floor: '#8aa8c8', fl: '#7090b0', edge: '#4a6a8a', spark: '#ffffff' },
  };
  let theme = 'tas';

  // ---------- Evcil hayvan (yumurtadan çıkan sürpriz yaratık; oda ve kale birlikte kullanır) ----------
  // K kontur  A ana renk  W karın/yüz  E göz  P burun/yanak  S yumurta beneği
  const PET_PAL = {
    tilki: { A: '#e8925a', W: '#fff0dc', P: '#6a3a3a' },
    pofuduk: { A: '#c8a8e8', W: '#f4ecff', P: '#f6a6b0' },
    kurbaga: { A: '#7ac06a', W: '#d8f0b0', P: '#e88a8a' },
    tavsan: { A: '#e8dcd0', W: '#ffffff', P: '#f6a6b0' },
  };
  const PET_SPR = {
    egg: ['..KKK..', '.KWWWK.', 'KWWSWWK', 'KWWWWSK', 'KSWWWWK', 'KWWSWWK', '.KWWWK.', '..KKK..'],
    tilki: [
      ['.K....K.', 'KAK..KAK', 'KAAAAAAK', 'KAEAAEAK', 'KWWAAWWK', '.KWWWWK.', '..K..K..'],
      ['.K....K....', 'KAK..KAK...', 'KAAAAAAK...', 'KAEAAEAK.K.', 'KWWAAWWKKAK', '.KWWWWKKAAK', '.KAAAAAAAWK', '.KAAAAAAKK.', '..KK..KK...'],
    ],
    pofuduk: [
      ['..KKKK..', '.KAAAAK.', 'KAAAAAAK', 'KAEAAEAK', 'KAPAAPAK', '.KAAAAK.', '..K..K..'],
      ['...KKKK...', '.KKAAAAKK.', 'KAAAAAAAAK', 'KAAEAAEAAK', 'KAPAAAAPAK', 'KAAAAAAAAK', '.KAAAAAAK.', '..KKAAKK..', '..K....K..'],
    ],
    kurbaga: [
      ['.KK..KK.', 'KWEKKWEK', 'KAAAAAAK', 'KAPAAPAK', 'KAWWWWAK', '.KK..KK.'],
      ['.KKK..KKK.', 'KWEAKKWEAK', 'KAAAAAAAAK', 'KAPAAAAPAK', 'KAAWWWWAAK', 'KAWWWWWWAK', '.KAAKKAAK.', 'KK.K..K.KK'],
    ],
    tavsan: [
      ['.KK..KK.', 'KPK..KPK', 'KPK..KPK', 'KAAKKAAK', 'KAAAAAAK', 'KAEAAEAK', 'KAPAAPAK', '.KAWWAK.', '..K..K..'],
      ['.KK....KK.', 'KPK....KPK', 'KPAK..KAPK', '.KAKKKKAK.', 'KAAAAAAAAK', 'KAAEAAEAAK', 'KAPAAAAPAK', '.KAAWWAAK.', 'KAAAWWAAAK', 'KAAAAAAAAK', '.KK.KK.KK.'],
    ],
  };
  // info: { species, stage (0 yumurta, 1 yavru, 2 genç, 3 yetişkin), sleepy, cape }
  // (cx, by): ayakların ortası
  function drawPet(c, cx, by, info, time) {
    if (!info) return;
    if (!info.stage) { // yumurta: ara sıra sallanır
      const wob = Math.sin(time * 9) > 0.7 && Math.sin(time * 0.9) > 0.4 ? (Math.sin(time * 30) > 0 ? 1 : -1) : 0;
      sprite(c, PET_SPR.egg, { K: '#5a4050', W: '#f4ecdc', S: '#b8a0d8' }, Math.round(cx - 3 + wob), Math.round(by - 8));
      return;
    }
    const rows = PET_SPR[info.species][info.stage >= 2 ? 1 : 0];
    const w = rows[0].length, h = rows.length;
    const bob = info.sleepy || info.sad ? 0 : Math.sin(time * 4) > 0.3 ? 1 : 0;
    const ox = Math.round(cx - w / 2), oy = Math.round(by - h - bob);
    const pal = { K: '#5a4050', E: info.sleepy ? '#5a4050' : '#2a1e2e', ...PET_PAL[info.species] };
    sprite(c, rows, pal, ox, oy);
    if (info.stage === 3) {
      if (info.species === 'tavsan') { // omuzlardan sarkan pelerin ve altın toka
        const cape = info.cape || '#9c1c1c';
        px(c, ox - 1, oy + 7, 2, 4, cape); px(c, ox + w - 1, oy + 7, 2, 4, cape);
        px(c, ox + 1, oy + 7, 2, 1, cape); px(c, ox + w - 3, oy + 7, 2, 1, cape);
        px(c, ox + 4, oy + 8, 2, 1, '#e3b23c');
      } else if (info.species === 'tilki') { // kuyrukta parlayan yıldızlar
        if (Math.sin(time * 3) > -0.2) px(c, ox + w - 2, oy + 3, 1, 1, '#fff6a0');
        if (Math.sin(time * 3 + 2) > -0.2) px(c, ox + w, oy + 6, 1, 1, '#fff6a0');
      } else if (info.species === 'pofuduk') { // taç ve minik kanatlar
        px(c, ox + 3, oy - 2, 4, 1, '#e3b23c'); px(c, ox + 3, oy - 3, 1, 1, '#e3b23c'); px(c, ox + 6, oy - 3, 1, 1, '#e3b23c');
        px(c, ox - 2, oy + 3, 2, 2, '#ffffff'); px(c, ox + w, oy + 3, 2, 2, '#ffffff');
      } else if (info.species === 'kurbaga') { // büyücü şapkası
        px(c, ox + 2, oy - 1, 6, 1, '#4a4068'); px(c, ox + 3, oy - 2, 4, 1, '#6a5e90'); px(c, ox + 4, oy - 4, 2, 2, '#6a5e90'); px(c, ox + 5, oy - 5, 1, 1, '#e3b23c');
      }
    }
    if (info.sleepy && Math.sin(time * 1.5) > 0) px(c, ox + w, oy - 3, 2, 1, '#c8c8e8'); // uyuyor (z)
    if (info.sad && !info.sleepy) { // üzgün: gözünden süzülen minik gözyaşı
      const eye = rows.findIndex(r => r.includes('E')), ex = rows[eye].indexOf('E');
      px(c, ox + ex, oy + eye + 1 + (Math.floor(time * 2) % 3), 1, 1, '#7ab8f0');
    }
  }

  let ctx, bg, look = { house: 'kizil', hair: 'kahve', skin: 1 }, state = 'idle';
  let t = 0, last = 0, acc = 0, sparkTimer = 0, particles = [], stars = [], items = [];
  // Ortak oda: arkadaş varken iki kişilik düzen (sen solda, arkadaşın sağda)
  let friend = null;
  let brew = null; // { level 0..1, color, done } — odadaki iksir demleme
  let pet = null, chart = false; // evcil hayvan bilgisi, duvardaki yıldız haritası
  const FRIEND_X = 86;
  const duo = () => friend && !iconMode;
  const meX = () => (duo() ? 50 : 67);

  function hash(a, b) {
    let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function px(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(x | 0, y | 0, w, h); }

  function sprite(c, rows, pal, ox, oy, over) {
    for (let y = 0; y < rows.length; y++) {
      const row = (over && over[y]) || rows[y];
      for (let x = 0; x < row.length; x++) {
        const col = pal[row[x]];
        if (col) px(c, ox + x, oy + y, 1, 1, col);
      }
    }
  }

  function inArch(x, y, ax, ay, aw, ah) {
    const r = aw / 2;
    if (x < ax || x >= ax + aw || y < ay || y >= ay + ah) return false;
    if (y >= ay + r) return true;
    const dx = x + 0.5 - (ax + r), dy = y + 0.5 - (ay + r);
    return dx * dx + dy * dy <= r * r;
  }

  // ---------- Statik arka plan (sadece görünüm değişince yeniden çizilir) ----------
  function buildBg(c = bg.getContext('2d')) {
    const house = HOUSES[look.house];

    // Duvar (oda temasına göre: taş, ahşap ya da desenli duvar kâğıdı)
    const th = THEMES[theme] || THEMES.tas, [b0, b1, b2] = th.b;
    px(c, 0, 0, W, 92, th.wall);
    if (th.kind === 'plank') {
      for (let x = 0; x < W; x += 10) {
        const v = hash(x, 5);
        px(c, x, 0, 9, 92, v < 0.3 ? b0 : v < 0.75 ? b1 : b2);
        px(c, x, 0, 1, 92, th.hl);
        for (let y = 6; y < 92; y += 23 + Math.floor(hash(x, 9) * 9)) px(c, x + 3 + Math.floor(hash(x, y) * 3), y, 2, 1, th.wall); // budak
      }
    } else if (th.kind === 'paper') {
      px(c, 0, 0, W, 92, b1);
      for (let y = 4; y < 72; y += 10) for (let x = (y / 10) % 2 ? 0 : 6; x < W; x += 12) {
        px(c, x + 1, y, 1, 1, th.hl); px(c, x, y + 1, 3, 1, th.hl); px(c, x + 1, y + 2, 1, 1, th.hl);
      }
      px(c, 0, 72, W, 20, b0); px(c, 0, 72, W, 1, th.hl); // ahşap lambri
      for (let x = 4; x < W; x += 16) px(c, x, 76, 12, 12, b2);
    } else {
      for (let r = 0; r < 12; r++) {
        const y = r * 8, off = r % 2 ? 6 : 0;
        for (let x = -off; x < W; x += 12) {
          const v = hash(x + 40, r + 7);
          px(c, x + 1, y + 1, 10, 6, v < 0.15 ? b0 : v < 0.8 ? b1 : b2);
          px(c, x + 1, y + 1, 10, 1, th.hl);
        }
      }
    }
    if (th.spark) for (let i = 0; i < 26; i++) { // duvarda parıltılar
      const x = Math.floor(hash(i, 31) * W), y = Math.floor(hash(i, 37) * 88);
      px(c, x, y, 1, 1, th.spark);
      if (hash(i, 41) > 0.6) { px(c, x - 1, y, 1, 1, th.spark2 || th.spark); px(c, x + 1, y, 1, 1, th.spark2 || th.spark); }
    }

    // Kemerli pencere (gökyüzü gerçek saate göre)
    const { x: wx, y: wy, w: ww, h: wh } = WIN;
    const phase = skyPhase(), sea = season(), S = WIN_SKY[phase];
    skyKey = phase + sea;
    for (let y = wy - 2; y < wy + wh + 2; y++) {
      for (let x = wx - 2; x < wx + ww + 2; x++) {
        if (!inArch(x, y, wx - 2, wy - 2, ww + 4, wh + 4)) continue;
        if (!inArch(x, y, wx, wy, ww, wh)) { px(c, x, y, 1, 1, '#6b4a2f'); continue; }
        const k = (y - wy) / wh;
        px(c, x, y, 1, 1, S.sky[k < 0.35 ? 0 : k < 0.7 ? 1 : 2]);
      }
    }
    const disc = (cx, cy, r, col) => {
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r && inArch(cx + x, cy + y, wx, wy, ww, wh)) px(c, cx + x, cy + y, 1, 1, col);
      }
    };
    if (phase === 'night') { // Ay
      disc(36, 26, 5, '#f4ecc8');
      px(c, 34, 24, 2, 2, '#ddd3aa'); px(c, 38, 28, 2, 1, '#ddd3aa');
    } else if (phase === 'day') { // Güneş ve bulutlar
      disc(37, 22, 4, '#ffe9a0'); disc(37, 22, 3, '#fff6d0');
      px(c, 15, 30, 9, 2, '#eef6ff'); px(c, 17, 28, 5, 2, '#eef6ff');
      px(c, 31, 46, 10, 2, '#eef6ff'); px(c, 33, 44, 5, 2, '#eef6ff');
    } else disc(38, 50, 5, '#ffb468'); // Batan/doğan güneş
    // Uzak kale silüeti
    for (let x = wx; x < wx + ww; x++) {
      const hgt = 4 + Math.floor(hash(x, 3) * 3) + ((x > 20 && x < 24) ? 8 : 0) + ((x > 32 && x < 35) ? 6 : 0);
      for (let y = wy + wh - hgt; y < wy + wh; y++) if (inArch(x, y, wx, wy, ww, wh)) px(c, x, y, 1, 1, S.hill);
    }
    px(c, 21, wy + wh - 14, 4, 2, S.hill); px(c, 22, wy + wh - 16, 2, 2, S.hill);
    if (phase !== 'day') { px(c, 22, wy + wh - 9, 1, 1, '#ffd46b'); px(c, 33, wy + wh - 7, 1, 1, '#ffd46b'); }
    // Pencere kayıtları ve pervaz
    px(c, wx + ww / 2 - 1, wy, 2, wh, '#6b4a2f');
    px(c, wx, wy + 30, ww, 2, '#6b4a2f');
    px(c, wx - 4, wy + wh + 1, ww + 8, 3, '#7a5636');
    px(c, wx - 4, wy + wh + 1, ww + 8, 1, sea === 'winter' ? '#eef4ff' : '#8f6a45'); // kışın pervazda kar
    if (sea === 'pumpkin') { // pervazda balkabağı
      const bx = wx + ww - 9, by = wy + wh - 5;
      px(c, bx + 1, by, 6, 6, '#e07a2a'); px(c, bx, by + 1, 8, 4, '#e07a2a');
      px(c, bx + 3, by, 1, 6, '#b85a1a'); px(c, bx + 5, by + 1, 1, 4, '#b85a1a');
      px(c, bx + 3, by - 2, 2, 2, '#4a7a3a');
    }

    // Yıldızlar (kayıtlara ve aya denk gelmeyenler)
    stars = [];
    for (let i = 0; i < 40 && stars.length < 14; i++) {
      const x = wx + 1 + Math.floor(hash(i, 11) * (ww - 2));
      const y = wy + 1 + Math.floor(hash(i, 23) * 26);
      if (!inArch(x, y, wx, wy, ww, wh)) continue;
      if (Math.abs(x - (wx + ww / 2)) < 2 || y >= wy + 29) continue;
      if ((x - 36) ** 2 + (y - 26) ** 2 < 49) continue;
      stars.push({ x, y, p: hash(i, 5) * 6 });
    }

    // Bina sancağı
    px(c, 70, 5, 20, 2, '#8a6a3a');
    px(c, 72, 7, 16, 33, house.a);
    px(c, 72, 7, 1, 33, house.b); px(c, 87, 7, 1, 33, house.b);
    for (let k = 0; k < 6; k++) {
      px(c, 72, 40 + k, 7 - k, 1, house.a);
      px(c, 81 + k, 40 + k, 7 - k, 1, house.a);
    }
    // Arma: küçük kalkan
    px(c, 76, 16, 8, 8, house.b);
    px(c, 77, 24, 6, 2, house.b); px(c, 78, 26, 4, 1, house.b);
    px(c, 77, 17, 6, 6, house.a);
    px(c, 79, 18, 2, 5, house.b); px(c, 78, 19, 4, 1, house.b);

    // Kitaplık
    const bx = 114, by = 26;
    px(c, bx, by, 38, 66, '#5a3a24');
    px(c, bx + 2, by + 2, 34, 62, '#24170e');
    const bookCols = ['#7a2a2a', '#2a4a7a', '#2a6a4a', '#7a6a2a', '#5a2a6a', '#8a4a2a', '#3a3a5a'];
    for (let s = 0; s < 4; s++) {
      const floorY = by + 2 + 15 * s + 13;
      let x = bx + 3;
      let i = 0;
      while (x < bx + 34) {
        const r = hash(s * 31 + i, 9);
        const bw = 2 + Math.floor(r * 3);
        const bh = 8 + Math.floor(hash(i, s + 2) * 5);
        if (x + bw > bx + 35) break;
        if (hash(i + 3, s * 7) < 0.1) { x += 3; i++; continue; } // boşluk
        const col = bookCols[Math.floor(hash(i, s * 13) * bookCols.length)];
        px(c, x, floorY - bh, bw, bh, col);
        px(c, x, floorY - bh + 2, bw, 1, '#c9a24a');
        x += bw + (r > 0.85 ? 1 : 0);
        i++;
      }
      px(c, bx, floorY, 38, 2, '#6a452b');
    }

    // 5. sınıf ödülü: çerçeveli yıldız haritası (takımyıldız çizgileriyle)
    if (chart) {
      px(c, 93, 27, 18, 16, '#8a6a3a'); px(c, 94, 28, 16, 14, '#1c2450');
      px(c, 93, 27, 18, 1, '#a8845f');
      const st = [[96, 31], [100, 33], [104, 30], [107, 35], [103, 38], [98, 39]];
      for (let i = 0; i < st.length - 1; i++) {
        const [x0, y0] = st[i], [x1, y1] = st[i + 1], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
        for (let k = 1; k < n; k++) px(c, Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), 1, 1, '#4a5a9a');
      }
      for (const [x, y] of st) px(c, x, y, 1, 1, '#fff6c0');
      px(c, 108, 29, 1, 1, '#9fb0e8'); px(c, 95, 36, 1, 1, '#9fb0e8');
    }

    // Zemin
    px(c, 0, 92, W, 28, th.floor);
    for (let y = 92; y < H; y += 6) {
      px(c, 0, y, W, 1, th.fl);
      const off = Math.floor(hash(y, 1) * 30);
      for (let x = off; x < W; x += 40) px(c, x, y, 1, 6, th.fl);
    }
    px(c, 0, 89, W, 3, th.edge);

    // Halı (bina renklerinde)
    px(c, 26, 103, 108, 12, house.b);
    px(c, 24, 105, 112, 8, house.b);
    px(c, 28, 105, 104, 8, house.a);
    px(c, 26, 107, 108, 4, house.a);
    for (let x = 34; x < 128; x += 8) px(c, x, 108, 3, 2, house.b);
  }

  // ---------- Dinamik parçalar ----------
  // Kışın pencerenin ardında kar yağar
  function drawSnow() {
    const { x: wx, y: wy, w: ww, h: wh } = WIN;
    for (let i = 0; i < 16; i++) {
      const x = Math.round(wx + hash(i, 7) * ww + Math.sin(t * 0.9 + i) * 1.5);
      const y = Math.round(wy + ((t * (5 + hash(i, 3) * 4) + hash(i, 9) * wh) % wh));
      if (inArch(x, y, wx, wy, ww, wh) && Math.abs(x - (wx + ww / 2 - 0.5)) > 1 && y !== wy + 30 && y !== wy + 31) px(ctx, x, y, 1, 1, '#f4f8ff');
    }
  }

  function drawStars() {
    if (skyKey.startsWith('day') || skyKey.startsWith('dusk')) return; // yıldızlar sadece gece
    for (const s of stars) {
      const v = Math.sin(t * 2 + s.p);
      if (v > -0.3) px(ctx, s.x, s.y, 1, 1, v > 0.6 ? '#ffffff' : '#9fb0e8');
    }
  }

  function drawCandle({ x, y, p }) {
    const yy = y + Math.round(Math.sin(t * 1.5 + p) * 1.5);
    ctx.fillStyle = 'rgba(255,200,110,0.10)';
    ctx.fillRect(x - 4, yy - 7, 11, 9);
    ctx.fillRect(x - 2, yy - 9, 7, 13);
    px(ctx, x, yy, 3, 7, '#efe6cf');
    px(ctx, x + 2, yy, 1, 7, '#cfc3a5');
    px(ctx, x, yy + 1, 1, 2, '#fff8e6');
    px(ctx, x + 1, yy - 1, 1, 1, '#3a2a1a');
    const f = hash(Math.floor(t * 8), Math.floor(p * 10)) > 0.5;
    px(ctx, x + 1, yy - 3, 1, 2, '#ffd46b');
    px(ctx, f ? x : x + 2, yy - 2, 1, 1, '#ff9a3c');
    if (f) px(ctx, x + 1, yy - 4, 1, 1, '#fff2b0');
  }

  // ---------- Kıyafetler ----------
  // pal: karakter paletinin üzerine yazılan renkler, rows: sprite satırı değişimleri,
  // sleeve: masadaki kol rengi, fx: kıyafete özel küçük efekt
  const CAT_BEANIE = {
    0: '..........................',
    1: '..........................',
    2: '..........................',
    3: '....KK..............KK....',
    4: '....KPK............KPK....',
    5: '...KHPHK..........KHPHK...',
    6: '...KHPHHKKKKKKKKKKHHPHK...',
    7: '...KHHHHHHHHHHHHHHHHHHK...',
    8: '..KHHHHhHHHHHHHHHHhHHHHK..',
    9: '..KHHHHHHHHHHHHHHHHHHHHK..',
    10: '..KHHHHHHHHHHHHHHHHHHHHK..',
    11: '..KCcCcCcCcCcCcCcCcCcCcK..',
    12: '..KcCcCcCcCcCcCcCcCcCcCK..',
    13: '...KKKKKKKKKKKKKKKKKKKK...',
  };
  const GOLD_BRIM = { 13: '..KggggggggggggggggggggK..' };
  const OUTFITS = {
    klasik:   {},
    gece:     { pal: { H: '#1f2d66', h: '#3b56a8', O: '#18224f' }, sleeve: '#26357a', fx: 'stars' },
    orman:    { pal: { H: '#2e5a32', h: '#4a8a4a', O: '#23432a' }, sleeve: '#2f5a38' },
    kabak:    { pal: { H: '#e07a20', h: '#f5a547', O: '#3a2a1a' }, sleeve: '#4a3622' },
    kraliyet: { pal: { H: '#4a2a7a', h: '#7a52b8', O: '#3a2060', g: '#e3b23c' }, sleeve: '#4a2c78', rows: GOLD_BRIM },
    kar:      { pal: { H: '#dde6f2', h: '#ffffff', O: '#b8c8e0', K: '#4a5a7a' }, sleeve: '#c8d6ea', fx: 'snow' },
    // Sınıf atlayınca açılanlar (dükkanda satılmaz)
    bilgin:   { pal: { H: '#2a5a5a', h: '#4a8a80', O: '#20463f' }, sleeve: '#2a5650' },
    ayaz:     { pal: { H: '#2a6a8a', h: '#5aa8c8', O: '#1e4a62', g: '#e8f4ff' }, sleeve: '#2a5a78', rows: GOLD_BRIM, fx: 'snow' }, // Kış Şenliği
    kidemli:  { pal: { H: '#6a2a3a', h: '#9a4a5a', O: '#4a2030', g: '#e3b23c' }, sleeve: '#5a2632', rows: GOLD_BRIM },
    mezun:    { pal: { H: '#2a2632', h: '#4a4458', O: '#1e1a26', g: '#e3b23c' }, sleeve: '#2a2632', rows: GOLD_BRIM, fx: 'stars' },
    kedi:     { pal: { H: '#efe6d6', h: '#ffffff', P: '#f0a0b0', O: '#6a5a8a' }, sleeve: '#7a6a9a', rows: CAT_BEANIE,
                starSpots: [[7, 9], [12, 8], [17, 9], [10, 10], [15, 10]] },
  };
  const outfit = id => OUTFITS[id] || OUTFITS.klasik;

  function drawCharacter(worn = items, outfitId = look.outfit, ox = meX(), lk = look, phase = 0) {
    const of = outfit(outfitId);
    const pal = {
      K: '#1e1726', H: '#2b2540', h: '#453b6b',
      C: HOUSES[lk.house].a, c: HOUSES[lk.house].b,
      R: HAIR[lk.hair], S: SKIN[lk.skin], s: shade(SKIN[lk.skin]),
      E: '#1a1420', B: '#f0a0a0', O: '#221d33', W: '#ffffff', M: '#8a3a3a',
      ...of.pal,
    };
    const blink = state !== 'break' && ((t + phase) % 3.3) < 0.15;
    const closed = !iconMode && (state === 'break' || blink);
    const bob = state === 'focus' && !iconMode ? Math.round(Math.sin((t + phase) * 3) * 0.5 + 0.5) : 0;
    const oy = 46 + bob;
    const short = lk.hairStyle === 'kisa';
    sprite(ctx, CHAR, pal, ox, oy, { ...of.rows, ...(short ? SHORT_HAIR : null), ...(closed ? (short ? EYES_CLOSED_SHORT : EYES_CLOSED) : null) });
    if (of.fx === 'stars') {
      [[13, 4], [11, 7], [16, 9], [6, 12], [19, 12], [4, 31], [21, 30], [15, 32]].forEach(([x, y], i) => {
        if (iconMode || Math.sin(t * 2.5 + i * 2.3) > 0.2) px(ctx, ox + x, oy + y, 1, 1, '#ffe9a0');
      });
    }
    if (of.fx === 'snow') {
      for (let i = 0; i < 9; i++) {
        const fy = iconMode ? (i * 11) % 34 : (t * 5 + i * 7.3) % 36;
        const fx = (i * 17) % 34 - 4 + Math.round(Math.sin(t * 1.5 + i) * 1.5);
        ctx.globalAlpha = 0.85;
        px(ctx, ox + fx, oy - 2 + Math.round(fy), 1, 1, '#ffffff');
      }
      ctx.globalAlpha = 1;
    }
    for (const id of worn) if (ITEMS[id]?.layer === 'char') ITEMS[id].draw(ox, oy, of);
  }

  function outfitIcon(id) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const saved = ctx;
    ctx = c.getContext('2d');
    iconMode = true;
    drawCharacter([], id);
    iconMode = false;
    ctx = saved;
    const out = document.createElement('canvas');
    out.width = 30; out.height = 34;
    out.getContext('2d').drawImage(c, 65, 46, 30, 34, 0, 0, 30, 34);
    return out.toDataURL();
  }

  // ---------- Dükkan eşyaları ----------
  // layer: 'back' = karakterden önce, 'char' = karakterin üstüne, 'front' = masadan sonra
  // box: dükkan ikonunun sahneden kırpılacağı alan [x, y, w, h]
  const PORTRAIT = [
    '......P.....',
    '.....PP.....',
    '....PPPP....',
    '...PPPPPP...',
    '..PPPPPPPP..',
    '.PPPPPPPPPP.',
    '...SSSSSS...',
    '...SESSES...',
    '...SSSSSS...',
    '..WSSWWSSW..',
    '..WWWWWWWW..',
    '...WWWWWW...',
    '..RWWWWWWR..',
    '.RRRWWWWRRR.',
    'RRRRRWWRRRRR',
    'RRRRRRRRRRRR',
  ];
  const CAT = [
    '.K...K...',
    '.KK.KK...',
    '.KKKKK...',
    '.KYKYK...',
    '.KKpKK...',
    '..KKK....',
    '.KKKKK...',
    '.KKKKK...',
    '.KKKKKK..',
  ];
  const DRAGON = [
    '..Y.....Y..',
    '..GG...GG..',
    '.GGGGGGGGG.',
    'GGGGGGGGGGG',
    'GGWEGGGWEGG',
    'GGEEGGGEEGG',
    'GGGGNGNGGGG',
    '.GGGGGGGGG.',
    'wGGLLLLLGGw',
    'wwGLLLLLGww',
    '.GGLLLLLGG.',
    '.GG.....GG.',
  ];
  const DRAGON_SLEEP = { 4: 'GGGGGGGGGGG', 5: 'GGEEGGGEEGG' };
  const GHOST = [
    '..GGGGG..',
    '.GGGGGGG.',
    'GGGGGGGGG',
    'GGEGGGEGG',
    'GGEGGGEGG',
    'GBGGGGGBG',
    'GGGGoGGGG',
    'GGGGGGGGG',
    'GGGGGGGGG',
    'G.GG.GG.G',
  ];
  const BOOK = [
    ['C.......C', 'CC.....CC', '.CCC.CCC.', '..CCWCC..', '...CWC...'],
    ['.........', '.........', 'CCCCWCCCC', '.CCCWCCC.', '.........'],
    ['...CWC...', '..CCWCC..', '.CCC.CCC.', 'CC.....CC', 'C.......C'],
  ];
  const EXTRA_CANDLES =[{ x: 8, y: 2, p: 2.2 }, { x: 108, y: 2, p: 5.1 }, { x: 62, y: 57, p: 0.9 }];

  const ITEMS = {
    glasses: {
      layer: 'char', withChar: true, box: [71, 63, 18, 8],
      draw(ox, oy) {
        const g = '#d9b04a';
        for (const lx of [6, 16]) {
          px(ctx, ox + lx, oy + 19, 4, 1, g); px(ctx, ox + lx, oy + 23, 4, 1, g);
          px(ctx, ox + lx, oy + 20, 1, 3, g); px(ctx, ox + lx + 3, oy + 20, 1, 3, g);
        }
        px(ctx, ox + 10, oy + 20, 6, 1, g);
      },
    },
    starhat: {
      layer: 'char', withChar: true, box: [67, 46, 26, 14],
      draw(ox, oy, of = {}) {
        const spots = of.starSpots || [[13, 4], [12, 5], [11, 7], [16, 8], [5, 12], [12, 12], [20, 12]];
        spots.forEach(([x, y], i) => {
          if (Math.sin(t * 3 + i * 1.7) > -0.4) px(ctx, ox + x, oy + y, 1, 1, '#ffe9a0');
        });
      },
    },
    painting: {
      layer: 'back', box: [50, 26, 20, 24],
      draw() {
        px(ctx, 52, 28, 16, 20, '#c9a24a');
        px(ctx, 53, 29, 14, 18, '#8a6a3a');
        px(ctx, 54, 30, 12, 16, '#23382c');
        const blink = (t % 6.5) < 0.2;
        const lookLeft = Math.floor(t / 4) % 3 === 1;
        const eyes = blink ? '...SSSSSS...' : lookLeft ? '...ESSESS...' : null;
        sprite(ctx, PORTRAIT, { P: '#5a3a8a', S: '#e8c4a0', E: '#1a1420', W: '#eeeeee', R: '#3a2a6a' }, 54, 30, eyes ? { 7: eyes } : null);
      },
    },
    broom: {
      layer: 'back', box: [150, 40, 10, 66],
      draw() {
        const b = Math.round(Math.sin(t * 2) * 1.5) - 2;
        px(ctx, 155, 44 + b, 2, 48, '#7a5636');
        px(ctx, 155, 44 + b, 1, 48, '#8f6a45');
        px(ctx, 154, 91 + b, 4, 2, '#5a3a24');
        for (let k = 0; k < 11; k++) {
          const w = 4 + Math.floor(k / 3);
          px(ctx, 156 - Math.floor(w / 2), 93 + b + k, w, 1, k % 2 ? '#c9a24a' : '#b08a3a');
        }
        if (Math.sin(t * 5) > 0) px(ctx, 153 + Math.floor(t * 3) % 6, 106 + b, 1, 1, '#ffe9a0');
      },
    },
    cauldron: {
      layer: 'back', box: [2, 78, 26, 30],
      draw() {
        const cx = 5, cy = 91;
        ctx.fillStyle = 'rgba(90,219,106,0.07)';
        ctx.fillRect(cx + 1, cy - 6, 18, 6);
        ctx.fillRect(cx + 4, cy - 10, 12, 10);
        px(ctx, cx + 2, cy - 1, 16, 2, '#5adb6a');
        px(ctx, cx + 4, cy - 1, 4, 1, '#8af09a');
        px(ctx, cx, cy + 1, 20, 2, '#3a3a4a');
        px(ctx, cx, cy + 3, 20, 7, '#1e1e26');
        px(ctx, cx + 1, cy + 10, 18, 2, '#1e1e26');
        px(ctx, cx + 3, cy + 12, 14, 1, '#1e1e26');
        px(ctx, cx + 3, cy + 4, 1, 5, '#3e3e4e');
        px(ctx, cx + 3, cy + 13, 2, 2, '#1e1e26'); px(ctx, cx + 15, cy + 13, 2, 2, '#1e1e26');
        const f = Math.floor(t * 8) % 2;
        px(ctx, cx + 7 + f, cy + 13, 2, 2, '#ff9a3c'); px(ctx, cx + 11 - f, cy + 13, 2, 2, '#ffd46b');
        for (let i = 0; i < 3; i++) {
          const k = (t * 0.7 + i / 3) % 1;
          ctx.globalAlpha = 1 - k;
          px(ctx, cx + 5 + i * 4 + Math.round(Math.sin(t * 4 + i)), cy - 2 - Math.round(k * 10), 2, 2, '#8af09a');
          ctx.globalAlpha = 1;
        }
      },
    },
    candles: {
      layer: 'back', box: [57, 50, 13, 15],
      draw() { EXTRA_CANDLES.forEach(drawCandle); },
    },
    crystal: {
      layer: 'front', box: [55, 68, 12, 13],
      draw() {
        if (duo()) { ctx.save(); ctx.translate(-16, -9); }
        px(ctx, 57, 78, 8, 2, '#8a6a3a'); px(ctx, 58, 77, 6, 1, '#c9a24a');
        for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
          const dx = x - 3, dy = y - 3;
          if (dx * dx + dy * dy > 10) continue;
          const swirl = Math.sin(t * 2 + x * 0.9 + y * 0.6) > 0.3;
          px(ctx, 58 + x, 70 + y, 1, 1, swirl ? '#c7b5ff' : '#5a8ac8');
        }
        px(ctx, 59, 71, 1, 1, '#ffffff');
        if (duo()) ctx.restore();
      },
    },
    plant: {
      layer: 'front', box: [116, 63, 12, 18],
      draw() {
        if (duo()) { ctx.save(); ctx.translate(2, 0); }
        px(ctx, 118, 75, 8, 1, '#b8653a'); px(ctx, 119, 76, 6, 4, '#a0522d'); px(ctx, 119, 76, 1, 4, '#c0754a');
        const s = Math.round(Math.sin(t * 1.2));
        const leaf = '#4aa05a', dark = '#2f7a40';
        px(ctx, 121, 69, 2, 6, dark);
        px(ctx, 117 + s, 70, 4, 2, leaf); px(ctx, 116 + s, 69, 2, 1, leaf);
        px(ctx, 123 - s, 68, 4, 2, leaf); px(ctx, 126 - s, 67, 2, 1, leaf);
        px(ctx, 120 + s, 65, 3, 3, leaf); px(ctx, 121 + s, 64, 1, 1, '#f0a0c0');
        if (duo()) ctx.restore();
      },
    },
    cat: {
      layer: 'front', box: [105, 97, 14, 12],
      draw() {
        const blink = (t % 5) < 0.2;
        sprite(ctx, CAT, { K: '#221c2c', Y: '#f0d040', p: '#e08aa0' }, 106, 99, blink ? { 3: '.KKKKK...' } : null);
        const s = Math.sin(t * 2) > 0;
        px(ctx, 113, 106, 2, 1, '#221c2c');
        px(ctx, 115, s ? 104 : 105, 1, 2, '#221c2c');
        px(ctx, 116, s ? 103 : 105, 1, 1, '#221c2c');
      },
    },

    // Kış Şenliği ödülü: pencere pervazında atkılı kardan adam (atkı bina renginde)
    snowman: {
      layer: 'back', box: [12, 46, 15, 18],
      draw() {
        const cx = 19, sc = HOUSES[look.house];
        for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 10) px(ctx, cx + x, 59 + y, 1, 1, x + y > 2 ? '#c8d8ec' : '#f4f8ff');
        for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y <= 5) px(ctx, cx + x, 53 + y, 1, 1, x + y > 1 ? '#c8d8ec' : '#f4f8ff');
        px(ctx, cx - 1, 52, 1, 1, '#1c1c2a'); px(ctx, cx + 1, 52, 1, 1, '#1c1c2a');
        px(ctx, cx, 53, 2, 1, '#f08a3a');
        px(ctx, cx - 3, 50, 7, 1, '#1c1c2a'); px(ctx, cx - 2, 47, 5, 3, '#1c1c2a'); px(ctx, cx - 2, 49, 5, 1, sc.a);
        px(ctx, cx - 2, 55, 5, 1, sc.a); px(ctx, cx + 1, 56, 2, 3, sc.a); px(ctx, cx + 1, 58, 2, 1, sc.b);
        px(ctx, cx, 58, 1, 1, '#1c1c2a'); px(ctx, cx, 60, 1, 1, '#1c1c2a');
        px(ctx, cx - 4, 56, 1, 1, '#6b4a2f'); px(ctx, cx - 5, 55, 1, 1, '#6b4a2f'); // dal kollar
        px(ctx, cx + 4, 57, 1, 1, '#6b4a2f'); px(ctx, cx + 5, 56, 1, 1, '#6b4a2f');
      },
    },

    // --- 2. paket: arka katman (tanım sırası = çizim sırası) ---
    shooting: {
      layer: 'back', iconBg: true, box: [10, 10, 38, 38],
      draw() {
        const P = 4.5, n = Math.floor(t / P);
        const ph = iconMode ? 0.45 : (t % P) / 0.9;
        if (ph > 1) return;
        const { x: wx, y: wy, w: ww, h: wh } = WIN;
        const sx = wx + 14 + Math.floor(hash(n, 77) * 16), sy = wy + 3 + Math.floor(hash(n, 78) * 8);
        for (let i = 0; i < 5; i++) {
          const x = Math.round(sx - ph * 12 + i * 1.5), y = Math.round(sy + ph * 8 - i);
          if (!inArch(x, y, wx, wy, ww, wh) || x === 28 || x === 29 || y === 42 || y === 43) continue;
          ctx.globalAlpha = 1 - i * 0.18;
          px(ctx, x, y, 1, 1, i === 0 ? '#ffffff' : '#bcd0ff');
        }
        ctx.globalAlpha = 1;
      },
    },
    clock: {
      layer: 'back', box: [94, 13, 17, 45],
      draw() {
        const wood = '#5a3a24', Y = 20, cx = 102, cy = Y + 7;
        px(ctx, 101, Y - 6, 3, 1, wood); px(ctx, 99, Y - 5, 7, 2, wood); px(ctx, 97, Y - 3, 11, 3, wood);
        px(ctx, 96, Y, 13, 36, wood);
        px(ctx, 96, Y, 1, 36, '#6a452b'); px(ctx, 95, Y + 36, 15, 2, '#6a452b');
        for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
          const d = dx * dx + dy * dy;
          if (d <= 26) px(ctx, cx + dx, cy + dy, 1, 1, d <= 17 ? '#efe6cf' : '#c9a24a');
        }
        const now = new Date();
        const hand = (a, len) => {
          for (let r = 1; r <= len; r++) px(ctx, Math.round(cx + Math.sin(a) * r), Math.round(cy - Math.cos(a) * r), 1, 1, '#1c1c2a');
        };
        hand((now.getMinutes() / 60) * Math.PI * 2, 4);
        hand(((now.getHours() % 12) + now.getMinutes() / 60) / 12 * Math.PI * 2, 2);
        px(ctx, cx, cy, 1, 1, '#8a2a2a');
        px(ctx, 99, Y + 15, 7, 18, '#24170e');
        const a = Math.sin(t * 2.5) * 0.25;
        for (let r = 0; r < 12; r++) px(ctx, Math.round(cx + Math.sin(a) * r), Y + 15 + Math.round(Math.cos(a) * r), 1, 1, '#c9a24a');
        px(ctx, Math.round(cx + Math.sin(a) * 12) - 1, Y + 26, 3, 3, '#e3b23c');
      },
    },
    chest: {
      layer: 'back', box: [129, 88, 20, 20],
      draw() {
        const x = 131, y = 95;
        ctx.fillStyle = 'rgba(255,210,100,0.12)';
        ctx.fillRect(x + 1, y - 6, 14, 7);
        px(ctx, x - 1, y + 12, 18, 1, 'rgba(0,0,0,0.3)');
        px(ctx, x + 1, y - 3, 14, 3, '#8a5a30'); px(ctx, x + 1, y - 3, 14, 1, '#a06c40');
        px(ctx, x + 1, y, 14, 2, '#ffd46b');
        px(ctx, x + 3, y, 2, 1, '#e3b23c'); px(ctx, x + 9, y, 3, 1, '#e3b23c');
        px(ctx, x, y + 2, 16, 10, '#7a4a26'); px(ctx, x, y + 2, 16, 1, '#9a6a3a');
        px(ctx, x, y + 5, 16, 1, '#c9a24a');
        px(ctx, x + 3, y + 2, 1, 10, '#c9a24a'); px(ctx, x + 12, y + 2, 1, 10, '#c9a24a');
        px(ctx, x + 7, y + 4, 2, 3, '#e3b23c'); px(ctx, x + 7, y + 6, 2, 1, '#5a3a24');
        if (Math.sin(t * 4) > 0.4 || iconMode) px(ctx, x + 4 + (Math.floor(t * 2) % 8), y - 5, 1, 1, '#fff2b0');
      },
    },
    dragon: {
      layer: 'back', box: [126, 10, 15, 16],
      draw() {
        const x = 128, y = 14;
        const sleeping = state === 'focus' || (t % 4.5) < 0.2;
        sprite(ctx, DRAGON, { Y: '#e8d070', G: '#4aa070', L: '#c8e0a0', w: '#2f7a50', E: '#1a1420', W: '#ffffff', N: '#2f6040' },
          x, y, sleeping ? DRAGON_SLEEP : null);
        const k = (t * 0.45) % 1;
        if (k < 0.8) {
          ctx.globalAlpha = 0.6 * (1 - k / 0.8);
          px(ctx, Math.round(x + 4 - k * 4), Math.round(y + 5 - k * 12), 2, 2, '#c8c8d8');
          ctx.globalAlpha = 1;
        }
      },
    },
    ghost: {
      layer: 'back', box: [0, 0, 13, 14],
      draw() {
        const x = iconMode ? 2 : Math.round(80 + 58 * Math.sin(t * 0.13));
        const y = iconMode ? 2 : Math.round(30 + 3 * Math.sin(t * 1.3));
        const right = Math.cos(t * 0.13) >= 0;
        const eyes = right ? 'GGGEGGGEG' : 'GEGGGEGGG';
        ctx.globalAlpha = 0.85;
        sprite(ctx, GHOST, { G: '#eef0ff', E: '#2a2440', B: '#f8c0d0', o: '#2a2440' }, x, y,
          { 3: eyes, 4: eyes, 9: Math.floor(t * 3) % 2 ? 'G.GG.GG.G' : '.GG.GG.GG' });
        ctx.globalAlpha = 1;
      },
    },

    // --- 2. paket: ön katman ---
    wand: {
      layer: 'front', box: [64, 68, 13, 13],
      draw() {
        ctx.save(); ctx.translate(meX() - 67, 0);
        px(ctx, 73, 77, 1, 1, '#5a3a24'); px(ctx, 72, 76, 1, 1, '#5a3a24'); px(ctx, 71, 75, 1, 1, '#5a3a24');
        px(ctx, 70, 74, 1, 1, '#7a5636'); px(ctx, 69, 73, 1, 1, '#f3ead2');
        if (state === 'focus' || iconMode || Math.sin(t * 2) >= 0.7) {
          const far = Math.sin(t * 5) > 0;
          const c = far ? '#ffe9a0' : '#c7b5ff', d = far ? 2 : 1;
          px(ctx, 69, 73 - d, 1, 1, c); px(ctx, 69 - d, 73, 1, 1, c);
          px(ctx, 69 + d, 73, 1, 1, c); px(ctx, 69, 73 + d, 1, 1, c);
        }
        ctx.restore();
      },
    },
    fireflies: {
      layer: 'front', box: [0, 0, 16, 16],
      draw() {
        const fixed = [[4, 4], [11, 8], [5, 12]];
        for (let i = 0; i < (iconMode ? 3 : 6); i++) {
          const x = Math.round(iconMode ? fixed[i][0] : 80 + 70 * Math.sin(t * 0.21 * (1 + i * 0.17) + i * 2.1));
          const y = Math.round(iconMode ? fixed[i][1] : 50 + 35 * Math.sin(t * 0.27 * (1 + i * 0.11) + i * 1.3));
          const glow = iconMode ? 1 : (Math.sin(t * 2 + i * 1.7) + 1) / 2;
          if (glow < 0.15) continue;
          ctx.globalAlpha = glow * 0.35; px(ctx, x - 1, y - 1, 3, 3, '#d8ff8a');
          ctx.globalAlpha = glow; px(ctx, x, y, 1, 1, '#f4ffc0');
        }
        ctx.globalAlpha = 1;
      },
    },
    book: {
      layer: 'front', box: [0, 0, 13, 11],
      draw() {
        const x = iconMode ? 2 : Math.round(76 + 48 * Math.cos(t * 0.35));
        const y = iconMode ? 3 : Math.round(34 + 12 * Math.sin(t * 0.7));
        const f = iconMode ? 0 : [0, 1, 2, 1][Math.floor(t * 6) % 4];
        sprite(ctx, BOOK[f], { C: '#8a2a2a', W: '#efe3b8' }, x, y);
      },
    },
  };

  function drawItems(layer) {
    for (const id in ITEMS) if (ITEMS[id].layer === layer && items.includes(id)) ITEMS[id].draw();
  }

  let iconMode = false; // dükkan ikonu çizilirken hareketli eşyalar sabit durur
  function icon(id) {
    const it = ITEMS[id];
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const saved = ctx;
    ctx = c.getContext('2d');
    iconMode = true;
    if (it.iconBg) ctx.drawImage(bg, 0, 0);
    if (it.withChar) drawCharacter([id]); else it.draw();
    iconMode = false;
    ctx = saved;
    const [x, y, w, h] = it.box;
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    out.getContext('2d').drawImage(c, x, y, w, h, 0, 0, w, h);
    return out.toDataURL();
  }

  function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.max(0, Math.floor(v * 0.8)).toString(16).padStart(2, '0');
    return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255);
  }

  function drawDesk() {
    px(ctx, 30, 102, 100, 3, 'rgba(0,0,0,0.3)');
    px(ctx, 32, 80, 96, 3, '#8a5a34');
    px(ctx, 32, 80, 96, 1, '#a06c40');
    px(ctx, 34, 83, 92, 16, '#5e3b22');
    px(ctx, 38, 86, 40, 10, '#53331d');
    px(ctx, 82, 86, 40, 10, '#53331d');
    px(ctx, 57, 90, 2, 2, '#c9a24a');
    px(ctx, 101, 90, 2, 2, '#c9a24a');
    px(ctx, 34, 99, 4, 5, '#4a2e1a');
    px(ctx, 122, 99, 4, 5, '#4a2e1a');
  }

  function drawDeskItems() {
    const d = duo();
    // Kitap yığını (ikili düzende masanın sol ucuna)
    const bx = d ? -7 : 0;
    px(ctx, 40 + bx, 77, 16, 3, '#7a2a2a'); px(ctx, 55 + bx, 77, 1, 3, '#e8dcb0');
    px(ctx, 42 + bx, 74, 13, 3, '#2a4a7a'); px(ctx, 54 + bx, 74, 1, 3, '#e8dcb0');
    px(ctx, 41 + bx, 71, 14, 3, '#2a6a4a'); px(ctx, 54 + bx, 71, 1, 3, '#e8dcb0');
    px(ctx, 41 + bx, 72, 14, 1, '#c9a24a');

    // Mürekkep hokkası (tek kişilik düzende)
    if (!d) {
      px(ctx, 102, 76, 5, 4, '#1c1c2a'); px(ctx, 103, 75, 3, 1, '#1c1c2a');
      px(ctx, 103, 77, 1, 1, '#4a4a6a');
    }

    // İksir şişesi (fokurdar)
    const po = d ? 3 : 0;
    px(ctx, 112 + po, 70, 2, 3, '#9aa8b8'); px(ctx, 112 + po, 69, 2, 1, '#a07040');
    if (brew) {
      // Demlenen iksir: şişe camı + dolum seviyesi
      const lvl = Math.max(1, Math.round(brew.level * 6));
      px(ctx, 110 + po, 73, 6, 7, '#3a3448'); px(ctx, 110 + po, 80 - lvl, 6, lvl, brew.color);
      px(ctx, 110 + po, 73, 6, 1, '#8a8aa0'); px(ctx, 111 + po, 74, 1, 4, 'rgba(255,255,255,0.35)');
      if (brew.done) {
        ctx.fillStyle = 'rgba(255,240,160,0.18)'; ctx.fillRect(106 + po, 66, 14, 16);
        if (Math.sin(t * 6) > 0) px(ctx, 108 + po + Math.floor(t * 4) % 10, 67 + Math.floor(t * 3) % 4, 1, 1, '#fff2b0');
      }
    } else {
      px(ctx, 110 + po, 73, 6, 7, '#5a2a8a'); px(ctx, 110 + po, 73, 6, 1, '#7a4aaa');
      px(ctx, 111 + po, 74, 1, 2, '#b08ae0');
    }
    const by = 79 - Math.floor((t * 3) % 6);
    px(ctx, 113 + po + (Math.floor(t * 3) % 2), by, 1, 1, brew ? '#ffffff' : '#d8c0ff');

    drawHands(meX(), look, true, 0);
    if (d) drawHands(FRIEND_X, friend.look, false, 1.7);
  }

  // Bir karakterin masadaki parşömeni, elleri, kalemi ve mola çayı
  function drawHands(ox, lk, isMe, ph) {
    const skin = SKIN[lk.skin];
    const sleeve = outfit(lk.outfit).sleeve || '#2f2945';
    const writing = state === 'focus';
    const dx = writing ? Math.round(Math.sin((t + ph) * 7) * 1.5) + 1 : 0;
    const dy = writing && Math.sin((t + ph) * 13) > 0.6 ? -1 : 0;
    px(ctx, ox + 5, 80, 19, 1, '#efe3b8');
    px(ctx, ox + 2, 77, 4, 3, sleeve); px(ctx, ox + 6, 78, 3, 2, skin);
    px(ctx, ox + 18 + dx, 78 + dy, 3, 2, skin); px(ctx, ox + 21 + dx, 77 + dy, 4, 3, sleeve);

    // Tüy kalem: yazarken elde, değilse hokkada
    const quill = '#f3ead2', qs = '#cfc4a8';
    if (writing) {
      const qx = ox + 19 + dx, qy = 78 + dy;
      px(ctx, qx, qy, 1, 1, '#1c1c2a');
      px(ctx, qx + 1, qy - 1, 1, 1, quill); px(ctx, qx + 1, qy - 2, 2, 1, quill);
      px(ctx, qx + 2, qy - 3, 2, 1, quill); px(ctx, qx + 3, qy - 4, 1, 1, qs); px(ctx, qx + 3, qy - 5, 1, 1, quill);
      if (isMe) {
        sparkTimer += 1 / 15;
        if (sparkTimer > 0.35) {
          sparkTimer = 0;
          const cols = ['#ffe9a0', '#c7b5ff', '#a0e8ff'];
          particles.push({ x: qx + 3, y: qy - 5, vx: (Math.random() - 0.5) * 4, vy: -5 - Math.random() * 4, life: 1.4, c: cols[Math.floor(Math.random() * 3)] });
        }
      }
    } else if (!duo()) {
      px(ctx, 105, 74, 1, 1, quill); px(ctx, 106, 73, 1, 1, quill); px(ctx, 106, 72, 1, 1, qs);
      px(ctx, 107, 71, 1, 1, quill); px(ctx, 107, 70, 1, 1, quill);
    }

    // Mola: buharı tüten çay (ikili düzende iki fincan ortada yan yana)
    if (state === 'break') {
      const cx = !duo() ? ox + 28 : isMe ? ox + 26 : ox - 3;
      const hx = !duo() || isMe ? cx + 5 : cx - 1;
      px(ctx, cx, 76, 5, 4, '#e8e8f0'); px(ctx, cx, 76, 5, 1, '#8a5a34');
      px(ctx, hx, 77, 1, 2, '#e8e8f0');
      for (let i = 0; i < 3; i++) {
        const sy = 74 - ((t * 4 + i * 2 + ph) % 6);
        const sx = cx + 1 + i + Math.round(Math.sin(t * 3 + i + ph) * 1);
        px(ctx, sx, sy, 1, 1, 'rgba(255,255,255,0.5)');
      }
    }
  }

  function drawOwl() {
    const blink = (t % 4.2) < 0.18;
    sprite(ctx, OWL, OWL_PAL, 118, 17, blink ? OWL_BLINK : null);
  }

  function drawZzz(ox = meX(), ph = 0) {
    if (state !== 'break') return;
    for (let i = 0; i < 2; i++) {
      const k = (t * 0.6 + i * 0.5 + ph) % 1;
      const x = Math.round(ox + 27 + k * 6), y = Math.round(52 - k * 14);
      ctx.globalAlpha = 1 - k;
      px(ctx, x, y, 4, 1, '#d8d0ff'); px(ctx, x + 2, y + 1, 1, 1, '#d8d0ff');
      px(ctx, x + 1, y + 2, 1, 1, '#d8d0ff'); px(ctx, x, y + 3, 4, 1, '#d8d0ff');
      ctx.globalAlpha = 1;
    }
  }

  function drawParticles(dt) {
    particles = particles.filter(p => (p.life -= dt) > 0);
    for (const p of particles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.globalAlpha = Math.min(1, p.life);
      px(ctx, Math.round(p.x), Math.round(p.y), 1, 1, p.c);
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now; acc += dt;
    if (acc >= 1 / 15) {
      t += acc;
      ctx.drawImage(bg, 0, 0);
      drawStars();
      if (skyKey.endsWith('winter')) drawSnow();
      CANDLES.forEach(drawCandle);
      drawItems('back');
      drawOwl();
      drawCharacter();
      if (duo()) drawCharacter(friend.items, friend.look.outfit, FRIEND_X, friend.look, 1.7);
      drawDesk();
      drawDeskItems();
      drawItems('front');
      if (!iconMode) drawPet(ctx, 15, 117, pet, t);
      drawParticles(acc);
      drawZzz();
      if (duo()) drawZzz(FRIEND_X, 0.3);
      acc = 0;
    }
    requestAnimationFrame(frame);
  }

  return {
    HOUSES, HAIR, SKIN, OUTFITS, outfitIcon,
    init(canvas, initialLook) {
      ctx = canvas.getContext('2d');
      bg = document.createElement('canvas');
      bg.width = W; bg.height = H;
      if (initialLook) look = { ...look, ...initialLook };
      buildBg();
      requestAnimationFrame(frame);
      // Saat ilerledikçe pencere gökyüzü değişsin
      setInterval(() => { if (skyPhase() + season() !== skyKey) buildBg(); }, 60000);
    },
    skyPhase, season,
    setLook(l) { look = { ...look, ...l }; buildBg(); },
    setItems(list) { items = list; },
    setTheme(id) { if (THEMES[id] && id !== theme) { theme = id; buildBg(); } },
    // Dükkan ikonu: temanın duvarından ve zemininden küçük bir kesit
    themeIcon(id) {
      const saved = theme, full = document.createElement('canvas');
      full.width = W; full.height = H;
      theme = id; buildBg(full.getContext('2d')); theme = saved;
      const out = document.createElement('canvas');
      out.width = 24; out.height = 50;
      out.getContext('2d').drawImage(full, 89, 52, 24, 50, 0, 0, 24, 50);
      return out.toDataURL();
    },
    setBrew(b) { brew = b; },
    setPet(p) { pet = p; },
    setChart(v) { if (v !== chart) { chart = v; buildBg(); } }, // 5. sınıf ödülü: duvarda yıldız haritası
    drawPet,
    // Arkadaşın görünüşü ağdan geldiği için burada doğrulanır; null = tek kişilik düzen
    setFriend(f) {
      if (!f) { friend = null; return; }
      const l = f.look || {};
      friend = {
        look: {
          house: HOUSES[l.house] ? l.house : 'kizil',
          hair: HAIR[l.hair] ? l.hair : 'kahve',
          skin: SKIN[l.skin] ? l.skin : 1,
          outfit: OUTFITS[l.outfit] ? l.outfit : 'klasik',
          hairStyle: l.hairStyle === 'kisa' ? 'kisa' : 'uzun',
        },
        items: (Array.isArray(f.items) ? f.items : []).filter(id => id === 'glasses' || id === 'starhat'),
      };
    },
    FRIEND_HEAD: { x: (FRIEND_X + 13) / W, y: 44 / H }, // isim etiketi için oran
    icon,
    setState(s) { if (s !== state) { state = s; if (s !== 'focus') particles = []; } },
  };
})();
