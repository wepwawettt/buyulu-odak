// Bulut kayıt: Google ile giriş yapanın ilerlemesi Firebase'de saklanır, başka cihazda da devam eder.
// Giriş yapmayan için her şey eskisi gibi sadece bu tarayıcıda kalır.
//   users/{uid} = { json: <data'nın JSON'u>, at: <kayıt kimliği> }
// Bu tarayıcıdaki kaydın hangi bulut kaydıyla eşit olduğu 'buyulu-odak-cloud' anahtarında tutulur:
//   { uid, base: <eşit olduğumuz 'at'>, dirty: <henüz yüklenmemiş değişiklik var mı> }
const Cloud = (() => {
  const META = 'buyulu-odak-cloud';
  const ok = typeof firebase !== 'undefined' && !!window.FIREBASE_CONFIG;
  let user = null, ref = null, last = '', synced = false, busy = false, timer = 0, note = '';
  let meta = {};
  try { meta = JSON.parse(localStorage.getItem(META)) || {}; } catch {}
  const writeMeta = m => { meta = m; localStorage.setItem(META, JSON.stringify(m)); };
  let markReady;
  const readyP = new Promise(r => (markReady = r));

  const focusMin = d => Math.round(Object.values(d.days || {}).reduce((a, x) => a + (x.sec || 0), 0) / 60);
  const sum = d => `${d.coins || 0} altın, ${focusMin(d)} dk odak`;
  const fresh = d => !d.coins && !(d.owned || []).length && focusMin(d) < 1;

  // Hesap ve bu tarayıcı farklıysa hangisinin kalacağını kullanıcıya sor (true: hesaptaki)
  function pick(cloud, title) {
    let c;
    try { c = JSON.parse(cloud.json); } catch { return false; }
    return confirm(`${title}\n\nHesaptaki: ${sum(c)}\nBu tarayıcıdaki: ${sum(data)}\n\n` +
      'Tamam → hesaptakini kullan\nİptal → bu tarayıcıdakini kullan (hesaptaki silinir)');
  }
  function use(cloud) {
    resetting = true; // app.js: sayfa kapanırken eski veriyi geri yazmasın
    localStorage.setItem(STORE, cloud.json);
    writeMeta({ uid: user.uid, base: cloud.at, dirty: false });
    location.reload();
  }
  async function push() {
    const json = JSON.stringify(data), at = Date.now();
    await ref.set({ json, at });
    last = json;
    writeMeta({ uid: user.uid, base: at, dirty: false });
    note = 'İlerlemen hesabına kaydedildi.';
  }

  // Buluttakiyle karşılaştır: gerekirse yükle, indir ya da sor
  async function sync() {
    if (!ref || busy) return;
    busy = true;
    clearTimeout(timer); timer = 0;
    try {
      const cloud = (await ref.get()).val();
      if (!cloud) await push();
      else if (meta.uid !== user.uid) { // bu tarayıcı bu hesaba ilk kez bağlanıyor
        if (fresh(data) || pick(cloud, 'Bu Google hesabında kayıtlı bir ilerleme var.')) return use(cloud);
        await push();
      } else if (cloud.at === meta.base) { // başka yerde değişmemiş
        if (meta.dirty || JSON.stringify(data) !== cloud.json) await push();
        else { last = cloud.json; note = 'İlerlemen hesabında kayıtlı.'; }
      } else if (!meta.dirty || pick(cloud, 'Başka bir cihazda daha yeni ilerleme kaydedilmiş.')) return use(cloud);
      else await push();
      synced = true;
    } catch {
      note = 'Hesaba ulaşılamadı; ilerlemen bu tarayıcıda duruyor.';
    } finally {
      busy = false;
      draw();
    }
  }

  // app.js save() her kayıtta çağırır; değişiklik varsa en geç 10 sn içinde yüklenir
  function queue(json) {
    if (!ref || !synced || json === last) return;
    last = json;
    if (!meta.dirty) writeMeta({ ...meta, dirty: true });
    if (!timer) timer = setTimeout(sync, 10000);
  }

  function attach(u) {
    const acc = u && !u.isAnonymous ? u : null;
    if (acc?.uid === user?.uid) return;
    user = acc;
    ref = user ? firebase.database().ref('users/' + user.uid) : null;
    synced = false; note = ''; last = '';
    clearTimeout(timer); timer = 0;
    draw();
    if (user) sync();
  }

  const ERR = {
    'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı.',
    'auth/cancelled-popup-request': '',
    'auth/popup-blocked': 'Tarayıcı giriş penceresini engelledi; bu site için açılır pencerelere izin ver.',
    'auth/unauthorized-domain': 'Bu adres Firebase\'de izinli değil (Authentication → Settings → Authorized domains).',
    'auth/operation-not-allowed': 'Google ile giriş Firebase\'de açılmamış (Authentication → Sign-in method).',
  };
  async function signIn() {
    if (Room.busy()) { note = 'Önce ortak odadan çık, sonra giriş yap.'; return draw(); }
    try {
      await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (e) {
      note = e.code in ERR ? ERR[e.code] : 'Giriş yapılamadı: ' + (e.code || e.message);
      draw();
    }
  }
  async function signOut() {
    if (Room.busy()) { note = 'Önce ortak odadan çık.'; return draw(); }
    if (meta.dirty) await sync();
    await firebase.auth().signOut(); // bu tarayıcıdaki ilerleme yerinde kalır
  }

  // Ayarlar'daki "Hesap" kutusu
  function draw() {
    const box = document.getElementById('cloudBox');
    if (!box) return;
    box.hidden = !ok;
    const p = box.querySelector('p'), b = box.querySelector('button');
    if (user) {
      p.textContent = `Giriş yapıldı: ${user.email || user.displayName || 'Google hesabı'}. ${note}`;
      b.textContent = 'Çıkış yap';
      b.onclick = signOut;
    } else {
      p.textContent = note || 'Giriş yaparsan ilerlemen Google hesabında saklanır; başka cihazda da kaldığın yerden devam edersin.';
      b.textContent = 'Google ile giriş yap';
      b.onclick = signIn;
    }
  }

  function init() {
    draw();
    if (!ok) return markReady();
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    firebase.auth().onAuthStateChanged(u => { markReady(); attach(u); });
    addEventListener('visibilitychange', () => {
      if (!ref || !synced) return;
      if (document.hidden) { if (meta.dirty) sync(); } // kapanmadan önce yükle
      else if (!running) sync(); // geri dönünce başka cihazdaki değişikliği al
    });
  }

  return {
    init,
    queue,
    ready: () => readyP,
    signedIn: () => !!user,
    // Tüm ilerlemeyi sıfırlarken: sonraki açılışta boş kayıt hesaba da yazılsın
    wipe() { if (user) writeMeta({ ...meta, dirty: true }); },
  };
})();
