// Asa Arenası: mola düellosu (1. aşama: 3 bota karşı antrenman).
// Bahçedeki taş kemerden girilen küçük orman açıklığı. Dört büyücü köşelerden başlar, sandıklardan asa ve eşya toplar;
// bir süre sonra büyülü sis daralır. Bayılan maçtan çıkar, son ayakta kalan kazanır.
// Kale tuvalini ve çizim yardımcılarını (Castle.art) kullanır; maç sürerken kale güncellenmez (map.js frame).
const Arena = (() => {
  const T = 16, VW = 213, VH = 160, W = 22, H = 15;
  const SPEED = 58, MAXHP = 3, COUNT = 3, FOG_START = 50, FOG_END = 150, MATCH = 180;
  // Her asanın tek büyüsü; asasız büyücü zayıf bir kıvılcık atar
  const SPELLS = {
    none: { name: 'Asasız (kıvılcık)', dmg: 1, speed: 95, cd: 1.3, range: 70, r: 2, col: ['#fff3c0', '#d8a84a'] },
    spark: { name: 'Kıvılcım Asası', dmg: 1, speed: 165, cd: 0.45, range: 125, r: 2, col: ['#fff0a0', '#f07a3a'] },
    ice: { name: 'Buz Asası', dmg: 1, speed: 115, cd: 0.9, range: 115, r: 3, slow: 2, col: ['#f0faff', '#5aa8e0'] },
    wind: { name: 'Rüzgâr Asası', dmg: 0, speed: 125, cd: 0.85, range: 95, r: 6, push: 230, col: ['#f4faf4', '#9cc4b0'] },
    shadow: { name: 'Gölge Asası', dmg: 1, speed: 135, cd: 0.75, range: 110, r: 3, col: ['#d8c4fa', '#5a3e8a'] },
  };
  const WANDS = ['spark', 'ice', 'wind', 'shadow'];
  const ITEM_NAMES = { potion: 'Can iksiri', shield: 'Kalkan parşömeni', feather: 'Hız tüyü' };
  const BOT_NAMES = ['Tilda', 'Bram', 'Nyx'];

  // ---------- Harita: okulun ormandaki eski düello avlusu ----------
  // '#' orman  'R' rünlü dikili taş  'P' yıkık sütun  'B' ateş kazanı  'F' bina sancağı  ',' taş yol  '.' çimen
  // Ortada taş döşeli meydan ve büyük sandığın altında parlayan rün çemberi. Her köşe bir binanın; herkes kendi binasının köşesinden başlar.
  const grid = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? '#' : '.')));
  const fill = (x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid[y][x] = ch; };
  const put = (list, ch) => list.forEach(([x, y]) => (grid[y][x] = ch));
  fill(4, 7, 17, 7, ','); fill(10, 2, 11, 12, ',');
  put([[1, 1], [2, 1], [1, 2], [19, 1], [20, 1], [20, 2], [1, 12], [1, 13], [2, 13], [20, 12], [19, 13], [20, 13], [10, 1], [11, 13]], '#');
  put([[8, 5], [13, 5], [8, 9], [13, 9]], 'P');
  put([[5, 4], [16, 4], [5, 10], [16, 10]], 'R');
  put([[3, 7], [18, 7]], 'B');
  put([[3, 1], [18, 1], [3, 13], [18, 13]], 'F');
  const SPAWNS = [[2, 2, 'kizil'], [19, 2, 'zumrut'], [2, 12, 'safir'], [19, 12, 'kehribar']];
  const cornerHouse = (x, y) => SPAWNS.reduce((a, b) => (Math.hypot(b[0] - x, b[1] - y) < Math.hypot(a[0] - x, a[1] - y) ? b : a))[2];
  const PLAZA = { x: 11 * T, y: 7 * T + 8 }; // taş meydanın ve rün çemberinin ortası
  const tilesOf = ch => grid.flatMap((row, y) => row.flatMap((c, x) => (c === ch ? [[x, y]] : [])));
  const BRAZIERS = tilesOf('B'), RUNESTONES = tilesOf('R');
  const RUNE = [[7, 0], [8, 0], [7, 1], [7, 2], [8, 2], [7, 3], [6, 4], [8, 4]]; // dikili taştaki oyma rün (karoya göre)
  const CHEST_AT = [[6, 2], [15, 2], [6, 12], [15, 12], [10, 4], [11, 10]];
  const FOGC = { x: W * T / 2, y: H * T / 2 + 4 };

  let art = null, bg = null, ctx = null, opts = null, on = false;
  let now = 0, phase = 'count', overAt = 0, shown = false;
  let wizards = [], me = null, shots = [], items = [], chests = [], parts = [], blockedTiles = new Set();
  const cam = { x: 0, y: 0 };
  const keys = new Set();
  const aim = { sx: 0, sy: 0, mouse: false, down: false };
  let hudEl = null, msgEl = null, hudText = '';

  const tileSolid = (tx, ty) => tx < 0 || ty < 0 || tx >= W || ty >= H || '#RPBF'.includes(grid[ty][tx]);
  const inChest = (x, y) => chests.some(c => x >= c.x - c.w && x < c.x + c.w && y >= c.y - 6 && y < c.y + 4);
  const solidAt = (x, y) => tileSolid(Math.floor(x / T), Math.floor(y / T)) || inChest(x, y);
  const blockedFeet = (x, y) => solidAt(x - 4, y - 2) || solidAt(x + 3, y - 2) || solidAt(x - 4, y + 1) || solidAt(x + 3, y + 1);
  const tileOf = o => [Math.floor(o.x / T), Math.floor(o.y / T)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const playT = () => Math.max(0, now - COUNT);
  function fogR() {
    const c = playT();
    if (c < FOG_START) return 999;
    if (c < FOG_END) return 220 - 190 * (c - FOG_START) / (FOG_END - FOG_START);
    return Math.max(0, 30 * (1 - (c - FOG_END) / (MATCH - FOG_END)));
  }
  const facing = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  const dirVec = d => ({ left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[d]);

  // ---------- Başlat / bitir ----------
  function start(o) {
    opts = o; ctx = o.ctx; art = Castle.art;
    if (!bg) bg = bake();
    hudEl = document.getElementById('arenaHud'); msgEl = document.getElementById('arenaMsg');
    chests = CHEST_AT.map(([x, y]) => ({ x: x * T + 8, y: y * T + 10, w: 6, loot: [] }));
    chests.push({ x: 11 * T, y: 7 * T + 10, w: 8, big: true, loot: [] }); // ortadaki büyük sandık
    const pool = shuffle([...WANDS]);
    chests[6].loot = [pool.pop(), 'potion'];
    shuffle([...pool, 'potion', 'shield', 'feather']).forEach((k, i) => (chests[i].loot = [k]));
    blockedTiles = new Set();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (tileSolid(x, y) || inChest(x * T + 8, y * T + 8)) blockedTiles.add(y * W + x);
    const hairs = Object.keys(Scene.HAIR), mine = SPAWNS.find(c => c[2] === o.look.house) || SPAWNS[0], rest = SPAWNS.filter(c => c !== mine);
    me = mk({ ...o.look }, 'Sen', false, mine);
    wizards = [me, ...BOT_NAMES.map((n, i) => mk({ house: rest[i][2], hair: hairs[Math.floor(Math.random() * hairs.length)],
      skin: Math.floor(Math.random() * 4), outfit: 'klasik', hairStyle: Math.random() < 0.5 ? 'kisa' : 'uzun' }, n, true, rest[i]))];
    shots = []; items = []; parts = [];
    now = 0; phase = 'count'; shown = false; on = true; hudText = '';
    keys.clear(); aim.down = false;
    hudEl.hidden = false; msgEl.hidden = false;
  }
  function mk(look, name, bot, [tx, ty]) {
    return { look, name, bot, x: tx * T + 8, y: ty * T + 12, dir: ty < 7 ? 'down' : 'up', hp: MAXHP, alive: true, wand: null,
      cd: 0, dashCd: 0, dashT: 0, dvx: 0, dvy: 0, kx: 0, ky: 0, mx: 0, my: 0, inv: 0, slowUntil: 0, fastUntil: 0, shieldUntil: 0,
      scroll: false, fogT: 0, open: null, place: 0, faceT: 0, moving: false, think: Math.random() * 0.3, path: [], goal: null,
      strafe: 1, strafeT: 0, react: 0.5 };
  }
  function finish(place, why) {
    on = false; keys.clear(); aim.down = false;
    hudEl.hidden = true; msgEl.hidden = true; msgEl.innerHTML = '';
    opts.done(place, why);
  }

  // ---------- Kare ----------
  function frame(dt) {
    if (phase !== 'over' && opts.focusing()) return finish(null, 'focus');
    now += dt;
    if (phase === 'count' && now >= COUNT) phase = 'play';
    update(dt);
    draw();
    hud();
  }

  function update(dt) {
    for (const w of wizards) {
      w.cd -= dt; w.dashCd -= dt; w.inv -= dt; w.faceT -= dt;
      if (!w.alive) continue;
      w.mx = w.my = 0;
      if (phase === 'play') (w.bot ? botThink : playerInput)(w, dt);
      physics(w, dt);
      if (w.open) {
        if (w.mx || w.my || w.dashT > 0 || w.open.c.opened) w.open = null;
        else if ((w.open.t += dt) >= 0.8) openChest(w.open.c), (w.open = null);
      }
      if (fogR() < Math.hypot(w.x - FOGC.x, w.y - FOGC.y)) {
        if ((w.fogT += dt) >= 1.5) { w.fogT = 0; w.inv = 0; hurt(w, 1); }
      } else w.fogT = Math.max(0, w.fogT - dt);
      if (w.alive) pickup(w);
    }
    updateShots(dt);
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    parts = parts.filter(p => p.life > 0);
    const live = wizards.filter(w => w.alive);
    if (phase === 'play' && live.length <= 1) {
      phase = 'over'; overAt = now;
      if (live[0]) live[0].place = 1;
    }
    if (phase === 'over' && !shown && now - overAt > 1.3) showResults();
  }

  function physics(w, dt) {
    const len = Math.hypot(w.mx, w.my);
    if (len > 1) { w.mx /= len; w.my /= len; }
    const sp = SPEED * (now < w.slowUntil ? 0.5 : 1) * (now < w.fastUntil ? 1.5 : 1);
    let dx = w.mx * sp * dt, dy = w.my * sp * dt;
    if (w.dashT > 0) { w.dashT -= dt; dx = w.dvx * 210 * dt; dy = w.dvy * 210 * dt; }
    dx += w.kx * dt; dy += w.ky * dt;
    const f = Math.exp(-7 * dt); w.kx *= f; w.ky *= f;
    if (!blockedFeet(w.x + dx, w.y)) w.x += dx; else w.kx = 0;
    if (!blockedFeet(w.x, w.y + dy)) w.y += dy; else w.ky = 0;
    w.moving = len > 0.1 || w.dashT > 0;
    if (w.moving && w.faceT <= 0) w.dir = facing(w.mx || w.dvx, w.my || w.dvy);
  }

  // ---------- Büyü, atılım, hasar ----------
  function cast(w, gx, gy) {
    if (w.cd > 0 || !w.alive || phase !== 'play') return;
    const s = SPELLS[w.wand || 'none'];
    let dx = gx - w.x, dy = gy - w.y;
    const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    shots.push({ x: w.x + dx * 6, y: w.y + dy * 6, vx: dx * s.speed, vy: dy * s.speed, left: s.range, s, owner: w, hit: new Set() });
    w.cd = s.cd; w.faceT = 0.3; w.dir = facing(dx, dy);
    burst(w.x + dx * 7, w.y - 7 + dy * 7, s.col[0], 3, 30);
  }
  function dash(w, dx, dy) {
    if (w.dashCd > 0 || phase !== 'play' || !w.alive) return;
    if (!dx && !dy) [dx, dy] = dirVec(w.dir);
    const L = Math.hypot(dx, dy); dx /= L; dy /= L;
    w.open = null;
    if (w.wand === 'shadow') { // gölge: kısa ışınlanma ve 1 sn kalkan
      let k = 0;
      while (k < 44 && !blockedFeet(w.x + dx * (k + 2), w.y + dy * (k + 2))) k += 2;
      burst(w.x, w.y - 7, '#5a3e8a', 8, 40);
      w.x += dx * k; w.y += dy * k;
      burst(w.x, w.y - 7, '#d8c4fa', 8, 40);
      w.shieldUntil = now + 1; w.dashCd = 2;
    } else { w.dashT = 0.16; w.dvx = dx; w.dvy = dy; w.dashCd = 3; }
  }
  // Kalkan (gölge ışınlanması ya da parşömen) bir büyüyü tamamen engeller
  function shieldUp(w) {
    if (now < w.shieldUntil) return true;
    if (w.scroll) { w.scroll = false; return true; }
    return false;
  }
  function hurt(w, n) {
    if (!w.alive || w.inv > 0) return;
    w.hp -= n; w.inv = 0.6; w.open = null;
    burst(w.x, w.y - 8, '#ff6a6a', 6, 45);
    if (w.hp > 0) return;
    w.alive = false; w.deadAt = now;
    w.place = wizards.filter(q => q.alive).length + 1;
    if (w.wand) { items.push({ x: w.x, y: w.y, kind: w.wand, ready: now + 0.5 }); w.wand = null; }
    burst(w.x, w.y - 8, '#e8dcff', 14, 55);
  }
  function updateShots(dt) {
    for (const p of shots) {
      const v = Math.hypot(p.vx, p.vy);
      p.x += p.vx * dt; p.y += p.vy * dt; p.left -= v * dt;
      if (Math.random() < 0.5) parts.push({ x: p.x, y: p.y - 7, vx: 0, vy: -6, life: 0.2, col: p.s.col[1] });
      if (p.left <= 0 || solidAt(p.x, p.y)) { p.dead = true; burst(p.x, p.y - 7, p.s.col[1], 4, 30); continue; }
      for (const w of wizards) {
        if (!w.alive || w === p.owner || p.hit.has(w) || Math.hypot(w.x - p.x, w.y - p.y) > 6 + p.s.r) continue;
        p.hit.add(w);
        if (shieldUp(w)) { burst(p.x, p.y - 7, '#a8d8ff', 6, 40); p.dead = true; break; }
        if (p.s.push) { w.kx += p.vx / v * p.s.push; w.ky += p.vy / v * p.s.push; w.open = null; }
        if (p.s.slow) w.slowUntil = now + p.s.slow;
        if (p.s.dmg) hurt(w, p.s.dmg);
        if (!p.s.push) { p.dead = true; break; } // rüzgâr dalgası içinden geçer, yolundakilerin hepsini iter
      }
    }
    shots = shots.filter(p => !p.dead);
  }
  function burst(x, y, col, n, sp) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random() * 0.6);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.25 + Math.random() * 0.25, col });
    }
  }

  // ---------- Sandıklar ve yerdeki eşyalar ----------
  const chestNear = w => chests.find(c => !c.opened && Math.hypot(c.x - w.x, c.y - w.y) < 18);
  function openChest(c) {
    c.opened = true;
    c.loot.forEach((k, i) => items.push({ x: c.x + (c.loot.length > 1 ? (i ? 6 : -6) : 0), y: c.y + 12, kind: k, ready: now + 0.2 }));
    burst(c.x, c.y - 4, '#f0d070', 10, 40);
  }
  function pickup(w) {
    for (const it of items) {
      if (it.gone || now < it.ready || Math.hypot(it.x - w.x, it.y - w.y) > 9) continue;
      if (WANDS.includes(it.kind)) { if (w.wand) continue; w.wand = it.kind; }
      else if (it.kind === 'potion') { if (w.hp >= MAXHP) continue; w.hp++; }
      else if (it.kind === 'shield') { if (w.scroll) continue; w.scroll = true; }
      else w.fastUntil = now + 4;
      it.gone = true;
      if (w === me) toast(`+ ${SPELLS[it.kind]?.name || ITEM_NAMES[it.kind]}`);
    }
    items = items.filter(i => !i.gone);
  }
  const wandNear = w => items.find(it => WANDS.includes(it.kind) && now >= it.ready && Math.hypot(it.x - w.x, it.y - w.y) < 12);
  function swapWand(w) { // elindeki asayı bırak, yerdekini al
    const it = wandNear(w);
    if (!it || !w.wand) return false;
    items.push({ x: w.x, y: w.y, kind: w.wand, ready: now + 0.8 });
    w.wand = it.kind; it.gone = true; items = items.filter(i => !i.gone);
    if (w === me) toast(`+ ${SPELLS[w.wand].name}`);
    return true;
  }

  // ---------- Oyuncu ----------
  function playerInput(w) {
    if (keys.has('ArrowLeft') || keys.has('KeyA')) w.mx--;
    if (keys.has('ArrowRight') || keys.has('KeyD')) w.mx++;
    if (keys.has('ArrowUp') || keys.has('KeyW')) w.my--;
    if (keys.has('ArrowDown') || keys.has('KeyS')) w.my++;
    if ((aim.down || keys.has('KeyJ')) && w.cd <= 0) cast(w, ...aimPoint(w));
  }
  // Fareyle nişan; fare hiç kullanılmadıysa görüşteki en yakın rakibe, yoksa baktığın yöne
  function aimPoint(w) {
    if (aim.mouse) return [cam.x + aim.sx, cam.y + aim.sy + 7];
    let best = null, bd = 160;
    for (const q of wizards) {
      const d = Math.hypot(q.x - w.x, q.y - w.y);
      if (q !== w && q.alive && d < bd && los(w.x, w.y, q.x, q.y)) { bd = d; best = q; }
    }
    if (best) return [best.x, best.y];
    const [dx, dy] = dirVec(w.dir);
    return [w.x + dx * 50, w.y + dy * 50];
  }
  function onKey(e, down) {
    if (!on || e.target.closest?.('input, textarea, select, dialog[open] form')) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
    if (down) keys.add(e.code); else keys.delete(e.code);
    if (!down || e.repeat) return;
    if (shown && (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Escape')) return finish(me.place);
    if (e.code === 'Escape') {
      if (!me.alive) return finish(me.place); // bayıldıysan izlemeyi bırakıp çıkabilirsin
      if (confirm('Maçtan çıkılsın mı? Hakkın harcanmaz ama ödül de yok.')) finish(null, 'quit');
      return;
    }
    if (!me.alive || phase !== 'play') return;
    if (e.code === 'Space') dash(me, me.mx, me.my);
    if (e.code === 'KeyE' && !swapWand(me)) { const c = chestNear(me); if (c) me.open = { c, t: 0 }; }
  }
  function onPointer(e, kind) {
    if (!on) return;
    const r = e.currentTarget.getBoundingClientRect();
    aim.sx = (e.clientX - r.left) / r.width * VW; aim.sy = (e.clientY - r.top) / r.height * VH;
    if (e.pointerType === 'mouse') aim.mouse = true;
    if (kind === 'down') {
      if (shown) return finish(me.place);
      if (e.pointerType !== 'mouse') aim.mouse = true;
      else if (e.button !== 0) return;
      else aim.down = true; // basılı tutunca da atmaya devam eder
      cast(me, cam.x + aim.sx, cam.y + aim.sy + 7); // kısa tık iki kare arasında kaybolmasın
    }
    if (kind === 'up') aim.down = false;
  }

  // ---------- Botlar ----------
  function los(ax, ay, bx, by) {
    const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 4);
    for (let i = 1; i < n; i++) if (solidAt(ax + (bx - ax) * i / n, ay + (by - ay) * i / n)) return false;
    return true;
  }
  // Kendine doğru gelen ve yakında çarpacak büyü
  function incoming(p, w) {
    const rx = w.x - p.x, ry = w.y - p.y, v = Math.hypot(p.vx, p.vy), along = (rx * p.vx + ry * p.vy) / v;
    return along > 0 && along < 50 && Math.abs(rx * p.vy - ry * p.vx) / v < 9;
  }
  function bfs(sx, sy, tx, ty) {
    const goalR = blockedTiles.has(ty * W + tx) ? 1 : 0, prev = new Map([[sy * W + sx, -1]]), q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (Math.abs(x - tx) + Math.abs(y - ty) <= goalR) {
        const out = [];
        for (let k = y * W + x; k !== sy * W + sx; k = prev.get(k)) out.unshift([k % W, Math.floor(k / W)]);
        return out;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = ny * W + nx;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || blockedTiles.has(k) || prev.has(k)) continue;
        prev.set(k, y * W + x); q.push([nx, ny]);
      }
    }
    return [];
  }
  function botThink(w, dt) {
    w.think -= dt; w.strafeT -= dt;
    if (w.strafeT <= 0) { w.strafe = Math.random() < 0.5 ? -1 : 1; w.strafeT = 0.8 + Math.random() * 1.4; }
    let tgt = null, score = 1e9;
    for (const q of wizards) {
      if (q === w || !q.alive) continue;
      const sc = Math.hypot(q.x - w.x, q.y - w.y) - (los(w.x, w.y, q.x, q.y) ? 60 : 0);
      if (sc < score) { score = sc; tgt = q; }
    }
    const d = tgt ? Math.hypot(tgt.x - w.x, tgt.y - w.y) : 1e9, see = tgt && los(w.x, w.y, tgt.x, tgt.y), s = SPELLS[w.wand || 'none'];
    if (w.think <= 0) { // hedef seç: sis > asa/iksir/sandık > rakip
      w.think = 0.3;
      const near = list => list.reduce((a, b) => (Math.hypot(b.x - w.x, b.y - w.y) < Math.hypot(a.x - w.x, a.y - w.y) ? b : a), list[0]);
      const wantItems = items.filter(it => (!w.wand && WANDS.includes(it.kind)) || (it.kind === 'potion' && w.hp < MAXHP) || it.kind === 'feather' || (it.kind === 'shield' && !w.scroll));
      const closed = chests.filter(c => !c.opened);
      let goal = null;
      if (Math.hypot(w.x - FOGC.x, w.y - FOGC.y) > fogR() - 24) goal = FOGC;
      else if (wantItems.length && (!see || d > 60)) goal = near(wantItems);
      else if (!w.wand && closed.length && (!see || d > 50)) goal = near(closed);
      else if (tgt && !(see && d < s.range * 0.9)) goal = tgt;
      w.goal = goal;
      w.path = goal ? bfs(...tileOf(w), ...tileOf(goal)) : [];
      const threat = shots.find(p => p.owner !== w && incoming(p, w));
      if (threat && w.dashCd <= 0 && Math.random() < 0.45) { const v = Math.hypot(threat.vx, threat.vy); dash(w, -threat.vy / v * w.strafe, threat.vx / v * w.strafe); }
    }
    const c = chestNear(w);
    if (c && w.goal === c && !w.open) w.open = { c, t: 0 };
    if (w.open) { /* sandık açılırken bekler */ }
    else if (w.path.length) {
      const [nx, ny] = w.path[0], px = nx * T + 8, py = ny * T + 10;
      if (Math.hypot(px - w.x, py - w.y) < 4) w.path.shift();
      else { w.mx = px - w.x; w.my = py - w.y; }
    } else if (tgt && see) { // dövüş: menzilin ortasında kal, yana kay
      const ux = (tgt.x - w.x) / d, uy = (tgt.y - w.y) / d, want = s.range * 0.6;
      const k = d > want + 10 ? 1 : d < want - 15 ? -1 : 0;
      w.mx = ux * k - uy * w.strafe * 0.8; w.my = uy * k + ux * w.strafe * 0.8;
    }
    if (tgt && see && d < s.range * 0.95 && w.cd <= 0) {
      if ((w.react -= dt) <= 0) { // hedefin gideceği yere biraz önden ve biraz şaşarak
        const lead = d / s.speed * 0.7, nx = tgt.mx * SPEED * lead, ny = tgt.my * SPEED * lead, e = (Math.random() - 0.5) * 18;
        cast(w, tgt.x + nx + e, tgt.y + ny + e);
        w.react = 0.15 + Math.random() * 0.35;
      }
    } else w.react = Math.max(w.react, 0.3);
  }

  // ---------- Çizim ----------
  // Kalenin taş ve çimen renkleriyle aynı palet; en sonda kaledeki gibi renk yumuşatma
  function bake() {
    const c = document.createElement('canvas'); c.width = W * T; c.height = H * T;
    const g = c.getContext('2d'), { px, hash, canopy, OAK, FIR } = art, L = '#3a3444';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = x * T, Y = y * T;
      if (grid[y][x] === ',') { // kaledeki patika gibi kare taş döşeme
        px(g, X, Y, T, T, '#a39582');
        for (let k = 0; k < 4; k++) {
          const sx = (k % 2) * 8 + ((Math.floor(k / 2) + y) % 2) * 3, sy = Math.floor(k / 2) * 8;
          px(g, X + sx + 1, Y + sy + 1, 6, 6, hash(x + k, y) > 0.5 ? '#c2b199' : '#b8a78f'); px(g, X + sx + 1, Y + sy + 1, 6, 1, '#d2c3ab');
        }
        continue;
      }
      px(g, X, Y, T, T, '#6a9a5a');
      for (let k = 0; k < 8; k++) px(g, X + Math.floor(hash(x * 7 + k, y) * 15), Y + Math.floor(hash(y * 7 + k, x) * 14), 1, 2, k % 3 ? '#78a866' : '#5e8c50');
      const n = hash(Math.floor(x / 2) + 3, Math.floor(y / 2) + 9);
      if (n > 0.62) px(g, X, Y, T, T, 'rgba(150,190,110,0.14)'); else if (n < 0.25) px(g, X, Y, T, T, 'rgba(30,60,40,0.16)');
      for (let k = 0; k < 3; k++) { // ot demetleri
        const tx = X + 1 + Math.floor(hash(x * 11 + k, y) * 13), ty = Y + 2 + Math.floor(hash(y * 11 + k, x) * 12);
        px(g, tx, ty, 1, 2, '#5a8a4e'); px(g, tx + 1, ty - 1, 1, 3, '#4e7e46'); px(g, tx + 2, ty, 1, 2, '#5a8a4e');
      }
      const h = hash(x * 3 + 1, y * 5 + 2), ox = 3 + Math.floor(hash(y, x * 2) * 8), oy = 3 + Math.floor(hash(x, y * 3) * 8);
      if (h > 0.88) for (const [dx, dy] of [[0, 0], [2, 1], [1, 3], [4, 2]]) px(g, X + ox + dx, Y + oy + dy, 1, 2, '#9a62a8'); // funda
      else if (h > 0.83) { px(g, X + ox, Y + oy, 2, 2, '#6a7ad8'); px(g, X + ox + 4, Y + oy + 3, 2, 2, '#6a7ad8'); px(g, X + ox + 2, Y + oy + 5, 1, 2, '#3e6a3a'); } // çan çiçekleri
      else if (h > 0.79) { px(g, X + ox, Y + oy + 2, 2, 2, '#e8dcc0'); px(g, X + ox - 1, Y + oy, 4, 2, '#d84a4a'); px(g, X + ox, Y + oy, 1, 1, '#ffffff'); } // mantar
    }
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { // ormana yakın karolar gölgede
      if (grid[y][x] !== '#' && (grid[y - 1][x] === '#' || grid[y][x - 1] === '#' || grid[y][x + 1] === '#' || grid[y + 1][x] === '#')) px(g, x * T, y * T, T, T, 'rgba(20,40,30,0.18)');
    }
    // Taş meydan: kaledeki taş zemin renkleriyle kaydırmalı döşeme, yosunlu kenar taşları
    for (let yy = -46; yy <= 46; yy++) for (let xx = -62; xx <= 62; xx++) {
      const e = (xx / 60) ** 2 + (yy / 44) ** 2;
      if (e > 1.06) continue;
      const X = PLAZA.x + xx, Y = PLAZA.y + yy;
      if (e > 0.9) { px(g, X, Y, 1, 1, e > 1 ? L : hash(Math.floor(Math.atan2(yy, xx) * 9), 3) > 0.75 ? '#6e8a5a' : '#857d8e'); continue; }
      const row = Math.floor(Y / 6), sh = (row % 2) * 4, col = Math.floor((X + sh) / 8), lx = (X + sh) % 8, ly = Y % 6;
      const base = hash(col, row) > 0.5 ? '#9b9188' : '#8f857c';
      px(g, X, Y, 1, 1, lx === 0 || ly === 0 ? '#7a7068' : ly === 1 ? '#a89e94' : hash(col * 3, row * 5) > 0.9 && lx > 2 && ly > 2 ? '#6e8a5a' : base);
    }
    // Rün çemberi: iki altın halka ve aralarında on iki oyma rün
    for (let yy = -24; yy <= 24; yy++) for (let xx = -32; xx <= 32; xx++) {
      const o = Math.hypot(xx / 28, yy / 21), i = Math.hypot(xx / 21, yy / 15.5);
      if (Math.abs(o - 1) < 0.035 || Math.abs(i - 1) < 0.045) px(g, PLAZA.x + xx, PLAZA.y + yy, 1, 1, '#b8985a');
    }
    const GLYPHS = [[[0, 0], [1, 1], [2, 0], [1, 2]], [[0, 0], [0, 1], [0, 2], [1, 1], [2, 2]], [[1, 0], [0, 1], [2, 1], [1, 2]], [[0, 0], [2, 0], [1, 1], [1, 2]]];
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2, gx = Math.round(PLAZA.x + Math.cos(a) * 24.5) - 1, gy = Math.round(PLAZA.y + Math.sin(a) * 18.2) - 1;
      for (const [dx, dy] of GLYPHS[k % 4]) px(g, gx + dx, gy + dy, 1, 1, '#c9a24a');
    }
    // Eşyalar: alttaki satır üsttekinin önüne gelsin diye satır sırasıyla
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = x * T, Y = y * T, ch = grid[y][x];
      if (ch === '#') canopy(g, X, Y, [[8, 4, 6], [3, 7, 4], [13, 7, 4], [8, 0, 5]], hash(x, y) > 0.45 ? OAK : FIR, x * 7 + y * 13);
      else if (ch === 'R') { // rünlü dikili taş: üstü yuvarlatılmış, sol yanı ışık alır; rün dinamik parlar
        const inS = (dx, dy) => dx >= 4 && dx <= 11 && dy >= -4 && dy <= 13 && !(dy < -2 && (dx === 4 || dx === 11)) && !(dy < -3 && (dx === 5 || dx === 10));
        for (let dy = -5; dy <= 14; dy++) for (let dx = 3; dx <= 12; dx++) {
          if (inS(dx, dy)) px(g, X + dx, Y + dy, 1, 1, dx <= 5 ? '#b8b0bc' : dx >= 10 ? '#6e6678' : '#948c9c');
          else if (inS(dx - 1, dy) || inS(dx + 1, dy) || inS(dx, dy - 1) || inS(dx, dy + 1)) px(g, X + dx, Y + dy, 1, 1, L);
        }
        for (const [rx, ry] of RUNE) px(g, X + rx, Y + ry, 1, 1, '#4a4458');
        px(g, X + 4, Y + 10, 3, 4, '#5a7a4a'); px(g, X + 5, Y + 8, 1, 2, '#6e8e5a'); // yosun
        px(g, X + 2, Y + 13, 1, 2, '#5a8a4e'); px(g, X + 13, Y + 12, 1, 3, '#5a8a4e');
      } else if (ch === 'P') { // yıkık taş sütun ve sarmaşık (yukarı taşar)
        px(g, X + 1, Y + 10, 14, 6, L); px(g, X + 2, Y + 11, 12, 4, '#8a8290'); px(g, X + 2, Y + 11, 12, 1, '#aaa2ae');
        px(g, X + 3, Y - 9, 10, 20, L); px(g, X + 4, Y - 8, 8, 19, '#a49cab'); px(g, X + 4, Y - 8, 2, 19, '#c4bccb'); px(g, X + 10, Y - 8, 2, 19, '#857d8e');
        for (const fx of [6, 8]) px(g, X + fx, Y - 6, 1, 16, '#938b9b'); // yivler
        px(g, X + 4, Y - 9, 3, 2, L); px(g, X + 9, Y - 10, 3, 3, L); px(g, X + 10, Y - 9, 1, 2, '#a49cab'); // kırık tepe
        for (let k = 0; k < 7; k++) px(g, X + 5 + (k % 2) * 4 - (k % 3), Y + 8 - k * 2, 2, 1, k % 2 ? '#4e7e46' : '#6a9a5a'); // sarmaşık
      } else if (ch === 'B') { // taş ateş kazanı (alevi dinamik)
        px(g, X + 4, Y + 9, 1, 6, L); px(g, X + 11, Y + 9, 1, 6, L); px(g, X + 6, Y + 10, 4, 5, L); px(g, X + 7, Y + 10, 2, 4, '#6e6678');
        px(g, X + 2, Y + 4, 12, 7, L); px(g, X + 3, Y + 5, 10, 5, '#857d8e'); px(g, X + 3, Y + 5, 10, 1, '#a49cab'); px(g, X + 3, Y + 9, 10, 1, '#615a6b');
        px(g, X + 4, Y + 4, 8, 2, '#5a2a1a'); px(g, X + 5, Y + 4, 2, 1, '#c84a2a'); px(g, X + 9, Y + 4, 2, 1, '#e87a3a'); // korlar
        px(g, X + 6, Y + 7, 4, 1, '#c9a24a'); // altın kuşak
      } else if (ch === 'F') { // köşenin bina sancağı
        const hs = Scene.HOUSES[cornerHouse(x, y)];
        px(g, X + 7, Y - 15, 2, 30, L); px(g, X + 7, Y - 14, 1, 28, '#7a5a3e'); px(g, X + 6, Y - 17, 4, 3, '#e3b23c');
        px(g, X + 3, Y - 13, 10, 1, '#5a3e2a');
        px(g, X + 3, Y - 12, 10, 14, L); px(g, X + 4, Y - 12, 8, 13, hs.a); px(g, X + 4, Y - 12, 1, 13, hs.b); px(g, X + 11, Y - 12, 1, 13, hs.b);
        px(g, X + 6, Y - 8, 4, 4, hs.b); px(g, X + 7, Y - 7, 2, 2, hs.a);
        for (let k = 0; k < 3; k++) px(g, X + 4 + k, Y + 1 + k, 8 - k * 2, 1, hs.a); // sivri uç
        px(g, X + 5, Y + 13, 6, 2, '#615a6b'); // ayak taşı
      }
    }
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
    for (let k = 0; k < d.length; k += 4) {
      const r = d[k], gg = d[k + 1], b = d[k + 2], Lm = 0.3 * r + 0.59 * gg + 0.11 * b;
      const keep = 1 - 0.06 - 0.3 * (Math.max(r, gg, b) - Math.min(r, gg, b)) / 255;
      d[k] = Lm + (r - Lm) * keep; d[k + 1] = Lm + (gg - Lm) * keep; d[k + 2] = Lm + (b - Lm) * keep;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // Kaledeki gibi günün saatine göre hafif karanlık; ateş kazanları, rünler ve ateşböcekleri ışık verir
  const AMBIENT = { night: 'rgba(30,22,58,0.36)', dusk: 'rgba(52,26,50,0.26)', day: 'rgba(30,22,58,0.08)' };
  let vignette = null;
  function glow(x, y, r, col, a) {
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function drawMagic() { // bg'nin hemen üstüne: kazan alevleri ve rün parıltısı
    for (const [x, y] of BRAZIERS) {
      const X = x * T - cam.x, Y = y * T - cam.y;
      if (X < -T || X > VW || Y < -2 * T || Y > VH) continue;
      for (let k = 0; k < 7; k++) {
        const h = 3 + Math.round(3 * Math.abs(Math.sin(now * 7 + k * 1.7))), fx = X + 4 + k;
        P(fx, Y + 4 - h, 1, h, k % 3 === 1 ? '#ffe08a' : '#f08a3a');
        if (k % 2) P(fx, Y + 4 - h - 1, 1, 1, '#ffd060');
      }
      if (Math.random() < 0.15) parts.push({ x: x * T + 5 + Math.random() * 6, y: y * T - 2, vx: (Math.random() - 0.5) * 6, vy: -18, life: 0.6, col: '#ffb060' }); // kıvılcım
    }
    const pulse = 0.55 + 0.45 * Math.sin(now * 2);
    ctx.globalAlpha = pulse;
    for (const [x, y] of RUNESTONES) for (const [rx, ry] of RUNE) P(x * T + rx - cam.x, y * T + ry - cam.y, 1, 1, '#9ad0ff');
    ctx.globalAlpha = 1;
  }
  function drawLight() { // aktörlerin üstüne: ortam karanlığı, ışık halkaları, ateşböcekleri, kenar gölgesi
    ctx.fillStyle = AMBIENT[Scene.skyPhase()] || AMBIENT.dusk; ctx.fillRect(0, 0, VW, VH);
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y] of BRAZIERS) glow(x * T + 8 - cam.x, y * T - cam.y, 44, '255,150,70', 0.22 + 0.05 * Math.sin(now * 9 + x));
    for (const [x, y] of RUNESTONES) glow(x * T + 8 - cam.x, y * T + 2 - cam.y, 18, '140,190,255', 0.12 + 0.06 * Math.sin(now * 2));
    glow(PLAZA.x - cam.x, PLAZA.y - cam.y, 40, '255,220,140', 0.1 + 0.04 * Math.sin(now * 1.5)); // rün çemberi
    for (let i = 0; i < 12; i++) { // ateşböcekleri
      const fx = (1.5 + ((i * 7.3) % 19)) * T + Math.sin(now * 0.6 + i * 2) * 20 - cam.x, fy = (1.5 + ((i * 4.1) % 12)) * T + Math.cos(now * 0.8 + i) * 14 - cam.y;
      if (fx < 0 || fx > VW || fy < 0 || fy > VH || Math.sin(now * 3 + i * 1.3) < -0.2) continue;
      P(fx, fy, 1, 1, '#e8f070'); glow(fx, fy, 5, '230,240,120', 0.25);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (!vignette) {
      vignette = document.createElement('canvas'); vignette.width = VW; vignette.height = VH;
      const v = vignette.getContext('2d'), gr = v.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, VW * 0.72);
      gr.addColorStop(0, 'rgba(20,14,30,0)'); gr.addColorStop(1, 'rgba(20,14,30,0.45)');
      v.fillStyle = gr; v.fillRect(0, 0, VW, VH);
    }
    ctx.drawImage(vignette, 0, 0);
  }

  const P = (x, y, w, h, col) => art.px(ctx, x, y, w, h, col);
  function draw() {
    const live = wizards.filter(w => w.alive), view = me.alive ? me : live[0] || me; // bayılınca ayaktakileri izle
    cam.x = Math.max(0, Math.min(W * T - VW, Math.round(view.x - VW / 2)));
    cam.y = Math.max(0, Math.min(H * T - VH, Math.round(view.y - 8 - VH / 2)));
    ctx.drawImage(bg, cam.x, cam.y, VW, VH, 0, 0, VW, VH);
    drawMagic();
    items.forEach(drawItem);
    // sandıklar ve büyücüler önden arkaya birlikte sıralanır (sandığın arkasındaki büyücü sandığın üstüne binmesin)
    [...chests.map(c => ({ y: c.y + 3, fn: () => drawChest(c) })), ...wizards.map(w => ({ y: w.y, fn: () => drawWiz(w) }))]
      .sort((a, b) => a.y - b.y).forEach(o => o.fn());
    shots.forEach(drawShot);
    for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 4); P(p.x - cam.x, p.y - cam.y, 1, 1, p.col); }
    ctx.globalAlpha = 1;
    drawLight();
    drawFog();
    if (me.alive && aim.mouse && phase === 'play') { // nişangâh
      const x = Math.round(aim.sx), y = Math.round(aim.sy);
      P(x - 3, y, 2, 1, '#ffffff'); P(x + 2, y, 2, 1, '#ffffff'); P(x, y - 3, 1, 2, '#ffffff'); P(x, y + 2, 1, 2, '#ffffff');
    }
  }
  // Büyüler: yuvarlak, parlak çekirdekli küre; rüzgâr ise gidiş yönüne bakan kavisli bir dalga
  function drawShot(p) {
    const x = Math.round(p.x - cam.x), y = Math.round(p.y - cam.y) - 7, r = p.s.r, [inner, outer] = p.s.col;
    P(x - 1, y + 7, 3, 1, 'rgba(0,0,0,0.25)'); // yerdeki gölgesi
    if (p.s.push) {
      const v = Math.hypot(p.vx, p.vy), ux = p.vx / v, uy = p.vy / v;
      for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
        const d = Math.hypot(dx, dy), front = (dx * ux + dy * uy) / (d || 1);
        if (d > r + 0.5 || d < r - 2.5 || front < 0.1) continue;
        ctx.globalAlpha = 0.45 + 0.5 * front; P(x + dx, y + dy, 1, 1, d > r - 1 ? inner : outer);
      }
      ctx.globalAlpha = 1;
      return;
    }
    for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
      const d = dx * dx + dy * dy;
      if (d > (r + 1) * (r + 1)) continue;
      ctx.globalAlpha = d > r * r ? 0.35 : 1;
      P(x + dx, y + dy, 1, 1, d > r * r ? outer : d > (r - 1) * (r - 1) ? outer : inner);
    }
    ctx.globalAlpha = 1;
  }
  function drawFog() {
    const r = fogR();
    if (r > 400) return;
    const cx = FOGC.x - cam.x, cy = FOGC.y - cam.y;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(78,58,110,0.5)'; ctx.fill('evenodd');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(210,190,255,0.75)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 14; i++) { // sisin kıyısında süzülen tutamlar
      const a = i / 14 * Math.PI * 2 + now * 0.25, rr = r + 4 + (i % 3) * 5;
      ctx.globalAlpha = 0.5; P(cx + Math.cos(a) * rr - 2, cy + Math.sin(a) * rr, 5, 2, '#c8b8e8');
    }
    ctx.globalAlpha = 1;
  }
  function drawItem(it, i) {
    const x = Math.round(it.x - cam.x), bob = Math.round(Math.sin(now * 3 + i) * 1.5), y = Math.round(it.y - cam.y) - 4 + bob;
    P(x - 3, Math.round(it.y - cam.y) + 1, 6, 1, 'rgba(40,25,30,0.25)');
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(now * 4 + i); P(x - 4, y - 5, 9, 9, '#fff4c0'); ctx.globalAlpha = 1;
    if (WANDS.includes(it.kind)) {
      for (let k = 0; k < 6; k++) P(x - 3 + k, y + 2 - k, 1, 1, k < 4 ? '#7a5a3e' : '#9a7a5a');
      P(x + 2, y - 4, 2, 2, SPELLS[it.kind].col[1]); P(x + 2, y - 4, 1, 1, SPELLS[it.kind].col[0]);
    } else if (it.kind === 'potion') {
      P(x - 2, y - 2, 5, 5, '#3a3444'); P(x - 1, y - 1, 3, 3, '#d84a5a'); P(x - 1, y - 4, 3, 2, '#3a3444'); P(x, y - 4, 1, 2, '#e8dcc0'); P(x - 1, y - 1, 1, 1, '#ffb0b8');
    } else if (it.kind === 'shield') {
      P(x - 3, y - 2, 7, 5, '#3a3444'); P(x - 2, y - 1, 5, 3, '#efe2c0'); P(x, y, 1, 1, '#4a7ad8'); P(x - 3, y - 2, 1, 5, '#c8b890'); P(x + 3, y - 2, 1, 5, '#c8b890');
    } else { // tüy
      for (let k = 0; k < 6; k++) P(x - 2 + Math.floor(k / 2), y + 2 - k, 2, 1, k < 2 ? '#c8c8d8' : '#ffffff');
      P(x - 3, y + 3, 1, 1, '#a8a8b8');
    }
  }
  function drawChest(c) {
    const x = Math.round(c.x - cam.x), y = Math.round(c.y - cam.y), w = c.w;
    if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) return;
    const body = c.big ? '#3a4a7a' : '#7a4e2e', lid = c.big ? '#4e62a0' : '#946238', gold = '#d8b04a', L = '#2e2026';
    P(x - w - 1, y - 4, w * 2 + 2, 9, L); P(x - w, y - 3, w * 2, 7, body);
    P(x - w + 2, y - 3, 1, 7, gold); P(x + w - 3, y - 3, 1, 7, gold);
    if (c.opened) {
      P(x - w - 1, y - 10, w * 2 + 2, 6, L); P(x - w, y - 9, w * 2, 4, lid); P(x - w, y - 4, w * 2, 2, '#1a1218'); // açık kapak ve boş iç
    } else {
      P(x - w - 1, y - 7, w * 2 + 2, 4, L); P(x - w, y - 6, w * 2, 3, lid); P(x - w, y - 6, w * 2, 1, c.big ? '#6a80c0' : '#b07c4c');
      P(x - 1, y - 3, 2, 2, gold);
      if (Math.sin(now * 2 + c.x) > 0.93) P(x + w - 2, y - 6, 1, 1, '#ffffff');
      const op = wizards.find(q => q.open?.c === c);
      if (op) { P(x - 7, y - 13, 14, 3, L); P(x - 6, y - 12, Math.round(12 * Math.min(1, op.open.t / 0.8)), 1, '#f0d070'); }
    }
  }
  function drawWiz(w) {
    const x = Math.round(w.x - cam.x), y = Math.round(w.y - cam.y);
    if (x < -20 || x > VW + 20 || y < -30 || y > VH + 20) return;
    if (!w.alive) {
      const a = 1 - (now - w.deadAt) / 1.6;
      if (a <= 0) return;
      ctx.globalAlpha = a;
      art.drawWizard(ctx, w.look, x, y - Math.round((1 - a) * 8), 'down', 0);
      for (let k = 0; k < 3; k++) { const s = now * 4 + k * 2.1; P(x + Math.cos(s) * 6, y - 18 + Math.sin(s) * 2, 1, 1, '#fff0a0'); } // baş dönmesi yıldızları
      ctx.globalAlpha = 1;
      return;
    }
    P(x - 4, y - 1, 8, 2, 'rgba(40,25,30,0.25)');
    if (w.inv > 0 && Math.floor(now * 20) % 2) return; // vurulunca yanıp söner
    const s = SPELLS[w.wand || 'none'], side = w.dir === 'left' ? -1 : 1;
    if (w.wand && w.dir === 'up') { P(x + 5, y - 11, 1, 5, '#7a5a3e'); P(x + 5, y - 12, 1, 1, s.col[1]); } // asa sırtın arkasında
    art.drawWizard(ctx, w.look, x, y, w.dir, w.moving && Math.floor(now * 8) % 2);
    if (w.wand && w.dir !== 'up') {
      if (w.dir === 'down') { P(x + 5, y - 8, 1, 5, '#7a5a3e'); P(x + 5, y - 9, 1, 1, s.col[1]); }
      else { for (let k = 0; k < 5; k++) P(x + side * (4 + k), y - 6 - Math.floor(k / 2), 1, 1, '#7a5a3e'); P(x + side * 9, y - 9, 1, 1, s.col[1]); }
    }
    if (now < w.shieldUntil || w.scroll) { // kalkan baloncuğu
      ctx.globalAlpha = now < w.shieldUntil ? 0.7 : 0.35;
      for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; P(x + Math.cos(t) * 9, y - 7 + Math.sin(t) * 10, 1, 1, '#a8d8ff'); }
      ctx.globalAlpha = 1;
    }
    if (now < w.slowUntil) for (let k = 0; k < 3; k++) P(x - 6 + k * 6, y - 4 - ((now * 10 + k * 3) % 6), 1, 1, '#d8f0ff'); // buz kırıntıları
    if (now < w.fastUntil) P(x - side * 6, y - 4, 2, 1, '#ffffff');
    for (let k = 0; k < MAXHP; k++) P(x - 5 + k * 4, y - 21, 3, 2, k < w.hp ? '#e84a5a' : '#4a3a48'); // can
    if (w === me) { P(x - 1, y - 25, 3, 1, '#f0d070'); P(x, y - 24, 1, 1, '#f0d070'); } // seni gösteren ok
  }

  // ---------- Üst bilgi ve sonuç ----------
  function hud() {
    const live = wizards.filter(w => w.alive).length, c = playT(), left = Math.max(0, Math.ceil(MATCH - c));
    const s = SPELLS[me.wand || 'none'], out = me.alive && fogR() < Math.hypot(me.x - FOGC.x, me.y - FOGC.y);
    const cdBar = (v, max) => '▰'.repeat(Math.round(4 * (1 - Math.max(0, v) / max))).padEnd(4, '▱');
    const line1 = me.alive
      ? `${'♥'.repeat(me.hp)}${'♡'.repeat(MAXHP - me.hp)} · ${s.name} ${cdBar(me.cd, s.cd)} · Atılım ${me.dashCd > 0 ? cdBar(me.dashCd, me.wand === 'shadow' ? 2 : 3) : '✓'}${me.scroll ? ' · 📜' : ''}`
      : 'Bayıldın, maçı izliyorsun · Esc: kaleye dön';
    const fogTxt = out ? '<b>Sistesin! Ortaya koş</b>' : c >= FOG_START ? 'Sis daralıyor' : `Sis ${Math.ceil(FOG_START - c)} sn sonra`;
    const text = `<div>${line1}</div><div>Ayakta ${live}/4 · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} · ${fogTxt}</div>`
      + '<small>WASD yürü · tıkla/J büyü · Boşluk atılım · E sandık aç / asa değiştir · Esc çık</small>';
    if (text !== hudText) { hudText = text; hudEl.innerHTML = text; }
    if (phase === 'count') msgEl.innerHTML = `<b class="big">${Math.ceil(COUNT - now)}</b>`;
    else if (!shown) msgEl.innerHTML = now - COUNT < 0.8 ? '<b class="big">Başla!</b>' : '';
  }
  function showResults() {
    shown = true;
    const list = [...wizards].sort((a, b) => a.place - b.place);
    msgEl.innerHTML = `<div class="arena-result"><b>${me.place === 1 ? 'Kazandın! 🏆' : `${me.place}. oldun`}</b>`
      + list.map(w => `<div>${w.place}. ${w === me ? 'Sen' : w.name}${w.place === 1 ? ' 🏆' : ''}</div>`).join('')
      + '<small>Beta antrenman maçı: borç yok, istediğin kadar oyna.</small><button class="btn small" type="button">Kaleye dön</button></div>';
    msgEl.querySelector('button').onclick = () => finish(me.place);
  }

  function init() {
    const cv = document.getElementById('map');
    cv.addEventListener('pointermove', e => onPointer(e, 'move'));
    cv.addEventListener('pointerdown', e => onPointer(e, 'down'));
    addEventListener('pointerup', () => (aim.down = false));
    addEventListener('keydown', e => onKey(e, true));
    addEventListener('keyup', e => onKey(e, false));
    addEventListener('blur', () => { keys.clear(); aim.down = false; });
  }
  document.addEventListener('DOMContentLoaded', init);

  return { start, frame, on: () => on };
})();
