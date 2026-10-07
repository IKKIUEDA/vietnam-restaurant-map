// 駅に乗り入れている鉄道会社を、駅名の下に文字の札で表示します(大きく拡大したとき = ズーム15以上)
//   ・駅のマークと名前は、js/app.js の addAppStations が、全国の駅のデータ(data/stations-jp.json)から描いています
//   ・ここでは、いま地図に出ている駅を調べて、その駅の鉄道会社の札を、駅名の下に付けます
//   ・鉄道会社のデータは、OpenStreetMap に「運営会社」が登録されている駅の分だけです。登録が無い駅には、札は付きません
//   ・各社のロゴマークは商標のため使わず、文字だけの札にしています

const STATION_LINES_MIN_ZOOM = 15; // このズーム以上で、札を出す

map.createPane("stationLinesPane");
map.getPane("stationLinesPane").style.zIndex = 440; // 地図の絵より上、目印(450)とお店のピン(600)より下
map.getPane("stationLinesPane").style.pointerEvents = "none";

const stationLineMarkers = new Map(); // 「駅名|緯度|経度」→ 表示中の札

function stationLinesIcon(opIdx) {
  const ops = window.appStationOps || [];
  const chips = opIdx
    .map((i) => ops[i])
    .filter(Boolean)
    .map((o) => `<span class="lm-line">${esc(currentLang === "ja" ? o.ja : o.en)}</span>`)
    .join("");
  return L.divIcon({ className: "station-lines-icon", html: `<span class="station-lines">${chips}</span>`, iconSize: null });
}

// 地図に出ている駅を調べて、札を付け直す
function updateStationLines() {
  const gl = typeof vectorMaps !== "undefined" ? vectorMaps[0] : null;
  const z = map.getZoom();
  const seen = new Set();
  if (gl && z >= STATION_LINES_MIN_ZOOM && gl.getLayer("app-stations")) {
    let feats = [];
    try {
      feats = gl.queryRenderedFeatures({ layers: ["app-stations"] });
    } catch (e) {
      feats = [];
    }
    feats.forEach((f) => {
      const ops = String(f.properties.ops || "")
        .split(",")
        .filter((x) => x !== "")
        .map(Number);
      if (!ops.length) return;
      const [lng, lat] = f.geometry.coordinates;
      const key = `${f.properties.name}|${lat}|${lng}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (!stationLineMarkers.has(key)) {
        const m = L.marker([lat, lng], { pane: "stationLinesPane", interactive: false, keyboard: false, icon: stationLinesIcon(ops) });
        m.addTo(map);
        stationLineMarkers.set(key, { marker: m, ops });
      }
    });
  }
  // 地図から消えた駅の札は、外す
  stationLineMarkers.forEach((v, key) => {
    if (!seen.has(key)) {
      map.removeLayer(v.marker);
      stationLineMarkers.delete(key);
    }
  });
  map.getContainer().dataset.lang = currentLang;
}

let stationLinesTimer = null;
function scheduleStationLines() {
  clearTimeout(stationLinesTimer);
  stationLinesTimer = setTimeout(updateStationLines, 400);
}
let stationLinesDirty = true; // 地図を動かしたら true。描き終わったときに1回だけ調べ直す
map.on("zoomend moveend", () => {
  stationLinesDirty = true;
  scheduleStationLines();
});
// 背景の地図の描画が終わったときにも調べ直す(読み込みに時間がかかったとき用)。
// 描き終わるたびに毎回ではなく、地図を動かしたあとの1回だけ(スマホで重くならないように)
(function watchGl() {
  const gl = typeof vectorMaps !== "undefined" ? vectorMaps[0] : null;
  if (gl)
    gl.on("idle", () => {
      if (!stationLinesDirty || map.getZoom() < STATION_LINES_MIN_ZOOM) return;
      stationLinesDirty = false;
      scheduleStationLines();
    });
  else setTimeout(watchGl, 1000);
})();

// 言語を切り替えたら、札の文字も切り替える
document.getElementById("lang-select").addEventListener("change", () => {
  setTimeout(() => {
    stationLineMarkers.forEach((v) => v.marker.setIcon(stationLinesIcon(v.ops)));
    map.getContainer().dataset.lang = currentLang;
  }, 0);
});
