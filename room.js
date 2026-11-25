// Ortak çalışma odası (4 kişiye kadar) — Firebase Realtime Database üzerinden.
// Doğrudan tarayıcı bağlantısı gerekmez; her ağda çalışır. Veri düzeni:
//   rooms/{kod}/host                 oda sahibinin uid'i (oda sahibi çıkınca oda silinir)
//   rooms/{kod}/members/{uid}        { name, look, items, today, at }  (onaylı üyeler)
//   rooms/{kod}/pos/{uid}            { x, y, dir, moving, seated }     (kale konumu, sık güncellenir)
//   rooms/{kod}/requests/{uid}       { name, at }                      (katılma istekleri)
//   rooms/{kod}/rejects/{uid}        'no' | 'full'
//   rooms/{kod}/timer                { mode, running, remaining, endAt, durs }  (sunucu saatiyle)
//   rooms/{kod}/chat/{id}            { uid, name, text, at }
// Ayarlar firebase-config.js'te (window.FIREBASE_CONFIG). Dış arayüz app.js için aynı kaldı.
const Room = (() => {
  const MAX = 4;
  const PUBLIC_URL = 'https://wepwawettt.github.io/buyulu-odak/'; // yerelde kurulan odanın daveti de canlı siteye gitsin
  const TS = () => firebase.database.ServerValue.TIMESTAMP;
  let db = null, uid = null, offset = 0;
  let role = null;     // 'host' | 'guest' | null
  let status = 'idle'; // idle | connecting | hosting | waiting | live
  let code = '', error = '', durs = null, lastSig = '', hostUid = null;
  let roomRef = null, listeners = [];
  let members = new Map();     // diğer onaylı üyeler: uid -> profil
  const positions = new Map(); // uid -> kale konumu
  let requests = [];           // sahip: [{ uid, name }]
  let chat = [], unread = 0, doneMode = null, doneAt = 0, lastPos = '', posBeat = 0;

  const el = id => document.getElementById(id);
  const isLive = () => status === 'live';
  const myName = () => data.name || 'Büyücü';
  const clean = (v, n) => String(v ?? '').slice(0, n);
  const num = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);
  const others = () => [...members.entries()].map(([id, p]) => ({ id, ...p }));
  const serverNow = () => Date.now() + offset;

  // ---------- Bağlantı ----------
  function ready() {
    if (typeof firebase !== 'undefined' && window.FIREBASE_CONFIG) return true;
    error = 'Ortak oda henüz ayarlanmadı (Firebase).';
    renderPanel();
    return false;
  }
  async function connect() {
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    db = firebase.database();
    await Cloud.ready(); // Google ile giriş yapılmışsa o kimlik kullanılsın, anonime geçilmesin
    if (!firebase.auth().currentUser) await firebase.auth().signInAnonymously();
    uid = firebase.auth().currentUser.uid;
    db.ref('.info/serverTimeOffset').on('value', s => { offset = s.val() || 0; });
  }
  // Ağ çok yavaşsa sonsuza kadar bekleme
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

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
  // Başkalarından gelen her şey doğrulanır
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

  function setStatus(s) { status = s; refreshFriends(); renderPanel(); render(); }

  // Odam'daki masaya bir arkadaş sığar (ilk kişi); harita herkesi gösterir
  function refreshFriends() {
    const list = isLive() ? others() : [];
    // Oturma sırası: oda sahibi 0, diğerleri uid sırasına göre (her ekranda aynı)
    const ids = isLive() ? [hostUid, ...[uid, ...members.keys()].filter(id => id && id !== hostUid).sort()] : [];
    Castle.setRank(Math.max(0, ids.indexOf(uid)));
    Scene.setFriend(list[0] || null);
    Castle.setOthers(list.map(o => ({ ...o, pos: positions.get(o.id) })));
  }

  function needName() {
    if (data.name) return false;
    el('roomName').focus();
    error = 'Önce adını yaz; arkadaşların seni bu adla görecek.';
    renderPanel();
    return true;
  }

  // ---------- Oda kur ----------
  async function host() {
    if (status !== 'idle' || !ready() || needName()) return;
    error = '';
    setStatus('connecting');
    try {
      await withTimeout(connect(), 15000);
      for (let i = 0; i < 6 && !roomRef; i++) {
        const c = newCode(), ref = db.ref('rooms/' + c);
        const res = await withTimeout(ref.child('host').transaction(cur => (cur ? undefined : uid)), 15000);
        if (res.committed) { code = c; roomRef = ref; }
      }
      if (!roomRef) throw new Error('kod');
      role = 'host'; hostUid = uid;
      roomRef.onDisconnect().remove(); // sayfa kapanınca oda kapanır
      await roomRef.child('members/' + uid).set({ ...profile(), at: TS() });
      listen();
      setStatus('hosting');
      sendTimer();
    } catch (e) {
      leave('Sunucuya bağlanılamadı. İnternetini kontrol edip tekrar dene.');
    }
  }

  function accept(id) {
    const r = requests.find(q => q.uid === id);
    if (!r || !roomRef) return;
    if (members.size + 1 >= MAX) { roomRef.child('rejects/' + id).set('full'); roomRef.child('requests/' + id).remove(); return; }
    roomRef.child('members/' + id).set({ name: r.name, at: TS() });
    roomRef.child('requests/' + id).remove();
  }
  function reject(id) {
    if (!roomRef) return;
    roomRef.child('rejects/' + id).set('no');
    roomRef.child('requests/' + id).remove();
  }

  // ---------- Odaya katıl ----------
  async function join(raw) {
    const c = clean(raw, 200).trim().toLowerCase().replace(/^.*[?&]oda=/, '').replace(/[^a-z0-9]/g, '');
    if (!c || status !== 'idle' || !ready() || needName()) return;
    code = c; error = '';
    setStatus('connecting');
    try {
      await withTimeout(connect(), 15000);
      const ref = db.ref('rooms/' + code);
      const h = await withTimeout(ref.child('host').get(), 15000);
      if (!h.exists()) return leave('Bu kodla açık bir oda bulunamadı.');
      const m = await withTimeout(ref.child('members').get(), 15000);
      if (m.numChildren() >= MAX && !m.hasChild(uid)) return leave('Oda dolu (en fazla 4 kişi).');
      roomRef = ref; role = 'guest'; hostUid = h.val();
      await ref.child('rejects/' + uid).remove();
      ref.child('requests/' + uid).onDisconnect().remove();
      await ref.child('requests/' + uid).set({ name: myName(), at: TS() });
      listen();
      setStatus('waiting');
    } catch (e) {
      leave('Sunucuya bağlanılamadı. İnternetini kontrol edip tekrar dene.');
    }
  }

  // Misafir onaylandı: kendi üyelik kaydını tamamla
  function joined() {
    roomRef.child('members/' + uid).onDisconnect().remove();
    roomRef.child('pos/' + uid).onDisconnect().remove();
    roomRef.child('members/' + uid).update({ ...profile() });
    chat = [];
    setStatus('live');
    toast('Odaya katıldın!');
    sendPos(true);
  }

  // ---------- Dinleyiciler ----------
  function on(ref, ev, fn) { ref.on(ev, fn); listeners.push(() => ref.off(ev, fn)); }

  function listen() {
    // Oda kapandı mı?
    on(roomRef.child('host'), 'value', s => { if (!s.exists() && role) leave(role === 'guest' ? 'Oda kapandı.' : ''); });

    // Üyeler (profiller): seyrek değişir
    let first = true;
    on(roomRef.child('members'), 'value', s => {
      const all = s.val() || {};
      if (role === 'guest') {
        if (all[uid] && status === 'waiting') joined();
        else if (!all[uid] && isLive()) return leave('Odadan çıkarıldın.');
      }
      const next = new Map();
      for (const [id, p] of Object.entries(all)) if (id !== uid) next.set(clean(id, 128), readProfile(p));
      if (!first && (isLive() || role === 'host')) {
        for (const [id, p] of next) if (!members.has(id)) toast(`${p.name} odaya katıldı!`);
        // Arkadaş bir oturum bitirdiyse tebrik etmeyi hatırlat
        for (const [id, p] of next) {
          const old = members.get(id);
          if (old && p.today.pomos > old.today.pomos) toastLater(`${p.name} bir oturum bitirdi! Ortak Oda'dan 👏 gönder.`);
        }
        for (const [id, p] of members) if (!next.has(id)) { toast(`${p.name} odadan ayrıldı`); positions.delete(id); }
      }
      first = false;
      members = next;
      if (role === 'host') setStatus(members.size ? 'live' : 'hosting');
      else { refreshFriends(); renderPanel(); render(); }
    });

    // Kale konumları: sadece değişen kişi gelir
    const posRef = roomRef.child('pos');
    const onPos = s => {
      if (s.key === uid) return;
      const p = readPos(s.val());
      positions.set(s.key, p);
      Castle.movePlayer(s.key, p);
    };
    on(posRef, 'child_added', onPos);
    on(posRef, 'child_changed', onPos);
    on(posRef, 'child_removed', s => positions.delete(s.key));

    // Zamanlayıcı (misafir uygular)
    on(roomRef.child('timer'), 'value', s => { if (role === 'guest' && s.exists()) applyTimer(s.val()); });

    // Sohbet: son 50 mesaj
    on(roomRef.child('chat').limitToLast(50), 'child_added', s => {
      const m = s.val() || {};
      const text = clean(m.text, 200).trim();
      const name = clean(m.name, 16) || 'Büyücü';
      if (m.react && REACTS.includes(text)) { // tepki: sohbette kısa satır, yeniyse ekranda uçuşur
        const fresh = serverNow() - num(m.at, 0, 1e15, 0) < 15000;
        if (fresh) popReaction(name, text, m.uid === uid);
        return addChat(name, text, m.uid === uid, !fresh);
      }
      if (text) addChat(name, text, m.uid === uid);
    });

    if (role === 'host') {
      on(roomRef.child('requests'), 'value', s => {
        const before = new Set(requests.map(r => r.uid));
        requests = Object.entries(s.val() || {}).map(([id, r]) => ({ uid: id, name: clean(r?.name, 16).trim() || 'Büyücü' }));
        const fresh = requests.filter(r => !before.has(r.uid));
        if (fresh.length) {
          toast(`${fresh[0].name} odana katılmak istiyor: Ortak Oda'dan kabul et`);
          try { chime(); } catch {}
          if (!roomDlg.open) el('openRoom').click();
        }
        renderPanel(); render();
      });
    } else {
      on(roomRef.child('rejects/' + uid), 'value', s => {
        if (!s.exists()) return;
        leave(s.val() === 'full' ? 'Oda dolu (en fazla 4 kişi).' : 'Oda sahibi isteğini kabul etmedi.');
      });
    }
  }

  function leave(msg = '') {
    const wasGuest = role === 'guest';
    listeners.forEach(f => f()); listeners = [];
    if (roomRef && uid) {
      if (role === 'host') roomRef.remove();
      else {
        roomRef.child('members/' + uid).remove();
        roomRef.child('pos/' + uid).remove();
        roomRef.child('requests/' + uid).remove();
      }
      roomRef.onDisconnect().cancel();
    }
    roomRef = null; role = null; durs = null; code = ''; chat = []; unread = 0; lastSig = ''; hostUid = null;
    members = new Map(); positions.clear(); requests = [];
    error = msg;
    if (wasGuest) { running = false; remaining = dur(mode); }
    setStatus('idle');
    updateBadge();
    if (msg) toast(msg);
  }

  // ---------- Zamanlayıcı ----------
  // render her çağrıldığında: arkadaş satırı + (sahipsek) zamanlayıcı değiştiyse yaz
  function sync() {
    const list = isLive() ? others() : [];
    const first = list[0];
    el('friendTag').hidden = !first;
    el('friendLine').hidden = !list.length;
    if (first) el('friendTag').textContent = first.name;
    if (list.length) el('friendLine').textContent = list.map(o => `${o.name} ${o.today.min} dk`).join(' · ') + ' (bugün)';
    if (role !== 'host' || !roomRef) return;
    const sig = [mode, running, running ? Math.round(endAt / 1000) : Math.round(remaining),
      data.settings.focus, data.settings.short, data.settings.long].join('|');
    if (sig !== lastSig) { lastSig = sig; sendTimer(); }
  }

  function sendTimer() {
    if (role !== 'host' || !roomRef) return;
    const rem = running ? Math.max(0, (endAt - Date.now()) / 1000) : remaining;
    roomRef.child('timer').set({
      mode, running, remaining: rem,
      endAt: running ? serverNow() + rem * 1000 : 0, // sunucu saatine göre bitiş
      durs: { focus: data.settings.focus, short: data.settings.short, long: data.settings.long },
    });
  }

  // Misafir: oda sahibinin saatini kendi saatine uygula
  function applyTimer(m) {
    if (role !== 'guest' || !['focus', 'short', 'long'].includes(m.mode)) return;
    const rem = m.running ? Math.max(0, (num(m.endAt, 0, 1e15, 0) - serverNow()) / 1000) : num(m.remaining, 0, 1e6, 0);
    // Az önce bitirdiğimiz oturumun tekrarını yok say (çift sayım olmasın)
    if (m.mode === doneMode && m.running && Date.now() - doneAt < 8000 && rem < 6) return;
    tick(); // biriken odak süresini say
    if (mode === 'focus' && running && m.mode !== 'focus' && remaining < 5) guestFinish(); // sahibi bizden önce bitirdi
    durs = { focus: num(m.durs?.focus, 1, 180, 25), short: num(m.durs?.short, 1, 60, 5), long: num(m.durs?.long, 1, 90, 15) };
    const now = Date.now();
    const continuing = running && !!m.running && mode === m.mode;
    mode = m.mode;
    running = !!m.running;
    remaining = Math.min(rem, durs[mode] * 60);
    if (running) { if (!continuing) lastTick = now; endAt = now + remaining * 1000; }
    render();
  }

  // ---------- Harita konumu ----------
  // Konum değiştikçe (en fazla ~5/sn) ve 3 sn'de bir yazılır
  function sendPos(force) {
    if (!isLive() || !roomRef) return;
    const p = Castle.myPos();
    const sig = [p.x, p.y, p.dir, p.moving, p.seated].join('|');
    if (!force && sig === lastPos && Date.now() - posBeat < 3000) return;
    lastPos = sig; posBeat = Date.now();
    roomRef.child('pos/' + uid).set(p);
  }

  // ---------- Sohbet ----------
  function addChat(name, text, mine, quiet) {
    chat.push({ name, text, mine });
    if (chat.length > 100) chat.shift();
    if (!mine && !roomDlg.open && !quiet) { unread++; toast(`${name}: ${text}`); }
    renderPanel();
  }
  function sendChat(text) {
    text = clean(text, 200).trim();
    if (!text || !isLive() || !roomRef) return;
    roomRef.child('chat').push({ uid, name: myName(), text, at: TS() });
  }

  // ---------- Tepkiler ----------
  const REACTS = ['👏', '✨', '🔥', '☕', '💪'];
  function sendReact(e) {
    if (!REACTS.includes(e) || !isLive() || !roomRef) return;
    roomRef.child('chat').push({ uid, name: myName(), text: e, react: true, at: TS() });
  }
  // Sahnenin üstünde yükselip kaybolan tepki
  function popReaction(name, e, mine) {
    const d = document.createElement('div');
    d.className = 'react-pop';
    d.style.left = (15 + Math.random() * 70) + '%';
    d.innerHTML = '<span></span><small></small>';
    d.querySelector('span').textContent = e;
    d.querySelector('small').textContent = mine ? 'sen' : name;
    document.querySelector('.frame').appendChild(d);
    setTimeout(() => d.remove(), 2600);
  }

  function updateBadge() {
    const asks = requests.length;
    el('openRoom').textContent = 'Ortak Oda' + (asks ? ` (${asks} istek!)` : unread ? ` (${unread})` : '');
    el('openRoom').classList.toggle('alert', asks > 0);
  }

  // ---------- Panel ----------
  function renderPanel() {
    const nameIn = el('roomName');
    if (document.activeElement !== nameIn) nameIn.value = data.name || '';
    const hostName = members.get(hostUid)?.name || 'oda sahibi';
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
    el('roomHosting').hidden = !(role === 'host' && (status === 'hosting' || isLive()));
    el('roomCodeShow').textContent = code;
    const reqBox = el('roomRequests');
    reqBox.innerHTML = '';
    for (const r of requests) {
      const div = document.createElement('div');
      div.className = 'room-request';
      div.innerHTML = '<p></p><div class="row"><button class="btn small add">Kabul et</button><button class="btn small">Reddet</button></div>';
      div.querySelector('p').textContent = `${r.name} odana katılmak istiyor.`;
      const [ok, no] = div.querySelectorAll('button');
      ok.onclick = () => accept(r.uid);
      no.onclick = () => reject(r.uid);
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
      li.textContent = `${o.name}${o.id === hostUid ? ' (oda sahibi)' : ''} · bugün ${o.today.min} dk, ${o.today.pomos} oturum`;
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
    document.querySelectorAll('#reactRow [data-react]').forEach(b => (b.onclick = () => sendReact(b.dataset.react)));
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

    // Profil (bugünkü dakika vb.) ara ara tazelensin
    setInterval(() => { if (isLive() || status === 'hosting') sendProfile(); }, 30000);
    setInterval(() => sendPos(false), 200);
    addEventListener('beforeunload', () => { if (roomRef) leave(); });
    renderPanel();
  }

  function sendProfile() {
    if (!roomRef || !uid || !(isLive() || status === 'hosting')) return;
    roomRef.child('members/' + uid).update(profile());
  }

  return {
    init, renderPanel, sync, sendProfile, join,
    isGuest: () => role === 'guest' && isLive(),
    busy: () => status !== 'idle', // odadayken giriş/çıkış kimliği değiştirmesin
    live: isLive, // odada en az bir arkadaşla birlikte
    durs: () => (role === 'guest' && isLive() ? durs : null),
    markDone(m) { doneMode = m; doneAt = Date.now(); },
    note() {
      if (status === 'connecting' && role !== 'host') return 'Odaya bağlanılıyor…';
      if (status === 'waiting') return 'Oda sahibinin onayı bekleniyor…';
      if (role === 'host' && requests.length) return 'Katılmak isteyen var: Ortak Oda\'dan kabul et';
      if (!isLive() || !members.size) return '';
      if (role === 'guest') return `Zamanlayıcıyı ${members.get(hostUid)?.name || 'oda sahibi'} yönetiyor`;
      const names = others().map(o => o.name);
      return names.length === 1 ? `${names[0]} ile birlikte çalışıyorsun` : `${names.length} arkadaşınla birlikte çalışıyorsun`;
    },
  };
})();
