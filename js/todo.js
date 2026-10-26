// トラベル・リスト(Travel List)
//   ・エリア(都道府県)ごとに1つずつ追加する。1つのエリアにつき「何を探す(料理店・カフェ・食材店)」を選ぶ
//       追加: URL「?view=todo&edit=1」(&pref=東京都 で、そのエリアを選んだ状態から始める)
//       変更・外す: エリアのお店の一覧の右上の設定マーク(URL「?view=todo&edit=1&pref=東京都」)
//   ・ホーム: 「トラベル・リスト」のカードを横に並べる(横にスライド)。「すべて見る」で一覧(URL「?view=todo」)
//     カードを押すと、そのエリアのお店の一覧(URL「?view=todo&area=東京都」)。お店のカードを押すと、お店のページ(?shop=ID)
//   ・お店の一覧は「おすすめ順」= みんなのレビューの評価(★)が高い順(同じなら、レビューが多い順 → データの順)
//   ・選んだ内容は、この端末(ブラウザの localStorage)の中だけに保存する。サーバーや第三者には送らない
//   ・レビューの評価は、店舗ページのレビューと同じもの(Firestore)を読むだけ。選んだ内容は送らない
//   ・「最近見たお店から」: 最近見たお店があるエリアのうち、まだ追加していないエリア(計算は端末の中だけ)

const MYLIST_KEY = "vf_mylist"; // { items: [{ pref: "東京都", types: ["restaurant", ...] }, ...], savedAt }
//   (前の版は { prefs: [...], types: [...] }。読み込むときに、エリアごとの形に直す)
const OLD_TODO_KEY = "vf_todo_lists"; // 前の版の「行きたいお店のリスト」。もう使わないので、見つけたら消す
const MYLIST_TYPES = ["restaurant", "cafe", "grocery"];

const TODO_TEXT = {
  ja: {
    sectionTitle: "トラベル・リスト",
    sectionSub: "行きたいエリアと探したいお店を選ぼう！",
    start: "トラベル・リストを作る",
    startSub: "行きたいエリアを追加するだけ",
    settings: "トラベル・リストの設定",
    settingsOpen: "トラベル・リストの設定を変える",
    close: "閉じる",
    count: (n) => `${n}件`,
    areaCount: (n) => `${n}つのエリア`,
    alsoTitle: "最近見たお店から",
    seeAll: "すべて見る",
    addArea: "エリアを追加",
    addTitle: "トラベル・リスト",
    addBtn: "トラベル・リストに追加",
    addThis: "追加する",
    editTitle: (name) => `${name}の設定`,
    stepArea: "どのエリアに関心がありますか?",
    added: "追加済み",
    addedToast: "トラベル・リストに追加しました",
    allAdded: "すべてのエリアを、トラベル・リストに追加しています",
    remove: "トラベル・リストから外す",
    removeConfirm: "本当に外す",
    removed: "トラベル・リストから外しました",
    backToList: "トラベル・リストに戻る",
    backToHome: "ホームに戻る",
    all: "すべて",
    rankNote: "おすすめ順(レビューの評価が高い順)",
    noReviews: "レビューはまだありません",
    reviews: (avg, n) => `${avg} (${n}件)`,
    detail: "お店のページを見る",
    empty: "このエリアには、選んだ種類のお店がまだありません",
    step2: "何を探しますか?",
    needArea: "エリアを選んでください",
    needType: "探したいお店を1つ以上選んでください",
    save: "この内容で保存",
    saved: "保存しました",
  },
  en: {
    sectionTitle: "Travel List",
    sectionSub: "Pick the areas you want to go and the shops you're looking for",
    start: "Make a Travel List",
    startSub: "Just add the areas you want to go",
    settings: "Travel List settings",
    settingsOpen: "Change Travel List settings",
    close: "Close",
    count: (n) => `${n} shops`,
    areaCount: (n) => (n === 1 ? "1 area" : `${n} areas`),
    alsoTitle: "Based on shops you viewed",
    seeAll: "See all",
    addArea: "Add an area",
    addTitle: "Travel List",
    addBtn: "Add to Travel List",
    addThis: "Add",
    editTitle: (name) => `${name} settings`,
    stepArea: "Which area are you interested in?",
    added: "Added",
    addedToast: "Added to Travel List",
    allAdded: "All areas are already in Travel List",
    remove: "Remove from Travel List",
    removeConfirm: "Really remove",
    removed: "Removed from Travel List",
    backToList: "Back to Travel List",
    backToHome: "Back to home",
    all: "All",
    rankNote: "Recommended order (highest rated first)",
    noReviews: "No reviews yet",
    reviews: (avg, n) => `${avg} (${n})`,
    detail: "See shop page",
    empty: "There are no shops of the chosen kinds in this area yet",
    step2: "What are you looking for?",
    needArea: "Please choose an area",
    needType: "Please choose at least one kind of shop",
    save: "Save",
    saved: "Saved",
  },
  vi: {
    sectionTitle: "Danh sách du lịch",
    sectionSub: "Chọn khu vực muốn đến và loại quán bạn đang tìm",
    start: "Tạo danh sách du lịch",
    startSub: "Chỉ cần thêm khu vực bạn muốn đến",
    settings: "Cài đặt danh sách",
    settingsOpen: "Thay đổi cài đặt danh sách",
    close: "Đóng",
    count: (n) => `${n} quán`,
    areaCount: (n) => `${n} khu vực`,
    alsoTitle: "Dựa trên quán bạn đã xem",
    seeAll: "Xem tất cả",
    addArea: "Thêm khu vực",
    addTitle: "Danh sách du lịch",
    addBtn: "Thêm vào danh sách",
    addThis: "Thêm",
    editTitle: (name) => `Cài đặt ${name}`,
    stepArea: "Bạn quan tâm đến khu vực nào?",
    added: "Đã thêm",
    addedToast: "Đã thêm vào danh sách",
    allAdded: "Đã thêm tất cả khu vực vào danh sách",
    remove: "Xóa khỏi danh sách",
    removeConfirm: "Xóa thật",
    removed: "Đã xóa khỏi danh sách",
    backToList: "Về danh sách du lịch",
    backToHome: "Về trang chủ",
    all: "Tất cả",
    rankNote: "Thứ tự gợi ý (đánh giá cao trước)",
    noReviews: "Chưa có đánh giá",
    reviews: (avg, n) => `${avg} (${n})`,
    detail: "Xem trang quán",
    empty: "Khu vực này chưa có quán thuộc loại đã chọn",
    step2: "Bạn đang tìm gì?",
    needArea: "Hãy chọn một khu vực",
    needType: "Hãy chọn ít nhất một loại quán",
    save: "Lưu",
    saved: "Đã lưu",
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
// エリアごとの一覧 [{ pref, types }](地図にある都道府県の順)。まだ無ければ []
function loadMyListItems() {
  try {
    if (localStorage.getItem(OLD_TODO_KEY) !== null) localStorage.removeItem(OLD_TODO_KEY); // 前の版のリストは消す
    const v = JSON.parse(localStorage.getItem(MYLIST_KEY) || "null");
    if (!v) return [];
    const prefKeys = prefectures.map((p) => p.key);
    const cleanTypes = (types) => MYLIST_TYPES.filter((t) => Array.isArray(types) && types.includes(t));
    let items = [];
    if (Array.isArray(v.items)) items = v.items.map((it) => ({ pref: it && it.pref, types: cleanTypes(it && it.types) }));
    else if (Array.isArray(v.prefs)) items = v.prefs.map((pref) => ({ pref, types: cleanTypes(v.types) })); // 前の版の形
    const seen = new Set();
    return items
      .filter((it) => prefKeys.includes(it.pref) && it.types.length && !seen.has(it.pref) && seen.add(it.pref))
      .sort((x, y) => prefKeys.indexOf(x.pref) - prefKeys.indexOf(y.pref));
  } catch (e) {
    return [];
  }
}
function saveMyListItems(items) {
  try {
    localStorage.setItem(MYLIST_KEY, JSON.stringify({ items, savedAt: new Date().toISOString() }));
    return true;
  } catch (e) {
    return false;
  }
}
// まとめた形(ホームの「あなたへのおすすめ」でも使う): { items, prefs: [エリア], types: [どれかのエリアで選んだ種類] }。空なら null
function loadMyList() {
  const items = loadMyListItems();
  if (!items.length) return null;
  const types = MYLIST_TYPES.filter((t) => items.some((it) => it.types.includes(t)));
  return { items, prefs: items.map((it) => it.pref), types };
}
function myListItem(prefKey) {
  return loadMyListItems().find((it) => it.pref === prefKey) || null;
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
      if (document.body.classList.contains("view-home") && homeMode === "home" && typeof updateHomeRatings === "function") {
        updateHomeRatings();
        return;
      }
      if (document.body.classList.contains("view-home") && (homeMode === "todo-area" || homeMode === "feature")) {
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

// 都道府県の写真(ホームの「エリアから探す」の写真から、その都道府県の代表のエリアを使う。js/home.js の HOME_AREAS)
const MYLIST_PREF_PHOTO_STATION = { 東京都: "新宿", 神奈川県: "横浜", 千葉県: "千葉", 埼玉県: "大宮" };
function myListPrefImage(prefKey) {
  const station = MYLIST_PREF_PHOTO_STATION[prefKey];
  const area = typeof HOME_AREAS !== "undefined" ? HOME_AREAS.find((a) => a.station === station) : null;
  return area && area.image ? area.image : "";
}

function myListAreaUrl(prefKey) {
  return location.pathname + "?view=todo&area=" + encodeURIComponent(prefKey);
}
function myListEditUrl(prefKey) {
  return location.pathname + "?view=todo&edit=1" + (prefKey ? "&pref=" + encodeURIComponent(prefKey) : "");
}
function myListUrl() {
  return location.pathname + "?view=todo";
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
    `</span></a>` +
    cardSaveButtonHtml(shop) +
    `</li>`
  );
}

// エリアのカード: エリア名と、種類ごとの件数(色の点つき)、合計の件数
function myListAreaCard(pref, types) {
  const x = todoText();
  const h = homeText();
  const shops = myListShops(pref.key, types);
  const parts = types
    .map((t) => ({ t, n: shops.filter((e) => shopType(e.shop) === t).length }))
    .filter((p) => p.n > 0)
    .map((p) => `<span class="mylist-kind">${typeIllustHtml(p.t, 22)}${esc(h.typeLabel[p.t])} ${p.n}</span>`)
    .join("");
  return (
    `<a class="mylist-area${myListPrefImage(pref.key) ? " has-photo-card" : ""}" href="${esc(myListAreaUrl(pref.key))}" data-mylist-area="${esc(pref.key)}">` +
    (myListPrefImage(pref.key)
      ? `<span class="mylist-area-icon has-photo"><img src="${esc(myListPrefImage(pref.key))}" alt="" loading="lazy" width="480" height="336"></span>`
      : `<span class="mylist-area-icon">${TODO_PIN_ICON}</span>`) +
    `<span class="mylist-area-body">` +
    `<span class="mylist-area-name">${esc(pick(pref.label))}</span>` +
    `<span class="mylist-kinds">${parts}</span></span>` +
    `<span class="mylist-area-count">${esc(x.count(shops.length))}${homeIcon("forward", 18)}</span>` +
    `</a>`
  );
}

function myListCanAdd(settings) {
  const have = settings ? settings.prefs : [];
  return myListPrefs().some((p) => !have.includes(p.key));
}

// 「こちらもおすすめ」: 最近見たお店があるエリアのうち、まだ選んでいないエリア(見た数が多い順、最大2つ)
function myListAlsoPrefs(settings) {
  settings = settings || { prefs: [], types: [] };
  const recent = typeof loadRecentShops === "function" ? loadRecentShops() : [];
  const score = new Map();
  recent.forEach((id, i) => {
    const e = entries.find((x) => x.shop.id === id);
    if (!e || settings.prefs.includes(e.shop.prefecture)) return;
    score.set(e.shop.prefecture, (score.get(e.shop.prefecture) || 0) + Math.pow(0.8, i));
  });
  return myListPrefs()
    .filter((p) => score.has(p.key) && myListShops(p.key, myListTypeChoices()).length)
    .sort((a, b) => score.get(b.key) - score.get(a.key))
    .slice(0, 2);
}

function myListAreaCards(settings) {
  return settings.items
    .map((it) => {
      const p = myListPrefs().find((q) => q.key === it.pref);
      return p ? myListAreaCard(p, it.types) : "";
    })
    .join("");
}

// ホームの「トラベル・リスト」の部分(js/home.js の renderHome が呼ぶ)
//   追加したエリアのカードを横に並べる(横にスライド)。最近見たお店のエリアも、うしろに続ける
function renderTodoSection() {
  const x = todoText();
  const h = homeText();
  const settings = loadMyList();
  if (!settings) {
    return (
      `<section class="home-section" id="home-todo">` +
      `<h2 class="home-h2">${esc(x.sectionTitle)}</h2>` +
      `<p class="home-reason home-reason-plain">${esc(x.sectionSub)}</p>` +
      `<a class="todo-new" href="${esc(myListEditUrl())}" data-mylist-edit>` +
      // アイコンは、運営者が用意したイラスト(images/mylist-create.png)
      `<span class="todo-new-icon has-illust"><img src="images/mylist-create.png" alt="" width="210" height="180" decoding="async"></span>` +
      `<span class="todo-new-text"><span>${esc(x.start)}</span><span>${esc(x.startSub)}</span></span>` +
      `</a></section>`
    );
  }
  const also = myListAlsoPrefs(settings);
  const cards = [
    ...settings.items.map((it) => {
      const p = myListPrefs().find((q) => q.key === it.pref);
      return p ? myListAreaCard(p, it.types) : "";
    }),
    // 最近見たお店のエリア(まだ追加していない)も、同じカードで続ける。押すと、そのエリアのお店の一覧
    ...also.map((p) => myListAreaCard(p, myListTypeChoices())),
  ].filter(Boolean);
  return (
    `<section class="home-section" id="home-todo">` +
    `<div class="home-area-head"><h2 class="home-h2">${esc(x.sectionTitle)}</h2>` +
    `<span class="mylist-head-actions">` +
    `<a class="mylist-see-all" href="${esc(myListUrl())}" data-mylist-nav>${esc(x.seeAll)}</a>` +
    `<span class="home-area-arrows">` +
    `<button type="button" class="home-area-arrow mylist-arrow" data-scroll-list=".mylist-carousel" data-scroll-dir="-1" aria-label="${esc(h.areaPrev)}">${homeIcon("back", 20)}</button>` +
    `<button type="button" class="home-area-arrow mylist-arrow" data-scroll-list=".mylist-carousel" data-scroll-dir="1" aria-label="${esc(h.areaNext)}">${homeIcon("forward", 20)}</button>` +
    `</span></span></div>` +
    `<ul class="mylist-carousel">${cards.map((c) => `<li>${c}</li>`).join("")}</ul>` +
    `</section>`
  );
}

// 画面の上の部分(← 戻る / タイトル / 右上の設定マーク)
//   right: { kind: "gear", pref } … そのエリアの設定 / { kind: "add" } … エリアを追加
function myListHeader(backUrl, backLabel, title, right) {
  const x = todoText();
  let btn = "";
  if (right && right.kind === "gear")
    btn = `<a class="mylist-gear" href="${esc(myListEditUrl(right.pref))}" data-mylist-edit data-pref="${esc(right.pref)}" aria-label="${esc(x.settingsOpen)}" title="${esc(x.settingsOpen)}">${TODO_GEAR_ICON}</a>`;
  else if (right && right.kind === "add")
    btn = `<a class="mylist-add-btn" href="${esc(myListEditUrl(right.pref))}" data-mylist-edit${right.pref ? ` data-pref="${esc(right.pref)}"` : ""}>${homeIcon("plus", 20)}<span>${esc(right.pref ? x.addBtn : x.addArea)}</span></a>`;
  return (
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(backUrl)}" data-mylist-nav aria-label="${esc(backLabel)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(title)}</h2>` +
    btn +
    `</div>`
  );
}

let myListToast = ""; // 保存した直後に出す「保存しました」など(描き直しても消えないように、3秒間は出す)
let myListToastUntil = 0;
function takeMyListToast() {
  if (myListToast && Date.now() > myListToastUntil) myListToast = "";
  return myListToast;
}
function setMyListToast(text) {
  myListToast = text;
  myListToastUntil = Date.now() + 3000;
}

// ---------------------------------------------------------------------
// トラベル・リストの画面(URL「?view=todo」)。まだ設定していなければ、設定の画面を出す
// ---------------------------------------------------------------------
function renderMyList() {
  const x = todoText();
  const settings = loadMyList();
  if (!settings) {
    renderMyListSettings();
    return;
  }
  const also = myListAlsoPrefs(settings);
  const toast = takeMyListToast();
  homePage.innerHTML =
    myListHeader(homeUrl(), x.backToHome, x.sectionTitle, myListCanAdd(settings) ? { kind: "add" } : null) +
    (toast ? `<p class="mylist-toast" role="status">${homeIcon("check", 18)}<span>${esc(toast)}</span></p>` : "") +
    `<section class="home-section mylist-section">` +
    `<p class="mylist-summary">${esc(x.areaCount(settings.prefs.length))}</p>` +
    // 追加したエリアのうしろに、最近見たお店のエリアを同じ並びで続ける(押すと、そのエリアのお店の一覧。そこから追加できる)
    `<div class="mylist-areas">${myListAreaCards(settings)}${also.map((p) => myListAreaCard(p, myListTypeChoices())).join("")}</div>` +
    `</section>`;
}

// ---------------------------------------------------------------------
// エリアのお店の一覧(URL「?view=todo&area=東京都」)。おすすめ順に、カードで並べる
// ---------------------------------------------------------------------
let todoTypeFilter = "all";
function renderMyListArea(prefKey) {
  const x = todoText();
  const h = homeText();
  const pref = myListPrefs().find((p) => p.key === prefKey);
  const item = myListItem(prefKey);
  const settings = { types: item ? item.types : myListTypeChoices() };
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
  const toast = takeMyListToast();
  homePage.innerHTML =
    myListHeader(myListUrl(), x.backToList, x.sectionTitle, item ? { kind: "gear", pref: pref.key } : { kind: "add", pref: pref.key }) +
    (toast ? `<p class="mylist-toast" role="status">${homeIcon("check", 18)}<span>${esc(toast)}</span></p>` : "") +
    // 上の帯: その都道府県の写真を、うしろに敷く(写真が無いときは、緑の帯)
    (myListPrefImage(pref.key)
      ? `<div class="todo-band has-photo"><img class="todo-band-photo" src="${esc(myListPrefImage(pref.key))}" alt="" width="480" height="336">` +
        `<span class="todo-band-icon">${TODO_PIN_ICON}</span>`
      : `<div class="todo-band"><span class="todo-band-icon">${TODO_PIN_ICON}</span>`) +
    `<span class="todo-band-title">${esc(pick(pref.label))}</span>` +
    `<span class="todo-band-count">${esc(x.count(all.length))}</span></div>` +
    `<section class="home-section todo-list-section">` +
    (types.length > 1 ? `<div class="todo-chips">${chip("all", x.all)}${types.map((t) => chip(t, h.typeLabel[t])).join("")}</div>` : "") +
    (shown.length
      ? `<ul class="todo-shops">${shown.map(todoShopCard).join("")}</ul>`
      : `<p class="home-reason home-reason-plain">${esc(x.empty)}</p>`) +
    `</section>`;
}

// ---------------------------------------------------------------------
// 追加・変更の画面(URL「?view=todo&edit=1」/「&pref=東京都」)
//   ・まだ追加していないエリア → 「トラベル・リストに追加」(エリアを1つ選ぶ + 探したいお店)
//   ・追加済みのエリア → 「〇〇の設定」(探したいお店を変える / トラベル・リストから外す)
// ---------------------------------------------------------------------
const myListDraft = { key: null, pref: null, types: null, message: "", confirmRemove: false };
function myListEditPref() {
  return new URLSearchParams(location.search).get("pref") || "";
}
function startMyListDraft(prefKey) {
  const item = prefKey ? myListItem(prefKey) : null;
  myListDraft.key = prefKey || "";
  myListDraft.pref = prefKey || null;
  myListDraft.types = item ? [...item.types] : ["restaurant"];
  myListDraft.message = "";
  myListDraft.confirmRemove = false;
}

// トラベル・リストの設定画面の、背景のうすい葉っぱの飾り(自分で描いた形)
const MYLIST_LEAF_SVG =
  '<svg viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
  '<path d="M18 104C40 76 66 52 108 18"/>' +
  [0, 1, 2, 3, 4].map((i) => {
    const x = 34 + i * 16, y = 86 - i * 14;
    return `<path d="M${x} ${y}c-2-14 4-26 14-34M${x} ${y}c12-2 24 2 32 10" />`;
  }).join("") +
  "</svg>";
function renderMyListSettings() {
  const x = todoText();
  const h = homeText();
  const urlPref = myListEditPref();
  if (myListDraft.key !== urlPref || !myListDraft.types) startMyListDraft(urlPref);
  const items = loadMyListItems();
  const have = items.map((it) => it.pref);
  const editing = !!(urlPref && have.includes(urlPref)); // 追加済みのエリアの設定
  const editPref = editing ? myListPrefs().find((p) => p.key === urlPref) : null;
  const choices = myListPrefs();
  const allAdded = !editing && choices.every((p) => have.includes(p.key));
  const prefBtn = (p) => {
    const done = have.includes(p.key);
    const on = !done && myListDraft.pref === p.key;
    return (
      `<button type="button" class="mylist-pick${on ? " is-on" : ""}${done ? " is-done" : ""}" aria-pressed="${on}" data-mylist-pref="${esc(p.key)}"${done ? " disabled" : ""}>` +
      (done ? `<span class="mylist-pick-done-icon" aria-hidden="true">${homeIcon("check", 22)}</span>` : "") +
      `<span class="mylist-pick-text"><span>${esc(pick(p.label))}</span>${done ? `<small>${esc(x.added)}</small>` : ""}</span>${on ? homeIcon("check", 18) : ""}</button>`
    );
  };
  const typeBtn = (t) => {
    const on = myListDraft.types.includes(t);
    return (
      `<button type="button" class="todo-want todo-want-${t}${on ? " is-on" : ""}" aria-pressed="${on}" data-mylist-type="${t}">` +
      `${typeIllustHtml(t, 48)}<span>${esc(h.typeLabel[t])}</span>` +
      (on ? `<span class="mylist-want-check is-on" aria-hidden="true">${homeIcon("check", 14)}</span>` : "") + `</button>`
    );
  };
  const closeUrl = editing ? myListAreaUrl(urlPref) : items.length ? myListUrl() : homeUrl();
  const title = editing ? x.editTitle(pick(editPref.label)) : x.addTitle;
  homePage.innerHTML =
    `<div class="todo-create-head mylist-page-head mylist-settings-head">` +
    // 見出しは左。右に「×(保存しないで閉じる)」と「✓(この内容で保存)」の丸いボタン
    `<h2 class="todo-create-title">${esc(title)}</h2>` +
    `<div class="mylist-head-btns">` +
    `<a class="mylist-head-close" href="${esc(closeUrl)}" data-mylist-nav aria-label="${esc(x.close)}" title="${esc(x.close)}">${homeIcon("close", 22)}</a>` +
    (allAdded ? "" : `<button type="button" class="mylist-head-save" data-mylist-save aria-label="${esc(x.save)}" title="${esc(x.save)}">${homeIcon("check", 24)}</button>`) +
    `</div></div>` +
    // 背景の飾り(自分で描いた、うすい葉っぱの絵)
    `<span class="mylist-leaf mylist-leaf-a" aria-hidden="true">${MYLIST_LEAF_SVG}</span>` +
    `<span class="mylist-leaf mylist-leaf-b" aria-hidden="true">${MYLIST_LEAF_SVG}</span>` +
    `<section class="home-section todo-form-section mylist-form-card">` +
    (allAdded
      ? `<p class="home-reason home-reason-plain">${esc(x.allAdded)}</p>`
      : (editing ? "" : `<h3 class="todo-step-title"><span>1</span>${esc(x.stepArea)}</h3><div class="mylist-picks">${choices.map(prefBtn).join("")}</div>`) +
        `<h3 class="todo-step-title"><span>${editing ? 1 : 2}</span>${esc(x.step2)}</h3>` +
        `<div class="todo-wants">${myListTypeChoices().map(typeBtn).join("")}</div>` +
        `<p class="home-status" role="status"${myListDraft.message ? "" : " hidden"}>${esc(myListDraft.message)}</p>` +
        (editing
          ? `<div class="todo-delete-row"><button type="button" class="todo-delete${myListDraft.confirmRemove ? " is-confirm" : ""}" data-mylist-remove>${esc(myListDraft.confirmRemove ? x.removeConfirm : x.remove)}</button></div>`
          : "")) +
    `</section>`;
}

function myListSave() {
  const x = todoText();
  const urlPref = myListEditPref();
  const items = loadMyListItems();
  const editing = !!(urlPref && items.some((it) => it.pref === urlPref));
  const pref = editing ? urlPref : myListDraft.pref;
  if (!pref) myListDraft.message = x.needArea;
  else if (!myListDraft.types.length) myListDraft.message = x.needType;
  else {
    const types = MYLIST_TYPES.filter((t) => myListDraft.types.includes(t));
    const next = items.filter((it) => it.pref !== pref);
    next.push({ pref, types });
    saveMyListItems(next);
    myListDraft.types = null;
    setMyListToast(editing ? x.saved : x.addedToast);
    navigate(editing ? myListAreaUrl(pref) : myListUrl());
    return;
  }
  renderMyListSettings();
  const status = homePage.querySelector(".home-status");
  if (status) status.scrollIntoView({ block: "center", behavior: "smooth" });
}

function myListRemove() {
  const x = todoText();
  if (!myListDraft.confirmRemove) {
    myListDraft.confirmRemove = true; // もう1回押すと、本当に外す(押し間違いで消えないように)
    renderMyListSettings();
    return;
  }
  const pref = myListEditPref();
  saveMyListItems(loadMyListItems().filter((it) => it.pref !== pref));
  myListDraft.types = null;
  setMyListToast(x.removed);
  navigate(loadMyListItems().length ? myListUrl() : homeUrl());
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
    startMyListDraft(edit.dataset.pref || "");
    navigate(myListEditUrl(edit.dataset.pref || ""));
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
    myListDraft.types = null; // 保存しないで閉じたときは、選びかけの内容を捨てる
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
    myListDraft.pref = pref.dataset.mylistPref; // エリアは1つだけ選ぶ
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
  if (t.closest("[data-mylist-remove]")) {
    myListRemove();
    return;
  }
});
