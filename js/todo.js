// To Do List(行きたいお店のチェックリスト)
//   ・ホームの「To Do List」に、作ったリストを出す。行ったお店にチェックを入れると、進み具合が分かる
//   ・「新しい To Do List を作る」(URL「?view=todo」): 行き先と、やりたいこと(食事・カフェ・食材の買い物)を選ぶと、
//     その近くのお店(と、希望すれば近くの名所)から、まわりやすい順のリストを自動で作る
//   ・作ったリストは、この端末(ブラウザの localStorage)の中だけに保存する。サーバーや第三者には送らない
//   ・お店の情報(店名・位置)は data.js、名所は landmarks.js のものを使う

const TODO_KEY = "vf_todo_lists"; // [{ id, title, createdAt, items: [{ kind: "shop", id, done } | { kind: "spot", name, lat, lng, done }] }]
const TODO_MAX_LISTS = 20;
const TODO_MAX_ITEMS = 5;

const TODO_TEXT = {
  ja: {
    sectionTitle: "To Do List",
    sectionSub: "行きたいお店を、行ったらチェック",
    newList: "新しい To Do List を作る",
    newListSub: "行き先とやりたいことを選ぶだけ",
    done: (a, b) => `${a} / ${b} 完了`,
    remove: "削除",
    removeConfirm: "本当に削除",
    storedNote: "To Do List は、この端末の中だけに保存しています",
    spot: "名所",
    createTitle: "To Do List を作る",
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
    includeSpots: "近くの名所も入れる",
    make: "おすすめのリストを作る",
    needDest: "行き先を選んでください",
    needWant: "やりたいことを1つ以上選んでください",
    noShops: "この近くに、条件に合うお店が見つかりませんでした。行き先か、やりたいことを変えてみてください",
    previewLabel: "できあがったリスト",
    titleFor: (d) => `${d}のまわり`,
    removeItem: "リストから外す",
    save: "To Do List に保存",
    redo: "作り直す",
    saved: "保存しました",
    walk: (km) => `ぜんぶで約${km}km`,
  },
  en: {
    sectionTitle: "To Do List",
    sectionSub: "Shops you want to visit — check them off as you go",
    newList: "Make a new To Do List",
    newListSub: "Just pick a place and what you want to do",
    done: (a, b) => `${a} / ${b} done`,
    remove: "Delete",
    removeConfirm: "Really delete",
    storedNote: "To Do Lists are saved only on this device",
    spot: "Sight",
    createTitle: "Make a To Do List",
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
    includeSpots: "Add nearby sights too",
    make: "Make a list for me",
    needDest: "Please choose a place",
    needWant: "Please choose at least one thing to do",
    noShops: "No matching shops were found near here. Try another place or other things to do",
    previewLabel: "Your list",
    titleFor: (d) => `Around ${d}`,
    removeItem: "Remove from list",
    save: "Save to To Do List",
    redo: "Start over",
    saved: "Saved",
    walk: (km) => `About ${km} km in total`,
  },
  vi: {
    sectionTitle: "To Do List",
    sectionSub: "Những quán muốn đến — đánh dấu khi đã đi",
    newList: "Tạo To Do List mới",
    newListSub: "Chỉ cần chọn nơi đến và việc muốn làm",
    done: (a, b) => `Xong ${a} / ${b}`,
    remove: "Xóa",
    removeConfirm: "Xóa thật",
    storedNote: "To Do List chỉ được lưu trên thiết bị này",
    spot: "Địa danh",
    createTitle: "Tạo To Do List",
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
    includeSpots: "Thêm địa danh gần đó",
    make: "Tạo danh sách gợi ý",
    needDest: "Hãy chọn nơi đến",
    needWant: "Hãy chọn ít nhất một việc muốn làm",
    noShops: "Không tìm thấy quán phù hợp gần đây. Hãy thử nơi đến hoặc việc khác",
    previewLabel: "Danh sách đã tạo",
    titleFor: (d) => `Quanh ${d}`,
    removeItem: "Bỏ khỏi danh sách",
    save: "Lưu vào To Do List",
    redo: "Làm lại",
    saved: "Đã lưu",
    walk: (km) => `Tổng khoảng ${km} km`,
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
// 保存(この端末の中だけ)
// ---------------------------------------------------------------------
function loadTodoLists() {
  try {
    const v = JSON.parse(localStorage.getItem(TODO_KEY) || "[]");
    return Array.isArray(v) ? v.filter((l) => l && typeof l.id === "string" && Array.isArray(l.items)) : [];
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

// ---------------------------------------------------------------------
// リストを作る: 行き先の近くのお店から、やりたいことに合わせて選び、まわりやすい順に並べる
// ---------------------------------------------------------------------
function buildTodoItems(dest, wants, withSpots) {
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
  // まず、選んだ種類ごとに、いちばん近いお店を1つずつ(種類がかたよらないように)
  const picked = [];
  types.forEach((t) => {
    const x = pool.find((p) => shopType(p.e.shop) === t && !picked.includes(p));
    if (x) picked.push(x);
  });
  // 残りは、近い順に足す
  const shopSlots = TODO_MAX_ITEMS - (withSpots ? 1 : 0);
  pool.forEach((p) => {
    if (picked.length < shopSlots && !picked.includes(p)) picked.push(p);
  });
  let items = picked.slice(0, shopSlots).map((p) => ({ kind: "shop", id: p.e.shop.id, lat: p.e.shop.lat, lng: p.e.shop.lng, done: false }));
  // 近くの名所(駅以外。行き先から3km以内でいちばん近いもの)
  if (withSpots && typeof landmarks !== "undefined") {
    const spot = landmarks
      .filter((l) => l.kind !== "station")
      .map((l) => ({ l, km: distanceKm(dest.lat, dest.lng, l.lat, l.lng) }))
      .filter((x) => x.km <= 3)
      .sort((a, b) => a.km - b.km)[0];
    if (spot) items.push({ kind: "spot", name: { ja: spot.l.name.ja, en: spot.l.name.en }, lat: spot.l.lat, lng: spot.l.lng, done: false });
  }
  // まわりやすい順: 行き先から、いちばん近いところへ、次々に進む
  const ordered = [];
  let cur = { lat: dest.lat, lng: dest.lng };
  while (items.length) {
    let best = 0;
    items.forEach((it, i) => {
      if (distanceKm(cur.lat, cur.lng, it.lat, it.lng) < distanceKm(cur.lat, cur.lng, items[best].lat, items[best].lng)) best = i;
    });
    const next = items.splice(best, 1)[0];
    ordered.push(next);
    cur = next;
  }
  return ordered.map((it) => (it.kind === "shop" ? { kind: "shop", id: it.id, done: false } : it));
}

// リストの道のりの長さ(直線距離の合計。おおよその目安)
function todoRouteKm(dest, items) {
  let km = 0;
  let cur = dest;
  items.forEach((it) => {
    const p = todoItemPos(it);
    if (!p) return;
    km += distanceKm(cur.lat, cur.lng, p.lat, p.lng);
    cur = p;
  });
  return km;
}
function todoItemPos(it) {
  if (it.kind === "spot") return { lat: it.lat, lng: it.lng };
  const e = entries.find((x) => x.shop.id === it.id);
  return e ? { lat: e.shop.lat, lng: e.shop.lng } : null;
}

// ---------------------------------------------------------------------
// 画面の部品
// ---------------------------------------------------------------------
const TODO_TYPE_COLORS = { restaurant: "#e53935", grocery: "#1e63d6", cafe: "#795548", spot: "#2e7d32" };

// 1つの項目(お店 or 名所)の、名前・種類・色。お店がデータから消えていたら null
function todoItemInfo(it) {
  const h = homeText();
  if (it.kind === "spot") {
    const name = currentLang === "ja" ? it.name.ja : it.name.en || it.name.ja;
    return { name, label: todoText().spot, color: TODO_TYPE_COLORS.spot, shopId: null };
  }
  const e = entries.find((x) => x.shop.id === it.id);
  if (!e) return null;
  const type = shopType(e.shop);
  return { name: pick(e.shop.name), label: `${h.typeLabel[type]} ・ ${pick(e.shop.area)}`, color: TODO_TYPE_COLORS[type], shopId: e.shop.id };
}

// ホームの「To Do List」の部分(js/home.js の renderHome が呼ぶ)
let todoPendingDelete = null; // 「削除」を1回押したリストの id(もう1回押すと、本当に消す)
function renderTodoSection() {
  const x = todoText();
  const lists = loadTodoLists();
  const cards = lists
    .map((list) => {
      const rows = list.items
        .map((it, i) => ({ it, i, info: todoItemInfo(it) }))
        .filter((r) => r.info);
      const doneCount = rows.filter((r) => r.it.done).length;
      const pct = rows.length ? Math.round((doneCount / rows.length) * 100) : 0;
      const items = rows
        .map(
          ({ it, i, info }) =>
            `<li class="todo-row${it.done ? " is-done" : ""}">` +
            `<label class="todo-check"><input type="checkbox" data-todo-check="${esc(list.id)}" data-todo-index="${i}"${it.done ? " checked" : ""} style="accent-color:${info.color}">` +
            `<span class="visually-hidden">${esc(info.name)}</span></label>` +
            (info.shopId
              ? `<a class="todo-name" href="${esc(shopUrl(info.shopId))}" data-shop-id="${esc(info.shopId)}">${esc(info.name)}</a>`
              : `<span class="todo-name">${esc(info.name)}</span>`) +
            `<span class="todo-kind" style="color:${info.color}">${esc(info.label.split(" ・ ")[0])}</span>` +
            `</li>`
        )
        .join("");
      const deleting = todoPendingDelete === list.id;
      return (
        `<div class="todo-card">` +
        `<div class="todo-card-head"><h3 class="todo-title">${esc(list.title)}</h3>` +
        `<span class="todo-progress-text">${esc(x.done(doneCount, rows.length))}</span></div>` +
        `<div class="todo-bar" aria-hidden="true"><div style="width:${pct}%"></div></div>` +
        `<ul class="todo-rows">${items}</ul>` +
        `<div class="todo-card-foot"><button type="button" class="todo-delete${deleting ? " is-confirm" : ""}" data-todo-delete="${esc(list.id)}">${esc(deleting ? x.removeConfirm : x.remove)}</button></div>` +
        `</div>`
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
// 「To Do List を作る」の画面(URL「?view=todo」。ホームの場所に出す)
// ---------------------------------------------------------------------
const todoDraft = { dest: null, wants: { meal: true, cafe: false, grocery: false }, withSpots: true, items: null, message: "" };

function renderTodoCreate() {
  const x = todoText();
  const h = homeText();
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
    const rows = todoDraft.items
      .map((it, i) => ({ it, i, info: todoItemInfo(it) }))
      .filter((r) => r.info)
      .map(
        ({ i, info }, n) =>
          `<li class="todo-step">` +
          `<span class="todo-step-num" style="background:${info.color}">${n + 1}</span>` +
          `<span class="todo-step-body"><span class="todo-step-kind" style="color:${info.color}">${esc(info.label)}</span>` +
          `<span class="todo-step-name">${esc(info.name)}</span></span>` +
          `<button type="button" class="todo-step-remove" data-todo-remove="${i}" aria-label="${esc(x.removeItem)}">${homeIcon("close", 18)}</button>` +
          `</li>`
      )
      .join("");
    const km = todoRouteKm(todoDraft.dest, todoDraft.items);
    preview =
      `<div class="home-divider"></div>` +
      `<section class="home-section">` +
      `<p class="todo-preview-label">${esc(x.previewLabel)}</p>` +
      `<h2 class="home-h2">${esc(x.titleFor(pick(todoDraft.dest.name)))}</h2>` +
      `<p class="home-reason home-reason-plain">${esc(x.walk(km < 10 ? km.toFixed(1) : Math.round(km)))}</p>` +
      `<ol class="todo-steps">${rows}</ol>` +
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
    `<label class="todo-spots"><input type="checkbox" data-todo-spots${todoDraft.withSpots ? " checked" : ""}> ${esc(x.includeSpots)}</label>` +
    `<button type="button" class="todo-primary todo-make" data-todo-make>${homeIcon("sparkle", 20)}<span>${esc(x.make)}</span></button>` +
    `<p class="home-status" role="status"${todoDraft.message ? "" : " hidden"}>${esc(todoDraft.message)}</p>` +
    `</section>` +
    preview;
  void h;
}

function todoMake() {
  const x = todoText();
  todoDraft.message = "";
  todoDraft.items = null;
  if (!todoDraft.dest) todoDraft.message = x.needDest;
  else if (!todoDraft.wants.meal && !todoDraft.wants.cafe && !todoDraft.wants.grocery) todoDraft.message = x.needWant;
  else {
    const items = buildTodoItems(todoDraft.dest, todoDraft.wants, todoDraft.withSpots);
    if (!items.some((it) => it.kind === "shop")) todoDraft.message = x.noShops;
    else todoDraft.items = items;
  }
  renderTodoCreate();
  const target = homePage.querySelector(todoDraft.items ? ".todo-steps" : ".home-status");
  if (target) target.scrollIntoView({ block: "center", behavior: "smooth" });
}

function todoSave() {
  if (!todoDraft.items || !todoDraft.items.length) return;
  const list = {
    id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: todoText().titleFor(pick(todoDraft.dest.name)),
    createdAt: new Date().toISOString(),
    items: todoDraft.items.map((it) => ({ ...it, done: false })),
  };
  saveTodoLists([list, ...loadTodoLists()]);
  todoDraft.items = null;
  todoDraft.message = "";
  navigate(homeUrl());
  const sec = document.getElementById("home-todo");
  if (sec) sec.scrollIntoView({ block: "start" });
}

// ---------------------------------------------------------------------
// 操作(ホームの中のクリック・入力を、まとめて受け取る)
// ---------------------------------------------------------------------
homePage.addEventListener("click", (event) => {
  const t = event.target;
  const newLink = t.closest("[data-todo-new]");
  if (newLink) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    todoDraft.items = null;
    todoDraft.message = "";
    navigate(location.pathname + "?view=todo");
    return;
  }
  const back = t.closest("[data-todo-back]");
  if (back) {
    event.preventDefault();
    navigate(homeUrl());
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
    if (!todoDraft.items.some((it) => it.kind === "shop")) todoDraft.items = null;
    renderTodoCreate();
    return;
  }
  const del = t.closest("[data-todo-delete]");
  if (del) {
    const id = del.dataset.todoDelete;
    if (todoPendingDelete === id) {
      saveTodoLists(loadTodoLists().filter((l) => l.id !== id));
      todoPendingDelete = null;
    } else {
      todoPendingDelete = id; // もう1回押すと、本当に消す(押し間違いで消えないように)
    }
    renderHome();
    return;
  }
});

homePage.addEventListener("change", (event) => {
  const t = event.target;
  if (t.matches("[data-todo-check]")) {
    const lists = loadTodoLists();
    const list = lists.find((l) => l.id === t.dataset.todoCheck);
    const it = list && list.items[Number(t.dataset.todoIndex)];
    if (it) {
      it.done = t.checked;
      saveTodoLists(lists);
    }
    const y = homeView.scrollTop;
    renderHome();
    homeView.scrollTop = y; // チェックしても、画面の位置は動かさない
    return;
  }
  if (t.matches("[data-todo-spots]")) {
    todoDraft.withSpots = t.checked;
    todoDraft.items = null;
    renderTodoCreate();
  }
});

// 駅名で行き先を決める(全国の駅のデータから探す。js/app.js の findStationPlaces)
homePage.addEventListener("submit", (event) => {
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
}, true);
