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
    fnb: "食品・飲料",
    nearLoading: "現在地を調べています…",
    nearFailed: "現在地を取得できませんでした。地図から探してください",
    recTitle: "あなたへのおすすめ",
    recBasis: "あなたがこのサイトで見たお店・検索・保存をもとに選んでいます",
    whyViewed: (area) => `見たお店(${area})の近く`,
    whySaved: (area) => `保存したお店(${area})の近く`,
    whySearch: (q) => `「${q}」で検索したから`,
    whyType: (type) => `よく見る種類: ${type}`,
    recEmpty: "お店を見たり、検索したり、♡で保存したりすると、あなたに合わせたおすすめがここに出ます。",
    recNoMatch: "いまの記録に合うお店が見つかりませんでした。ほかのお店も見てみてください。",
    recEmptyNear: "近くのお店から探す",
    clearHistory: "履歴を消す",
    historyNote: "見たお店・検索・選んだ種類は、この端末の中だけに保存しています",
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
    fnb: "Food & Beverage",
    nearLoading: "Finding your location…",
    nearFailed: "Couldn't get your location. Please use the map instead",
    recTitle: "Picked for you",
    recBasis: "Chosen from the shops you viewed, searched for and saved on this site",
    whyViewed: (area) => `Near a shop you viewed (${area})`,
    whySaved: (area) => `Near a shop you saved (${area})`,
    whySearch: (q) => `Because you searched “${q}”`,
    whyType: (type) => `You often look at: ${type}`,
    recEmpty: "View, search for or ♡ save shops, and recommendations picked for you will appear here.",
    recNoMatch: "No shops match your activity yet. Try looking at some other shops.",
    recEmptyNear: "Find shops near you",
    clearHistory: "Clear history",
    historyNote: "Viewed shops, searches and chosen categories are saved only on this device",
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
    fnb: "Ăn uống",
    nearLoading: "Đang tìm vị trí của bạn…",
    nearFailed: "Không lấy được vị trí. Vui lòng tìm trên bản đồ",
    recTitle: "Gợi ý cho bạn",
    recBasis: "Chọn dựa trên các quán bạn đã xem, tìm kiếm và lưu trên trang này",
    whyViewed: (area) => `Gần quán bạn đã xem (${area})`,
    whySaved: (area) => `Gần quán bạn đã lưu (${area})`,
    whySearch: (q) => `Vì bạn đã tìm “${q}”`,
    whyType: (type) => `Bạn hay xem: ${type}`,
    recEmpty: "Hãy xem, tìm kiếm hoặc nhấn ♡ để lưu quán, gợi ý dành riêng cho bạn sẽ hiện ở đây.",
    recNoMatch: "Chưa có quán phù hợp với hoạt động của bạn. Hãy xem thêm các quán khác.",
    recEmptyNear: "Tìm quán gần bạn",
    clearHistory: "Xóa lịch sử",
    historyNote: "Quán đã xem, từ khóa tìm kiếm và loại đã chọn chỉ được lưu trên thiết bị này",
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
// このサイトの中での、その人の行動の記録(おすすめを、人ごとに変えるため)
//   ・すべて、このブラウザの中(localStorage)だけに保存。サーバーや第三者には送らない
//   ・記録するもの: 見たお店 / 検索した言葉(と、それが駅のときはその位置)/ 選んだ種類(料理店・食材店・カフェ)
//   ・「履歴を消す」で、まとめて消せる
// ---------------------------------------------------------------------
const RECENT_KEY = "vf_recent_shops"; // 見たお店の id(新しい順、最大20件)
const SEARCH_KEY = "vf_recent_searches"; // 検索 [{ q, terms, places }](新しい順、最大10件)
const TYPE_KEY = "vf_type_picks"; // 種類を選んだ回数 { restaurant: 2, cafe: 5, ... }
function readJson(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "null");
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // 保存できない(プライベートブラウズなど)ときは、何もしない
  }
}
function loadRecentShops() {
  const list = readJson(RECENT_KEY, []);
  return Array.isArray(list) ? list.filter((id) => typeof id === "string") : [];
}
function recordRecentShop(id) {
  if (!id) return;
  const list = loadRecentShops().filter((x) => x !== id);
  list.unshift(id);
  writeJson(RECENT_KEY, list.slice(0, 20));
}
function loadRecentSearches() {
  const list = readJson(SEARCH_KEY, []);
  return Array.isArray(list) ? list.filter((x) => x && typeof x.q === "string" && Array.isArray(x.terms)) : [];
}
// 検索した言葉を記録する(js/app.js が、入力が止まって、結果が1件以上あったときに呼ぶ)
function recordSearch(q, terms, places) {
  const text = String(q || "").trim().slice(0, 60);
  if (!text || !Array.isArray(terms) || !terms.length) return;
  const list = loadRecentSearches().filter((x) => x.q !== text);
  list.unshift({ q: text, terms: terms.slice(0, 6), places: (places || []).slice(0, 6) });
  writeJson(SEARCH_KEY, list.slice(0, 10));
}
function loadTypePicks() {
  const v = readJson(TYPE_KEY, {});
  return v && typeof v === "object" ? v : {};
}
// 種類(料理店・食材店・カフェ)を選んだことを記録する(js/app.js の selectType が呼ぶ)
function recordTypePick(type) {
  if (!["restaurant", "grocery", "cafe"].includes(type)) return;
  const v = loadTypePicks();
  v[type] = Math.min(50, (Number(v[type]) || 0) + 1);
  writeJson(TYPE_KEY, v);
}
function clearActivity() {
  [RECENT_KEY, SEARCH_KEY, TYPE_KEY].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (e) {
      // 何もしない
    }
  });
}

// おすすめ: その人の記録だけを使って、まだ見ていないお店に点数を付け、高い順に3件
//   ・見たお店の近く(最近見たものほど重く)/ 保存したお店(♡)の近く /
//     検索した言葉に合う・検索した駅の近く / よく見る・よく選ぶ種類
//   ・記録が何もない人には、おすすめのお店は出さない(みんなに同じものは出さない)
function homeRecommendations() {
  const recent = loadRecentShops();
  const searches = loadRecentSearches();
  const picks = loadTypePicks();
  const byId = new Map(entries.map((e) => [e.shop.id, e]));
  const viewed = recent.map((id) => byId.get(id)).filter(Boolean);
  const saved = entries.filter((e) => isFavorite(e.shop));
  const hasSignal = viewed.length > 0 || saved.length > 0 || searches.length > 0 || Object.keys(picks).length > 0;
  if (!hasSignal) return { items: [], hasSignal: false };

  // 種類の好み(見たお店の種類 + 選んだ種類)
  const typeCount = { restaurant: 0, grocery: 0, cafe: 0 };
  viewed.forEach((e, i) => (typeCount[shopType(e.shop)] += Math.pow(0.85, i)));
  Object.keys(typeCount).forEach((k) => (typeCount[k] += Number(picks[k]) || 0));
  const typeTotal = Object.values(typeCount).reduce((a, b) => a + b, 0);

  const exclude = new Set([...recent, ...saved.map((e) => e.shop.id)]); // もう見た・保存したお店は出さない
  const near = (km) => Math.exp(-km / 1.5); // 近いほど 1 に近い(1.5km で約 0.37)
  const scored = entries
    .filter((e) => !exclude.has(e.shop.id))
    .map((e) => {
      const { lat, lng } = e.shop;
      const parts = []; // [点数, 理由, 距離]
      viewed.forEach((v, i) => {
        const km = distanceKm(v.shop.lat, v.shop.lng, lat, lng);
        parts.push([Math.pow(0.8, i) * near(km), { kind: "viewed", area: pick(v.shop.area) }, km]);
      });
      saved.forEach((f) => {
        const km = distanceKm(f.shop.lat, f.shop.lng, lat, lng);
        parts.push([0.8 * near(km), { kind: "saved", area: pick(f.shop.area) }, km]);
      });
      const text = getSearchText(e.shop);
      searches.forEach((sr, i) => {
        const w = Math.pow(0.8, i);
        const placeHit = (sr.places || []).some((p) => Array.isArray(p) && distanceMeters(p[0], p[1], lat, lng) <= SEARCH_NEAR_STATION_M);
        if (placeHit || sr.terms.every((t) => text.includes(t))) parts.push([1.1 * w, { kind: "search", q: sr.q }, null]);
      });
      if (typeTotal > 0) {
        const share = typeCount[shopType(e.shop)] / typeTotal;
        if (share > 0) parts.push([0.6 * share, { kind: "type", type: shopType(e.shop) }, null]);
      }
      const score = parts.reduce((sum, p) => sum + p[0], 0);
      const best = parts.sort((x, y) => y[0] - x[0])[0];
      return { entry: e, score, why: best ? best[1] : null, km: best ? best[2] : null };
    })
    .filter((x) => x.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return { items: scored, hasSignal: true };
}

// ---------------------------------------------------------------------
// 絵(アイコン)。種類ごとの色は、地図のピンと同じ(料理店 = 赤、食材店 = 青、カフェ = 茶)
// ---------------------------------------------------------------------
const HOME_ICONS = {
  fnb: '<path d="M7 3v7a2 2 0 0 0 2 2v9"></path><path d="M5 3v5M9 3v5"></path><path d="M14 9h6v5a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3z"></path><path d="M17 17v4M15 21h4"></path><path d="M15 5c-.6 1 .6 1.6 0 2.6M18 5c-.6 1 .6 1.6 0 2.6"></path>',
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
  const whyText = (why) => {
    if (!why) return "";
    if (why.kind === "viewed") return h.whyViewed(why.area);
    if (why.kind === "saved") return h.whySaved(why.area);
    if (why.kind === "search") return h.whySearch(why.q);
    if (why.kind === "type") return h.whyType(h.typeLabel[why.type]);
    return "";
  };
  const recItems = rec.items
    .map(({ entry, km, why }) => {
      const type = shopType(entry.shop);
      return (
        `<li><a class="home-rec" href="${esc(shopUrl(entry.shop.id))}" data-shop-id="${esc(entry.shop.id)}">` +
        `<span class="home-rec-icon home-type-${type}">${homeIcon(type, 28)}</span>` +
        `<span class="home-rec-body"><span class="home-rec-name">${esc(pick(entry.shop.name))}</span>` +
        `<span class="home-rec-meta">${esc(h.typeLabel[type])} ・ ${esc(pick(entry.shop.area))}</span>` +
        `<span class="home-rec-why">${esc(whyText(why))}</span></span>` +
        (km === null || km === undefined ? "" : `<span class="home-rec-km">${formatDistance(km)}</span>`) +
        `</a></li>`
      );
    })
    .join("");
  // 記録がまだ無い人(または、合うお店が無い人)への案内。みんなに同じお店は出さない
  const recEmpty = rec.hasSignal ? h.recNoMatch : h.recEmpty;

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
    // 入口は、いまは「近く」と「食品・飲料」の2つ(料理店・食材店・カフェは、食品・飲料の中の絞り込みで選ぶ)
    entryButton("near", h.near) +
    entryButton("fnb", h.fnb) +
    `</nav>` +
    `<p class="home-status" role="status" hidden></p>` +
    `<div class="home-divider"></div>` +
    `<section class="home-section">` +
    `<h2 class="home-h2">${esc(h.recTitle)}</h2>` +
    (rec.items.length
      ? `<p class="home-reason">${esc(h.recBasis)}</p><ul class="home-rec-list">${recItems}</ul>`
      : `<div class="home-rec-empty"><p>${esc(recEmpty)}</p>` +
        `<button type="button" class="home-rec-empty-btn" data-home-action="near">${homeIcon("near", 18)}<span>${esc(h.recEmptyNear)}</span></button></div>`) +
    // 記録を使っているときは、どこに保存しているかと、消す方法を、すぐそばに出す
    (rec.hasSignal
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
    clearActivity();
    renderHome();
    return;
  }
  if (key === "near") openNearby();
  else if (key === "map") {
    navigate(mapUrl());
  } else if (key === "fnb") {
    // 食品・飲料: いま登録しているお店(料理店・食材店・カフェ)すべてを出す。スマホは一覧を開く
    navigate(mapUrl());
    resetFilters();
    if (window.matchMedia("(max-width: 600px)").matches) openScanOverlay("list");
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
