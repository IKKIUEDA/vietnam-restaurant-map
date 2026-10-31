// トップページ(ホーム)
//   ・「https://vietnamfoodie.compass-story.net/」を開いたときに、最初に出る画面です(パソコン・スマホとも)
//     地図と一覧の画面は「?view=map」(ホームの「地図」や、スマホの下のタブから開く)
//   ・中身: キャッチコピーと件数 / 検索 / 探し方の入口(近く・料理店・食材店・カフェ・地図)/
//           あなたへのおすすめ(最近見たお店の近く)/ 特集
//   ・「最近見たお店」は、このブラウザの中(localStorage)だけに保存します。サーバーには送りません
//   ・画面の下のタブ(ホーム・地図・保存)も、ここで動かします(スマホ・PC共通。CSS)
//   ・ページの切り替え(URL)は js/detail.js の navigate / renderRoute が行い、ホームのときに showHome を呼びます

const HOME_TEXT = {
  ja: {
    catch: "日本の中にある、ベトナムを探そう。",
    searchLabel: "店名・エリア・駅名で探す",
    searchPlaceholder: "店名・エリア・駅名で探す(例: 千葉駅)",
    searchPlaceholderShort: "店名・エリア・駅名で探す",
    searchButton: "探す",
    entriesLabel: "探し方",
    entryRestaurant: "レストラン",
    entryCafe: "カフェ",
    entryGrocery: "食材店",
    entryNear: "近くのお店",
    near: "近く",
    restaurant: "料理店",
    grocery: "食材店",
    cafe: "カフェ",
    map: "地図",
    fnb: "食品・飲料",
    nearLoading: "現在地を調べています…",
    nearFailed: "現在地を取得できませんでした。地図から探してください",
    recTitle: "あなたへのおすすめ",
    recSub: "おすすめのベトナム料理店やカフェをご紹介",
    reviewCount: (n) => `レビュー ${n}件`,
    categoryTitle: "カテゴリーから探す",
    areaTitle: "エリアから探す",
    areaPrev: "前のエリア",
    areaNext: "次のエリア",
    areaMore: "もっと見る",
    areaListTitle: "エリア一覧",
    areaListLead: "エリアを選ぶと、その駅の近くのお店を地図で探せます",
    back: "戻る",
    areaCount: (n) => `${n}件`,
    featureTitle: "特集",
    featureSub: "テーマ別・目的別でベトナムの魅力を発掘しよう",
    featureCafeTag: "カフェ",
    featureCafeTitle: "千葉にあるベトナムコーヒーで\nひと休み",
    featureCafeSub: (n) => `千葉のベトナムカフェ ${n}件`,
    featureGroceryTag: "食材店",
    featureGroceryTitle: "生麺・ハーブ・調味料\nベトナムの食材が買えるお店",
    featureGrocerySub: (n) => `関東のベトナム食材店 ${n}件`,
    typeLabel: { restaurant: "料理店", grocery: "食材店", cafe: "カフェ" },
    tabsLabel: "メインメニュー",
    tabHome: "ホーム",
    tabMap: "地図",
    tabAccount: "アカウント",
  },
  en: {
    catch: "Find Vietnam in Japan.",
    searchLabel: "Search by shop, area or station",
    searchPlaceholder: "Shop, area or station (e.g. Chiba Station)",
    searchPlaceholderShort: "Shop, area or station",
    searchButton: "Search",
    entriesLabel: "Ways to explore",
    entryRestaurant: "Restaurants",
    entryCafe: "Cafes",
    entryGrocery: "Groceries",
    entryNear: "Near me",
    near: "Nearby",
    restaurant: "Restaurants",
    grocery: "Groceries",
    cafe: "Cafes",
    map: "Map",
    fnb: "Food & Beverage",
    nearLoading: "Finding your location…",
    nearFailed: "Couldn't get your location. Please use the map instead",
    recTitle: "Picked for you",
    recSub: "Vietnamese restaurants and cafes we think you'll like",
    reviewCount: (n) => (n === 1 ? "1 review" : `${n} reviews`),
    categoryTitle: "Browse by category",
    areaTitle: "Browse by area",
    areaPrev: "Previous areas",
    areaNext: "More areas",
    areaMore: "See more",
    areaListTitle: "All areas",
    areaListLead: "Pick an area to find shops near that station on the map",
    back: "Back",
    areaCount: (n) => (n === 1 ? "1 shop" : `${n} shops`),
    featureTitle: "Features",
    featureSub: "Discover Vietnam by theme and purpose",
    featureCafeTag: "Cafes",
    featureCafeTitle: "Take a break with\nVietnamese coffee in Chiba",
    featureCafeSub: (n) => `${n} Vietnamese cafes in Chiba`,
    featureGroceryTag: "Groceries",
    featureGroceryTitle: "Fresh noodles, herbs\nand Vietnamese groceries",
    featureGrocerySub: (n) => `${n} Vietnamese grocery stores in Kanto`,
    typeLabel: { restaurant: "Restaurant", grocery: "Grocery", cafe: "Cafe" },
    tabsLabel: "Main menu",
    tabHome: "Home",
    tabMap: "Map",
    tabAccount: "Account",
  },
  vi: {
    catch: "Tìm Việt Nam tại Nhật Bản.",
    searchLabel: "Tìm theo tên quán, khu vực, ga",
    searchPlaceholder: "Tên quán, khu vực, ga (VD: ga Chiba)",
    searchPlaceholderShort: "Tên quán, khu vực, ga",
    searchButton: "Tìm",
    entriesLabel: "Cách tìm",
    entryRestaurant: "Nhà hàng",
    entryCafe: "Cà phê",
    entryGrocery: "Tạp hóa",
    entryNear: "Gần đây",
    near: "Gần đây",
    restaurant: "Nhà hàng",
    grocery: "Tạp hóa",
    cafe: "Cà phê",
    map: "Bản đồ",
    fnb: "Ăn uống",
    nearLoading: "Đang tìm vị trí của bạn…",
    nearFailed: "Không lấy được vị trí. Vui lòng tìm trên bản đồ",
    recTitle: "Gợi ý cho bạn",
    recSub: "Giới thiệu nhà hàng và quán cà phê Việt dành cho bạn",
    reviewCount: (n) => `${n} đánh giá`,
    categoryTitle: "Tìm theo danh mục",
    areaTitle: "Tìm theo khu vực",
    areaPrev: "Khu vực trước",
    areaNext: "Khu vực tiếp",
    areaMore: "Xem thêm",
    areaListTitle: "Tất cả khu vực",
    areaListLead: "Chọn khu vực để tìm quán gần ga đó trên bản đồ",
    back: "Quay lại",
    areaCount: (n) => `${n} quán`,
    featureTitle: "Chủ đề",
    featureSub: "Khám phá nét hấp dẫn của Việt Nam theo chủ đề và mục đích",
    featureCafeTag: "Cà phê",
    featureCafeTitle: "Nghỉ chân với\ncà phê Việt ở Chiba",
    featureCafeSub: (n) => `${n} quán cà phê Việt ở Chiba`,
    featureGroceryTag: "Tạp hóa",
    featureGroceryTitle: "Bún tươi, rau thơm\nvà gia vị Việt",
    featureGrocerySub: (n) => `${n} tiệm tạp hóa Việt ở Kanto`,
    typeLabel: { restaurant: "Nhà hàng", grocery: "Tạp hóa", cafe: "Cà phê" },
    tabsLabel: "Menu chính",
    tabHome: "Trang chủ",
    tabMap: "Bản đồ",
    tabAccount: "Tài khoản",
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
  return appBase();
}
function mapUrl() {
  return appBase() + "?view=map";
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
  // その人の、このサイトの中での行動(すべて、この端末の中だけにある記録)から、点数を付ける
  //   ・見たお店: そのお店の近く(1.5kmで約0.37)/ 同じエリア / 同じカテゴリー / 同じ種類。新しく見たものほど重い
  //   ・保存したお店(♡): そのお店の近く / 同じエリア
  //   ・検索した言葉: 言葉が一致するお店、駅の近く(2km)のお店
  //   ・選んだ種類(料理店・食材店・カフェ)、特集を開いた回数
  //   ・トラベル・リストで選んだエリア(都道府県)と種類
  //   ・レビューのあるお店を優先する(js/todo.js の loadAllRatings で、すべてのお店の評価をまとめて読む)
  //   ・もう見たお店・保存したお店は出さない。同じエリアばかりにならないように、1エリア2件まで
  //   ・出すのは、レストラン(料理店)とカフェだけ(食材店は出さない。食材店を見た記録は、近さ・エリアの手がかりには使う)
  const recent = loadRecentShops();
  const searches = loadRecentSearches();
  const picks = loadTypePicks();
  const myList = typeof loadMyList === "function" ? loadMyList() : null;
  const byId = new Map(entries.map((e) => [e.shop.id, e]));
  const viewed = recent.map((id) => byId.get(id)).filter(Boolean);
  const saved = entries.filter((e) => isFavorite(e.shop));
  const hasSignal = viewed.length > 0 || saved.length > 0 || searches.length > 0 || Object.keys(picks).length > 0 || !!myList;
  if (!hasSignal) return { items: [], hasSignal: false };

  // 種類の好み(見たお店の種類 + 選んだ種類 + トラベル・リストの種類)
  const typeCount = { restaurant: 0, grocery: 0, cafe: 0 };
  viewed.forEach((e, i) => (typeCount[shopType(e.shop)] += Math.pow(0.85, i)));
  saved.forEach((e) => (typeCount[shopType(e.shop)] += 0.5));
  Object.keys(typeCount).forEach((k) => (typeCount[k] += Math.min(5, Number(picks[k]) || 0)));
  if (myList) myList.types.forEach((t) => (typeCount[t] += 1));
  const typeTotal = Object.values(typeCount).reduce((a, b) => a + b, 0);

  const areaKey = (shop) => (shop.area && typeof shop.area === "object" ? shop.area.ja : String(shop.area || ""));
  const catKey = (shop) => (typeof categoryText === "function" ? categoryText(shop) : "") || "";

  const exclude = new Set([...recent, ...saved.map((e) => e.shop.id)]); // もう見た・保存したお店は出さない
  const near = (km) => Math.exp(-km / 1.5); // 近いほど 1 に近い(1.5km で約 0.37)
  const REC_TYPES = ["restaurant", "cafe"];
  const scored = entries
    .filter((e) => !exclude.has(e.shop.id) && REC_TYPES.includes(shopType(e.shop)))
    .map((e) => {
      const { lat, lng } = e.shop;
      const area = areaKey(e.shop);
      const cat = catKey(e.shop);
      let score = 0;
      viewed.forEach((v, i) => {
        const w = Math.pow(0.8, i);
        score += w * near(distanceKm(v.shop.lat, v.shop.lng, lat, lng));
        if (area && areaKey(v.shop) === area) score += 0.35 * w;
        if (cat && catKey(v.shop) === cat) score += 0.2 * w;
        if (shopType(v.shop) === shopType(e.shop)) score += 0.1 * w;
      });
      saved.forEach((fav) => {
        score += 0.8 * near(distanceKm(fav.shop.lat, fav.shop.lng, lat, lng));
        if (area && areaKey(fav.shop) === area) score += 0.3;
      });
      const text = getSearchText(e.shop);
      searches.forEach((sr, i) => {
        const w = Math.pow(0.8, i);
        const placeHit = (sr.places || []).some((p) => Array.isArray(p) && distanceMeters(p[0], p[1], lat, lng) <= SEARCH_NEAR_STATION_M);
        if (placeHit || sr.terms.every((t) => text.includes(t))) score += 1.1 * w;
      });
      const place = score + (myList && myList.prefs.includes(e.shop.prefecture) ? 0.4 : 0); // 場所(エリア)の合い具合
      if (typeTotal > 0) score += 0.6 * (typeCount[shopType(e.shop)] / typeTotal);
      // レビューのあるお店を優先する。ただし、エリアも考える:
      //   ・関心のあるエリアのお店なら +1.2(→ レビューのないお店より先に出る)
      //   ・遠いエリアのお店は +0.6 まで(→ 関心のあるエリアのお店のあとに出る)
      //   ・件数(5件まで)と★の平均でも、少しだけ上げる
      const r = typeof todoRating === "function" ? todoRating(e.shop.id) : null;
      if (r && r.count > 0) score += 0.6 + 0.6 * Math.min(1, place) + 0.1 * Math.min(5, r.count) + 0.1 * (r.avg - 3);
      if (myList) {
        if (myList.prefs.includes(e.shop.prefecture)) score += 0.4;
        if (!myList.types.includes(shopType(e.shop))) score *= 0.6;
      }
      return { entry: e, score, area };
    })
    .filter((x) => x.score > 0.15)
    .sort((a, b) => b.score - a.score);
  // 同じエリアは2件まで(いろいろなお店が出るように)
  const perArea = new Map();
  const items = [];
  for (const x of scored) {
    const n = perArea.get(x.area) || 0;
    if (x.area && n >= 2) continue;
    perArea.set(x.area, n + 1);
    items.push(x);
    if (items.length >= 8) break;
  }
  return { items, hasSignal: true };
}

// おすすめのカードの「★ 4.5(3件)」。レビューの評価は js/todo.js の loadTodoRatings で読む
function homeRatingHtml(id) {
  const r = typeof todoRating === "function" ? todoRating(id) : null;
  const n = r ? r.count : 0;
  const label = homeText().reviewCount(n);
  return n
    ? `<span class="home-rec-star" aria-hidden="true">★</span><strong>${esc(r.avg.toFixed(1))}</strong> <span>${esc(label)}</span>`
    : `<span class="home-rec-star is-none" aria-hidden="true">★</span><span>${esc(label)}</span>`;
}
// 評価を読み終えたら、ホームのカードの評価だけを書き換える(横にスクロールした位置が戻らないように、全体は描き直さない)
function updateHomeRatings() {
  homePage.querySelectorAll("[data-rating-for]").forEach((el) => {
    el.innerHTML = homeRatingHtml(el.dataset.ratingFor);
  });
}

// ---------------------------------------------------------------------
// 絵(アイコン)。種類ごとの色は、地図のピンと同じ(料理店 = 赤、食材店 = 青、カフェ = 茶)
// ---------------------------------------------------------------------
const HOME_ICONS = {
  plus: '<path d="M12 5v14M5 12h14"></path>',
  close: '<path d="M6 6l12 12M18 6L6 18"></path>',
  check: '<path d="M5 12l4 4 10-10"></path>',
  back: '<path d="M15 5l-7 7 7 7"></path>',
  forward: '<path d="M9 5l7 7-7 7"></path>',
  sparkle: '<path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"></path><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"></path>',
  fnb: '<path d="M7 3v7a2 2 0 0 0 2 2v9"></path><path d="M5 3v5M9 3v5"></path><path d="M14 9h6v5a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3z"></path><path d="M17 17v4M15 21h4"></path><path d="M15 5c-.6 1 .6 1.6 0 2.6M18 5c-.6 1 .6 1.6 0 2.6"></path>',
  near: '<circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="12" r="8"></circle><path d="M12 1v3M12 20v3M1 12h3M20 12h3"></path>',
  restaurant: '<path d="M3 11h18a9 9 0 0 1-18 0z"></path><path d="M9 4c-1 1.5 1 2.5 0 4M13 4c-1 1.5 1 2.5 0 4"></path><path d="M15 2l5 6"></path>',
  grocery: '<path d="M3 4h2l2.4 11h11l2-8H6.3"></path><circle cx="9" cy="20" r="1.5"></circle><circle cx="17" cy="20" r="1.5"></circle>',
  cafe: '<path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"></path><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"></path><path d="M3 22h15"></path>',
  map: '<path d="M9 4l6 2 6-2v16l-6 2-6-2-6 2V6z"></path><path d="M9 4v16M15 6v16"></path>',
  search: '<circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"></path>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path>',
  user: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"></path>',
};
function homeIcon(name, size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${HOME_ICONS[name]}</svg>`;
}

// ---------------------------------------------------------------------
// エリアから探す: 駅を中心に、その近く(地図の検索と同じ 2km 以内)のお店
//   ・カードを押すと、地図の画面で「○○駅」と検索したのと同じ結果を出す
//   ・lat/lng は、地図の検索と同じ駅のデータ(data/stations-jp.json)の位置
//   ・件数は、地図の検索と同じ決まり(駅から 2km 以内、または住所などに「○○駅」の文字がある)で数える
//   ・image: エリアの写真(用意したら "images/area-shinjuku.jpg" のように書く)。無いときは色のカード
//   ・source: 写真の入手元(記録用。画面には出ない)。写真AC・Pexels はクレジット表記が不要
//   ・credit: 写真のクレジット(例: "撮影: ○○" / "Photo: ○○ / CC BY 4.0")。書くと、写真の右下に小さく出す
//   ・color: 写真が無いときのカードの色(エリアごとに少しずつ変える)
// ---------------------------------------------------------------------
const HOME_AREAS = [
  { station: "新宿", name: { ja: "新宿", en: "Shinjuku", vi: "Shinjuku" }, lat: 35.6922, lng: 139.7006, color: "#2e7d32", image: "images/areas/shinjuku.jpg", source: "写真AC" },
  { station: "池袋", name: { ja: "池袋", en: "Ikebukuro", vi: "Ikebukuro" }, lat: 35.7281, lng: 139.711, color: "#00796b", image: "images/areas/ikebukuro.jpg", source: "写真AC" },
  { station: "上野", name: { ja: "上野", en: "Ueno", vi: "Ueno" }, lat: 35.7134, lng: 139.7765, color: "#c0392b", image: "images/areas/ueno.jpg", source: "写真AC" },
  { station: "渋谷", name: { ja: "渋谷", en: "Shibuya", vi: "Shibuya" }, lat: 35.6581, lng: 139.7018, color: "#6a4c93", image: "images/areas/shibuya.jpg", source: "写真AC" },
  { station: "横浜", name: { ja: "横浜", en: "Yokohama", vi: "Yokohama" }, lat: 35.4662, lng: 139.6232, color: "#1e63d6", image: "images/areas/yokohama.jpg", source: "Pexels" },
  { station: "川崎", name: { ja: "川崎", en: "Kawasaki", vi: "Kawasaki" }, lat: 35.5314, lng: 139.6969, color: "#0277bd", image: "images/areas/kawasaki.jpg", source: "写真AC" },
  { station: "千葉", name: { ja: "千葉", en: "Chiba", vi: "Chiba" }, lat: 35.6137, lng: 140.1125, color: "#e67e22", image: "images/areas/chiba.jpg", source: "写真AC" },
  { station: "船橋", name: { ja: "船橋", en: "Funabashi", vi: "Funabashi" }, lat: 35.7017, lng: 139.9852, color: "#795548", image: "images/areas/funabashi.jpg", source: "写真AC" },
  { station: "新松戸", name: { ja: "新松戸", en: "Shin-Matsudo", vi: "Shin-Matsudo" }, lat: 35.8255, lng: 139.9212, color: "#558b2f", image: "images/areas/shinmatsudo.jpg", source: "写真AC" },
  { station: "大宮", name: { ja: "大宮", en: "Omiya", vi: "Omiya" }, lat: 35.9064, lng: 139.6243, color: "#ad1457", image: "images/areas/omiya.jpg", source: "写真AC" },
];
// お店の種類のイラスト(ホームのカテゴリと同じ images/entries/ の絵)。トラベル・リスト・最初の質問でも使う
//   読み込めないときは、これまでの線のアイコンに戻す
function typeIllustHtml(key, px) {
  return (
    `<span class="type-illust" style="width:${px}px;height:${px}px"><img src="images/entries/${key}.png" alt="" width="${px}" height="${px}" ` +
    `onerror="this.replaceWith(document.createRange().createContextualFragment(${esc(JSON.stringify(homeIcon(key, Math.round(px * 0.6))))}))"></span>`
  );
}
function homeAreaCount(area) {
  const word = normalizeText(area.station + "駅");
  return restaurants.filter(
    (shop) => getSearchText(shop).includes(word) || distanceMeters(area.lat, area.lng, shop.lat, shop.lng) <= SEARCH_NEAR_STATION_M
  ).length;
}
// エリアのカード(ホームの横並びと、「もっと見る」の一覧で同じものを使う)
function homeAreaCardsHtml() {
  return HOME_AREAS.map((a) => ({ a, n: homeAreaCount(a) }))
    .filter((x) => x.n > 0)
    .map(({ a, n }) => {
      // 写真は <img loading="lazy"> で出す(見えたときに読み込むので、表示が重くならない)
      return (
        `<li><button type="button" class="home-area${a.image ? " has-image" : ""}" style="background-color:${a.color}" data-home-area="${esc(a.station)}">` +
        (a.image ? `<img class="home-area-img" src="${esc(a.image)}" alt="" loading="lazy" width="480" height="336">` : "") +
        `<span class="home-area-name">${esc(pick(a.name))}</span>` +
        `<span class="home-area-count">${esc(homeText().areaCount(n))}</span>` +
        (a.image && a.credit ? `<span class="home-area-credit">${esc(a.credit)}</span>` : "") +
        `</button></li>`
      );
    })
    .join("");
}
function areaListUrl() {
  return appBase() + "?view=areas";
}
// ホームの各まとまりの見出しの上に出す、緑の小さな英語のラベル(例: 「Search By Area」)
function homeSectionLabel(text) {
  return `<p class="home-label" lang="en">${esc(text)}</p>`;
}
// 横にスライドする並びを、左右の「‹ ›」ボタンといっしょに包む(ボタンは PC だけ。写真の縦の真ん中に重ねる)
function hscrollHtml(listHtml, selector) {
  const h = homeText();
  const btn = (dir, icon, label) =>
    `<button type="button" class="hscroll-arrow is-${dir < 0 ? "prev" : "next"}" data-scroll-list="${selector}" data-scroll-dir="${dir}" aria-label="${esc(label)}">${homeIcon(icon, 22)}</button>`;
  return `<div class="hscroll">${btn(-1, "back", h.areaPrev)}${listHtml}${btn(1, "forward", h.areaNext)}</div>`;
}
// 「‹ ›」の高さを写真の真ん中に合わせ、端まで来たら、その向きのボタンを隠す
function updateHscrollArrows() {
  homePage.querySelectorAll(".hscroll").forEach((wrap) => {
    const list = wrap.querySelector("ul");
    if (!list) return;
    const img = list.querySelector(".home-rec-img") || list.querySelector(".fg-img") || list.querySelector("li"); // 写真の部分(無ければ、カード全体)
    if (img) {
      const a = img.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      if (a.height > 0) wrap.style.setProperty("--hscroll-mid", `${a.top - w.top + a.height / 2}px`);
    }
    const max = list.scrollWidth - list.clientWidth;
    wrap.classList.toggle("at-start", list.scrollLeft <= 2);
    wrap.classList.toggle("at-end", list.scrollLeft >= max - 2);
    if (!list.dataset.hscroll) {
      list.dataset.hscroll = "1";
      list.addEventListener("scroll", () => updateHscrollArrows(), { passive: true });
      // 写真が読み込まれたとき・マウスを乗せたときにも、高さを合わせ直す(読み込みの途中で、写真の高さが変わることがあるため)
      wrap.addEventListener("mouseenter", () => updateHscrollArrows());
      list.querySelectorAll("img").forEach((im) => im.addEventListener("load", () => updateHscrollArrows(), { once: true }));
    }
  });
}
window.addEventListener("resize", () => updateHscrollArrows());
function renderHomeAreas() {
  const cards = homeAreaCardsHtml();
  if (!cards) return "";
  return (
    `<section class="home-section home-area-section">` +
    homeSectionLabel("Search By Area") +
    `<div class="home-area-head"><h2 class="home-h2">${esc(homeText().areaTitle)}</h2>` +
    `<span class="mylist-head-actions">` +
    // 「もっと見る」: エリアの一覧のページ(URL「?view=areas」)
    `<a class="mylist-see-all" href="${esc(areaListUrl())}" data-home-nav>${esc(homeText().areaMore)}</a>` +
    `</span></div>` +
    // PC 用の「‹ ›」ボタンは、写真の左右の端(縦の真ん中)に重ねる(スマホは指で横にスクロール)
    hscrollHtml(`<ul class="home-areas">${cards}</ul>`, ".home-areas") +
    `</section>`
  );
}
// エリアの一覧のページ(URL「?view=areas」): すべてのエリアを、たて・よこに並べて見せる
function renderAreaListPage() {
  const h = homeText();
  homePage.innerHTML =
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(homeUrl())}" data-home-nav aria-label="${esc(h.back)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(h.areaListTitle)}</h2></div>` +
    `<section class="home-section area-list-section">` +
    `<p class="area-list-lead">${esc(h.areaListLead)}</p>` +
    `<ul class="area-list-grid">${homeAreaCardsHtml()}</ul>` +
    `</section>`;
}
// 地図の画面に移って、「○○駅」で検索する(ホームの検索窓から探したときと同じ)
function openMapWithSearch(q) {
  navigate(mapUrl());
  resetFilters();
  searchInput.value = q;
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));
}

// ---------------------------------------------------------------------
// ホームの中身
// ---------------------------------------------------------------------
let homeEntriesRise = true; // まだ一度も動かしていない(最初の1回だけ true)
// あなたへのおすすめ(写真つきのカードを横に並べる。おすすめのお店があるときだけ出す)
//   (しくみの説明や距離は、画面には出さない。記録を消すボタンは、アカウントの画面にある。js/account.js)
function homeRecSectionHtml() {
  const h = homeText();
  if (typeof loadAllRatings === "function") loadAllRatings();
  const rec = homeRecommendations();
  // おすすめは、写真つきのカードを横に並べる(1枚 = 1店舗。横にスライドして見る)
  if (typeof loadTodoRatings === "function") loadTodoRatings(rec.items.map((x) => x.entry.shop.id));
  const recItems = rec.items
    .map(({ entry }) => {
      const shop = entry.shop;
      const type = shopType(shop);
      const image = getShopImage(shop);
      const category = typeof categoryText === "function" ? categoryText(shop) : "";
      return (
        `<li><a class="home-rec-card" href="${esc(shopUrl(shop.id))}" data-shop-id="${esc(shop.id)}">` +
        `<span class="home-rec-img"><img src="${esc(image.src)}" alt="" loading="lazy" width="320" height="200"></span>` +
        `<span class="home-rec-card-body">` +
        `<span class="home-rec-card-name">${esc(pick(shop.name))}</span>` +
        `<span class="home-rec-rating" data-rating-for="${esc(shop.id)}">${homeRatingHtml(shop.id)}</span>` +
        `<span class="home-rec-area">📍 ${esc(pick(shop.area))}</span>` +
        `<span class="home-rec-tags"><span class="todo-tag" style="color:${(typeof TODO_TYPE_COLORS !== "undefined" && TODO_TYPE_COLORS[type]) || "#3f4d44"}">${esc(h.typeLabel[type])}</span>` +
        (category ? `<span class="todo-tag">${esc(category)}</span>` : "") +
        `</span></span></a>` +
        cardSaveButtonHtml(shop) +
        `</li>`
      );
    })
    .join("");
  if (!rec.items.length) return "";
  return (
    `<section class="home-section home-rec-section">` +
    homeSectionLabel("Recommendations For You") +
    `<div class="home-area-head"><h2 class="home-h2">${esc(h.recTitle)}</h2></div>` +
    `<p class="home-section-sub">${esc(h.recSub)}</p>` +
    hscrollHtml(`<ul class="home-rec-cards">${recItems}</ul>`, ".home-rec-cards") +
    `</section>`
  );
}
// レビューの評価がそろったら、おすすめの部分だけを描き直す(ほかの部分・スクロールの位置はそのまま)
function refreshHomeRec() {
  const slot = document.getElementById("home-rec-slot");
  if (!slot || !document.body.classList.contains("view-home") || homeMode !== "home") return;
  const html = homeRecSectionHtml();
  if (slot.innerHTML === html) return;
  slot.innerHTML = html;
  updateHscrollArrows();
}

function renderHome() {
  // スマホ(幅が狭い画面)では、検索窓の案内文を短くする(「(例: 千葉駅)」まで入れると、途中で切れてしまうため)
  const narrowScreen = window.matchMedia("(max-width: 480px)").matches;
  const h = homeText();
  const t = ui[currentLang];
  const count = (type) => restaurants.filter((s) => shopType(s) === type).length;
  const hasCafe = count("cafe") > 0;
  const lead = `${t.resultHeading(t.resultWhere("default"), t.resultWhat(null, false))}`;

  const entryButton = (key, label) =>
    `<button type="button" class="home-entry home-entry-${key}" data-home-action="${key}">` +
    // アイコンは、運営者が用意したイラスト(images/entries/)。読み込めないときは、これまでの線のアイコン
    `<span class="home-entry-icon has-illust"><img src="images/entries/${key}.png" alt="" width="192" height="192" ` +
    `onerror="this.parentNode.classList.remove('has-illust');this.replaceWith(document.createRange().createContextualFragment(${esc(JSON.stringify(homeIcon(key, 26)))}))"></span>` +
    `<span class="home-entry-label">${esc(label)}</span>` +
    `<span class="home-entry-arrow" aria-hidden="true">${homeIcon("forward", 18)}</span></button>`;


  const feature = (key, tag, title, sub) =>
    `<button type="button" class="home-feature home-feature-${key}" data-home-action="${key}">` +
    // 写真(運営者が用意した画像: images/feature-cafe.jpg・images/feature-grocery.jpg)と、文字を読みやすくする暗い影
    `<img class="home-feature-photo" src="images/feature-${key}.jpg?v=1" alt="" loading="lazy" decoding="async" width="1280" height="853">` +
    `<span class="home-feature-shade" aria-hidden="true"></span>` +
    `<span class="home-feature-tag">${esc(tag)}</span>` +
    `<span class="home-feature-text"><span class="home-feature-title">${esc(title)}</span>` +
    `<span class="home-feature-sub">${esc(sub)}</span></span></button>`;

  homePage.innerHTML =
    // 上の画像の部分(画像: 運営者が用意したベトナムの街並みのイラスト。images/hero-vietnam-street-v2.jpg)
    `<div class="home-top">` +
    `<section class="home-hero">` +
    `<h2 class="home-catch">${esc(h.catch)}</h2>` +
    `<p class="home-lead">${esc(lead)} <strong>${esc(t.resultCount(restaurants.length))}</strong></p>` +
    `</section>` +
    `</div>` +
    // ベトナムフーディーの紹介(赤い背景。js/home-intro.js)
    (typeof homeIntroHtml === "function" ? homeIntroHtml() : "") +
    // 検索窓は、画像の下に出す(スマホでは「探す」ボタンを隠し、キーボードの「検索」で探す)
    `<form class="home-search" role="search">` +
    `<label class="visually-hidden" for="home-search-input">${esc(h.searchLabel)}</label>` +
    `<span class="home-search-box">${homeIcon("search", 20)}` +
    `<input id="home-search-input" type="search" autocomplete="off" placeholder="${esc(narrowScreen ? h.searchPlaceholderShort : h.searchPlaceholder)}" enterkeyhint="search">` +
    `<button type="submit" class="home-search-btn">${esc(h.searchButton)}</button></span>` +
    `</form>` +
    // ベトナムフーディーでできること(js/feature-guide.js)と、トラベル・リスト(js/todo.js): 検索窓のすぐ下、カテゴリーから探すの上
    (typeof featureGuideHtml === "function" ? featureGuideHtml() : "") +
    (typeof renderTodoSection === "function" ? renderTodoSection() : "") +
    // カテゴリのボタン: ページを開いて最初にホームを出したときだけ、下からふわっと順番に出す(描き直しのたびには動かさない)
    // カテゴリーから探す(見出し。緑の英語は、英語の画面では出さない)
    `<div class="home-entries-head">${homeSectionLabel("Search By Category")}<h2 class="home-h2">${esc(h.categoryTitle)}</h2></div>` +
    `<nav class="home-entries${homeEntriesRise ? " is-rise" : ""}" aria-label="${esc(h.entriesLabel)}">` +
    // 入口は4つ: レストラン・カフェ・食材店(地図でその種類だけを出す)と、近くのお店(現在地のまわり)
    entryButton("restaurant", h.entryRestaurant) +
    (hasCafe ? entryButton("cafe", h.entryCafe) : "") +
    entryButton("grocery", h.entryGrocery) +
    entryButton("near", h.entryNear) +
    `</nav>` +
    `<p class="home-status" role="status" hidden></p>` +
    // エリアから探す(駅のまわりのお店。カードを押すと、地図で「○○駅」を検索)
    renderHomeAreas() +
    `<div class="home-divider"></div>` +
    // あなたへのおすすめ(レビューの評価を読み終えたら、ここだけ描き直す)
    `<div id="home-rec-slot">${homeRecSectionHtml()}</div>` +
    // ユーザー(あなたへのおすすめの下、特集の上): ほかのユーザーを見つけて、フォローする(js/people.js)
    (typeof homePeopleHtml === "function" ? homePeopleHtml() : "") +
    `<section class="home-section">` +
    homeSectionLabel("Special Feature") +
    `<h2 class="home-h2">${esc(h.featureTitle)}</h2>` +
    `<p class="home-section-sub">${esc(h.featureSub)}</p>` +
    `<div class="home-features">` +
    (hasCafe ? feature("cafe", h.featureCafeTag, h.featureCafeTitle, h.featureCafeSub(restaurants.filter((r) => shopType(r) === "cafe" && r.prefecture === "千葉県").length)) : "") +
    feature("grocery", h.featureGroceryTag, h.featureGroceryTitle, h.featureGrocerySub(count("grocery"))) +
    `</div>` +
    // このページをシェアする(特集の中の下)
    homeShareHtml() +
    `</section>` +
    // お問い合わせ(js/contact.js)
    (typeof homeContactHtml === "function" ? homeContactHtml() : "") +
    // いちばん下: ロゴ・サイト名、利用規約などへのリンク(縦に並べる)、著作権の表示
    `<footer class="home-footer-block">` +
    `<a class="home-footer-brand" href="${esc(homeUrl())}" data-home-nav>` +
    `<img src="images/logo.png" alt="" width="158" height="208" loading="lazy">` +
    `<span>${esc(t.title)}</span></a>` +
    `<nav class="home-footer" aria-label="Site pages">` +
    // 並び: 事業者情報 → プライバシーポリシー → 利用規約
    `<a href="${esc(aboutUrl())}" data-home-nav>${esc(t.aboutPageTitle)}</a>` +
    `<a href="${esc(privacyUrl())}" data-home-nav>${esc(t.privacyPageTitle)}</a>` +
    `<a href="${esc(termsUrl())}" data-home-nav>${esc(t.termsPageTitle)}</a>` +
    `</nav>` +
    // 運営会社のロゴと、権利の表示(画像は運営者から提供されたもの)
    `<p class="site-copyright"><a class="site-copyright-logo" href="https://compass-story.net/" target="_blank" rel="noopener"><img src="images/compass-story-logo.png" alt="Compass Story" width="360" height="133" loading="lazy"></a>` +
    `<span>© Compass Story ALL RIGHTS RESERVED.</span></p>` +
    `</footer>`;
  homeEntriesRise = false;
  ensureHeaderSearch();
  paintHomeBands();
  requestAnimationFrame(updateHomeTitleColor);
  attachSwipeBars();
  updateHscrollArrows();
  if (typeof setupHomeReveal === "function") setupHomeReveal(); // PC: スクロールで、写真やカードを浮かび上がらせる(js/home-reveal.js)
  setTimeout(updateHscrollArrows, 400); // 写真の読み込みで高さが変わることがあるので、少しあとにも合わせ直す
}

// ---------------------------------------------------------------------
// 横にスライドする並び(エリアから探す・トラベル・リスト・あなたへのおすすめ・特集)の下に、
// いまどのあたりを見ているかが分かる「バー」を出す
//   ・バーの長さ = 見えている割合、位置 = スクロールした位置。スライドに合わせて動く
//   ・全部が画面に収まっていて、スライドできないときは出さない
// ---------------------------------------------------------------------
const SWIPE_SELECTORS = [".home-areas", ".mylist-carousel", ".home-rec-cards", ".home-features"];
function updateSwipeBar(list) {
  const bar = list.nextElementSibling;
  if (!bar || !bar.classList.contains("swipe-bar")) return;
  const total = list.scrollWidth;
  const view = list.clientWidth;
  const can = total - view > 4;
  bar.hidden = !can;
  if (!can) return;
  const thumb = bar.firstElementChild;
  const ratio = view / total;
  const pos = list.scrollLeft / (total - view); // 0〜1
  thumb.style.width = `${ratio * 100}%`;
  thumb.style.left = `${pos * (1 - ratio) * 100}%`;
}
function attachSwipeBars() {
  homePage.querySelectorAll(SWIPE_SELECTORS.join(",")).forEach((list) => {
    if (!list.nextElementSibling || !list.nextElementSibling.classList.contains("swipe-bar")) {
      const bar = document.createElement("div");
      bar.className = "swipe-bar";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = "<span></span>";
      list.after(bar);
    }
    if (!list.dataset.swipeBar) {
      list.dataset.swipeBar = "1";
      list.addEventListener("scroll", () => updateSwipeBar(list), { passive: true });
    }
    updateSwipeBar(list);
    // 画像の読み込みで幅が変わることがあるので、少しあとにも合わせ直す
    setTimeout(() => updateSwipeBar(list), 400);
  });
}
window.addEventListener("resize", () => homePage.querySelectorAll(SWIPE_SELECTORS.join(",")).forEach(updateSwipeBar));

// ホームの各まとまりの背景色を決める(色そのものは css/style.css の「ホームの背景色の帯」)
function paintHomeBands() {
  // ホームの各まとまりの背景色(上から):
  //   カテゴリーから探す・エリアから探す = 白(間に細い線)/ おすすめの機能・トラベル・リスト = 薄い青緑 /
  //   あなたへのおすすめ = 白 / 特集(シェアを含む)= グレー / ユーザー = 白 / お問い合わせ = グレー(CSS)
  const sections = [...homePage.querySelectorAll(":scope > .home-section")].filter((el) => !el.classList.contains("home-top"));
  sections.forEach((el) => el.classList.remove("home-band", "home-band-gray", "home-band-teal", "home-band-line"));
  sections.forEach((el) => {
    if (el.classList.contains("home-area-section")) el.classList.add("home-band-line");
    else if (el.classList.contains("feature-guide") || el.classList.contains("todo-intro")) el.classList.add("home-band", "home-band-teal");
    else if (el.querySelector(":scope > .home-features")) el.classList.add("home-band", "home-band-gray");
  });
}

// ---------------------------------------------------------------------
// このページをシェアする(特集の中の下)
//   ・X・Facebook・LINE: 各サービスのシェア画面を新しいタブで開く(このサイトから何かを送ったり、記録したりはしない)
//   ・いちばん右: スマホなどに最初から入っている「共有」画面を開く。使えないブラウザ(多くのパソコン)では、URLをコピーする
// ---------------------------------------------------------------------
const SHARE_URL = "https://vietnamfoodie.compass-story.net/";
const SHARE_TEXT = {
  ja: { title: "このページをシェアする", button: "リンクをコピー・共有", text: "ベトナムフーディー｜日本の中にある、ベトナムを探そう。", copied: "URLをコピーしました", failed: "コピーできませんでした。URL: " },
  en: { title: "Share this page", button: "Copy link / Share", text: "Vietnam Foodie – Discover Vietnam-related shops in Japan", copied: "Link copied", failed: "Could not copy. URL: " },
  vi: { title: "Chia sẻ trang này", button: "Sao chép / Chia sẻ", text: "Foodie Việt Nam – Tìm Việt Nam tại Nhật Bản", copied: "Đã sao chép liên kết", failed: "Không thể sao chép. URL: " },
};
const SHARE_ICON =
  `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
  `<path d="M12 3v12"/><path d="M7.5 7.5 12 3l4.5 4.5"/><path d="M8 11H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2"/></svg>`;
// シェアのボタン(X・Facebook・LINE は各社の公式ロゴ。色・形は変えずに使う)
//   ・押すと、各サービスの「シェアする画面」を新しいタブで開く(送るのは、このサイトのURLと短い紹介文だけ)
//   ・いちばん右の丸: スマホの共有画面を開く(無い端末では、URLをコピー)
const SHARE_LOGOS = {
  x:
    `<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="#ffffff" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>`,
  facebook:
    `<svg viewBox="0 0 24 24" width="64" height="64" aria-hidden="true"><path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>`,
  line:
    `<svg viewBox="0 0 24 24" width="38" height="38" aria-hidden="true"><path fill="#ffffff" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>`,
};
function homeShareLinks() {
  const x = SHARE_TEXT[currentLang] || SHARE_TEXT.ja;
  const url = encodeURIComponent(SHARE_URL);
  const text = encodeURIComponent(x.text);
  return [
    { key: "x", label: "X", href: `https://x.com/intent/post?text=${text}&url=${url}` },
    { key: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { key: "line", label: "LINE", href: `https://social-plugins.line.me/lineit/share?url=${url}` },
  ];
}
// 特集の中の下に出す
function homeShareHtml() {
  const x = SHARE_TEXT[currentLang] || SHARE_TEXT.ja;
  return (
    `<div class="home-share">` +
    `<h3 class="home-share-title">${esc(x.title)}</h3>` +
    `<div class="home-share-btns">` +
    homeShareLinks()
      .map(
        (l) =>
          `<a class="home-share-sns is-${l.key}" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(l.label)}">${SHARE_LOGOS[l.key]}</a>`
      )
      .join("") +
    `<button type="button" class="home-share-sns is-more" data-home-share aria-label="${esc(x.button)}" title="${esc(x.button)}">${SHARE_ICON}</button>` +
    `</div>` +
    `<p class="home-share-msg" role="status" aria-live="polite"></p>` +
    `</div>`
  );
}
async function shareHomePage(btn) {
  const x = SHARE_TEXT[currentLang] || SHARE_TEXT.ja;
  const msg = btn.closest(".home-share")?.querySelector(".home-share-msg");
  const say = (t) => {
    if (!msg) return;
    msg.textContent = t;
    clearTimeout(shareHomePage.timer);
    shareHomePage.timer = setTimeout(() => (msg.textContent = ""), 3000);
  };
  const data = { title: document.title, text: x.text, url: SHARE_URL };
  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (e) {
      // 共有画面を閉じただけ(AbortError)のときは何もしない
    }
    return;
  }
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("no clipboard");
    await navigator.clipboard.writeText(SHARE_URL);
    say(x.copied);
  } catch (e) {
    say(x.failed + SHARE_URL);
  }
}
document.addEventListener("click", (e) => {
  const btn = e.target.closest && e.target.closest("[data-home-share]");
  if (btn) shareHomePage(btn);
});

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
      homeUserMarker = createUserDotMarker(latlng).addTo(map);
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
  const listArrow = event.target.closest("[data-scroll-list]");
  if (listArrow) {
    const list = homePage.querySelector(listArrow.dataset.scrollList);
    if (list) list.scrollBy({ left: Number(listArrow.dataset.scrollDir) * list.clientWidth * 0.8, behavior: "smooth" });
    return;
  }
  const arrow = event.target.closest("[data-area-scroll]");
  if (arrow) {
    const list = homePage.querySelector(".home-areas");
    if (list) list.scrollBy({ left: Number(arrow.dataset.areaScroll) * list.clientWidth * 0.8, behavior: "smooth" });
    return;
  }
  const areaBtn = event.target.closest("[data-home-area]");
  if (areaBtn) {
    openMapWithSearch(areaBtn.dataset.homeArea + "駅");
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
  } else if (action.classList.contains("home-entry") && ["restaurant", "cafe", "grocery"].includes(key)) {
    // 入口のボタン(レストラン・カフェ・食材店): 地図でその種類だけを出す。スマホは、一覧を開く
    openMapWithType(key);
    if (window.matchMedia("(max-width: 600px)").matches && typeof openScanOverlay === "function") openScanOverlay("list");
  } else if ((key === "cafe" || key === "grocery") && typeof renderFeaturePage === "function") {
    // 特集: その種類のお店の一覧(近く・エリアで絞り込める。js/feature.js)
    navigate(featureUrl(key));
  } else openMapWithType(key);
});

// 検索: 地図の画面の検索ボックスに同じ言葉を入れて、地図の画面に移る(スマホでは、結果の一覧が自動で開く)
homePage.addEventListener("submit", (event) => {
  if (!event.target.matches(".home-search")) return; // ほかのフォーム(ほかの画面のフォーム)は、それぞれで受け取る
  event.preventDefault();
  const input = homePage.querySelector("#home-search-input");
  const q = input.value.trim();
  if (!q) return;
  openMapWithSearch(q);
  input.value = "";
});

// ---------------------------------------------------------------------
// 画面の切り替え(js/detail.js の renderRoute から呼ばれる)
// ---------------------------------------------------------------------
//   mode: "todo" のときは、ホームの場所に「トラベル・リストを作る」の画面を出す(URL「?view=todo」。js/todo.js)
let homeMode = "home";
//   mode: "todo-list" のときは、そのリストの一覧(URL「?view=todo&list=ID」)
let homeListId = null;
function showHome(mode, listId) {
  showList(true); // 詳細ページなどの状態を片付ける(一覧・地図の状態は、そのまま残る)
  document.body.classList.add("view-home");
  homeView.hidden = false;
  const modes = [];
  if (typeof renderMyList === "function") modes.push("todo", "todo-edit", "todo-area");
  if (typeof renderAccountPage === "function") modes.push("account", "user", "saved");
  if (typeof renderFeaturePage === "function") modes.push("feature");
  if (typeof renderContactPage === "function") modes.push("contact");
  modes.push("areas");
  if (typeof renderPeoplePage === "function") modes.push("people");
  homeMode = modes.includes(mode) ? mode : "home";
  if (homeMode === "contact" && typeof resetContactIfDone === "function") resetContactIfDone();
  homeListId = listId || null;
  renderHomeMode();
  homeView.scrollTop = 0;
  renderTabs();
}
// いまの画面(ホーム / トラベル・リスト / トラベル・リストの設定 / エリアのお店の一覧)を描き直す
// ホームのトップ: ロゴの横のサイト名の色を、うしろが写真(暗い)なら白、それ以外なら黒にする
function updateHomeTitleColor() {
  const header = document.querySelector("header");
  if (!header) return;
  const hero = document.body.classList.contains("is-home-top") ? homePage.querySelector(".home-top") : null;
  let onPhoto = false;
  if (hero) {
    const r = hero.getBoundingClientRect();
    const h = header.getBoundingClientRect();
    const mid = h.top + Math.min(h.height, 64) / 2; // サイト名のあたりの高さ
    onPhoto = r.top <= mid && r.bottom >= mid;
  }
  header.classList.toggle("is-on-photo", onPhoto);
  // 下にスクロールしたら、サイト名を隠して、ロゴだけにする(一番上に戻ると、また出す)
  header.classList.toggle("is-scrolled", !!hero && homeView.scrollTop > 40);
}
homeView.addEventListener("scroll", updateHomeTitleColor, { passive: true });
window.addEventListener("resize", updateHomeTitleColor);

function renderHomeMode() {
  // ホームのトップだけ、上の白い帯をなくして、左上にロゴ・右上に言語を浮かせる(CSS の body.is-home-top)
  document.body.classList.toggle("is-home-top", homeMode === "home");
  // アカウントの画面(自分のアカウント・設定・保存したお店・ほかの人のプロフィール)では、上の「ベトナムフーディー」の帯を出さない
  document.body.classList.toggle("is-account-view", ["account", "user", "saved"].includes(homeMode));
  if (homeMode !== "home") updateHomeTitleColor();
  if (homeMode === "todo") renderMyList();
  else if (homeMode === "todo-edit") renderMyListSettings();
  else if (homeMode === "todo-area") renderMyListArea(homeListId);
  else if (homeMode === "account") renderAccountPage();
  else if (homeMode === "saved") renderSavedPage();
  else if (homeMode === "user") renderUserPage(homeListId);
  else if (homeMode === "feature") renderFeaturePage(homeListId);
  else if (homeMode === "contact") renderContactPage();
  else if (homeMode === "areas") renderAreaListPage();
  else if (homeMode === "people") renderPeoplePage();
  else renderHome();
}
function hideHome() {
  document.body.classList.remove("view-home", "is-home-top", "is-account-view");
  const header = document.querySelector("header");
  if (header) header.classList.remove("is-on-photo", "is-scrolled");
  homeView.hidden = true;
}

// 画面の下のタブ(スマホだけ。ホーム・地図・保存)
function renderTabs() {
  const h = homeText();
  const inHome = document.body.classList.contains("view-home");
  const isAccount = inHome && (homeMode === "account" || homeMode === "user" || homeMode === "saved");
  const isHome = inHome && !isAccount;
  const isMap = !inHome && !document.body.classList.contains("view-detail") && !document.body.classList.contains("view-content-page");
  const tab = (key, icon, label, current) =>
    `<button type="button" class="app-tab${current ? " is-current" : ""}" data-tab="${key}"${current ? ' aria-current="page"' : ""}>` +
    `${homeIcon(icon, 24)}<span>${esc(label)}</span></button>`;
  appTabs.setAttribute("aria-label", h.tabsLabel);
  appTabs.innerHTML =
    tab("home", "home", h.tabHome, isHome) +
    tab("map", "map", h.tabMap, isMap) +
    // 保存した店は、アカウントの中に入れた(アカウント → ♡ 保存した店)
    tab("account", "user", h.tabAccount, isAccount);
}
appTabs.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-tab]");
  if (!btn) return;
  const key = btn.dataset.tab;
  if (key === "home") navigate(homeUrl());
  else if (key === "map") {
    navigate(mapUrl());
    if (favoritesOnly) resetFilters();
  } else if (key === "account") navigate(appBase() + "?view=account");
  renderTabs();
});

// 言語を切り替えたら、ホームとタブの文字も切り替える(currentLang が変わったあとに)
document.getElementById("lang-select").addEventListener("change", () => {
  setTimeout(() => {
    if (document.body.classList.contains("view-home")) renderHomeMode();
    renderTabs();
  }, 0);
});

// PC のホームだけ: 画面の上の帯(ロゴ・サイト名の右横)に、検索バーを出す(CSS で、PC のホームのときだけ見える)
//   ・下にスクロールしても、上の帯といっしょに出たまま
//   ・探すと、ホームの検索窓と同じく、地図の画面で結果を出す
function ensureHeaderSearch() {
  const header = document.querySelector("header");
  const brand = document.getElementById("brand-link");
  if (!header || !brand) return;
  const h = homeText();
  let form = document.getElementById("header-search");
  if (!form) {
    form = document.createElement("form");
    form.id = "header-search";
    form.className = "header-search";
    form.setAttribute("role", "search");
    brand.insertAdjacentElement("afterend", form);
    // 検索バーを押すと、検索バーだけを明るく残して、ほかを暗くする(もう一度ほかを押すか、Esc で元に戻る)
    const shade = document.createElement("div");
    shade.className = "header-search-shade";
    shade.setAttribute("aria-hidden", "true");
    header.appendChild(shade);
    shade.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      if (input) input.blur();
    });
    form.addEventListener("focusin", () => document.body.classList.add("is-header-search-focus"));
    form.addEventListener("focusout", () => document.body.classList.remove("is-header-search-focus"));
    form.addEventListener("keydown", (event) => {
      if (event.key === "Escape") event.target.blur();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      const q = input.value.trim();
      if (!q) return;
      openMapWithSearch(q);
      input.value = "";
      input.blur();
    });
  }
  const current = form.querySelector("input") ? form.querySelector("input").value : "";
  form.innerHTML =
    `<label class="visually-hidden" for="header-search-input">${esc(h.searchLabel)}</label>` +
    `<span class="header-search-box">${homeIcon("search", 18)}` +
    `<input id="header-search-input" type="search" autocomplete="off" placeholder="${esc(h.searchPlaceholder)}" enterkeyhint="search"></span>`;
  form.querySelector("input").value = current;
}
