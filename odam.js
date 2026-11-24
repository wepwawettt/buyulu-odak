// "Odam" sekmesine özel özellikler: ambiyans sesleri, tıklanabilir eşyalar, iksir demleme, derin odak.
// app.js'teki globalleri (data, save, render, toast, audio, mode, running, togglePanel...) çalışma anında kullanır.
const Odam = (() => {
  const $ = id => document.getElementById(id);

  // ---------- Ambiyans sesleri (dosya yok, Web Audio ile üretilir) ----------
  const AMB = { rain: 'Yağmur', fire: 'Şömine', night: 'Gece' };
  let master = null;
  const playing = {};

  function noise(c, sec, brown) {
    const buf = c.createBuffer(1, c.sampleRate * sec, c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return buf;
  }
  function loop(c, buf, chain) {
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    let node = src;
    for (const n of chain) node = node.connect(n);
    node.connect(master);
    src.start();
    return src;
  }
  function filter(c, type, freq, q = 0.7) { const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; return f; }
  function gain(c, v) { const g = c.createGain(); g.gain.value = v; return g; }

  const MAKERS = {
    rain(c) {
      const hiss = loop(c, noise(c, 2), [filter(c, 'bandpass', 1500, 0.4), filter(c, 'lowpass', 6000), gain(c, 0.32)]);
      const rumble = loop(c, noise(c, 2, true), [filter(c, 'lowpass', 400), gain(c, 0.25)]);
      // Ara sıra pencereye düşen damlalar
      const drip = setInterval(() => {
        const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime;
        o.frequency.setValueAtTime(1800 + Math.random() * 1600, t0);
        o.frequency.exponentialRampToValueAtTime(600, t0 + 0.05);
        g.gain.setValueAtTime(0.03, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
        o.connect(g).connect(master); o.start(t0); o.stop(t0 + 0.07);
      }, 260);
      return () => { hiss.stop(); rumble.stop(); clearInterval(drip); };
    },
    fire(c) {
      const roar = loop(c, noise(c, 2, true), [filter(c, 'lowpass', 500), gain(c, 0.5)]);
      const pop = noise(c, 0.05);
      let alive = true;
      (function crackle() {
        if (!alive) return;
        const s = c.createBufferSource(), g = c.createGain(), t0 = c.currentTime;
        s.buffer = pop;
        g.gain.setValueAtTime(0.05 + Math.random() * 0.25, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
        s.connect(filter(c, 'highpass', 1200 + Math.random() * 2000)).connect(g).connect(master);
        s.start(t0); s.stop(t0 + 0.05);
        setTimeout(crackle, 60 + Math.random() * 280);
      })();
      return () => { alive = false; roar.stop(); };
    },
    night(c) {
      const wind = loop(c, noise(c, 3, true), [filter(c, 'lowpass', 260), gain(c, 0.22)]);
      const chirp = setInterval(() => {
        for (let i = 0; i < 3; i++) {
          const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + i * 0.075;
          o.frequency.value = 4400 + Math.random() * 200;
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.025, t0 + 0.01); g.gain.linearRampToValueAtTime(0, t0 + 0.045);
          o.connect(g).connect(master); o.start(t0); o.stop(t0 + 0.05);
        }
      }, 900 + Math.random() * 400);
      return () => { wind.stop(); clearInterval(chirp); };
    },
  };

  function amb() { return (data.ambient ||= { rain: false, fire: false, night: false, vol: 60 }); }
  function applyAmbient() {
    const c = audio();
    if (!c) return;
    if (!master) { master = c.createGain(); master.connect(c.destination); }
    master.gain.value = (amb().vol / 100) * 0.9;
    for (const k of Object.keys(AMB)) {
      if (amb()[k] && !playing[k]) playing[k] = MAKERS[k](c);
      if (!amb()[k] && playing[k]) { playing[k](); delete playing[k]; }
    }
    renderBar();
  }
  function toggleAmbient(k) {
    amb()[k] = !amb()[k];
    audio()?.resume();
    applyAmbient();
    save();
    toast(`${AMB[k]} sesi ${amb()[k] ? 'açık' : 'kapalı'}`);
  }

  // ---------- İksir demleme (odak dakikalarıyla dolar) ----------
  // İksir = kalede molada toplanan malzemeler + odadaki odak süresi
  const POTIONS = [
    { id: 'wake', name: 'Uyanıklık İksiri', min: 25, color: '#7ae0c0', needs: { leaf: 1 }, desc: '25 dk odak · Bitince +2 altın.' },
    { id: 'gold', name: 'Sıvı Altın', min: 60, color: '#f0c040', needs: { leaf: 2, dust: 1 }, desc: '60 dk odak · Bitince +6 altın.' },
    { id: 'wisdom', name: 'Bilgelik İksiri', min: 90, color: '#b08ae0', needs: { leaf: 1, dust: 1, feather: 1 }, desc: '90 dk odak · Sonraki kale görevi ödülün 2 katı.' },
  ];
  const ING = { leaf: 'Ay Yaprağı', dust: 'Kristal Toz', feather: 'Baykuş Tüyü' };
  const pantry = () => (data.pantry ||= { leaf: 0, dust: 0, feather: 0 });
  const hasAll = p => Object.entries(p.needs).every(([k, n]) => pantry()[k] >= n);
  const needText = p => 'Gerekli: ' + Object.entries(p.needs).map(([k, n]) => `${ING[k]} ×${n} (${Math.min(pantry()[k], n)}/${n})`).join(', ');
  const potion = () => data.brew && POTIONS.find(p => p.id === data.brew.id);
  const known = () => (data.recipes ||= ['wake']);
  // Sıradaki öğrenilebilir tarif: 'gold' | 'wisdom' | 'wait' (önce bir iksir içmeli) | null (hepsi biliniyor)
  function nextRecipe() {
    if (!known().includes('gold')) return 'gold';
    if (!known().includes('wisdom')) return (data.potionsMade || 0) >= 1 ? 'wisdom' : 'wait';
    return null;
  }
  function learnRecipe() {
    const id = nextRecipe();
    if (id !== 'gold' && id !== 'wisdom') return null;
    known().push(id);
    save(); renderBrew();
    return POTIONS.find(p => p.id === id);
  }
  // Kaledeki kazanların söylediği: odadaki demlemenin durumu
  function brewStatus() {
    const p = potion();
    if (!p) return 'Bu kazanlar ders için. Kendi iksirini odandaki şişede demle!';
    if (brewDone()) return `Odandaki ${p.name} hazır! Odana dönüp iç.`;
    return `Odandaki ${p.name} %${Math.round(100 * data.brew.sec / (p.min * 60))} demlendi. Odaklandıkça dolar.`;
  }
  const brewDone = () => potion() && data.brew.sec >= potion().min * 60;

  function onFocus(sec) {
    if (!potion() || brewDone()) return;
    data.brew.sec += sec;
    if (brewDone()) { toast(`${potion().name} hazır! Odandaki iksir şişesine tıkla.`); renderBrew(); }
    syncScene();
  }
  function startBrew(id) {
    const p = POTIONS.find(q => q.id === id);
    if (!hasAll(p)) return toast('Malzemen eksik: molada kalede parıldayan yerlerden topla.');
    for (const [k, n] of Object.entries(p.needs)) pantry()[k] -= n;
    data.brew = { id, sec: 0 };
    save(); renderBrew(); syncScene();
    toast(`${potion().name} demlenmeye başladı. Odaklandıkça dolacak.`);
  }
  function collect() {
    const p = potion();
    if (!p || !brewDone()) return;
    let msg;
    if (p.id === 'wake') { data.coins += 2; msg = '+2 altın'; }
    if (p.id === 'gold') { data.coins += 6; msg = '+6 altın'; }
    if (p.id === 'wisdom') { data.wisdom = true; msg = 'Sonraki kale görevi ödülün 2 katı!'; }
    data.brew = null;
    data.potionsMade = (data.potionsMade || 0) + 1;
    save(); render(); renderBrew(); syncScene();
    toast(`${p.name} içildi: ${msg}`);
  }
  function syncScene() {
    const p = potion();
    Scene.setBrew(p ? { level: Math.min(1, data.brew.sec / (p.min * 60)), color: p.color, done: brewDone() } : null);
  }
  function renderBrew() {
    const box = $('brewBody');
    if (!box) return;
    box.innerHTML = '';
    const p = potion();
    if (data.wisdom) box.insertAdjacentHTML('beforeend', '<p class="brew-buff">✦ Bilgelik etkin: sonraki kale görevinin ödülü 2 kat.</p>');
    if (p) {
      const pct = Math.min(100, Math.round(100 * data.brew.sec / (p.min * 60)));
      const div = document.createElement('div');
      div.className = 'brew-now';
      div.innerHTML = `<b></b><div class="bar"><div style="width:${pct}%;background:${p.color}"></div></div><small></small>`;
      div.querySelector('b').textContent = p.name;
      div.querySelector('small').textContent = brewDone() ? 'Hazır!' : `${Math.floor(data.brew.sec / 60)} / ${p.min} dk odak · odaklandıkça dolar`;
      box.appendChild(div);
      const b = document.createElement('button');
      b.className = 'btn small add';
      b.textContent = brewDone() ? 'İksiri iç' : 'Demleniyor…';
      b.disabled = !brewDone();
      b.onclick = collect;
      box.appendChild(b);
      return;
    }
    const pan = document.createElement('div');
    pan.className = 'pantry';
    pan.innerHTML = '<b>Malzemelerin</b><span></span><small>Molada kalede parıldayan yerlerden topla: seradaki saksılar (Ay Yaprağı), zindandaki kavanozlar (Kristal Toz), baykuşhanedeki tünekler (Baykuş Tüyü). Her nokta günde bir kez.</small>';
    pan.querySelector('span').textContent = Object.keys(ING).map(k => `${ING[k]} ${pantry()[k]}`).join(' · ');
    box.appendChild(pan);
    box.insertAdjacentHTML('beforeend', '<p class="room-msg">Malzemeleri kazana koy; iksir odak süresiyle demlenir. Aynı anda bir iksir.</p>');
    for (const q of POTIONS) {
      const ok = known().includes(q.id);
      const row = document.createElement('div');
      row.className = 'item' + (ok ? '' : ' locked');
      row.innerHTML = `<i class="potion-dot" style="background:${q.color}"></i><div><b></b><small></small></div>`;
      row.querySelector('b').textContent = q.name;
      row.querySelector('small').textContent = ok ? `${q.desc} ${needText(q)}`
        : q.id === 'wisdom' && nextRecipe() !== 'wisdom'
          ? 'Kilitli: önce bir iksiri demleyip iç, sonra kaledeki iksir zindanında Professor Ashdown öğretir.'
          : 'Kilitli: tarifini kaledeki iksir zindanında Professor Ashdown öğretir (molada uğra).';
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = !ok ? 'Kilitli' : hasAll(q) ? 'Demle' : 'Malzeme eksik';
      b.disabled = !ok || !hasAll(q);
      b.onclick = () => startBrew(q.id);
      row.appendChild(b);
      box.appendChild(row);
    }
  }

  // ---------- Tıklanabilir eşyalar ----------
  // Sahne 160x120 mantıksal piksel; alanlar [x0, y0, x1, y1]
  const SPOTS = [
    { area: [116, 15, 128, 27], label: 'Baykuş · ortak oda', act: () => togglePanel(roomDlg, Room.renderPanel) },
    { area: [107, 66, 120, 81], label: 'İksir şişesi · iksir demle', act: () => togglePanel($('brewDlg'), renderBrew) },
    { area: [2, 80, 28, 108], label: 'Kazan · iksir demle', act: () => togglePanel($('brewDlg'), renderBrew), when: () => data.equipped.includes('cauldron') },
    { area: [10, 10, 48, 64], label: 'Pencere · yağmur sesi', act: () => toggleAmbient('rain') },
    { area: [20, 0, 34, 16], label: 'Mum · şömine sesi', act: () => toggleAmbient('fire') },
    { area: [54, 10, 64, 26], label: 'Mum · şömine sesi', act: () => toggleAmbient('fire') },
    { area: [94, 2, 104, 20], label: 'Mum · şömine sesi', act: () => toggleAmbient('fire') },
    { area: [136, 4, 146, 22], label: 'Mum · şömine sesi', act: () => toggleAmbient('fire') },
    { area: [114, 26, 152, 92], label: 'Kitaplık · haftalık istatistik', act: () => jump(document.querySelector('.stats')) },
    { area: [44, 44, 96, 80], label: 'Sen · karakter ve kıyafet', act: () => togglePanel(charDlg, buildCharOptions) },
    { area: [32, 82, 128, 100], label: 'Masa · görevlerin', act: () => { jump(document.querySelector('.tasks')); setTimeout(() => $('taskInput').focus(), 400); } },
  ];
  function jump(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
  function spotAt(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 160, y = (e.clientY - r.top) / r.height * 120;
    return SPOTS.find(s => (!s.when || s.when()) && x >= s.area[0] && x <= s.area[2] && y >= s.area[1] && y <= s.area[3]);
  }

  // ---------- Odaya özel şerit ve derin odak ----------
  function renderBar() {
    document.querySelectorAll('#roomBar [data-amb]').forEach(b => b.classList.toggle('on', !!amb()[b.dataset.amb]));
    $('ambVol').value = amb().vol;
    $('deepBtn').classList.toggle('on', !!data.deep);
    $('brewBtn').textContent = brewDone() ? 'İksir hazır!' : potion() ? `İksir %${Math.min(100, Math.round(100 * data.brew.sec / (potion().min * 60)))}` : 'İksir demle';
  }
  let lastBrewDraw = 0;
  let deepSkip = false; // Esc ile bu odak oturumu için derin odaktan çıkıldı
  // render() her çağrıldığında: derin odak yalnızca odada ve odak sürerken
  function sync() {
    const focusOn = running && mode === 'focus';
    if (!focusOn) deepSkip = false;
    document.body.classList.toggle('deep', !!data.deep && !deepSkip && focusOn && data.view !== 'castle');
    if ($('roomBar')) renderBar();
    // Kazan paneli açıksa demleme ilerlemesini ara ara tazele
    if (potion() && $('brewDlg')?.open && Date.now() - lastBrewDraw > 2000) { lastBrewDraw = Date.now(); renderBrew(); }
  }

  function init() {
    const scene = $('scene'), tip = $('sceneTip');
    scene.addEventListener('mousemove', e => {
      const s = spotAt(e);
      scene.style.cursor = s ? 'pointer' : 'default';
      tip.hidden = !s;
      if (s) {
        const r = scene.getBoundingClientRect(), fr = scene.parentElement.getBoundingClientRect();
        tip.textContent = s.label;
        tip.style.left = (e.clientX - fr.left) + 'px';
        tip.style.top = (e.clientY - fr.top - 14) + 'px';
      }
    });
    scene.addEventListener('mouseleave', () => { tip.hidden = true; });
    scene.addEventListener('click', e => { const s = spotAt(e); if (s) { tip.hidden = true; s.act(); } });

    document.querySelectorAll('#roomBar [data-amb]').forEach(b => (b.onclick = () => toggleAmbient(b.dataset.amb)));
    $('ambVol').oninput = e => { amb().vol = +e.target.value; if (master) master.gain.value = (amb().vol / 100) * 0.9; };
    $('ambVol').onchange = save;
    $('brewBtn').onclick = () => togglePanel($('brewDlg'), renderBrew);
    $('deepBtn').onclick = () => {
      data.deep = !data.deep; save(); sync();
      toast(data.deep ? 'Derin odak açık: odadayken odak sürerken her şey kararır.' : 'Derin odak kapalı');
    };
    $('brewDlg').querySelector('[data-close]').onclick = () => $('brewDlg').close();
    addEventListener('keydown', e => {
      if (e.code === 'Escape' && document.body.classList.contains('deep')) { deepSkip = true; sync(); toast('Bu oturum için derin odaktan çıkıldı'); }
    });

    // Kayıtlı sesler: tarayıcı ilk tıklama/tuştan önce ses çalmaya izin vermez
    const kick = () => { removeEventListener('pointerdown', kick); removeEventListener('keydown', kick); audio()?.resume(); applyAmbient(); };
    addEventListener('pointerdown', kick); addEventListener('keydown', kick);
    syncScene();
    renderBar();
  }

  return { init, sync, onFocus, renderBrew, nextRecipe, learnRecipe, brewStatus };
})();
