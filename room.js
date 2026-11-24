// Ortak çalışma odası (4 kişiye kadar): tarayıcılar PeerJS ile doğrudan bağlanır (kendi sunucumuz yok).
// Yıldız düzeni: oda sahibi (host) merkezdir; 3 misafire kadar kabul eder, misafirlerin mesajlarını
// ve harita konumlarını diğerlerine iletir, zamanlayıcıyı yönetir. Mesajlar düz JSON nesneleri:
//   misafir → sahip:  profile {…}  ·  chat { text }  ·  pos { pos }
//   sahip → misafir:  accept { you }  ·  reject { reason }  ·  roster { members }  ·  timer {…}
//                     chat { id, name, text }  ·  pos { id, pos }  ·  gone { id }
// app.js'teki global durumu (data, mode, running, remaining, ...) çalışma anında kullanır.
const Room = (() => {
  const PREFIX = 'buyuluodak-';
  const PUBLIC_URL = 'https://wepwawettt.github.io/buyulu-odak/'; // yerelde kurulan odanın daveti de canlı siteye gitsin
  const MAX_GUESTS = 3;
  let peer = null;
  let role = null;     // 'host' | 'guest' | null
  let status = 'idle'; // idle | connecting | hosting | waiting | live
  let code = '', durs = null, lastSig = '', error = '', myId = null;
  const guests = new Map();  // sahip: peerId -> { conn, profile }
  let pending = [];          // sahip: [{ id, conn, profile }]
  let hostConn = null;       // misafir: sahibe bağlantı
  let members = new Map();   // herkes: diğer kişiler id -> profile
  const positions = new Map(); // id -> harita konumu
  let chat = [], unread = 0, doneMode = null, doneAt = 0, lastPos = '';

  const el = id => document.getElementById(id);
  const isLive = () => status === 'live';
  const myName = () => data.name || 'Büyücü';
  const clean = (v, n) => String(v ?? '').slice(0, n);
  const num = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);
  const others = () => [...members.entries()].map(([id, p]) => ({ id, ...p }));

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
      name: myName(), look: data.look,
      items: data.equipped.filter(id => id === 'glasses' || id === 'starhat'),
      today: { min: Math.floor(d.sec / 60), pomos: d.pomos },
    };
  }

  // Ağdan gelen her şey doğrulanır
  function readProfile(m) {
    return {
      name: clean(m?.name, 16).trim() || 'Büyücü', look: m?.look || {}, items: m?.items,
      today: { min: num(m?.today?.min, 0, 1440, 0), pomos: num(m?.today?.pomos, 0, 200, 0) },
    };
  }
  function readPos(p) {
    return {
      x: num(p?.x, 0, 2000, 0), y: num(p?.y, 0, 2000, 0),
      dir: ['up', 'down', 'left', 'right'].includes(p?.dir) ? p.dir : 'down',
      moving: !!p?.moving, seated: !!p?.seated,
    };
  }

  const sendTo = (conn, msg) => { if (conn && conn.open) conn.send(msg); };
  // Sahip: tüm misafirlere (biri hariç) gönder
  function broadcast(msg, exceptId) { for (const [id, g] of guests) if (id !== exceptId) sendTo(g.conn, msg); }
  function setStatus(s) { status = s; refreshFriends(); renderPanel(); render(); }

  // Odam sahnesindeki masaya bir arkadaş sığar (ilk kişi), harita herkesi gösterir
  function refreshFriends() {
    const list = isLive() ? others() : [];
    // Sıra: oda sahibi 0, misafirler kimliklerine göre (her ekranda aynı sonuç)
    const ids = isLive() ? ['host', ...[myId, ...members.keys()].filter(id => id && id !== 'host').sort()] : [];
    Castle.setRank(Math.max(0, ids.indexOf(myId)));
    Scene.setFriend(list[0] || null);
    Castle.setOthers(list.map(o => ({ ...o, pos: positions.get(o.id) })));
  }

  // ---------- Oda kur ----------
  function needName() {
    if (data.name) return false;
    el('roomName').focus();
    error = 'Önce adını yaz; arkadaşların seni bu adla görecek.';
    renderPanel();
    return true;
  }

  function host() {
    if (peer || !ready() || needName()) return;
    code = newCode(); role = 'host'; error = ''; myId = 'host';
    setStatus('connecting');
    peer = new Peer(PREFIX + code);
    peer.on('open', () => setStatus('hosting'));
    peer.on('error', onError);
    peer.on('connection', c => {
      if (guests.size + pending.length >= MAX_GUESTS) {
        c.on('open', () => { c.send({ type: 'reject', reason: 'full' }); setTimeout(() => c.close(), 500); });
        return;
      }
      const req = { id: c.peer, conn: c, profile: null };
      pending.push(req);
      c.on('data', m => {
        if (guests.has(req.id)) return fromGuest(req.id, m);
        if (m?.type === 'profile' && !req.profile) {
          req.profile = readProfile(m);
          renderPanel(); render();
          toast(`${req.profile.name} odana katılmak istiyor: Ortak Oda'dan kabul et`);
          try { chime(); } catch {}
          if (!roomDlg.open) el('openRoom').click();
        }
      });
      c.on('close', () => {
        if (guests.has(req.id)) guestLeft(req.id);
        else { pending = pending.filter(p => p !== req); renderPanel(); render(); }
      });
    });
  }

  function roster() {
    return [{ id: 'host', profile: profile() }, ...[...guests].map(([id, g]) => ({ id, profile: g.profile }))];
  }
  function sendRoster() { broadcast({ type: 'roster', members: roster() }); }

  function accept(id) {
    const req = pending.find(p => p.id === id && p.profile);
    if (!req) return;
    pending = pending.filter(p => p !== req);
    guests.set(id, { conn: req.conn, profile: req.profile });
    members.set(id, req.profile);
    sendTo(req.conn, { type: 'accept', you: id });
    sendRoster();
    lastSig = '';
    sendTimer();
    // Yeni gelen herkesin konumunu bilsin
    const mine = Castle.myPos();
    sendTo(req.conn, { type: 'pos', id: 'host', pos: mine });
    for (const [gid, p] of positions) sendTo(req.conn, { type: 'pos', id: gid, pos: p });
    setStatus('live');
    toast(`${req.profile.name} odaya katıldı!`);
  }

  function reject(id) {
    const req = pending.find(p => p.id === id);
    if (!req) return;
    pending = pending.filter(p => p !== req);
    sendTo(req.conn, { type: 'reject' });
    setTimeout(() => req.conn.close(), 500);
    renderPanel(); render();
  }

  function guestLeft(id) {
    const n = members.get(id)?.name || 'Bir arkadaşın';
    guests.delete(id); members.delete(id); positions.delete(id);
    broadcast({ type: 'gone', id });
    sendRoster();
    setStatus(guests.size ? 'live' : 'hosting');
    toast(`${n} odadan ayrıldı`);
  }

  // Sahip: misafirden gelen mesaj
  function fromGuest(id, m) {
    if (!m || typeof m !== 'object') return;
    if (m.type === 'profile') {
      const p = readProfile(m);
      guests.get(id).profile = p; members.set(id, p);
      sendRoster(); refreshFriends(); renderPanel(); render();
    } else if (m.type === 'chat') {
      const text = clean(m.text, 200).trim();
      if (!text) return;
      const name = members.get(id)?.name || 'Büyücü';
      addChat(name, text, false);
      broadcast({ type: 'chat', id, name, text }, id);
    } else if (m.type === 'pos') {
      const p = readPos(m.pos);
      positions.set(id, p);
      Castle.movePlayer(id, p);
      broadcast({ type: 'pos', id, pos: p }, id);
    }
  }

  // ---------- Odaya katıl ----------
  function join(raw) {
    const c = clean(raw, 200).trim().toLowerCase().replace(/^.*[?&]oda=/, '').replace(/[^a-z0-9]/g, '');
    if (!c || peer || !ready() || needName()) return;
    code = c; role = 'guest'; error = '';
    setStatus('connecting');
    peer = new Peer();
    peer.on('error', onError);
    peer.on('open', () => {
      const cn = peer.connect(PREFIX + code, { reliable: true });
      cn.on('open', () => { hostConn = cn; sendTo(cn, { type: 'profile', ...profile() }); setStatus('waiting'); });
      cn.on('data', fromHost);
      cn.on('close', () => { if (role === 'guest') leave('Oda kapandı.'); });
    });
  }

  // Misafir: sahipten gelen mesaj
  function fromHost(m) {
    if (!m || typeof m !== 'object') return;
    if (m.type === 'accept') { myId = clean(m.you, 80); chat = []; setStatus('live'); toast('Odaya katıldın!'); sendPos(true); return; }
    if (m.type === 'reject') return leave(m.reason === 'full' ? 'Oda dolu (en fazla 4 kişi).' : 'Oda sahibi isteğini kabul etmedi.');
    if (m.type === 'roster' && Array.isArray(m.members)) {
      members = new Map(m.members.slice(0, MAX_GUESTS + 1)
        .filter(x => x && x.id !== myId)
        .map(x => [clean(x.id, 80), readProfile(x.profile)]));
      for (const id of positions.keys()) if (!members.has(id)) positions.delete(id);
      refreshFriends(); renderPanel(); render();
    } else if (m.type === 'timer') applyTimer(m);
    else if (m.type === 'chat') {
      const text = clean(m.text, 200).trim();
      if (text) addChat(clean(m.name, 16) || 'Büyücü', text, false);
    } else if (m.type === 'pos') {
      const id = clean(m.id, 80);
      if (!members.has(id)) return;
      const p = readPos(m.pos);
      positions.set(id, p);
      Castle.movePlayer(id, p);
    } else if (m.type === 'gone') {
      const id = clean(m.id, 80);
      members.delete(id); positions.delete(id); refreshFriends(); renderPanel();
    }
  }

  function onError(err) {
    const type = err?.type;
    if (type === 'unavailable-id' && role === 'host') { cleanup(); return host(); } // kod çakıştı, yenisi
    if ((isLive() || status === 'hosting') && type !== 'peer-unavailable') { try { peer.reconnect(); } catch {} return; }
    leave(type === 'peer-unavailable' ? 'Bu kodla açık bir oda bulunamadı.' : `Bağlantı kurulamadı (${type || 'bilinmeyen hata'}).`);
  }

  function cleanup() {
    for (const g of guests.values()) { try { g.conn.close(); } catch {} }
    for (const p of pending) { try { p.conn.close(); } catch {} }
    try { hostConn?.close(); } catch {}
    try { peer?.destroy(); } catch {}
    peer = hostConn = null;
    guests.clear(); pending = [];
  }

  function leave(msg = '') {
    const wasGuest = role === 'guest';
    cleanup();
    role = null; durs = null; code = ''; chat = []; unread = 0; lastSig = ''; myId = null;
    members = new Map(); positions.clear();
    error = msg;
    if (wasGuest) { running = false; remaining = dur(mode); }
    setStatus('idle');
    updateBadge();
    if (msg) toast(msg);
  }

  // ---------- Zamanlayıcı ----------
  // render her çağrıldığında: arkadaş satırı + (sahipsek) zamanlayıcı değiştiyse gönder
  function sync() {
    const list = isLive() ? others() : [];
    const first = list[0];
    el('friendTag').hidden = !first;
    el('friendLine').hidden = !list.length;
    if (first) el('friendTag').textContent = first.name;
    if (list.length) el('friendLine').textContent = list.map(o => `${o.name} ${o.today.min} dk`).join(' · ') + ' (bugün)';
    if (role !== 'host' || !isLive()) return;
    const sig = [mode, running, running ? Math.round(endAt / 1000) : Math.round(remaining),
      data.settings.focus, data.settings.short, data.settings.long].join('|');
    if (sig !== lastSig) { lastSig = sig; sendTimer(); }
  }

  function sendTimer() {
    broadcast({
      type: 'timer', mode, running,
      remaining: running ? Math.max(0, (endAt - Date.now()) / 1000) : remaining,
      durs: { focus: data.settings.focus, short: data.settings.short, long: data.settings.long },
    });
  }

  // Misafir: oda sahibinin saatini kendi saatine uygula
  function applyTimer(m) {
    if (role !== 'guest' || !['focus', 'short', 'long'].includes(m.mode)) return;
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

  // ---------- Harita konumu ----------
  // Konum değiştikçe (en fazla ~7/sn) ve 2 sn'de bir gönderilir
  let posBeat = 0;
  function sendPos(force) {
    if (!isLive()) return;
    const p = Castle.myPos();
    const sig = [p.x, p.y, p.dir, p.moving, p.seated].join('|');
    if (!force && sig === lastPos && Date.now() - posBeat < 2000) return;
    lastPos = sig; posBeat = Date.now();
    if (role === 'host') broadcast({ type: 'pos', id: 'host', pos: p });
    else sendTo(hostConn, { type: 'pos', pos: p });
  }

  // ---------- Sohbet ----------
  function addChat(name, text, mine) {
    chat.push({ name, text, mine });
    if (chat.length > 100) chat.shift();
    if (!mine && !roomDlg.open) { unread++; toast(`${name}: ${text}`); }
    renderPanel();
  }

  function sendChat(text) {
    text = clean(text, 200).trim();
    if (!text || !isLive()) return;
    if (role === 'host') broadcast({ type: 'chat', id: 'host', name: myName(), text });
    else sendTo(hostConn, { type: 'chat', text });
    addChat(myName(), text, true);
  }

  function updateBadge() {
    const asks = pending.filter(p => p.profile).length;
    el('openRoom').textContent = 'Ortak Oda' + (asks ? ` (${asks} istek!)` : unread ? ` (${unread})` : '');
    el('openRoom').classList.toggle('alert', asks > 0);
  }

  // ---------- Panel ----------
  function renderPanel() {
    const nameIn = el('roomName');
    if (document.activeElement !== nameIn) nameIn.value = data.name || '';
    const hostName = members.get('host')?.name || 'oda sahibi';

    const msgs = {
      idle: error || 'Arkadaşlarınla (en fazla 4 kişi) aynı odada, aynı zamanlayıcıyla çalış.',
      connecting: 'Bağlanıyor…',
      hosting: 'Oda açık! Kodu ya da bağlantıyı arkadaşlarına gönder (en fazla 3 kişi). Her katılım için onay istenecek.',
      waiting: 'Oda sahibinin onayı bekleniyor…',
      live: role === 'host' ? 'Zamanlayıcıyı sen yönetiyorsun.' : `Zamanlayıcıyı ${hostName} yönetiyor.`,
    };
    el('roomMsg').textContent = msgs[status];
    el('roomMsg').classList.toggle('err', status === 'idle' && !!error);

    el('roomIdle').hidden = status !== 'idle';
    // Sahip, oda canlıyken de kodu paylaşıp yeni istekleri kabul edebilir
    el('roomHosting').hidden = !(role === 'host' && (status === 'hosting' || isLive()));
    el('roomCodeShow').textContent = code;
    const reqBox = el('roomRequests');
    reqBox.innerHTML = '';
    for (const r of pending.filter(p => p.profile)) {
      const div = document.createElement('div');
      div.className = 'room-request';
      div.innerHTML = '<p></p><div class="row"><button class="btn small add">Kabul et</button><button class="btn small">Reddet</button></div>';
      div.querySelector('p').textContent = `${r.profile.name} odana katılmak istiyor.`;
      const [ok, no] = div.querySelectorAll('button');
      ok.onclick = () => accept(r.id);
      no.onclick = () => reject(r.id);
      reqBox.appendChild(div);
    }

    el('roomLive').hidden = !isLive();
    const ul = el('roomMembers');
    ul.innerHTML = '';
    const me = document.createElement('li');
    me.textContent = `${myName()} (sen${role === 'host' ? ', oda sahibi' : ''})`;
    ul.appendChild(me);
    for (const o of others()) {
      const li = document.createElement('li');
      li.textContent = `${o.name}${o.id === 'host' ? ' (oda sahibi)' : ''} · bugün ${o.today.min} dk, ${o.today.pomos} oturum`;
      ul.appendChild(li);
    }

    const log = el('chatLog');
    log.innerHTML = '';
    if (!chat.length) log.innerHTML = '<p class="chat-empty">Henüz mesaj yok.</p>';
    for (const c of chat) {
      const p = document.createElement('p');
      p.className = 'chat-msg ' + (c.mine ? 'me' : 'friend');
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
    el('roomLeave').onclick = () => leave();
    el('roomCopy').onclick = () => {
      const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
      const link = `${local ? PUBLIC_URL : location.origin + location.pathname}?oda=${code}`;
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
      if (role === 'host') { sendTimer(); sendRoster(); }
      else sendTo(hostConn, { type: 'profile', ...profile() });
    }, 15000);
    setInterval(() => sendPos(false), 150);
    addEventListener('beforeunload', cleanup);
    renderPanel();
  }

  function sendProfile() {
    if (!isLive()) return;
    if (role === 'host') sendRoster();
    else sendTo(hostConn, { type: 'profile', ...profile() });
  }

  return {
    init, renderPanel, sync, sendProfile,
    isGuest: () => role === 'guest' && isLive(),
    durs: () => (role === 'guest' && isLive() ? durs : null),
    markDone(m) { doneMode = m; doneAt = Date.now(); },
    join,
    note() {
      if (status === 'connecting' && role === 'guest') return 'Odaya bağlanılıyor…';
      if (status === 'waiting') return 'Oda sahibinin onayı bekleniyor…';
      if (role === 'host' && pending.some(p => p.profile)) return 'Katılmak isteyen var: Ortak Oda\'dan kabul et';
      if (!isLive() || !members.size) return '';
      if (role === 'guest') return `Zamanlayıcıyı ${members.get('host')?.name || 'oda sahibi'} yönetiyor`;
      const names = others().map(o => o.name);
      return names.length === 1 ? `${names[0]} ile birlikte çalışıyorsun` : `${names.length} arkadaşınla birlikte çalışıyorsun`;
    },
  };
})();
