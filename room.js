// Ortak çalışma odası: iki tarayıcı PeerJS ile doğrudan bağlanır (kendi sunucumuz yok).
// Oda sahibi zamanlayıcıyı yönetir, misafir onun saatini izler. Mesajlar düz JSON nesneleri:
//   profile { name, look, items, today }  ·  timer { mode, running, remaining, durs }
//   chat { text }  ·  accept  ·  reject { reason }
// app.js'teki global durumu (data, mode, running, remaining, ...) çalışma anında kullanır.
const Room = (() => {
  const PREFIX = 'buyuluodak-';
  let peer = null, conn = null, pending = null, pendingInfo = null;
  let role = null;     // 'host' | 'guest' | null
  let status = 'idle'; // idle | connecting | hosting | waiting | live
  let code = '', friend = null, durs = null, lastSig = '', error = '';
  let chat = [], unread = 0, doneMode = null, doneAt = 0;

  const el = id => document.getElementById(id);
  const isLive = () => status === 'live';
  const myName = () => data.name || 'Büyücü';
  const clean = (v, n) => String(v ?? '').slice(0, n);
  const num = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);

  function ready() {
    if (typeof Peer !== 'undefined') return true;
    error = 'Bağlantı kütüphanesi yüklenemedi. İnternet bağlantını kontrol et.';
    renderPanel();
    return false;
  }

  function newCode() {
    const a = 'abcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join('');
  }

  function profile() {
    const d = today();
    return {
      type: 'profile', name: myName(), look: data.look,
      items: data.equipped.filter(id => id === 'glasses' || id === 'starhat'),
      today: { min: Math.floor(d.sec / 60), pomos: d.pomos },
    };
  }

  // Arkadaştan gelen her şey doğrulanır
  function readProfile(m) {
    return {
      name: clean(m.name, 16).trim() || 'Büyücü', look: m.look, items: m.items,
      today: { min: num(m.today?.min, 0, 1440, 0), pomos: num(m.today?.pomos, 0, 200, 0) },
    };
  }

  function send(msg) { if (conn && conn.open) conn.send(msg); }
  function setStatus(s) { status = s; renderPanel(); render(); }

  // ---------- Oda kur ----------
  function host() {
    if (peer || !ready()) return;
    code = newCode(); role = 'host'; error = '';
    setStatus('connecting');
    peer = new Peer(PREFIX + code);
    peer.on('open', () => setStatus('hosting'));
    peer.on('error', onError);
    peer.on('connection', c => {
      if (conn || pending) { // oda iki kişilik
        c.on('open', () => { c.send({ type: 'reject', reason: 'full' }); setTimeout(() => c.close(), 500); });
        return;
      }
      pending = c;
      c.on('data', m => {
        if (c === conn) return handle(m);
        if (c === pending && m?.type === 'profile') {
          pendingInfo = readProfile(m);
          renderPanel();
          toast(`${pendingInfo.name} odana katılmak istiyor`);
          if (!roomDlg.open) el('openRoom').click();
        }
      });
      c.on('close', () => {
        if (c === pending) { pending = null; pendingInfo = null; renderPanel(); }
        else if (c === conn) friendLeft();
      });
    });
  }

  function accept() {
    if (!pending || !pendingInfo) return;
    conn = pending; pending = null;
    friend = pendingInfo; pendingInfo = null;
    send({ type: 'accept' });
    send(profile());
    lastSig = '';
    chat = [];
    Scene.setFriend(friend);
    setStatus('live');
    toast(`${friend.name} odaya katıldı!`);
  }

  function reject() {
    if (!pending) return;
    const c = pending;
    pending = null; pendingInfo = null;
    c.send({ type: 'reject' });
    setTimeout(() => c.close(), 500);
    renderPanel();
  }

  function friendLeft() {
    const n = friend?.name || 'Arkadaşın';
    conn = null; friend = null; chat = [];
    Scene.setFriend(null);
    setStatus('hosting');
    toast(`${n} odadan ayrıldı`);
  }

  // ---------- Odaya katıl ----------
  function join(raw) {
    const c = clean(raw, 200).trim().toLowerCase().replace(/^.*[?&]oda=/, '').replace(/[^a-z0-9]/g, '');
    if (!c || peer || !ready()) return;
    code = c; role = 'guest'; error = '';
    setStatus('connecting');
    peer = new Peer();
    peer.on('error', onError);
    peer.on('open', () => {
      const cn = peer.connect(PREFIX + code, { reliable: true });
      cn.on('open', () => { conn = cn; send(profile()); setStatus('waiting'); });
      cn.on('data', m => {
        if (m?.type === 'accept') { chat = []; setStatus('live'); toast('Odaya katıldın!'); return; }
        if (m?.type === 'reject') return leave(m.reason === 'full' ? 'Oda dolu.' : 'Oda sahibi isteğini kabul etmedi.');
        handle(m);
      });
      cn.on('close', () => { if (role === 'guest') leave('Oda kapandı.'); });
    });
  }

  function onError(err) {
    const type = err?.type;
    if (type === 'unavailable-id' && role === 'host') { cleanup(); return host(); } // kod çakıştı, yenisi
    if (isLive() && type !== 'peer-unavailable') { try { peer.reconnect(); } catch {} return; } // aradaki bağ sürüyor
    leave(type === 'peer-unavailable' ? 'Bu kodla açık bir oda bulunamadı.' : `Bağlantı kurulamadı (${type || 'bilinmeyen hata'}).`);
  }

  function cleanup() {
    try { conn?.close(); } catch {}
    try { pending?.close(); } catch {}
    try { peer?.destroy(); } catch {}
    peer = conn = pending = null;
    pendingInfo = null;
  }

  function leave(msg = '') {
    const wasGuest = role === 'guest';
    cleanup();
    role = null; friend = null; durs = null; code = ''; chat = []; unread = 0; lastSig = '';
    error = msg;
    Scene.setFriend(null);
    if (wasGuest) { running = false; remaining = dur(mode); }
    setStatus('idle');
    updateBadge();
    if (msg) toast(msg);
  }

  // ---------- Mesajlar ----------
  function handle(m) {
    if (!m || typeof m !== 'object') return;
    if (m.type === 'profile') { friend = readProfile(m); Scene.setFriend(friend); renderPanel(); render(); }
    else if (m.type === 'timer' && role === 'guest') applyTimer(m);
    else if (m.type === 'chat') addChat('friend', clean(m.text, 200));
  }

  // Oda sahibi: zamanlayıcı her değiştiğinde gönder (render her çağrıldığında kontrol edilir)
  function sync() {
    const show = isLive() && friend;
    el('friendTag').hidden = el('friendLine').hidden = !show;
    if (show) {
      el('friendTag').textContent = friend.name;
      el('friendLine').textContent = `${friend.name} bugün ${friend.today.min} dk · ${friend.today.pomos} oturum`;
    }
    if (role !== 'host' || !isLive()) return;
    const sig = [mode, running, running ? Math.round(endAt / 1000) : Math.round(remaining),
      data.settings.focus, data.settings.short, data.settings.long].join('|');
    if (sig !== lastSig) { lastSig = sig; sendTimer(); }
  }

  function sendTimer() {
    send({
      type: 'timer', mode, running,
      remaining: running ? Math.max(0, (endAt - Date.now()) / 1000) : remaining,
      durs: { focus: data.settings.focus, short: data.settings.short, long: data.settings.long },
    });
  }

  // Misafir: oda sahibinin saatini kendi saatine uygula
  function applyTimer(m) {
    if (!['focus', 'short', 'long'].includes(m.mode)) return;
    // Az önce bitirdiğimiz oturumun gecikmeli tekrarını yok say (çift sayım olmasın)
    if (m.mode === doneMode && m.running && Date.now() - doneAt < 8000 && num(m.remaining, 0, 1e6, 99) < 6) return;
    tick(); // biriken odak süresini say
    if (mode === 'focus' && running && m.mode !== 'focus' && remaining < 5) guestFinish(); // sahibi bizden önce bitirdi
    durs = { focus: num(m.durs?.focus, 1, 180, 25), short: num(m.durs?.short, 1, 60, 5), long: num(m.durs?.long, 1, 90, 15) };
    const now = Date.now();
    const continuing = running && !!m.running && mode === m.mode;
    mode = m.mode;
    running = !!m.running;
    remaining = num(m.remaining, 0, durs[mode] * 60, 0);
    if (running) { if (!continuing) lastTick = now; endAt = now + remaining * 1000; }
    render();
  }

  // ---------- Sohbet ----------
  function addChat(from, text) {
    if (!text) return;
    chat.push({ from, text, name: from === 'me' ? myName() : friend?.name || 'Arkadaşın' });
    if (chat.length > 100) chat.shift();
    if (from === 'friend' && !roomDlg.open) { unread++; toast(`${friend?.name || 'Arkadaşın'}: ${text}`); }
    renderPanel();
  }

  function sendChat(text) {
    text = clean(text, 200).trim();
    if (!text || !isLive()) return;
    send({ type: 'chat', text });
    addChat('me', text);
  }

  function updateBadge() {
    el('openRoom').textContent = 'Ortak Oda' + (unread ? ` (${unread})` : '');
  }

  // ---------- Panel ----------
  function renderPanel() {
    const nameIn = el('roomName');
    if (document.activeElement !== nameIn) nameIn.value = data.name || '';

    const msgs = {
      idle: error || 'Arkadaşınla aynı odada, aynı zamanlayıcıyla çalış.',
      connecting: 'Bağlanıyor…',
      hosting: 'Oda açık! Kodu ya da bağlantıyı arkadaşına gönder. Katılmak istediğinde senden onay istenecek.',
      waiting: 'Oda sahibinin onayı bekleniyor…',
      live: role === 'host' ? 'Zamanlayıcıyı sen yönetiyorsun.' : `Zamanlayıcıyı ${friend?.name || 'oda sahibi'} yönetiyor.`,
    };
    el('roomMsg').textContent = msgs[status];
    el('roomMsg').classList.toggle('err', status === 'idle' && !!error);

    el('roomIdle').hidden = status !== 'idle';
    el('roomHosting').hidden = status !== 'hosting';
    el('roomCodeShow').textContent = code;
    el('roomRequest').hidden = !pendingInfo;
    if (pendingInfo) el('roomRequestText').textContent = `${pendingInfo.name} odana katılmak istiyor.`;

    el('roomLive').hidden = !isLive();
    if (isLive() && friend) el('roomFriend').textContent = `${friend.name} bugün ${friend.today.min} dk · ${friend.today.pomos} oturum`;
    const log = el('chatLog');
    log.innerHTML = '';
    if (!chat.length) log.innerHTML = '<p class="chat-empty">Henüz mesaj yok.</p>';
    for (const c of chat) {
      const p = document.createElement('p');
      p.className = 'chat-msg ' + c.from;
      const b = document.createElement('b');
      b.textContent = c.name + ': ';
      p.append(b, c.text);
      log.appendChild(p);
    }
    log.scrollTop = log.scrollHeight;

    el('roomLeave').hidden = status === 'idle';
    el('roomLeave').textContent = role === 'host' ? 'Odayı kapat' : 'Vazgeç / ayrıl';
    if (roomDlg.open) unread = 0;
    updateBadge();
  }

  function init() {
    el('roomHost').onclick = host;
    el('roomJoinForm').onsubmit = e => { e.preventDefault(); join(el('roomCode').value); };
    el('roomAccept').onclick = accept;
    el('roomReject').onclick = reject;
    el('roomLeave').onclick = () => leave();
    el('roomCopy').onclick = () => {
      const link = `${location.origin}${location.pathname}?oda=${code}`;
      navigator.clipboard?.writeText(link).then(() => toast('Bağlantı kopyalandı!'), () => toast(link));
    };
    el('chatForm').onsubmit = e => { e.preventDefault(); sendChat(el('chatInput').value); el('chatInput').value = ''; };
    el('roomName').onchange = () => {
      data.name = clean(el('roomName').value, 16).trim();
      save();
      sendProfile();
    };

    // Davet bağlantısıyla gelindiyse paneli kodla aç
    const invited = new URLSearchParams(location.search).get('oda');
    if (invited) {
      el('roomCode').value = invited;
      el('openRoom').click();
    }

    // Saat kaymasına ve kaçan mesajlara karşı düzenli tazele
    setInterval(() => {
      if (!isLive()) return;
      if (role === 'host') sendTimer();
      send(profile());
    }, 15000);
    addEventListener('beforeunload', cleanup);
    renderPanel();
  }

  function sendProfile() { if (isLive()) send(profile()); }

  return {
    init, renderPanel, sync, sendProfile,
    isGuest: () => role === 'guest' && isLive(),
    durs: () => (role === 'guest' && isLive() ? durs : null),
    markDone(m) { doneMode = m; doneAt = Date.now(); },
    note() {
      if (!isLive() || !friend) return '';
      return role === 'guest' ? `Zamanlayıcıyı ${friend.name} yönetiyor` : `${friend.name} ile birlikte çalışıyorsun`;
    },
  };
})();
