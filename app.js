// ---------- Kayıt ----------
const STORE = 'buyulu-odak-v1';
const DEFAULTS = {
  settings: { focus: 25, short: 5, long: 15, goal: 120, sound: true, autoBreak: true, autoFocus: false, notes: true, guard: false },
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
  ambient: { rain: false, fire: false, night: false, vol: 60 }, // odadaki ambiyans sesleri
  deep: false,  // derin odak modu
  brew: null,   // demlenen iksir { id, sec }
  wisdom: false, // bilgelik iksiri: sonraki kale görevi ödülü 2 kat
  recipes: ['wake'], // bilinen iksir tarifleri (diğerleri kalede öğrenilir)
  pantry: { leaf: 0, dust: 0, feather: 0 }, // kalede toplanan iksir malzemeleri
  gather: null, // bugün hangi toplama noktalarından alındı
  potionsMade: 0,    // içilen iksir sayısı
  view: 'room', // 'room' (odam) | 'castle' (kale haritası)
  theme: 'tas', themes: ['tas'], // oda teması (duvar ve zemin) ve sahip olunanlar
};

const OUTFIT_SHOP = [
  { id: 'klasik',   name: 'Klasik Cübbe',      price: 0,  desc: 'Her büyücünün ilk cübbesi.' },
  { id: 'gece',     name: 'Gece Gözcüsü',      price: 8,  desc: 'Lacivert, üstünde yıldızlar parıldar.' },
  { id: 'orman',    name: 'Orman Bekçisi',     price: 8,  desc: 'Yosun yeşili şapka ve cübbe.' },
  { id: 'kabak',    name: 'Balkabağı Şapka',   price: 10, desc: 'Turuncu, tatlı ve biraz ürkütücü.' },
  { id: 'kraliyet', name: 'Kraliyet Moru',     price: 12, desc: 'Altın kenarlı mor şapka.' },
  { id: 'kar',      name: 'Kar Büyücüsü',      price: 15, desc: 'Etrafında kar taneleri uçuşur.' },
  { id: 'kedi',     name: 'Kedi Kulaklı Bere', price: 18, desc: 'Sivri şapka yerine sevimli bere.' },
  { id: 'ayaz',     name: 'Ayaz Cübbesi',      price: 0, fest: true, desc: 'Kış Şenliği ödülü: buz mavisi, gümüş kenarlı.' },
  // Satılmaz: sınıf atlayınca açılır (level = Levels listesindeki sıra)
  { id: 'bilgin',   name: 'Bilgin Cübbesi',    price: 0, level: 3, desc: 'Derin deniz yeşili, bilge bir görünüm.' },
  { id: 'kidemli',  name: 'Kıdemli Cübbesi',   price: 0, level: 6, desc: 'Bordo, altın kenarlı şapka.' },
  { id: 'mezun',    name: 'Mezuniyet Cübbesi', price: 0, level: 7, desc: 'Siyah ve altın; üstünde yıldızlar.' },
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
  { id: 'snowman',   name: 'Kardan Adam',      price: 0, fest: true, desc: 'Kış Şenliği ödülü: pervazda atkısıyla bekler.' },
];

// Oda temaları: duvarı ve zemini değiştirir (uzun vadeli altın hedefi)
const THEME_SHOP = [
  { id: 'tas',      name: 'Taş Kule',        price: 0,  desc: 'Serin, klasik taş duvarlar.' },
  { id: 'gece',     name: 'Gece Kulesi',     price: 30, desc: 'Lacivert taşlar, duvarda yıldız tozu.' },
  { id: 'orman',    name: 'Orman Kulübesi',  price: 45, desc: 'Ilık ahşap duvarlar, yosunlu zemin.' },
  { id: 'kristal',  name: 'Kristal Salon',   price: 65, desc: 'Lila taşlar arasında parlayan kristaller.' },
  { id: 'kraliyet', name: 'Kraliyet Salonu', price: 90, desc: 'Altın desenli duvar kâğıdı, ahşap lambri.' },
  { id: 'buz',      name: 'Buz Sarayı',      price: 0, fest: true, desc: 'Kış Şenliği ödülü: buz mavisi, karlı duvarlar.' },
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
let resetting = false; // sıfırlarken sayfa kapanırken eski veriyi geri yazmasın
const save = () => {
  if (resetting) return;
  Badges.check(); // yeni kazanılan rozet var mı
  Levels.check(); // sınıf atlandı mı
  Friends.publish(); // giriş yapıldıysa haftalık sıralama profili
  const json = JSON.stringify(data);
  localStorage.setItem(STORE, json);
  Cloud.queue(json); // Google ile giriş yapıldıysa hesaba da yükle
};

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
  if (mode === 'focus') {
    $('noteBox').hidden = true;
    if (remaining >= dur(mode)) guardClean = data.settings.guard; // yeni oturum: koruyucu açıksa temiz başlar
  }
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
  const tag = activeTask()?.tag; // ders etiketine göre süre
  if (tag) { const d = today(); (d.tags ||= {})[tag] = (d.tags[tag] || 0) + sec; }
  Odam.onFocus(sec);
  Pet.onFocus(sec);
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
  // Odak koruyucu: oturum boyunca sekmeden 15 sn'den uzun ayrılmadıysan +1 altın (20 dk ve üzeri oturumlarda)
  if (awayAt && Date.now() - awayAt > 15000) guardClean = false;
  if (guardClean && dur('focus') >= 20 * 60) { data.coins++; toastLater('Tam odak! Oturum boyunca hiç ayrılmadın: +1 altın'); }
  guardClean = false;
  Pet.setSad(false);
  Fest.onSession();
  today().pomos++;
  data.cycle++;
  const task = activeTask();
  if (task) { task.pomos++; renderTasks(); }
  Castle.onSession(!!task);
  Castle.mail(`Tebrikler! Bugünkü ${today().pomos}. oturumun tamam. Mola senin!`);
  // Başarımlar için: ne zaman ve kiminle çalışıldı
  const h = new Date().getHours(), f = (data.flags ||= {});
  if (h < 5) f.night = true; else if (h < 7) f.early = true;
  if (Room.live()) f.room = true;
  // Günün ilk oturumu seriyi uzatır; her 7 günde +5 altın
  if (today().pomos === 1) {
    const s = streak();
    if (s >= 2) {
      const bonus = s % 7 === 0 ? 5 : 0;
      data.coins += bonus;
      toastLater(`${s} günlük seri!${bonus ? ` +${bonus} altın` : ' Yarın da gel, seri sürsün.'}`);
    }
  }
  askNote();
}

// Odak koruyucu (Ayarlar'dan açılır): odaktayken sekmeden ayrılıp dönünce hatırlatır, evcil hayvan biraz üzülür
let guardClean = false, awayAt = 0;
document.addEventListener('visibilitychange', () => {
  if (!data.settings.guard || mode !== 'focus' || !running || Room.isGuest()) { awayAt = 0; return; }
  if (document.hidden) { awayAt = Date.now(); return; }
  if (!awayAt) return;
  const sec = (Date.now() - awayAt) / 1000;
  awayAt = 0;
  if (sec < 15) return;
  guardClean = false;
  Pet.setSad(true);
  toast(`Hoş geldin! ${sec < 90 ? Math.round(sec) + ' sn' : Math.round(sec / 60) + ' dk'} uzaktaydın. ${data.pet?.species ? Pet.title() : 'Yumurtan'} seni bekledi.`);
});

// Seans notu: odak bitince "Bu oturumda ne yaptın?" sorulur; not o günün kaydına eklenir
let noteTimer;
function askNote() {
  if (!data.settings.notes) return;
  const box = $('noteBox');
  box.hidden = false;
  box.elements.note.value = '';
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => (box.hidden = true), 5 * 60000);
}
document.getElementById('noteBox').onsubmit = e => {
  e.preventDefault();
  const box = $('noteBox'), text = box.elements.note.value.trim().slice(0, 100);
  box.hidden = true;
  box.elements.note.blur();
  if (!text) return;
  const tag = activeTask()?.tag;
  (today().notes ||= []).push({ at: new Date().toTimeString().slice(0, 5), text, ...(tag && { tag }) });
  save();
  toast('Not kaydedildi. Takvimde bugüne tıklayınca görünür.');
  if (shownDay === todayKey()) showDay(shownDay);
};
document.getElementById('noteSkip').onclick = () => (document.getElementById('noteBox').hidden = true);

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
// Peş peşe gelen kutlamalar (seri, rozet) birbirini ezmesin: o anki mesajdan sonra sırayla gösterilir
const toastQueue = [];
function toastLater(msg) {
  toastQueue.push(msg);
  if (toastQueue.length === 1) setTimeout(nextToast, 3200);
}
function nextToast() {
  toast(toastQueue.shift());
  render();
  if (toastQueue.length) setTimeout(nextToast, 3200);
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
  Odam.sync();

  Scene.setState(mode === 'focus' ? (running ? 'focus' : 'idle') : 'break');
  Scene.setPet(Pet.info());
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
    if (t.tag) li.querySelector('.text').prepend(tagChip(t.tag), ' ');
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

// Ders etiketleri: görevlerde ve son 60 günde kullanılanlar listelenir (kullanılmayan kendiliğinden düşer)
const TAG_COLORS = ['#e07a5f', '#81b29a', '#f2cc8f', '#7aa6d8', '#c08ad8', '#e8a0b8', '#a0c060', '#d8a060'];
const tagColor = name => TAG_COLORS[[...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % TAG_COLORS.length];
function tagChip(name) {
  const s = document.createElement('span');
  s.className = 'tag-chip';
  s.style.background = tagColor(name);
  s.textContent = name;
  return s;
}
function knownTags() {
  const set = new Set(data.tasks.map(t => t.tag).filter(Boolean));
  const since = dayKey(new Date(Date.now() - 60 * 864e5));
  for (const [k, d] of Object.entries(data.days)) if (k >= since) Object.keys(d.tags || {}).forEach(x => set.add(x));
  if (data.lastTag) set.add(data.lastTag);
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
}
function renderTagSelect() {
  const sel = $('taskTag');
  sel.innerHTML = '';
  sel.add(new Option('Etiket yok', ''));
  for (const t of knownTags()) sel.add(new Option(t, t));
  sel.add(new Option('+ Yeni etiket…', '__new'));
  sel.value = data.lastTag && knownTags().includes(data.lastTag) ? data.lastTag : '';
}
$('taskTag').onchange = () => {
  const sel = $('taskTag');
  if (sel.value === '__new') {
    const name = (prompt('Yeni etiket (ör. Matematik, Tarih, Proje):') || '').trim().slice(0, 16);
    data.lastTag = name || data.lastTag || '';
    renderTagSelect();
    if (name) sel.value = name;
  } else data.lastTag = sel.value;
  save();
};

$('taskForm').onsubmit = e => {
  e.preventDefault();
  const text = $('taskInput').value.trim();
  if (!text) return;
  const t = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false, pomos: 0 };
  if ($('taskTag').value && $('taskTag').value !== '__new') t.tag = $('taskTag').value;
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

let statsSig = '';
function renderStats() {
  const sig = [weekOffset, todayKey(), Math.floor(today().sec / 60), today().pomos, data.settings.goal].join('|');
  if (sig === statsSig) return;
  statsSig = sig;
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
    col.onclick = () => showDay(dayKey(w.d));
    col.innerHTML = `<div class="bar"></div><div class="tip">${w.name} ${shortDate(w.d)}: ${fmtMin(w.min)} · ${w.pomos} oturum</div>`;
    bars.appendChild(col);
  }
  const line = document.createElement('div');
  line.className = 'goal-line';
  line.style.bottom = (100 * goal / scale) + '%';
  line.innerHTML = `<span>hedef ${fmtMin(goal)}</span>`;
  bars.appendChild(line);
  $('days').innerHTML = week.map(w => `<span class="${w.today ? 'today' : ''} ${w.future ? 'future' : ''}">${w.name}</span>`).join('');
  renderTagStats(week);
  renderStreak();
  renderHeat();
}

// Derslere göre: seçili haftada her etikete ayrılan odak süresi
function renderTagStats(week) {
  const byTag = {};
  for (const w of week) for (const [k, s] of Object.entries(data.days[dayKey(w.d)]?.tags || {})) byTag[k] = (byTag[k] || 0) + s;
  const rows = Object.entries(byTag).map(([k, s]) => [k, Math.round(s / 60)]).filter(r => r[1] > 0).sort((a, b) => b[1] - a[1]);
  const box = $('tagStats');
  box.innerHTML = rows.length ? '' : '<p class="room-msg">Görevlerine etiket ver (ör. Matematik); hangi derse ne kadar çalıştığın burada görünür.</p>';
  for (const [k, m] of rows) {
    const row = document.createElement('div');
    row.className = 'tag-row';
    row.innerHTML = '<span class="name"></span><div class="tag-bar"><div></div></div><span class="min"></span>';
    row.querySelector('.name').append(tagChip(k));
    row.querySelector('.tag-bar div').style.cssText = `width:${100 * m / rows[0][1]}%;background:${tagColor(k)}`;
    row.querySelector('.min').textContent = fmtMin(m);
    box.appendChild(row);
  }
}

// Üstteki seri rozeti: bugün henüz oturum yoksa sönük durur
function renderStreak() {
  const s = streak(), done = today().pomos > 0;
  $('streak').textContent = s;
  $('streakBadge').classList.toggle('cold', !done);
  $('streakBadge').title = !s ? 'Seri: bugün bir odak oturumu bitir, seri başlasın.'
    : done ? `${s} gün üst üste çalıştın! Her 7 günde +5 altın.` : `${s} günlük serin var. Bugün bir oturum bitir ki bozulmasın!`;
}

// Takvim ısı haritası: son 53 haftanın her günü, günlük hedefe göre renklenir
function renderHeat() {
  const grid = $('heatGrid'), goal = data.settings.goal;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7) - 52 * 7);
  let html = '', active = 0;
  for (const d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const min = Math.floor((data.days[dayKey(d)]?.sec || 0) / 60);
    const lv = !min ? 0 : min >= goal ? 4 : min >= goal / 2 ? 3 : min >= goal / 4 ? 2 : 1;
    if (min) active++;
    html += `<i class="l${lv}" data-k="${dayKey(d)}" title="${shortDate(d)}: ${fmtMin(min)}"></i>`;
  }
  grid.innerHTML = html;
  grid.scrollLeft = grid.scrollWidth; // en yeni günler görünsün
  $('heatSum').textContent = `${active} gün çalıştın · en uzun seri ${Badges.longest()} gün`;
}

// Bir güne tıklayınca: o günün süresi, dersleri ve seans notları
let shownDay = null;
function showDay(key) {
  shownDay = key;
  const d = data.days[key] || { sec: 0, pomos: 0 }, box = $('dayDetail');
  box.hidden = false;
  box.innerHTML = '<div class="day-head"><b></b><button type="button" class="link">Kapat</button></div><div class="day-tags"></div><ul></ul>';
  const date = new Date(key + 'T12:00').toLocaleDateString('tr', { weekday: 'long', day: 'numeric', month: 'long' });
  box.querySelector('b').textContent = `${date} · ${fmtMin(Math.floor(d.sec / 60))} · ${d.pomos} oturum`;
  box.querySelector('button').onclick = () => { box.hidden = true; shownDay = null; };
  for (const [k, sec] of Object.entries(d.tags || {}).sort((a, b) => b[1] - a[1])) {
    if (sec < 60) continue;
    const c = tagChip(k);
    c.textContent += ' ' + fmtMin(Math.floor(sec / 60));
    box.querySelector('.day-tags').append(c, ' ');
  }
  const ul = box.querySelector('ul');
  if (!d.notes?.length) ul.innerHTML = '<li class="room-msg">Bu gün için seans notu yok.</li>';
  for (const n of d.notes || []) {
    const li = document.createElement('li');
    li.innerHTML = '<small></small> ';
    li.querySelector('small').textContent = n.at;
    if (n.tag) li.append(tagChip(n.tag), ' ');
    li.append(n.text);
    ul.appendChild(li);
  }
}
$('heatGrid').onclick = e => { if (e.target.dataset.k) showDay(e.target.dataset.k); };

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
    if (!data.outfits.includes(o.id) && o.level !== undefined) { // sınıf ödülü: henüz kilitli
      b = document.createElement('button');
      b.className = 'btn';
      b.textContent = Levels.need(o.level).name;
      b.title = `${Levels.need(o.level).name}'a geçince açılır`;
      b.disabled = true;
    } else if (!data.outfits.includes(o.id) && o.fest) b = festButton();
    else if (!data.outfits.includes(o.id)) b = priceButton(o, () => buyOutfit(o));
    else {
      b = document.createElement('button');
      b.className = 'btn';
      b.textContent = worn ? 'Giyili' : 'Giy';
      b.disabled = worn;
      b.onclick = () => wearOutfit(o.id);
    }
    shopRow(list, icons['outfit:' + o.id] ||= Scene.outfitIcon(o.id), o, worn, b);
  }

  list.insertAdjacentHTML('beforeend', '<h3>Oda temaları</h3>');
  for (const th of THEME_SHOP) {
    const on = data.theme === th.id, mine = data.themes.includes(th.id);
    let b;
    if (!mine && th.fest) b = festButton();
    else if (!mine) b = priceButton(th, () => buyTheme(th));
    else {
      b = document.createElement('button');
      b.className = 'btn';
      b.textContent = on ? 'Kullanılıyor' : 'Kullan';
      b.disabled = on;
      b.onclick = () => useTheme(th.id);
    }
    shopRow(list, icons['theme:' + th.id] ||= Scene.themeIcon(th.id), th, on, b);
  }

  list.insertAdjacentHTML('beforeend', '<h3>Oda ve aksesuarlar</h3>');
  for (const it of SHOP) {
    const on = data.equipped.includes(it.id);
    let b;
    if (!data.owned.includes(it.id) && it.fest) b = festButton();
    else if (!data.owned.includes(it.id)) b = priceButton(it, () => buy(it));
    else {
      b = document.createElement('button');
      b.className = 'btn';
      b.textContent = on ? 'Kaldır' : 'Yerleştir';
      b.onclick = () => toggleItem(it.id);
    }
    shopRow(list, icons[it.id] ||= Scene.icon(it.id), it, on, b);
  }
}

// Kış Şenliği ödülleri satılmaz: Aralık'ta kar tanesi toplayınca açılır
function festButton() {
  const b = document.createElement('button');
  b.className = 'btn';
  b.textContent = 'Kış Şenliği';
  b.title = "Aralık'taki Kış Şenliği'nde kar tanesi toplayınca açılır (Rozetler panelinde)";
  b.disabled = true;
  return b;
}

function buyTheme(th) {
  if (data.coins < th.price || data.themes.includes(th.id)) return;
  data.coins -= th.price;
  data.themes.push(th.id);
  toast(`${th.name} senin oldu!`);
  useTheme(th.id);
  render();
}

function useTheme(id) {
  data.theme = id;
  Scene.setTheme(id);
  save();
  buildShop();
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

const spaceIsOurs = e => e.code === 'Space' && !Room.isGuest() && !$('setDlg').open && !$('guideDlg').open &&
  !e.target.closest('input, textarea, select, [contenteditable]');
document.addEventListener('keydown', e => {
  if (!spaceIsOurs(e)) return;
  e.preventDefault();
  if (!e.repeat) running ? pause() : start();
});
// Odaktaki düğme boşluk bırakılınca tekrar "tıklanmasın"
document.addEventListener('keyup', e => { if (spaceIsOurs(e)) e.preventDefault(); });

// Yan paneller (karakter, dükkan): aynı anda biri açık olur
const charDlg = $('charDlg'), shopDlg = $('shopDlg'), roomDlg = $('roomDlg'), brewDlg = $('brewDlg'), badgeDlg = $('badgeDlg'), friendDlg = $('friendDlg');
function togglePanel(dlg, build) {
  const wasOpen = dlg.open;
  charDlg.close(); shopDlg.close(); roomDlg.close(); brewDlg.close(); badgeDlg.close(); friendDlg.close();
  if (!wasOpen) { build(); dlg.show(); }
}
$('openChar').onclick = () => togglePanel(charDlg, buildCharOptions);
$('openShop').onclick = () => togglePanel(shopDlg, buildShop);
document.querySelector('.coins').onclick = () => togglePanel(shopDlg, buildShop);
for (const d of [charDlg, shopDlg, roomDlg]) d.querySelector('[data-close]').onclick = () => d.close();
$('openRoom').onclick = () => togglePanel(roomDlg, Room.renderPanel);
$('openFriends').onclick = () => togglePanel(friendDlg, Friends.render);
$('openBadges').onclick = $('streakBadge').onclick = $('festChip').onclick = () => togglePanel(badgeDlg, () => { Fest.render(); Levels.render(); Badges.render(); });

const setDlg = $('setDlg'), form = $('setForm');
// Nasıl oynanır? rehberi: düğmeyle her zaman, ilk girişte bir kez kendiliğinden
$('openGuide').onclick = () => $('guideDlg').showModal();
function showGuideOnce() {
  if (data.seenGuide) return;
  data.seenGuide = true;
  save();
  $('guideDlg').showModal();
}

// Tüm ilerlemeyi sıfırla (bu tarayıcı; giriş yapıldıysa Google hesabındaki kayıt da)
$('resetAll').onclick = () => {
  const acc = Cloud.signedIn() ? ' Google hesabındaki kayıt da sıfırlanır.' : '';
  if (!confirm(`Bütün ilerlemen silinecek: altın, eşyalar, kıyafetler, görevler, istatistikler, iksirler ve malzemeler.${acc} Bu geri alınamaz. Emin misin?`)) return;
  Cloud.wipe();
  resetting = true;
  localStorage.removeItem(STORE);
  location.reload();
};

// Telefona/bilgisayara uygulama olarak kurma (Ayarlar'daki "Uygulama" kutusu)
let installPrompt = null;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function renderInstall() {
  const box = $('installBox');
  box.hidden = standalone() || (!installPrompt && !isIOS);
  box.querySelector('button').hidden = !installPrompt;
  box.querySelector('p').textContent = installPrompt
    ? 'Büyülü Odak\'ı ana ekranına ekle; uygulama gibi tam ekran açılır.'
    : 'iPhone/iPad: Safari\'de Paylaş düğmesine dokun, sonra "Ana Ekrana Ekle"yi seç.';
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; renderInstall(); });
addEventListener('appinstalled', () => { installPrompt = null; renderInstall(); toast('Büyülü Odak kuruldu!'); });
$('installBox').querySelector('button').onclick = async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  renderInstall();
};

$('openSettings').onclick = () => {
  renderInstall();
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
  $('roomBar').hidden = castle;
  $('sceneTip').hidden = true;
  document.querySelector('.frame').classList.toggle('castle', castle);
  document.querySelectorAll('.views button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  Castle.show(castle);
  if (data.view !== v) { data.view = v; save(); }
}
document.querySelectorAll('.views button').forEach(b => (b.onclick = () => setView(b.dataset.view)));

// ---------- Başlat ----------
Scene.init($('scene'), data.look);
Scene.setItems(data.equipped);
Scene.setTheme(data.theme);
Castle.init($('map'));
setView(data.view === 'castle' ? 'castle' : 'room');
applyHouseColors();
render();
renderTagSelect();
renderTasks();
renderStats();
Room.init();
Odam.init();
Cloud.init();
Fest.init();
Recap.init();
setInterval(tick, 250);
setInterval(renderStats, 30000); // odak sürerken bugünkü çubuk büyüsün
setInterval(save, 5000);
addEventListener('visibilitychange', save);
addEventListener('beforeunload', save);

// Dokunmatik ekran: kaledeki yön tuşları ve E, klavye tuşu gibi davranır (basılı tutunca yürür)
document.querySelectorAll('.touch-pad [data-key]').forEach(b => {
  const send = type => dispatchEvent(new KeyboardEvent(type, { code: b.dataset.key }));
  b.addEventListener('pointerdown', e => {
    e.preventDefault();
    try { b.setPointerCapture(e.pointerId); } catch {} // parmak düğmeden kayınca da bırakılınca dursun
    send('keydown');
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, () => send('keyup'));
});

// Herhangi bir paneldeki "Kapat" / × düğmesi kendi panelini kapatır
document.addEventListener('click', e => {
  const b = e.target.closest('[data-close]');
  if (b && b.closest('dialog')) b.closest('dialog').close();
});
