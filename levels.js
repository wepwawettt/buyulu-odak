// Sınıflar: toplam odak saatiyle 1. sınıftan Mezun'a. Bazı sınıflar kalede yeni alan açar,
// bazıları kıyafet, altın ya da oda süsü verir. Ulaşılan en yüksek sınıf data.level'da tutulur.
const Levels = (() => {
  const LIST = [
    { name: '1. Sınıf', h: 0, reward: 'Okula hoş geldin!' },
    { name: '2. Sınıf', h: 5, reward: '+5 altın', coins: 5 },
    { name: '3. Sınıf', h: 12, reward: 'Kalede Gözlemevi açılır' },
    { name: '4. Sınıf', h: 25, reward: 'Bilgin Cübbesi (kıyafet)', outfit: 'bilgin' },
    { name: '5. Sınıf', h: 40, reward: 'Odanın duvarına yıldız haritası' },
    { name: '6. Sınıf', h: 60, reward: 'Kalede Gizli Kütüphane açılır' },
    { name: '7. Sınıf', h: 85, reward: 'Kıdemli Cübbesi (kıyafet)', outfit: 'kidemli' },
    { name: 'Mezun', h: 120, reward: 'Mezuniyet Cübbesi ve "Mezun" unvanı', outfit: 'mezun' },
  ];
  const OBSERVATORY = 2, LIBRARY = 5, CHART = 4; // hangi sınıf neyi açar (LIST sırası)
  const hours = () => Object.values(data.days).reduce((a, d) => a + (d.sec || 0), 0) / 3600;
  const level = () => LIST.reduce((l, x, i) => (hours() >= x.h ? i : l), 0);

  // save() her kayıtta çağırır: sınıf atlandıysa ödülleri ver ve kutla
  function check() {
    const now = level(), was = data.level ?? 0;
    for (const x of LIST.slice(0, now + 1)) if (x.outfit && !data.outfits.includes(x.outfit)) data.outfits.push(x.outfit);
    Scene.setChart(now >= CHART);
    if (now <= was) return;
    for (const x of LIST.slice(was + 1, now + 1)) if (x.coins) data.coins += x.coins;
    data.level = now;
    toastLater(`${LIST[now].name}'a geçtin! Ödül: ${LIST[now].reward}`);
    try { chime(); } catch {}
  }

  // Rozetler panelinin üstündeki sınıf kutusu
  function render() {
    const now = level(), h = hours(), next = LIST[now + 1];
    const box = document.getElementById('classBox');
    box.innerHTML = '<b></b><div class="bar"><div></div></div><small></small><ol class="class-list"></ol>';
    box.querySelector('b').textContent = LIST[now].name;
    const pct = next ? Math.min(100, 100 * (h - LIST[now].h) / (next.h - LIST[now].h)) : 100;
    box.querySelector('.bar div').style.width = pct + '%';
    box.querySelector('small').textContent = next
      ? `${next.name} için ${Math.ceil(next.h - h)} sa odak kaldı (toplam ${Math.floor(h)} sa)`
      : `Okulu bitirdin! Toplam ${Math.floor(h)} sa odak.`;
    const ol = box.querySelector('ol');
    LIST.forEach((x, i) => {
      const li = document.createElement('li');
      li.className = i <= now ? 'got' : '';
      li.textContent = `${x.name} (${x.h} sa): ${x.reward}`;
      ol.appendChild(li);
    });
  }

  return {
    check, render, level,
    name: () => LIST[level()].name,
    observatory: () => level() >= OBSERVATORY,
    library: () => level() >= LIBRARY,
    need: i => LIST[i],
    OBSERVATORY, LIBRARY,
  };
})();
