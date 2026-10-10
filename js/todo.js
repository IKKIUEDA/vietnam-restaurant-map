// マイリスト(My List。行きたいお店のリスト)
//   ・リストに入るのは、このサイトに登録しているお店だけ(名所・大学など、お店以外の場所は入れない)
//   ・ホームの「マイリスト」: 作ったリストを、カードで出す。押すと、そのリストの一覧(URL「?view=todo&list=ID」)
//   ・リストの一覧: お店を「おすすめ順」に並べる。おすすめ順 = みんなのレビューの評価(★)が高い順
//     (評価が同じ・レビューがまだ無いお店は、リストを作ったときの順)。
//     カードを押すと、そのお店のページ(URL「?shop=ID」)が開く。「行った」のチェックは持たない
//   ・「新しいマイリストを作る」(URL「?view=todo」): 行き先と、やりたいこと(食事・カフェ・食材の買い物)を選ぶと、
//     その近くのお店から、リストを自動で作る
//   ・作ったリストは、この端末(ブラウザの localStorage)の中だけに保存する。サーバーや第三者には送らない
//   ・レビューの評価は、店舗ページのレビューと同じもの(Firestore)を読むだけ。リストの中身は送らない

const TODO_KEY = "vf_todo_lists"; // [{ id, title, createdAt, items: [{ kind: "shop", id }] }]
const TODO_MAX_LISTS = 20;
const TODO_MAX_ITEMS = 5;

const TODO_TEXT = {
  ja: {
    sectionTitle: "マイリスト",
    sectionSub: "気になるお店をまとめて、あとで見返せます",
    newList: "新しいマイリストを作る",
    newListSub: "行き先とやりたいことを選ぶだけ",
    count: (n) => `${n}件`,
    remove: "このリストを削除",
    removeConfirm: "本当に削除する",
    storedNote: "マイリストは、この端末の中だけに保存しています",
    backToHome: "ホームに戻る",
    all: "すべて",
    rankNote: "おすすめ順(レビューの評価が高い順)",
    noReviews: "レビューはまだありません",
    reviews: (avg, n) => `${avg} (${n}件)`,
    detail: "お店のページを見る",
    notFound: "このリストは見つかりませんでした(削除されたか、別の端末で作ったリストです)",
    createTitle: "マイリストを作る",
    back: "ホームに戻る",
    step1: "どこへ行く?",
    stationLabel: "駅名で探す",
    stationPlaceholder: "駅名を入れる(例: 蒲田)",
    stationButton: "決める",
    stationNotFound: "その駅が見つかりませんでした",
    step2: "何をしたい?(いくつでも)",
    wantMeal: "食事",
    wantCafe: "カフェ",
    wantGrocery: "食材の買い物",
    make: "おすすめのリストを作る",
    needDest: "行き先を選んでください",
    needWant: "やりたいことを1つ以上選んでください",
    noShops: "この近くに、条件に合うお店が見つかりませんでした。行き先か、やりたいことを変えてみてください",
    previewLabel: "できあがったリスト(おすすめ順)",
    titleFor: (d) => `${d}のまわり`,
    removeItem: "リストから外す",
    save: "マイリストに保存",
    redo: "作り直す",
  },
  en: {
    sectionTitle: "My List",
    sectionSub: "Keep the shops you like in one place",
    newList: "Make a new My List",
    newListSub: "Just pick a place and what you want to do",
    count: (n) => `${n} shops`,
    remove: "Delete this list",
    removeConfirm: "Really delete",
    storedNote: "My Lists are saved only on this device",
    backToHome: "Back to home",
    all: "All",
    rankNote: "Recommended order (highest rated first)",
    noReviews: "No reviews yet",
    reviews: (avg, n) => `${avg} (${n})`,
    detail: "See shop page",
    notFound: "This list couldn't be found (it was deleted, or made on another device)",
    createTitle: "Make a My List",
    back: "Back to home",
    step1: "Where are you going?",
    stationLabel: "Search by station",
    stationPlaceholder: "Station name (e.g. Kamata)",
    stationButton: "Set",
    stationNotFound: "That station couldn't be found",
    step2: "What do you want to do? (any)",
    wantMeal: "Eat",
    wantCafe: "Cafe",
    wantGrocery: "Grocery shopping",
    make: "Make a list for me",
    needDest: "Please choose a place",
    needWant: "Please choose at least one thing to do",
    noShops: "No matching shops were found near here. Try another place or other things to do",
    previewLabel: "Your list (recommended order)",
    titleFor: (d) => `Around ${d}`,
    removeItem: "Remove from list",
    save: "Save to My List",
    redo: "Start over",
  },
  vi: {
    sectionTitle: "Danh sách của tôi",
    sectionSub: "Lưu những quán bạn thích để xem lại sau",
    newList: "Tạo danh sách mới",
    newListSub: "Chỉ cần chọn nơi đến và việc muốn làm",
    count: (n) => `${n} quán`,
    remove: "Xóa danh sách này",
    removeConfirm: "Xóa thật",
    storedNote: "Danh sách của tôi chỉ được lưu trên thiết bị này",
    backToHome: "Về trang chủ",
    all: "Tất cả",
    rankNote: "Thứ tự gợi ý (đánh giá cao trước)",
    noReviews: "Chưa có đánh giá",
    reviews: (avg, n) => `${avg} (${n})`,
    detail: "Xem trang quán",
    notFound: "Không tìm thấy danh sách này (đã bị xóa hoặc được tạo trên thiết bị khác)",
    createTitle: "Tạo danh sách của tôi",
    back: "Về trang chủ",
    step1: "Bạn đi đâu?",
    stationLabel: "Tìm theo ga",
    stationPlaceholder: "Tên ga (VD: Kamata)",
    stationButton: "Chọn",
    stationNotFound: "Không tìm thấy ga đó",
    step2: "Bạn muốn làm gì? (chọn nhiều)",
    wantMeal: "Ăn uống",
    wantCafe: "Cà phê",
    wantGrocery: "Mua thực phẩm",
    make: "Tạo danh sách gợi ý",
    needDest: "Hãy chọn nơi đến",
    needWant: "Hãy chọn ít nhất một việc muốn làm",
    noShops: "Không tìm thấy quán phù hợp gần đây. Hãy thử nơi đến hoặc việc khác",
    previewLabel: "Danh sách đã tạo (thứ tự gợi ý)",
    titleFor: (d) => `Quanh ${d}`,
    removeItem: "Bỏ khỏi danh sách",
    save: "Lưu vào danh sách của tôi",
    redo: "Làm lại",
  },
};
function todoText() {
  return TODO_TEXT[currentLang] || TODO_TEXT.ja;
}

// 行き先の候補(よく使われる駅。位置は駅のおおよその位置)
const TODO_PLACES = [
  { key: "shinjuku", name: { ja: "新宿・新大久保", en: "Shinjuku / Shin-Okubo", vi: "Shinjuku / Shin-Okubo" }, lat: 35.6958, lng: 139.7003 },
  { key: "ueno", name: { ja: "上野・日暮里", en: "Ueno / Nippori", vi: "Ueno / Nippori" }, lat: 35.7211, lng: 139.7742 },
  { key: "ikebukuro", name: { ja: "池袋", en: "Ikebukuro", vi: "Ikebukuro" }, lat: 35.7295, lng: 139.7109 },
  { key: "yokohama", name: { ja: "横浜・関内", en: "Yokohama / Kannai", vi: "Yokohama / Kannai" }, lat: 35.4437, lng: 139.638 },
  { key: "kawasaki", name: { ja: "川崎", en: "Kawasaki", vi: "Kawasaki" }, lat: 35.5313, lng: 139.697 },
  { key: "chiba", name: { ja: "千葉駅", en: "Chiba Station", vi: "Ga Chiba" }, lat: 35.6131, lng: 140.1134 },
  { key: "funabashi", name: { ja: "船橋", en: "Funabashi", vi: "Funabashi" }, lat: 35.7018, lng: 139.9853 },
  { key: "omiya", name: { ja: "大宮", en: "Omiya", vi: "Omiya" }, lat: 35.9064, lng: 139.6237 },
];

// ---------------------------------------------------------------------
// 保存(この端末の中だけ)。お店以外の項目(前の版で入っていた名所など)は、読み込むときに外す
// ---------------------------------------------------------------------
function loadTodoLists() {
  try {
    const raw = localStorage.getItem(TODO_KEY) || "[]";
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    const lists = v
      .filter((l) => l && typeof l.id === "string" && Array.isArray(l.items))
      .map((l) => ({
        ...l,
        // 以前の版の「行った」チェック(done)は、もう使わないので読み込まない
        items: l.items.filter((it) => it && it.kind === "shop" && typeof it.id === "string").map((it) => ({ kind: "shop", id: it.id })),
      }));
    // 以前の版で保存した「行った」チェックが端末に残っていたら、1回だけ書き直して消す
    if (raw.includes('"done"')) localStorage.setItem(TODO_KEY, JSON.stringify(lists));
    return lists;
  } catch (e) {
    return [];
  }
}
function saveTodoLists(lists) {
  try {
    localStorage.setItem(TODO_KEY, JSON.stringify(lists.slice(0, TODO_MAX_LISTS)));
    return true;
  } catch (e) {
    return false;
  }
}
function todoEntry(it) {
  return entries.find((x) => x.shop.id === it.id) || null;
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
      if (document.body.classList.contains("view-home") && typeof renderHomeMode === "function") {
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
function sortByRecommendation(items) {
  return items
    .map((it, i) => ({ it, i, r: todoRating(it.id) }))
    .sort((a, b) => {
      const av = a.r && a.r.count ? a.r.avg : -1;
      const bv = b.r && b.r.count ? b.r.avg : -1;
      if (bv !== av) return bv - av;
      const ac = a.r ? a.r.count : 0;
      const bc = b.r ? b.r.count : 0;
      if (bc !== ac) return bc - ac;
      return a.i - b.i;
    });
}

// ---------------------------------------------------------------------
// リストを作る: 行き先の近くの、登録しているお店だけから選ぶ
// ---------------------------------------------------------------------
function buildTodoItems(dest, wants) {
  const types = [];
  if (wants.meal) types.push("restaurant");
  if (wants.cafe) types.push("cafe");
  if (wants.grocery) types.push("grocery");
  const withKm = entries
    .filter((e) => types.includes(shopType(e.shop)))
    .map((e) => ({ e, km: distanceKm(dest.lat, dest.lng, e.shop.lat, e.shop.lng) }))
    .sort((a, b) => a.km - b.km);
  // 近い順に探す範囲を広げる(2km → 4km → 8km)。それでも無ければ、作らない
  let pool = [];
  for (const r of [2, 4, 8]) {
    pool = withKm.filter((x) => x.km <= r);
    if (pool.length >= Math.min(3, withKm.length)) break;
  }
  if (!pool.length) return [];
  // まず、選んだ種類ごとに、いちばん近いお店を1つずつ(種類がかたよらないように)。残りは近い順
  const picked = [];
  types.forEach((t) => {
    const x = pool.find((p) => shopType(p.e.shop) === t && !picked.includes(p));
    if (x) picked.push(x);
  });
  pool.forEach((p) => {
    if (picked.length < TODO_MAX_ITEMS && !picked.includes(p)) picked.push(p);
  });
  return picked.slice(0, TODO_MAX_ITEMS).map((p) => ({ kind: "shop", id: p.e.shop.id }));
}

// ---------------------------------------------------------------------
// 画面の部品
// ---------------------------------------------------------------------
const TODO_TYPE_COLORS = { restaurant: "#e53935", grocery: "#1e63d6", cafe: "#795548" };

function todoStars(id) {
  const x = todoText();
  const r = todoRating(id);
  if (!r || !r.count) return `<span class="todo-stars is-none">${esc(x.noReviews)}</span>`;
  return `<span class="todo-stars"><span class="todo-star" aria-hidden="true">★</span>${esc(x.reviews(r.avg.toFixed(1), r.count))}</span>`;
}

// お店のカード(リストの一覧・作る画面のプレビューで使う)
//   カード全体が、お店のページへのリンク / opts.removeIndex: 「外す」ボタンの番号(作る画面だけ)
function todoShopCard(entry, item, opts) {
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
    (opts.removeIndex === undefined ? `<span class="todo-shop-more">${esc(x.detail)} ›</span>` : "") +
    `</span></a>` +
    (opts.removeIndex !== undefined
      ? `<button type="button" class="todo-step-remove" data-todo-remove="${opts.removeIndex}" aria-label="${esc(x.removeItem)}">${homeIcon("close", 18)}</button>`
      : "") +
    `</li>`
  );
}

// ホームの「マイリスト」の部分(js/home.js の renderHome が呼ぶ)。リストごとに1枚のカード
function renderTodoSection() {
  const x = todoText();
  const lists = loadTodoLists();
  const cards = lists
    .map((list) => {
      const rows = list.items.filter((it) => todoEntry(it));
      const dots = rows
        .slice(0, 6)
        .map((it) => `<span class="todo-dot" style="background:${TODO_TYPE_COLORS[shopType(todoEntry(it).shop)]}"></span>`)
        .join("");
      return (
        `<a class="todo-card" href="?view=todo&amp;list=${esc(list.id)}" data-todo-open="${esc(list.id)}">` +
        `<span class="todo-card-head"><span class="todo-title">${esc(list.title)}</span></span>` +
        `<span class="todo-card-foot"><span class="todo-dots" aria-hidden="true">${dots}</span>` +
        `<span class="todo-count">${esc(x.count(rows.length))}</span>${homeIcon("forward", 20)}</span>` +
        `</a>`
      );
    })
    .join("");
  return (
    `<section class="home-section" id="home-todo">` +
    `<h2 class="home-h2">${esc(x.sectionTitle)}</h2>` +
    `<p class="home-reason home-reason-plain">${esc(x.sectionSub)}</p>` +
    cards +
    `<a class="todo-new" href="?view=todo" data-todo-new>` +
    `<span class="todo-new-icon">${homeIcon("plus", 22)}</span>` +
    `<span class="todo-new-text"><span>${esc(x.newList)}</span><span>${esc(x.newListSub)}</span></span>` +
    `</a>` +
    (lists.length ? `<p class="home-history-note">${esc(x.storedNote)}</p>` : "") +
    `</section>`
  );
}

// ---------------------------------------------------------------------
// リストの一覧(URL「?view=todo&list=ID」)。お店を、おすすめ順に、カードで並べる
// ---------------------------------------------------------------------
let todoTypeFilter = "all";
let todoPendingDelete = null; // 「削除」を1回押したリストの id(もう1回押すと、本当に消す)
function renderTodoListPage(listId) {
  const x = todoText();
  const h = homeText();
  const list = loadTodoLists().find((l) => l.id === listId);
  const head =
    `<div class="todo-create-head">` +
    `<a class="todo-back" href="${esc(homeUrl())}" data-todo-back aria-label="${esc(x.backToHome)}">${homeIcon("back", 24)}</a>` +
    `<span class="todo-back-label">${esc(x.backToHome)}</span></div>`;
  if (!list) {
    homePage.innerHTML = head + `<section class="home-section"><p class="home-reason home-reason-plain">${esc(x.notFound)}</p></section>`;
    return;
  }
  const items = list.items.filter((it) => todoEntry(it));
  loadTodoRatings(items.map((it) => it.id));
  const types = ["restaurant", "grocery", "cafe"].filter((t) => items.some((it) => shopType(todoEntry(it).shop) === t));
  if (todoTypeFilter !== "all" && !types.includes(todoTypeFilter)) todoTypeFilter = "all";
  const chip = (key, label) =>
    `<button type="button" class="todo-chip${todoTypeFilter === key ? " is-on" : ""}" aria-pressed="${todoTypeFilter === key}" data-todo-filter="${key}">${esc(label)}</button>`;
  const shown = sortByRecommendation(items).filter(
    ({ it }) => todoTypeFilter === "all" || shopType(todoEntry(it).shop) === todoTypeFilter
  );
  const deleting = todoPendingDelete === list.id;
  homePage.innerHTML =
    head +
    `<div class="todo-band"><span class="todo-band-icon">${homeIcon("fnb", 26)}</span>` +
    `<span class="todo-band-title">${esc(list.title)}</span>` +
    `<span class="todo-band-count">${esc(x.count(items.length))}</span></div>` +
    `<section class="home-section todo-list-section">` +
    (types.length > 1 ? `<div class="todo-chips">${chip("all", x.all)}${types.map((t) => chip(t, h.typeLabel[t])).join("")}</div>` : "") +
    `<p class="todo-rank-note">${esc(x.rankNote)}</p>` +
    `<ul class="todo-shops">${shown.map(({ it }) => todoShopCard(todoEntry(it), it, {})).join("")}</ul>` +
    `<div class="todo-delete-row"><button type="button" class="todo-delete${deleting ? " is-confirm" : ""}" data-todo-delete="${esc(list.id)}">${esc(deleting ? x.removeConfirm : x.remove)}</button></div>` +
    `<p class="home-history-note">${esc(x.storedNote)}</p>` +
    `</section>`;
}

// ---------------------------------------------------------------------
// 「マイリストを作る」の画面(URL「?view=todo」)
// ---------------------------------------------------------------------
const todoDraft = { dest: null, wants: { meal: true, cafe: false, grocery: false }, items: null, message: "" };

function renderTodoCreate() {
  const x = todoText();
  const placeChip = (p) => {
    const on = todoDraft.dest && todoDraft.dest.key === p.key;
    return `<button type="button" class="todo-chip${on ? " is-on" : ""}" aria-pressed="${on}" data-todo-place="${esc(p.key)}">${esc(pick(p.name))}</button>`;
  };
  const customOn = todoDraft.dest && todoDraft.dest.key === "custom";
  const wantBtn = (key, label, type) => {
    const on = todoDraft.wants[key];
    return (
      `<button type="button" class="todo-want todo-want-${type}${on ? " is-on" : ""}" aria-pressed="${on}" data-todo-want="${key}">` +
      `${homeIcon(type, 26)}<span>${esc(label)}</span></button>`
    );
  };
  let preview = "";
  if (todoDraft.items && todoDraft.items.length) {
    loadTodoRatings(todoDraft.items.map((it) => it.id));
    const cards = sortByRecommendation(todoDraft.items)
      .filter(({ it }) => todoEntry(it))
      .map(({ it, i }) => todoShopCard(todoEntry(it), it, { removeIndex: i }))
      .join("");
    preview =
      `<div class="home-divider"></div>` +
      `<section class="home-section">` +
      `<p class="todo-preview-label">${esc(x.previewLabel)}</p>` +
      `<h2 class="home-h2">${esc(x.titleFor(pick(todoDraft.dest.name)))}</h2>` +
      `<ul class="todo-shops">${cards}</ul>` +
      `<div class="todo-actions">` +
      `<button type="button" class="todo-primary" data-todo-save>${homeIcon("check", 18)}<span>${esc(x.save)}</span></button>` +
      `<button type="button" class="todo-secondary" data-todo-make>${esc(x.redo)}</button>` +
      `</div></section>`;
  }
  homePage.innerHTML =
    `<div class="todo-create-head">` +
    `<a class="todo-back" href="${esc(homeUrl())}" data-todo-back aria-label="${esc(x.back)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(x.createTitle)}</h2></div>` +
    `<section class="home-section todo-form-section">` +
    `<h3 class="todo-step-title"><span>1</span>${esc(x.step1)}</h3>` +
    `<div class="todo-chips">${TODO_PLACES.map(placeChip).join("")}` +
    (customOn ? `<button type="button" class="todo-chip is-on" aria-pressed="true">${esc(pick(todoDraft.dest.name))}</button>` : "") +
    `</div>` +
    `<form class="todo-station" data-todo-station>` +
    `<label class="visually-hidden" for="todo-station-input">${esc(x.stationLabel)}</label>` +
    `<input id="todo-station-input" type="search" autocomplete="off" placeholder="${esc(x.stationPlaceholder)}">` +
    `<button type="submit">${esc(x.stationButton)}</button></form>` +
    `<h3 class="todo-step-title"><span>2</span>${esc(x.step2)}</h3>` +
    `<div class="todo-wants">` +
    wantBtn("meal", x.wantMeal, "restaurant") +
    (restaurants.some((s) => shopType(s) === "cafe") ? wantBtn("cafe", x.wantCafe, "cafe") : "") +
    wantBtn("grocery", x.wantGrocery, "grocery") +
    `</div>` +
    `<button type="button" class="todo-primary todo-make" data-todo-make>${homeIcon("sparkle", 20)}<span>${esc(x.make)}</span></button>` +
    `<p class="home-status" role="status"${todoDraft.message ? "" : " hidden"}>${esc(todoDraft.message)}</p>` +
    `</section>` +
    preview;
}

function todoMake() {
  const x = todoText();
  todoDraft.message = "";
  todoDraft.items = null;
  if (!todoDraft.dest) todoDraft.message = x.needDest;
  else if (!todoDraft.wants.meal && !todoDraft.wants.cafe && !todoDraft.wants.grocery) todoDraft.message = x.needWant;
  else {
    const items = buildTodoItems(todoDraft.dest, todoDraft.wants);
    if (!items.length) todoDraft.message = x.noShops;
    else todoDraft.items = items;
  }
  renderTodoCreate();
  const target = homePage.querySelector(todoDraft.items ? ".todo-shops" : ".home-status");
  if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });
}

function todoSave() {
  if (!todoDraft.items || !todoDraft.items.length) return;
  const list = {
    id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: todoText().titleFor(pick(todoDraft.dest.name)),
    createdAt: new Date().toISOString(),
    items: todoDraft.items.map((it) => ({ kind: "shop", id: it.id })),
  };
  saveTodoLists([list, ...loadTodoLists()]);
  todoDraft.items = null;
  todoDraft.message = "";
  navigate(location.pathname + "?view=todo&list=" + encodeURIComponent(list.id)); // 保存したリストの一覧を開く
}

// ---------------------------------------------------------------------
// 操作(ホームの中のクリック・入力を、まとめて受け取る)
// ---------------------------------------------------------------------
homePage.addEventListener("click", (event) => {
  const t = event.target;
  const plain = !(event.metaKey || event.ctrlKey || event.shiftKey);
  const newLink = t.closest("[data-todo-new]");
  if (newLink) {
    if (!plain) return;
    event.preventDefault();
    todoDraft.items = null;
    todoDraft.message = "";
    navigate(location.pathname + "?view=todo");
    return;
  }
  const open = t.closest("[data-todo-open]");
  if (open) {
    if (!plain) return;
    event.preventDefault();
    todoTypeFilter = "all";
    todoPendingDelete = null;
    navigate(location.pathname + "?view=todo&list=" + encodeURIComponent(open.dataset.todoOpen));
    return;
  }
  const back = t.closest("[data-todo-back]");
  if (back) {
    event.preventDefault();
    navigate(homeUrl());
    return;
  }
  const filter = t.closest("[data-todo-filter]");
  if (filter) {
    todoTypeFilter = filter.dataset.todoFilter;
    renderHomeMode();
    return;
  }
  const place = t.closest("[data-todo-place]");
  if (place) {
    const p = TODO_PLACES.find((x) => x.key === place.dataset.todoPlace);
    if (p) todoDraft.dest = { ...p };
    todoDraft.items = null;
    renderTodoCreate();
    return;
  }
  const want = t.closest("[data-todo-want]");
  if (want) {
    const k = want.dataset.todoWant;
    todoDraft.wants[k] = !todoDraft.wants[k];
    todoDraft.items = null;
    renderTodoCreate();
    return;
  }
  if (t.closest("[data-todo-make]")) {
    todoMake();
    return;
  }
  if (t.closest("[data-todo-save]")) {
    todoSave();
    return;
  }
  const rm = t.closest("[data-todo-remove]");
  if (rm && todoDraft.items) {
    todoDraft.items.splice(Number(rm.dataset.todoRemove), 1);
    if (!todoDraft.items.length) todoDraft.items = null;
    renderTodoCreate();
    return;
  }
  const del = t.closest("[data-todo-delete]");
  if (del) {
    const id = del.dataset.todoDelete;
    if (todoPendingDelete === id) {
      saveTodoLists(loadTodoLists().filter((l) => l.id !== id));
      todoPendingDelete = null;
      navigate(homeUrl());
    } else {
      todoPendingDelete = id; // もう1回押すと、本当に消す(押し間違いで消えないように)
      renderHomeMode();
    }
  }
});

// 駅名で行き先を決める(全国の駅のデータから探す。js/app.js の findStationPlaces)
homePage.addEventListener(
  "submit",
  (event) => {
    if (!event.target.matches("[data-todo-station]")) return;
    event.preventDefault();
    event.stopPropagation();
    const input = event.target.querySelector("input");
    const raw = input.value.trim();
    if (!raw) return;
    const x = todoText();
    const tryFind = () => {
      const places = findStationPlaces(normalizeText(raw).replace(/\s+/g, ""));
      if (places && places.length) {
        const [lat, lng] = places[0];
        const label = raw.replace(/駅$/, "") + (currentLang === "ja" ? "駅" : "");
        todoDraft.dest = { key: "custom", name: { ja: label, en: raw, vi: raw }, lat, lng };
        todoDraft.message = "";
      } else {
        todoDraft.message = x.stationNotFound;
      }
      todoDraft.items = null;
      renderTodoCreate();
    };
    ensureStationIndex();
    if (stationIndex) tryFind();
    else setTimeout(tryFind, 1500); // 駅のデータを読み込むのを、少し待つ
  },
  true
);
