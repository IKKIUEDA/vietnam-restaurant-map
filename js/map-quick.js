// 地図の画面の、検索ボックスの下の「すぐに絞り込む」ボタン
//   ・エリア: 押すと、登録してあるエリア(ホームの「エリアから探す」と同じ駅のまわり)の一覧が開く。
//     選ぶと、その駅で検索したのと同じように、地図と一覧がそのエリアのお店になる
//   ・カテゴリ: レストラン・カフェ・食材店。押すとその種類だけ、もう一度押すと元に戻る
//   ・状態は、検索ボックス・種類の絞り込み(js/app.js)と同じものを使う(別の絞り込みは作らない)
const MAP_QUICK_TEXT = {
  ja: { area: "エリア", allAreas: "すべてのエリア", areaTitle: "エリアを選ぶ", close: "閉じる" },
  en: { area: "Area", allAreas: "All areas", areaTitle: "Choose an area", close: "Close" },
  vi: { area: "Khu vực", allAreas: "Tất cả khu vực", areaTitle: "Chọn khu vực", close: "Đóng" },
};
function mapQuickText() {
  return MAP_QUICK_TEXT[currentLang] || MAP_QUICK_TEXT.ja;
}
let mapQuickOpen = false;

// いま検索ボックスに入っているのが、登録してあるエリア(「〇〇駅」)なら、そのエリア
function mapQuickCurrentArea() {
  const q = (searchInput.value || "").trim();
  return HOME_AREAS.find((a) => a.station + "駅" === q) || null;
}

function renderMapQuick() {
  let box = document.getElementById("map-quick");
  if (!box) {
    const bar = document.getElementById("search-bar");
    if (!bar || typeof HOME_AREAS === "undefined") return;
    box = document.createElement("div");
    box.id = "map-quick";
    box.className = "map-quick";
    bar.appendChild(box);
  }
  const x = mapQuickText();
  const h = homeText();
  const area = mapQuickCurrentArea();
  const hasCafe = restaurants.some((s) => shopType(s) === "cafe");
  const typeChip = (key, label) => {
    const on = selectedType === key;
    return (
      `<button type="button" class="map-quick-chip${on ? " is-on" : ""}" data-quick-type="${key}" aria-pressed="${on}">` +
      `<img src="images/entries/${key}.png" alt="" width="22" height="22">${esc(label)}</button>`
    );
  };
  const areas = HOME_AREAS.map((a) => ({ a, n: homeAreaCount(a) })).filter((v) => v.n > 0);
  box.innerHTML =
    `<div class="map-quick-row">` +
    `<button type="button" class="map-quick-chip map-quick-area${area ? " is-on" : ""}" data-quick-area-toggle aria-expanded="${mapQuickOpen}">` +
    `<span aria-hidden="true">📍</span>${esc(area ? pick(area.name) : x.area)}` +
    `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>` +
    `<span class="map-quick-sep" aria-hidden="true"></span>` +
    typeChip("restaurant", h.entryRestaurant) +
    (hasCafe ? typeChip("cafe", h.entryCafe) : "") +
    typeChip("grocery", h.entryGrocery) +
    `</div>` +
    (mapQuickOpen
      ? `<div class="map-quick-panel" role="dialog" aria-label="${esc(x.areaTitle)}">` +
        `<div class="map-quick-panel-head"><span>${esc(x.areaTitle)}</span>` +
        `<button type="button" class="map-quick-close" data-quick-area-toggle aria-label="${esc(x.close)}">✕</button></div>` +
        `<ul class="map-quick-areas">` +
        `<li><button type="button" class="map-quick-area-item${area ? "" : " is-on"}" data-quick-area="">${esc(x.allAreas)}</button></li>` +
        areas
          .map(
            ({ a, n }) =>
              `<li><button type="button" class="map-quick-area-item${area === a ? " is-on" : ""}" data-quick-area="${esc(a.station)}">` +
              `<span>${esc(pick(a.name))}</span><small>${esc(h.areaCount(n))}</small></button></li>`
          )
          .join("") +
        `</ul></div>`
      : "");
}

document.addEventListener("click", (event) => {
  const t = event.target;
  if (!t.closest) return;
  const toggle = t.closest("[data-quick-area-toggle]");
  if (toggle) {
    mapQuickOpen = !mapQuickOpen;
    renderMapQuick();
    return;
  }
  const item = t.closest("[data-quick-area]");
  if (item) {
    const station = item.dataset.quickArea;
    mapQuickOpen = false;
    // 「〇〇駅」で検索したのと同じ(ホームの「エリアから探す」と同じ動き)。「すべて」は検索を消す
    searchInput.value = station ? station + "駅" : "";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    renderMapQuick();
    return;
  }
  const type = t.closest("[data-quick-type]");
  if (type) {
    const key = type.dataset.quickType;
    selectType(selectedType === key ? ALL : key); // もう一度押すと、すべての種類に戻す
    return;
  }
  // 一覧の外を押したら、エリアの一覧を閉じる
  if (mapQuickOpen && !t.closest("#map-quick")) {
    mapQuickOpen = false;
    renderMapQuick();
  }
});
// 検索ボックスに直接打ったときも、「エリア」ボタンの表示を合わせる
searchInput.addEventListener("input", () => {
  if (!mapQuickOpen) renderMapQuick();
});
renderMapQuick();
