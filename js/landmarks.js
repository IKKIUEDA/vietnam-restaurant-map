// 地図の「目印」(大きな駅・大学・観光地・空港)の名前を、地図の上に大きめの文字で表示します。
//   ・お店ではないので、クリックしても何も開きません(一覧にも出ません)
//   ・優先順位(下の landmarkKinds の priority)の順に、地図を引いた状態から出ます。
//       1 駅 → 2 大型ショッピングモール・空港 → 3 大学・観光地 の順。数字が小さいほど、文字も大きい
//   ・文字が、お店のピンや、優先順位の高い目印と重なるときは、その目印を隠します(拡大すると出てきます)
//   ・位置(緯度・経度)は、OpenStreetMap のデータ(Nominatim の検索)か、国土地理院の住所検索で調べた値です。
//     ※ 横浜中華街・みなとみらい・川越・空港は、おおよその位置です(コメントに「※」)
//   ・目印を増やしたいときは、下の landmarks に1行足すだけでOKです
//       kind : "station"(駅) / "mall"(大型ショッピングモール) / "airport"(空港) / "university"(大学) / "sight"(観光地)
//       name : { ja, en }(ベトナム語の画面では、en の文字を出します)

// 種類ごとの記号・優先順位・表示を始めるズーム(この数字以上で出る。大きいほど、拡大しないと出ない)
//   icon : 丸いマークの中に描く、白い絵(SVG の線。Google マップのような、色つきの丸 + 白い絵)
//   ※ 色は css/style.css の .lm-station など(種類ごと)で決めています
const landmarkKinds = {
  station: {
    priority: 1,
    minZoom: 11,
    icon: "M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  },
  mall: {
    priority: 2,
    minZoom: 12,
    icon: "M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 4c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2zm2-6c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm4 6c0 .55-.45 1-1 1s-1-.45-1-1V8h2v2z",
  },
  airport: {
    priority: 2,
    minZoom: 12,
    icon: "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z",
  },
  university: {
    priority: 3,
    minZoom: 13,
    icon: "M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z",
  },
  sight: {
    priority: 3,
    minZoom: 13,
    icon: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  },
};

const landmarks = [
  // 駅
  { kind: "station", name: { ja: "東京駅", en: "Tokyo Sta." }, lat: 35.68124, lng: 139.76712 },
  { kind: "station", name: { ja: "新宿駅", en: "Shinjuku Sta." }, lat: 35.69038, lng: 139.70040 },
  { kind: "station", name: { ja: "渋谷駅", en: "Shibuya Sta." }, lat: 35.65886, lng: 139.70034 },
  { kind: "station", name: { ja: "池袋駅", en: "Ikebukuro Sta." }, lat: 35.73123, lng: 139.70841 },
  { kind: "station", name: { ja: "上野駅", en: "Ueno Sta." }, lat: 35.71404, lng: 139.77712 },
  { kind: "station", name: { ja: "品川駅", en: "Shinagawa Sta." }, lat: 35.62748, lng: 139.73777 },
  { kind: "station", name: { ja: "横浜駅", en: "Yokohama Sta." }, lat: 35.46601, lng: 139.62264 },
  { kind: "station", name: { ja: "川崎駅", en: "Kawasaki Sta." }, lat: 35.53009, lng: 139.69825 },
  { kind: "station", name: { ja: "大宮駅", en: "Omiya Sta." }, lat: 35.90638, lng: 139.62433 },
  { kind: "station", name: { ja: "千葉駅", en: "Chiba Sta." }, lat: 35.61287, lng: 140.11525 },
  { kind: "station", name: { ja: "船橋駅", en: "Funabashi Sta." }, lat: 35.70173, lng: 139.98497 },
  { kind: "station", name: { ja: "柏駅", en: "Kashiwa Sta." }, lat: 35.86171, lng: 139.97017 },

  // 大型ショッピングモール
  { kind: "mall", name: { ja: "イオンレイクタウン", en: "AEON Lake Town" }, lat: 35.88248, lng: 139.82832 },
  { kind: "mall", name: { ja: "イオンモール幕張新都心", en: "AEON Mall Makuhari" }, lat: 35.65609, lng: 140.02652 },
  { kind: "mall", name: { ja: "ららぽーとTOKYO-BAY", en: "LaLaport TOKYO-BAY" }, lat: 35.68624, lng: 139.9902 },
  { kind: "mall", name: { ja: "イオンモール浦和美園", en: "AEON Mall Urawa Misono" }, lat: 35.89084, lng: 139.73152 },
  { kind: "mall", name: { ja: "ラゾーナ川崎プラザ", en: "LAZONA Kawasaki" }, lat: 35.5314, lng: 139.6958 },
  { kind: "mall", name: { ja: "ららぽーと横浜", en: "LaLaport Yokohama" }, lat: 35.5173, lng: 139.56642 },
  { kind: "mall", name: { ja: "ららぽーと豊洲", en: "LaLaport Toyosu" }, lat: 35.6563, lng: 139.79292 },
  { kind: "mall", name: { ja: "ダイバーシティ東京", en: "DiverCity Tokyo" }, lat: 35.62508, lng: 139.77408 },
  { kind: "mall", name: { ja: "ららぽーと富士見", en: "LaLaport Fujimi" }, lat: 35.85875, lng: 139.54791 },
  { kind: "mall", name: { ja: "ららぽーと海老名", en: "LaLaport Ebina" }, lat: 35.45557, lng: 139.38898 },
  { kind: "mall", name: { ja: "テラスモール湘南", en: "Terrace Mall Shonan" }, lat: 35.33724, lng: 139.44649 },
  { kind: "mall", name: { ja: "ららぽーと立川立飛", en: "LaLaport Tachikawa Tachihi" }, lat: 35.71406, lng: 139.4115 },
  { kind: "mall", name: { ja: "アリオ西新井", en: "Ario Nishiarai" }, lat: 35.77469, lng: 139.78578 },
  { kind: "mall", name: { ja: "イオンモール成田", en: "AEON Mall Narita" }, lat: 35.79525, lng: 140.31891 },

  // 大学
  { kind: "university", name: { ja: "東京大学", en: "Univ. of Tokyo" }, lat: 35.71172, lng: 139.76375 },
  { kind: "university", name: { ja: "早稲田大学", en: "Waseda Univ." }, lat: 35.70918, lng: 139.71972 },
  { kind: "university", name: { ja: "慶應義塾大学(三田)", en: "Keio Univ. (Mita)" }, lat: 35.64884, lng: 139.74277 },
  { kind: "university", name: { ja: "慶應義塾大学(日吉)", en: "Keio Univ. (Hiyoshi)" }, lat: 35.55208, lng: 139.64958 },
  { kind: "university", name: { ja: "上智大学", en: "Sophia Univ." }, lat: 35.68319, lng: 139.73274 },
  { kind: "university", name: { ja: "明治大学", en: "Meiji Univ." }, lat: 35.69771, lng: 139.7614 }, // 駿河台
  { kind: "university", name: { ja: "横浜国立大学", en: "Yokohama National Univ." }, lat: 35.4738, lng: 139.59005 },
  { kind: "university", name: { ja: "千葉大学", en: "Chiba Univ." }, lat: 35.62744, lng: 140.10338 },
  { kind: "university", name: { ja: "埼玉大学", en: "Saitama Univ." }, lat: 35.86197, lng: 139.60759 },

  // 観光地
  { kind: "sight", name: { ja: "浅草寺", en: "Senso-ji" }, lat: 35.7134, lng: 139.79553 },
  { kind: "sight", name: { ja: "東京スカイツリー", en: "Tokyo Skytree" }, lat: 35.71005, lng: 139.81071 },
  { kind: "sight", name: { ja: "東京タワー", en: "Tokyo Tower" }, lat: 35.65845, lng: 139.74554 },
  { kind: "sight", name: { ja: "皇居", en: "Imperial Palace" }, lat: 35.68385, lng: 139.75069 },
  { kind: "sight", name: { ja: "明治神宮", en: "Meiji Jingu" }, lat: 35.6764, lng: 139.6993 }, // ※ おおよその位置
  { kind: "sight", name: { ja: "横浜中華街", en: "Yokohama Chinatown" }, lat: 35.4426, lng: 139.6455 }, // ※ おおよその位置
  { kind: "sight", name: { ja: "みなとみらい", en: "Minato Mirai" }, lat: 35.457, lng: 139.633 }, // ※ おおよその位置
  { kind: "sight", name: { ja: "鶴岡八幡宮", en: "Tsurugaoka Hachimangu" }, lat: 35.32455, lng: 139.55475 },
  { kind: "sight", name: { ja: "東京ディズニーリゾート", en: "Tokyo Disney Resort" }, lat: 35.63126, lng: 139.87433 },
  { kind: "sight", name: { ja: "成田山新勝寺", en: "Naritasan Shinshoji" }, lat: 35.78523, lng: 140.31722 },
  { kind: "sight", name: { ja: "川越 蔵造りの町並み", en: "Kawagoe Old Town" }, lat: 35.9221, lng: 139.4825 }, // ※ おおよその位置

  // 空港
  { kind: "airport", name: { ja: "羽田空港", en: "Haneda Airport" }, lat: 35.5494, lng: 139.7798 }, // ※ おおよその位置
  { kind: "airport", name: { ja: "成田空港", en: "Narita Airport" }, lat: 35.772, lng: 140.3929 }, // ※ おおよその位置
];

// ここから下は、表示のしくみ(ふだんは触らなくてOK)

const LANDMARK_MIN_ZOOM = 11; // このズームより引いた地図(関東全体など)では、目印を1つも出さない

// 目印は、お店のピンより下・地図の絵より上の、専用の重なり(pane)に置く
map.createPane("landmarkPane");
map.getPane("landmarkPane").style.zIndex = 450; // 地図の絵(200)より上、お店のピン(600)より下
map.getPane("landmarkPane").style.pointerEvents = "none"; // クリックは、下の地図にそのまま通す

function landmarkLabel(lm) {
  const kind = landmarkKinds[lm.kind] || landmarkKinds.sight;
  const text = currentLang === "ja" ? lm.name.ja : lm.name.en || lm.name.ja;
  // 色つきの丸いマーク(中に白い絵) + その右に名前。マークの中心が、実際の場所に来る
  return (
    `<span class="landmark-label lm-${lm.kind} landmark-p${kind.priority}">` +
    `<span class="lm-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${kind.icon}"/></svg></span>` +
    `<span class="lm-text">${esc(text)}</span></span>`
  );
}
function landmarkIcon(lm) {
  return L.divIcon({ className: "landmark-icon", html: landmarkLabel(lm), iconSize: null });
}

// 優先順位の高い順(同じ順位なら、上の一覧の順)に並べておく。重なったときは、先に置いたほうを残す
const landmarkEntries = landmarks
  .map((lm, i) => ({
    lm,
    order: i,
    kind: landmarkKinds[lm.kind] || landmarkKinds.sight,
    marker: L.marker([lm.lat, lm.lng], {
      pane: "landmarkPane",
      interactive: false, // クリックしても、何も開かない
      keyboard: false,
      icon: landmarkIcon(lm),
    }),
  }))
  .sort((a, b) => a.kind.priority - b.kind.priority || a.order - b.order);
const landmarkLayer = L.layerGroup(landmarkEntries.map((e) => e.marker));

// 2つの四角形(画面上の位置)が重なっているか(少しすき間をあけて判定する)
function rectsOverlap(a, b, gap = 3) {
  return a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom + gap && b.top < a.bottom + gap;
}

// いまのズームで出す目印を決めて、重なるものを隠す
function declutterLandmarks() {
  const z = map.getZoom();
  if (z < LANDMARK_MIN_ZOOM) {
    if (map.hasLayer(landmarkLayer)) map.removeLayer(landmarkLayer);
    return;
  }
  if (!map.hasLayer(landmarkLayer)) landmarkLayer.addTo(map);
  map.getContainer().dataset.landmarkSize = z >= 15 ? "large" : z >= 13 ? "medium" : "small";

  // お店のピン・数字の丸は、目印より優先する(その場所には、目印の文字を出さない)
  const taken = [...map.getPane("markerPane").querySelectorAll(".leaflet-marker-icon")].map((el) =>
    el.getBoundingClientRect()
  );
  landmarkEntries.forEach((e) => {
    const el = e.marker.getElement() && e.marker.getElement().querySelector(".landmark-label");
    if (!el) return;
    if (z < e.kind.minZoom) {
      el.style.visibility = "hidden";
      return;
    }
    el.style.visibility = "visible";
    const r = el.getBoundingClientRect();
    if (taken.some((t) => rectsOverlap(r, t))) {
      el.style.visibility = "hidden";
    } else {
      taken.push(r);
    }
  });
}

// 地図を動かしたり拡大したりしたあと、お店のピンのまとめ直し(アニメーション)が終わるのを待ってから判定する
let declutterTimer = null;
function scheduleDeclutter() {
  clearTimeout(declutterTimer);
  declutterTimer = setTimeout(declutterLandmarks, 350);
}
map.on("zoomend moveend", scheduleDeclutter);
clusterGroup.on("animationend", scheduleDeclutter); // ピンのまとめ直しが終わったとき
declutterLandmarks();

// 言語を切り替えたら、目印の文字も切り替える(文字の長さが変わるので、重なりも判定し直す)
document.getElementById("lang-select").addEventListener("change", () => {
  landmarkEntries.forEach((e) => e.marker.setIcon(landmarkIcon(e.lm)));
  scheduleDeclutter();
});
