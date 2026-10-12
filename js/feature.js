// 特集のページ(URL「?view=feature&type=cafe」など。ホームの「特集」のカードから開く)
//   ・その種類(カフェ・食材店)のお店を、カードで並べる(おすすめ順 = レビューの評価が高い順。js/todo.js と同じ)
//   ・上の絞り込み: 「近く」(現在地から近い順・10km以内)/「すべて」/ エリア名
//     エリア名は、その特集にお店があるエリアだけを、自動で出す(お店の area から作る。多い順)
//   ・現在地は、「近く」を押したときだけ、その場で使う。保存しない

const FEATURE_TYPES = ["cafe", "grocery"];
const FEATURE_NEAR_KM = 10;

const FEATURE_TEXT = {
  ja: {
    back: "ホームに戻る",
    filterLabel: "絞り込み",
    near: "近く",
    all: "すべて",
    count: (n) => `${n}件`,
    locating: "現在地を調べています…",
    locateError: "現在地を取得できませんでした。ブラウザの位置情報の許可を確認してください",
    nearEmpty: `現在地から${FEATURE_NEAR_KM}km以内に、このお店はまだありません`,
    nearNote: "現在地から近い順",
    rankNote: "おすすめ順(レビューの評価が高い順)",
    locationNote: "「近く」を押したときだけ、その場で位置情報を使います。保存はしません。",
  },
  en: {
    back: "Back to home",
    filterLabel: "Filter",
    near: "Near me",
    all: "All",
    count: (n) => (n === 1 ? "1 shop" : `${n} shops`),
    locating: "Finding your location…",
    locateError: "Couldn't get your location. Please check your browser's location permission",
    nearEmpty: `No shops of this kind within ${FEATURE_NEAR_KM} km of you yet`,
    nearNote: "Nearest first",
    rankNote: "Recommended order (highest rated first)",
    locationNote: "Your location is used only when you tap ‘Near me’, and is not stored.",
  },
  vi: {
    back: "Về trang chủ",
    filterLabel: "Lọc",
    near: "Gần đây",
    all: "Tất cả",
    count: (n) => `${n} quán`,
    locating: "Đang tìm vị trí của bạn…",
    locateError: "Không lấy được vị trí. Hãy kiểm tra quyền vị trí của trình duyệt",
    nearEmpty: `Chưa có quán loại này trong vòng ${FEATURE_NEAR_KM} km`,
    nearNote: "Gần nhất trước",
    rankNote: "Thứ tự gợi ý (đánh giá cao trước)",
    locationNote: "Vị trí chỉ được dùng khi bạn nhấn ‘Gần đây’ và không được lưu lại.",
  },
};
function featureText() {
  return FEATURE_TEXT[currentLang] || FEATURE_TEXT.ja;
}

function featureUrl(type) {
  return location.pathname + "?view=feature&type=" + encodeURIComponent(type);
}

// いまの絞り込み(ページを開いている間だけ覚えておく)
const featureState = { type: null, filter: "all", pos: null, locating: false, error: false };

// エリアの名前(日本語をキーにして、表示はいまの言語)
function featureAreaKey(shop) {
  const a = shop.area;
  return a && typeof a === "object" ? a.ja || "" : String(a || "");
}

function renderFeaturePage(type) {
  const x = featureText();
  const h = homeText();
  if (!FEATURE_TYPES.includes(type)) type = "cafe";
  if (featureState.type !== type) {
    featureState.type = type;
    featureState.filter = "all";
    featureState.error = false;
  }
  const all = entries.filter((e) => shopType(e.shop) === type);
  // その特集にお店があるエリアだけ(お店の多い順 → 名前の順)
  const areaMap = new Map();
  all.forEach((e) => {
    const key = featureAreaKey(e.shop);
    if (!key) return;
    if (!areaMap.has(key)) areaMap.set(key, { key, label: pick(e.shop.area), n: 0 });
    areaMap.get(key).n += 1;
  });
  const areas = [...areaMap.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "ja"));
  if (featureState.filter.startsWith("area:") && !areaMap.has(featureState.filter.slice(5))) featureState.filter = "all";

  let list;
  let note = x.rankNote;
  let status = "";
  if (featureState.filter === "near") {
    note = x.nearNote;
    if (featureState.locating) status = x.locating;
    else if (featureState.error || !featureState.pos) status = x.locateError;
    if (featureState.pos) {
      const { lat, lng } = featureState.pos;
      list = all
        .map((e) => ({ e, km: distanceKm(lat, lng, e.shop.lat, e.shop.lng) }))
        .filter((x2) => x2.km <= FEATURE_NEAR_KM)
        .sort((a, b) => a.km - b.km)
        .map((x2) => x2.e);
      if (!list.length) status = x.nearEmpty;
    } else list = [];
  } else {
    const pool = featureState.filter.startsWith("area:") ? all.filter((e) => featureAreaKey(e.shop) === featureState.filter.slice(5)) : all;
    loadTodoRatings(pool.map((e) => e.shop.id));
    list = sortByRecommendation(pool);
  }

  const chip = (key, label, extra) =>
    `<button type="button" class="todo-chip feature-chip${featureState.filter === key ? " is-on" : ""}" aria-pressed="${featureState.filter === key}" data-feature-filter="${esc(key)}">` +
    `${extra || ""}${esc(label)}</button>`;
  const title = (type === "cafe" ? h.featureCafeTitle : h.featureGroceryTitle).replace(/\n/g, " ");
  const tag = type === "cafe" ? h.featureCafeTag : h.featureGroceryTag;

  homePage.innerHTML =
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(homeUrl())}" data-feature-back aria-label="${esc(x.back)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(tag)}</h2></div>` +
    `<div class="feature-band feature-band-${type}"><span class="feature-band-icon">${homeIcon(type, 30)}</span>` +
    `<span class="feature-band-text"><span class="feature-band-title">${esc(title)}</span>` +
    `<span class="feature-band-count">${esc(x.count(all.length))}</span></span></div>` +
    `<section class="home-section feature-section">` +
    `<div class="feature-chips" role="group" aria-label="${esc(x.filterLabel)}">` +
    chip("near", x.near, `<span class="feature-chip-icon" aria-hidden="true">${homeIcon("near", 16)}</span>`) +
    chip("all", `${x.all} ${all.length}`) +
    areas.map((a) => chip("area:" + a.key, `${a.label} ${a.n}`)).join("") +
    `</div>` +
    (featureState.filter === "near" ? `<p class="acct-small feature-location-note">${esc(x.locationNote)}</p>` : "") +
    (status ? `<p class="home-status" role="status">${esc(status)}</p>` : "") +
    (list.length ? `<p class="todo-rank-note">${esc(note)}</p><ul class="todo-shops">${list.map(todoShopCard).join("")}</ul>` : "") +
    `</section>`;
}

function featureLocate() {
  if (!navigator.geolocation) {
    featureState.error = true;
    renderHomeMode();
    return;
  }
  featureState.locating = true;
  featureState.error = false;
  renderHomeMode();
  navigator.geolocation.getCurrentPosition(
    (p) => {
      featureState.locating = false;
      featureState.pos = { lat: p.coords.latitude, lng: p.coords.longitude }; // このページを開いている間だけ使う(保存しない)
      if (homeMode === "feature") renderHomeMode();
    },
    () => {
      featureState.locating = false;
      featureState.error = true;
      if (homeMode === "feature") renderHomeMode();
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
  );
}

homePage.addEventListener("click", (event) => {
  const t = event.target;
  const back = t.closest("[data-feature-back]");
  if (back) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    navigate(homeUrl());
    return;
  }
  const chip = t.closest("[data-feature-filter]");
  if (!chip) return;
  const key = chip.dataset.featureFilter;
  featureState.filter = key;
  if (key === "near" && !featureState.pos) {
    featureLocate();
    return;
  }
  const y = homeView.scrollTop;
  renderHomeMode();
  homeView.scrollTop = y;
});
