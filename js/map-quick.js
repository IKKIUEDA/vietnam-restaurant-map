// 地図の画面の、検索ボックスの下の「すぐに絞り込む」ボタン
//   ・エリア: 押すと、登録してあるエリア(ホームの「エリアから探す」と同じ駅のまわり)の一覧が開く。
//     選ぶと、その駅で検索したのと同じように、地図と一覧がそのエリアのお店になる
//   ・カテゴリーから探す: 押すと、レストラン・カフェ・食材店の一覧が開く。選ぶとその種類だけになる
//     (選んでいる間は、ボタンにその種類の名前が出る。「すべてのカテゴリー」で元に戻る)
//   ・状態は、検索ボックス・種類の絞り込み(js/app.js)と同じものを使う(別の絞り込みは作らない)
const MAP_QUICK_TEXT = {
  ja: { area: "エリア", allAreas: "すべてのエリア", areaTitle: "エリアを選ぶ", close: "閉じる",
        category: "カテゴリーから探す", allCategories: "すべてのカテゴリー", categoryTitle: "カテゴリーを選ぶ" },
  en: { area: "Area", allAreas: "All areas", areaTitle: "Choose an area", close: "Close",
        category: "Browse by category", allCategories: "All categories", categoryTitle: "Choose a category" },
  vi: { area: "Khu vực", allAreas: "Tất cả khu vực", areaTitle: "Chọn khu vực", close: "Đóng",
        category: "Tìm theo danh mục", allCategories: "Tất cả danh mục", categoryTitle: "Chọn danh mục" },
};
function mapQuickText() {
  return MAP_QUICK_TEXT[currentLang] || MAP_QUICK_TEXT.ja;
}
let mapQuickOpen = false; // 開いている一覧: false(閉じている) | "area" | "category"

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
  const types = [
    { key: "restaurant", label: h.entryRestaurant },
    ...(hasCafe ? [{ key: "cafe", label: h.entryCafe }] : []),
    { key: "grocery", label: h.entryGrocery },
  ];
  const curType = types.find((v) => v.key === selectedType) || null;
  const caret =
    `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
  const typeIcon = (key) => `<img src="images/entries/${key}.png" alt="" width="22" height="22">`;
  const areas = HOME_AREAS.map((a) => ({ a, n: homeAreaCount(a) })).filter((v) => v.n > 0);

  // 開いた一覧の、上の見出しと「✕」
  const panelHead = (title, which) =>
    `<div class="map-quick-panel-head"><span>${esc(title)}</span>` +
    `<button type="button" class="map-quick-close" data-quick-toggle="${which}" aria-label="${esc(x.close)}">✕</button></div>`;

  let panel = "";
  if (mapQuickOpen === "area") {
    panel =
      `<div class="map-quick-panel" role="dialog" aria-label="${esc(x.areaTitle)}">` +
      panelHead(x.areaTitle, "area") +
      `<ul class="map-quick-areas">` +
      `<li><button type="button" class="map-quick-area-item${area ? "" : " is-on"}" data-quick-area="">${esc(x.allAreas)}</button></li>` +
      areas
        .map(
          ({ a, n }) =>
            `<li><button type="button" class="map-quick-area-item${area === a ? " is-on" : ""}" data-quick-area="${esc(a.station)}">` +
            `<span>${esc(pick(a.name))}</span><small>${esc(h.areaCount(n))}</small></button></li>`
        )
        .join("") +
      `</ul></div>`;
  } else if (mapQuickOpen === "category") {
    panel =
      `<div class="map-quick-panel" role="dialog" aria-label="${esc(x.categoryTitle)}">` +
      panelHead(x.categoryTitle, "category") +
      `<ul class="map-quick-areas map-quick-types">` +
      `<li><button type="button" class="map-quick-area-item${curType ? "" : " is-on"}" data-quick-type="${ALL}">${esc(x.allCategories)}</button></li>` +
      types
        .map(
          (v) =>
            `<li><button type="button" class="map-quick-area-item${curType === v ? " is-on" : ""}" data-quick-type="${v.key}">` +
            `<span class="map-quick-type-name">${typeIcon(v.key)}${esc(v.label)}</span></button></li>`
        )
        .join("") +
      `</ul></div>`;
  }

  box.innerHTML =
    `<div class="map-quick-row">` +
    `<button type="button" class="map-quick-chip map-quick-area${area ? " is-on" : ""}" data-quick-toggle="area" aria-expanded="${mapQuickOpen === "area"}">` +
    `<span aria-hidden="true">📍</span>${esc(area ? pick(area.name) : x.area)}${caret}</button>` +
    `<button type="button" class="map-quick-chip map-quick-category${curType ? " is-on" : ""}" data-quick-toggle="category" aria-expanded="${mapQuickOpen === "category"}">` +
    (curType ? `${typeIcon(curType.key)}${esc(curType.label)}` : `<span aria-hidden="true">🗂️</span>${esc(x.category)}`) +
    `${caret}</button>` +
    `</div>` +
    panel;
}

document.addEventListener("click", (event) => {
  const t = event.target;
  if (!t.closest) return;
  const toggle = t.closest("[data-quick-toggle]");
  if (toggle) {
    const which = toggle.dataset.quickToggle;
    mapQuickOpen = mapQuickOpen === which ? false : which; // 同じボタンをもう一度押すと閉じる。別のボタンなら切り替え
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
    mapQuickOpen = false;
    selectType(type.dataset.quickType); // 「すべてのカテゴリー」は ALL
    renderMapQuick();
    return;
  }
  // 一覧の外を押したら、開いている一覧を閉じる
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
