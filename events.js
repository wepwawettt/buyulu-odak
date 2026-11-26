// Etkinlikler: her yıl aynı tarihlerde dönen şenlikler. Etkinlik sürerken bitirilen her odak oturumu
// 1 sembol (kar tanesi, çiçek…) kazandırır; belli sayılarda yalnızca o etkinlikte kazanılan ödüller açılır
// (dükkanda satılmaz). Başlamadan 7 gün önce üstte geri sayım rozeti çıkar.
// data.events = { [id]: { y: yıl, n: toplanan sembol, soon, hello } }  (her yıl sıfırlanır; ödüller kalıcıdır)
const Events = (() => {
  // m: ay (1–12), d0–d1: gün aralığı
  const LIST = [
    { id: 'bahar', name: 'Bahar Şenliği', icon: '🌸', unit: 'çiçek', m: 3, d0: 21, d1: 31, m1: 4, e1: 20,
      desc: 'Bahar geldi! Kale çiçek açıyor, avluya pembe yapraklar yağıyor.',
      goals: [
        { n: 8, kind: 'item', id: 'celenk', name: 'Çiçek Çelengi' },
        { n: 20, kind: 'outfit', id: 'cicek', name: 'Çiçek Cübbesi' },
        { n: 40, kind: 'theme', id: 'bahce', name: 'Bahar Bahçesi oda teması' },
      ] },
    { id: 'sinav', name: 'Sınav Haftası Maratonu', icon: '⭐', unit: 'yıldız', m: 6, d0: 1, d1: 21,
      desc: 'Sınav dönemi! Her oturum bir yıldız; birlikte sona kadar.',
      goals: [
        { n: 6, kind: 'item', id: 'sertifika', name: 'Altın Sertifika' },
        { n: 15, kind: 'outfit', id: 'baykus', name: 'Gece Kuşu Cübbesi' },
        { n: 30, kind: 'theme', id: 'bilgelik', name: 'Bilgelik Salonu oda teması' },
      ] },
    { id: 'cadi', name: 'Cadılar Gecesi', icon: '🎃', unit: 'balkabağı', m: 10, d0: 17, d1: 31,
      desc: 'Kale ürkütücü ama tatlı: pervazda balkabağı, ağaçlarda cadı fenerleri.',
      goals: [
        { n: 5, kind: 'item', id: 'yarasa', name: 'Yarasalar' },
        { n: 12, kind: 'outfit', id: 'cadi', name: 'Cadı Cübbesi' },
        { n: 24, kind: 'theme', id: 'cadikule', name: 'Cadı Kulesi oda teması' },
      ] },
    { id: 'kis', name: 'Kış Şenliği', icon: '❄', unit: 'kar tanesi', m: 12, d0: 1, d1: 31,
      desc: 'Kalenin avlusuna kar yağar, ağaçlar ışıl ışıl yanar.',
      goals: [
        { n: 8, kind: 'item', id: 'snowman', name: 'Kardan Adam' },
        { n: 20, kind: 'outfit', id: 'ayaz', name: 'Ayaz Cübbesi' },
        { n: 40, kind: 'theme', id: 'buz', name: 'Buz Sarayı oda teması' },
      ] },
  ];
  const day = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Bu yılın (ya da geçtiyse gelecek yılın) başlangıç ve bitiş tarihi
  function range(ev, now = new Date()) {
    for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
      const start = new Date(y, ev.m - 1, ev.d0), end = new Date(y, (ev.m1 || ev.m) - 1, ev.e1 || ev.d1);
      if (day(now) <= end) return { start, end, y };
    }
  }
  const daysTo = (a, b) => Math.round((day(b) - day(a)) / 864e5);
  const isOn = ev => { const r = range(ev), now = new Date(); return day(now) >= r.start; };
  const current = () => LIST.find(isOn) || null;
  const upcoming = () => LIST.map(ev => ({ ev, r: range(ev) })).filter(x => !isOn(x.ev)).sort((a, b) => a.r.start - b.r.start)[0];
  function state(ev) {
    const y = range(ev).y, all = (data.events ||= {});
    if (all[ev.id]?.y !== y) all[ev.id] = { y, n: 0 };
    return all[ev.id];
  }
  const owns = g => (g.kind === 'item' ? data.owned : g.kind === 'outfit' ? data.outfits : data.themes).includes(g.id);
  // Dükkanda kilitli ödülün düğmesi için: bu ödül hangi etkinlikten?
  const of = rewardId => LIST.find(ev => ev.goals.some(g => g.id === rewardId));

  function grant(ev, g) {
    if (owns(g)) { // geçen yıl kazanılmışsa altın verilir
      data.coins += 5;
      return toastLater(`${g.n} ${ev.unit}! ${g.name} zaten sende: +5 altın`);
    }
    if (g.kind === 'item') { data.owned.push(g.id); data.equipped.push(g.id); Scene.setItems(data.equipped); }
    else if (g.kind === 'outfit') data.outfits.push(g.id);
    else data.themes.push(g.id);
    toastLater(`${ev.icon} ${g.n} ${ev.unit}! ${g.name} senin oldu. Dükkanda seni bekliyor.`);
  }

  // app.js completeFocus her odak oturumunda çağırır
  function onSession() {
    const ev = current();
    if (!ev) return;
    const s = state(ev);
    s.n++;
    for (const g of ev.goals) if (s.n === g.n) grant(ev, g);
    renderChip();
  }

  // Üstteki rozet: etkinlik sürerken toplanan sembol, başlamadan 7 gün önce geri sayım
  function renderChip() {
    const chip = document.getElementById('festChip'), ev = current(), up = upcoming();
    chip.classList.remove('soon');
    if (ev) {
      const s = state(ev), next = ev.goals.find(g => s.n < g.n);
      chip.hidden = false;
      chip.innerHTML = `${ev.icon} <b>${s.n}</b>`;
      chip.title = `${ev.name}: ${s.n} ${ev.unit}` + (next ? ` · ${next.name} için ${next.n - s.n} oturum daha` : ' · bütün ödüller açıldı!');
    } else if (up && daysTo(new Date(), up.r.start) <= 7) {
      const n = daysTo(new Date(), up.r.start);
      chip.hidden = false;
      chip.classList.add('soon');
      chip.innerHTML = `${up.ev.icon} <b>${n === 1 ? 'yarın' : n + ' gün'}</b>`;
      chip.title = `${up.ev.name} ${n === 1 ? 'yarın' : n + ' gün sonra'} başlıyor!`;
    } else chip.hidden = true;
  }

  // Etkinlikler paneli: sürmekte olan en üstte, sonra en yakından en uzağa
  function render() {
    renderChip();
    const box = document.getElementById('eventBody'), now = new Date();
    const fmt = d => d.toLocaleDateString('tr', { day: 'numeric', month: 'long' });
    box.innerHTML = '';
    const rows = LIST.map(ev => ({ ev, r: range(ev), on: isOn(ev) })).sort((a, b) => b.on - a.on || a.r.start - b.r.start);
    for (const { ev, r, on } of rows) {
      const s = state(ev), last = ev.goals.at(-1).n;
      const left = daysTo(now, r.end), until = daysTo(now, r.start);
      const status = on ? (left ? `Sürüyor · bitmesine ${left + 1} gün` : 'Sürüyor · bugün son gün!')
        : until === 1 ? 'Yarın başlıyor!' : `${until} gün sonra başlıyor`;
      const div = document.createElement('div');
      div.className = 'class-box event-box' + (on ? ' on' : '');
      div.innerHTML = `<b>${ev.icon} ${ev.name}</b><small class="when">${fmt(r.start)} – ${fmt(r.end)} · ${status}</small>
        <small>${ev.desc} Etkinlik boyunca her odak oturumu 1 ${ev.unit}.</small>
        ${on ? `<div class="bar"><div style="width:${Math.min(100, 100 * s.n / last)}%"></div></div><small>${s.n} ${ev.unit} topladın</small>` : ''}
        <ul class="class-list"></ul>`;
      const ul = div.querySelector('ul');
      for (const g of ev.goals) {
        const li = document.createElement('li');
        li.className = (on && s.n >= g.n) || owns(g) ? 'got' : '';
        li.textContent = `${g.n} ${ev.icon} ${g.name}`;
        ul.appendChild(li);
      }
      box.appendChild(div);
    }
    const recap = document.createElement('div');
    recap.className = 'class-box event-box';
    recap.innerHTML = '<b>✦ Yıl Özeti</b><small class="when">15 Aralık – 15 Ocak</small><small>Yılın odak hikâyen kart kart; sonunda paylaşılabilir bir resim. İstatistiklerdeki düğmeyle her zaman açabilirsin.</small>';
    box.appendChild(recap);
  }

  // Açılışta: yaklaşan etkinlik için bir kez haber, başlayınca bir kez karşılama
  function init() {
    renderChip();
    const ev = current(), up = upcoming();
    if (ev && !state(ev).hello) {
      state(ev).hello = true;
      save();
      toastLater(`${ev.icon} ${ev.name} başladı! Her odak oturumu bir ${ev.unit}. Ödüller Etkinlikler panelinde.`);
    } else if (!ev && up && daysTo(new Date(), up.r.start) <= 7 && !state(up.ev).soon) {
      state(up.ev).soon = true;
      save();
      const n = daysTo(new Date(), up.r.start);
      toastLater(`${up.ev.icon} ${up.ev.name} ${n === 1 ? 'yarın' : n + ' gün sonra'} başlıyor! Ödüller Etkinlikler panelinde.`);
    }
  }

  // Kale süsleri için (map.js)
  const active = () => current()?.id || null;

  return { onSession, render, init, active, of };
})();
