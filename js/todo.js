// マイリスト(My List)
//   ・最初に「どのエリア(東京・千葉・埼玉・神奈川)」と「何を探す(料理店・カフェ・食材店)」を選んで保存する
//   ・保存したあとは、エリアごとのカード(そのエリアの、選んだ種類のお店の件数)を出す。
//     カードを押すと、そのエリアのお店の一覧(URL「?view=todo&area=東京都」)。お店のカードを押すと、お店のページ(?shop=ID)
//   ・お店の一覧は「おすすめ順」= みんなのレビューの評価(★)が高い順(同じなら、レビューが多い順 → データの順)
//   ・選んだ内容を変えるときは、右上の設定マーク(URL「?view=todo&edit=1」)から
//   ・選んだ内容は、この端末(ブラウザの localStorage)の中だけに保存する。サーバーや第三者には送らない
//   ・レビューの評価は、店舗ページのレビューと同じもの(Firestore)を読むだけ。選んだ内容は送らない
//   ・「こちらもおすすめ」: 最近見たお店があるエリアのうち、まだ選んでいないエリア(計算は端末の中だけ)

const MYLIST_KEY = "vf_mylist"; // { prefs: ["東京都", ...], types: ["restaurant", ...], savedAt }
const OLD_TODO_KEY = "vf_todo_lists"; // 前の版の「行きたいお店のリスト」。もう使わないので、見つけたら消す
const MYLIST_TYPES = ["restaurant", "cafe", "grocery"];

const TODO_TEXT = {
  ja: {
    sectionTitle: "マイリスト",
    sectionSub: "行きたいエリアと、探したいお店を選んでおけます",
    start: "マイリストを作る",
    startSub: "エリアと、探したいお店を選ぶだけ",
    settings: "マイリストの設定",
    settingsOpen: "マイリストの設定を変える",
    close: "閉じる",
    count: (n) => `${n}件`,
    areaCount: (n) => `${n}つのエリア`,
    alsoTitle: "こちらもおすすめ",
    storedNote: "マイリストの設定は、この端末の中だけに保存しています",
    backToList: "マイリストに戻る",
    backToHome: "ホームに戻る",
    all: "すべて",
    rankNote: "おすすめ順(レビューの評価が高い順)",
    noReviews: "レビューはまだありません",
    reviews: (avg, n) => `${avg} (${n}件)`,
    detail: "お店のページを見る",
    empty: "このエリアには、選んだ種類のお店がまだありません",
    step1: "どのエリアに行く?(いくつでも)",
    step2: "何を探す?(いくつでも)",
    needArea: "エリアを1つ以上選んでください",
    needType: "探したいお店を1つ以上選んでください",
    save: "この内容で保存",
    saved: "保存しました",
    reset: "マイリストをリセット",
    resetConfirm: "本当にリセットする",
  },
  en: {
    sectionTitle: "My List",
    sectionSub: "Pick the areas you want to go and the shops you're looking for",
    start: "Make My List",
    startSub: "Just choose areas and the kinds of shops",
    settings: "My List settings",
    settingsOpen: "Change My List settings",
    close: "Close",
    count: (n) => `${n} shops`,
    areaCount: (n) => (n === 1 ? "1 area" : `${n} areas`),
    alsoTitle: "You may also like",
    storedNote: "My List settings are saved only on this device",
    backToList: "Back to My List",
    backToHome: "Back to home",
    all: "All",
    rankNote: "Recommended order (highest rated first)",
    noReviews: "No reviews yet",
    reviews: (avg, n) => `${avg} (${n})`,
    detail: "See shop page",
    empty: "There are no shops of the chosen kinds in this area yet",
    step1: "Which areas are you going to? (any)",
    step2: "What are you looking for? (any)",
    needArea: "Please choose at least one area",
    needType: "Please choose at least one kind of shop",
    save: "Save",
    saved: "Saved",
    reset: "Reset My List",
    resetConfirm: "Really reset",
  },
  vi: {
    sectionTitle: "Danh sách của tôi",
    sectionSub: "Chọn khu vực muốn đến và loại quán bạn đang tìm",
    start: "Tạo danh sách của tôi",
    startSub: "Chỉ cần chọn khu vực và loại quán",
    settings: "Cài đặt danh sách",
    settingsOpen: "Thay đổi cài đặt danh sách",
    close: "Đóng",
    count: (n) => `${n} quán`,
    areaCount: (n) => `${n} khu vực`,
    alsoTitle: "Có thể bạn cũng thích",
    storedNote: "Cài đặt danh sách chỉ được lưu trên thiết bị này",
    backToList: "Về danh sách của tôi",
    backToHome: "Về trang chủ",
    all: "Tất cả",
    rankNote: "Thứ tự gợi ý (đánh giá cao trước)",
    noReviews: "Chưa có đánh giá",
    reviews: (avg, n) => `${avg} (${n})`,
    detail: "Xem trang quán",
    empty: "Khu vực này chưa có quán thuộc loại đã chọn",
    step1: "Bạn sẽ đến khu vực nào? (chọn nhiều)",
    step2: "Bạn đang tìm gì? (chọn nhiều)",
    needArea: "Hãy chọn ít nhất một khu vực",
    needType: "Hãy chọn ít nhất một loại quán",
    save: "Lưu",
    saved: "Đã lưu",
    reset: "Đặt lại danh sách",
    resetConfirm: "Đặt lại thật",
  },
};
function todoText() {
  return TODO_TEXT[currentLang] || TODO_TEXT.ja;
}

// 選べるエリア = 地図にある都道府県(js/data.js の prefectures。いまは東京・神奈川・千葉・埼玉)
function myListPrefs() {
  return prefectures.filter((p) => restaurants.some((s) => s.prefecture === p.key));
}
// 選べる種類(カフェは、カフェのお店があるときだけ)
function myListTypeChoices() {
  return MYLIST_TYPES.filter((t) => restaurants.some((s) => shopType(s) === t));
}

// ---------------------------------------------------------------------
// 保存(この端末の中だけ)
// ---------------------------------------------------------------------
function loadMyList() {
  try {
    if (localStorage.getItem(OLD_TODO_KEY) !== null) localStorage.removeItem(OLD_TODO_KEY); // 前の版のリストは消す
    const v = JSON.parse(localStorage.getItem(MYLIST_KEY) || "null");
    if (!v || !Array.isArray(v.prefs) || !Array.isArray(v.types)) return null;
    const prefKeys = prefectures.map((p) => p.key);
    const prefs = v.prefs.filter((k) => prefKeys.includes(k));
    const types = v.types.filter((t) => MYLIST_TYPES.includes(t));
    return prefs.length && types.length ? { prefs, types } : null;
  } catch (e) {
    return null;
  }
}
function saveMyList(prefs, types) {
  try {
    localStorage.setItem(MYLIST_KEY, JSON.stringify({ prefs, types, savedAt: new Date().toISOString() }));
    return true;
  } catch (e) {
    return false;
  }
}
function resetMyList() {
  try {
    localStorage.removeItem(MYLIST_KEY);
  } catch (e) {
    // 消せない(プライベートブラウズなど)ときは、何もしない
  }
}

// そのエリアの、選んだ種類のお店
function myListShops(prefKey, types) {
  return entries.filter((e) => e.shop.prefecture === prefKey && types.includes(shopType(e.shop)));
}

// ---------------------------------------------------------------------
// レビューの評価(★の平均と件数)。店舗ページと同じレビューを読む。読んだ結果は、このページを開いている間だけ覚えておく
// ---------------------------------------------------------------------
const todoRatings = new Map(); // 店舗ID → { avg, count } | "loading" | null(読めなかった)
function loadTodoRatings(ids) {
  const need = ids.filter((id) => !todoRatings.has(id));
  if (!need.length || typeof getReviewsApi !== "function") return;
  need.forEach((id) => todoRatings.set(id, "loading"));
  getReviewsApi()
    .then((api) =>
      Promise.all(
        need.map((id) =>
          api
            .fetchReviews(id)
            .then((list) => {
              const shown = list.filter((r) => !r.hidden && Number.isFinite(Number(r.rating)));
              const count = shown.length;
              const avg = count ? shown.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
              todoRatings.set(id, { avg, count });
            })
            .catch(() => todoRatings.set(id, null))
        )
      )
    )
    .catch(() => need.forEach((id) => todoRatings.set(id, null)))
    .then(() => {
      // 評価がそろったら、いま開いている画面を、おすすめ順に並べ直す
      if (document.body.classList.contains("view-home") && homeMode === "todo-area") {
        const y = homeView.scrollTop;
        renderHomeMode();
        homeView.scrollTop = y;
      }
    });
}
function todoRating(id) {
  const r = todoRatings.get(id);
  return r && r !== "loading" ? r : null;
}
// おすすめ順: 評価(★の平均)が高い順 → 同じならレビューが多い順 → 同じなら、もとの順
function sortByRecommendation(list) {
  return list
    .map((e, i) => ({ e, i, r: todoRating(e.shop.id) }))
    .sort((a, b) => {
      const av = a.r && a.r.count ? a.r.avg : -1;
      const bv = b.r && b.r.count ? b.r.avg : -1;
      if (bv !== av) return bv - av;
      const ac = a.r ? a.r.count : 0;
      const bc = b.r ? b.r.count : 0;
      if (bc !== ac) return bc - ac;
      return a.i - b.i;
    })
    .map((x) => x.e);
}

// ---------------------------------------------------------------------
// 画面の部品
// ---------------------------------------------------------------------
const TODO_TYPE_COLORS = { restaurant: "#e53935", grocery: "#1e63d6", cafe: "#795548" };
const TODO_PIN_ICON =
  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"></path><circle cx="12" cy="10" r="2.4"></circle></svg>';
const TODO_GEAR_ICON =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="3"></circle>' +
  '<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path></svg>';

function myListAreaUrl(prefKey) {
  return location.pathname + "?view=todo&area=" + encodeURIComponent(prefKey);
}
function myListEditUrl() {
  return location.pathname + "?view=todo&edit=1";
}

function todoStars(id) {
  const x = todoText();
  const r = todoRating(id);
  if (!r || !r.count) return `<span class="todo-stars is-none">${esc(x.noReviews)}</span>`;
  return `<span class="todo-stars"><span class="todo-star" aria-hidden="true">★</span>${esc(x.reviews(r.avg.toFixed(1), r.count))}</span>`;
}

// お店のカード(カード全体が、お店のページへのリンク)
function todoShopCard(entry) {
  const x = todoText();
  const h = homeText();
  const shop = entry.shop;
  const type = shopType(shop);
  const image = getShopImage(shop);
  const category = typeof categoryText === "function" ? categoryText(shop) : "";
  return (
    `<li class="todo-shop">` +
    `<a class="todo-shop-link" href="${esc(shopUrl(shop.id))}" data-shop-id="${esc(shop.id)}">` +
    `<span class="todo-shop-img"><img src="${esc(image.src)}" alt="" loading="lazy" width="120" height="90"></span>` +
    `<span class="todo-shop-body">` +
    `<span class="todo-shop-name">${esc(pick(shop.name))}</span>` +
    todoStars(shop.id) +
    `<span class="todo-shop-area">📍 ${esc(pick(shop.area))}</span>` +
    `<span class="todo-shop-tags"><span class="todo-tag" style="color:${TODO_TYPE_COLORS[type]}">${esc(h.typeLabel[type])}</span>` +
    (category ? `<span class="todo-tag">${esc(category)}</span>` : "") +
    `</span>` +
    `<span class="todo-shop-more">${esc(x.detail)} ›</span>` +
    `</span></a></li>`
  );
}

// エリアのカード: エリア名と、種類ごとの件数(色の点つき)、合計の件数
function myListAreaCard(pref, types, muted) {
  const x = todoText();
  const h = homeText();
  const shops = myListShops(pref.key, types);
  const parts = types
    .map((t) => ({ t, n: shops.filter((e) => shopType(e.shop) === t).length }))
    .filter((p) => p.n > 0)
    .map((p) => `<span class="mylist-kind"><span class="mylist-kind-dot" style="background:${TODO_TYPE_COLORS[p.t]}"></span>${esc(h.typeLabel[p.t])} ${p.n}</span>`)
    .join("");
  return (
    `<a class="mylist-area${muted ? " is-muted" : ""}" href="${esc(myListAreaUrl(pref.key))}" data-mylist-area="${esc(pref.key)}">` +
    `<span class="mylist-area-icon">${TODO_PIN_ICON}</span>` +
    `<span class="mylist-area-body"><span class="mylist-area-name">${esc(pick(pref.label))}</span>` +
    `<span class="mylist-kinds">${parts}</span></span>` +
    `<span class="mylist-area-count">${esc(x.count(shops.length))}${homeIcon("forward", 18)}</span>` +
    `</a>`
  );
}

// 「こちらもおすすめ」: 最近見たお店があるエリアのうち、まだ選んでいないエリア(見た数が多い順、最大2つ)
function myListAlsoPrefs(settings) {
  const recent = typeof loadRecentShops === "function" ? loadRecentShops() : [];
  const score = new Map();
  recent.forEach((id, i) => {
    const e = entries.find((x) => x.shop.id === id);
    if (!e || settings.prefs.includes(e.shop.prefecture)) return;
    score.set(e.shop.prefecture, (score.get(e.shop.prefecture) || 0) + Math.pow(0.8, i));
  });
  return myListPrefs()
    .filter((p) => score.has(p.key) && myListShops(p.key, settings.types).length)
    .sort((a, b) => score.get(b.key) - score.get(a.key))
    .slice(0, 2);
}

function myListAreaCards(settings) {
  return myListPrefs()
    .filter((p) => settings.prefs.includes(p.key))
    .map((p) => myListAreaCard(p, settings.types, false))
    .join("");
}

// ホームの「マイリスト」の部分(js/home.js の renderHome が呼ぶ)
function renderTodoSection() {
  const x = todoText();
  const settings = loadMyList();
  if (!settings) {
    return (
      `<section class="home-section" id="home-todo">` +
      `<h2 class="home-h2">${esc(x.sectionTitle)}</h2>` +
      `<p class="home-reason home-reason-plain">${esc(x.sectionSub)}</p>` +
      `<a class="todo-new" href="${esc(myListEditUrl())}" data-mylist-edit>` +
      `<span class="todo-new-icon">${homeIcon("plus", 22)}</span>` +
      `<span class="todo-new-text"><span>${esc(x.start)}</span><span>${esc(x.startSub)}</span></span>` +
      `</a></section>`
    );
  }
  return (
    `<section class="home-section" id="home-todo">` +
    `<div class="mylist-head"><h2 class="home-h2">${esc(x.sectionTitle)}</h2>` +
    `<a class="mylist-gear" href="${esc(myListEditUrl())}" data-mylist-edit aria-label="${esc(x.settingsOpen)}" title="${esc(x.settingsOpen)}">${TODO_GEAR_ICON}</a></div>` +
    `<div class="mylist-areas">${myListAreaCards(settings)}</div>` +
    `</section>`
  );
}

// 画面の上の部分(← 戻る / タイトル / 右上の設定マーク)
function myListHeader(backUrl, backLabel, title, withGear) {
  const x = todoText();
  return (
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(backUrl)}" data-mylist-nav aria-label="${esc(backLabel)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(title)}</h2>` +
    (withGear ? `<a class="mylist-gear" href="${esc(myListEditUrl())}" data-mylist-edit aria-label="${esc(x.settingsOpen)}" title="${esc(x.settingsOpen)}">${TODO_GEAR_ICON}</a>` : "") +
    `</div>`
  );
}

let myListToast = ""; // 保存した直後に、1回だけ出す「保存しました」

// ---------------------------------------------------------------------
// マイリストの画面(URL「?view=todo」)。まだ設定していなければ、設定の画面を出す
// ---------------------------------------------------------------------
function renderMyList() {
  const x = todoText();
  const settings = loadMyList();
  if (!settings) {
    renderMyListSettings();
    return;
  }
  const also = myListAlsoPrefs(settings);
  const toast = myListToast;
  myListToast = "";
  homePage.innerHTML =
    myListHeader(homeUrl(), x.backToHome, x.sectionTitle, true) +
    (toast ? `<p class="mylist-toast" role="status">${homeIcon("check", 18)}<span>${esc(toast)}</span></p>` : "") +
    `<section class="home-section mylist-section">` +
    `<p class="mylist-summary">${esc(x.areaCount(settings.prefs.length))}</p>` +
    `<div class="mylist-areas">${myListAreaCards(settings)}</div>` +
    `</section>` +
    (also.length
      ? `<section class="home-section mylist-section"><h3 class="mylist-also-title">${esc(x.alsoTitle)}</h3>` +
        `<div class="mylist-areas">${also.map((p) => myListAreaCard(p, settings.types, true)).join("")}</div></section>`
      : "") +
    `<section class="home-section"><p class="home-history-note">${esc(x.storedNote)}</p></section>`;
}

// ---------------------------------------------------------------------
// エリアのお店の一覧(URL「?view=todo&area=東京都」)。おすすめ順に、カードで並べる
// ---------------------------------------------------------------------
let todoTypeFilter = "all";
function renderMyListArea(prefKey) {
  const x = todoText();
  const h = homeText();
  const pref = myListPrefs().find((p) => p.key === prefKey);
  const settings = loadMyList() || { prefs: [], types: myListTypeChoices() };
  if (!pref) {
    renderMyList();
    return;
  }
  const all = myListShops(pref.key, settings.types);
  loadTodoRatings(all.map((e) => e.shop.id));
  const types = settings.types.filter((t) => all.some((e) => shopType(e.shop) === t));
  if (todoTypeFilter !== "all" && !types.includes(todoTypeFilter)) todoTypeFilter = "all";
  const chip = (key, label) =>
    `<button type="button" class="todo-chip${todoTypeFilter === key ? " is-on" : ""}" aria-pressed="${todoTypeFilter === key}" data-todo-filter="${key}">${esc(label)}</button>`;
  const shown = sortByRecommendation(all).filter((e) => todoTypeFilter === "all" || shopType(e.shop) === todoTypeFilter);
  homePage.innerHTML =
    myListHeader(location.pathname + "?view=todo", x.backToList, x.sectionTitle, true) +
    `<div class="todo-band"><span class="todo-band-icon">${TODO_PIN_ICON}</span>` +
    `<span class="todo-band-title">${esc(pick(pref.label))}</span>` +
    `<span class="todo-band-count">${esc(x.count(all.length))}</span></div>` +
    `<section class="home-section todo-list-section">` +
    (types.length > 1 ? `<div class="todo-chips">${chip("all", x.all)}${types.map((t) => chip(t, h.typeLabel[t])).join("")}</div>` : "") +
    (shown.length
      ? `<p class="todo-rank-note">${esc(x.rankNote)}</p><ul class="todo-shops">${shown.map(todoShopCard).join("")}</ul>`
      : `<p class="home-reason home-reason-plain">${esc(x.empty)}</p>`) +
    `</section>`;
}

// ---------------------------------------------------------------------
// 設定の画面(URL「?view=todo&edit=1」): エリアと、探したいお店を選ぶ
// ---------------------------------------------------------------------
const myListDraft = { prefs: null, types: null, message: "", confirmReset: false };
function startMyListDraft() {
  const s = loadMyList();
  myListDraft.prefs = s ? [...s.prefs] : [];
  myListDraft.types = s ? [...s.types] : ["restaurant"];
  myListDraft.message = "";
  myListDraft.confirmReset = false;
}

function renderMyListSettings() {
  const x = todoText();
  const h = homeText();
  if (!myListDraft.prefs) startMyListDraft();
  const saved = loadMyList();
  const prefBtn = (p) => {
    const on = myListDraft.prefs.includes(p.key);
    return (
      `<button type="button" class="mylist-pick${on ? " is-on" : ""}" aria-pressed="${on}" data-mylist-pref="${esc(p.key)}">` +
      `<span>${esc(pick(p.label))}</span>${on ? homeIcon("check", 18) : ""}</button>`
    );
  };
  const typeBtn = (t) => {
    const on = myListDraft.types.includes(t);
    return (
      `<button type="button" class="todo-want todo-want-${t}${on ? " is-on" : ""}" aria-pressed="${on}" data-mylist-type="${t}">` +
      `${homeIcon(t, 26)}<span>${esc(h.typeLabel[t])}</span>` +
      `<span class="mylist-want-check">${on ? homeIcon("check", 16) : ""}</span></button>`
    );
  };
  homePage.innerHTML =
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(saved ? location.pathname + "?view=todo" : homeUrl())}" data-mylist-nav aria-label="${esc(x.close)}">${homeIcon("close", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(x.settings)}</h2>` +
    `<button type="button" class="mylist-save-round" data-mylist-save aria-label="${esc(x.save)}" title="${esc(x.save)}">${homeIcon("check", 22)}</button>` +
    `</div>` +
    `<section class="home-section todo-form-section">` +
    `<h3 class="todo-step-title"><span>1</span>${esc(x.step1)}</h3>` +
    `<div class="mylist-picks">${myListPrefs().map(prefBtn).join("")}</div>` +
    `<h3 class="todo-step-title"><span>2</span>${esc(x.step2)}</h3>` +
    `<div class="todo-wants">${myListTypeChoices().map(typeBtn).join("")}</div>` +
    `<p class="home-status" role="status"${myListDraft.message ? "" : " hidden"}>${esc(myListDraft.message)}</p>` +
    `<button type="button" class="todo-primary todo-make" data-mylist-save>${homeIcon("check", 20)}<span>${esc(x.save)}</span></button>` +
    `<p class="home-history-note">${esc(x.storedNote)}</p>` +
    (saved
      ? `<div class="todo-delete-row"><button type="button" class="todo-delete${myListDraft.confirmReset ? " is-confirm" : ""}" data-mylist-reset>${esc(myListDraft.confirmReset ? x.resetConfirm : x.reset)}</button></div>`
      : "") +
    `</section>`;
}

function myListSave() {
  const x = todoText();
  if (!myListDraft.prefs.length) myListDraft.message = x.needArea;
  else if (!myListDraft.types.length) myListDraft.message = x.needType;
  else {
    // 画面の並び順(data.js の prefectures・種類の順)にそろえて保存する
    const prefs = myListPrefs().map((p) => p.key).filter((k) => myListDraft.prefs.includes(k));
    const types = MYLIST_TYPES.filter((t) => myListDraft.types.includes(t));
    saveMyList(prefs, types);
    myListDraft.prefs = null;
    myListToast = x.saved;
    navigate(location.pathname + "?view=todo");
    return;
  }
  renderMyListSettings();
  const status = homePage.querySelector(".home-status");
  if (status) status.scrollIntoView({ block: "center", behavior: "smooth" });
}

// ---------------------------------------------------------------------
// 操作(ホームの中のクリックを、まとめて受け取る)
// ---------------------------------------------------------------------
homePage.addEventListener("click", (event) => {
  const t = event.target;
  const plain = !(event.metaKey || event.ctrlKey || event.shiftKey);
  const edit = t.closest("[data-mylist-edit]");
  if (edit) {
    if (!plain) return;
    event.preventDefault();
    startMyListDraft();
    navigate(myListEditUrl());
    return;
  }
  const area = t.closest("[data-mylist-area]");
  if (area) {
    if (!plain) return;
    event.preventDefault();
    todoTypeFilter = "all";
    navigate(myListAreaUrl(area.dataset.mylistArea));
    return;
  }
  const nav = t.closest("[data-mylist-nav]");
  if (nav) {
    if (!plain) return;
    event.preventDefault();
    myListDraft.prefs = null; // 保存しないで閉じたときは、選びかけの内容を捨てる
    navigate(nav.getAttribute("href"));
    return;
  }
  const filter = t.closest("[data-todo-filter]");
  if (filter) {
    todoTypeFilter = filter.dataset.todoFilter;
    renderHomeMode();
    return;
  }
  const pref = t.closest("[data-mylist-pref]");
  if (pref) {
    const k = pref.dataset.mylistPref;
    myListDraft.prefs = myListDraft.prefs.includes(k) ? myListDraft.prefs.filter((v) => v !== k) : [...myListDraft.prefs, k];
    myListDraft.message = "";
    renderMyListSettings();
    return;
  }
  const type = t.closest("[data-mylist-type]");
  if (type) {
    const k = type.dataset.mylistType;
    myListDraft.types = myListDraft.types.includes(k) ? myListDraft.types.filter((v) => v !== k) : [...myListDraft.types, k];
    myListDraft.message = "";
    renderMyListSettings();
    return;
  }
  if (t.closest("[data-mylist-save]")) {
    myListSave();
    return;
  }
  if (t.closest("[data-mylist-reset]")) {
    if (myListDraft.confirmReset) {
      resetMyList();
      myListDraft.prefs = null;
      navigate(homeUrl());
    } else {
      myListDraft.confirmReset = true; // もう1回押すと、本当にリセットする(押し間違いで消えないように)
      renderMyListSettings();
    }
  }
});
