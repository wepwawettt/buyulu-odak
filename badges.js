// Başarımlar: ilerlemeden hesaplanan rozetler. Kazanılan her rozet +2 altın.
// Kazanılanlar data.badges'ta { id: 'YYYY-AA-GG' } olarak tutulur.
const Badges = (() => {
  const days = () => Object.values(data.days);
  const pomos = () => days().reduce((a, d) => a + (d.pomos || 0), 0);
  const hours = () => days().reduce((a, d) => a + (d.sec || 0), 0) / 3600;
  const flag = k => !!data.flags?.[k];

  // Şimdiye kadarki en uzun seri (üst üste oturum yapılan günler)
  function longest() {
    const keys = Object.keys(data.days).filter(k => data.days[k].pomos > 0).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      const d = new Date(k + 'T12:00');
      run = prev && Math.round((d - prev) / 864e5) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = d;
    }
    return best;
  }

  const LIST = [
    { id: 'ilk', icon: '✦', name: 'İlk Büyü', desc: 'İlk odak oturumunu tamamla.', ok: () => pomos() >= 1 },
    { id: 'cirak', icon: '✦', name: 'Çırak', desc: '10 odak oturumu tamamla.', ok: () => pomos() >= 10 },
    { id: 'usta', icon: '✦', name: 'Usta Büyücü', desc: '100 odak oturumu tamamla.', ok: () => pomos() >= 100 },
    { id: 'saat10', icon: '⧗', name: 'Kum Saati', desc: 'Toplam 10 saat odaklan.', ok: () => hours() >= 10 },
    { id: 'saat50', icon: '⧗', name: 'Zaman Bükücü', desc: 'Toplam 50 saat odaklan.', ok: () => hours() >= 50 },
    { id: 'hedef', icon: '◎', name: 'Hedef Tamam', desc: 'Bir günde günlük hedefine ulaş.', ok: () => days().some(d => d.sec >= data.settings.goal * 60) },
    { id: 'seri3', icon: '▲', name: 'Kıvılcım', desc: '3 gün üst üste çalış.', ok: () => longest() >= 3 },
    { id: 'seri7', icon: '▲', name: 'Alev', desc: '7 gün üst üste çalış.', ok: () => longest() >= 7 },
    { id: 'seri30', icon: '▲', name: 'Ejderha Ateşi', desc: '30 gün üst üste çalış.', ok: () => longest() >= 30 },
    { id: 'iksir', icon: '♁', name: 'İlk İksir', desc: 'Bir iksir demleyip iç.', ok: () => (data.potionsMade || 0) >= 1 },
    { id: 'tarif', icon: '♁', name: 'İksir Ustası', desc: 'Bütün iksir tariflerini öğren.', ok: () => (data.recipes || []).length >= 3 },
    { id: 'kale', icon: '⌂', name: 'Kale Kahramanı', desc: '10 kale görevi tamamla.', ok: () => (data.questsDone || 0) >= 10 },
    { id: 'gece', icon: '☾', name: 'Gece Kuşu', desc: 'Gece yarısından sonra bir oturum bitir.', ok: () => flag('night') },
    { id: 'sabah', icon: '☼', name: 'Erken Kalkan', desc: "Sabah 05.00–07.00 arası bir oturum bitir.", ok: () => flag('early') },
    { id: 'dukkan', icon: '◆', name: 'Koleksiyoncu', desc: 'Dükkandan 5 eşya al.', ok: () => data.owned.length >= 5 },
    { id: 'moda', icon: '◇', name: 'Moda Büyücüsü', desc: '3 kıyafete sahip ol.', ok: () => data.outfits.length >= 3 },
    { id: 'arkadas', icon: '♥', name: 'Çalışma Arkadaşı', desc: 'Ortak odada bir arkadaşınla oturum bitir.', ok: () => flag('room') },
    { id: 'yumurta', icon: '◉', name: 'Yumurta Çatladı', desc: 'Evcil hayvanının yumurtası çatlasın.', ok: () => !!data.pet?.species },
    { id: 'buyuk', icon: '◉', name: 'Büyük Dost', desc: 'Evcil hayvanın yetişkin olsun.', ok: () => (data.pet?.sec || 0) >= 30 * 3600 },
    { id: 'gozlem', icon: '☆', name: 'Yıldız Gözcüsü', desc: 'Gözlemevindeki teleskoptan yıldız falına bak.', ok: () => flag('sky') },
    { id: 'arsiv', icon: '▤', name: 'Arşiv Faresi', desc: 'Gizli Kütüphanedeki eski kitabı oku.', ok: () => flag('book') },
    { id: 'mezun', icon: '♛', name: 'Mezun', desc: 'Okulu bitir (120 saat odak).', ok: () => hours() >= 120 },
  ];

  // save() her kayıtta çağırır; yeni rozet kazanıldıysa altın verir ve kutlar
  function check() {
    const got = (data.badges ||= {});
    const fresh = LIST.filter(b => !got[b.id] && b.ok());
    if (!fresh.length) return;
    for (const b of fresh) got[b.id] = todayKey();
    data.coins += 2 * fresh.length;
    toastLater(fresh.length > 1 ? `${fresh.length} yeni rozet kazandın! +${2 * fresh.length} altın`
      : `Yeni rozet: ${fresh[0].name}! +2 altın`);
    if (badgeDlg.open) render();
  }

  function render() {
    const got = data.badges || {};
    const box = document.getElementById('badgeList');
    document.getElementById('badgeCount').textContent = `${LIST.filter(b => got[b.id]).length} / ${LIST.length}`;
    box.innerHTML = '';
    for (const b of LIST) {
      const div = document.createElement('div');
      div.className = 'badge' + (got[b.id] ? ' got' : '');
      div.innerHTML = '<i></i><div><b></b><small></small></div>';
      div.querySelector('i').textContent = got[b.id] ? b.icon : '?';
      div.querySelector('b').textContent = b.name;
      div.querySelector('small').textContent = b.desc;
      box.appendChild(div);
    }
  }

  return { check, render, longest };
})();
