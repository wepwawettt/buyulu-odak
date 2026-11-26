// Yıl özeti: yılın odak kaydını kart kart gösterir, sonunda paylaşılabilir bir resim üretir.
// Ocak'ta geçen yılı, diğer aylarda bu yılı özetler. İstatistik panelindeki "Yıl özeti" düğmesiyle açılır.
const Recap = (() => {
  const MONTHS = Array.from({ length: 12 }, (_, m) => new Date(2000, m, 15).toLocaleDateString('tr', { month: 'long' }));
  const WEEKDAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const year = () => { const d = new Date(); return d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear(); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const hm = sec => fmtMin(Math.floor(sec / 60));

  function stats(y) {
    const s = { y, sec: 0, pomos: 0, days: 0, notes: 0, months: Array(12).fill(0), week: Array(7).fill(0), tags: {}, best: null, streak: 0 };
    const keys = Object.keys(data.days).filter(k => k.startsWith(y + '-')).sort();
    let run = 0, prev = null;
    for (const k of keys) {
      const d = data.days[k], date = new Date(k + 'T12:00');
      s.sec += d.sec || 0; s.pomos += d.pomos || 0; s.notes += d.notes?.length || 0;
      if (d.sec >= 60 || d.pomos) s.days++;
      s.months[date.getMonth()] += d.sec || 0;
      s.week[(date.getDay() + 6) % 7] += d.sec || 0;
      for (const [t, sec] of Object.entries(d.tags || {})) s.tags[t] = (s.tags[t] || 0) + sec;
      if (!s.best || d.sec > s.best[1]) s.best = [date, d.sec];
      if (d.pomos > 0) {
        run = prev && Math.round((date - prev) / 864e5) === 1 ? run + 1 : 1;
        s.streak = Math.max(s.streak, run);
        prev = date;
      }
    }
    s.topTags = Object.entries(s.tags).filter(t => t[1] >= 60).sort((a, b) => b[1] - a[1]).slice(0, 3);
    s.month = s.months.indexOf(Math.max(...s.months));
    s.day = s.week.indexOf(Math.max(...s.week));
    return s;
  }

  // Evcil hayvanı küçük bir tuvale çizer (kartta ve resimde)
  function petCanvas() {
    const c = document.createElement('canvas');
    c.width = 24; c.height = 16;
    Scene.drawPet(c.getContext('2d'), 12, 15, { ...Pet.info(), sleepy: false, sad: false }, 0);
    return c;
  }

  function cards(s) {
    if (!s.sec) return [`<p class="big">${s.y}</p><p>Bu yıl henüz odak kaydın yok. İlk oturumunu bitir, özetin dolmaya başlasın!</p>`];
    const list = [
      `<p>${s.y} yılında</p><p class="big">${hm(s.sec)}</p><p>odaklandın. Toplam <b>${s.pomos}</b> oturum!</p>`,
      `<p class="big">${s.days} gün</p><p>kitaplarının başındaydın.</p><p>En uzun serin: <b>${s.streak} gün</b> üst üste.</p>`,
    ];
    if (s.topTags.length) {
      const max = s.topTags[0][1];
      list.push(`<p>En çok çalıştığın ders</p><p class="big">${esc(s.topTags[0][0])}</p>` + s.topTags.map(([t, sec]) =>
        `<div class="tag-row"><span class="name"><span class="tag-chip" style="background:${tagColor(t)}">${esc(t)}</span></span>` +
        `<div class="tag-bar"><div style="width:${100 * sec / max}%;background:${tagColor(t)}"></div></div><span class="min">${hm(sec)}</span></div>`).join(''));
    }
    const mMax = Math.max(...s.months) || 1;
    list.push(`<p>En verimli ayın</p><p class="big">${MONTHS[s.month]}</p><div class="recap-months">` +
      s.months.map((sec, m) => `<i class="${m === s.month ? 'on' : ''}" style="height:${Math.max(4, 100 * sec / mMax)}%" title="${MONTHS[m]}: ${hm(sec)}"></i>`).join('') +
      `</div><p><small>O ay ${hm(s.months[s.month])} odaklandın.</small></p>`);
    list.push(`<p>En uzun günün</p><p class="big">${s.best[0].toLocaleDateString('tr', { day: 'numeric', month: 'long' })}</p><p>O gün <b>${hm(s.best[1])}</b> çalıştın.</p>` +
      `<p>En sevdiğin gün: <b>${WEEKDAYS[s.day]}</b></p>`);
    const p = data.pet;
    const petLine = p?.species ? `<b>${esc(Pet.title())}</b> seninle büyüdü.` : 'Yumurtan hâlâ çatlamayı bekliyor.';
    list.push(`<div class="recap-pet"></div><p>${petLine}</p><p>Sınıfın: <b>${Levels.name()}</b></p>` +
      `<p><small>${s.notes ? `${s.notes} seans notu yazdın · ` : ''}${data.potionsMade || 0} iksir içtin · ${data.coins} altının var</small></p>`);
    list.push(`<p>Paylaşmak için özet resmin</p><img class="recap-img" alt="Yıl özeti resmi"><div class="row room-actions">` +
      `<button type="button" class="btn small" data-act="save">Resmi kaydet</button>` +
      (navigator.share ? '<button type="button" class="btn small add" data-act="share">Paylaş</button>' : '') + '</div>');
    return list;
  }

  // Paylaşılabilir resim (360x480, piksel yazı tipleriyle)
  async function image(s) {
    try { await Promise.all([document.fonts.load('16px "Press Start 2P"'), document.fonts.load('24px VT323')]); } catch {}
    const c = document.createElement('canvas'), x = c.getContext('2d');
    c.width = 360; c.height = 480;
    x.fillStyle = '#1b1726'; x.fillRect(0, 0, 360, 480);
    x.fillStyle = '#a08660'; x.fillRect(8, 8, 344, 464);
    x.fillStyle = '#2a253e'; x.fillRect(12, 12, 336, 456);
    for (let i = 0; i < 40; i++) { x.fillStyle = i % 3 ? '#4a4468' : '#e8c47e'; x.fillRect(20 + ((i * 97) % 320), 20 + ((i * 53) % 440), 2, 2); }
    x.textAlign = 'center';
    x.fillStyle = '#e8c47e'; x.font = '14px "Press Start 2P"'; x.fillText('✦ Büyülü Odak', 180, 52);
    x.font = '28px "Press Start 2P"'; x.fillText(String(s.y), 180, 100);
    const rows = [['Toplam odak', hm(s.sec)], ['Oturum', String(s.pomos)], ['Çalıştığım gün', `${s.days} gün`], ['En uzun seri', `${s.streak} gün`]];
    if (s.topTags[0]) rows.push(['En çok çalıştığım', s.topTags[0][0]]);
    if (s.sec) rows.push(['En verimli ay', MONTHS[s.month]]);
    rows.push(['Sınıfım', Levels.name()]);
    x.font = '24px VT323';
    rows.forEach(([k, v], i) => {
      const y = 150 + i * 34;
      x.textAlign = 'left'; x.fillStyle = '#b8b0d0'; x.fillText(k, 36, y);
      x.textAlign = 'right'; x.fillStyle = '#f4eee4'; x.fillText(String(v).slice(0, 18), 324, y);
    });
    x.imageSmoothingEnabled = false;
    x.drawImage(petCanvas(), 132, 392, 96, 64);
    return c;
  }

  let list = [], at = 0, s = null, img = null;
  const dlg = () => document.getElementById('recapDlg');
  function show() {
    const box = document.getElementById('recapCard');
    box.innerHTML = list[at];
    box.querySelector('.recap-pet')?.append(Object.assign(petCanvas(), { className: 'recap-pet-cv' }));
    const im = box.querySelector('.recap-img');
    if (im) image(s).then(c => { img = c; im.src = c.toDataURL(); });
    box.querySelectorAll('[data-act]').forEach(b => (b.onclick = () => (b.dataset.act === 'save' ? download() : share())));
    document.getElementById('recapDots').innerHTML = list.map((_, i) => `<i class="${i === at ? 'on' : ''}"></i>`).join('');
    document.getElementById('recapPrev').disabled = at === 0;
    document.getElementById('recapNext').textContent = at === list.length - 1 ? 'Bitir' : 'İleri ›';
  }
  function download() {
    if (!img) return;
    const a = document.createElement('a');
    a.href = img.toDataURL('image/png');
    a.download = `buyulu-odak-${s.y}.png`;
    a.click();
  }
  function share() {
    img?.toBlob(async b => {
      const file = new File([b], `buyulu-odak-${s.y}.png`, { type: 'image/png' });
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: `Büyülü Odak ${s.y}` });
        else download();
      } catch {}
    });
  }

  function open() {
    s = stats(year()); list = cards(s); at = 0; img = null;
    document.getElementById('recapTitle').textContent = `${s.y} Özetin`;
    show();
    dlg().showModal();
  }
  document.getElementById('recapPrev').onclick = () => { if (at > 0) { at--; show(); } };
  document.getElementById('recapNext').onclick = () => { if (at < list.length - 1) { at++; show(); } else dlg().close(); };

  // 15 Aralık – 15 Ocak arası bir kez hatırlatılır
  function init() {
    const d = new Date(), m = d.getMonth(), day = d.getDate(), y = year();
    const btn = document.getElementById('openRecap');
    btn.textContent = `✦ ${y} özetin`;
    btn.onclick = open;
    if (((m === 11 && day >= 15) || (m === 0 && day <= 15)) && data.recapHint !== y && stats(y).sec) {
      data.recapHint = y;
      save();
      toastLater(`${y} özetin hazır! İstatistiklerdeki "${y} özetin" düğmesine bak.`);
    }
  }

  return { open, init };
})();
