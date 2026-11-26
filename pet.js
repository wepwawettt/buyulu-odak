// Evcil hayvan: herkes bir yumurtayla başlar. 1 saat odakta çatlar, içinden rastgele bir yaratık çıkar
// (sürpriz) ve odaklandıkça büyür. 2 gün çalışılmazsa uykuya dalar. Odada ve kalede (peşinden) görünür.
// data.pet = { sec: evlat edinildiğinden beri odak saniyesi, species, name, last: son odak günü }
const Pet = (() => {
  const SPECIES = { tilki: 'Ay tilkisi', pofuduk: 'Pofuduk', kurbaga: 'Kurbağa', tavsan: 'Tavşan' };
  const STAGES = [
    { name: 'Yumurta', h: 0 }, { name: 'Yavru', h: 1 }, { name: 'Genç', h: 10 }, { name: 'Yetişkin', h: 30 },
  ];
  const pet = () => (data.pet ||= { sec: 0, species: null, name: '', last: todayKey() });
  const stage = () => STAGES.reduce((s, st, i) => (pet().sec >= st.h * 3600 ? i : s), 0);
  const daysAway = () => Math.round((new Date(todayKey() + 'T12:00') - new Date(pet().last + 'T12:00')) / 864e5);
  let sad = false, sadTimer; // odak koruyucu: sekmeden uzun ayrılınca bir süre üzgün (kaydedilmez)
  function setSad(v) {
    sad = v;
    clearTimeout(sadTimer);
    if (v) sadTimer = setTimeout(() => (sad = false), 10 * 60000);
  }
  const title = () => pet().name || SPECIES[pet().species] || 'Yumurta';

  // app.js addFocus her odak saniyesinde çağırır
  function onFocus(sec) {
    const p = pet(), before = stage();
    p.sec += sec;
    p.last = todayKey();
    const now = stage();
    if (now === before) return;
    if (now === 1 && !p.species) {
      const keys = Object.keys(SPECIES);
      p.species = keys[Math.floor(Math.random() * keys.length)];
      toastLater(`Yumurtan çatladı! İçinden bir ${SPECIES[p.species]} çıktı! Odandaki yavruya tıklayıp ona ad koy.`);
    } else toastLater(`${title()} büyüdü: artık ${STAGES[now].name}!`);
    try { chime(); } catch {}
  }

  // Çizim için (Scene.drawPet)
  function info() {
    const p = pet();
    return { species: p.species, stage: p.species ? stage() : 0, sleepy: daysAway() >= 2, sad, cape: Scene.HOUSES[data.look.house]?.a };
  }

  // Odadaki hayvana tıklanınca: ilk seferde ad sorulur, sonra durumu söylenir
  function click() {
    const p = pet(), st = stage();
    if (!p.species) {
      const left = Math.max(1, Math.ceil((3600 - p.sec) / 60));
      return toast(`Bir yumurta! Çatlaması için ${left} dk daha odaklan. İçinden ne çıkacak, sürpriz!`);
    }
    if (!p.name) {
      const name = (prompt(`${SPECIES[p.species]} yavrusuna bir ad koy:`) || '').trim().slice(0, 14);
      if (name) { p.name = name; save(); toast(`Merhaba ${name}!`); }
      return;
    }
    if (daysAway() >= 2) return toast(`${p.name} uyuyor… Bir oturum bitir, uyansın!`);
    if (sad) return toast(`${p.name} biraz üzgün; sen yokken seni bekledi. Birlikte bir oturum bitirin, keyfi yerine gelsin.`);
    const next = STAGES[st + 1];
    toast(next ? `${p.name} (${SPECIES[p.species]}) · ${STAGES[st].name} · ${next.name} olmasına ${Math.ceil(next.h - p.sec / 3600)} sa odak kaldı`
      : `${p.name} (${SPECIES[p.species]}) tamamen büyüdü. Seninle gurur duyuyor!`);
  }

  return { onFocus, info, click, setSad, title };
})();
