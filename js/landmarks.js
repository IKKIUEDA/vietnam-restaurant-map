// 地図の「目印」(大きな駅・大学・観光地・空港)の名前を、地図の上に大きめの文字で表示します。
//   ・お店ではないので、クリックしても何も開きません(一覧にも出ません)
//   ・地図を少し引いた状態(ズーム 11 以上 = 東京都全体くらい)から表示し、拡大するほど文字も大きくなります
//   ・位置(緯度・経度)は、OpenStreetMap のデータ(Nominatim の検索)で調べた値です。
//     ※ 上智大学〜成田空港の一部は、検索が混み合って調べられなかったため、おおよその位置です(コメントに「※」)
//   ・目印を増やしたいときは、下の landmarks に1行足すだけでOKです
//       kind : "station"(駅) / "university"(大学) / "sight"(観光地) / "airport"(空港)
//       name : { ja, en }(ベトナム語の画面では、en の文字を出します)

const landmarkIcons = { station: "🚉", university: "🎓", sight: "📍", airport: "✈️" };

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

  // 大学
  { kind: "university", name: { ja: "東京大学", en: "Univ. of Tokyo" }, lat: 35.71172, lng: 139.76375 },
  { kind: "university", name: { ja: "早稲田大学", en: "Waseda Univ." }, lat: 35.70918, lng: 139.71972 },
  { kind: "university", name: { ja: "慶應義塾大学(三田)", en: "Keio Univ. (Mita)" }, lat: 35.64884, lng: 139.74277 },
  { kind: "university", name: { ja: "慶應義塾大学(日吉)", en: "Keio Univ. (Hiyoshi)" }, lat: 35.55208, lng: 139.64958 },
  { kind: "university", name: { ja: "上智大学", en: "Sophia Univ." }, lat: 35.6838, lng: 139.7314 }, // ※ おおよその位置
  { kind: "university", name: { ja: "明治大学", en: "Meiji Univ." }, lat: 35.6975, lng: 139.7612 }, // ※ おおよその位置(駿河台)
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
  { kind: "sight", name: { ja: "鶴岡八幡宮", en: "Tsurugaoka Hachimangu" }, lat: 35.3259, lng: 139.5565 }, // ※ おおよその位置
  { kind: "sight", name: { ja: "東京ディズニーリゾート", en: "Tokyo Disney Resort" }, lat: 35.6329, lng: 139.8804 }, // ※ おおよその位置
  { kind: "sight", name: { ja: "成田山新勝寺", en: "Naritasan Shinshoji" }, lat: 35.7862, lng: 140.3183 }, // ※ おおよその位置
  { kind: "sight", name: { ja: "川越 蔵造りの町並み", en: "Kawagoe Old Town" }, lat: 35.9221, lng: 139.4825 }, // ※ おおよその位置

  // 空港
  { kind: "airport", name: { ja: "羽田空港", en: "Haneda Airport" }, lat: 35.5494, lng: 139.7798 }, // ※ おおよその位置
  { kind: "airport", name: { ja: "成田空港", en: "Narita Airport" }, lat: 35.772, lng: 140.3929 }, // ※ おおよその位置
];

// ここから下は、表示のしくみ(ふだんは触らなくてOK)

const LANDMARK_MIN_ZOOM = 11; // このズームより引いた地図(関東全体など)では、目印を出さない(地図がごちゃごちゃしないように)

// 目印は、お店のピンより下・地図の絵より上の、専用の重なり(pane)に置く
map.createPane("landmarkPane");
map.getPane("landmarkPane").style.zIndex = 450; // 地図の絵(200)より上、お店のピン(600)より下
map.getPane("landmarkPane").style.pointerEvents = "none"; // クリックは、下の地図にそのまま通す

function landmarkLabel(lm) {
  const text = currentLang === "ja" ? lm.name.ja : lm.name.en || lm.name.ja;
  return `<span class="landmark-label landmark-${lm.kind}">${landmarkIcons[lm.kind] || ""} ${esc(text)}</span>`;
}

const landmarkMarkers = landmarks.map((lm) =>
  L.marker([lm.lat, lm.lng], {
    pane: "landmarkPane",
    interactive: false, // クリックしても、何も開かない
    keyboard: false,
    icon: L.divIcon({ className: "landmark-icon", html: landmarkLabel(lm), iconSize: null }),
  })
);
const landmarkLayer = L.layerGroup(landmarkMarkers);

// ズームに合わせて、目印を出す/隠す。文字の大きさは、地図の箱に付けた data-landmark-size で、CSS が切り替える
function updateLandmarks() {
  const z = map.getZoom();
  if (z >= LANDMARK_MIN_ZOOM) {
    if (!map.hasLayer(landmarkLayer)) landmarkLayer.addTo(map);
  } else if (map.hasLayer(landmarkLayer)) {
    map.removeLayer(landmarkLayer);
  }
  map.getContainer().dataset.landmarkSize = z >= 15 ? "large" : z >= 13 ? "medium" : "small";
}
map.on("zoomend", updateLandmarks);
updateLandmarks();

// 言語を切り替えたら、目印の文字も切り替える
document.getElementById("lang-select").addEventListener("change", () => {
  landmarkMarkers.forEach((m, i) =>
    m.setIcon(L.divIcon({ className: "landmark-icon", html: landmarkLabel(landmarks[i]), iconSize: null }))
  );
});
