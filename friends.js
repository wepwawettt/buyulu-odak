// Arkadaşlar ve haftalık sıralama (Google ile giriş yapanlar için).
// Firebase'de:
//   profiles/{uid} = { name, cls, house, week: 'YYYY-AA-GG' (haftanın pazartesisi), min, at }  — giriş yapan herkes okuyabilir
//   codes/{kod}    = uid  — arkadaş kodu; bir kez alınır, sonra değişmez
//   invites/{uid}/{ekleyen} = true — biri seni ekleyince bırakılır; sen açınca o da listene eklenir (karşılıklı)
// Arkadaş listesi data.friends'te (uid'ler) durur ve hesapla birlikte eşitlenir.
const Friends = (() => {
  const MAX = 30;
  const db = () => firebase.database();
  const me = () => Cloud.user();
  const el = id => document.getElementById(id);
  const clean = (v, n) => String(v ?? '').slice(0, n);

  const monday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7)); };
  const weekKey = () => monday().toLocaleDateString('sv');
  function weekMin() {
    let s = 0;
    for (let i = 0; i < 7; i++) { const d = monday(); d.setDate(d.getDate() + i); s += data.days[d.toLocaleDateString('sv')]?.sec || 0; }
    return Math.floor(s / 60);
  }
  const myName = () => clean(data.name || me()?.displayName?.split(' ')[0] || 'Büyücü', 16);

  // Profili yayınla: değiştiyse ve en az 1 dk geçtiyse (save() her kayıtta çağırır)
  let lastSig = '', lastAt = 0;
  function publish(force) {
    if (!me()) return;
    const prof = { name: myName(), cls: Levels.name(), house: data.look.house, week: weekKey(), min: weekMin() };
    const sig = JSON.stringify(prof);
    if (!force && (sig === lastSig || Date.now() - lastAt < 60000)) return;
    lastSig = sig; lastAt = Date.now();
    db().ref('profiles/' + me().uid).set({ ...prof, at: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
    if (!invitesChecked) { invitesChecked = true; acceptInvites(); }
  }

  // Seni ekleyenleri sen de ekle (davet okunduktan sonra silinir)
  let invitesChecked = false;
  async function acceptInvites() {
    if (!me()) return false;
    let got = false;
    try {
      const inv = (await db().ref('invites/' + me().uid).get()).val() || {};
      for (const uid of Object.keys(inv)) {
        if (uid !== me().uid && !(data.friends ||= []).includes(uid) && data.friends.length < MAX) {
          data.friends.push(uid);
          got = true;
          const p = (await db().ref('profiles/' + uid).get()).val();
          toastLater(`${clean(p?.name, 16) || 'Bir büyücü'} seni arkadaş olarak ekledi; o da artık senin sıralamanda!`);
        }
        db().ref(`invites/${me().uid}/${uid}`).remove().catch(() => {});
      }
      if (got) save();
    } catch {}
    return got;
  }

  // Arkadaş kodum: yoksa boş bir kod bulup bana ayır
  async function myCode() {
    if (data.friendCode) return data.friendCode;
    const a = 'abcdefghjkmnpqrstuvwxyz23456789';
    for (let i = 0; i < 6; i++) {
      const code = Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join('');
      try { await db().ref('codes/' + code).set(me().uid); data.friendCode = code; save(); return code; } catch {} // alınmışsa başka kod dene
    }
    throw new Error('code');
  }

  let msg = '';
  async function add(raw) {
    const code = clean(raw, 40).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!code) return;
    msg = '';
    try {
      const uid = (await db().ref('codes/' + code).get()).val();
      if (!uid) msg = 'Bu kodla bir büyücü bulunamadı.';
      else if (uid === me().uid) msg = 'Bu senin kendi kodun :)';
      else if ((data.friends ||= []).includes(uid)) msg = 'Bu arkadaş zaten listende.';
      else if (data.friends.length >= MAX) msg = `En fazla ${MAX} arkadaş ekleyebilirsin.`;
      else {
        data.friends.push(uid); save(); msg = 'Arkadaş eklendi! Sen de onun listesinde görüneceksin.';
        db().ref(`invites/${uid}/${me().uid}`).set(true).catch(() => {});
      }
    } catch { msg = 'Bağlantı sorunu, birazdan tekrar dene.'; }
    render();
  }
  function remove(uid) {
    data.friends = (data.friends || []).filter(x => x !== uid);
    save(); render();
  }

  async function render() {
    const box = el('friendBody');
    if (!me()) {
      box.innerHTML = '<p class="room-msg">Haftalık sıralama için önce <b>Ayarlar → Hesap</b>\'tan Google ile giriş yap. Sonra arkadaşlarınla kodlarınızı paylaşın.</p>';
      return;
    }
    box.innerHTML = `<p class="room-msg">Arkadaş kodun: <b class="friend-code">…</b> <button type="button" class="btn small" id="copyCode">Kopyala</button></p>
      <form id="friendForm" class="task-form"><input id="friendInput" placeholder="Arkadaşının kodu" maxlength="20" autocomplete="off"><button class="btn small add">Ekle</button></form>
      <p class="room-msg" id="friendMsg"></p><h3>Bu hafta</h3><ol id="friendList" class="friend-list"><li class="room-msg">Yükleniyor…</li></ol>`;
    el('friendMsg').textContent = msg;
    el('friendForm').onsubmit = e => { e.preventDefault(); add(el('friendInput').value); };
    publish(true);
    myCode().then(code => {
      box.querySelector('.friend-code').textContent = code;
      el('copyCode').onclick = () => navigator.clipboard?.writeText(code).then(() => toast('Kod kopyalandı'));
    }).catch(() => { box.querySelector('.friend-code').textContent = '(alınamadı)'; });

    await acceptInvites();
    renderList();
  }

  // Sıralama listesi: panel açıkken 30 sn'de bir tazelenir
  let refreshT = 0;
  const ago = at => {
    const m = Math.round((Date.now() - at) / 60000);
    return m < 2 ? 'şimdi çevrimiçi' : m < 60 ? `${m} dk önce` : m < 1440 ? `${Math.round(m / 60)} sa önce` : `${Math.round(m / 1440)} gün önce`;
  };
  async function renderList() {
    clearTimeout(refreshT);
    const ids = [me().uid, ...(data.friends || [])];
    const profs = await Promise.all(ids.map(id => db().ref('profiles/' + id).get().then(s => s.val()).catch(() => undefined)));
    const wk = weekKey();
    const rows = ids.map((id, i) => {
      const p = profs[i], mine = id === me().uid;
      const thisWeek = p?.week === wk;
      // Arkadaşın neden 0 dk göründüğü anlaşılsın
      const status = mine ? Levels.name()
        : p === undefined ? 'bağlantı sorunu' : !p ? 'henüz Sıralama\'yı açmadı'
        : `${clean(p.cls, 16)} · ${thisWeek ? 'güncellendi ' + ago(p.at || 0) : 'bu hafta henüz çalışmadı'}`;
      return { id, mine, name: mine ? myName() : clean(p?.name, 16) || 'Büyücü', status,
        min: mine ? weekMin() : thisWeek ? Math.max(0, Math.min(10080, Number(p.min) || 0)) : 0 };
    }).sort((a, b) => b.min - a.min);
    const ol = el('friendList');
    if (!ol) return; // panel bu arada kapandı/yeniden çizildi
    ol.innerHTML = '';
    rows.forEach((r, i) => {
      const li = document.createElement('li');
      li.className = r.mine ? 'me' : '';
      li.innerHTML = '<span class="rank"></span><span class="who"><b></b><small></small></span><span class="min"></span>';
      li.querySelector('.rank').textContent = ['🥇', '🥈', '🥉'][i] || i + 1;
      li.querySelector('b').textContent = r.name + (r.mine ? ' (sen)' : '');
      li.querySelector('small').textContent = r.status;
      li.querySelector('.min').textContent = fmtMin(r.min);
      if (!r.mine) {
        const x = document.createElement('button');
        x.className = 'del'; x.title = 'Listeden çıkar'; x.textContent = '×';
        x.onclick = () => remove(r.id);
        li.appendChild(x);
      }
      ol.appendChild(li);
    });
    if (rows.length === 1) ol.insertAdjacentHTML('beforeend', '<li class="room-msg">Henüz arkadaş yok. Kodunu paylaş, onların kodunu ekle!</li>');
    refreshT = setTimeout(() => { if (el('friendDlg').open) { publish(); acceptInvites().then(renderList); } }, 30000);
  }

  return { publish, render };
})();
