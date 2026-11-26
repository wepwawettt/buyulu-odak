// "Odam" sekmesine özel özellikler: ambiyans sesleri, tıklanabilir eşyalar, iksir demleme, derin odak.
// app.js'teki globalleri (data, save, render, toast, audio, mode, running, togglePanel...) çalışma anında kullanır.
const Odam = (() => {
  const $ = id => document.getElementById(id);

  // ---------- Ambiyans sesleri (dosya yok, Web Audio ile üretilir) ----------
  const AMB = { rain: 'Yağmur', fire: 'Şömine', night: 'Gece', lofi: 'Müzik' };
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
    // Sakin lo-fi: yumuşak piyano akorları, bas, hafif davul, ara sıra melodi ve plak cızırtısı (hepsi anlık üretilir)
    lofi(c) {
      const bus = gain(c, 0.55);
      bus.connect(filter(c, 'lowpass', 2600)).connect(master);
      const crackle = loop(c, noise(c, 2), [filter(c, 'highpass', 3000), gain(c, 0.012)]);
      const BEAT = 60 / 72;
      const hz = m => 440 * 2 ** ((m - 69) / 12);
      // Fmaj7 – Em7 – Dm7 – Cmaj7 (MIDI notaları)
      const CHORDS = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
      const SCALE = [72, 74, 76, 79, 81]; // do pentatonik, melodi için
      const pop = noise(c, 0.25);
      function note(m, t0, len, vol, type = 'sine') {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = hz(m);
        o.detune.value = (Math.random() - 0.5) * 8; // eski kaset gibi hafif kayık
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, t0 + len);
        o.connect(g).connect(bus); o.start(t0); o.stop(t0 + len + 0.05);
      }
      function hit(t0, f, len, vol, type) {
        const s = c.createBufferSource(), g = c.createGain();
        s.buffer = pop;
        g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0008, t0 + len);
        s.connect(filter(c, type, f, 0.8)).connect(g).connect(bus); s.start(t0); s.stop(t0 + len + 0.02);
      }
      function kick(t0) {
        const o = c.createOscillator(), g = c.createGain();
        o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + 0.18);
        g.gain.setValueAtTime(0.5, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
        o.connect(g).connect(bus); o.start(t0); o.stop(t0 + 0.32);
      }
      let bar = 0, next = c.currentTime + 0.2;
      // Her çağrıda önümüzdeki ölçüleri zamanlar (tarayıcı sekmesi arkadayken de akmaya devam eder)
      function schedule() {
        while (next < c.currentTime + 3) {
          const ch = CHORDS[bar % 4], t0 = next;
          for (const [b, v] of [[0, 0.05], [1.5, 0.035], [2.5, 0.04]]) {
            ch.forEach((m, i) => note(m, t0 + b * BEAT + i * 0.012 + Math.random() * 0.02, BEAT * 1.8, v, i ? 'sine' : 'triangle'));
          }
          note(ch[0] - 12, t0, BEAT * 1.6, 0.16); note(ch[0] - 12, t0 + 2 * BEAT, BEAT * 1.4, 0.12);
          for (let i = 0; i < 4; i++) {
            const b = t0 + i * BEAT;
            if (i % 2 === 0) kick(b);
            else hit(b, 1800, 0.18, 0.13, 'bandpass');
            hit(b, 7000, 0.04, 0.035, 'highpass');
            hit(b + BEAT * 0.58, 7000, 0.03, 0.02, 'highpass'); // sallantılı hi-hat
          }
          if (bar % 4 === 1 && Math.random() < 0.3) kick(t0 + 2.5 * BEAT);
          for (let i = 0; i < 8; i++) if (Math.random() < 0.18) {
            note(SCALE[Math.floor(Math.random() * SCALE.length)], t0 + i * BEAT / 2, BEAT, 0.05, 'triangle');
          }
          bar++;
          next += 4 * BEAT;
        }
      }
      schedule();
      const timer = setInterval(schedule, 500);
      return () => { clearInterval(timer); crackle.stop(); bus.disconnect(); };
    },
  };

  // ---------- Kale müziği: üç özgün parça (haritanın altındaki düğmelerle seçilir) ----------
  // Her parça ölçü ölçü zamanlanır: bar(ölçü, t0, tur, çalgılar). Notalar MIDI, süreler "birim" cinsinden.
  const TRACKS = [
    { // Müzik kutusu: La minör, yavaş 6/8 ninni. Arpej + seyrek çınlayan melodi
      name: 'Müzik Kutusu', unit: 0.24, len: 6,
      bars: [
        [[57, 60, 64, 69], [[88, 3], [84, 3]]],
        [[57, 62, 65, 69], [[86, 3], [81, 2], [84, 1]]],
        [[56, 59, 62, 64], [[83, 3], [80, 3]]],
        [[57, 60, 64, 69], [[81, 6]]],
        [[57, 60, 65, 69], [[84, 2], [86, 1], [88, 3]]],
        [[57, 62, 65, 69], [[89, 3], [86, 3]]],
        [[56, 59, 64, 68], [[88, 2], [83, 1], [80, 3]]],
        [[56, 59, 62, 64], [[80, 3], [83, 3]]],
      ],
      bar([ch, mel], t0, loop, I) {
        [0, 2, 1, 3, 2, 1].forEach((k, j) => I.box(ch[k], t0 + j * this.unit, 1.1, 0.05));
        let at = 0;
        for (const [m, d] of mel) {
          I.box(m, t0 + at * this.unit, 1.6, 0.12);
          if (loop % 2) I.box(m - 12, t0 + at * this.unit + 0.01, 1.2, 0.05); // ikinci turda alttan eşlik
          at += d;
        }
        I.pad(ch.map(m => m - 12), t0, this.len * this.unit, 0.018);
      },
    },
    { // Gizemli koridor: Re minör, ağır 4/4. Yumuşak yaylı zemin, pizzicato bas, arp ve çelesta
      name: 'Gizemli Koridor', unit: 0.62, len: 4,
      bars: [
        [[50, 53, 57], 38, [[74, 1], [77, 1], [81, 2]]],
        [[50, 53, 58], 34, [[82, 1.5], [81, 0.5], [77, 2]]],
        [[50, 55, 58], 43, [[79, 1], [82, 1], [86, 1], [85, 1]]],
        [[49, 52, 55, 57], 33, [[81, 4]]],
        [[50, 53, 57], 38, [[86, 1], [85, 1], [86, 1], [89, 1]]],
        [[50, 53, 58], 34, [[86, 2], [82, 2]]],
        [[50, 55, 58], 43, [[79, 1], [77, 1], [76, 1], [79, 1]]],
        [[49, 52, 55, 57], 33, [[73, 2], [76, 1], [81, 1]]],
      ],
      bar([ch, bass, mel], t0, loop, I) {
        const u = this.unit;
        I.pad(ch, t0, 4 * u, 0.05);
        I.pluck(bass, t0, 0.5, 0.22); I.pluck(bass + 7, t0 + 2 * u, 0.4, 0.14);
        const arp = [...ch.map(m => m + 12), ...ch.map(m => m + 24)];
        for (let j = 0; j < 8; j++) I.harp(arp[j % arp.length], t0 + j * u / 2, 0.6, 0.03);
        let at = 0;
        for (const [m, d] of mel) { I.bell(m, t0 + at * u, d * u * 1.3, 0.1); at += d; }
      },
    },
    { // Neşeli şato: Do lidya, hızlı 8-bit macera. Kare dalga melodi, üçgen bas, gürültü davul
      name: 'Neşeli Şato', unit: 0.19, len: 8,
      bars: [
        [[60, 64, 67], 36, [[72, 1], [76, 1], [79, 2], [78, 1], [79, 1], [81, 2]]],
        [[62, 66, 69], 38, [[81, 2], [78, 2], [74, 4]]],
        [[64, 67, 71], 40, [[76, 1], [79, 1], [83, 2], [81, 1], [79, 1], [76, 2]]],
        [[57, 60, 64], 33, [[81, 3], [79, 1], [76, 4]]],
        [[60, 64, 67], 36, [[84, 2], [83, 1], [81, 1], [79, 2], [78, 2]]],
        [[62, 66, 69], 38, [[78, 1], [79, 1], [81, 2], [86, 4]]],
        [[55, 59, 62], 31, [[83, 2], [81, 1], [79, 1], [78, 2], [74, 2]]],
        [[60, 64, 67], 36, [[76, 2], [79, 2], [84, 4]]],
      ],
      bar([ch, bass, mel], t0, loop, I) {
        const u = this.unit;
        for (let j = 0; j < 8; j++) {
          I.tri(bass + (j % 2 ? 12 : 0), t0 + j * u, u * 0.9, 0.16);
          if (j % 2) I.hat(t0 + j * u, 0.03);
          if (j === 0 || j === 4) I.drum(t0 + j * u);
          if (j === 2 || j === 6) I.hat(t0 + j * u, 0.06, 0.09);
        }
        for (const b of [1, 3, 5, 7]) ch.forEach(m => I.chip(m, t0 + b * u, u * 0.6, 0.02));
        let at = 0;
        for (const [m, d] of mel) { I.chip(m + (loop % 2 ? 12 : 0), t0 + at * u, d * u * 0.85, 0.07); at += d; }
      },
    },
  ];
  function castleMusic(c, track) {
    const bus = gain(c, 0), hz = m => 440 * 2 ** ((m - 69) / 12);
    bus.gain.linearRampToValueAtTime(0.8, c.currentTime + 1.5); // yavaşça açılır
    const dry = filter(c, 'lowpass', 4200);
    bus.connect(dry).connect(master);
    // Taş salon yankısı
    const delay = c.createDelay(1), fb = gain(c, 0.28), wet = gain(c, 0.22);
    delay.delayTime.value = 0.36;
    dry.connect(delay).connect(fb).connect(delay);
    delay.connect(wet).connect(master);
    const soft = filter(c, 'lowpass', 900); soft.connect(bus); // yaylı zemin için yumuşatıcı
    const hiss = noise(c, 0.3);
    function tone(m, t0, len, vol, type, mult = 1, attack = 0.006, out = bus) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.value = hz(m) * mult;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + attack);
      g.gain.exponentialRampToValueAtTime(0.0006, t0 + Math.max(len, attack + 0.05));
      o.connect(g).connect(out); o.start(t0); o.stop(t0 + Math.max(len, attack + 0.05) + 0.05);
    }
    const I = {
      box: (m, t, len, v) => { tone(m, t, len, v, 'sine'); tone(m, t, len * 0.25, v * 0.3, 'sine', 3); },
      bell: (m, t, len, v) => { tone(m, t, len, v, 'triangle'); tone(m, t, 0.4, v * 0.3, 'sine', 4); },
      harp: (m, t, len, v) => tone(m, t, len, v, 'triangle'),
      pluck: (m, t, len, v) => tone(m, t, len, v, 'triangle'),
      pad: (ch, t, len, v) => ch.forEach(m => tone(m, t, len, v, 'sawtooth', 1, len * 0.4, soft)),
      tri: (m, t, len, v) => tone(m, t, len, v, 'triangle'),
      chip: (m, t, len, v) => tone(m, t, len, v, 'square', 1, 0.004),
      hat(t, v, len = 0.03) {
        const n = c.createBufferSource(), g = c.createGain();
        n.buffer = hiss; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0006, t + len);
        n.connect(filter(c, 'highpass', 6000)).connect(g).connect(bus); n.start(t); n.stop(t + len + 0.02);
      },
      drum(t) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
        g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.connect(g).connect(bus); o.start(t); o.stop(t + 0.2);
      },
    };
    let bar = 0, loopN = 0, next = c.currentTime + 0.3;
    function schedule() {
      while (next < c.currentTime + 3) {
        track.bar(track.bars[bar], next, loopN, I);
        next += track.len * track.unit;
        if (++bar === track.bars.length) { bar = 0; loopN++; }
      }
    }
    schedule();
    const timer = setInterval(schedule, 500);
    return () => {
      clearInterval(timer);
      const t = c.currentTime;
      bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(0, t + 0.8);
      setTimeout(() => { bus.disconnect(); wet.disconnect(); }, 3500); // yankı sönsün
    };
  }
  let castleStop = null, castlePlaying = -1;
  const castleOn = () => data.castleMusic !== false;
  const trackNo = () => (data.castleTrack ?? 0) % TRACKS.length;
  const trackLabel = () => `Parça: ${TRACKS[trackNo()].name} ›`;
  // Kaledeyken ve odak sürmüyorken çalar; odadaki lo-fi açıksa onunla karışmasın diye susar
  function syncCastleMusic() {
    const want = data.view === 'castle' && castleOn() && !(running && mode === 'focus') && !amb().lofi;
    if (castleStop && (!want || castlePlaying !== trackNo())) { castleStop(); castleStop = null; }
    if (want && !castleStop) {
      const c = audio(); if (!c) return;
      ensureMaster(c);
      castleStop = castleMusic(c, TRACKS[trackNo()]);
      castlePlaying = trackNo();
    }
    $('castleTrackBtn').textContent = trackLabel();
    $('castleMusicBtn')?.classList.toggle('on', castleOn());
  }

  function amb() { return (data.ambient ||= { rain: false, fire: false, night: false, vol: 60 }); }
  function ensureMaster(c) {
    if (!master) { master = c.createGain(); master.connect(c.destination); }
    master.gain.value = (amb().vol / 100) * 0.9;
  }
  function applyAmbient() {
    const c = audio();
    if (!c) return;
    ensureMaster(c);
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
    { id: 'gold', name: 'Sıvı Altın', min: 60, color: '#f0c040', needs: { leaf: 2, dust: 1 }, desc: '60 dk odak · Bitince +4 altın.' },
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
  // Demlemeyi iptal et: malzemeler geri gelir
  function cancelBrew() {
    const p = potion();
    if (!p || brewDone()) return;
    if (data.brew.sec >= 60 && !confirm(`${p.name} %${Math.round(100 * data.brew.sec / (p.min * 60))} doldu. Vazgeçersen bu ilerleme silinir, malzemeler geri gelir. Emin misin?`)) return;
    for (const [k, n] of Object.entries(p.needs)) pantry()[k] += n;
    data.brew = null;
    save(); renderBrew(); syncScene(); renderBar();
    toast(`${p.name} demlemesinden vazgeçildi, malzemeler geri geldi.`);
  }
  function collect() {
    const p = potion();
    if (!p || !brewDone()) return;
    let msg;
    if (p.id === 'wake') { data.coins += 2; msg = '+2 altın'; }
    if (p.id === 'gold') { data.coins += 4; msg = '+4 altın'; }
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
      b.textContent = brewDone() ? 'İksiri iç' : 'Vazgeç';
      b.onclick = brewDone() ? collect : cancelBrew;
      box.appendChild(b);
      return;
    }
    const pan = document.createElement('div');
    pan.className = 'pantry';
    pan.innerHTML = '<b>Malzemelerin</b><span></span><small>Molada kalede parıldayan yerlerden topla: seradaki saksılar (Ay Yaprağı), zindandaki kavanozlar (Kristal Toz), baykuşhanedeki tünekler (Baykuş Tüyü). Her nokta günde bir kez; kilerde her malzemeden en fazla 3 tutulur.</small>';
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
    { area: [4, 100, 27, 119], label: 'Evcil hayvanın', act: () => Pet.click() },
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
    $('castleVol').value = amb().vol;
    $('castleMusicBtn').classList.toggle('on', castleOn());
    $('castleTrackBtn').textContent = trackLabel();
    $('autoWalkBtn').classList.toggle('on', !!data.autoWalk);
    $('deepBtn').classList.toggle('on', !!data.deep);
    $('brewBtn').textContent = brewDone() ? 'İksir hazır!' : potion() ? `İksir %${Math.min(100, Math.round(100 * data.brew.sec / (potion().min * 60)))}` : 'İksir demle';
  }
  let lastBrewDraw = 0, unlocked = false; // ses ilk tıklamadan sonra açılabilir
  let deepSkip = false; // Esc ile bu odak oturumu için derin odaktan çıkıldı
  // render() her çağrıldığında: derin odak yalnızca odada ve odak sürerken
  function sync() {
    const focusOn = running && mode === 'focus';
    if (!focusOn) deepSkip = false;
    document.body.classList.toggle('deep', !!data.deep && !deepSkip && focusOn && data.view !== 'castle');
    if ($('roomBar')) renderBar();
    if (unlocked) syncCastleMusic();
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
    $('castleVol').oninput = $('ambVol').oninput;
    $('castleVol').onchange = save;
    $('autoWalkBtn').onclick = () => {
      data.autoWalk = !data.autoWalk; save(); renderBar();
      toast(data.autoWalk ? 'Karakterin molada kalede kendi kendine gezecek. Bir tuşa basınca kontrol sende.' : 'Kendi kendine gezinti kapalı');
    };
    $('castleTrackBtn').onclick = () => {
      data.castleTrack = (trackNo() + 1) % TRACKS.length;
      data.castleMusic = true;
      save(); syncCastleMusic();
      toast(`Kale müziği: ${TRACKS[trackNo()].name}`);
    };
    $('castleMusicBtn').onclick = () => {
      data.castleMusic = !castleOn(); save(); syncCastleMusic();
      toast(castleOn() ? (amb().lofi ? 'Kale müziği açık (odadaki lo-fi açıkken susar)' : 'Kale müziği açık') : 'Kale müziği kapalı');
    };
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
    const kick = () => { removeEventListener('pointerdown', kick); removeEventListener('keydown', kick); audio()?.resume(); unlocked = true; applyAmbient(); syncCastleMusic(); };
    addEventListener('pointerdown', kick); addEventListener('keydown', kick);
    syncScene();
    renderBar();
  }

  // Görünüm değişince (oda ↔ kale) müzik hemen başlasın/sussun
  const music = () => { if (unlocked) syncCastleMusic(); };

  return { init, sync, music, onFocus, renderBrew, nextRecipe, learnRecipe, brewStatus };
})();
