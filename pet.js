// Evcil hayvan ve koleksiyon: herkes bir yumurtayla başlar. 1 saat odakta çatlar, içinden rastgele bir yaratık çıkar
// (sürpriz) ve odaklandıkça büyür. 2 gün çalışılmazsa uykuya dalar. Odada ve kalede (peşinden) görünür.
// Her yetişkin olan hayvan bir yumurta hediye eder; yumurta altınla da alınabilir. Albümde bulunan türler görünür.
// data.pet = yanındaki hayvan { id, sec, species, name, last }   data.stable = diğer hayvanların
// data.petSeen = bulunan türler   data.eggFree = hediye yumurta sayısı
const Pet = (() => {
  // w: çıkma ağırlığı (az olan daha nadir)
  const SPECIES = {
    tilki: { name: 'Ay tilkisi', w: 14 }, pofuduk: { name: 'Pofuduk', w: 14 }, kurbaga: { name: 'Kurbağa', w: 14 },
    tavsan: { name: 'Tavşan', w: 14 }, kirpi: { name: 'Kirpi', w: 14 },
    baykus: { name: 'Baykuş', w: 9, rare: 'Az bulunur' }, ejder: { name: 'Ejderha', w: 5, rare: 'Nadir' },
    anka: { name: 'Anka Kuşu', w: 3, rare: 'Çok nadir' },
  };
  const STAGES = [
    { name: 'Yumurta', h: 0 }, { name: 'Yavru', h: 1 }, { name: 'Genç', h: 10 }, { name: 'Yetişkin', h: 30 },
  ];
  const EGG_PRICE = 25;
  const newEgg = () => ({ id: Date.now().toString(36), sec: 0, species: null, name: '', last: todayKey() });
  const pet = () => (data.pet ||= newEgg());
  const stable = () => (data.stable ||= []);
  const seen = () => (data.petSeen ||= [data.pet, ...stable()].map(p => p?.species).filter(Boolean));
  const stageOf = p => STAGES.reduce((s, st, i) => (p.sec >= st.h * 3600 ? i : s), 0);
  const stage = () => stageOf(pet());
  const daysAway = () => Math.round((new Date(todayKey() + 'T12:00') - new Date(pet().last + 'T12:00')) / 864e5);
  const titleOf = p => p.name || SPECIES[p.species]?.name || 'Yumurta';
  const title = () => titleOf(pet());
  let sad = false, sadTimer; // odak koruyucu: sekmeden uzun ayrılınca bir süre üzgün (kaydedilmez)
  function setSad(v) {
    sad = v;
    clearTimeout(sadTimer);
    if (v) sadTimer = setTimeout(() => (sad = false), 10 * 60000);
  }

  // Çatlayınca tür: ağırlıklı rastgele; daha önce bulunmuşsa bir kez daha denenir (albüm dolsun)
  function roll() {
    const pick = () => {
      let r = Math.random() * Object.values(SPECIES).reduce((a, s) => a + s.w, 0);
      for (const [k, s] of Object.entries(SPECIES)) if ((r -= s.w) < 0) return k;
      return 'tilki';
    };
    const a = pick();
    return seen().includes(a) && seen().length < Object.keys(SPECIES).length ? pick() : a;
  }
  // Yetişkin olan her hayvan bir kez yumurta hediye eder (güncellemeden önce büyümüş olanlar dahil)
  function giftEggs() {
    for (const p of [pet(), ...stable()]) if (p.species && stageOf(p) === 3 && !p.egg) { p.egg = true; data.eggFree = (data.eggFree || 0) + 1; }
  }

  // app.js addFocus her odak saniyesinde çağırır
  function onFocus(sec) {
    const p = pet(), before = stage();
    p.sec += sec;
    p.last = todayKey();
    const now = stage();
    if (now === before) return;
    if (now === 1 && !p.species) {
      p.species = roll();
      if (!seen().includes(p.species)) seen().push(p.species);
      const r = SPECIES[p.species].rare;
      toastLater(`Yumurtan çatladı! İçinden bir ${SPECIES[p.species].name} çıktı${r ? ` (${r.toLowerCase()}!)` : '!'} Odandaki yavruya tıklayıp ona ad koy.`);
    } else if (now === 3) {
      giftEggs();
      toastLater(`${title()} yetişkin oldu! Koleksiyonun için bir yumurta hediye etti. Hayvanına tıkla.`);
    } else toastLater(`${title()} büyüdü: artık ${STAGES[now].name}!`);
    try { chime(); } catch {}
  }

  // Çizim için (Scene.drawPet)
  const infoOf = p => ({ species: p.species, stage: p.species ? stageOf(p) : 0, cape: Scene.HOUSES[data.look.house]?.a });
  function info() {
    return { ...infoOf(pet()), sleepy: daysAway() >= 2, sad };
  }

  // Odadaki hayvana tıklanınca: ilk seferde ad sorulur, sonra koleksiyon paneli açılır
  function click() {
    const p = pet();
    if (p.species && !p.name) return rename();
    togglePanel(document.getElementById('petDlg'), render);
  }
  function rename() {
    const p = pet();
    if (!p.species) return toast('Önce yumurtanın çatlaması lazım!');
    const name = (prompt(`${SPECIES[p.species].name} için bir ad:`, p.name) || '').trim().slice(0, 14);
    if (name) { p.name = name; save(); toast(`Merhaba ${name}!`); }
    if (document.getElementById('petDlg').open) render();
  }

  function takeEgg(paid) {
    if (!pet().species) return toast('Önce yanındaki yumurtayı çatlat!');
    if (paid ? data.coins < EGG_PRICE : !data.eggFree) return;
    if (paid) data.coins -= EGG_PRICE; else data.eggFree--;
    stable().push(pet());
    data.pet = newEgg();
    save(); render();
    toast('Yeni bir yumurta! 1 saat odaklan, içinden ne çıkacak bakalım.');
  }
  function choose(i) {
    const p = stable()[i];
    stable().splice(i, 1, pet());
    data.pet = p;
    save(); render();
    toast(`${titleOf(p)} artık yanında!`);
  }

  // Küçük bir tuvale hayvan resmi (albüm, liste). shadow: bulunmamış tür için siyah gölge
  function canvasOf(inf, shadow) {
    const c = document.createElement('canvas');
    c.width = 22; c.height = 16;
    const x = c.getContext('2d');
    Scene.drawPet(x, 11, 15, inf, 0);
    if (shadow) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#14101e'; x.fillRect(0, 0, 22, 16); }
    c.className = 'pet-cv';
    return c;
  }

  function render() {
    giftEggs();
    const box = document.getElementById('petBody'), p = pet(), st = stage(), next = STAGES[st + 1];
    box.innerHTML = '';
    // Yanındaki
    const cur = document.createElement('div');
    cur.className = 'class-box pet-now';
    cur.append(canvasOf(info()));
    const txt = document.createElement('div');
    const left = next ? Math.max(1, Math.ceil(next.h * 60 - p.sec / 60)) : 0;
    txt.innerHTML = '<b></b><small></small><small></small>';
    txt.querySelector('b').textContent = title();
    txt.querySelectorAll('small')[0].textContent = p.species ? `${SPECIES[p.species].name} · ${STAGES[st].name}` : 'İçinden ne çıkacak, sürpriz!';
    txt.querySelectorAll('small')[1].textContent = next ? `${next.name} olmasına ${left < 60 ? left + ' dk' : Math.ceil(left / 60) + ' sa'} odak` : 'Tamamen büyüdü!';
    cur.append(txt);
    if (p.species) {
      const b = document.createElement('button');
      b.className = 'btn small'; b.textContent = 'Ad'; b.title = 'Adını değiştir'; b.onclick = rename;
      cur.append(b);
    }
    box.append(cur);

    // Yeni yumurta
    const egg = document.createElement('div');
    egg.className = 'pet-egg';
    egg.innerHTML = `<p class="room-msg">${!p.species ? 'Yanındaki yumurta çatlayınca yenisini alabilirsin.'
      : data.eggFree ? `${data.eggFree} hediye yumurtan var!` : 'Her yetişkin olan hayvan 1 yumurta hediye eder. İstersen altınla da alabilirsin.'}</p>`;
    const row = document.createElement('div');
    row.className = 'row';
    if (data.eggFree) {
      const b = document.createElement('button');
      b.className = 'btn small add'; b.textContent = 'Hediye yumurtayı al'; b.disabled = !p.species; b.onclick = () => takeEgg(false);
      row.append(b);
    }
    const buy = document.createElement('button');
    buy.className = 'btn small'; buy.textContent = `${EGG_PRICE} altına yumurta`;
    buy.disabled = !p.species || data.coins < EGG_PRICE;
    buy.onclick = () => takeEgg(true);
    row.append(buy);
    egg.append(row);
    box.append(egg);

    // Diğer hayvanların
    if (stable().length) {
      box.insertAdjacentHTML('beforeend', '<h3>Diğer hayvanların</h3>');
      const ul = document.createElement('ul');
      ul.className = 'pet-list';
      stable().forEach((q, i) => {
        const li = document.createElement('li');
        li.append(canvasOf(infoOf(q)));
        const s = document.createElement('span');
        s.textContent = `${titleOf(q)} · ${q.species ? STAGES[stageOf(q)].name : 'yumurta'}`;
        const b = document.createElement('button');
        b.className = 'btn small'; b.textContent = 'Yanına al'; b.onclick = () => choose(i);
        li.append(s, b);
        ul.append(li);
      });
      box.append(ul);
    }

    // Albüm
    const found = seen(), total = Object.keys(SPECIES).length;
    box.insertAdjacentHTML('beforeend', `<h3>Albüm <small>${found.length}/${total}</small></h3>`);
    const grid = document.createElement('div');
    grid.className = 'pet-album';
    for (const [k, s] of Object.entries(SPECIES)) {
      const has = found.includes(k), cell = document.createElement('div');
      cell.className = 'pet-card' + (has ? ' got' : '');
      cell.append(canvasOf({ species: k, stage: 3, cape: Scene.HOUSES[data.look.house]?.a }, !has));
      const n = document.createElement('small');
      n.textContent = has ? s.name : '???';
      cell.append(n);
      if (s.rare) { const r = document.createElement('i'); r.textContent = s.rare; cell.append(r); }
      grid.append(cell);
    }
    box.append(grid);

    // Balık defteri (kaledeki gölden)
    const FISH = Castle.FISH(), book = data.fishBook || {};
    box.insertAdjacentHTML('beforeend', `<h3>Balık defteri <small>${Object.keys(book).length}/${FISH.length}</small></h3>`);
    const fg = document.createElement('div');
    fg.className = 'pet-album';
    for (const f of FISH) {
      const n = book[f.id] || 0, cell = document.createElement('div');
      cell.className = 'pet-card' + (n ? ' got' : '');
      cell.append(fishCanvas(n ? f.col : '#14101e'));
      const s = document.createElement('small');
      s.textContent = n ? `${f.name} ×${n}` : '???';
      cell.append(s);
      if (f.rare) { const r = document.createElement('i'); r.textContent = f.rare; cell.append(r); }
      fg.append(cell);
    }
    box.append(fg);
    box.insertAdjacentHTML('beforeend', `<p class="room-msg">Molada iskelenin ucunda E ile balık tut (1 mola hakkı).${data.raceBest ? ` Halka yarışı rekorun: ${data.raceBest.toFixed(1)} sn.` : ''}</p>`);
  }

  // Küçük piksel balık (defter için)
  function fishCanvas(col) {
    const c = document.createElement('canvas');
    c.width = 22; c.height = 16;
    const x = c.getContext('2d'), p = (a, b, w, h, k) => { x.fillStyle = k; x.fillRect(a, b, w, h); };
    const dark = col === '#14101e', line = dark ? col : '#3a2a3e';
    p(4, 5, 10, 6, line); p(3, 6, 12, 4, line); p(14, 4, 4, 8, line); // dış çizgi
    p(5, 6, 8, 4, col); p(4, 7, 10, 2, col); p(15, 5, 2, 6, col); p(17, 4, 1, 2, col); p(17, 10, 1, 2, col);
    if (!dark) { p(6, 7, 1, 1, '#1a1420'); p(8, 9, 4, 1, 'rgba(255,255,255,0.35)'); p(9, 4, 3, 1, col); }
    c.className = 'pet-cv';
    return c;
  }

  // Kalede bahçede dolaşan diğer hayvanlar (en fazla 4)
  const roam = () => stable().filter(q => q.species).slice(0, 4).map(q => ({ id: q.id || titleOf(q), name: titleOf(q), info: infoOf(q) }));

  return { onFocus, info, click, setSad, title, render, roam };
})();
