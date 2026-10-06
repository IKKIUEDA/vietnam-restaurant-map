// 地図の上に、区・市の名前を大きく表示します(サンプルの地図のように、地域の名前を目立たせる)
//   ・地図の画像にも小さく書かれていますが、その上に、大きめ・太めの文字で重ねて出します
//   ・日本語の画面では「英語(小さく)の下に日本語」、English / Tiếng Việt の画面では英語だけを出します
//   ・東京23区は ズーム 12〜15、そのほかの市は ズーム 11〜14 で表示します(それ以上拡大すると、細かい地図の邪魔になるため)
//   ・名前どうし、または お店のピン・駅などの目印と重なる名前は、出しません(拡大してすき間ができると出ます)
//   ・日本語の名前の中心を、地図の画像に書かれている同じ地名の位置にぴったり重ねて、下の小さな地名が見えにくいようにしています
//   ・位置と英語名は、OpenStreetMap のデータ(Overpass API)で調べた値です(© OpenStreetMap contributors)
//   ・クリックはできません。お店のピンや、駅・モールなどの目印より下に出ます

const placeNames = [
  // 東京23区
  { kind: "ward", name: { ja: "千代田区", en: "Chiyoda" }, lat: 35.6941, lng: 139.7535 },
  { kind: "ward", name: { ja: "中央区", en: "Chuo" }, lat: 35.6706, lng: 139.772 },
  { kind: "ward", name: { ja: "港区", en: "Minato" }, lat: 35.658, lng: 139.7515 },
  { kind: "ward", name: { ja: "新宿区", en: "Shinjuku" }, lat: 35.6938, lng: 139.7036 },
  { kind: "ward", name: { ja: "文京区", en: "Bunkyo" }, lat: 35.708, lng: 139.7523 },
  { kind: "ward", name: { ja: "台東区", en: "Taito" }, lat: 35.7126, lng: 139.7801 },
  { kind: "ward", name: { ja: "墨田区", en: "Sumida" }, lat: 35.7104, lng: 139.8017 },
  { kind: "ward", name: { ja: "江東区", en: "Koto" }, lat: 35.6728, lng: 139.817 },
  { kind: "ward", name: { ja: "品川区", en: "Shinagawa" }, lat: 35.6092, lng: 139.7302 },
  { kind: "ward", name: { ja: "目黒区", en: "Meguro" }, lat: 35.6408, lng: 139.6985 },
  { kind: "ward", name: { ja: "大田区", en: "Ota" }, lat: 35.5612, lng: 139.7158 },
  { kind: "ward", name: { ja: "世田谷区", en: "Setagaya" }, lat: 35.6469, lng: 139.6525 },
  { kind: "ward", name: { ja: "渋谷区", en: "Shibuya" }, lat: 35.6637, lng: 139.6977 },
  { kind: "ward", name: { ja: "中野区", en: "Nakano" }, lat: 35.7086, lng: 139.6629 },
  { kind: "ward", name: { ja: "杉並区", en: "Suginami" }, lat: 35.6995, lng: 139.6363 },
  { kind: "ward", name: { ja: "豊島区", en: "Toshima" }, lat: 35.7259, lng: 139.7166 },
  { kind: "ward", name: { ja: "北区", en: "Kita" }, lat: 35.7529, lng: 139.7338 },
  { kind: "ward", name: { ja: "荒川区", en: "Arakawa" }, lat: 35.7375, lng: 139.7813 },
  { kind: "ward", name: { ja: "板橋区", en: "Itabashi" }, lat: 35.7513, lng: 139.7088 },
  { kind: "ward", name: { ja: "練馬区", en: "Nerima" }, lat: 35.7358, lng: 139.6521 },
  { kind: "ward", name: { ja: "足立区", en: "Adachi" }, lat: 35.7746, lng: 139.8045 },
  { kind: "ward", name: { ja: "葛飾区", en: "Katsushika" }, lat: 35.7434, lng: 139.8473 },
  { kind: "ward", name: { ja: "江戸川区", en: "Edogawa" }, lat: 35.7066, lng: 139.8687 },

  { kind: "city", name: { ja: "さいたま市", en: "Saitama" }, lat: 35.8616, lng: 139.6456 },
  { kind: "city", name: { ja: "船橋市", en: "Funabashi" }, lat: 35.6946, lng: 139.9825 },
  { kind: "city", name: { ja: "武蔵野市", en: "Musashino" }, lat: 35.7177, lng: 139.566 },
  { kind: "city", name: { ja: "三鷹市", en: "Mitaka" }, lat: 35.6834, lng: 139.5592 },
  { kind: "city", name: { ja: "川越市", en: "Kawagoe" }, lat: 35.9251, lng: 139.4857 },
  { kind: "city", name: { ja: "調布市", en: "Chofu" }, lat: 35.6506, lng: 139.5407 },
  { kind: "city", name: { ja: "府中市", en: "Fuchu" }, lat: 35.6694, lng: 139.4774 },
  { kind: "city", name: { ja: "八王子市", en: "Hachioji" }, lat: 35.6664, lng: 139.3164 },
  { kind: "city", name: { ja: "町田市", en: "Machida" }, lat: 35.5467, lng: 139.4387 },
  { kind: "city", name: { ja: "所沢市", en: "Tokorozawa" }, lat: 35.7987, lng: 139.4697 },
  { kind: "city", name: { ja: "草加市", en: "Soka" }, lat: 35.8262, lng: 139.8062 },
  { kind: "city", name: { ja: "越谷市", en: "Koshigaya" }, lat: 35.8913, lng: 139.7915 },
  { kind: "city", name: { ja: "川口市", en: "Kawaguchi" }, lat: 35.8078, lng: 139.7241 },
  { kind: "city", name: { ja: "立川市", en: "Tachikawa" }, lat: 35.7139, lng: 139.4078 },
  { kind: "city", name: { ja: "川崎市", en: "Kawasaki" }, lat: 35.5307, lng: 139.7038 },
  { kind: "city", name: { ja: "横浜市", en: "Yokohama" }, lat: 35.4503, lng: 139.6344 },
  { kind: "city", name: { ja: "市川市", en: "Ichikawa" }, lat: 35.7216, lng: 139.9321 },
  { kind: "city", name: { ja: "成田市", en: "Narita" }, lat: 35.7768, lng: 140.3183 },
  { kind: "city", name: { ja: "木更津市", en: "Kisarazu" }, lat: 35.3811, lng: 139.9247 },
  { kind: "city", name: { ja: "松戸市", en: "Matsudo" }, lat: 35.7873, lng: 139.9049 },
  { kind: "city", name: { ja: "柏市", en: "Kashiwa" }, lat: 35.8676, lng: 139.9757 },
  { kind: "city", name: { ja: "習志野市", en: "Narashino" }, lat: 35.6817, lng: 140.0272 },
  { kind: "city", name: { ja: "厚木市", en: "Atsugi" }, lat: 35.443, lng: 139.3625 },
  { kind: "city", name: { ja: "大和市", en: "Yamato" }, lat: 35.4875, lng: 139.4579 },
  { kind: "city", name: { ja: "横須賀市", en: "Yokosuka" }, lat: 35.2815, lng: 139.672 },
  { kind: "city", name: { ja: "藤沢市", en: "Fujisawa" }, lat: 35.3389, lng: 139.4909 },
  { kind: "city", name: { ja: "鎌倉市", en: "Kamakura" }, lat: 35.3193, lng: 139.547 },
  { kind: "city", name: { ja: "海老名市", en: "Ebina" }, lat: 35.4464, lng: 139.3906 },
  { kind: "city", name: { ja: "相模原市", en: "Sagamihara" }, lat: 35.5715, lng: 139.3731 },
  { kind: "city", name: { ja: "浦安市", en: "Urayasu" }, lat: 35.6539, lng: 139.9026 },
  { kind: "city", name: { ja: "千葉市", en: "Chiba" }, lat: 35.6071, lng: 140.1063 },
];

// ここから下は、表示のしくみ(ふだんは触らなくてOK)

// 表示するズームの範囲(この範囲の外では出さない)
// (引いた地図では名前どうしが重なるので、少し拡大してから出す)
const PLACE_ZOOM = { ward: [12, 15], city: [11, 14] };

// 区・市の名前は、目印(450)より下・地図の絵(200)より上に置く
map.createPane("placeNamePane");
map.getPane("placeNamePane").style.zIndex = 430;
map.getPane("placeNamePane").style.pointerEvents = "none";

function placeNameIcon(p) {
  const html =
    currentLang === "ja"
      ? `<span class="place-name place-${p.kind}"><span class="place-en">${esc(p.name.en)}</span><span class="place-ja">${esc(p.name.ja)}</span></span>`
      : `<span class="place-name place-${p.kind}"><span class="place-ja">${esc(p.name.en)}</span></span>`;
  return L.divIcon({ className: "place-name-icon", html, iconSize: null });
}

const placeNameEntries = placeNames.map((p) => ({
  p,
  marker: L.marker([p.lat, p.lng], { pane: "placeNamePane", interactive: false, keyboard: false, icon: placeNameIcon(p) }),
}));

// ズームに合わせて、出す/隠す と、文字の大きさ(#map の data-place-zoom を CSS が見る)を決める
function updatePlaceNames() {
  const z = map.getZoom();
  map.getContainer().dataset.placeZoom = String(Math.max(10, Math.min(15, z)));
  placeNameEntries.forEach((e) => {
    const [min, max] = PLACE_ZOOM[e.p.kind];
    const show = z >= min && z <= max;
    if (show && !map.hasLayer(e.marker)) e.marker.addTo(map);
    if (!show && map.hasLayer(e.marker)) map.removeLayer(e.marker);
  });
}
map.on("zoomend", updatePlaceNames);
updatePlaceNames();

// 重なる名前を隠す(js/landmarks.js の declutterLandmarks から、最後に呼ばれる)
//   taken: すでに使われている場所(お店のピン・目印の画面上の四角形)
//   ・23区を先に、市をあとに置く。先に置いた名前と重なるものは隠す
function declutterPlaces(taken) {
  const used = taken.slice();
  placeNameEntries
    .filter((e) => map.hasLayer(e.marker))
    .sort((a, b) => (a.p.kind === b.p.kind ? 0 : a.p.kind === "ward" ? -1 : 1))
    .forEach((e) => {
      const el = e.marker.getElement() && e.marker.getElement().querySelector(".place-name");
      if (!el) return;
      el.style.visibility = "visible";
      // 英語の行(日本語の上に乗せている)も含めた、名前全体の四角形
      const ja = el.getBoundingClientRect();
      const enEl = el.querySelector(".place-en");
      const en = enEl ? enEl.getBoundingClientRect() : ja;
      const r = {
        left: Math.min(ja.left, en.left),
        right: Math.max(ja.right, en.right),
        top: Math.min(ja.top, en.top),
        bottom: Math.max(ja.bottom, en.bottom),
      };
      const hit = used.some((t) => r.left < t.right + 4 && t.left < r.right + 4 && r.top < t.bottom + 4 && t.top < r.bottom + 4);
      if (hit) el.style.visibility = "hidden";
      else used.push(r);
    });
}

// 言語を切り替えたら、文字も切り替える
document.getElementById("lang-select").addEventListener("change", () => {
  placeNameEntries.forEach((e) => e.marker.setIcon(placeNameIcon(e.p)));
});
