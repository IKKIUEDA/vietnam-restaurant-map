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
  return appBase() + "?view=feature&type=" + encodeURIComponent(type);
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
    // 特集を開いたことも、おすすめ(ホーム)の手がかりにする(端末の中だけの記録。js/home.js)
    if (typeof recordTypePick === "function") recordTypePick(type);
    featureState.filter = "all";
    featureState.error = false;
    // 特集を開き直したら、はじめの「千葉県」に戻す(カフェ・食材店とも)
    {
      cafeFx.filters = CAFE_FX_DEFAULT();
      cafeFx.sort = "rec";
      cafeFx.sheet = null;
    }
  }
  const all = entries.filter((e) => shopType(e.shop) === type);
  // 特集(カフェ・食材店)は、絞り込みと並び順のついた一覧(下の renderCafeFeature)
  return renderCafeFeature(all, type);
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
  let note = ""; // おすすめ順の説明文は出さない(「近く」のときだけ、近い順の説明を出す)
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
    (list.length ? (note ? `<p class="todo-rank-note">${esc(note)}</p>` : "") + `<ul class="todo-shops">${list.map(todoShopCard).join("")}</ul>` : "") +
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

// =====================================================================
// 特集(カフェ「千葉にあるベトナムコーヒーでひと休み」・食材店「千葉でベトナムの食材が買えるお店」): 絞り込みと並び順
//   ・上の並び: 絞り込みボタン(選んでいる条件の数つき)/ 選んでいる条件(× で外せる)/ 並び順
//   ・絞り込み: エリア(都道府県 → その中のエリア)/ 現在地から近いお店だけ(10km以内)/ レビューがあるお店だけ
//   ・並び順: おすすめ順(評価が高い順)/ 近い順 / レビューが多い順
//   ・はじめは「千葉県」で絞り込んだ状態。× で外すと、関東のすべてのカフェ
//   ・現在地は、「近い」を選んだときだけ、その場で使う。保存しない
// =====================================================================
const CAFE_FX_TEXT = {
  ja: {
    filter: "絞り込み", sortTitle: "並び順", sort: { rec: "おすすめ順", near: "近い順", reviews: "レビューが多い順" },
    area: "エリア", allPref: "すべて", allArea: "すべてのエリア", conditions: "条件",
    near: "現在地から近いお店だけ(10km以内)", nearChip: "近く", reviewed: "レビューがあるお店だけ", reviewedChip: "レビューあり",
    reset: "リセット", show: (n) => `${n}件を表示`, close: "閉じる", remove: (l) => `${l}の条件を外す`, empty: "条件に合うお店がありません",
  },
  en: {
    filter: "Filters", sortTitle: "Sort by", sort: { rec: "Recommended", near: "Nearest", reviews: "Most reviews" },
    area: "Area", allPref: "All", allArea: "All areas", conditions: "Conditions",
    near: "Only shops near me (within 10 km)", nearChip: "Nearby", reviewed: "Only shops with reviews", reviewedChip: "With reviews",
    reset: "Reset", show: (n) => (n === 1 ? "Show 1 shop" : `Show ${n} shops`), close: "Close", remove: (l) => `Remove ${l}`, empty: "No shops match these filters",
  },
  vi: {
    filter: "Bộ lọc", sortTitle: "Sắp xếp", sort: { rec: "Gợi ý", near: "Gần nhất", reviews: "Nhiều đánh giá" },
    area: "Khu vực", allPref: "Tất cả", allArea: "Tất cả khu vực", conditions: "Điều kiện",
    near: "Chỉ quán gần tôi (trong 10 km)", nearChip: "Gần đây", reviewed: "Chỉ quán có đánh giá", reviewedChip: "Có đánh giá",
    reset: "Đặt lại", show: (n) => `Xem ${n} quán`, close: "Đóng", remove: (l) => `Bỏ ${l}`, empty: "Không có quán phù hợp",
  },
};
const cafeFxText = () => CAFE_FX_TEXT[currentLang] || CAFE_FX_TEXT.ja;
const CAFE_FX_DEFAULT = () => ({ pref: "千葉県", area: null, near: false, reviewed: false });
const cafeFx = { filters: CAFE_FX_DEFAULT(), sort: "rec", sheet: null, draft: null };
const FX_SLIDERS_ICON =
  `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">` +
  `<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>`;
const FX_CHEVRON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

function cafeFxPrefLabel(key) {
  const p = prefectures.find((q) => q.key === key);
  return p ? pick(p.label) : key;
}
// 条件に合うお店(filters を省くと、いまの条件)
function cafeFxApply(all, f) {
  return all.filter((e) => {
    if (f.pref && e.shop.prefecture !== f.pref) return false;
    if (f.area && featureAreaKey(e.shop) !== f.area) return false;
    if (f.near) {
      if (!featureState.pos) return false;
      if (distanceKm(featureState.pos.lat, featureState.pos.lng, e.shop.lat, e.shop.lng) > FEATURE_NEAR_KM) return false;
    }
    if (f.reviewed) {
      const r = todoRating(e.shop.id);
      if (!r || !r.count) return false;
    }
    return true;
  });
}
function cafeFxSort(list) {
  if (cafeFx.sort === "near" && featureState.pos) {
    const { lat, lng } = featureState.pos;
    return list
      .map((e) => ({ e, km: distanceKm(lat, lng, e.shop.lat, e.shop.lng) }))
      .sort((a, b) => a.km - b.km)
      .map((x) => x.e);
  }
  if (cafeFx.sort === "reviews") {
    return list
      .map((e, i) => ({ e, i, r: todoRating(e.shop.id) }))
      .sort((a, b) => (b.r ? b.r.count : 0) - (a.r ? a.r.count : 0) || (b.r ? b.r.avg : 0) - (a.r ? a.r.avg : 0) || a.i - b.i)
      .map((x) => x.e);
  }
  return sortByRecommendation(list);
}
const cafeFxNeedsLocation = (f, sort) => (f.near || sort === "near") && !featureState.pos;

function renderCafeFeature(all, type) {
  const x = featureText();
  const fx = cafeFxText();
  const h = homeText();
  const f = cafeFx.filters;
  loadTodoRatings(all.map((e) => e.shop.id));
  const list = cafeFxSort(cafeFxApply(all, f));
  let status = "";
  if (featureState.locating) status = x.locating;
  else if ((f.near || cafeFx.sort === "near") && !featureState.pos && featureState.error) status = x.locateError;

  // 選んでいる条件のチップ(× で外す)
  const active = [];
  if (f.pref) active.push({ key: "pref", label: cafeFxPrefLabel(f.pref) });
  if (f.area) {
    const sample = all.find((e) => featureAreaKey(e.shop) === f.area);
    active.push({ key: "area", label: sample ? pick(sample.shop.area) : f.area });
  }
  if (f.near) active.push({ key: "near", label: fx.nearChip });
  if (f.reviewed) active.push({ key: "reviewed", label: fx.reviewedChip });
  const isCafe = type === "cafe";
  // カードでの改行は、日本語ではつなげる(英語・ベトナム語は空白を入れる)
  const title = (isCafe ? h.featureCafeTitle : h.featureGroceryTitle).replace(/\n/g, currentLang === "ja" ? "" : " ");
  const tag = isCafe ? h.featureCafeTag : h.featureGroceryTag;

  homePage.innerHTML =
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(homeUrl())}" data-feature-back aria-label="${esc(x.back)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(tag)}</h2></div>` +
    `<div class="feature-band feature-band-${type}"><span class="feature-band-icon">${homeIcon(type, 30)}</span>` +
    `<span class="feature-band-text"><span class="feature-band-title">${esc(title)}</span>` +
    `<span class="feature-band-count">${esc(x.count(list.length))}</span></span></div>` +
    `<section class="home-section feature-section fx-section">` +
    `<div class="fx-bar" role="group" aria-label="${esc(fx.filter)}">` +
    `<button type="button" class="fx-filter-btn" data-fx-open="filter" aria-label="${esc(fx.filter)}">${FX_SLIDERS_ICON}` +
    (active.length ? `<span class="fx-badge">${active.length}</span>` : "") +
    `</button>` +
    active
      .map(
        (a) =>
          `<button type="button" class="fx-chip is-on" data-fx-remove="${a.key}" aria-label="${esc(fx.remove(a.label))}">` +
          (a.key === "pref" || a.key === "area" ? `<span aria-hidden="true">📍</span>` : "") +
          `<span>${esc(a.label)}</span><span class="fx-x" aria-hidden="true">×</span></button>`
      )
      .join("") +
    `<button type="button" class="fx-chip fx-sort" data-fx-open="sort">${esc(fx.sort[cafeFx.sort])}${FX_CHEVRON}</button>` +
    `</div>` +
    (f.near || cafeFx.sort === "near" ? `<p class="acct-small feature-location-note">${esc(x.locationNote)}</p>` : "") +
    (status ? `<p class="home-status" role="status">${esc(status)}</p>` : "") +
    (list.length
      ? `<ul class="todo-shops fx-list">${list.map(todoShopCard).join("")}</ul>`
      : !status
      ? `<p class="home-status" role="status">${esc(fx.empty)}</p>`
      : "") +
    `</section>` +
    (cafeFx.sheet ? cafeFxSheetHtml(all) : "");
}

// 下から出る画面: 絞り込み / 並び順
function cafeFxSheetHtml(all) {
  const fx = cafeFxText();
  const head = (title) =>
    `<div class="fx-sheet-head"><h3 class="fx-sheet-title">${esc(title)}</h3>` +
    `<button type="button" class="fx-sheet-close" data-fx-close aria-label="${esc(fx.close)}">✕</button></div>`;
  if (cafeFx.sheet === "sort") {
    return (
      `<div class="fx-overlay" data-fx-close></div>` +
      `<div class="fx-sheet" role="dialog" aria-modal="true" aria-label="${esc(fx.sortTitle)}">` +
      head(fx.sortTitle) +
      `<div class="fx-options">` +
      ["rec", "near", "reviews"]
        .map(
          (k) =>
            `<button type="button" class="fx-option${cafeFx.sort === k ? " is-on" : ""}" data-fx-sort="${k}" aria-pressed="${cafeFx.sort === k}">` +
            `<span>${esc(fx.sort[k])}</span>${cafeFx.sort === k ? "<span aria-hidden=\"true\">✓</span>" : ""}</button>`
        )
        .join("") +
      `</div></div>`
    );
  }
  const d = cafeFx.draft;
  const prefs = prefectures.filter((p) => all.some((e) => e.shop.prefecture === p.key));
  const prefCount = (key) => all.filter((e) => e.shop.prefecture === key).length;
  const areaMap = new Map();
  if (d.pref) {
    all
      .filter((e) => e.shop.prefecture === d.pref)
      .forEach((e) => {
        const k = featureAreaKey(e.shop);
        if (!k) return;
        if (!areaMap.has(k)) areaMap.set(k, { k, label: pick(e.shop.area), n: 0 });
        areaMap.get(k).n += 1;
      });
  }
  const areas = [...areaMap.values()].sort((a, b) => b.n - a.n);
  const pill = (attr, on, label) => `<button type="button" class="fx-pill${on ? " is-on" : ""}" ${attr} aria-pressed="${on}">${esc(label)}</button>`;
  const n = cafeFxApply(all, d).length;
  return (
    `<div class="fx-overlay" data-fx-close></div>` +
    `<div class="fx-sheet" role="dialog" aria-modal="true" aria-label="${esc(fx.filter)}">` +
    head(fx.filter) +
    `<div class="fx-sheet-body">` +
    `<h4 class="fx-h4">${esc(fx.area)}</h4>` +
    `<div class="fx-pills">` +
    pill(`data-fx-pref=""`, !d.pref, fx.allPref) +
    prefs.map((p) => pill(`data-fx-pref="${esc(p.key)}"`, d.pref === p.key, `${pick(p.label)} ${prefCount(p.key)}`)).join("") +
    `</div>` +
    (d.pref && areas.length
      ? `<div class="fx-pills fx-pills-sub">` +
        pill(`data-fx-area=""`, !d.area, fx.allArea) +
        areas.map((a) => pill(`data-fx-area="${esc(a.k)}"`, d.area === a.k, `${a.label} ${a.n}`)).join("") +
        `</div>`
      : "") +
    `<h4 class="fx-h4">${esc(fx.conditions)}</h4>` +
    `<label class="fx-check"><input type="checkbox" data-fx-check="near"${d.near ? " checked" : ""}><span>${esc(fx.near)}</span></label>` +
    `<label class="fx-check"><input type="checkbox" data-fx-check="reviewed"${d.reviewed ? " checked" : ""}><span>${esc(fx.reviewed)}</span></label>` +
    `</div>` +
    `<div class="fx-sheet-foot">` +
    `<button type="button" class="fx-reset" data-fx-reset>${esc(fx.reset)}</button>` +
    `<button type="button" class="fx-apply" data-fx-apply>${esc(d.near && !featureState.pos ? fx.show("–") : fx.show(n))}</button>` +
    `</div></div>`
  );
}

function cafeFxRerender() {
  const y = homeView.scrollTop;
  renderHomeMode();
  homeView.scrollTop = y;
}
homePage.addEventListener("click", (event) => {
  if (!FEATURE_TYPES.includes(featureState.type) || homeMode !== "feature") return;
  const t = event.target;
  const open = t.closest("[data-fx-open]");
  if (open) {
    cafeFx.sheet = open.dataset.fxOpen;
    cafeFx.draft = { ...cafeFx.filters };
    return cafeFxRerender();
  }
  if (t.closest("[data-fx-close]")) {
    cafeFx.sheet = null;
    return cafeFxRerender();
  }
  const rm = t.closest("[data-fx-remove]");
  if (rm) {
    const k = rm.dataset.fxRemove;
    if (k === "pref") {
      cafeFx.filters.pref = null;
      cafeFx.filters.area = null; // 都道府県を外したら、その中のエリアも外す
    } else cafeFx.filters[k] = k === "area" ? null : false;
    return cafeFxRerender();
  }
  const sort = t.closest("[data-fx-sort]");
  if (sort) {
    cafeFx.sort = sort.dataset.fxSort;
    cafeFx.sheet = null;
    if (cafeFxNeedsLocation(cafeFx.filters, cafeFx.sort)) return featureLocate();
    return cafeFxRerender();
  }
  const pref = t.closest("[data-fx-pref]");
  if (pref) {
    cafeFx.draft.pref = pref.dataset.fxPref || null;
    cafeFx.draft.area = null;
    return cafeFxRerender();
  }
  const area = t.closest("[data-fx-area]");
  if (area) {
    cafeFx.draft.area = area.dataset.fxArea || null;
    return cafeFxRerender();
  }
  if (t.closest("[data-fx-reset]")) {
    cafeFx.draft = { pref: null, area: null, near: false, reviewed: false };
    return cafeFxRerender();
  }
  if (t.closest("[data-fx-apply]")) {
    cafeFx.filters = { ...cafeFx.draft };
    cafeFx.sheet = null;
    if (cafeFxNeedsLocation(cafeFx.filters, cafeFx.sort)) return featureLocate();
    return cafeFxRerender();
  }
});
homePage.addEventListener("change", (event) => {
  const c = event.target.closest && event.target.closest("[data-fx-check]");
  if (!c || !cafeFx.draft) return;
  cafeFx.draft[c.dataset.fxCheck] = c.checked;
  if (c.dataset.fxCheck === "near" && c.checked && !featureState.pos) {
    featureLocate(); // 件数を出すために、その場で現在地を調べる(保存しない)
    return;
  }
  cafeFxRerender();
});
