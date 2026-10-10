// トップページ(ホーム)
//   ・「https://vietnamfoodie.compass-story.net/」を開いたときに、最初に出る画面です(パソコン・スマホとも)
//     地図と一覧の画面は「?view=map」(ホームの「地図」や、スマホの下のタブから開く)
//   ・中身: キャッチコピーと件数 / 検索 / 探し方の入口(近く・料理店・食材店・カフェ・地図)/
//           あなたへのおすすめ(最近見たお店の近く)/ 特集
//   ・「最近見たお店」は、このブラウザの中(localStorage)だけに保存します。サーバーには送りません
//   ・画面の下のタブ(ホーム・地図・保存)も、ここで動かします(スマホだけ表示。CSS)
//   ・ページの切り替え(URL)は js/detail.js の navigate / renderRoute が行い、ホームのときに showHome を呼びます

const HOME_TEXT = {
  ja: {
    catch1: "日本のベトナムを",
    catch2: "探そう。",
    searchLabel: "店名・エリア・駅名で探す",
    searchPlaceholder: "店名・エリア・駅名で探す(例: 千葉駅)",
    searchButton: "探す",
    entriesLabel: "探し方",
    near: "近く",
    restaurant: "料理店",
    grocery: "食材店",
    cafe: "カフェ",
    map: "地図",
    nearLoading: "現在地を調べています…",
    nearFailed: "現在地を取得できませんでした。地図から探してください",
    recTitle: "あなたへのおすすめ",
    recBecause: (area) => `最近見た「${area}」のお店の近く`,
    recNew: "新しく登録されたお店",
    clearHistory: "履歴を消す",
    historyNote: "最近見たお店は、この端末の中だけに保存しています",
    featureTitle: "特集",
    featureCafeTag: "カフェ",
    featureCafeTitle: "ベトナムコーヒーで\nひと休み",
    featureCafeSub: (n) => `関東のベトナムカフェ ${n}件`,
    featureGroceryTag: "食材店",
    featureGroceryTitle: "生麺・ハーブ・調味料\nベトナムの食材が買えるお店",
    featureGrocerySub: (n) => `関東のベトナム食材店 ${n}件`,
    typeLabel: { restaurant: "料理店", grocery: "食材店", cafe: "カフェ" },
    tabsLabel: "メインメニュー",
    tabHome: "ホーム",
    tabMap: "地図",
    tabSaved: "保存",
  },
  en: {
    catch1: "Find Vietnam",
    catch2: "in Japan.",
    searchLabel: "Search by shop, area or station",
    searchPlaceholder: "Shop, area or station (e.g. Chiba Station)",
    searchButton: "Search",
    entriesLabel: "Ways to explore",
    near: "Nearby",
    restaurant: "Restaurants",
    grocery: "Groceries",
    cafe: "Cafes",
    map: "Map",
    nearLoading: "Finding your location…",
    nearFailed: "Couldn't get your location. Please use the map instead",
    recTitle: "Picked for you",
    recBecause: (area) => `Near the shops you viewed in ${area}`,
    recNew: "Newly added",
    clearHistory: "Clear history",
    historyNote: "Recently viewed shops are saved only on this device",
    featureTitle: "Features",
    featureCafeTag: "Cafes",
    featureCafeTitle: "Take a break with\nVietnamese coffee",
    featureCafeSub: (n) => `${n} Vietnamese cafes in Kanto`,
    featureGroceryTag: "Groceries",
    featureGroceryTitle: "Fresh noodles, herbs\nand Vietnamese groceries",
    featureGrocerySub: (n) => `${n} Vietnamese grocery stores in Kanto`,
    typeLabel: { restaurant: "Restaurant", grocery: "Grocery", cafe: "Cafe" },
    tabsLabel: "Main menu",
    tabHome: "Home",
    tabMap: "Map",
    tabSaved: "Saved",
  },
  vi: {
    catch1: "Tìm Việt Nam",
    catch2: "tại Nhật Bản.",
    searchLabel: "Tìm theo tên quán, khu vực, ga",
    searchPlaceholder: "Tên quán, khu vực, ga (VD: ga Chiba)",
    searchButton: "Tìm",
    entriesLabel: "Cách tìm",
    near: "Gần đây",
    restaurant: "Nhà hàng",
    grocery: "Tạp hóa",
    cafe: "Cà phê",
    map: "Bản đồ",
    nearLoading: "Đang tìm vị trí của bạn…",
    nearFailed: "Không lấy được vị trí. Vui lòng tìm trên bản đồ",
    recTitle: "Gợi ý cho bạn",
    recBecause: (area) => `Gần các quán bạn đã xem ở ${area}`,
    recNew: "Quán mới thêm",
    clearHistory: "Xóa lịch sử",
    historyNote: "Các quán đã xem chỉ được lưu trên thiết bị này",
    featureTitle: "Chủ đề",
    featureCafeTag: "Cà phê",
    featureCafeTitle: "Nghỉ chân với\ncà phê Việt",
    featureCafeSub: (n) => `${n} quán cà phê Việt ở Kanto`,
    featureGroceryTag: "Tạp hóa",
    featureGroceryTitle: "Bún tươi, rau thơm\nvà gia vị Việt",
    featureGrocerySub: (n) => `${n} tiệm tạp hóa Việt ở Kanto`,
    typeLabel: { restaurant: "Nhà hàng", grocery: "Tạp hóa", cafe: "Cà phê" },
    tabsLabel: "Menu chính",
    tabHome: "Trang chủ",
    tabMap: "Bản đồ",
    tabSaved: "Đã lưu",
  },
};
function homeText() {
  return HOME_TEXT[currentLang] || HOME_TEXT.ja;
}

const homeView = document.getElementById("home-view");
const homePage = document.getElementById("home-page");
const appTabs = document.getElementById("app-tabs");

// URL に何も付いていないとき、ホームから始めるか(パソコン・スマホとも、ホームから始める)
function isHomeDefault() {
  return true;
}
function homeUrl() {
  return location.pathname;
}
function mapUrl() {
  return location.pathname + "?view=map";
}

// ---------------------------------------------------------------------
// 最近見たお店(このブラウザの中だけに保存。新しい順に、最大20件)
// ---------------------------------------------------------------------
const RECENT_KEY = "vf_recent_shops";
function loadRecentShops() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(list) ? list.filter((id) => typeof id === "string") : [];
  } catch (e) {
    return [];
  }
}
function recordRecentShop(id) {
  if (!id) return;
  try {
    const list = loadRecentShops().filter((x) => x !== id);
    list.unshift(id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 20)));
  } catch (e) {
    // 保存できない(プライベートブラウズなど)ときは、何もしない
  }
}

// おすすめ: いちばん最近見たお店の近くで、まだ見ていないお店を、近い順に3件
function homeRecommendations() {
  const recent = loadRecentShops();
  const byId = new Map(entries.map((e) => [e.shop.id, e]));
  const base = recent.map((id) => byId.get(id)).find(Boolean);
  if (base) {
    const seen = new Set(recent);
    const items = entries
      .filter((e) => !seen.has(e.shop.id))
      .map((e) => ({ entry: e, km: distanceKm(base.shop.lat, base.shop.lng, e.shop.lat, e.shop.lng) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3);
    return { reason: homeText().recBecause(pick(base.shop.area)), items, fromHistory: true };
  }
  // まだ何も見ていないとき: 新しく登録されたお店(data.js のいちばん後ろの3件)
  return { reason: homeText().recNew, items: entries.slice(-3).reverse().map((e) => ({ entry: e, km: null })), fromHistory: false };
}

// ---------------------------------------------------------------------
// 絵(アイコン)。種類ごとの色は、地図のピンと同じ(料理店 = 赤、食材店 = 青、カフェ = 茶)
// ---------------------------------------------------------------------
const HOME_ICONS = {
  near: '<circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 1v3M12 20v3M1 12h3M20 12h3"></path>',
  restaurant: '<path d="M3 11h18a9 9 0 0 1-18 0z"></path><path d="M9 4c-1 1.5 1 2.5 0 4M13 4c-1 1.5 1 2.5 0 4"></path><path d="M15 2l5 6"></path>',
  grocery: '<path d="M3 4h2l2.4 11h11l2-8H6.3"></path><circle cx="9" cy="20" r="1.5"></circle><circle cx="17" cy="20" r="1.5"></circle>',
  cafe: '<path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"></path><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"></path><path d="M3 22h15"></path>',
  map: '<path d="M9 4l6 2 6-2v16l-6 2-6-2-6 2V6z"></path><path d="M9 4v16M15 6v16"></path>',
  search: '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"></path>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path>',
};
function homeIcon(name, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HOME_ICONS[name]}</svg>`;
}

// ---------------------------------------------------------------------
// ホームの中身
// ---------------------------------------------------------------------
function renderHome() {
  const h = homeText();
  const t = ui[currentLang];
  const count = (type) => restaurants.filter((s) => shopType(s) === type).length;
  const hasCafe = count("cafe") > 0;
  const lead = `${t.resultHeading(t.resultWhere("default"), t.resultWhat(null, false))}`;

  const entryButton = (key, label) =>
    `<button type="button" class="home-entry home-entry-${key}" data-home-action="${key}">` +
    `<span class="home-entry-icon">${homeIcon(key, 26)}</span><span>${esc(label)}</span></button>`;

  const rec = homeRecommendations();
  const recItems = rec.items
    .map(({ entry, km }) => {
      const type = shopType(entry.shop);
      return (
        `<li><a class="home-rec" href="${esc(shopUrl(entry.shop.id))}" data-shop-id="${esc(entry.shop.id)}">` +
        `<span class="home-rec-icon home-type-${type}">${homeIcon(type, 28)}</span>` +
        `<span class="home-rec-body"><span class="home-rec-name">${esc(pick(entry.shop.name))}</span>` +
        `<span class="home-rec-meta">${esc(h.typeLabel[type])} ・ ${esc(pick(entry.shop.area))}</span></span>` +
        (km === null ? "" : `<span class="home-rec-km">${formatDistance(km)}</span>`) +
        `</a></li>`
      );
    })
    .join("");

  const feature = (key, tag, title, sub) =>
    `<button type="button" class="home-feature home-feature-${key}" data-home-action="${key}">` +
    `<span class="home-feature-art">${homeIcon(key, 150)}</span>` +
    `<span class="home-feature-tag">${esc(tag)}</span>` +
    `<span class="home-feature-text"><span class="home-feature-title">${esc(title)}</span>` +
    `<span class="home-feature-sub">${esc(sub)}</span></span></button>`;

  homePage.innerHTML =
    `<section class="home-hero">` +
    `<h2 class="home-catch">${esc(h.catch1)}<br><span>${esc(h.catch2)}</span></h2>` +
    `<p class="home-lead">${esc(lead)} <strong>${esc(t.resultCount(restaurants.length))}</strong></p>` +
    `</section>` +
    `<form class="home-search" role="search">` +
    `<label class="visually-hidden" for="home-search-input">${esc(h.searchLabel)}</label>` +
    `<span class="home-search-box">${homeIcon("search", 20)}` +
    `<input id="home-search-input" type="search" autocomplete="off" placeholder="${esc(h.searchPlaceholder)}" enterkeyhint="search">` +
    `<button type="submit" class="home-search-btn">${esc(h.searchButton)}</button></span>` +
    `</form>` +
    `<nav class="home-entries" aria-label="${esc(h.entriesLabel)}">` +
    entryButton("near", h.near) +
    entryButton("restaurant", h.restaurant) +
    entryButton("grocery", h.grocery) +
    (hasCafe ? entryButton("cafe", h.cafe) : "") +
    entryButton("map", h.map) +
    `</nav>` +
    `<p class="home-status" role="status" hidden></p>` +
    `<div class="home-divider"></div>` +
    `<section class="home-section">` +
    `<h2 class="home-h2">${esc(h.recTitle)}</h2>` +
    `<p class="home-reason">${esc(rec.reason)}</p>` +
    `<ul class="home-rec-list">${recItems}</ul>` +
    // 履歴を使っているときは、どこに保存しているかと、消す方法を、すぐそばに出す
    (rec.fromHistory
      ? `<p class="home-history-note">${esc(h.historyNote)} <button type="button" class="home-clear-history" data-home-action="clear-history">${esc(h.clearHistory)}</button></p>`
      : "") +
    `</section>` +
    `<section class="home-section">` +
    `<h2 class="home-h2">${esc(h.featureTitle)}</h2>` +
    `<div class="home-features">` +
    (hasCafe ? feature("cafe", h.featureCafeTag, h.featureCafeTitle, h.featureCafeSub(count("cafe"))) : "") +
    feature("grocery", h.featureGroceryTag, h.featureGroceryTitle, h.featureGrocerySub(count("grocery"))) +
    `</div></section>` +
    // 利用規約などへのリンク(スマホのホームでは、画面の下のフッターの代わりに、ここに出す)
    `<nav class="home-footer" aria-label="Site pages">` +
    `<a href="${esc(termsUrl())}" data-home-nav>${esc(t.termsPageTitle)}</a>` +
    `<a href="${esc(privacyUrl())}" data-home-nav>${esc(t.privacyPageTitle)}</a>` +
    `<a href="${esc(aboutUrl())}" data-home-nav>${esc(t.aboutPageTitle)}</a>` +
    `</nav>`;
}

// ---------------------------------------------------------------------
// ホームの操作
// ---------------------------------------------------------------------

// 地図の画面に移って、種類で絞り込む(スマホでは、一覧が自動で開く)
function openMapWithType(type) {
  navigate(mapUrl());
  resetFilters();
  selectType(type);
}

// 「近く」: 現在地を調べて、地図をそこへ動かし、その範囲のお店を一覧で出す(🔍スキャンと同じ)
let homeUserMarker = null;
function openNearby() {
  const h = homeText();
  const status = homePage.querySelector(".home-status");
  if (!navigator.geolocation) {
    status.textContent = h.nearFailed;
    status.hidden = false;
    return;
  }
  status.textContent = h.nearLoading;
  status.hidden = false;
  requestCurrentPosition(
    (pos) => {
      status.hidden = true;
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      navigate(mapUrl());
      resetFilters();
      map.setView(latlng, 15, { animate: false });
      if (homeUserMarker) map.removeLayer(homeUserMarker);
      homeUserMarker = L.circleMarker(latlng, { radius: 8, color: "#ffffff", weight: 3, fillColor: "#1a73e8", fillOpacity: 1 }).addTo(map);
      setTimeout(runScan, 300); // 地図が動き終わってから、その範囲のお店を一覧にする
    },
    () => {
      status.textContent = h.nearFailed;
      status.hidden = false;
    }
  );
}

homePage.addEventListener("click", (event) => {
  const shopLink = event.target.closest("a[data-shop-id]");
  if (shopLink) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return; // 新しいタブで開く操作は、そのまま
    event.preventDefault();
    const entry = entries.find((e) => e.shop.id === shopLink.dataset.shopId);
    if (entry) openShop(entry);
    return;
  }
  const navLink = event.target.closest("a[data-home-nav]");
  if (navLink) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    navigate(navLink.getAttribute("href"));
    return;
  }
  const action = event.target.closest("[data-home-action]");
  if (!action) return;
  const key = action.dataset.homeAction;
  if (key === "clear-history") {
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch (e) {
      // 何もしない
    }
    renderHome();
    return;
  }
  if (key === "near") openNearby();
  else if (key === "map") {
    navigate(mapUrl());
  } else openMapWithType(key);
});

// 検索: 地図の画面の検索ボックスに同じ言葉を入れて、地図の画面に移る(スマホでは、結果の一覧が自動で開く)
homePage.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = homePage.querySelector("#home-search-input");
  const q = input.value.trim();
  if (!q) return;
  navigate(mapUrl());
  resetFilters();
  searchInput.value = q;
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  input.value = "";
});

// ---------------------------------------------------------------------
// 画面の切り替え(js/detail.js の renderRoute から呼ばれる)
// ---------------------------------------------------------------------
function showHome() {
  showList(true); // 詳細ページなどの状態を片付ける(一覧・地図の状態は、そのまま残る)
  document.body.classList.add("view-home");
  homeView.hidden = false;
  renderHome();
  homeView.scrollTop = 0;
  renderTabs();
}
function hideHome() {
  document.body.classList.remove("view-home");
  homeView.hidden = true;
}

// 画面の下のタブ(スマホだけ。ホーム・地図・保存)
function renderTabs() {
  const h = homeText();
  const isHome = document.body.classList.contains("view-home");
  const isMap = !isHome && !document.body.classList.contains("view-detail") && !document.body.classList.contains("view-content-page");
  const tab = (key, icon, label, current) =>
    `<button type="button" class="app-tab${current ? " is-current" : ""}" data-tab="${key}"${current ? ' aria-current="page"' : ""}>` +
    `${homeIcon(icon, 24)}<span>${esc(label)}</span></button>`;
  appTabs.setAttribute("aria-label", h.tabsLabel);
  appTabs.innerHTML =
    tab("home", "home", h.tabHome, isHome) +
    tab("map", "map", h.tabMap, isMap && !favoritesOnly) +
    tab("saved", "heart", h.tabSaved, isMap && favoritesOnly);
}
appTabs.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-tab]");
  if (!btn) return;
  const key = btn.dataset.tab;
  if (key === "home") navigate(homeUrl());
  else if (key === "map") {
    navigate(mapUrl());
    if (favoritesOnly) resetFilters();
  } else if (key === "saved") {
    navigate(mapUrl());
    resetFilters();
    favoritesOnly = true;
    applyFilters();
  }
  renderTabs();
});

// 言語を切り替えたら、ホームとタブの文字も切り替える(currentLang が変わったあとに)
document.getElementById("lang-select").addEventListener("change", () => {
  setTimeout(() => {
    if (document.body.classList.contains("view-home")) renderHome();
    renderTabs();
  }, 0);
});
