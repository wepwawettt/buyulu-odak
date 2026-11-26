// Kış Şenliği: her yıl Aralık boyunca. Bitirilen her odak oturumu 1 kar tanesi;
// belli sayılarda yalnızca şenlikte kazanılan ödüller açılır (dükkanda satılmaz).
// data.fest = { year, flakes, hello }  (yeni yılda sıfırlanır; ödüller kalıcıdır)
const Fest = (() => {
  const GOALS = [
    { n: 8, kind: 'item', id: 'snowman', name: 'Kardan Adam' },
    { n: 20, kind: 'outfit', id: 'ayaz', name: 'Ayaz Cübbesi' },
    { n: 40, kind: 'theme', id: 'buz', name: 'Buz Sarayı oda teması' },
  ];
  const active = (d = new Date()) => d.getMonth() === 11;
  function state() {
    const y = new Date().getFullYear();
    if (data.fest?.year !== y) data.fest = { year: y, flakes: 0 };
    return data.fest;
  }
  const owns = g => (g.kind === 'item' ? data.owned : g.kind === 'outfit' ? data.outfits : data.themes).includes(g.id);

  function grant(g) {
    if (owns(g)) { // geçen yıl kazanılmışsa altın verilir
      data.coins += 5;
      return toastLater(`${g.n} kar tanesi! ${g.name} zaten sende: +5 altın`);
    }
    if (g.kind === 'item') { data.owned.push(g.id); data.equipped.push(g.id); Scene.setItems(data.equipped); }
    else if (g.kind === 'outfit') data.outfits.push(g.id);
    else data.themes.push(g.id);
    toastLater(`${g.n} kar tanesi! ${g.name} senin oldu. Dükkanda seni bekliyor.`);
  }

  // app.js completeFocus her odak oturumunda çağırır
  function onSession() {
    if (!active()) return;
    const s = state();
    s.flakes++;
    for (const g of GOALS) if (s.flakes === g.n) grant(g);
    render();
  }

  // Rozetler panelindeki kutu ve üstteki kar tanesi sayacı
  function render() {
    const on = active(), chip = document.getElementById('festChip'), box = document.getElementById('festBox');
    chip.hidden = box.hidden = !on;
    if (!on) return;
    const s = state(), next = GOALS.find(g => s.flakes < g.n);
    document.getElementById('festCount').textContent = s.flakes;
    chip.title = `Kış Şenliği: ${s.flakes} kar tanesi` + (next ? ` · ${next.name} için ${next.n - s.flakes} oturum daha` : ' · bütün ödüller açıldı!');
    const left = new Date(s.year, 11, 31).getDate() - new Date().getDate();
    box.innerHTML = `<b>❄ Kış Şenliği</b><small>Aralık boyunca her odak oturumu 1 kar tanesi. ${left ? `Bitmesine ${left + 1} gün var.` : 'Bugün son gün!'}</small>
      <div class="bar"><div style="width:${Math.min(100, 100 * s.flakes / GOALS.at(-1).n)}%"></div></div><ul class="class-list"></ul>`;
    const ul = box.querySelector('ul');
    for (const g of GOALS) {
      const li = document.createElement('li');
      li.className = s.flakes >= g.n ? 'got' : '';
      li.textContent = `${g.n} ❄ ${g.name}`;
      ul.appendChild(li);
    }
  }

  function init() {
    render();
    if (!active()) return;
    const s = state();
    if (!s.hello) {
      s.hello = true;
      save();
      toastLater('Kış Şenliği başladı! Aralık boyunca her odak oturumu bir kar tanesi. Ödüller Rozetler panelinde.');
    }
  }

  return { active, onSession, render, init };
})();
