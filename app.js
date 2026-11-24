// ---------- Kayıt ----------
const STORE = 'buyulu-odak-v1';
const DEFAULTS = {
  settings: { focus: 25, short: 5, long: 15, goal: 120, sound: true, autoBreak: true, autoFocus: false },
  look: { house: 'kizil', hair: 'kahve', skin: 1, outfit: 'klasik', hairStyle: 'uzun' },
  outfits: ['klasik'], // sahip olunan kıyafetler
  coins: 0,
  coinAcc: 0,   // bir sonraki altın için biriken odak saniyesi
  cycle: 0,     // tamamlanan odak oturumu sayısı (4'te bir uzun mola)
  days: {},     // { 'YYYY-AA-GG': { sec, pomos } }
  owned: [],    // satın alınan eşyalar
  equipped: [], // sahnede/karakterde kullanılanlar
  tasks: [],    // { id, text, done, pomos }
  activeTask: null,
  quests: null, // günün kale görevleri (map.js yönetir)
  name: '',     // ortak odada görünen ad
  view: 'room', // 'room' (odam) | 'castle' (kale haritası)
};

const OUTFIT_SHOP = [
  { id: 'klasik',   name: 'Klasik Cübbe',      price: 0,  desc: 'Her büyücünün ilk cübbesi.' },
  { id: 'gece',     name: 'Gece Gözcüsü',      price: 8,  desc: 'Lacivert, üstünde yıldızlar parıldar.' },
  { id: 'orman',    name: 'Orman Bekçisi',     price: 8,  desc: 'Yosun yeşili şapka ve cübbe.' },
  { id: 'kabak',    name: 'Balkabağı Şapka',   price: 10, desc: 'Turuncu, tatlı ve biraz ürkütücü.' },
  { id: 'kraliyet', name: 'Kraliyet Moru',     price: 12, desc: 'Altın kenarlı mor şapka.' },
  { id: 'kar',      name: 'Kar Büyücüsü',      price: 15, desc: 'Etrafında kar taneleri uçuşur.' },
  { id: 'kedi',     name: 'Kedi Kulaklı Bere', price: 18, desc: 'Sivri şapka yerine sevimli bere.' },
];

const SHOP = [
  { id: 'glasses',   name: 'Yuvarlak Gözlük',  price: 3,  desc: 'Küçük yazıları okumak için.' },
  { id: 'plant',     name: 'Saksı Bitkisi',    price: 3,  desc: 'Masada salınan sihirli bitki.' },
  { id: 'shooting',  name: 'Kayan Yıldızlar',  price: 4,  desc: 'Pencereden yıldızlar kayar.' },
  { id: 'crystal',   name: 'Kristal Küre',     price: 5,  desc: 'İçinde sisler dönüyor.' },
  { id: 'candles',   name: 'Mum Ordusu',       price: 5,  desc: 'Odaya üç yüzen mum daha.' },
  { id: 'starhat',   name: 'Yıldızlı Şapka',   price: 6,  desc: 'Şapkanda yıldızlar parıldar.' },
  { id: 'fireflies', name: 'Ateş Böcekleri',   price: 6,  desc: 'Odada süzülen minik ışıklar.' },
  { id: 'wand',      name: 'Sihirli Asa',      price: 7,  desc: 'Odaklanırken ucu parıldar.' },
  { id: 'cat',       name: 'Kara Kedi',        price: 8,  desc: 'Masanın önünde nöbet tutar.' },
  { id: 'chest',     name: 'Hazine Sandığı',   price: 9,  desc: 'Aralığından altın ışıldar.' },
  { id: 'broom',     name: 'Uçan Süpürge',     price: 10, desc: 'Köşede havada süzülür.' },
  { id: 'clock',     name: 'Sihirli Saat',     price: 11, desc: 'Gerçek saati gösterir.' },
  { id: 'cauldron',  name: 'Fokurdayan Kazan', price: 12, desc: 'Yeşil iksir hep kaynar.' },
  { id: 'ghost',     name: 'Dost Hayalet',     price: 14, desc: 'Duvarlar boyunca süzülür.' },
  { id: 'painting',  name: 'Hareketli Tablo',  price: 15, desc: 'Yaşlı büyücü seni izler.' },
  { id: 'book',      name: 'Uçan Kitap',       price: 18, desc: 'Sayfalarını çırparak uçar.' },
  { id: 'dragon',    name: 'Ejderha Yavrusu',  price: 25, desc: 'Kitaplığın üstünde uyuklar.' },
];

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE)) || {};
    return {
      ...structuredClone(DEFAULTS), ...d,
      settings: { ...DEFAULTS.settings, ...d.settings },
      look: { ...DEFAULTS.look, ...d.look },
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}
const data = load();
const save = () => localStorage.setItem(STORE, JSON.stringify(data));

const todayKey = () => new Date().toLocaleDateString('sv'); // YYYY-AA-GG
function today() {
  return (data.days[todayKey()] ||= { sec: 0, pomos: 0 });
}

// ---------- Zamanlayıcı ----------
const LABELS = { focus: 'Odak', short: 'Kısa Mola', long: 'Uzun Mola' };
let mode = 'focus';
let running = false;
let remaining = dur(mode); // saniye
let endAt = 0, lastTick = 0;

function dur(m) { return (Room.durs()?.[m] ?? data.settings[m]) * 60; }

function start() {
  if (remaining <= 0) remaining = dur(mode);
  running = true;
  lastTick = Date.now();
  endAt = lastTick + remaining * 1000;
  audio()?.resume();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  render();
}

function pause() {
  tick();
  running = false;
  render();
}

function reset() {
  running = false;
  remaining = dur(mode);
  render();
}

function switchTo(m, autostart) {
  mode = m;
  running = false;
  remaining = dur(m);
  if (autostart) start();
  render();
}

function tick() {
  if (!running) return;
  const now = Date.now();
  const until = Math.min(now, endAt);
  if (mode === 'focus' && until > lastTick) addFocus((until - lastTick) / 1000);
  lastTick = now;
  remaining = Math.max(0, (endAt - now) / 1000);
  if (remaining <= 0) finish();
  render();
}

function addFocus(sec) {
  today().sec += sec;
  data.coinAcc += sec;
  while (data.coinAcc >= 600) {
    data.coinAcc -= 600;
    data.coins++;
    const c = document.querySelector('.coins');
    c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
    toast('+1 altın kazandın!');
  }
}

function completeFocus() {
  today().pomos++;
  data.cycle++;
  const task = activeTask();
  if (task) { task.pomos++; renderTasks(); }
  Castle.onSession(!!task);
  Castle.mail(`Tebrikler! Bugünkü ${today().pomos}. oturumun tamam. Mola senin!`);
}

function finish() {
  if (Room.isGuest()) return guestFinish();
  running = false;
  chime();
  let msg;
  if (mode === 'focus') {
    completeFocus();
    const next = data.cycle % 4 === 0 ? 'long' : 'short';
    msg = next === 'long' ? 'Dört oturum! Uzun bir molayı hak ettin.' : 'Harika iş! Biraz çay molası.';
    switchTo(next, data.settings.autoBreak);
  } else {
    msg = 'Mola bitti, kitaplara dönme vakti!';
    switchTo('focus', data.settings.autoFocus);
  }
  toast(msg);
  notify(msg);
  save();
  renderStats();
  Room.sendProfile();
}

// Misafir: oturumu kendi verisine say, sonraki modu oda sahibi gönderir
function guestFinish() {
  Room.markDone(mode);
  running = false;
  remaining = 0;
  chime();
  const msg = mode === 'focus' ? 'Harika iş! Biraz çay molası.' : 'Mola bitti, kitaplara dönme vakti!';
  if (mode === 'focus') completeFocus();
  toast(msg);
  notify(msg);
  save();
  renderStats();
  render();
  Room.sendProfile();
}

function skip() {
  if (mode === 'focus') switchTo(data.cycle % 4 === 3 ? 'long' : 'short', false);
  else switchTo('focus', false);
}

// ---------- Ses ve bildirim ----------
let actx;
function audio() {
  if (!actx && window.AudioContext) actx = new AudioContext();
  return actx;
}
function chime() {
  if (!data.settings.sound || !audio()) return;
  [784, 988, 1175, 1568, 1976].forEach((f, i) => {
    const o = actx.createOscillator(), g = actx.createGain();
    const t0 = actx.currentTime + i * 0.11;
    o.type = 'triangle';
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.9);
    o.connect(g).connect(actx.destination);
    o.start(t0);
    o.stop(t0 + 0.95);
  });
}
function notify(msg) {
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Büyülü Odak', { body: msg });
  }
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ---------- Arayüz ----------
const $ = id => document.getElementById(id);
const fmt = s => {
  s = Math.ceil(s);
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

function render() {
  document.body.dataset.mode = mode;
  $('time').textContent = fmt(remaining);
  document.title = running ? `${fmt(remaining)} · ${LABELS[mode]} — Büyülü Odak` : 'Büyülü Odak';
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));

  const total = dur(mode);
  $('start').textContent = running ? 'Duraklat' : remaining < total ? 'Devam' : 'Başla';
  $('manaFill').style.width = (100 * (1 - remaining / total)) + '%';

  const filled = mode === 'long' && data.cycle % 4 === 0 && data.cycle > 0 ? 4 : data.cycle % 4;
  $('cycle').innerHTML = [0, 1, 2, 3].map(i => `<span class="${i < filled ? 'on' : ''}"></span>`).join('');

  const mins = Math.floor(today().sec / 60), goal = data.settings.goal;
  $('goalText').textContent = mins >= goal ? `${mins} / ${goal} dk — Hedef tamam!` : `${mins} / ${goal} dk`;
  $('goalFill').style.width = Math.min(100, 100 * mins / goal) + '%';
  $('coins').textContent = data.coins;
  $('coinNext').textContent = `Sonraki altına ${Math.ceil((600 - data.coinAcc) / 60)} dk odak · bugün ${today().pomos} oturum`;

  const guest = Room.isGuest();
  for (const b of [$('start'), $('reset'), $('skip'), ...document.querySelectorAll('.tabs button')]) b.disabled = guest;
  $('roomNote').textContent = Room.note();
  $('roomNote').hidden = !Room.note();
  Room.sync();

  Scene.setState(mode === 'focus' ? (running ? 'focus' : 'idle') : 'break');
}

function applyHouseColors() {
  const h = Scene.HOUSES[data.look.house];
  document.documentElement.style.setProperty('--house', h.a);
  document.documentElement.style.setProperty('--house-2', h.b);
}

// Karakter seçenekleri
const HAIR_LABELS = { siyah: 'Siyah', kahve: 'Kahve', kizil: 'Kızıl', sari: 'Sarı', gumus: 'Gümüş' };
function buildCharOptions() {
  const groups = [
    ['houseOpts', 'house', Object.entries(Scene.HOUSES).map(([k, h]) => [k, h.name, `linear-gradient(90deg, ${h.a} 50%, ${h.b} 50%)`])],
    ['hairOpts', 'hair', Object.entries(Scene.HAIR).map(([k, c]) => [k, HAIR_LABELS[k], c])],
    ['styleOpts', 'hairStyle', [['uzun', 'Uzun', Scene.HAIR[data.look.hair]], ['kisa', 'Kısa', Scene.HAIR[data.look.hair]]]],
    ['skinOpts', 'skin', Scene.SKIN.map((c, i) => [i, '', c])],
    ['outfitOpts', 'outfit', OUTFIT_SHOP.filter(o => data.outfits.includes(o.id))
      .map(o => [o.id, o.name, Scene.OUTFITS[o.id].pal?.H || '#2b2540'])],
  ];
  for (const [id, key, items] of groups) {
    const box = $(id);
    box.innerHTML = '';
    for (const [val, label, color] of items) {
      const b = document.createElement('button');
      b.className = 'opt' + (data.look[key] === val ? ' sel' : '');
      b.innerHTML = `<i style="background:${color}"></i>${label}`;
      b.onclick = () => {
        data.look[key] = val;
        Scene.setLook(data.look);
        for (const k in icons) delete icons[k]; // ikonlar karakterin görünüşünü içeriyor
        Room.sendProfile();
        applyHouseColors();
        save();
        buildCharOptions();
      };
      box.appendChild(b);
    }
  }
}

// Görevler
const activeTask = () => data.tasks.find(t => t.id === data.activeTask && !t.done);

function renderTasks() {
  const ul = $('taskList');
  ul.innerHTML = '';
  if (!data.tasks.length) ul.innerHTML = '<li class="task empty">Henüz görev yok. Bugün ne çalışacaksın?</li>';
  for (const t of [...data.tasks].sort((a, b) => a.done - b.done)) {
    const li = document.createElement('li');
    li.className = 'task' + (t.done ? ' done' : '') + (t.id === data.activeTask && !t.done ? ' active' : '');
    li.innerHTML = `<input type="checkbox" title="Tamamlandı"><span class="text" title="Odaklanılacak görev olarak seç"></span>
      <span class="count" title="Bu göreve tamamlanan odak oturumu">${t.pomos ? '✦ ' + t.pomos : ''}</span>
      <button class="del" title="Sil">×</button>`;
    li.querySelector('.text').textContent = t.text;
    const box = li.querySelector('input');
    box.checked = t.done;
    box.onchange = () => {
      t.done = box.checked;
      if (t.done) { toast('Görev tamam! Bir büyü daha öğrendin.'); Castle.onTaskDone(t.text); }
      saveTasks();
    };
    li.querySelector('.text').onclick = () => {
      if (t.done) return;
      data.activeTask = data.activeTask === t.id ? null : t.id;
      saveTasks();
    };
    li.querySelector('.del').onclick = () => {
      data.tasks = data.tasks.filter(x => x !== t);
      saveTasks();
    };
    ul.appendChild(li);
  }
  $('clearDone').hidden = !data.tasks.some(t => t.done);

  const cur = activeTask();
  const cEl = $('current');
  cEl.textContent = '';
  if (cur) {
    const b = document.createElement('b');
    b.textContent = cur.text;
    cEl.append('Şu an: ', b);
  } else if (data.tasks.some(t => !t.done)) {
    cEl.textContent = 'Aşağıdan bir görev seç';
  }
}

function saveTasks() {
  save();
  renderTasks();
}

$('taskForm').onsubmit = e => {
  e.preventDefault();
  const text = $('taskInput').value.trim();
  if (!text) return;
  const t = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false, pomos: 0 };
  data.tasks.push(t);
  if (!activeTask()) data.activeTask = t.id;
  $('taskInput').value = '';
  saveTasks();
};
$('clearDone').onclick = () => {
  data.tasks = data.tasks.filter(t => !t.done);
  saveTasks();
};

// Haftalık istatistik
const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
let weekOffset = 0; // 0 = bu hafta, -1 = geçen hafta ...

const fmtMin = m => (m < 60 ? `${m} dk` : `${Math.floor(m / 60)} sa${m % 60 ? ' ' + (m % 60) + ' dk' : ''}`);
const dayKey = d => d.toLocaleDateString('sv');
const shortDate = d => d.toLocaleDateString('tr', { day: 'numeric', month: 'short' });

function streak() {
  const d = new Date();
  if (!(data.days[dayKey(d)]?.pomos > 0)) d.setDate(d.getDate() - 1); // bugün henüz yoksa seri bozulmaz
  let n = 0;
  while (data.days[dayKey(d)]?.pomos > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function renderStats() {
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) + weekOffset * 7);
  const week = DAY_NAMES.map((name, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const s = data.days[dayKey(d)] || { sec: 0, pomos: 0 };
    return { name, d, min: Math.floor(s.sec / 60), pomos: s.pomos, today: dayKey(d) === todayKey(), future: d > now };
  });
  const sunday = week[6].d;
  $('weekTitle').textContent =
    (weekOffset === 0 ? 'Bu hafta' : weekOffset === -1 ? 'Geçen hafta' : 'Hafta') + ` · ${shortDate(monday)} – ${shortDate(sunday)}`;
  $('weekNext').disabled = weekOffset >= 0;

  const total = week.reduce((a, w) => a + w.min, 0);
  const counted = week.filter(w => !w.future).length || 1;
  $('stTotal').textContent = fmtMin(total);
  $('stAvg').textContent = fmtMin(Math.round(total / counted));
  $('stPomos').textContent = week.reduce((a, w) => a + w.pomos, 0);
  $('stStreak').textContent = streak() + ' gün';

  const goal = data.settings.goal;
  const scale = Math.max(goal, ...week.map(w => w.min)) * 1.1;
  const bars = $('bars');
  bars.innerHTML = '';
  for (const w of week) {
    const col = document.createElement('div');
    col.className = 'col';
    col.tabIndex = 0;
    col.style.setProperty('--h', (100 * w.min / scale) + '%');
    col.innerHTML = `<div class="bar"></div><div class="tip">${w.name} ${shortDate(w.d)}: ${fmtMin(w.min)} · ${w.pomos} oturum</div>`;
    bars.appendChild(col);
  }
  const line = document.createElement('div');
  line.className = 'goal-line';
  line.style.bottom = (100 * goal / scale) + '%';
  line.innerHTML = `<span>hedef ${fmtMin(goal)}</span>`;
  bars.appendChild(line);
  $('days').innerHTML = week.map(w => `<span class="${w.today ? 'today' : ''} ${w.future ? 'future' : ''}">${w.name}</span>`).join('');
}

$('weekPrev').onclick = () => { weekOffset--; renderStats(); };
$('weekNext').onclick = () => { if (weekOffset < 0) { weekOffset++; renderStats(); } };

// Dükkan
const icons = {};
function shopRow(list, src, it, on, button) {
  const row = document.createElement('div');
  row.className = 'item' + (on ? ' on' : '');
  row.innerHTML = `<img alt="" src="${src}"><div><b>${it.name}</b><small>${it.desc}</small></div>`;
  row.appendChild(button);
  list.appendChild(row);
}

function priceButton(it, onBuy) {
  const b = document.createElement('button');
  b.className = 'btn buy';
  b.textContent = `${it.price} altın`;
  b.disabled = data.coins < it.price;
  b.title = b.disabled ? `${it.price - data.coins} altın daha lazım` : 'Satın al';
  b.onclick = onBuy;
  return b;
}

function buildShop() {
  $('shopCoins').textContent = data.coins;
  const list = $('shopList');
  list.innerHTML = '<h3>Kıyafetler</h3>';
  for (const o of OUTFIT_SHOP) {
    const worn = data.look.outfit === o.id;
    let b;
    if (!data.outfits.includes(o.id)) b = priceButton(o, () => buyOutfit(o));
    else {
      b = document.createElement('button');
      b.className = 'btn';
      b.textContent = worn ? 'Giyili' : 'Giy';
      b.disabled = worn;
      b.onclick = () => wearOutfit(o.id);
    }
    shopRow(list, icons['outfit:' + o.id] ||= Scene.outfitIcon(o.id), o, worn, b);
  }

  list.insertAdjacentHTML('beforeend', '<h3>Oda ve aksesuarlar</h3>');
  for (const it of SHOP) {
    const on = data.equipped.includes(it.id);
    let b;
    if (!data.owned.includes(it.id)) b = priceButton(it, () => buy(it));
    else {
      b = document.createElement('button');
      b.className = 'btn';
      b.textContent = on ? 'Kaldır' : 'Yerleştir';
      b.onclick = () => toggleItem(it.id);
    }
    shopRow(list, icons[it.id] ||= Scene.icon(it.id), it, on, b);
  }
}

function buyOutfit(o) {
  if (data.coins < o.price || data.outfits.includes(o.id)) return;
  data.coins -= o.price;
  data.outfits.push(o.id);
  toast(`${o.name} senin oldu!`);
  wearOutfit(o.id);
  render();
}

function wearOutfit(id) {
  data.look.outfit = id;
  Scene.setLook(data.look);
  for (const k in icons) if (!k.startsWith('outfit:')) delete icons[k]; // gözlük/şapka ikonları kıyafete göre
  save();
  Room.sendProfile();
  buildShop();
}

function buy(it) {
  if (data.coins < it.price || data.owned.includes(it.id)) return;
  data.coins -= it.price;
  data.owned.push(it.id);
  data.equipped.push(it.id);
  Scene.setItems(data.equipped);
  save();
  Room.sendProfile();
  toast(`${it.name} senin oldu!`);
  buildShop();
  render();
}

function toggleItem(id) {
  data.equipped = data.equipped.includes(id) ? data.equipped.filter(x => x !== id) : [...data.equipped, id];
  Scene.setItems(data.equipped);
  save();
  Room.sendProfile();
  buildShop();
}

// ---------- Olaylar ----------
$('start').onclick = () => (running ? pause() : start());
$('reset').onclick = reset;
$('skip').onclick = skip;
document.querySelectorAll('.tabs button').forEach(b => (b.onclick = () => switchTo(b.dataset.mode, false)));

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !e.target.closest('input, button, dialog') && !Room.isGuest()) {
    e.preventDefault();
    running ? pause() : start();
  }
});

// Yan paneller (karakter, dükkan): aynı anda biri açık olur
const charDlg = $('charDlg'), shopDlg = $('shopDlg'), roomDlg = $('roomDlg');
function togglePanel(dlg, build) {
  const wasOpen = dlg.open;
  charDlg.close(); shopDlg.close(); roomDlg.close();
  if (!wasOpen) { build(); dlg.show(); }
}
$('openChar').onclick = () => togglePanel(charDlg, buildCharOptions);
$('openShop').onclick = () => togglePanel(shopDlg, buildShop);
document.querySelector('.coins').onclick = () => togglePanel(shopDlg, buildShop);
for (const d of [charDlg, shopDlg, roomDlg]) d.querySelector('[data-close]').onclick = () => d.close();
$('openRoom').onclick = () => togglePanel(roomDlg, Room.renderPanel);

const setDlg = $('setDlg'), form = $('setForm');
$('openSettings').onclick = () => {
  for (const [k, v] of Object.entries(data.settings)) {
    const input = form.elements[k];
    if (input.type === 'checkbox') input.checked = v; else input.value = v;
  }
  setDlg.showModal();
};
setDlg.addEventListener('close', () => {
  if (setDlg.returnValue !== 'save') return;
  for (const k of Object.keys(data.settings)) {
    const input = form.elements[k];
    if (input.type === 'checkbox') data.settings[k] = input.checked;
    else {
      const n = Math.round(Number(input.value));
      if (n >= Number(input.min) && n <= Number(input.max)) data.settings[k] = n;
    }
  }
  save();
  if (!running) remaining = dur(mode);
  render();
  renderStats();
});

// Oda / Kale görünümü
function setView(v) {
  const castle = v === 'castle';
  $('scene').hidden = castle;
  $('map').hidden = !castle;
  $('mapHelp').hidden = !castle;
  document.querySelector('.frame').classList.toggle('castle', castle);
  document.querySelectorAll('.views button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  Castle.show(castle);
  if (data.view !== v) { data.view = v; save(); }
}
document.querySelectorAll('.views button').forEach(b => (b.onclick = () => setView(b.dataset.view)));

// ---------- Başlat ----------
Scene.init($('scene'), data.look);
Scene.setItems(data.equipped);
Castle.init($('map'));
setView(data.view === 'castle' ? 'castle' : 'room');
applyHouseColors();
render();
renderTasks();
renderStats();
Room.init();
setInterval(tick, 250);
setInterval(renderStats, 30000); // odak sürerken bugünkü çubuk büyüsün
setInterval(save, 5000);
addEventListener('visibilitychange', save);
addEventListener('beforeunload', save);
