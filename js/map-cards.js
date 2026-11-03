// スマホの地図: 拡大したときに、画面に見えているお店を、下に横並びのカードで出す(横にスライドできる)
//   ・カードを横にスライドすると、そのお店のピンを目立たせる。ピンを押すと、そのお店のカードへ移る(吹き出しは出さない)
//   ・カードを押すと、お店のページを開く
//   ・出すのは: スマホ(幅 600px 以下)の地図の画面で、ズーム 14 以上、画面の中のお店が 1〜30 件のときだけ
//   ・カードが出ている間は、ピンの上の写真の札は隠す(画面がにぎやかになりすぎないように)
//   ・うまくいかないときは、下の MAP_CARDS_ENABLED を false にすると、この機能だけを止められる(今までの動きに戻る)
const MAP_CARDS_ENABLED = true;

(function mapCards() {
  if (!MAP_CARDS_ENABLED || typeof map === "undefined" || typeof entries === "undefined") return;

  const MIN_ZOOM = 14;
  const MAX_CARDS = 30;
  const mq = window.matchMedia("(max-width: 600px)");
  const wrapEl = document.getElementById("map-wrap");
  if (!wrapEl) return;

  const TEXT = {
    ja: { type: { restaurant: "レストラン", cafe: "カフェ", grocery: "食材店" }, reviews: (n) => `レビュー ${n}件`, noReview: "レビューはまだありません", label: "画面の中のお店" },
    en: { type: { restaurant: "Restaurant", cafe: "Cafe", grocery: "Grocery" }, reviews: (n) => (n === 1 ? "1 review" : `${n} reviews`), noReview: "No reviews yet", label: "Shops on the map" },
    vi: { type: { restaurant: "Nhà hàng", cafe: "Cà phê", grocery: "Tạp hóa" }, reviews: (n) => `${n} đánh giá`, noReview: "Chưa có đánh giá", label: "Quán trên bản đồ" },
  };
  const tx = () => TEXT[typeof currentLang !== "undefined" && TEXT[currentLang] ? currentLang : "ja"];

  const box = document.createElement("div");
  box.className = "map-cards";
  box.hidden = true;
  box.innerHTML = `<ul class="map-cards-list" role="list"></ul>`;
  wrapEl.appendChild(box);
  const list = box.querySelector(".map-cards-list");

  let shown = []; // いまカードになっているお店(entries の要素)
  let activeEntry = null;
  let scrollTimer = null;
  let ignoreScroll = false;

  // カードを出してよい画面か
  function canShow() {
    const c = document.body.classList;
    if (!mq.matches) return false;
    if (c.contains("view-home") || c.contains("view-detail") || c.contains("view-content-page")) return false;
    if (typeof scanOverlayOpen !== "undefined" && scanOverlayOpen) return false;
    if (wrapEl.offsetWidth === 0) return false;
    return map.getZoom() >= MIN_ZOOM;
  }

  // 画面の中に見えている(絞り込みの条件にも合う)お店
  function visibleEntries() {
    const bounds = map.getBounds();
    return entries.filter((e) => e.visible && bounds.contains([e.shop.lat, e.shop.lng]));
  }

  function ratingHtml(shop) {
    const t = tx();
    const r = typeof todoRating === "function" ? todoRating(shop.id) : null;
    if (r && r.count) return `<span class="mc-star" aria-hidden="true">★</span><strong>${esc(r.avg.toFixed(1))}</strong><span class="mc-muted">${esc(t.reviews(r.count))}</span>`;
    if (r) return `<span class="mc-muted">${esc(t.noReview)}</span>`;
    return "";
  }

  function cardHtml(entry) {
    const shop = entry.shop;
    const t = tx();
    const type = typeof shopType === "function" ? shopType(shop) : "restaurant";
    const image = typeof getShopImage === "function" ? getShopImage(shop) : { src: "", isDefault: true };
    // 写真が無いお店は、ロゴがずらっと並ばないよう、種類の色の背景に、種類のイラストを出す
    const photo = image.isDefault
      ? `<span class="mc-photo is-noimg mc-type-${type}">${typeof typeIllustHtml === "function" ? typeIllustHtml(type, 44) : ""}</span>`
      : `<span class="mc-photo"><img src="${esc(image.src)}" alt="" loading="lazy" width="96" height="96"></span>`;
    return (
      `<li class="mc-item" data-id="${esc(shop.id)}">` +
      `<button type="button" class="mc-card">` +
      photo +
      `<span class="mc-body">` +
      `<span class="mc-name">${esc(pick(shop.name))}</span>` +
      `<span class="mc-meta">${esc(t.type[type])}${shop.area ? ` ・ ${esc(pick(shop.area))}` : ""}</span>` +
      `<span class="mc-rating" data-rating-for="${esc(shop.id)}">${ratingHtml(shop)}</span>` +
      `</span></button></li>`
    );
  }

  function setActive(entry, scrollCard) {
    if (activeEntry && activeEntry.marker && activeEntry.marker.getElement) {
      const el = activeEntry.marker.getElement();
      if (el) el.classList.remove("is-card-active");
    }
    activeEntry = entry;
    list.querySelectorAll(".mc-item.is-active").forEach((li) => li.classList.remove("is-active"));
    if (!entry) return;
    const el = entry.marker && entry.marker.getElement ? entry.marker.getElement() : null;
    if (el) el.classList.add("is-card-active");
    const li = list.querySelector(`.mc-item[data-id="${CSS.escape(entry.shop.id)}"]`);
    if (li) {
      li.classList.add("is-active");
      if (scrollCard) {
        ignoreScroll = true;
        list.scrollTo({ left: li.offsetLeft - (list.clientWidth - li.offsetWidth) / 2, behavior: "smooth" });
        setTimeout(() => (ignoreScroll = false), 500);
      }
    }
  }

  // 評価(★)をあとから読み込む(js/todo.js と同じ読み込み。読み終えたものから差し込む)
  let ratingTimer = null;
  function loadRatings() {
    if (typeof loadTodoRatings !== "function") return;
    loadTodoRatings(shown.map((e) => e.shop.id));
    let tries = 0;
    clearInterval(ratingTimer);
    ratingTimer = setInterval(() => {
      tries++;
      let pending = false;
      list.querySelectorAll("[data-rating-for]").forEach((el) => {
        const html = ratingHtml(restaurants.find((s) => s.id === el.dataset.ratingFor) || {});
        if (!html) pending = true;
        if (el.innerHTML !== html) el.innerHTML = html;
      });
      if (!pending || tries > 20) clearInterval(ratingTimer);
    }, 500);
  }

  function hide() {
    if (box.hidden) return;
    box.hidden = true;
    if (document.body.classList.contains("has-map-cards")) document.body.classList.remove("has-map-cards");
    setActive(null);
    shown = [];
  }

  function update() {
    if (!canShow()) return hide();
    const vis = visibleEntries();
    if (vis.length === 0 || vis.length > MAX_CARDS) return hide();
    // 入っているお店が前と同じなら、並びは変えない(カードを見ている途中で、順番が入れかわらないように)
    const sameSet = vis.length === shown.length && vis.every((e) => shown.includes(e));
    if (!sameSet) {
      const c = map.getCenter();
      const d = (e) => (e.shop.lat - c.lat) ** 2 + ((e.shop.lng - c.lng) * Math.cos((c.lat * Math.PI) / 180)) ** 2;
      shown = vis.slice().sort((a, b) => d(a) - d(b));
      list.innerHTML = shown.map(cardHtml).join("");
      list.scrollLeft = 0;
      loadRatings();
      setActive(shown.includes(activeEntry) ? activeEntry : shown[0], false);
    }
    box.setAttribute("aria-label", tx().label);
    box.hidden = false;
    if (!document.body.classList.contains("has-map-cards")) document.body.classList.add("has-map-cards");
  }

  // 横にスライドして止まったら、真ん中のカードのお店のピンを目立たせる
  list.addEventListener(
    "scroll",
    () => {
      if (ignoreScroll) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const mid = list.scrollLeft + list.clientWidth / 2;
        let best = null;
        let bestD = Infinity;
        list.querySelectorAll(".mc-item").forEach((li) => {
          const dd = Math.abs(li.offsetLeft + li.offsetWidth / 2 - mid);
          if (dd < bestD) {
            bestD = dd;
            best = li;
          }
        });
        const entry = best && shown.find((e) => e.shop.id === best.dataset.id);
        if (entry && entry !== activeEntry) setActive(entry, false);
      }, 120);
    },
    { passive: true }
  );

  // カードを押したら、お店のページを開く
  list.addEventListener("click", (event) => {
    const li = event.target.closest(".mc-item");
    const entry = li && shown.find((e) => e.shop.id === li.dataset.id);
    if (entry && typeof openShop === "function") openShop(entry);
  });

  // ピンを押したとき(カードが出ている間だけ): 吹き出しの代わりに、そのお店のカードへ移る(app.js の popupopen から呼ばれる)
  window.mapCardsHandlePin = function (entry) {
    if (box.hidden || !shown.includes(entry)) return false;
    setActive(entry, true);
    return true;
  };

  // 地図を動かしたとき・絞り込みが変わったとき・画面が切り替わったときに、作り直す
  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  };
  map.on("moveend zoomend", schedule);
  window.addEventListener("resize", schedule);
  mq.addEventListener ? mq.addEventListener("change", schedule) : mq.addListener(schedule);
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  if (typeof applyFilters === "function") {
    const original = applyFilters;
    // eslint-disable-next-line no-global-assign
    applyFilters = function (...args) {
      const result = original.apply(this, args);
      schedule();
      return result;
    };
  }
  const langSelect = document.getElementById("lang-select");
  if (langSelect)
    langSelect.addEventListener("change", () => {
      shown = []; // 言語が変わったので、カードの文字を作り直す
      setTimeout(update, 50);
    });
  window.addEventListener("shop-covers-ready", () => {
    shown = []; // 写真が変わるので、カードを作り直す
    schedule();
  });
  schedule();
})();
