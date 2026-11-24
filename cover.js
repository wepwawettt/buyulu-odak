// Giriş kapağı: yıldızlı gecede göl kıyısında büyülü bir kale (160x90 piksel, canlı).
// "Kaleye gir" / Enter / boşluk / tıklama ile kapanır.
(() => {
  const cover = document.getElementById('cover');
  const canvas = document.getElementById('coverArt');
  if (!cover || !canvas) return;
  const W = 160, H = 90, HORIZON = 64;
  const ctx = canvas.getContext('2d');
  const castle = document.createElement('canvas');
  castle.width = W; castle.height = HORIZON;
  const cc = castle.getContext('2d');

  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const rnd = (a, b) => {
    let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  // Kule: gövde + sivri çatı (+ bayrak)
  function tower(x, w, top, roofH, flag) {
    px(cc, x, top, w, HORIZON - top, '#2e2a4c');
    px(cc, x, top, 1, HORIZON - top, '#3c3862');
    for (let i = 0; i < roofH; i++) {
      const half = (w / 2 + 1) * (i + 1) / roofH;
      px(cc, x + w / 2 - half, top - roofH + i, half * 2, 1, i % 2 ? '#463f78' : '#4e4684');
    }
    if (flag) { px(cc, x + w / 2, top - roofH - 4, 1, 4, '#8a84a8'); px(cc, x + w / 2 + 1, top - roofH - 4, 3, 2, flag); }
  }

  const WINDOWS = [];
  function win(x, y) { WINDOWS.push([x, y]); }

  function buildCastle() {
    // Tepe
    for (let x = 0; x < W; x++) {
      const h = 56 + Math.round(Math.sin(x / 18) * 2 + Math.cos(x / 7) * 1) - (x > 50 && x < 122 ? 4 : 0);
      px(cc, x, h, 1, HORIZON - h, '#211e3a');
    }
    // Ana bina ve mazgallar
    px(cc, 66, 44, 44, 16, '#2e2a4c'); px(cc, 66, 44, 44, 1, '#3c3862');
    for (let x = 66; x < 110; x += 3) px(cc, x, 42, 2, 2, '#2e2a4c');
    // Kuleler (soldan sağa)
    tower(56, 5, 48, 5);
    tower(62, 6, 38, 8, '#c86a6a');
    tower(76, 5, 34, 7);
    tower(84, 8, 24, 12, '#e8c47e');
    tower(96, 5, 32, 8, '#6a8ac8');
    tower(104, 7, 36, 9, '#78b46a');
    tower(114, 4, 46, 5);
    // Köprü ve kemerleri
    px(cc, 30, 55, 28, 3, '#2a2646');
    for (let x = 32; x < 56; x += 6) px(cc, x, 58, 3, 3, '#211e3a');
    px(cc, 26, 50, 5, 10, '#2e2a4c'); for (let i = 0; i < 4; i++) px(cc, 28.5 - (i + 1) * 0.8, 46 + i, (i + 1) * 1.6, 1, '#4e4684');
    // Pencereler (sonra titreyerek yanar)
    [[64, 44], [64, 50], [78, 40], [78, 48], [86, 30], [89, 30], [86, 38], [89, 46], [98, 38], [98, 46], [106, 42], [106, 50],
      [70, 50], [74, 54], [94, 52], [102, 54], [58, 52], [115, 50], [28, 53]].forEach(([x, y]) => win(x, y));
    // Büyük salonun kemerli pencereleri
    for (const x of [70, 82, 94]) { px(cc, x, 47, 3, 5, '#ffd46b'); px(cc, x + 1, 46, 1, 1, '#ffd46b'); }
  }

  const STARS = Array.from({ length: 70 }, (_, i) => ({ x: Math.floor(rnd(i, 1) * W), y: Math.floor(rnd(i, 2) * 50), p: rnd(i, 3) * 6, big: rnd(i, 4) > 0.9 }));
  let t = 0, last = 0, running = true;

  function draw() {
    // Gökyüzü
    const bands = ['#16132e', '#1c1840', '#232052', '#2b2864', '#343274', '#3e3c80'];
    bands.forEach((c, i) => px(ctx, 0, i * 11, W, 11, c));
    for (const s of STARS) {
      const v = Math.sin(t * 2 + s.p);
      if (v < -0.3) continue;
      px(ctx, s.x, s.y, 1, 1, v > 0.6 ? '#ffffff' : '#a8b4e8');
      if (s.big && v > 0.6) { px(ctx, s.x - 1, s.y, 3, 1, 'rgba(255,255,255,0.5)'); px(ctx, s.x, s.y - 1, 1, 3, 'rgba(255,255,255,0.5)'); }
    }
    // Kayan yıldız
    const k = (t % 6) / 0.9;
    if (k < 1) for (let i = 0; i < 6; i++) { ctx.globalAlpha = 1 - i * 0.15; px(ctx, 40 + k * 50 - i * 2, 6 + k * 16 - i, 1, 1, '#ffffff'); }
    ctx.globalAlpha = 1;
    // Ay ve hale
    ctx.fillStyle = 'rgba(246,238,208,0.08)'; ctx.beginPath(); ctx.arc(132, 16, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f6eed0'; ctx.beginPath(); ctx.arc(132, 16, 7, 0, Math.PI * 2); ctx.fill();
    px(ctx, 129, 13, 2, 2, '#e4d8b0'); px(ctx, 134, 18, 2, 1, '#e4d8b0');
    // Uzak dağlar
    for (let x = 0; x < W; x++) {
      const h = 50 + Math.round(Math.sin(x / 13 + 1) * 4 + Math.sin(x / 5) * 1.5);
      px(ctx, x, h, 1, HORIZON - h, '#2a2852');
    }
    // Kale ve pencere ışıkları
    ctx.drawImage(castle, 0, 0);
    for (const [x, y] of WINDOWS) {
      const on = Math.sin(t * 3 + x * 0.7 + y) > -0.85;
      px(ctx, x, y, 1, 2, on ? '#ffd46b' : '#c89a4a');
    }
    // Uçan baykuş
    const ox = ((t * 12) % (W + 40)) - 20, oy = 26 + Math.sin(t * 2) * 3, up = Math.floor(t * 8) % 2;
    px(ctx, ox, oy, 2, 2, '#1a1830'); px(ctx, ox - 2, oy + (up ? -1 : 1), 2, 1, '#1a1830'); px(ctx, ox + 2, oy + (up ? -1 : 1), 2, 1, '#1a1830');
    // Göl ve dalgalı yansıma
    px(ctx, 0, HORIZON, W, H - HORIZON, '#1e1e48');
    ctx.globalAlpha = 0.45;
    for (let r = 0; r < H - HORIZON; r++) {
      const src = HORIZON - 1 - r;
      if (src < 0) break;
      const dx = Math.round(Math.sin(t * 2 + r * 0.7) * (1 + r * 0.05));
      ctx.drawImage(canvas, 0, src, W, 1, dx, HORIZON + r, W, 1);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 14; i++) {
      const y = HORIZON + 2 + Math.floor(rnd(i, 9) * 24), x = (rnd(i, 8) * W + t * (4 + i % 3)) % W;
      px(ctx, x, y, 3 + (i % 3), 1, 'rgba(200,210,255,0.25)');
    }
    // Ön plan: kıyı ve çam silüetleri
    for (let x = 0; x < W; x++) {
      const h = H - 4 + Math.round(Math.sin(x / 9) * 1.5);
      px(ctx, x, h, 1, H - h, '#120f24');
    }
    for (const [x, s] of [[6, 10], [14, 7], [146, 9], [154, 12]]) {
      for (let i = 0; i < s; i++) px(ctx, x - Math.floor(i / 2), H - 4 - s + i, Math.floor(i / 2) * 2 + 1, 1, '#120f24');
    }
  }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (now - last < 90) return;
    t += (now - last) / 1000 || 0.09;
    last = now;
    draw();
  }

  // Davet linkiyle gelindiyse kapak "Odaya katıl" olur ve ad sorar
  const invite = new URLSearchParams(location.search).get('oda');
  const enterBtn = document.getElementById('enter');
  let nameIn = null;
  if (invite) {
    const box = document.createElement('div');
    box.className = 'cover-invite';
    box.innerHTML = '<p>✦ Bir arkadaşın seni <b>ortak odasına</b> davet etti!</p>' +
      '<label>Adın <input id="coverName" maxlength="16" placeholder="Arkadaşların seni bu adla görecek" autocomplete="off"></label>' +
      '<small id="coverErr" hidden>Önce adını yaz.</small>';
    cover.insertBefore(box, enterBtn);
    nameIn = box.querySelector('input');
    nameIn.value = data.name || '';
    enterBtn.textContent = 'Odaya katıl';
    cover.querySelector('small:not(#coverErr)')?.remove();
  }

  function enter() {
    if (!running) return;
    if (invite) {
      const n = nameIn.value.trim().slice(0, 16);
      if (!n) { document.getElementById('coverErr').hidden = false; nameIn.focus(); return; }
      data.name = n;
      save();
    }
    running = false;
    try { audio()?.resume(); } catch {}
    cover.classList.add('hide');
    setTimeout(() => cover.remove(), 650);
    if (invite) {
      // Odaya hemen katıl ve paneli açık tut ki "onay bekleniyor" görünsün
      setTimeout(() => { Room.join(invite); if (!roomDlg.open) document.getElementById('openRoom').click(); }, 300);
    } else {
      setTimeout(() => { if (typeof showGuideOnce === 'function') showGuideOnce(); }, 700); // ilk girişte rehber
    }
  }

  buildCastle();
  draw();
  requestAnimationFrame(frame);
  document.getElementById('enter').onclick = enter;
  cover.addEventListener('click', e => { if (!invite && (e.target === cover || e.target === canvas)) enter(); });
  addEventListener('keydown', e => {
    if (!running) return;
    const typing = e.target === nameIn;
    if (e.code === 'Enter' || (!typing && (e.code === 'Space' || e.code === 'Escape'))) { e.preventDefault(); e.stopImmediatePropagation(); enter(); }
  }, true);
})();
