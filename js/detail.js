// =====================================================================
// 店舗詳細ページ と URLルーティング
// =====================================================================
//
// ■ URLの形(すべて、静的ファイルのまま動きます。サーバーの設定は要りません)
//     一覧      … /               (または /index.html)
//     詳細ページ … /?shop=店舗ID    例: /?shop=viet-nhat
//   ・お店の id は、data.js の各お店に書いてあります。
//   ・「?shop=…」の形にしているのは、Python の簡易サーバーや GitHub Pages でも、
//     ページの再読み込み・URLの直接入力・共有が、そのまま動くからです。
//     (「/shops/店舗ID」の形は、そのようなサーバーでは「見つかりません(404)」になってしまいます)
//
// ■ しくみ(History API)
//   ・カードをクリックすると、history.pushState でURLだけを書き換えて、同じページの中で
//     一覧 ⇔ 詳細を切り替えます(ページ全体の読み込み直しがないので、速く、
//     一覧に戻ったときは、検索・絞り込み・地図の位置が、そのまま残ります)。
//   ・ブラウザの「戻る・進む」は、popstate イベントで受け取って、表示を切り替えます。
//   ・pushState が使えない環境(file:// で開いたとき)は、普通のリンクとして、ページを読み込み直します。

const detailView = document.getElementById("detail-view");
const detailPage = document.getElementById("detail-page");
const shopListPanel = document.getElementById("shop-list");
const contentPageView = document.getElementById("content-page-view");
const contentPageEl = document.getElementById("content-page");

// ?page=… で開ける、固定ページ(利用規約・プライバシーポリシー・運営者情報)の一覧
//   ・中身(タイトル・本文)は、js/i18n.js の ui[言語].xxxPageTitle / xxxIntro / xxxSections にある
const CONTENT_PAGES = {
  terms: { titleKey: "termsPageTitle", introKey: "termsIntro", sectionsKey: "termsSections" },
  privacy: { titleKey: "privacyPageTitle", introKey: "privacyIntro", sectionsKey: "privacySections" },
  about: { titleKey: "aboutPageTitle", introKey: "aboutIntro", sectionsKey: "aboutSections" },
};
let currentContentPage = null; // いま表示中の固定ページ("terms" など)。表示していなければ null

let detailMap = null; // 詳細ページの地図(表示のたびに作り、離れるときに壊す)
let detailUserMarker = null; // 詳細ページの地図の、現在地の目印
let detailGps = null; // 詳細ページで取得した現在地 { lat, lng, kind: "gps" }(メモリ上だけ。保存しない)
let distanceState = "idle"; // 距離の表示の状態: "idle" | "loading" | "failed"
let geoPermission = "unknown"; // 位置情報の許可の状態: "granted" | "denied" | "prompt" | "unknown"
let listScrollTop = 0; // 詳細を開く前の、一覧のスクロール位置
let lastViewedShopId = null; // 最後に詳細を見たお店(一覧に戻ったとき、強調表示する)
let listMapNeedsFit = false; // 一覧の地図を、最初に見せるときに合わせ直す必要があるか

// ---------------------------------------------------------------------
// 部品
// ---------------------------------------------------------------------

// (esc と shopUrl は、一覧のカードでも使うので、app.js にあります)

// 一覧のURL(いまのページの、「?」より前の部分)
function listUrl() {
  return appBase();
}

// いまのURLから、「一覧」か「詳細ページ」か「固定ページ(利用規約など)」かを判断する
function routeFromLocation() {
  const params = new URLSearchParams(location.search);
  const id = params.get(SHOP_PARAM);
  if (id) return { name: "shop", id };
  const page = params.get(PAGE_PARAM);
  if (page && CONTENT_PAGES[page]) return { name: "content", page };
  // プライバシーポリシー: 「/privacy」(または「?page=privacy」)
  if (!id && !params.get("view") && /\/privacy\/?$/i.test(location.pathname)) return { name: "content", page: "privacy" };
  // ホーム(js/home.js): URL に何も付いていないとき、または「?view=home」のとき
  const view = params.get("view");
  if (view === "map") return { name: "list" };
  // アカウント(js/account.js): 「?view=account」= 自分のアカウント / 「?user=ID」= その人のプロフィール
  const userId = params.get("user");
  if (userId && typeof showHome === "function") return { name: "home", mode: "user", list: userId };
  if (view === "account" && typeof showHome === "function") return { name: "home", mode: "account" };
  // 保存したお店(js/account.js): 「?view=saved」
  if (view === "saved" && typeof showHome === "function") return { name: "home", mode: "saved" };
  // お問い合わせ(js/contact.js): 「/contact」(または「?view=contact」)
  const onContactPath = /\/contact\/?$/i.test(location.pathname);
  if ((view === "contact" || (onContactPath && !view)) && typeof showHome === "function") return { name: "home", mode: "contact" };
  // エリアの一覧(js/home.js): 「?view=areas」
  if (view === "areas" && typeof showHome === "function") return { name: "home", mode: "areas" };
  // ユーザーを探す(js/people.js): 「?view=people」
  if (view === "people" && typeof showHome === "function") return { name: "home", mode: "people" };
  // 特集(js/feature.js): 「?view=feature&type=cafe」
  if (view === "feature" && typeof showHome === "function") return { name: "home", mode: "feature", list: params.get("type") };
  // トラベル・リスト(js/todo.js): 「?view=todo」= トラベル・リスト / 「&edit=1」= 設定 / 「&area=東京都」= そのエリアのお店の一覧
  if (view === "todo" && typeof showHome === "function") {
    if (params.get("area")) return { name: "home", mode: "todo-area", list: params.get("area") };
    return { name: "home", mode: params.get("edit") ? "todo-edit" : "todo" };
  }
  if (typeof showHome === "function" && (view === "home" || (!view && isHomeDefault()))) return { name: "home" };
  return { name: "list" };
}

// 「/privacy」を直接開いたとき(privacy.html が「?page=privacy」に送る)は、表示上のURLを「/privacy」に戻す
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get(PAGE_PARAM) === "privacy" && [...params.keys()].length === 1) {
    try {
      history.replaceState(history.state, "", privacyUrl() + location.hash);
    } catch (e) {
      // 書き換えられない環境(file:// など)は、そのまま
    }
  }
})();

// URLを書き換えて(pushState)、表示を切り替える
function navigate(url) {
  // スキャン結果の一覧オーバーレイを開いたまま、別のページ(詳細・固定ページなど)へ移動しないようにする
  //   (開いていれば、中に移動していた本物の地図を、元の場所に戻してから閉じる。app.js の関数)
  if (typeof closeScanOverlay === "function") closeScanOverlay();
  try {
    history.pushState({ app: true, fromList: currentShopId === null }, "", url);
  } catch (error) {
    location.assign(url); // pushState が使えない環境(file:// など)は、普通のリンクとして開く
    return;
  }
  renderRoute();
}

function openShop(entry) {
  navigate(shopUrl(entry.shop.id));
}

// 「← 一覧に戻る」: 一覧から来たときは、ブラウザの「戻る」と同じ(一覧の状態が残る)
function goToList() {
  if (history.state && history.state.fromList) history.back();
  else navigate(listUrl());
}

// ---------------------------------------------------------------------
// 表示の切り替え(ルーター)
// ---------------------------------------------------------------------

function renderRoute() {
  const route = routeFromLocation();
  if (route.name !== "home" && typeof hideHome === "function") hideHome();
  if (route.name === "shop") showDetail(route.id);
  else if (route.name === "content") showContentPage(route.page);
  else if (route.name === "home") showHome(route.mode, route.list);
  else showList();
  if (typeof renderTabs === "function") renderTabs(); // 画面の下のタブ(スマホ)の、いまの画面の印
}

function showDetail(id) {
  if (!document.body.classList.contains("view-detail") && !document.body.classList.contains("view-content-page")) {
    listScrollTop = shopListPanel.scrollTop;
  }
  currentShopId = id;
  lastViewedShopId = id;
  if (typeof recordRecentShop === "function") recordRecentShop(id); // ホームの「あなたへのおすすめ」のため(このブラウザの中だけ)
  document.body.classList.remove("view-content-page");
  contentPageView.hidden = true;
  document.body.classList.add("view-detail"); // 一覧・検索ボックスを隠す(CSS)
  detailView.hidden = false;
  map.closePopup();
  renderDetail();
  detailView.scrollTop = 0;
  window.scrollTo(0, 0);
}

// 固定ページの表示(URLが「?page=terms」「?page=privacy」「?page=about」のとき)
function showContentPage(page) {
  if (!document.body.classList.contains("view-detail") && !document.body.classList.contains("view-content-page")) {
    listScrollTop = shopListPanel.scrollTop;
  }
  currentShopId = null; // 詳細ページの状態ではない(Tips・Check-inなどは、そのまま残しておく。あとで戻ってきたときのため)
  currentContentPage = page;
  document.body.classList.remove("view-detail");
  detailView.hidden = true;
  document.body.classList.add("view-content-page"); // 一覧・検索ボックスを隠す(CSS。詳細ページと同じ考え方)
  contentPageView.hidden = false;
  renderContentPage();
  contentPageView.scrollTop = 0;
  window.scrollTo(0, 0);
  applyDocumentTitle();
}

// 一覧の地図を、表示されているお店がぜんぶ見える範囲に合わせる
function fitVisibleShops() {
  const shown = entries.filter((entry) => entry.visible);
  if (shown.length > 0) {
    map.fitBounds(shown.map((entry) => [entry.shop.lat, entry.shop.lng]), { padding: [40, 40], maxZoom: 15, animate: false });
  }
}

//   forHome: ホームを出す前の片付けとして呼ぶとき(地図は隠れたままなので、地図の大きさの測り直しなどはしない)
function showList(forHome = false) {
  const wasDetail = document.body.classList.contains("view-detail");
  const wasAltView = wasDetail || document.body.classList.contains("view-content-page");
  destroyDetailMap();
  currentShopId = null;
  currentContentPage = null;
  tipsState = createTipsState(null);
  reviewState = createReviewState(null);
  reviewsState = createReviewsState(null);
  checkinState = createCheckinState(null);
  revokePendingPhotoPreview(photosState); // アップロード待ちの写真があれば、一時URLを片付けてから、状態を作り直す
  photosState = createPhotosState(null);
  document.body.classList.remove("view-detail", "view-content-page");
  detailView.hidden = true;
  contentPageView.hidden = true;
  applyDocumentTitle();
  if (forHome) return;
  map.invalidateSize(); // 隠れていた間に、地図の大きさが分からなくなっているので、測り直す
  if (listMapNeedsFit) {
    listMapNeedsFit = false;
    fitVisibleShops();
  }
  if (wasAltView) {
    // 一覧の状態(検索・絞り込み・地図の位置)は、そのまま残っている。スクロール位置を戻して、見ていたお店を強調する
    shopListPanel.scrollTop = listScrollTop;
    const entry = entries.find((e) => e.shop.id === lastViewedShopId);
    if (entry && entry.visible) setSelected(entry);
  }
}

// ---------------------------------------------------------------------
// 詳細ページの表示
// ---------------------------------------------------------------------

// 「情報未登録」の表示(データが無い項目は、架空の情報を作らず、これを出す)
function emptyHtml() {
  return `<span class="is-empty">${esc(ui[currentLang].notRegistered)}</span>`;
}

// カテゴリーの、いまの言語での表示(data.js の categoryLabels に無いものは、書いた文字のまま)
function categoryText(shop) {
  if (!shop.category) return "";
  const label = categoryLabels[shop.category];
  return label && label[currentLang] ? label[currentLang] : shop.category;
}

// 現在地の起点(現在地周辺で使っている起点があればそれ、なければ、詳細ページで取得した現在地)
function getDetailOrigin() {
  return nearbyOrigin || detailGps;
}

// 詳細ページからの Google マップのルート検索URL(現在地が分かっているときだけ、出発地を指定する)
function getDetailRouteUrl(shop) {
  const o = getDetailOrigin();
  return (
    "https://www.google.com/maps/dir/?api=1" +
    (o ? `&origin=${o.lat.toFixed(6)},${o.lng.toFixed(6)}` : "") +
    `&destination=${shop.lat},${shop.lng}`
  );
}

// Google マップへの2つのリンクを、いまの状態に合わせる(現在地が分かったあとは、ルートに出発地が入る)
function updateDetailLinks() {
  const entry = entries.find((e) => e.shop.id === currentShopId);
  const google = detailPage.querySelector("#link-google");
  const route = detailPage.querySelector("#link-route");
  if (!entry || !google || !route) return;
  google.href = getGoogleMapsUrl(entry.shop);
  route.href = getDetailRouteUrl(entry.shop);
}

function destroyDetailMap() {
  if (detailMap) detailMap.remove();
  detailMap = null;
  detailUserMarker = null;
}

function renderDetail() {
  const t = ui[currentLang];
  const entry = entries.find((e) => e.shop.id === currentShopId);
  const keepScroll = detailView.scrollTop;
  destroyDetailMap();
  applyDocumentTitle();

  // --- お店が見つからないとき(URLの id が間違っている など) ---
  if (!entry) {
    detailPage.innerHTML =
      `<a class="btn detail-back" href="${esc(listUrl())}">${esc(t.detailBack)}</a>` +
      `<section class="detail-notfound"><h2>${esc(t.detailNotFound)}</h2><p>${esc(t.detailNotFoundText)}</p></section>`;
    bindBackLinks();
    return;
  }

  const shop = entry.shop;
  const name = pick(shop.name);
  const category = categoryText(shop);
  const prefecture = prefectures.find((p) => p.key === shop.prefecture);
  const areaText = [prefecture ? pick(prefecture.label) : "", pick(shop.area)].filter(Boolean).join(" ・ ");
  const dishes = (shop.dishes || []).map(dishLabel);

  // --- 基本情報(データが無い項目は「情報未登録」) ---
  const row = (label, value) =>
    `<dt>${esc(label)}</dt><dd>${value ? value : emptyHtml()}</dd>`;
  const infoRows =
    row(t.dtCategory, category ? esc(category) : "") +
    row(t.dtArea, areaText ? esc(areaText) : "") +
    row(t.dtAddress, pick(shop.address) ? esc(pick(shop.address)) : "") +
    row(t.dtDishes, dishes.length ? dishes.map((d) => `<span class="tag">${esc(d)}</span>`).join("") : "");

  detailPage.innerHTML = `
    <a class="btn detail-back" href="${esc(listUrl())}">${esc(t.detailBack)}</a>

    <article class="detail">
      <!-- ① 店舗画像 -->
      <div class="detail-hero"><img class="detail-hero-img" alt=""><span class="detail-credit" hidden></span></div>

      <div class="detail-head">
        <div class="detail-title-row">
          <h2 class="detail-name">${esc(name)}</h2>
          ${bookmarkButtonHtml(shop)}
        </div>
        <p class="detail-bookmark-toast" id="detail-bookmark-toast" role="status"></p>
        <p class="detail-sub">${[category, areaText].filter(Boolean).map(esc).join(" ・ ")}</p>
      </div>

      <!-- 件数エリア: Tips とレビューの件数(中身は renderDetailStats が作る) -->
      <div class="detail-stats" id="detail-stats"></div>

      <!-- ② 基本情報 / ④ 現在地からの距離 -->
      <section class="detail-section">
        <h3>${esc(t.detailInfo)}</h3>
        <dl class="detail-info">${infoRows}</dl>
        <div class="detail-distance" id="detail-distance"></div>
      </section>

      <!-- 💡 このお店のTips(Firebase Firestore。中身は renderTips が作る) -->
      <section class="detail-section" id="detail-tips">
        <h3>💡 ${esc(t.tipsTitle)}</h3>
        <div id="tips-body"></div>
      </section>

      <!-- ⑤ 地図・ルート確認 -->
      <section class="detail-section" id="detail-map-section">
        <h3>${esc(t.mapTitle)}</h3>
        <div id="detail-map" role="img" aria-label="${esc(name)}"></div>
        <div class="detail-links">
          <a class="btn btn-primary" id="link-google" target="_blank" rel="noopener noreferrer">📍 ${esc(t.mapLink)}</a>
          <a class="btn" id="link-route" target="_blank" rel="noopener noreferrer">🧭 ${esc(t.mapRoute)}</a>
        </div>
      </section>

      <!-- 近くのスポット: このお店と違う種類のお店(5km以内。中身は nearbySpotsHtml が作る) -->
      ${nearbySpotsHtml(shop)}

      <!-- ⑥ みんなの写真(Firebase Firestore + Storage。中身は renderPhotos が作る) -->
      <section class="detail-section" id="detail-photos">
        <h3>${esc(t.photosTitle)}</h3>
        <div id="photos-body"></div>
      </section>

      <!-- ⭐ レビュー(Firebase Firestore。中身は renderReviews が作る) -->
      <section class="detail-section" id="detail-reviews">
        <h3>${esc(t.reviewsTitle)}</h3>
        <div id="reviews-body"></div>
      </section>

      <!-- Check-in(Firebase Firestore。中身は renderCheckin が作る) -->
      <section class="detail-section" id="detail-checkin">
        <h3>📍 ${esc(t.checkinTitle)}</h3>
        <div id="checkin-body"></div>
      </section>

      <!-- ⑧ あなたのレビューをシェアしよう(押すと、端末の共有画面。使えないときは、リンクをコピー) -->
      <section class="detail-section detail-share" id="detail-share">
        <h3>${esc(t.shareReviewTitle)}</h3>
        <p class="detail-note">${esc(t.shareReviewLead)}</p>
        <button type="button" class="home-share-btn detail-share-btn" id="detail-share-btn">${typeof SHARE_ICON !== "undefined" ? SHARE_ICON : ""}<span>${esc(t.shareReviewButton)}</span></button>
        <p class="detail-note detail-share-msg" id="detail-share-msg" role="status" hidden></p>
      </section>
    </article>`;

  // --- ① 画像(js/detail.js の setDetailHero) ---
  setDetailHero(shop);

  // --- ⑤ Google マップへのリンク(外部リンクだけ。Google の情報を取得・表示することは、しない) ---
  updateDetailLinks();

  bindBackLinks();
  bindDetailButtons();
  bindNearbySpots();
  bindBookmark();
  if (tipsState.shopId !== shop.id) startTips(shop.id); // 別のお店になったときだけ、読み込み直す(言語の切り替えでは、そのまま表示する)
  else renderTips();
  if (reviewState.shopId !== shop.id) startReviewCount(shop.id);
  else renderDetailStats();
  if (reviewsState.shopId !== shop.id) startReviews(shop.id);
  else renderReviews();
  if (checkinState.shopId !== shop.id) startCheckin(shop.id);
  else renderCheckin();
  if (photosState.shopId !== shop.id) startPhotos(shop.id);
  else renderPhotos();
  createDetailMap(shop);
  updateDistanceUI();
  checkGeoPermission(shop.id);
  detailView.scrollTop = keepScroll;
}

// ---------------------------------------------------------------------
// ブックマーク(店舗ページの名前の横)
//   ・「保存した店」(js/app.js の favorites)と同じもの。アカウントごとに保存する(ログインが必要)
//   ・保存したお店は、地図の画面の「♡ 保存した店」で一覧できる
// ---------------------------------------------------------------------
const BOOKMARK_TEXT = {
  ja: { add: "このお店を保存する", remove: "保存を外す", added: "保存しました。地図の「♡ 保存した店」から見られます", removed: "保存を外しました" },
  en: { add: "Save this shop", remove: "Remove from saved", added: "Saved. You can find it under ‘♥ Favorites only’ on the map", removed: "Removed from saved" },
  vi: { add: "Lưu quán này", remove: "Bỏ lưu", added: "Đã lưu. Xem trong mục ‘♥ Chỉ hiện quán yêu thích’ trên bản đồ", removed: "Đã bỏ lưu" },
};
const BOOKMARK_ICON_OFF =
  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M6 3h12v18l-6-4.5L6 21z"></path><path d="M12 7.5v5M9.5 10h5"></path></svg>';
const BOOKMARK_ICON_ON =
  '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M6 3h12v18l-6-4.5L6 21z"></path><path d="M9.3 10.2l1.9 1.9 3.5-3.7" fill="none" stroke="#ffffff"></path></svg>';
function bookmarkButtonHtml(shop) {
  const x = BOOKMARK_TEXT[currentLang] || BOOKMARK_TEXT.ja;
  const on = typeof isFavorite === "function" && isFavorite(shop);
  return (
    `<button type="button" class="detail-bookmark${on ? " is-on" : ""}" data-bookmark aria-pressed="${on}" ` +
    `aria-label="${esc(on ? x.remove : x.add)}" title="${esc(on ? x.remove : x.add)}">${on ? BOOKMARK_ICON_ON : BOOKMARK_ICON_OFF}</button>`
  );
}
let bookmarkToastTimer = null;
// 保存の状態が変わったとき(ログイン・ログアウトなど)に、店舗ページの保存マークを合わせる
function refreshDetailBookmark() {
  const btn = detailPage && detailPage.querySelector("[data-bookmark]");
  const entry = entries.find((e) => e.shop.id === currentShopId);
  if (!btn || !entry) return;
  const x = BOOKMARK_TEXT[currentLang] || BOOKMARK_TEXT.ja;
  const on = isFavorite(entry.shop);
  btn.classList.toggle("is-on", on);
  btn.setAttribute("aria-pressed", String(on));
  btn.setAttribute("aria-label", on ? x.remove : x.add);
  btn.title = on ? x.remove : x.add;
  btn.innerHTML = on ? BOOKMARK_ICON_ON : BOOKMARK_ICON_OFF;
}
function bindBookmark() {
  const btn = detailPage.querySelector("[data-bookmark]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const entry = entries.find((e) => e.shop.id === currentShopId);
    if (!entry || typeof toggleFavorite !== "function") return;
    if (!toggleFavorite(entry)) return; // ログインしていないときは、ログインの画面が出る
    const x = BOOKMARK_TEXT[currentLang] || BOOKMARK_TEXT.ja;
    const on = isFavorite(entry.shop);
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? x.remove : x.add);
    btn.title = on ? x.remove : x.add;
    btn.innerHTML = on ? BOOKMARK_ICON_ON : BOOKMARK_ICON_OFF;
    const toast = detailPage.querySelector("#detail-bookmark-toast");
    if (toast) {
      toast.textContent = on ? x.added : x.removed;
      toast.classList.add("is-show");
      clearTimeout(bookmarkToastTimer);
      bookmarkToastTimer = setTimeout(() => toast.classList.remove("is-show"), 3000);
    }
  });
}

// ---------------------------------------------------------------------
// 近くのスポット(店舗ページ)
//   ・このお店と同じ種類(競合)は出さず、ほかの2つの種類(料理店・カフェ・食材店のうち2つ)を出す
//   ・地図に載っているお店のうち、直線距離で 5km 以内のものを、近い順に。種類ごとに3件(「もっと見る」で全部)
//   ・距離は、お店どうしの直線距離(道のりではない)
// ---------------------------------------------------------------------
const NEARBY_KM = 5;
const NEARBY_SHOW = 3;
const NEARBY_TEXT = {
  ja: { title: "近くのスポット", note: `直線距離で${NEARBY_KM}km以内`, more: (n) => `すべて見る(${n}件)`, less: "閉じる", none: `${NEARBY_KM}km以内にはありません` },
  en: { title: "Nearby spots", note: `Within ${NEARBY_KM} km in a straight line`, more: (n) => `See all (${n})`, less: "Show less", none: `None within ${NEARBY_KM} km` },
  vi: { title: "Địa điểm gần đây", note: `Trong vòng ${NEARBY_KM} km (đường chim bay)`, more: (n) => `Xem tất cả (${n})`, less: "Thu gọn", none: `Không có trong vòng ${NEARBY_KM} km` },
};
const nearbyOpen = new Set(); // 「もっと見る」を開いている種類(このページを開いている間だけ)
let nearbyShopId = null;
function nearbyDistanceText(km) {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)}m`;
  return `${km.toFixed(1)}km`;
}
function nearbySpotsHtml(shop) {
  if (typeof shopType !== "function" || !Number.isFinite(shop.lat) || !Number.isFinite(shop.lng)) return "";
  if (nearbyShopId !== shop.id) {
    nearbyShopId = shop.id;
    nearbyOpen.clear();
  }
  const x = NEARBY_TEXT[currentLang] || NEARBY_TEXT.ja;
  const labels = typeof homeText === "function" ? homeText().typeLabel : {};
  const myType = shopType(shop);
  const types = ["restaurant", "cafe", "grocery"].filter((t) => t !== myType);
  const groups = types.map((type) => {
    const list = entries
      .filter((e) => e.shop.id !== shop.id && shopType(e.shop) === type && Number.isFinite(e.shop.lat) && Number.isFinite(e.shop.lng))
      .map((e) => ({ e, km: distanceKm(shop.lat, shop.lng, e.shop.lat, e.shop.lng) }))
      .filter((v) => v.km <= NEARBY_KM)
      .sort((a, b) => a.km - b.km);
    const open = nearbyOpen.has(type);
    const shown = open ? list : list.slice(0, NEARBY_SHOW);
    return (
      `<div class="nearby-group">` +
      `<h4 class="nearby-type">${typeof homeIcon === "function" ? homeIcon(type, 20) : ""}<span>${esc(labels[type] || type)}</span></h4>` +
      (list.length
        ? `<ul class="nearby-list">${shown
            .map(
              (v) =>
                `<li><a class="nearby-item" href="${esc(shopUrl(v.e.shop.id))}" data-nearby-shop="${esc(v.e.shop.id)}">` +
                `<span class="nearby-name">${esc(pick(v.e.shop.name))}</span>` +
                `<span class="nearby-km">${esc(nearbyDistanceText(v.km))}</span></a></li>`
            )
            .join("")}</ul>` +
          (list.length > NEARBY_SHOW
            ? `<button type="button" class="nearby-more" data-nearby-more="${type}" aria-expanded="${open}">${esc(open ? x.less : x.more(list.length))}${typeof homeIcon === "function" ? homeIcon(open ? "back" : "forward", 16) : ""}</button>`
            : "")
        : `<p class="nearby-none">${esc(x.none)}</p>`) +
      `</div>`
    );
  });
  return (
    `<section class="detail-section" id="detail-nearby">` +
    `<h3>${esc(x.title)}</h3><p class="nearby-note">${esc(x.note)}</p>` +
    groups.join("") +
    `</section>`
  );
}
function bindNearbySpots() {
  const section = detailPage.querySelector("#detail-nearby");
  if (!section) return;
  section.addEventListener("click", (event) => {
    const more = event.target.closest("[data-nearby-more]");
    if (more) {
      const type = more.dataset.nearbyMore;
      if (nearbyOpen.has(type)) nearbyOpen.delete(type);
      else nearbyOpen.add(type);
      const shop = entries.find((e) => e.shop.id === currentShopId);
      if (shop) {
        const wrap = document.createElement("div");
        wrap.innerHTML = nearbySpotsHtml(shop.shop);
        section.replaceWith(wrap.firstElementChild);
        bindNearbySpots();
        const again = detailPage.querySelector(`[data-nearby-more="${type}"]`);
        if (again) again.focus({ preventScroll: true });
      }
      return;
    }
    const link = event.target.closest("[data-nearby-shop]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(shopUrl(link.dataset.nearbyShop));
    detailView.scrollTop = 0;
  });
}

// 「← 一覧に戻る」: 普通のリンクとしても動く(新しいタブで開いたときなど)が、通常は、ページを移動せずに切り替える
//   ・detailPage(店舗詳細)・contentPageEl(利用規約などの固定ページ)の、どちらでも使う共通の部品
function bindBackLinksIn(container) {
  container.querySelectorAll(".detail-back").forEach((link) =>
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; // 新しいタブで開く操作は、そのまま
      event.preventDefault();
      goToList();
    })
  );
}

function bindBackLinks() {
  bindBackLinksIn(detailPage);
}

// ---------------------------------------------------------------------
// 固定ページ(利用規約・プライバシーポリシー・運営者情報)
// ---------------------------------------------------------------------
//   ・中身(タイトル・各項目の見出し/本文/箇条書き)は、すべて js/i18n.js の
//     termsSections / privacySections / aboutSections にある(3言語ぶん)。ここでは、それを並べて表示するだけ。
//   ・どのページも、見た目・しくみは共通(CONTENT_PAGES で、使う文言のキーだけを出し分けている)。

// 1つの項目(見出し + 本文 + 箇条書き)のHTML。本文は、section.link があれば、メール宛先などへのリンクにする
function renderContentSectionHtml(section) {
  // 箇条書きの中の「https://〜」は、リンクにする
  const linkify = (text) => esc(text).replace(/https:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  const para = (text) => `<p>${linkify(text)}</p>`;
  const bodyHtml = !section.body
    ? ""
    : section.link
    ? `<p><a href="${esc(section.link)}">${esc(section.body)}</a></p>`
    : `<p>${esc(section.body)}</p>`;
  const parasHtml = (section.paras || []).map(para).join("");
  // 箇条書き: 文字だけ、または { label(太字), text }
  const listHtml = section.list
    ? `<ul class="terms-list">${section.list
        .map((item) => (typeof item === "string" ? `<li>${linkify(item)}</li>` : `<li><strong>${esc(item.label)}</strong>${linkify(item.text)}</li>`))
        .join("")}</ul>`
    : "";
  const afterHtml = (section.after || []).map(para).join("");
  // 小見出し(「2-1. ログイン情報」など)
  const subsHtml = (section.subs || [])
    .map((sub) => `<section class="terms-sub"><h4>${esc(sub.title)}</h4>${(sub.paras || []).map(para).join("")}</section>`)
    .join("");
  return `<section class="terms-section"><h3>${esc(section.title)}</h3>${bodyHtml}${parasHtml}${listHtml}${afterHtml}${subsHtml}</section>`;
}

function renderContentPage() {
  const t = ui[currentLang];
  const meta = CONTENT_PAGES[currentContentPage];
  if (!meta) return; // 直接は起こらないはず(routeFromLocation が、事前に絞っているため)

  const sectionsHtml = (t[meta.sectionsKey] || []).map(renderContentSectionHtml).join("");

  contentPageEl.innerHTML = `
    <a class="btn detail-back" href="${esc(listUrl())}">${esc(t.detailBack)}</a>
    <article>
      <h2 class="terms-title">${esc(t[meta.titleKey])}</h2>
      <p class="terms-intro">${esc(t[meta.introKey])}</p>
      ${sectionsHtml}
    </article>`;

  bindBackLinksIn(contentPageEl);
}

// 「あなたのレビューをシェアしよう」のボタン
//   ・自分のレビューがあれば、その評価とコメントも、共有する文に入れる(無ければ、お店の名前とリンクだけ)
//   ・スマホなどは端末の共有画面。使えないとき(多くのパソコン)は、共有する文をコピーする
function bindDetailButtons() {
  const btn = detailPage.querySelector("#detail-share-btn");
  if (!btn) return;
  btn.addEventListener("click", () => shareShopReview(btn));
}
async function shareShopReview(btn) {
  const t = ui[currentLang];
  const entry = entries.find((e) => e.shop.id === currentShopId);
  if (!entry) return;
  const name = pick(entry.shop.name);
  const url = location.origin + shopUrl(entry.shop.id);
  const myUid = authUser && authUser.uid;
  const mine = myUid && reviewsState && reviewsState.shopId === entry.shop.id ? reviewsState.reviews.find((r) => r.id === myUid && !r.hidden) : null;
  const stars = mine ? "★".repeat(Math.max(0, Math.min(5, Number(mine.rating) || 0))) : "";
  const text = mine
    ? `${name} ${stars}${mine.comment ? "\n" + mine.comment : ""}\n#ベトナムフーディー`
    : t.shareReviewText(name);
  const msg = detailPage.querySelector("#detail-share-msg");
  const say = (m) => {
    if (!msg) return;
    msg.textContent = m;
    msg.hidden = false;
    setTimeout(() => (msg.hidden = true), 3500);
  };
  if (navigator.share) {
    try {
      await navigator.share({ title: name, text, url });
    } catch (e) {
      // 共有画面を閉じただけのときは、何もしない
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    say(t.shareReviewCopied);
  } catch (e) {
    say(url);
  }
}

// ---------------------------------------------------------------------
// ⑤ 詳細ページの地図
// ---------------------------------------------------------------------

function createDetailMap(shop) {
  detailMap = L.map("detail-map", {
    maxZoom: 19, // いちばん拡大できる段階(js/app.js の一覧の地図と同じ)
    scrollWheelZoom: false, // 画面をスクロールしているときに、地図が拡大されてしまわないように
    dragging: !L.Browser.mobile, // スマホでは、地図の上で指を動かしても、画面がスクロールできるように
  }).setView([shop.lat, shop.lng], 16);
  createBaseLayer().addTo(detailMap); // 一覧の地図と、同じ背景
  L.marker([shop.lat, shop.lng], { icon: createShopIcon(shop) }).addTo(detailMap);
  refreshDetailMap();
  setTimeout(() => detailMap && detailMap.invalidateSize(), 0);
}

// 現在地が分かっているときは、現在地の目印も出して、お店と両方が見えるようにする
function refreshDetailMap() {
  if (!detailMap) return;
  const entry = entries.find((e) => e.shop.id === currentShopId);
  if (!entry) return;
  if (detailUserMarker) detailMap.removeLayer(detailUserMarker);
  detailUserMarker = null;
  const o = getDetailOrigin();
  if (!o) return;
  detailUserMarker = L.marker([o.lat, o.lng], {
    icon: L.divIcon({ className: "user-location", html: '<span class="user-dot"></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
    interactive: false,
    keyboard: false,
  }).addTo(detailMap);
  detailMap.fitBounds([[entry.shop.lat, entry.shop.lng], [o.lat, o.lng]], { padding: [40, 40], maxZoom: 16 });
}

// ---------------------------------------------------------------------
// ④ 現在地からの距離
// ---------------------------------------------------------------------
//   ・位置情報を使ってよい状態(すでに許可されている、または、現在地周辺で使った)のときだけ、距離を出す
//   ・許可されていないときは、距離を無理に出さない(勝手に、許可のダイアログも出さない)
//   ・許可のダイアログは、ユーザーが「現在地からの距離を表示」を押したときだけ出る
//   ・取得した位置は、メモリ上だけで使い、保存しない(ページを再読み込みすると消える)

function updateDistanceUI() {
  const box = detailPage.querySelector("#detail-distance");
  const entry = entries.find((e) => e.shop.id === currentShopId);
  if (!box || !entry) return;
  const t = ui[currentLang];
  box.replaceChildren();

  const origin = getDetailOrigin();
  if (origin) {
    const km = distanceKm(origin.lat, origin.lng, entry.shop.lat, entry.shop.lng);
    const text = (origin.kind === "picked" ? t.distanceFromStart : t.distanceFromHere)(formatDistance(km));
    box.innerHTML = `<p class="detail-distance-text">📍 ${text} <span class="muted">${esc(t.straightLine)}</span></p>`;
    return;
  }
  if (distanceState === "loading") {
    box.innerHTML = `<p class="detail-note">${esc(t.distanceLoading)}</p>`;
    return;
  }
  if (geoPermission === "denied" || !navigator.geolocation) return; // 許可されていないので、距離は出さない
  box.innerHTML =
    `<button type="button" class="btn btn-small" id="distance-btn">${esc(t.distanceButton)}</button>` +
    `<p class="location-note">${esc(t.nearbyNote)}</p>` + // 許可を求める前に、利用目的を伝える
    (distanceState === "failed" ? `<p class="detail-note">${esc(t.distanceFailed)}</p>` : "");
  box.querySelector("#distance-btn").addEventListener("click", () => locateForDetail(true));
}

// 現在地を取得する(現在地周辺ボタンと、同じ仕組み・同じ設定を使う)
function locateForDetail(userInitiated) {
  const id = currentShopId;
  if (!navigator.geolocation) return;
  distanceState = "loading";
  updateDistanceUI();
  requestCurrentPosition(
    (position) => {
      detailGps = { lat: position.coords.latitude, lng: position.coords.longitude, kind: "gps" };
      distanceState = "idle";
      if (currentShopId !== id) return; // 取得している間に、別のページへ移動していた
      updateDistanceUI();
      refreshDetailMap();
      updateDetailLinks(); // ルートのリンクに、出発地(現在地)を入れる
    },
    (error) => {
      console.warn("現在地の取得に失敗:", error.code, error.message);
      distanceState = userInitiated ? "failed" : "idle";
      if (currentShopId === id) updateDistanceUI();
    }
  );
}

// すでに位置情報が許可されているなら、ボタンを押さなくても、距離を出す(許可されていなければ、何もしない)
function checkGeoPermission(id) {
  if (!navigator.permissions || !navigator.permissions.query) return;
  navigator.permissions
    .query({ name: "geolocation" })
    .then((status) => {
      geoPermission = status.state;
      if (currentShopId !== id) return;
      if (status.state === "granted" && !getDetailOrigin() && distanceState !== "loading") locateForDetail(false);
      else updateDistanceUI();
    })
    .catch(() => {});
}

// ---------------------------------------------------------------------
// ログインを、必要になったときだけ求める(Tips・Check-in で共通)
// ---------------------------------------------------------------------
//   ・選択肢を選ぶ・チェックインを押すことは、ログインしていなくてもできる。
//     Firestore への送信(送信ボタン・チェックインボタンを押したとき)になって、はじめてログインを求める。
//   ・ログインできたら、そのまま選んでいた内容で送信する(選び直さなくてよい)。
//   ・ポップアップを閉じただけなど(auth.js の authErrorKey が null を返すもの)は、エラーにしない。
//     選んでいた内容は、そのまま画面に残るので、もう一度、送信ボタンを押せば、また同じ流れになる。

// authUser が分かるまで待ってから、そのときの authUser(null の場合もある)を返す
function waitForAuthUser() {
  if (authUser !== undefined) return Promise.resolve(authUser);
  if (authApiStatus === "failed") return Promise.resolve(null); // auth.js の読み込みに失敗(未ログイン扱い)
  return new Promise((resolve) => {
    window.addEventListener("auth-settled", () => resolve(authUser === undefined ? null : authUser), { once: true });
  });
}

// ログインのモーダル(js/auth-modal.js)を開く。戻り値: true = ログインできた / false = 閉じただけ(エラーにしない)
//   ・モーダルの中で、Google・メールアドレス、どちらでログインしても、同じように続き(送信)が進む。
//     エラーの表示は、モーダル自身が行うので、ここでは投げ直さない(モーダルが開けないときだけ、投げる)
async function ensureSignedIn() {
  if (typeof window.requestSignIn !== "function") {
    const error = new Error("auth modal not available");
    error.messageKey = "authUnavailable";
    throw error;
  }
  return window.requestSignIn();
}

// ---------------------------------------------------------------------
// 💡 このお店のTips(Firebase Firestore)
// ---------------------------------------------------------------------
//   ・選択肢は i18n.js の tipOptions(料理店)/ groceryTipOptions(食材店)。tipOptionsFor(店舗ID) で選ぶ。Firestore との通信は index.html の window.tipsApi
//   ・保存先: shops/{店舗ID}/tips/counts(集計。フィールド名 = Tipsのキー、値 = 選んだ人数)
//             shops/{店舗ID}/tipVotes/{ユーザーID}(そのユーザーの投稿記録)
//   ・選択肢を選ぶところまでは、ログインしていなくてもできる。送信ボタンを押したときに、はじめてログインを求める
//     (ensureSignedIn。ログインできたら、選んでいた内容を、そのまま送信する)
//   ・1人につき、お店ごとに1回だけ投稿できる(ルールは firestore.rules。ここでは、投稿済みなら、追加ボタンを出さない)
//   ・通信に失敗しても(オフラインなど)、画面は壊さず、「Tipsを読み込めませんでした」と出す

const TIPS_API_WAIT_MS = 8000; // Firebase の準備を待つ長さ

// 1つのお店の、Tips の表示の状態
function createTipsState(shopId) {
  return {
    shopId,
    status: "loading", // "loading" | "ready" | "error"
    counts: {}, // { キー: 人数 }
    formOpen: false,
    selected: new Set(), // フォームで選んでいるキー(言語を切り替えて描き直しても、残す)
    sending: false,
    message: null, // { key: 文言のキー, error: true/false }
    // ログイン中のユーザーが、このお店に投稿済みのTips
    myUid: null, // 調べたユーザーのID
    myStatus: "idle", // "idle"(未ログイン) | "loading" | "ready" | "error"
    myTips: null, // 投稿済みなら、選んだキーの配列。まだなら null
    deleting: false, // 自分の投稿を削除している間、trueにする(ボタンを連続で押せなくする)
    // 【管理者だけ】投稿(1人ずつの記録)の一覧。非表示・元に戻すの操作に使う
    adminStatus: "idle", // "idle"(管理者ではない) | "loading" | "ready" | "error"
    adminVotes: [], // [{ id(ユーザーID), tips, hidden, ... }]
    adminBusy: new Set(), // いま非表示・元に戻すの通信中の、投稿のユーザーID
    adminMessage: null, // { key: 文言のキー, error: true/false }
  };
}

let tipsState = createTipsState(null);

// Firebase の準備ができたら api を返す(読み込みに失敗したとき、待ちすぎたときは、失敗にする)
function getTipsApi() {
  if (window.tipsApi) return Promise.resolve(window.tipsApi);
  if (window.tipsApiFailed) return Promise.reject(new Error("tips api failed"));
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("tips-api-ready", onReady);
      window.removeEventListener("tips-api-failed", onFailed);
    };
    const onReady = () => {
      cleanup();
      resolve(window.tipsApi);
    };
    const onFailed = () => {
      cleanup();
      reject(new Error("tips api failed"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("tips api timeout"));
    }, TIPS_API_WAIT_MS);
    window.addEventListener("tips-api-ready", onReady);
    window.addEventListener("tips-api-failed", onFailed);
  });
}

// Firestore から来た値を、「選択肢にあるキーの、1以上の整数」だけにする(0人・知らないキー・変な値は、捨てる)
function cleanTipCounts(data) {
  const counts = {};
  allTipOptions.forEach(({ key }) => {
    const n = Number(data && data[key]);
    if (Number.isFinite(n) && n >= 1) counts[key] = Math.floor(n);
  });
  return counts;
}

function startTips(shopId) {
  tipsState = createTipsState(shopId);
  loadTips(tipsState);
  if (authUser !== undefined) loadMyTips(tipsState); // ログイン状態がまだ分からないときは、分かったとき(auth-changed)に調べる
  if (authUser && isAdminUser(authUser)) loadAdminVotes(tipsState); // 管理者なら、投稿一覧も読み込む
}

// 【管理者だけ】そのお店の Tips の投稿(1人ずつの記録)を、すべて読み込む
function loadAdminVotes(state) {
  if (!authUser || !isAdminUser(authUser)) return;
  state.adminStatus = "loading";
  renderTips();
  getTipsApi()
    .then((api) => api.fetchVotes(state.shopId))
    .then((votes) => {
      state.adminVotes = Array.isArray(votes) ? votes : [];
      state.adminStatus = "ready";
    })
    .catch((error) => {
      console.warn("Tips投稿一覧の読み込みに失敗:", error);
      state.adminStatus = "error";
    })
    .then(() => {
      if (tipsState === state) renderTips();
    });
}

// 【管理者だけ】1件の投稿を、非表示にする / 元に戻す
function adminToggleVoteHidden(state, vote) {
  if (state.adminBusy.has(vote.id)) return;
  state.adminBusy.add(vote.id);
  state.adminMessage = null;
  renderTips();
  const nextHidden = !vote.hidden;
  getTipsApi()
    .then((api) => api.setVoteHidden(state.shopId, vote.id, nextHidden, vote.tips))
    .then(() => {
      loadTips(state); // 集計(人数)を読み込み直す
      loadAdminVotes(state); // 投稿一覧を読み込み直す
    })
    .catch((error) => {
      console.warn("Tips投稿の非表示切り替えに失敗:", error);
      state.adminMessage = { key: "adminUpdateError", error: true };
    })
    .then(() => {
      state.adminBusy.delete(vote.id);
      if (tipsState === state) renderTips();
    });
}

// ログイン中のユーザーが、このお店に投稿済みかを調べる(未ログインなら、調べない)
function loadMyTips(state) {
  const user = authUser || null;
  state.myUid = user ? user.uid : null;
  state.myTips = null;
  if (!user) {
    state.myStatus = "idle";
    if (tipsState === state) renderTips();
    return;
  }
  state.myStatus = "loading";
  renderTips();
  getTipsApi()
    .then((api) => api.fetchMyVote(state.shopId))
    .then((tips) => {
      if (state.myUid !== user.uid) return; // 調べている間に、別のユーザーになっていた
      state.myTips = tips;
      state.myStatus = "ready";
    })
    .catch((error) => {
      console.warn("Tips の投稿状況の確認に失敗:", error);
      if (state.myUid === user.uid) state.myStatus = "error";
    })
    .then(() => {
      if (tipsState === state) renderTips();
    });
}

// ログイン・ログアウトしたら、開いているお店の Tips の状態を、そのユーザーのものに合わせる
//   ・送信中(送信ボタンを押したあとのログインの操作も含む)は、何もしない。submitTips 側が、続きをすべて行う
window.addEventListener("auth-changed", () => {
  if (tipsState.shopId === null || tipsState.sending) return;
  tipsState.formOpen = false;
  tipsState.selected = new Set();
  tipsState.message = null;
  loadMyTips(tipsState);
  if (authUser && isAdminUser(authUser)) {
    loadAdminVotes(tipsState);
  } else {
    tipsState.adminStatus = "idle";
    tipsState.adminVotes = [];
    renderTips();
  }
});

// ログイン・ログアウトしたら、開いているお店の Check-in の状態を、そのユーザーのものに合わせる(同じ考え方)
window.addEventListener("auth-changed", () => {
  if (checkinState.shopId === null || checkinState.sending) return;
  checkinState.message = null;
  loadMyCheckin(checkinState);
  if (authUser && isAdminUser(authUser)) {
    loadAdminCheckins(checkinState);
  } else {
    checkinState.adminStatus = "idle";
    checkinState.adminCheckins = [];
    renderCheckin();
  }
});

function loadTips(state) {
  state.status = "loading";
  renderTips();
  getTipsApi()
    .then((api) => api.fetchCounts(state.shopId))
    .then((data) => {
      state.counts = cleanTipCounts(data);
      state.status = "ready";
    })
    .catch((error) => {
      console.warn("Tips の読み込みに失敗:", error);
      state.status = "error";
    })
    .then(() => {
      if (tipsState === state) renderTips(); // 読み込んでいる間に別のお店へ移っていたら、何もしない
    });
}

function renderTips() {
  renderDetailStats(); // Tips の状態が変わるたびに、件数エリアの Tips 件数も合わせる
  const box = detailPage.querySelector("#tips-body");
  if (!box) return;
  const t = ui[currentLang];
  const state = tipsState;

  if (state.status === "loading") {
    box.innerHTML = `<p class="detail-note">${esc(t.tipsLoading)}</p>`;
    return;
  }
  if (state.status === "error") {
    box.innerHTML =
      `<p class="tips-error" role="alert">⚠️ ${esc(t.tipsLoadError)}</p>` +
      `<button type="button" class="btn btn-small" id="tips-retry">${esc(t.tipsRetry)}</button>`;
    box.querySelector("#tips-retry").addEventListener("click", () => loadTips(state));
    return;
  }

  // 多い順に(同じ人数のときは、選択肢の順)。まだ誰も選んでいないTipsは出さない
  const options = tipOptionsFor(state.shopId); // 料理店か食材店かで、選択肢が変わる
  const ranked = options.filter((o) => state.counts[o.key] > 0).sort((a, b) => state.counts[b.key] - state.counts[a.key]);
  const mine = new Set(Array.isArray(state.myTips) ? state.myTips : []); // 自分が選んだTipsには、印を付ける
  const listHtml = ranked.length
    ? `<ul class="tips-list">${ranked
        .map(
          (o) =>
            `<li class="tips-item"><span class="tips-label">${o.icon} ${esc(pick(o.label))}` +
            (mine.has(o.key) ? ` <span class="tips-mine" title="${esc(t.tipsMine)}" aria-label="${esc(t.tipsMine)}">✓</span>` : "") +
            `</span><span class="tips-count">${esc(t.tipsPeople(state.counts[o.key]))}</span></li>`
        )
        .join("")}</ul>`
    : `<p class="detail-placeholder">${esc(t.tipsEmpty)}</p>`;

  const formHtml = state.formOpen
    ? `<form class="report-panel tips-form" id="tips-form">
         <fieldset ${state.sending ? "disabled" : ""}>
           <legend>${esc(t.tipsFormTitle)}</legend>
           ${options
             .map(
               (o) =>
                 `<label class="report-option"><input type="checkbox" name="tip" value="${o.key}" ${state.selected.has(o.key) ? "checked" : ""}> <span>${o.icon} ${esc(pick(o.label))}</span></label>`
             )
             .join("")}
         </fieldset>
         <div class="report-actions">
           <button type="submit" class="btn btn-primary" ${state.sending ? "disabled" : ""}>${esc(state.sending ? t.tipsSending : t.tipsSubmit)}</button>
           <button type="button" class="btn" id="tips-close" ${state.sending ? "disabled" : ""}>${esc(t.tipsClose)}</button>
         </div>
       </form>`
    : "";
  const messageHtml = state.message && !state.formOpen
    ? `<p class="detail-note tips-message${state.message.error ? " is-error" : ""}" role="status">${esc(t[state.message.key])}</p>`
    : "";

  // 追加のところ: ログイン中で、投稿済みかどうかが分かっているときだけ、その結果で出し分ける。
  //   それ以外(未ログイン・ログイン状態を確認中)は、選択肢とボタンを、いつも出す(送信ボタンを押したときに、ログインを求める)
  let actionHtml;
  if (authUser && state.myStatus === "error") {
    actionHtml =
      `<p class="tips-error" role="alert">⚠️ ${esc(t.tipsMineError)}</p>` +
      `<button type="button" class="btn btn-small" id="tips-mine-retry">${esc(t.tipsRetry)}</button>`;
  } else if (authUser && state.myStatus === "loading") {
    actionHtml = `<p class="detail-note">${esc(t.tipsChecking)}</p>`;
  } else if (authUser && state.myStatus === "ready" && state.myTips) {
    // 投稿済み: 追加ボタンの代わりに、削除ボタンを出す(削除すると、また投稿できる状態に戻る)
    actionHtml =
      `<p class="detail-note tips-posted">✅ ${esc(t.tipsPosted)}</p>` +
      `<button type="button" class="btn btn-small btn-warn" id="tips-delete" ${state.deleting ? "disabled" : ""}>${esc(
        state.deleting ? t.deleting : t.deleteButton
      )}</button>`;
  } else {
    actionHtml =
      `<button type="button" class="btn btn-primary" id="tips-open" aria-expanded="${state.formOpen}" aria-controls="tips-form">💡 ${esc(t.tipsAdd)}</button>` +
      formHtml;
  }

  const adminHtml = authUser && isAdminUser(authUser) ? renderAdminVotesHtml(state, t) : "";

  box.innerHTML = listHtml + actionHtml + messageHtml + adminHtml;

  const bind = (selector, handler) => {
    const el = box.querySelector(selector);
    if (el) el.addEventListener("click", handler);
  };
  bind("#tips-mine-retry", () => loadMyTips(state));
  bind("#tips-open", () => {
    state.formOpen = !state.formOpen;
    state.message = null;
    renderTips();
  });
  bind("#tips-delete", () => {
    if (!confirm(t.deleteConfirm)) return;
    deleteMyTips(state);
  });
  bind("#tips-admin-retry", () => loadAdminVotes(state));
  box.querySelectorAll(".admin-toggle-btn[data-uid]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const vote = state.adminVotes.find((v) => v.id === btn.dataset.uid);
      if (vote) adminToggleVoteHidden(state, vote);
    });
  });
  const form = box.querySelector("#tips-form");
  if (!form) return;
  form.addEventListener("change", (event) => {
    const input = event.target;
    if (input.name !== "tip") return;
    if (input.checked) state.selected.add(input.value);
    else state.selected.delete(input.value);
  });
  form.querySelector("#tips-close").addEventListener("click", () => {
    state.formOpen = false;
    renderTips();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // ページを移動しない
    submitTips(state);
  });
}

// 【管理者だけ】Tips の投稿一覧(非表示・元に戻すのボタン付き)のHTML
function renderAdminVotesHtml(state, t) {
  let bodyHtml;
  if (state.adminStatus === "loading") {
    bodyHtml = `<p class="detail-note">${esc(t.adminListLoading)}</p>`;
  } else if (state.adminStatus === "error") {
    bodyHtml =
      `<p class="tips-error" role="alert">⚠️ ${esc(t.adminListLoadError)}</p>` +
      `<button type="button" class="btn btn-small" id="tips-admin-retry">${esc(t.tipsRetry)}</button>`;
  } else if (!state.adminVotes.length) {
    bodyHtml = `<p class="detail-placeholder">${esc(t.adminListEmpty)}</p>`;
  } else {
    bodyHtml = `<ul class="admin-list">${state.adminVotes
      .map((v) => {
        const labels = (Array.isArray(v.tips) ? v.tips : [])
          .map((key) => tipOptionsFor(state.shopId).find((o) => o.key === key))
          .filter(Boolean)
          .map((o) => `${o.icon} ${esc(pick(o.label))}`)
          .join("、");
        const busy = state.adminBusy.has(v.id);
        return (
          `<li class="admin-item${v.hidden ? " is-hidden" : ""}">` +
          `<div class="admin-item-body"><span class="admin-item-id">${esc(t.adminPosterLabel(v.id.slice(0, 8)))}</span>` +
          (labels ? `<span class="admin-item-detail">${labels}</span>` : "") +
          (v.hidden ? `<span class="admin-hidden-badge">${esc(t.adminHiddenBadge)}</span>` : "") +
          `</div>` +
          `<button type="button" class="btn btn-small admin-toggle-btn" data-uid="${esc(v.id)}" ${busy ? "disabled" : ""}>` +
          esc(v.hidden ? t.adminRestore : t.adminHide) +
          `</button></li>`
        );
      })
      .join("")}</ul>`;
  }
  const messageHtml = state.adminMessage
    ? `<p class="detail-note tips-message${state.adminMessage.error ? " is-error" : ""}" role="status">${esc(t[state.adminMessage.key])}</p>`
    : "";
  return `<div class="admin-panel"><h4 class="admin-panel-title">${esc(t.adminTipsListTitle)}</h4>${bodyHtml}${messageHtml}</div>`;
}

// 選んだTipsを送る(送っている間は、ボタンを押せなくする)
//   ・まだログインしていなければ、ここで、はじめてログインを求める(ensureSignedIn)。
//     ログインできたら、いま選んでいる内容(keys)を、そのまま送信する。
//   ・ポップアップを閉じただけのときは、エラーにせず、選んだ内容を残したまま、送信中をやめる(もう一度、押せる)
async function submitTips(state) {
  if (state.sending) return;
  const keys = tipOptionsFor(state.shopId).map((o) => o.key).filter((key) => state.selected.has(key));
  if (keys.length === 0) {
    state.message = { key: "tipsNoneSelected", error: true };
    renderTips();
    return;
  }
  state.sending = true;
  state.message = null;
  renderTips();

  const user = await waitForAuthUser();
  if (!user) {
    try {
      const signedIn = await ensureSignedIn();
      if (!signedIn) {
        state.sending = false;
        if (tipsState === state) renderTips();
        return;
      }
    } catch (error) {
      console.warn("Tips送信前のログインに失敗:", error);
      state.sending = false;
      state.message = { key: error.messageKey || "authLoginError", error: true };
      if (tipsState === state) renderTips();
      return;
    }
  }

  doSubmitTips(state, keys);
}

function doSubmitTips(state, keys) {
  getTipsApi()
    .then((api) => api.addTips(state.shopId, keys))
    .then(() => {
      // 送れたら、画面の人数にも反映して、「投稿済み」にする(読み込み直さない。このお店には、もう追加できない)
      keys.forEach((key) => (state.counts[key] = (state.counts[key] || 0) + 1));
      state.myTips = keys;
      state.myStatus = "ready";
      state.selected = new Set();
      state.formOpen = false;
      state.message = { key: "tipsThanks", error: false };
    })
    .catch((error) => {
      console.warn("Tips の送信に失敗:", error && error.code, error);
      const code = error && error.code;
      if (code === "app/login-required") {
        state.message = { key: "tipsLoginNeeded", error: true };
      } else if (code === "permission-denied") {
        // すでに投稿済み(ほかのタブ・端末から投稿したなど)の可能性が高い。調べ直して、画面を合わせる
        state.message = { key: "tipsDenied", error: true };
        loadMyTips(state);
      } else {
        state.message = { key: "tipsSubmitError", error: true };
      }
    })
    .then(() => {
      state.sending = false;
      if (tipsState === state) renderTips();
    });
}

// 自分のTipsの投稿を削除する(押す前に、確認メッセージを出す)。削除すると、また投稿できる状態に戻る
function deleteMyTips(state) {
  if (state.deleting) return;
  state.deleting = true;
  state.message = null;
  renderTips();
  getTipsApi()
    .then((api) => api.deleteVote(state.shopId))
    .then(() => {
      state.myTips = null;
      state.myStatus = "ready"; // 投稿済みではない状態に戻す(追加ボタンが、また出るようになる)
      state.message = { key: "tipsDeleted", error: false };
      loadTips(state); // 集計(人数)を、Firestoreから読み込み直す
    })
    .catch((error) => {
      console.warn("Tipsの削除に失敗:", error);
      state.message = { key: "tipsDeleteError", error: true };
    })
    .then(() => {
      state.deleting = false;
      if (tipsState === state) renderTips();
    });
}

// ---------------------------------------------------------------------
// 📍 このお店にチェックイン(Firebase Firestore)
// ---------------------------------------------------------------------
//   ・Firestore との通信は、Tips と同じ index.html の window.checkinApi
//   ・保存先: shops/{店舗ID}/checkinCount/total(集計。フィールド count = チェックインした人数)
//             shops/{店舗ID}/checkins/{ユーザーID}(そのユーザーのチェックイン記録)
//   ・見るだけなら、ログインは要らない。チェックインには、ログインが必要
//   ・1人につき、お店ごとに1回だけできる(ルールは firestore.rules。ここでは、済んでいれば、ボタンを押せなくする)
//   ・成功したら、「Check In Success!」を表示して、Web Share API(対応していなければ、クリップボードへのコピー)を続けて行う

const CHECKIN_API_WAIT_MS = 8000; // Firebase の準備を待つ長さ

function createCheckinState(shopId) {
  return {
    shopId,
    status: "loading", // "loading" | "ready" | "error"(みんなの人数)
    count: 0,
    sending: false,
    message: null, // { key: 文言のキー, error: true/false }(チェックインの結果)
    shareMessage: null, // { key: 文言のキー, error: true/false }(共有・コピーの結果)
    // ログイン中のユーザーが、このお店にチェックイン済みか
    myUid: null,
    myStatus: "idle", // "idle"(未ログイン) | "loading" | "ready" | "error"
    mine: false,
    deleting: false, // 自分のチェックインを削除している間、trueにする(ボタンを連続で押せなくする)
    // 【管理者だけ】チェックイン記録の一覧。非表示・元に戻すの操作に使う
    adminStatus: "idle", // "idle"(管理者ではない) | "loading" | "ready" | "error"
    adminCheckins: [], // [{ id(ユーザーID), hidden, ... }]
    adminBusy: new Set(), // いま非表示・元に戻すの通信中の、記録のユーザーID
    adminMessage: null, // { key: 文言のキー, error: true/false }
  };
}

let checkinState = createCheckinState(null);

// Firebase の準備ができたら api を返す(getTipsApi と、同じ仕組み)
function getCheckinApi() {
  if (window.checkinApi) return Promise.resolve(window.checkinApi);
  if (window.checkinApiFailed) return Promise.reject(new Error("checkin api failed"));
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("checkin-api-ready", onReady);
      window.removeEventListener("checkin-api-failed", onFailed);
    };
    const onReady = () => {
      cleanup();
      resolve(window.checkinApi);
    };
    const onFailed = () => {
      cleanup();
      reject(new Error("checkin api failed"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("checkin api timeout"));
    }, CHECKIN_API_WAIT_MS);
    window.addEventListener("checkin-api-ready", onReady);
    window.addEventListener("checkin-api-failed", onFailed);
  });
}

function startCheckin(shopId) {
  checkinState = createCheckinState(shopId);
  loadCheckinCount(checkinState);
  if (authUser !== undefined) loadMyCheckin(checkinState); // ログイン状態がまだ分からないときは、分かったとき(auth-changed)に調べる
  if (authUser && isAdminUser(authUser)) loadAdminCheckins(checkinState); // 管理者なら、記録一覧も読み込む
}

// 【管理者だけ】そのお店のチェックイン記録を、すべて読み込む
function loadAdminCheckins(state) {
  if (!authUser || !isAdminUser(authUser)) return;
  state.adminStatus = "loading";
  renderCheckin();
  getCheckinApi()
    .then((api) => api.fetchCheckins(state.shopId))
    .then((checkins) => {
      state.adminCheckins = Array.isArray(checkins) ? checkins : [];
      state.adminStatus = "ready";
    })
    .catch((error) => {
      console.warn("チェックイン記録一覧の読み込みに失敗:", error);
      state.adminStatus = "error";
    })
    .then(() => {
      if (checkinState === state) renderCheckin();
    });
}

// 【管理者だけ】1件のチェックインを、非表示にする / 元に戻す
function adminToggleCheckinHidden(state, checkin) {
  if (state.adminBusy.has(checkin.id)) return;
  state.adminBusy.add(checkin.id);
  state.adminMessage = null;
  renderCheckin();
  const nextHidden = !checkin.hidden;
  getCheckinApi()
    .then((api) => api.setCheckinHidden(state.shopId, checkin.id, nextHidden))
    .then(() => {
      loadCheckinCount(state); // 合計人数を読み込み直す
      loadAdminCheckins(state); // 記録一覧を読み込み直す
    })
    .catch((error) => {
      console.warn("チェックインの非表示切り替えに失敗:", error);
      state.adminMessage = { key: "adminUpdateError", error: true };
    })
    .then(() => {
      state.adminBusy.delete(checkin.id);
      if (checkinState === state) renderCheckin();
    });
}

function loadCheckinCount(state) {
  state.status = "loading";
  renderCheckin();
  getCheckinApi()
    .then((api) => api.fetchCount(state.shopId))
    .then((count) => {
      state.count = count;
      state.status = "ready";
    })
    .catch((error) => {
      console.warn("チェックイン人数の読み込みに失敗:", error);
      state.status = "error";
    })
    .then(() => {
      if (checkinState === state) renderCheckin(); // 読み込んでいる間に別のお店へ移っていたら、何もしない
    });
}

// ログイン中のユーザーが、このお店にチェックイン済みかを調べる(未ログインなら、調べない)
function loadMyCheckin(state) {
  const user = authUser || null;
  state.myUid = user ? user.uid : null;
  state.mine = false;
  if (!user) {
    state.myStatus = "idle";
    if (checkinState === state) renderCheckin();
    return;
  }
  state.myStatus = "loading";
  renderCheckin();
  getCheckinApi()
    .then((api) => api.fetchMyCheckin(state.shopId))
    .then((mine) => {
      if (state.myUid !== user.uid) return; // 調べている間に、別のユーザーになっていた
      state.mine = mine;
      state.myStatus = "ready";
    })
    .catch((error) => {
      console.warn("チェックイン状況の確認に失敗:", error);
      if (state.myUid === user.uid) state.myStatus = "error";
    })
    .then(() => {
      if (checkinState === state) renderCheckin();
    });
}

function renderCheckin() {
  const box = detailPage.querySelector("#checkin-body");
  if (!box) return;
  const t = ui[currentLang];
  const state = checkinState;

  const statusHtml =
    state.status === "loading"
      ? `<p class="detail-note">${esc(t.tipsLoading)}</p>`
      : state.status === "error"
      ? `<p class="tips-error" role="alert">⚠️ ${esc(t.checkinLoadError)}</p>` +
        `<button type="button" class="btn btn-small" id="checkin-retry">${esc(t.tipsRetry)}</button>`
      : `<p class="checkin-status">📍 <strong>${esc(t.checkinStatus(state.count))}</strong></p>`;

  // ボタン・案内のところ: ログイン中で、チェックイン済みかどうかが分かっているときだけ、その結果で出し分ける。
  //   それ以外(未ログイン・ログイン状態を確認中)は、いつも押せるボタンを出す(押したときに、ログインを求める)
  let actionHtml;
  if (authUser && state.myStatus === "error") {
    actionHtml =
      `<p class="tips-error" role="alert">⚠️ ${esc(t.checkinMineError)}</p>` +
      `<button type="button" class="btn btn-small" id="checkin-mine-retry">${esc(t.tipsRetry)}</button>`;
  } else if (authUser && state.myStatus === "loading") {
    actionHtml = `<p class="detail-note">${esc(t.checkinChecking)}</p>`;
  } else if (authUser && state.myStatus === "ready" && state.mine) {
    // チェックイン済み: 取り消しボタンを出す(取り消すと、またチェックインできる状態に戻る)
    actionHtml =
      `<button type="button" class="btn btn-primary" id="checkin-btn" disabled>✅ ${esc(t.checkinDone)}</button>` +
      `<button type="button" class="btn btn-small btn-warn" id="checkin-delete" ${state.deleting ? "disabled" : ""}>${esc(
        state.deleting ? t.deleting : t.deleteButton
      )}</button>`;
  } else {
    actionHtml = `<button type="button" class="btn btn-primary" id="checkin-btn" ${state.sending ? "disabled" : ""}>${esc(
      state.sending ? t.checkinSending : `✅ ${t.checkinButton}`
    )}</button>`;
  }

  const noteHtml = (msg) =>
    msg ? `<p class="detail-note tips-message${msg.error ? " is-error" : ""}" role="status">${esc(t[msg.key])}</p>` : "";

  const adminHtml = authUser && isAdminUser(authUser) ? renderAdminCheckinsHtml(state, t) : "";

  box.innerHTML = statusHtml + actionHtml + noteHtml(state.message) + noteHtml(state.shareMessage) + adminHtml;

  const bind = (selector, handler) => {
    const el = box.querySelector(selector);
    if (el) el.addEventListener("click", handler);
  };
  bind("#checkin-retry", () => loadCheckinCount(state));
  bind("#checkin-mine-retry", () => loadMyCheckin(state));
  bind("#checkin-btn", () => submitCheckin(state));
  bind("#checkin-delete", () => {
    if (!confirm(t.deleteConfirm)) return;
    deleteMyCheckin(state);
  });
  bind("#checkin-admin-retry", () => loadAdminCheckins(state));
  box.querySelectorAll(".admin-toggle-btn[data-uid]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const checkin = state.adminCheckins.find((c) => c.id === btn.dataset.uid);
      if (checkin) adminToggleCheckinHidden(state, checkin);
    });
  });
}

// 【管理者だけ】チェックイン記録一覧(非表示・元に戻すのボタン付き)のHTML
function renderAdminCheckinsHtml(state, t) {
  let bodyHtml;
  if (state.adminStatus === "loading") {
    bodyHtml = `<p class="detail-note">${esc(t.adminListLoading)}</p>`;
  } else if (state.adminStatus === "error") {
    bodyHtml =
      `<p class="tips-error" role="alert">⚠️ ${esc(t.adminListLoadError)}</p>` +
      `<button type="button" class="btn btn-small" id="checkin-admin-retry">${esc(t.tipsRetry)}</button>`;
  } else if (!state.adminCheckins.length) {
    bodyHtml = `<p class="detail-placeholder">${esc(t.adminListEmpty)}</p>`;
  } else {
    bodyHtml = `<ul class="admin-list">${state.adminCheckins
      .map((c) => {
        const busy = state.adminBusy.has(c.id);
        return (
          `<li class="admin-item${c.hidden ? " is-hidden" : ""}">` +
          `<div class="admin-item-body"><span class="admin-item-id">${esc(t.adminPosterLabel(c.id.slice(0, 8)))}</span>` +
          (c.hidden ? `<span class="admin-hidden-badge">${esc(t.adminHiddenBadge)}</span>` : "") +
          `</div>` +
          `<button type="button" class="btn btn-small admin-toggle-btn" data-uid="${esc(c.id)}" ${busy ? "disabled" : ""}>` +
          esc(c.hidden ? t.adminRestore : t.adminHide) +
          `</button></li>`
        );
      })
      .join("")}</ul>`;
  }
  const messageHtml = state.adminMessage
    ? `<p class="detail-note tips-message${state.adminMessage.error ? " is-error" : ""}" role="status">${esc(t[state.adminMessage.key])}</p>`
    : "";
  return `<div class="admin-panel"><h4 class="admin-panel-title">${esc(t.adminCheckinListTitle)}</h4>${bodyHtml}${messageHtml}</div>`;
}

// チェックインする(送っている間は、ボタンを押せなくする)
//   ・まだログインしていなければ、ここで、はじめてログインを求める(ensureSignedIn。Tips の submitTips と、同じ考え方)
async function submitCheckin(state) {
  if (state.sending || state.mine) return;
  state.sending = true;
  state.message = null;
  state.shareMessage = null;
  renderCheckin();

  const user = await waitForAuthUser();
  if (!user) {
    try {
      const signedIn = await ensureSignedIn();
      if (!signedIn) {
        state.sending = false;
        if (checkinState === state) renderCheckin();
        return;
      }
    } catch (error) {
      console.warn("チェックイン前のログインに失敗:", error);
      state.sending = false;
      state.message = { key: error.messageKey || "authLoginError", error: true };
      if (checkinState === state) renderCheckin();
      return;
    }
  }

  doSubmitCheckin(state);
}

// プロフィールに出す「チェックインの数」を数え直す(失敗しても、チェックイン自体には影響しない)
function syncPublicCheckinCount() {
  if (window.profileApi && typeof window.profileApi.syncMyCheckinCount === "function") {
    window.profileApi.syncMyCheckinCount().catch((e) => console.warn("チェックイン数の更新に失敗:", e));
  }
}

function doSubmitCheckin(state) {
  getCheckinApi()
    .then((api) => api.checkIn(state.shopId))
    .then(() => {
      // 送れたら、画面の人数にも反映して、「チェックイン済み」にする(読み込み直さない。このお店には、もう一度はできない)
      state.count += 1;
      state.mine = true;
      state.message = { key: "checkinSuccess", error: false };
      state.sending = false;
      syncPublicCheckinCount(); // プロフィールに出すチェックインの数も、数え直す
      renderCheckin(); // 「Check In Success!」を、先に見せる(共有シートが閉じるまで、待たせないため)
      const entry = entries.find((e) => e.shop.id === state.shopId);
      if (entry) return shareCheckin(state, entry.shop); // 続けて、共有シート(または、コピー)を開く
    })
    .catch((error) => {
      console.warn("チェックインに失敗:", error && error.code, error);
      const code = error && error.code;
      if (code === "app/login-required") {
        state.message = { key: "checkinLoginNeeded", error: true };
      } else if (code === "permission-denied") {
        // すでにチェックイン済み(ほかのタブ・端末からなど)の可能性が高い。調べ直して、画面を合わせる
        state.message = { key: "checkinDenied", error: true };
        loadMyCheckin(state);
      } else {
        state.message = { key: "checkinSubmitError", error: true };
      }
      state.sending = false;
      if (checkinState === state) renderCheckin();
    });
}

// 自分のチェックインを取り消す(押す前に、確認メッセージを出す)。取り消すと、またチェックインできる状態に戻る
function deleteMyCheckin(state) {
  if (state.deleting) return;
  state.deleting = true;
  state.message = null;
  renderCheckin();
  getCheckinApi()
    .then((api) => api.deleteCheckin(state.shopId))
    .then(() => {
      state.mine = false;
      state.myStatus = "ready"; // チェックイン済みではない状態に戻す(ボタンが、また押せるようになる)
      state.message = { key: "checkinDeleted", error: false };
      syncPublicCheckinCount();
      loadCheckinCount(state); // 合計人数を、Firestoreから読み込み直す
    })
    .catch((error) => {
      console.warn("チェックインの取り消しに失敗:", error);
      state.message = { key: "checkinDeleteError", error: true };
    })
    .then(() => {
      state.deleting = false;
      if (checkinState === state) renderCheckin();
    });
}

// チェックインの成功後、共有シート(スマホの標準の共有)を開く。対応していない環境では、共有用の文字をコピーする
async function shareCheckin(state, shop) {
  const t = ui[currentLang];
  const name = pick(shop.name);
  const text = t.checkinShareText(name);
  const url = `${location.origin}${shopUrl(shop.id)}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: name, text, url });
      return; // 共有シートを、無事に開けた(送った・閉じたは、OS側の画面なので、ここでは分からない)
    } catch (error) {
      if (error && error.name === "AbortError") return; // 共有シートを、そのまま閉じただけ(エラーではない)
      console.warn("共有に失敗:", error);
      // 開けなかったときは、下のコピーに進む
    }
  }
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("no clipboard api");
    await navigator.clipboard.writeText(`${text} ${url}`);
    state.shareMessage = { key: "checkinShareCopied", error: false };
  } catch (error) {
    console.warn("共有用テキストのコピーに失敗:", error);
    state.shareMessage = { key: "checkinShareCopyError", error: true };
  }
  if (checkinState === state) renderCheckin();
}

// ---------------------------------------------------------------------
// 📷 みんなの写真(Firebase Firestore + Firebase Storage)
// ---------------------------------------------------------------------
//   ・Firestore との通信は、Tips・Check-in・レビューと同じ index.html の window.photosApi
//   ・画像ファイルは Firebase Storage、URL・投稿者・投稿日時・非表示フラグは Firestore に保存する
//     (保存先: shops/{店舗ID}/photos/{写真ID})
//   ・1人が投稿できる枚数に、制限は無い(Tips・Check-in・レビューと違い、1人1回ではない)
//   ・ファイルを選ぶところまでは、ログインしていなくてもできる。「投稿する」を押したときに、はじめてログインを求める
//     (ensureSignedIn。ログインできたら、選んでいた画像を、そのまま送信する。Tips・レビューと同じ考え方)
//   ・アップロード前に、ブラウザ側(canvas)で、長辺 1600px・JPEG に圧縮する(通信量を減らし、5MBの上限に収めるため)

const PHOTOS_API_WAIT_MS = 8000; // Firebase の準備を待つ長さ
const PHOTO_MAX_DIMENSION = 1600; // 圧縮後の、長辺の最大ピクセル数
const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 圧縮後の、1枚あたりの最大バイト数(5MB。Storageのルールと合わせる)
const PHOTO_JPEG_QUALITY_STEPS = [0.8, 0.6, 0.4]; // 大きすぎるときに、順番に下げていく圧縮率
const PHOTO_MAX_PER_POST = 5; // 1回の投稿で選べる写真の枚数
const PHOTO_DESCRIPTION_MAX = 200; // 説明文の、最大の文字数
// 「この写真を報告」ボタンを表示するか(false = 非表示。機能自体は、そのまま残っている。
//   また表示したくなったら、ここを true に戻すだけでよい)
const PHOTO_REPORT_BUTTON_VISIBLE = false;

// 1つのお店の、写真一覧・アップロードの状態
function createPhotosState(shopId) {
  return {
    shopId,
    status: "loading", // "loading" | "ready" | "error"
    photos: [], // [{ id, uid, secure_url, public_id, authorName, createdAt, hidden, description, category, reportCount, likeCount }]、新しい順
    formOpen: false, // 投稿フォーム(写真の枠・説明文・カテゴリーなど)を、展開しているか
    compressing: false, // 選んだ画像を、圧縮している間
    pending: [], // 圧縮済みで、アップロード待ちの画像(最大 PHOTO_MAX_PER_POST 枚)。[{ blob, url }]。url は画面に出すための一時URL
    sendProgress: null, // 送信中の進み具合 { done, total }
    description: "", // 説明文(任意。投稿フォームの入力中の文字)
    category: null, // 選んでいるカテゴリーのキー(任意。null = 未選択)
    consentTerms: false, // 投稿前の必須チェック(利用規約を確認し、投稿ルールに同意します)
    selectError: null, // ファイル選択・圧縮に失敗したときの、文言のキー
    sending: false, // アップロード中
    message: null, // { key: 文言のキー, error: true/false }
    deletingId: null, // 削除中の写真ID(自分の写真を削除しているとき)
    lightboxIndex: null, // 拡大表示中の写真の、一覧内での位置(null = 閉じている)
    // 誰でも使える、写真の報告(ログインは不要)
    reportFormPhotoId: null, // 報告フォームを開いている写真のID(nullなら、どれも開いていない)
    reportReason: "", // フォームで選んでいる理由のキー
    reportSending: false,
    reportMessage: null, // { key: 文言のキー, error: true/false }(報告フォームの中に出す)
    // 【管理者だけ】非表示・元に戻すの操作に使う
    adminBusy: new Set(), // いま非表示・元に戻すの通信中の、写真ID
    // 【管理者だけ】写真ごとの、報告理由の確認に使う
    adminReportsPhotoId: null, // 報告理由を表示中の写真のID(nullなら、どれも開いていない)
    adminReportsStatus: "idle", // "idle" | "loading" | "ready" | "error"
    adminReportsList: [], // [{ id, reason, createdAt }]
    // 誰でも使える、写真への「いいね」(1人1枚1回)
    myLikes: {}, // { 写真ID: true }(ログイン中のユーザーが、いいね済みの写真)
    likeBusy: new Set(), // いま、いいね/取り消しの通信中の、写真ID
    // 誰でも使える、写真へのコメント(1人が何度でも投稿できる)
    commentsByPhoto: {}, // { 写真ID: 1枚の写真ぶんのコメントの状態(createPhotoCommentsState) }
  };
}

// 1枚の写真ぶんの、コメントの状態(拡大表示のときだけ使う。開いたときに、読み込む)
function createPhotoCommentsState() {
  return {
    status: "idle", // "idle" | "loading" | "ready" | "error"
    list: [], // [{ id, uid, authorName, comment, createdAt, hidden }]、新しい順
    draftText: "", // 入力欄の、入力中の文字(作り直しても消えないように、ここに持っておく)
    sending: false,
    message: null, // { key: 文言のキー, error: true/false }
    deletingId: null, // 削除中のコメントID
    adminBusy: new Set(), // 【管理者だけ】非表示・元に戻すの通信中の、コメントID
  };
}

let photosState = createPhotosState(null);

// アップロード待ちの画像があれば、一時URLを解放する(お店を切り替えるときなどに呼ぶ。メモリリークを防ぐため)
function revokePendingPhotoPreview(state) {
  if (state && state.pending) state.pending.forEach((p) => URL.revokeObjectURL(p.url));
}

// Firebase の準備ができたら api を返す(getTipsApi と、同じ仕組み)
function getPhotosApi() {
  if (window.photosApi) return Promise.resolve(window.photosApi);
  if (window.photosApiFailed) return Promise.reject(new Error("photos api failed"));
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("photos-api-ready", onReady);
      window.removeEventListener("photos-api-failed", onFailed);
    };
    const onReady = () => {
      cleanup();
      resolve(window.photosApi);
    };
    const onFailed = () => {
      cleanup();
      reject(new Error("photos api failed"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("photos api timeout"));
    }, PHOTOS_API_WAIT_MS);
    window.addEventListener("photos-api-ready", onReady);
    window.addEventListener("photos-api-failed", onFailed);
  });
}

function startPhotos(shopId) {
  revokePendingPhotoPreview(photosState);
  photosState = createPhotosState(shopId);
  loadPhotos(photosState);
}

function loadPhotos(state) {
  state.status = "loading";
  renderPhotos();
  getPhotosApi()
    .then((api) => api.fetchPhotos(state.shopId))
    .then((photos) => {
      state.photos = Array.isArray(photos) ? photos : [];
      state.status = "ready";
      if (authUser) loadMyLikes(state); // ログイン中なら、続けて「どれに、いいね済みか」も取得する
      state.photos.forEach((photo) => loadPhotoComments(state, photo.id)); // グリッドにも出すので、全部読み込んでおく
    })
    .catch((error) => {
      console.warn("写真の読み込みに失敗:", error);
      state.status = "error";
    })
    .then(() => {
      if (photosState === state) renderPhotos();
    });
}

// ログイン中のユーザーが、いま表示している写真のうち、どれに「いいね」済みかを取得する
function loadMyLikes(state) {
  const photoIds = state.photos.map((p) => p.id);
  if (!photoIds.length) return;
  getPhotosApi()
    .then((api) => api.fetchMyLikes(state.shopId, photoIds))
    .then((likes) => {
      state.myLikes = likes || {};
    })
    .catch((error) => {
      console.warn("いいね状況の確認に失敗:", error);
    })
    .then(() => {
      if (photosState === state) renderPhotos();
    });
}

// ログイン・ログアウトしたら、自分の写真の削除ボタン・管理者の非表示ボタンの出し分けを、作り直す
//   ・写真の一覧そのものは、誰が見ても同じ公開データなので、読み込み直さない(renderPhotos だけでよい)
//   ・「いいね」の状況は、ユーザーによって違うので、ログインしているときだけ、あらためて取得する
window.addEventListener("auth-changed", () => {
  if (photosState.shopId === null) return;
  photosState.message = null;
  if (authUser) loadMyLikes(photosState);
  else {
    photosState.myLikes = {};
    renderPhotos();
  }
});

// 選んだファイルを、canvas でリサイズ・JPEG圧縮する(長辺 PHOTO_MAX_DIMENSION px、PHOTO_MAX_BYTES 以下になるまで、圧縮率を下げていく)
function compressPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      const longSide = Math.max(width, height);
      if (longSide > PHOTO_MAX_DIMENSION) {
        const scale = PHOTO_MAX_DIMENSION / longSide;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width || 1;
      canvas.height = height || 1;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      compressToSize(canvas, 0, resolve, reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image decode failed"));
    };
    img.src = objectUrl;
  });
}

// PHOTO_JPEG_QUALITY_STEPS の圧縮率を、大きい方から順に試す(それでも大きすぎれば、あきらめてエラーにする)
function compressToSize(canvas, stepIndex, resolve, reject) {
  const quality = PHOTO_JPEG_QUALITY_STEPS[stepIndex];
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        reject(new Error("toBlob failed"));
        return;
      }
      const isLastStep = stepIndex >= PHOTO_JPEG_QUALITY_STEPS.length - 1;
      if (blob.size <= PHOTO_MAX_BYTES) {
        resolve(blob);
      } else if (!isLastStep) {
        compressToSize(canvas, stepIndex + 1, resolve, reject);
      } else {
        reject(Object.assign(new Error("photo too large"), { code: "app/photo-too-large" }));
      }
    },
    "image/jpeg",
    quality
  );
}

// ファイルが選ばれたときの処理: 画像形式を確認してから、1枚ずつ圧縮して、投稿待ち(プレビュー)に加える
//   ・1回の投稿で選べるのは PHOTO_MAX_PER_POST 枚まで。それを超えた分は加えずに、お知らせを出す
async function handleSelectedPhotoFiles(state, files) {
  state.selectError = null;
  state.message = null;
  const room = PHOTO_MAX_PER_POST - state.pending.length;
  let list = [...files];
  if (list.some((f) => !f || !f.type || !f.type.startsWith("image/"))) {
    state.selectError = "photosFileTypeError";
    list = list.filter((f) => f && f.type && f.type.startsWith("image/"));
  }
  if (list.length > room) {
    state.selectError = "photosTooMany";
    list = list.slice(0, Math.max(0, room));
  }
  if (!list.length) {
    renderPhotos();
    return;
  }
  state.compressing = true;
  renderPhotos();
  for (const file of list) {
    try {
      const blob = await compressPhotoFile(file);
      if (photosState !== state) return; // ほかのお店に移ったら、やめる
      state.pending.push({ blob, url: URL.createObjectURL(blob) });
    } catch (error) {
      console.warn("画像の処理に失敗:", error);
      state.selectError = error && error.code === "app/photo-too-large" ? "photosFileTooLargeError" : "photosCompressError";
    }
  }
  // 説明文・カテゴリー・同意チェックは、そのまま残す(先に書いていた内容を、消さないため)
  state.compressing = false;
  if (photosState === state) renderPhotos();
}

// 選んでいた画像を、投稿フォームごと取り消す(✕ボタン・投稿できたあと、の両方で使う)
function clearPendingPhoto(state) {
  revokePendingPhotoPreview(state);
  state.pending = [];
  state.description = "";
  state.category = null;
  state.consentTerms = false;
}

// カテゴリーのキー(例: "dish")を、いまの言語の文言に変える(未知のキー・カテゴリー無しは、空文字)
function photoCategoryLabel(t, key) {
  const found = t.photosCategories.find((c) => c.key === key);
  return found ? found.label : "";
}

// 写真の投稿フォーム(点線の枠・説明文・投稿先・カテゴリー・注意事項・同意チェック・投稿するボタン)のHTML
//   ・最初は、「+ 写真を追加する」ボタンだけを表示する(段階的に見せるため)。
//     押すと、フォーム全体が展開され、ボタンは「✕ キャンセル」に変わる。
//   ・「投稿する」ボタンは、写真を選んでいて、同意チェックがすべて済むまで、押せない
function renderPhotoComposerHtml(state, t) {
  if (!state.formOpen) {
    return `<button type="button" class="btn btn-primary" id="photos-toggle">+ ${esc(t.photosAddButton)}</button>`;
  }

  const canSubmit = state.pending.length > 0 && !state.compressing && state.consentTerms && !state.sending;

  // 選んだ写真(最大5枚)。まだ選べるときは、最後に「+ 追加」の枠を出す
  const n = state.pending.length;
  const addTile = n < PHOTO_MAX_PER_POST && !state.sending
    ? `<button type="button" class="photo-pick-add" id="photos-add">${state.compressing ? `<span class="photo-pick-busy">${esc(t.photosCompressing)}</span>` : `<span class="photo-add-icon">📷</span><span>+ ${esc(t.photosAddMore)}</span>`}</button>`
    : "";
  const boxHtml = n === 0 && !state.compressing
    ? `<button type="button" class="photo-add-box" id="photos-add">
         <span class="photo-add-icon">📷</span>
         <span class="photo-add-text">+ ${esc(t.photosAddBoxText)}</span>
         <span class="photo-add-sub">${esc(t.photosMaxNote(PHOTO_MAX_PER_POST))}</span>
       </button>`
    : `<div class="photo-picks-head"><span>${esc(t.photosPicked(n, PHOTO_MAX_PER_POST))}</span></div>
       <ul class="photo-picks">` +
      state.pending
        .map(
          (p, i) =>
            `<li class="photo-pick"><img src="${esc(p.url)}" alt="">` +
            (state.sending ? "" : `<button type="button" class="photo-add-remove" data-photo-remove="${i}" aria-label="${esc(t.photosRemovePhoto)}">✕</button>`) +
            `</li>`
        )
        .join("") +
      (addTile ? `<li class="photo-pick">${addTile}</li>` : "") +
      `</ul>`;

  const selectErrorHtml = state.selectError ? `<p class="tips-error" role="alert">⚠️ ${esc(t[state.selectError])}</p>` : "";

  // 投稿先のお店(名前だけ。距離・タグ・件数などは出さない)
  const entry = entries.find((e) => e.shop.id === state.shopId);
  const shopName = entry ? pick(entry.shop.name) : "";
  const shopCardHtml = shopName
    ? `<div class="photo-shop-card"><span class="photo-shop-card-label">${esc(t.photosPostingTo)}</span><strong>${esc(
        shopName
      )}</strong></div>`
    : "";

  const categoryHtml = `
    <div class="photo-category">
      <p class="photo-category-title">${esc(t.photosCategoryTitle)}</p>
      <div class="photo-category-list">
        ${t.photosCategories
          .map(
            (c) =>
              `<button type="button" class="chip photo-category-btn${
                state.category === c.key ? " active" : ""
              }" data-key="${c.key}" ${state.sending ? "disabled" : ""}>${esc(c.label)}</button>`
          )
          .join("")}
      </div>
    </div>`;

  // 必須のチェックは、利用規約への同意だけ(個別4項目は、下の注意文に統合してある)
  const consentHtml = `
    <fieldset class="photo-consent" ${state.sending ? "disabled" : ""}>
      <label class="consent-check">
        <input type="checkbox" class="photo-consent-input" ${state.consentTerms ? "checked" : ""}>
        <span>${esc(t.photosConsentTermsPrefix)}<a href="${esc(termsUrl())}" target="_blank" rel="noopener noreferrer">${esc(
    t.termsPageTitle
  )}</a>${esc(t.photosConsentTermsSuffix)}</span>
      </label>
    </fieldset>`;

  return `<div class="photo-composer">
    ${boxHtml}
    <input type="file" id="photos-file-input" accept="image/*" multiple hidden>
    ${selectErrorHtml}
    <label class="photo-description-label">
      <textarea class="photo-description-input" id="photos-description" maxlength="${PHOTO_DESCRIPTION_MAX}" placeholder="${esc(
        t.photosDescriptionPlaceholder
      )}" ${state.sending ? "disabled" : ""}></textarea>
    </label>
    ${shopCardHtml}
    ${categoryHtml}
    <div class="photo-notice">
      <p class="photo-notice-title">${esc(t.photosNoticeTitle)}</p>
      <ul class="photo-notice-list">${t.photosNoticeLines.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
      <p class="photo-notice-footer">${esc(t.photosNoticeFooterPrefix)}<a href="${esc(termsUrl())}" target="_blank" rel="noopener noreferrer">${esc(
        t.termsPageTitle
      )}</a>${esc(t.photosNoticeFooterSuffix)}</p>
    </div>
    ${consentHtml}
    <button type="button" class="btn btn-primary photo-submit-btn" id="photos-submit" ${canSubmit ? "" : "disabled"}>${esc(
    state.sending
      ? state.sendProgress && state.sendProgress.total > 1
        ? t.photosUploadingN(state.sendProgress.done + 1, state.sendProgress.total)
        : t.photosUploading
      : n > 1
      ? t.photosSubmitN(n)
      : t.photosSubmit
  )}</button>
    <!-- キャンセルは、投稿ボタンの下(いちばん下)に置く -->
    <button type="button" class="btn photo-composer-cancel" id="photos-toggle" ${state.sending ? "disabled" : ""}>✕ ${esc(
    t.photosCancel
  )}</button>
  </div>`;
}

function renderPhotos() {
  const box = detailPage.querySelector("#photos-body");
  if (!box) return;
  const t = ui[currentLang];
  const state = photosState;
  const isAdmin = !!(authUser && isAdminUser(authUser));
  const myUid = authUser ? authUser.uid : null;

  if (state.status === "loading") {
    box.innerHTML = `<p class="detail-note">${esc(t.photosLoading)}</p>`;
    return;
  }
  if (state.status === "error") {
    box.innerHTML =
      `<p class="tips-error" role="alert">⚠️ ${esc(t.photosLoadError)}</p>` +
      `<button type="button" class="btn btn-small" id="photos-retry">${esc(t.tipsRetry)}</button>`;
    box.querySelector("#photos-retry").addEventListener("click", () => loadPhotos(state));
    return;
  }

  // 管理者は、非表示の写真も、そのまま一覧に含めて見える(「非表示中」の印+元に戻すボタン付き)。管理者以外は、一覧から除く
  const visiblePhotos = isAdmin ? state.photos : state.photos.filter((p) => !p.hidden);

  // 写真の一覧: 3列の正方形の写真だけを並べ、写真の上に「♡ いいねの数」を出す
  //   (投稿者・説明・いいねボタン・コメント・削除などの操作は、写真を押して開く拡大表示の中に出す)
  const gridHtml = visiblePhotos.length
    ? `<ul class="photo-grid photo-grid-3">${visiblePhotos
        .map((p, index) => {
          const categoryLabel = p.category ? photoCategoryLabel(t, p.category) : "";
          const liked = !!state.myLikes[p.id];
          return (
            `<li class="photo-item${p.hidden ? " is-hidden" : ""}">` +
            `<button type="button" class="photo-thumb-btn" data-index="${index}" aria-label="${esc(t.photosEnlarge)}">` +
            `<img class="photo-thumb" src="${esc(p.secure_url)}" alt="" loading="lazy">` +
            (categoryLabel ? `<span class="photo-category-label">${esc(categoryLabel)}</span>` : "") +
            `<span class="photo-like-badge${liked ? " is-liked" : ""}">` +
            `<span aria-hidden="true">${liked ? "♥" : "♡"}</span>${esc(String(p.likeCount || 0))}</span>` +
            (isAdmin && p.isCover ? `<span class="photo-grid-badge">${esc(coverText().badge)}</span>` : "") +
            (p.hidden ? `<span class="photo-grid-badge is-hidden">${esc(t.adminHiddenBadge)}</span>` : "") +
            `</button>` +
            `</li>`
          );
        })
        .join("")}</ul>`
    : `<p class="detail-placeholder">${esc(t.photosEmpty)}</p>`;

  // 拡大表示の中に出す操作(自分の写真の削除・管理者の操作)
  const photoActionsHtml = (p) => {
    const isMine = myUid && p.uid === myUid;
    return (
      `<div class="photo-actions">` +
      (isMine
        ? `<button type="button" class="btn btn-small btn-warn photo-delete-btn" data-id="${esc(p.id)}" ${
            state.deletingId === p.id ? "disabled" : ""
          }>${esc(state.deletingId === p.id ? t.deleting : t.deleteButton)}</button>`
        : "") +
      (isAdmin
        ? `<button type="button" class="btn btn-small admin-toggle-btn" data-id="${esc(p.id)}" ${
            state.adminBusy.has(p.id) ? "disabled" : ""
          }>${esc(p.hidden ? t.adminRestore : t.adminHide)}</button>` + adminCoverButtonHtml(state, p)
        : "") +
      // 誰でも(ログインしていなくても)、この写真を報告できる(今は非表示。PHOTO_REPORT_BUTTON_VISIBLE を参照)
      (PHOTO_REPORT_BUTTON_VISIBLE
        ? `<button type="button" class="btn btn-small photo-report-btn" data-id="${esc(p.id)}">${esc(t.reportPhotoButton)}</button>`
        : "") +
      `</div>` +
      (PHOTO_REPORT_BUTTON_VISIBLE && state.reportFormPhotoId === p.id ? renderPhotoReportFormHtml(state, t) : "") +
      (isAdmin ? renderAdminReportSummaryHtml(p, state, t) : "")
    );
  };

  const composerHtml = renderPhotoComposerHtml(state, t);

  const messageHtml = state.message
    ? `<p class="detail-note tips-message${state.message.error ? " is-error" : ""}" role="status">${esc(t[state.message.key])}</p>`
    : "";

  // 写真の拡大表示(画面いっぱいに写真を出し、右側に いいね・コメント・シェア、左下に 投稿者・説明・お店の名前)
  //   ・上下にスワイプ(パソコンは ↑↓ キー)で、前後の写真へ
  //   ・コメントと、削除などの操作は、下から出てくるシートの中に出す
  const lightboxPhoto = state.lightboxIndex !== null ? visiblePhotos[state.lightboxIndex] : null;
  let lightboxHtml = "";
  if (lightboxPhoto) {
    const v = photoViewerText();
    const lp = lightboxPhoto;
    const cState = getPhotoCommentsState(state, lp.id);
    const commentCount = (isAdmin ? cState.list : cState.list.filter((c) => !c.hidden)).length;
    const liked = !!state.myLikes[lp.id];
    const categoryLabel = lp.category ? photoCategoryLabel(t, lp.category) : "";
    const pvEntry = entries.find((e) => e.shop.id === state.shopId);
    const pvShopName = pvEntry ? pick(pvEntry.shop.name) : "";
    const actions = photoActionsHtml(lp);
    const hasMore = (myUid && lp.uid === myUid) || isAdmin || PHOTO_REPORT_BUTTON_VISIBLE;
    const sheet = state.viewerSheet;
    const sheetHtml = sheet
      ? `<div class="pv-sheet-backdrop" data-pv-sheet-close></div>
         <div class="pv-sheet" role="dialog" aria-label="${esc(sheet === "comments" ? t.photoCommentsTitle : v.more)}">
           <div class="pv-sheet-head"><span class="pv-sheet-title">${esc(
             sheet === "comments" ? `${t.photoCommentsTitle} ${commentCount}` : v.more
           )}</span><button type="button" class="pv-sheet-close" data-pv-sheet-close aria-label="${esc(t.tipsClose)}">✕</button></div>
           <div class="pv-sheet-body">${sheet === "comments" ? renderPhotoCommentsHtml(state, lp, t) : actions}</div>
         </div>`
      : "";
    lightboxHtml = `<div class="photo-lightbox pv" id="photo-lightbox" role="dialog" aria-modal="true" aria-label="${esc(t.photosEnlarge)}">
      <div class="pv-bg" style="background-image:url('${esc(lp.secure_url)}')" aria-hidden="true"></div>
      <img class="pv-img" src="${esc(lp.secure_url)}" alt="${esc(lp.description || categoryLabel || "")}">
      <div class="pv-shade-top" aria-hidden="true"></div><div class="pv-shade-bottom" aria-hidden="true"></div>
      <div class="pv-top">
        <button type="button" class="pv-back" id="photo-lightbox-close" aria-label="${esc(t.tipsClose)}">${PV_ICONS.back}</button>
        <span class="pv-title">${esc(pvShopName)}</span>
        <span class="pv-pos">${state.lightboxIndex + 1} / ${visiblePhotos.length}</span>
      </div>
      <div class="pv-rail">
        <button type="button" class="pv-act photo-like-btn${liked ? " is-liked" : ""}" data-id="${esc(lp.id)}" ${
          state.likeBusy.has(lp.id) ? "disabled" : ""
        } aria-pressed="${liked}" aria-label="${esc(t.photoLikeButton)}">${liked ? PV_ICONS.heartOn : PV_ICONS.heart}<span>${esc(
      String(lp.likeCount || 0)
    )}</span></button>
        <button type="button" class="pv-act" data-pv-sheet="comments" aria-label="${esc(t.photoCommentsTitle)}">${PV_ICONS.comment}<span>${commentCount}</span></button>
        <button type="button" class="pv-act" data-pv-share aria-label="${esc(v.share)}">${PV_ICONS.share}<span>${esc(v.share)}</span></button>
        ${hasMore ? `<button type="button" class="pv-act" data-pv-sheet="more" aria-label="${esc(v.more)}">${PV_ICONS.more}</button>` : ""}
      </div>
      <div class="pv-info">
        <div class="pv-author">${userLinkHtml(lp.uid, lp.authorName, "photo-author", { avatar: 36 })}
          ${categoryLabel ? `<span class="pv-chip">${esc(categoryLabel)}</span>` : ""}
          ${isAdmin && lp.isCover ? `<span class="pv-chip is-cover">${esc(coverText().badge)}</span>` : ""}
          ${lp.hidden ? `<span class="pv-chip is-hidden">${esc(t.adminHiddenBadge)}</span>` : ""}
        </div>
        ${lp.description ? `<p class="pv-caption${state.viewerCaptionOpen ? " is-open" : ""}" data-pv-caption>${esc(lp.description)}</p>` + translateButtonHtml(lp.description, "dark") : ""}
        ${pvShopName ? `<p class="pv-place">${PV_ICONS.pin}<span>${esc(pvShopName)}</span></p>` : ""}
      </div>
      <p class="pv-toast" role="status" aria-live="polite"></p>
      ${sheetHtml}
    </div>`;
  }

  box.innerHTML = gridHtml + composerHtml + messageHtml + lightboxHtml;

  const bind = (selector, handler) => {
    const el = box.querySelector(selector);
    if (el) el.addEventListener("click", handler);
  };

  // 「+ 写真を追加する」/「✕ キャンセル」の切り替え(同じボタン。開くときは、それだけでよい。
  //   閉じるときは、選んでいた内容を、すべて破棄する)
  bind("#photos-toggle", () => {
    if (state.formOpen) {
      clearPendingPhoto(state);
      state.selectError = null;
      state.formOpen = false;
    } else {
      state.formOpen = true;
    }
    renderPhotos();
  });

  const fileInput = box.querySelector("#photos-file-input");
  bind("#photos-add", () => fileInput && fileInput.click());
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const files = fileInput.files ? [...fileInput.files] : [];
      fileInput.value = ""; // 同じファイルを、続けて選べるようにする
      if (files.length) handleSelectedPhotoFiles(state, files);
    });
  }
  box.querySelectorAll("[data-photo-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.photoRemove);
      const [removed] = state.pending.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      state.selectError = null;
      renderPhotos();
    });
  });
  bind("#photos-submit", () => submitPhoto(state));
  const descriptionInput = box.querySelector("#photos-description");
  if (descriptionInput) {
    descriptionInput.value = state.description; // 作り直したときのために、それまでの入力を復元する
    descriptionInput.addEventListener("input", () => {
      state.description = descriptionInput.value; // 作り直さない(入力中の文字が消えないように)
    });
  }
  box.querySelectorAll(".photo-category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // すでに選ばれているものを、もう一度押したら、選択を解除する(単一選択)
      state.category = state.category === btn.dataset.key ? null : btn.dataset.key;
      renderPhotos();
    });
  });
  box.querySelectorAll(".photo-thumb-btn[data-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lightboxIndex = Number(btn.dataset.index);
      state.viewerSheet = null;
      state.viewerCaptionOpen = false;
      const photo = visiblePhotos[state.lightboxIndex];
      // コメントは、拡大表示を開いたときに、はじめて読み込む(まだ読み込んでいなければ)
      if (photo && !state.commentsByPhoto[photo.id]) loadPhotoComments(state, photo.id);
      renderPhotos();
    });
  });
  box.querySelectorAll(".photo-like-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const photo = state.photos.find((p) => p.id === btn.dataset.id);
      if (photo) togglePhotoLike(state, photo);
    });
  });
  box.querySelectorAll(".photo-delete-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm(t.deleteConfirm)) return;
      const photo = state.photos.find((p) => p.id === btn.dataset.id);
      if (photo) deleteMyPhoto(state, photo);
    });
  });
  box.querySelectorAll(".admin-toggle-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const photo = state.photos.find((p) => p.id === btn.dataset.id);
      if (photo) adminTogglePhotoHidden(state, photo);
    });
  });
  bindAdminCover(box, state);
  // 💬 コメント欄(グリッドの各写真、および、拡大表示の中。写真の数だけ存在しうる)
  box.querySelectorAll(".photo-comments-block[data-photo-id]").forEach((commentsBox) => {
    const photoId = commentsBox.dataset.photoId;
    const cState = getPhotoCommentsState(state, photoId);
    const commentInput = commentsBox.querySelector(".photo-comment-input");
    if (commentInput) {
      commentInput.value = cState.draftText; // 作り直したときのために、それまでの入力を復元する
      commentInput.addEventListener("input", () => {
        cState.draftText = commentInput.value; // 作り直さない(入力中の文字が消えないように)
      });
    }
    const commentForm = commentsBox.querySelector(".photo-comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", (event) => {
        event.preventDefault(); // ページを移動しない
        submitPhotoComment(state, photoId, cState.draftText);
      });
    }
    const commentsRetry = commentsBox.querySelector(".photo-comments-retry");
    if (commentsRetry) commentsRetry.addEventListener("click", () => loadPhotoComments(state, photoId));
    commentsBox.querySelectorAll(".photo-comment-delete-btn[data-comment-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm(t.deleteConfirm)) return;
        deletePhotoComment(state, photoId, btn.dataset.commentId);
      });
    });
    commentsBox.querySelectorAll(".photo-comment-hide-toggle[data-comment-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const comment = cState.list.find((c) => c.id === btn.dataset.commentId);
        if (comment) adminTogglePhotoCommentHidden(state, photoId, comment);
      });
    });
  });
  // 投稿前の必須チェック(利用規約への同意)。変わったら、作り直す(「投稿する」ボタンの押せる/押せないが変わるため)
  box.querySelectorAll(".photo-consent-input").forEach((input) => {
    input.addEventListener("change", () => {
      state.consentTerms = input.checked;
      renderPhotos();
    });
  });
  // 「この写真を報告」ボタン(誰でも使える。押すたびに、その写真の報告フォームを開く/閉じる)
  box.querySelectorAll(".photo-report-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.reportFormPhotoId = state.reportFormPhotoId === btn.dataset.id ? null : btn.dataset.id;
      state.reportReason = "";
      state.reportMessage = null;
      renderPhotos();
    });
  });
  const reportForm = box.querySelector(".photo-report-form");
  if (reportForm) {
    reportForm.addEventListener("change", (event) => {
      if (event.target.name === "photo-report-reason") state.reportReason = event.target.value;
    });
    reportForm.querySelector(".photo-report-cancel").addEventListener("click", () => {
      state.reportFormPhotoId = null;
      renderPhotos();
    });
    reportForm.addEventListener("submit", (event) => {
      event.preventDefault(); // ページを移動しない
      submitPhotoReport(state, state.reportFormPhotoId);
    });
  }
  // 【管理者だけ】報告理由の一覧を、開く/閉じる
  box.querySelectorAll(".admin-report-toggle[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => toggleAdminPhotoReports(state, btn.dataset.id));
  });
  bind("#photo-lightbox-close", () => {
    state.lightboxIndex = null;
    state.viewerSheet = null;
    renderPhotos();
  });
  bindPhotoViewer(box, state, visiblePhotos);
  // 背景(写真やコメント欄の外の、暗いところ)を押したときだけ閉じる
  //   (中のコメント入力欄・ボタンを押したときに画面を作り直すと、入力や送信ができなくなるため、何もしない)
  bind("#photo-lightbox", (event) => {
    if (event.target.id !== "photo-lightbox") return;
    state.lightboxIndex = null;
    state.viewerSheet = null;
    renderPhotos();
  });
  // 拡大表示を開いている間は、後ろのページが一緒に動かないようにする
  document.body.classList.toggle("is-photo-lightbox", !!box.querySelector("#photo-lightbox"));
}

// 選んだ写真を送る(送っている間は、ボタンを押せなくする)
//   ・まだログインしていなければ、ここで、はじめてログインを求める(ensureSignedIn)。
//     ログインできたら、選んでいた画像を、そのまま送信する。
//   ・ポップアップを閉じただけのときは、エラーにせず、選んでいた画像を残したまま、送信中をやめる(もう一度、押せる)
async function submitPhoto(state) {
  if (state.sending || !state.pending.length) return;
  if (!state.consentTerms) return; // 念のための確認(ボタン自体、押せないようになっているはず)
  state.sending = true;
  state.message = null;
  renderPhotos();

  const user = await waitForAuthUser();
  if (!user) {
    try {
      const signedIn = await ensureSignedIn();
      if (!signedIn) {
        state.sending = false;
        if (photosState === state) renderPhotos();
        return;
      }
    } catch (error) {
      console.warn("写真投稿前のログインに失敗:", error);
      state.sending = false;
      state.message = { key: error.messageKey || "authLoginError", error: true };
      if (photosState === state) renderPhotos();
      return;
    }
  }

  doSubmitPhoto(state);
}

// 選んだ写真を、1枚ずつ順番にアップロードする(説明文・カテゴリーは、全部の写真に同じものを付ける)
//   ・途中で失敗したら、そこで止めて、送れなかった写真はフォームに残す(もう一度「投稿する」で続きを送れる)
async function doSubmitPhoto(state) {
  const description = state.description.trim().slice(0, PHOTO_DESCRIPTION_MAX);
  const category = state.category || "";
  const total = state.pending.length;
  state.sendProgress = { done: 0, total };
  let posted = 0;
  try {
    const api = await getPhotosApi();
    const authorName = await resolvePostAuthorName(authUser);
    while (state.pending.length) {
      const item = state.pending[0];
      const photo = await api.uploadPhoto(state.shopId, item.blob, authorName, { description, category });
      // 送れたら、画面の一覧にも反映する(読み込み直さない)
      state.photos = [photo, ...state.photos];
      state.pending.shift();
      URL.revokeObjectURL(item.url);
      posted += 1;
      state.sendProgress = { done: posted, total };
      if (photosState === state) renderPhotos();
    }
    // 全部送れたら、フォームを閉じて、最初の状態に戻す
    clearPendingPhoto(state);
    state.formOpen = false;
    state.message = { key: "photosThanks", error: false };
  } catch (error) {
    console.warn("写真の送信に失敗:", error && error.code, error);
    const code = error && error.code;
    state.message = {
      key: code === "app/login-required" ? "photosLoginNeeded" : posted > 0 ? "photosPartialError" : "photosUploadError",
      error: true,
    };
  }
  state.sending = false;
  state.sendProgress = null;
  if (photosState === state) renderPhotos();
}

// 自分の写真を1枚、削除する(押す前に、確認メッセージを出す)。Firestoreの記録と、Storageの画像ファイルの、両方を削除する
function deleteMyPhoto(state, photo) {
  if (state.deletingId) return;
  state.deletingId = photo.id;
  state.message = null;
  state.lightboxIndex = null; // 一覧が変わるので、拡大表示は閉じる
  renderPhotos();
  getPhotosApi()
    .then((api) => api.deletePhoto(state.shopId, photo.id))
    .then(() => {
      state.photos = state.photos.filter((p) => p.id !== photo.id);
      state.message = { key: "photosDeleted", error: false };
    })
    .catch((error) => {
      console.warn("写真の削除に失敗:", error);
      state.message = { key: "photosDeleteError", error: true };
    })
    .then(() => {
      state.deletingId = null;
      if (photosState === state) renderPhotos();
    });
}

// 【管理者だけ】1枚の写真を、非表示にする / 元に戻す
function adminTogglePhotoHidden(state, photo) {
  if (state.adminBusy.has(photo.id)) return;
  state.adminBusy.add(photo.id);
  state.message = null;
  state.lightboxIndex = null;
  renderPhotos();
  const nextHidden = !photo.hidden;
  getPhotosApi()
    .then((api) => api.setPhotoHidden(state.shopId, photo.id, nextHidden))
    .then(() => {
      photo.hidden = nextHidden; // 読み込み直さず、ローカルの一覧にも、そのまま反映する
      // 非表示にした写真は、トップ画像からも外れる(index.html の setPhotoHidden)
      if (nextHidden && photo.isCover) {
        photo.isCover = false;
        if (window.shopCovers) window.shopCovers.delete(state.shopId);
        if (typeof refreshShopImages === "function") refreshShopImages();
      }
    })
    .catch((error) => {
      console.warn("写真の非表示切り替えに失敗:", error);
      state.message = { key: "adminUpdateError", error: true };
    })
    .then(() => {
      state.adminBusy.delete(photo.id);
      if (photosState === state) renderPhotos();
    });
}

// 「♡ / ♥」ボタン(いいね数つき)のHTML。グリッド・拡大表示の、どちらでも使う共通の部品
function renderPhotoLikeHtml(state, photo, t) {
  const liked = !!state.myLikes[photo.id];
  const busy = state.likeBusy.has(photo.id);
  return `<button type="button" class="photo-like-btn${liked ? " is-liked" : ""}" data-id="${esc(photo.id)}" ${
    busy ? "disabled" : ""
  } aria-pressed="${liked}" aria-label="${esc(t.photoLikeButton)}">
    <span class="photo-like-icon">${liked ? "♥" : "♡"}</span>
    <span class="photo-like-count">${esc(String(photo.likeCount || 0))}</span>
  </button>`;
}

// 「♡」を押したとき(押しっぱなしを防ぐ)。まだログインしていなければ、ここで、はじめてログインを求める
//   ・ログインできたら、そのまま、いいね/取り消しを実行する(Tips・Check-inのボタンと、同じ考え方)
async function togglePhotoLike(state, photo) {
  if (state.likeBusy.has(photo.id)) return;
  state.likeBusy.add(photo.id);
  state.message = null;
  renderPhotos();

  const user = await waitForAuthUser();
  if (!user) {
    try {
      const signedIn = await ensureSignedIn();
      if (!signedIn) {
        state.likeBusy.delete(photo.id);
        if (photosState === state) renderPhotos();
        return;
      }
    } catch (error) {
      console.warn("いいね前のログインに失敗:", error);
      state.likeBusy.delete(photo.id);
      state.message = { key: error.messageKey || "authLoginError", error: true };
      if (photosState === state) renderPhotos();
      return;
    }
  }
  doTogglePhotoLike(state, photo);
}

function doTogglePhotoLike(state, photo) {
  const wasLiked = !!state.myLikes[photo.id];
  getPhotosApi()
    .then((api) => (wasLiked ? api.unlikePhoto(state.shopId, photo.id) : api.likePhoto(state.shopId, photo.id)))
    .then(() => {
      // 送れたら、画面にも反映する(読み込み直さない)
      state.myLikes[photo.id] = !wasLiked;
      photo.likeCount = Math.max(0, (photo.likeCount || 0) + (wasLiked ? -1 : 1));
    })
    .catch((error) => {
      console.warn("いいねの更新に失敗:", error && error.code, error);
      if (error && error.code === "permission-denied") {
        // すでに状況が変わっていた可能性が高い(別のタブなど)。読み込み直して、画面を合わせる
        loadMyLikes(state);
      }
      state.message = { key: "photoLikeError", error: true };
    })
    .then(() => {
      state.likeBusy.delete(photo.id);
      if (photosState === state) renderPhotos();
    });
}

// ---------------------------------------------------------------------
// 💬 写真へのコメント(拡大表示のときだけ使う。誰でも使えるが、投稿にはログインが必要)
// ---------------------------------------------------------------------
//   ・Tips・Check-in・レビューと違い、1人が何度でも投稿できる(回数の制限は無い)
//   ・拡大表示を開いたときに、はじめて読み込む(閉じても、読み込んだ内容は、開いている間は覚えている)

const PHOTO_COMMENT_MAX = 300; // コメントの、最大の文字数

// その写真ぶんの、コメントの状態を返す(まだ無ければ、作ってから返す)
function getPhotoCommentsState(state, photoId) {
  if (!state.commentsByPhoto[photoId]) {
    state.commentsByPhoto[photoId] = createPhotoCommentsState();
  }
  return state.commentsByPhoto[photoId];
}

function loadPhotoComments(state, photoId) {
  const cState = getPhotoCommentsState(state, photoId);
  cState.status = "loading";
  renderPhotos();
  getPhotosApi()
    .then((api) => api.fetchComments(state.shopId, photoId))
    .then((comments) => {
      cState.list = Array.isArray(comments) ? comments : [];
      cState.status = "ready";
    })
    .catch((error) => {
      console.warn("コメントの読み込みに失敗:", error);
      cState.status = "error";
    })
    .then(() => {
      if (photosState === state) renderPhotos();
    });
}

// コメント一覧(<ul>、または、読み込み中・エラーの表示)のHTML。グリッド・拡大表示、どちらでも使う共通の部品
//   ・コメントが1件も無いときは、空文字を返す(「まだコメントはありません」などの表示は、呼び出す側で判断する)
function renderPhotoCommentListHtml(cState, t) {
  if (cState.status === "loading" && !cState.list.length) {
    return `<p class="detail-note">${esc(t.photoCommentsLoading)}</p>`;
  }
  if (cState.status === "error") {
    return (
      `<p class="tips-error" role="alert">⚠️ ${esc(t.photoCommentsLoadError)}</p>` +
      `<button type="button" class="btn btn-small photo-comments-retry">${esc(t.tipsRetry)}</button>`
    );
  }
  const isAdmin = !!(authUser && isAdminUser(authUser));
  const myUid = authUser ? authUser.uid : null;
  const visibleComments = isAdmin ? cState.list : cState.list.filter((c) => !c.hidden);
  if (!visibleComments.length) return "";
  return `<ul class="photo-comment-list">${visibleComments
    .map((c) => {
      const isMine = myUid && c.uid === myUid;
      return (
        `<li class="photo-comment-item${c.hidden ? " is-hidden" : ""}">` +
        `<div class="photo-comment-head">${userLinkHtml(c.uid, c.authorName, "photo-comment-author", { avatar: 26 })}` +
        (c.hidden ? `<span class="admin-hidden-badge">${esc(t.adminHiddenBadge)}</span>` : "") +
        `</div>` +
        `<p class="photo-comment-text">${esc(c.comment)}</p>` +
        translateButtonHtml(c.comment) +
        (isMine || isAdmin
          ? `<div class="photo-comment-actions">` +
            (isMine
              ? `<button type="button" class="btn btn-small btn-warn photo-comment-delete-btn" data-comment-id="${esc(
                  c.id
                )}" ${cState.deletingId === c.id ? "disabled" : ""}>${esc(
                  cState.deletingId === c.id ? t.deleting : t.deleteButton
                )}</button>`
              : "") +
            (isAdmin
              ? `<button type="button" class="btn btn-small admin-toggle-btn photo-comment-hide-toggle" data-comment-id="${esc(
                  c.id
                )}" ${cState.adminBusy.has(c.id) ? "disabled" : ""}>${esc(
                  c.hidden ? t.adminRestore : t.adminHide
                )}</button>`
              : "") +
            `</div>`
          : "") +
        `</li>`
      );
    })
    .join("")}</ul>`;
}

// コメントの入力欄+送信ボタンのHTML。グリッド・拡大表示、どちらでも使う共通の部品
function renderPhotoCommentFormHtml(cState, t) {
  return `<form class="photo-comment-form">
    <textarea class="photo-comment-input" maxlength="${PHOTO_COMMENT_MAX}" ${
    cState.sending ? "disabled" : ""
  }></textarea>
    <button type="submit" class="btn btn-primary btn-small photo-comment-submit" ${cState.sending ? "disabled" : ""}>${esc(
    cState.sending ? t.photoCommentSending : t.photoCommentSubmit
  )}</button>
  </form>`;
}

// コメント欄(見出し+一覧+入力フォーム)のHTML。拡大表示(ライトボックス)で使う
function renderPhotoCommentsHtml(state, photo, t) {
  const cState = getPhotoCommentsState(state, photo.id);
  const listHtml = renderPhotoCommentListHtml(cState, t);
  // 一覧が空(0件)で、読み込み中でもエラーでもないときだけ、「まだコメントはありません」を出す
  const emptyHtml = !listHtml && cState.status !== "loading" && cState.status !== "error"
    ? `<p class="detail-placeholder">${esc(t.photoCommentsEmpty)}</p>`
    : "";
  const messageHtml = cState.message
    ? `<p class="detail-note tips-message${cState.message.error ? " is-error" : ""}" role="status">${esc(
        t[cState.message.key]
      )}</p>`
    : "";

  return `<div class="photo-comments photo-comments-block" data-photo-id="${esc(photo.id)}">
    <h4 class="photo-comments-title">${esc(t.photoCommentsTitle)}</h4>
    ${listHtml}${emptyHtml}
    ${renderPhotoCommentFormHtml(cState, t)}
    ${messageHtml}
  </div>`;
}

// コメント欄(件数+一覧+入力フォームだけ。案内文言は出さない)のHTML。グリッド表示で使う
function renderPhotoGridCommentsHtml(state, photo, t) {
  const cState = getPhotoCommentsState(state, photo.id);
  const isAdmin = !!(authUser && isAdminUser(authUser));
  const visibleCount = (isAdmin ? cState.list : cState.list.filter((c) => !c.hidden)).length;
  const messageHtml = cState.message
    ? `<p class="detail-note tips-message${cState.message.error ? " is-error" : ""}" role="status">${esc(
        t[cState.message.key]
      )}</p>`
    : "";

  return `<div class="photo-grid-comments photo-comments-block" data-photo-id="${esc(photo.id)}">
    <p class="photo-comment-count">💬 ${esc(t.statCount(visibleCount))}</p>
    ${renderPhotoCommentFormHtml(cState, t)}
    ${renderPhotoCommentListHtml(cState, t)}
    ${messageHtml}
  </div>`;
}

// コメントを送る(送っている間は、ボタンを押せなくする)
//   ・まだログインしていなければ、ここで、はじめてログインを求める(ensureSignedIn)
async function submitPhotoComment(state, photoId, rawText) {
  const cState = getPhotoCommentsState(state, photoId);
  if (cState.sending) return;
  const comment = (rawText || "").trim();
  if (!comment) {
    cState.message = { key: "photoCommentEmpty", error: true };
    renderPhotos();
    return;
  }
  if (comment.length > PHOTO_COMMENT_MAX) {
    cState.message = { key: "photoCommentTooLong", error: true };
    renderPhotos();
    return;
  }
  cState.sending = true;
  cState.message = null;
  renderPhotos();

  const user = await waitForAuthUser();
  if (!user) {
    try {
      const signedIn = await ensureSignedIn();
      if (!signedIn) {
        cState.sending = false;
        if (photosState === state) renderPhotos();
        return;
      }
    } catch (error) {
      console.warn("コメント送信前のログインに失敗:", error);
      cState.sending = false;
      cState.message = { key: error.messageKey || "authLoginError", error: true };
      if (photosState === state) renderPhotos();
      return;
    }
  }
  doSubmitPhotoComment(state, photoId, comment);
}

function doSubmitPhotoComment(state, photoId, comment) {
  const cState = getPhotoCommentsState(state, photoId);
  let authorName = "";
  getPhotosApi()
    .then((api) =>
      resolvePostAuthorName(authUser).then((name) => {
        authorName = name;
        return api.addComment(state.shopId, photoId, comment, authorName);
      })
    )
    .then((newComment) => {
      // 送れたら、画面の一覧にも反映する(読み込み直さない)
      cState.list = [newComment, ...cState.list];
      cState.draftText = "";
      cState.message = { key: "photoCommentThanks", error: false };
    })
    .catch((error) => {
      console.warn("コメントの送信に失敗:", error && error.code, error);
      const code = error && error.code;
      cState.message = { key: code === "app/login-required" ? "photoCommentLoginNeeded" : "photoCommentError", error: true };
    })
    .then(() => {
      cState.sending = false;
      if (photosState === state) renderPhotos();
    });
}

// 自分のコメントを削除する(押す前に、確認メッセージを出す)。削除しても、また投稿できる(回数の制限が無いため)
function deletePhotoComment(state, photoId, commentId) {
  const cState = getPhotoCommentsState(state, photoId);
  if (cState.deletingId) return;
  cState.deletingId = commentId;
  cState.message = null;
  renderPhotos();
  getPhotosApi()
    .then((api) => api.deleteComment(state.shopId, photoId, commentId))
    .then(() => {
      cState.list = cState.list.filter((c) => c.id !== commentId);
      cState.message = { key: "photoCommentDeleted", error: false };
    })
    .catch((error) => {
      console.warn("コメントの削除に失敗:", error);
      cState.message = { key: "photoCommentDeleteError", error: true };
    })
    .then(() => {
      cState.deletingId = null;
      if (photosState === state) renderPhotos();
    });
}

// 【管理者だけ】1件のコメントを、非表示にする / 元に戻す
function adminTogglePhotoCommentHidden(state, photoId, comment) {
  const cState = getPhotoCommentsState(state, photoId);
  if (cState.adminBusy.has(comment.id)) return;
  cState.adminBusy.add(comment.id);
  cState.message = null;
  renderPhotos();
  const nextHidden = !comment.hidden;
  getPhotosApi()
    .then((api) => api.setCommentHidden(state.shopId, photoId, comment.id, nextHidden))
    .then(() => {
      comment.hidden = nextHidden; // 読み込み直さず、ローカルの一覧にも、そのまま反映する
    })
    .catch((error) => {
      console.warn("コメントの非表示切り替えに失敗:", error);
      cState.message = { key: "adminUpdateError", error: true };
    })
    .then(() => {
      cState.adminBusy.delete(comment.id);
      if (photosState === state) renderPhotos();
    });
}

// 写真の報告フォーム(誰でも使える。ログインは不要)のHTML
function renderPhotoReportFormHtml(state, t) {
  const messageHtml = state.reportMessage
    ? `<p class="detail-note tips-message${state.reportMessage.error ? " is-error" : ""}" role="status">${esc(
        t[state.reportMessage.key]
      )}</p>`
    : "";
  return `<form class="report-panel photo-report-form">
    <fieldset ${state.reportSending ? "disabled" : ""}>
      <legend>${esc(t.reportPhotoTitle)}</legend>
      ${t.reportPhotoReasons
        .map(
          (r) =>
            `<label class="report-option"><input type="radio" name="photo-report-reason" value="${esc(r.key)}" ${
              state.reportReason === r.key ? "checked" : ""
            }> <span>${esc(r.label)}</span></label>`
        )
        .join("")}
    </fieldset>
    <div class="report-actions">
      <button type="submit" class="btn btn-primary" ${state.reportSending ? "disabled" : ""}>${esc(
        state.reportSending ? t.reportPhotoSending : t.reportPhotoSubmit
      )}</button>
      <button type="button" class="btn photo-report-cancel" ${state.reportSending ? "disabled" : ""}>${esc(t.tipsClose)}</button>
    </div>
    ${messageHtml}
  </form>`;
}

// 写真を報告する(ログインしていなくても行える)
function submitPhotoReport(state, photoId) {
  if (state.reportSending || !photoId) return;
  if (!state.reportReason) {
    state.reportMessage = { key: "reportPhotoNoneSelected", error: true };
    renderPhotos();
    return;
  }
  state.reportSending = true;
  state.reportMessage = null;
  renderPhotos();
  getPhotosApi()
    .then((api) => api.reportPhoto(state.shopId, photoId, state.reportReason))
    .then(() => {
      const photo = state.photos.find((p) => p.id === photoId);
      if (photo) photo.reportCount = (photo.reportCount || 0) + 1; // 管理者が見たとき用に、ローカルの表示も更新しておく
      state.reportFormPhotoId = null;
      state.reportReason = "";
      state.message = { key: "reportPhotoThanks", error: false }; // お礼は、写真セクション全体のメッセージ欄に出す(フォームは閉じるため)
    })
    .catch((error) => {
      console.warn("写真の報告に失敗:", error);
      state.reportMessage = { key: "reportPhotoError", error: true };
    })
    .then(() => {
      state.reportSending = false;
      if (photosState === state) renderPhotos();
    });
}

// 【管理者だけ】1枚の写真の、報告理由の内訳を表示するHTML(reportCountは、常に出す。理由の一覧は、開いたときだけ)
function renderAdminReportSummaryHtml(photo, state, t) {
  const isOpen = state.adminReportsPhotoId === photo.id;
  let listHtml = "";
  if (isOpen) {
    if (state.adminReportsStatus === "loading") {
      listHtml = `<p class="detail-note">${esc(t.adminReportsLoading)}</p>`;
    } else if (state.adminReportsStatus === "error") {
      listHtml = `<p class="tips-error" role="alert">⚠️ ${esc(t.adminReportsLoadError)}</p>`;
    } else if (!state.adminReportsList.length) {
      listHtml = `<p class="detail-placeholder">${esc(t.adminReportsEmpty)}</p>`;
    } else {
      listHtml = `<ul class="admin-report-list">${state.adminReportsList
        .map((r) => `<li>${esc(photoReportReasonLabel(t, r.reason))}</li>`)
        .join("")}</ul>`;
    }
  }
  return `<div class="admin-report-summary">
    <span class="admin-report-count">${esc(t.adminReportCount(photo.reportCount || 0))}</span>
    <button type="button" class="btn btn-small admin-report-toggle" data-id="${esc(photo.id)}">${esc(
      isOpen ? t.tipsClose : t.adminViewReports
    )}</button>
    ${listHtml}
  </div>`;
}

// レポートの理由キー(例: "copyright")を、いまの言語の文言に変える(未知のキーは、そのまま出す)
function photoReportReasonLabel(t, key) {
  const found = t.reportPhotoReasons.find((r) => r.key === key);
  return found ? found.label : key;
}

// 【管理者だけ】1枚の写真の、報告理由の一覧を、開く/閉じる(開くときだけ、Firestoreから読み込む)
function toggleAdminPhotoReports(state, photoId) {
  if (state.adminReportsPhotoId === photoId) {
    state.adminReportsPhotoId = null;
    renderPhotos();
    return;
  }
  state.adminReportsPhotoId = photoId;
  state.adminReportsStatus = "loading";
  state.adminReportsList = [];
  renderPhotos();
  getPhotosApi()
    .then((api) => api.fetchReports(state.shopId, photoId))
    .then((reports) => {
      state.adminReportsList = Array.isArray(reports) ? reports : [];
      state.adminReportsStatus = "ready";
    })
    .catch((error) => {
      console.warn("報告理由の読み込みに失敗:", error);
      state.adminReportsStatus = "error";
    })
    .then(() => {
      if (photosState === state) renderPhotos();
    });
}

// ---------------------------------------------------------------------
// ⭐ レビュー(Firebase Firestore)
// ---------------------------------------------------------------------
//   ・Firestore との通信は、Tips・Check-in と同じ index.html の window.reviewsApi
//   ・保存先: shops/{店舗ID}/reviews/{ユーザーID}(評価・コメント・投稿者名・投稿日時)
//     Tips の tipVotes・Check-in の checkins と同じく、ドキュメント名がユーザーIDなので、
//     同じお店には1件しか作れない(1人につき、お店ごとに1回だけ投稿できる)。
//     レビューは、中身(評価・コメント)をみんなに見せる機能なので、Tips のように「投稿記録」と
//     「集計」を分けず、このドキュメント1つだけで完結する。平均点・件数は、取得したレビュー一覧から、
//     ここ(画面側)で計算する(集計専用のドキュメントは、持たない)。
//   ・レビュー一覧は、誰でも読める公開データ(ルールで allow read: if true)なので、「自分が投稿済みか」は、
//     読み込んだ一覧の中に、自分の uid と同じ id のレビューがあるかで判断する(Tips のように、
//     ログイン中のユーザー専用の追加の読み取りは、しない)。
//   ・星の選択・コメントの入力は、ログインしていなくてもできる。「投稿する」を押したときに、はじめて
//     ログインを求める(ensureSignedIn。Tips・Check-in の submitTips・submitCheckin と、同じ考え方)
//   ・カテゴリー(ベトナム料理、など)には、いっさい依存しない。店舗ID(shopId)だけで完結する

const REVIEW_COMMENT_MAX = 500; // コメントの、最大の文字数

// レビューを書く画面の文言
const REVIEW_SCREEN_TEXT = {
  ja: { placeholder: "料理の味、お店の雰囲気、おすすめのメニューなど、感想を自由に書いてください", photos: (n) => `写真 ${n}枚`, reviews: (n) => `レビュー ${n}件` },
  en: { placeholder: "Share your thoughts: the taste, the atmosphere, dishes you recommend…", photos: (n) => `${n} photos`, reviews: (n) => `${n} reviews` },
  vi: { placeholder: "Hãy chia sẻ cảm nhận: hương vị, không gian, món bạn muốn giới thiệu…", photos: (n) => `${n} ảnh`, reviews: (n) => `${n} đánh giá` },
};

// 1つのお店の、レビュー一覧・投稿フォームの状態
function createReviewsState(shopId) {
  return {
    shopId,
    status: "loading", // "loading" | "ready" | "error"
    reviews: [], // [{ id(投稿したユーザーのID), rating, comment, authorName, createdAt }]、新しい順
    formOpen: false,
    rating: 0, // フォームで選んでいる星の数(0 = 未選択)
    comment: "", // フォームのコメント(言語を切り替えて描き直しても、残す)
    sending: false,
    message: null, // { key: 文言のキー, error: true/false }
    deleting: false, // 自分のレビューを削除している間、trueにする(ボタンを連続で押せなくする)
    // 【管理者だけ】非表示・元に戻すの操作に使う
    adminBusy: new Set(), // いま非表示・元に戻すの通信中の、レビューのユーザーID
    adminMessage: null, // { key: 文言のキー, error: true/false }
  };
}

let reviewsState = createReviewsState(null);

// Firebase の準備ができたら api を返す(getTipsApi と、同じ仕組み)
function getReviewsApi() {
  if (window.reviewsApi) return Promise.resolve(window.reviewsApi);
  if (window.reviewsApiFailed) return Promise.reject(new Error("reviews api failed"));
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("reviews-api-ready", onReady);
      window.removeEventListener("reviews-api-failed", onFailed);
    };
    const onReady = () => {
      cleanup();
      resolve(window.reviewsApi);
    };
    const onFailed = () => {
      cleanup();
      reject(new Error("reviews api failed"));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("reviews api timeout"));
    }, TIPS_API_WAIT_MS); // Tips と、同じ長さだけ待つ
    window.addEventListener("reviews-api-ready", onReady);
    window.addEventListener("reviews-api-failed", onFailed);
  });
}

function startReviews(shopId) {
  reviewsState = createReviewsState(shopId);
  loadReviews(reviewsState);
}

function loadReviews(state) {
  state.status = "loading";
  renderReviews();
  getReviewsApi()
    .then((api) => api.fetchReviews(state.shopId))
    .then((reviews) => {
      state.reviews = Array.isArray(reviews) ? reviews : [];
      state.status = "ready";
    })
    .catch((error) => {
      console.warn("レビューの読み込みに失敗:", error);
      state.status = "error";
    })
    .then(() => {
      if (reviewsState === state) renderReviews(); // 読み込んでいる間に別のお店へ移っていたら、何もしない
    });
}

// ログイン・ログアウトしたら、「自分が投稿済みか」の判定に使う uid が変わるので、表示を作り直す
//   ・レビュー一覧そのものは、誰が見ても同じ公開データなので、読み込み直さない(renderReviews だけでよい)
window.addEventListener("auth-changed", () => {
  if (reviewsState.shopId === null || reviewsState.sending) return;
  reviewsState.formOpen = false;
  reviewsState.message = null;
  renderReviews();
});

// 星の数を、★(選んだ分)と☆(残り)の文字にする(例: rating=3 なら「★★★☆☆」)
function starsText(rating) {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function renderReviews() {
  const box = detailPage.querySelector("#reviews-body");
  if (!box) return;
  const t = ui[currentLang];
  const state = reviewsState;

  if (state.status === "loading") {
    box.innerHTML = `<p class="detail-note">${esc(t.reviewsLoading)}</p>`;
    return;
  }
  if (state.status === "error") {
    box.innerHTML =
      `<p class="tips-error" role="alert">⚠️ ${esc(t.reviewsLoadError)}</p>` +
      `<button type="button" class="btn btn-small" id="reviews-retry">${esc(t.tipsRetry)}</button>`;
    box.querySelector("#reviews-retry").addEventListener("click", () => loadReviews(state));
    return;
  }

  // 平均点と件数(非表示にされたレビューは、計算に入れない。1件も無ければ、その旨を出す)
  const isAdmin = !!(authUser && isAdminUser(authUser));
  const publicReviews = state.reviews.filter((r) => !r.hidden);
  const count = publicReviews.length;
  const average = count > 0 ? publicReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count : 0;
  const summaryHtml =
    count > 0
      ? `<p class="reviews-summary">${esc(t.reviewsAverage(average.toFixed(1), count))}</p>`
      : `<p class="detail-placeholder">${esc(t.reviewsEmpty)}</p>`;

  // 自分が、すでに投稿しているか(読み込んだ一覧の中に、自分の uid と同じ id があるか)
  const myUid = authUser ? authUser.uid : null;
  const myReview = myUid ? state.reviews.find((r) => r.id === myUid) : null;

  // レビュー一覧(新しい順。fetchReviews が、すでに新しい順で返す)
  //   ・管理者は、非表示にしたレビューも、そのまま一覧に含めて見える(「非表示中」の印+元に戻すボタン付き)
  //   ・管理者以外は、非表示のレビューは、一覧から除く
  //   ・自分が投稿したレビューには、削除ボタンを付ける(管理者の非表示ボタンとは、別の操作)
  const shownReviews = isAdmin ? state.reviews : publicReviews;
  const listHtml = shownReviews.length
    ? `<ul class="review-list">${shownReviews
        .map((r) => {
          const isMine = myUid && r.id === myUid;
          return (
            `<li class="review-item${r.hidden ? " is-hidden" : ""}">` +
            `<div class="review-head">${userLinkHtml(r.id, r.authorName, "review-author", { avatar: 32 })}` +
            `<span class="review-head-right">` +
            `<span class="review-stars" aria-label="${esc(t.reviewRatingLabel)}: ${Number(r.rating) || 0}/5">${starsText(r.rating)}</span>` +
            (r.hidden ? `<span class="admin-hidden-badge">${esc(t.adminHiddenBadge)}</span>` : "") +
            `</span></div>` +
            (r.comment ? `<p class="review-comment-text">${esc(r.comment)}</p>` + translateButtonHtml(r.comment) : "") +
            (isMine
              ? `<button type="button" class="btn btn-small btn-warn review-delete-btn" ${state.deleting ? "disabled" : ""}>${esc(
                  state.deleting ? t.deleting : t.deleteButton
                )}</button>`
              : "") +
            (isAdmin
              ? `<button type="button" class="btn btn-small admin-toggle-btn" data-uid="${esc(r.id)}" ${
                  state.adminBusy.has(r.id) ? "disabled" : ""
                }>${esc(r.hidden ? t.adminRestore : t.adminHide)}</button>`
              : "") +
            `</li>`
          );
        })
        .join("")}</ul>`
    : "";

  // レビューを書く画面: 「レビューを書く」を押すと、画面いっぱいに開く(上: ← と見出し / お店の情報 / 星 / 広いコメント欄 / 投稿ボタン)
  //   ・スマホでキーボードが出ても、入力欄が狭くならないように、ページの途中ではなく、別の画面として出す
  const rv = REVIEW_SCREEN_TEXT[currentLang] || REVIEW_SCREEN_TEXT.ja;
  const rvEntry = entries.find((e) => e.shop.id === state.shopId);
  const rvShop = rvEntry ? rvEntry.shop : null;
  const rvReviews = state.reviews.filter((r) => !r.hidden).length;
  const rvPhotos = photosState && photosState.shopId === state.shopId ? photosState.photos.filter((p) => !p.hidden).length : null;
  const formHtml = state.formOpen
    ? `<div class="rv-screen" id="review-screen" role="dialog" aria-modal="true" aria-labelledby="rv-title">
         <div class="rv-head">
           <button type="button" class="rv-back" id="review-close" aria-label="${esc(t.tipsClose)}" ${state.sending ? "disabled" : ""}>
             <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
           </button>
           <h2 class="rv-title" id="rv-title">${esc(t.reviewWrite)}</h2>
           <span class="rv-head-space" aria-hidden="true"></span>
         </div>
         <div class="rv-scroll">
           ${
             rvShop
               ? `<div class="rv-shop">
                    <img class="rv-shop-img" src="${esc(getShopImage(rvShop).src)}" alt="" width="84" height="84">
                    <div class="rv-shop-text">
                      <p class="rv-shop-name">${esc(pick(rvShop.name))}</p>
                      ${pick(rvShop.area) ? `<p class="rv-shop-area">📍 ${esc(pick(rvShop.area))}</p>` : ""}
                      ${categoryText(rvShop) ? `<span class="rv-shop-chip">${esc(categoryText(rvShop))}</span>` : ""}
                      <p class="rv-shop-counts">${rvPhotos !== null ? `<span>📷 ${esc(rv.photos(rvPhotos))}</span>` : ""}<span>★ ${esc(rv.reviews(rvReviews))}</span></p>
                    </div>
                  </div>`
               : ""
           }
           <form class="rv-form review-form" id="review-form">
             <fieldset ${state.sending ? "disabled" : ""}>
               <legend class="rv-label">${esc(t.reviewRatingLabel)}</legend>
               <div class="star-input rv-stars" id="review-star-input" role="radiogroup" aria-label="${esc(t.reviewRatingLabel)}">
                 ${[1, 2, 3, 4, 5]
                   .map(
                     (n) =>
                       `<button type="button" class="star-btn${n <= state.rating ? " is-filled" : ""}" data-value="${n}" ` +
                       `role="radio" aria-checked="${n <= state.rating}" aria-label="${n}">★</button>`
                   )
                   .join("")}
               </div>
               <label class="rv-label" for="review-comment">${esc(t.reviewCommentLabel)}</label>
               <textarea class="review-comment-input rv-textarea" id="review-comment" maxlength="${REVIEW_COMMENT_MAX}" placeholder="${esc(rv.placeholder)}"></textarea>
               <p class="rv-count"><span id="review-count">${state.comment.length}</span> / ${REVIEW_COMMENT_MAX}</p>
             </fieldset>
             ${state.message ? `<p class="detail-note tips-message${state.message.error ? " is-error" : ""}" role="status">${esc(t[state.message.key])}</p>` : ""}
             <button type="submit" class="btn btn-primary rv-submit" ${state.sending ? "disabled" : ""}>${esc(state.sending ? t.reviewSending : t.reviewSubmit)}</button>
           </form>
         </div>
       </div>`
    : "";
  const messageHtml = state.message
    ? `<p class="detail-note tips-message${state.message.error ? " is-error" : ""}" role="status">${esc(t[state.message.key])}</p>`
    : "";

  // 投稿のところ: ログイン中で、投稿済みだと分かっているときだけ、その表示にする。
  //   それ以外(未ログインを含む)は、いつもフォームを出す(送信したときに、ログインを求める)
  const actionHtml =
    authUser && myReview
      ? `<p class="detail-note tips-posted">✅ ${esc(t.reviewPosted)}</p>`
      : `<button type="button" class="btn btn-primary" id="review-open" aria-expanded="${state.formOpen}" aria-controls="review-form">✏️ ${esc(t.reviewWrite)}</button>` +
        formHtml;

  const adminMessageHtml = state.adminMessage
    ? `<p class="detail-note tips-message${state.adminMessage.error ? " is-error" : ""}" role="status">${esc(t[state.adminMessage.key])}</p>`
    : "";

  box.innerHTML = summaryHtml + listHtml + actionHtml + messageHtml + adminMessageHtml;
  // レビューを書く画面を開いている間は、後ろのページを動かさない
  document.body.classList.toggle("is-review-writing", !!state.formOpen);

  const bind = (selector, handler) => {
    const el = box.querySelector(selector);
    if (el) el.addEventListener("click", handler);
  };
  bind("#review-open", () => {
    state.formOpen = true;
    state.message = null;
    renderReviews();
  });
  // 管理者の「非表示にする」「元に戻す」ボタン(フォームが開いていないときも、必ずバインドする)
  box.querySelectorAll(".admin-toggle-btn[data-uid]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const review = state.reviews.find((r) => r.id === btn.dataset.uid);
      if (review) adminToggleReviewHidden(state, review);
    });
  });
  // 自分のレビューの「削除する」ボタン(常に、自分の投稿にしか出ないので、1つだけ)
  const deleteBtn = box.querySelector(".review-delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      if (!confirm(t.deleteConfirm)) return;
      deleteMyReview(state);
    });
  }
  const form = box.querySelector("#review-form");
  if (!form) return;

  // 星ボタン: 見た目(is-filled)だけを直接書き換える(フォーム全体を作り直すと、コメント欄の入力中の文字が消えるため)
  const starButtons = [...form.querySelectorAll(".star-btn")];
  starButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = Number(btn.dataset.value);
      state.rating = value;
      starButtons.forEach((b) => {
        const filled = Number(b.dataset.value) <= value;
        b.classList.toggle("is-filled", filled);
        b.setAttribute("aria-checked", String(filled));
      });
    });
  });

  const textarea = form.querySelector(".review-comment-input");
  textarea.value = state.comment; // フォームを開き直したときのために、前回の入力を復元する
  const counter = box.querySelector("#review-count");
  textarea.addEventListener("input", () => {
    state.comment = textarea.value;
    if (counter) counter.textContent = String(textarea.value.length);
  });

  box.querySelector("#review-close").addEventListener("click", () => {
    state.formOpen = false;
    state.message = null;
    renderReviews();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // ページを移動しない
    submitReview(state);
  });
}

// レビューを送る(送っている間は、ボタンを押せなくする)
//   ・まだログインしていなければ、ここで、はじめてログインを求める(ensureSignedIn)。
//     ログインできたら、選んでいた星・書いていたコメントを、そのまま送信する。
//   ・ポップアップを閉じただけのときは、エラーにせず、入力内容を残したまま、送信中をやめる(もう一度、押せる)
async function submitReview(state) {
  if (state.sending) return;
  if (state.rating < 1) {
    state.message = { key: "reviewNoRating", error: true };
    renderReviews();
    return;
  }
  if (state.comment.length > REVIEW_COMMENT_MAX) {
    state.message = { key: "reviewCommentTooLong", error: true };
    renderReviews();
    return;
  }
  state.sending = true;
  state.message = null;
  renderReviews();

  const user = await waitForAuthUser();
  if (!user) {
    try {
      const signedIn = await ensureSignedIn();
      if (!signedIn) {
        state.sending = false;
        if (reviewsState === state) renderReviews();
        return;
      }
    } catch (error) {
      console.warn("レビュー送信前のログインに失敗:", error);
      state.sending = false;
      state.message = { key: error.messageKey || "authLoginError", error: true };
      if (reviewsState === state) renderReviews();
      return;
    }
  }

  doSubmitReview(state);
}

// ログイン中のユーザーの、投稿者名として使う文字(Google はアカウントの名前、メールはニックネーム)
//   ・auth.js の resolveAuthName を使う。メールのユーザーで、ニックネームがまだ届いていない
//     (登録した直後、など)ときは、直接 Firestore から取りに行く
//   ・レビューと、写真投稿の、両方で使う(投稿者名の決め方は、どちらも同じため)
async function resolvePostAuthorName(user) {
  const name = resolveAuthName(user);
  if (name) return name;
  if (isEmailProvider(user) && window.authApi && typeof window.authApi.fetchUserProfile === "function") {
    try {
      const profile = await window.authApi.fetchUserProfile(user.uid);
      if (profile && typeof profile.displayName === "string" && profile.displayName) return profile.displayName;
    } catch (error) {
      console.warn("投稿者名の取得に失敗:", error);
    }
  }
  return user.email || "";
}

function doSubmitReview(state) {
  const rating = state.rating;
  const comment = state.comment.trim();
  let authorName = "";
  getReviewsApi()
    .then((api) =>
      resolvePostAuthorName(authUser).then((name) => {
        authorName = name;
        return api.addReview(state.shopId, { rating, comment, authorName });
      })
    )
    .then(() => {
      // 送れたら、画面の一覧にも反映して、「投稿済み」にする(読み込み直さない。このお店には、もう追加できない)
      const uid = authUser.uid;
      state.reviews = [{ id: uid, rating, comment, authorName, createdAt: new Date() }, ...state.reviews.filter((r) => r.id !== uid)];
      state.formOpen = false;
      state.rating = 0;
      state.comment = "";
      state.message = { key: "reviewThanks", error: false };
      // 件数エリアの「⭐ レビュー ○件」も、合わせて増やす(読み込み直さない)
      if (reviewState.shopId === state.shopId && reviewState.status === "ready") {
        reviewState.count += 1;
        renderDetailStats();
      }
    })
    .catch((error) => {
      console.warn("レビューの送信に失敗:", error && error.code, error);
      const code = error && error.code;
      if (code === "app/login-required") {
        state.message = { key: "reviewLoginNeeded", error: true };
      } else if (code === "permission-denied") {
        // すでに投稿済み(ほかのタブ・端末から投稿したなど)の可能性が高い。読み込み直して、画面を合わせる
        state.message = { key: "reviewDenied", error: true };
        loadReviews(state);
      } else {
        state.message = { key: "reviewSubmitError", error: true };
      }
    })
    .then(() => {
      state.sending = false;
      if (reviewsState === state) renderReviews();
    });
}

// 自分のレビューを削除する(押す前に、確認メッセージを出す)。削除すると、また投稿できる状態に戻る
function deleteMyReview(state) {
  if (state.deleting) return;
  const uid = authUser ? authUser.uid : null;
  if (!uid) return;
  const myReview = state.reviews.find((r) => r.id === uid);
  const wasHidden = !!(myReview && myReview.hidden); // 非表示中のレビューは、件数からすでに除かれているので、削除時に二重に減らさない
  state.deleting = true;
  state.message = null;
  renderReviews();
  getReviewsApi()
    .then((api) => api.deleteReview(state.shopId))
    .then(() => {
      state.reviews = state.reviews.filter((r) => r.id !== uid);
      state.message = { key: "reviewDeleted", error: false };
      // 件数エリアの「⭐ レビュー ○件」も、合わせて減らす(読み込み直さない)
      if (!wasHidden && reviewState.shopId === state.shopId && reviewState.status === "ready") {
        reviewState.count = Math.max(0, reviewState.count - 1);
        renderDetailStats();
      }
    })
    .catch((error) => {
      console.warn("レビューの削除に失敗:", error);
      state.message = { key: "reviewDeleteError", error: true };
    })
    .then(() => {
      state.deleting = false;
      if (reviewsState === state) renderReviews();
    });
}

// 【管理者だけ】1件のレビューを、非表示にする / 元に戻す
function adminToggleReviewHidden(state, review) {
  if (state.adminBusy.has(review.id)) return;
  state.adminBusy.add(review.id);
  state.adminMessage = null;
  renderReviews();
  const nextHidden = !review.hidden;
  getReviewsApi()
    .then((api) => api.setReviewHidden(state.shopId, review.id, nextHidden))
    .then(() => {
      loadReviews(state); // 一覧を読み込み直す
      if (reviewState.shopId === state.shopId) startReviewCount(state.shopId); // 件数エリア(⭐ レビュー ○件)も、合わせて読み込み直す
    })
    .catch((error) => {
      console.warn("レビューの非表示切り替えに失敗:", error);
      state.adminMessage = { key: "adminUpdateError", error: true };
    })
    .then(() => {
      state.adminBusy.delete(review.id);
      if (reviewsState === state) renderReviews();
    });
}

// ---------------------------------------------------------------------
// 件数エリア(基本情報の上): 💡 Tips ○件 / ⭐ レビュー ○件
// ---------------------------------------------------------------------
//   ・Tips の件数: 読み込み済みの、各Tipsの人数の合計(Firestore への追加の読み取りは、しない)
//   ・レビューの件数: fetchReviewCount が返す数を、そのまま出す
//   ・読み込み中は「…」、読み込めなかったときは「–」を出す

// レビューの件数は、app.js の fetchReviewCount(店舗ID)で取得する(地図のポップアップと共通)

// 1つのお店の、レビュー件数の状態
function createReviewState(shopId) {
  return { shopId, status: "loading", count: 0 }; // status: "loading" | "ready" | "error"
}

let reviewState = createReviewState(null);

function startReviewCount(shopId) {
  const state = (reviewState = createReviewState(shopId));
  renderDetailStats();
  fetchReviewCount(shopId)
    .then((count) => {
      state.count = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
      state.status = "ready";
    })
    .catch((error) => {
      console.warn("レビュー件数の取得に失敗:", error);
      state.status = "error";
    })
    .then(() => {
      if (reviewState === state) renderDetailStats(); // 取得している間に別のお店へ移っていたら、何もしない
    });
}

function renderDetailStats() {
  const box = detailPage.querySelector("#detail-stats");
  if (!box) return;
  const t = ui[currentLang];
  const tipsTotal = Object.values(tipsState.counts).reduce((sum, n) => sum + n, 0);
  const value = (status, count) => (status === "loading" ? "…" : status === "error" ? "–" : t.statCount(count));
  const stat = (icon, label, text) =>
    `<span class="detail-stat">${icon} ${esc(label)} <strong>${esc(text)}</strong></span>`;
  box.innerHTML =
    stat("💡", t.statTips, value(tipsState.status, tipsTotal)) +
    stat("⭐", t.reviewsTitle, value(reviewState.status, reviewState.count));
}

// ---------------------------------------------------------------------
// 起動
// ---------------------------------------------------------------------

// ヘッダーのロゴ・タイトルを押すと、一覧に戻る
//   (ホームに戻る)
document.getElementById("brand-link").addEventListener("click", (event) => {
  event.preventDefault();
  if (typeof isHomeDefault === "function" && isHomeDefault()) {
    if (!document.body.classList.contains("view-home")) navigate(homeUrl());
  } else if (currentShopId !== null || currentContentPage !== null) goToList();
});

// フッターの3つのリンク(利用規約・プライバシーポリシー・運営者情報)。新しいタブで開く操作は、そのまま
function bindFooterLink(id, url) {
  document.getElementById(id).addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(url);
  });
}
bindFooterLink("footer-link-terms", termsUrl());
bindFooterLink("footer-link-privacy", privacyUrl());
bindFooterLink("footer-link-about", aboutUrl());

// ブラウザの「戻る・進む」
window.addEventListener("popstate", renderRoute);

// 詳細ページのURLで、直接開かれたとき: 一覧の地図は隠れた状態で作られているので、一覧を最初に見せるときに合わせ直す
//   (ホームから始まったときも、地図は隠れた状態で作られているので、同じように合わせ直す)
listMapNeedsFit = ["shop", "home"].includes(routeFromLocation().name) || document.documentElement.classList.contains("boot-hide-map");
renderRoute();
// 最初の表示ができたので、開いたときだけ地図の画面を隠していたのを、やめる(index.html の boot-hide-map)
document.documentElement.classList.remove("boot-hide-map");
// 読み込み中の画面(ロゴ)を、ふわっと消す(index.html の #app-loading)
(function hideAppLoading() {
  const el = document.getElementById("app-loading");
  if (!el) return;
  el.classList.add("is-done");
  setTimeout(() => el.remove(), 400);
})();


// 投稿者の名前: 押すと、その人のプロフィール(URL「?user=ユーザーID」。js/account.js)を開く
// 投稿者の名前(とアイコン)。名前は、投稿したときの名前ではなく、いまのプロフィールの名前を出す
//   ・プロフィールは、あとから読み込む(読み込めたら、画面の名前・アイコンだけを差し替える)
//   ・プロフィールが無い人は、投稿したときの名前のまま
//   opts.avatar: 名前の左にアイコンを出す(大きさ px)
const userProfileCache = new Map(); // uid → undefined(読み込み中)/ プロフィール / false(無い)
function requestUserProfile(uid) {
  if (userProfileCache.has(uid) || typeof getProfileApi !== "function") return;
  userProfileCache.set(uid, undefined);
  getProfileApi()
    .then((api) => api.fetchProfile(uid))
    .then((p) => {
      userProfileCache.set(uid, p || false);
      applyUserProfile(uid);
    })
    .catch(() => userProfileCache.set(uid, false));
}
function userAvatarHtml(photoURL, name, size) {
  return typeof accountAvatar === "function" ? accountAvatar(photoURL, name, size) : "";
}
function applyUserProfile(uid) {
  const p = userProfileCache.get(uid);
  if (!p) return;
  const sel = (attr) => `[${attr}="${CSS.escape(uid)}"]`;
  document.querySelectorAll(sel("data-user-name")).forEach((el) => {
    if (p.displayName) el.textContent = p.displayName;
  });
  document.querySelectorAll(sel("data-user-avatar")).forEach((el) => {
    el.innerHTML = userAvatarHtml(p.photoURL, p.displayName || el.dataset.name || "", Number(el.dataset.size) || 32);
  });
}
function userLinkHtml(uid, name, className, opts = {}) {
  const valid = uid && /^[A-Za-z0-9_-]{1,128}$/.test(String(uid));
  if (valid) requestUserProfile(uid);
  const p = valid ? userProfileCache.get(uid) : null;
  const shown = (p && p.displayName) || name || "";
  const nameHtml = valid ? `<span data-user-name="${esc(uid)}">${esc(shown)}</span>` : esc(shown);
  const size = opts.avatar || 0;
  const avatarHtml = size
    ? `<span class="user-avatar" ${valid ? `data-user-avatar="${esc(uid)}"` : ""} data-size="${size}" data-name="${esc(shown)}">${userAvatarHtml(p && p.photoURL, shown, size)}</span>`
    : "";
  const cls = className + (size ? " has-avatar" : "");
  if (!valid || typeof renderUserPage !== "function") {
    return `<span class="${cls}">${avatarHtml}${nameHtml}</span>`;
  }
  return `<a class="${cls} user-link" href="${appBase()}?user=${encodeURIComponent(uid)}" data-user-link="${esc(uid)}">${avatarHtml}${nameHtml}</a>`;
}
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-user-link]");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
  event.preventDefault();
  // 押した名前を控えておく(まだプロフィールを作っていない人でも、名前は出せるように。js/account.js)
  const nameEl = link.querySelector("[data-user-name]");
  window.lastUserLink = { uid: link.dataset.userLink, name: (nameEl || link).textContent };
  navigate(appBase() + "?user=" + encodeURIComponent(link.dataset.userLink));
});


// お店のページの大きな画像: 管理者が選んだトップ画像(投稿写真)→ data.js の画像 → デフォルト画像
//   画像は、文字として埋め込まず、あとから設定する(画像の名前などに、変わった文字が入っても安全にするため)
function setDetailHero(shop) {
  const t = ui[currentLang];
  const name = pick(shop.name);
  const image = getShopImage(shop, "hero");
  const hero = detailPage.querySelector(".detail-hero-img");
  const creditEl = detailPage.querySelector(".detail-credit");
  if (!hero) return;
  const showDefault = () => {
    hero.src = DEFAULT_HERO_IMAGE; // 詳細ページ用の、横長のデフォルト画像
    hero.alt = t.noPhoto;
    hero.classList.add("is-default");
    if (creditEl) creditEl.hidden = true;
  };
  hero.onerror = () => {
    if (!hero.classList.contains("is-default")) showDefault(); // 読み込めなかったときは、デフォルト画像に切り替える(1回だけ)
  };
  hero.classList.remove("is-default");
  if (creditEl) creditEl.hidden = true;
  if (image.isDefault) {
    showDefault();
    return;
  }
  hero.src = image.src;
  hero.alt = name;
  // クレジット: トップ画像(投稿写真)は投稿者の名前、data.js の画像は imageCredit
  const credit = image.cover
    ? image.cover.authorName
      ? `📷 ${image.cover.authorName}`
      : ""
    : typeof shop.imageCredit === "string"
    ? shop.imageCredit.trim()
    : "";
  // トップ画像(投稿写真)の投稿者名は、その人のいまのプロフィールの名前に合わせる(投稿した後に名前を変えても、新しい名前で出す)
  const coverUid = image.cover && image.cover.uid;
  if (credit && creditEl && coverUid && /^[A-Za-z0-9_-]{1,128}$/.test(String(coverUid))) {
    requestUserProfile(coverUid);
    const p = userProfileCache.get(coverUid);
    const shown = (p && p.displayName) || image.cover.authorName;
    creditEl.innerHTML = `📷 <span data-user-name="${esc(coverUid)}">${esc(shown)}</span>`;
    creditEl.hidden = false;
    creditEl.title = shown;
  } else if (credit && creditEl) {
    creditEl.textContent = credit; // 文字として入れる
    creditEl.hidden = false;
    const source = !image.cover && typeof shop.imageSource === "string" ? shop.imageSource.trim() : "";
    creditEl.title = source ? `${credit} / ${source}` : credit;
  }
}
function refreshDetailHero() {
  const entry = entries.find((e) => e.shop.id === currentShopId);
  if (entry) setDetailHero(entry.shop);
}


// ---------------------------------------------------------------------
// 【管理者だけ】投稿写真を、お店のトップ画像にする / 外す
//   ・投稿写真は、自動ではトップ画像にならない。管理者が1枚ずつ見直して、確認の3項目にチェックしてから決める
//   ・人物・メニュー(値段が写りやすい)のカテゴリーの写真と、非表示の写真は、トップ画像にできない
// ---------------------------------------------------------------------
const COVER_TEXT = {
  ja: {
    badge: "トップ画像",
    set: "トップ画像にする",
    unset: "トップ画像から外す",
    notAllowed: "人物・メニューの写真や、非表示の写真は、トップ画像にできません",
    checkTitle: "トップ画像にする前に、写真を確認してください",
    checks: [
      "値段(メニュー・値札・レシートなど)が写っていない",
      "人の顔・車のナンバー・名札など、個人が分かるものが写っていない",
      "料理・店内・外観など、お店の紹介にふさわしい写真である",
    ],
    confirm: "確認しました。トップ画像にする",
    cancel: "やめる",
    error: "変更できませんでした。もう一度お試しください",
  },
  en: {
    badge: "Main image",
    set: "Use as main image",
    unset: "Remove as main image",
    notAllowed: "Photos of people or menus, and hidden photos, can't be used as the main image",
    checkTitle: "Please review the photo before using it as the main image",
    checks: [
      "No prices are visible (menus, price tags, receipts, etc.)",
      "Nothing identifies a person (faces, license plates, name tags, etc.)",
      "It suits introducing the shop (food, interior or exterior)",
    ],
    confirm: "Reviewed — use as main image",
    cancel: "Cancel",
    error: "Couldn't update. Please try again",
  },
  vi: {
    badge: "Ảnh chính",
    set: "Đặt làm ảnh chính",
    unset: "Bỏ khỏi ảnh chính",
    notAllowed: "Không thể dùng ảnh người, ảnh thực đơn hoặc ảnh đã ẩn làm ảnh chính",
    checkTitle: "Hãy kiểm tra ảnh trước khi đặt làm ảnh chính",
    checks: [
      "Không thấy giá tiền (thực đơn, bảng giá, hóa đơn...)",
      "Không có gì xác định được cá nhân (mặt người, biển số xe, bảng tên...)",
      "Phù hợp để giới thiệu quán (món ăn, bên trong, bên ngoài)",
    ],
    confirm: "Đã kiểm tra — đặt làm ảnh chính",
    cancel: "Hủy",
    error: "Không thay đổi được. Vui lòng thử lại",
  },
};
function coverText() {
  return COVER_TEXT[currentLang] || COVER_TEXT.ja;
}
function coverAllowed(p) {
  return !p.hidden && !["people", "menu"].includes(p.category);
}
function adminCoverButtonHtml(state, p) {
  const x = coverText();
  const busy = state.coverBusy === p.id;
  if (p.isCover) {
    return ` <button type="button" class="btn btn-small admin-cover-btn" data-cover-id="${esc(p.id)}" data-cover-on="0"${busy ? " disabled" : ""}>${esc(x.unset)}</button>`;
  }
  const ok = coverAllowed(p);
  return ` <button type="button" class="btn btn-small admin-cover-btn" data-cover-id="${esc(p.id)}" data-cover-on="1"${busy || !ok ? " disabled" : ""}${ok ? "" : ` title="${esc(x.notAllowed)}"`}>${esc(x.set)}</button>`;
}
function adminCoverCheckHtml() {
  const x = coverText();
  return (
    `<div class="cover-check" role="group" aria-label="${esc(x.checkTitle)}">` +
    `<p class="cover-check-title">${esc(x.checkTitle)}</p>` +
    x.checks.map((c) => `<label class="cover-check-item"><input type="checkbox" data-cover-check> <span>${esc(c)}</span></label>`).join("") +
    `<div class="cover-check-actions"><button type="button" class="btn btn-small btn-primary" data-cover-confirm disabled>${esc(x.confirm)}</button>` +
    `<button type="button" class="btn btn-small" data-cover-cancel>${esc(x.cancel)}</button></div></div>`
  );
}
function bindAdminCover(box, state) {
  box.querySelectorAll(".admin-cover-btn[data-cover-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.coverId;
      // 押すだけで、トップ画像にする/やめる(確認の項目は出さない)
      setPhotoCover(state, id, btn.dataset.coverOn === "1");
    });
  });
  const check = box.querySelector(".cover-check");
  if (!check) return;
  const boxes = [...check.querySelectorAll("[data-cover-check]")];
  const confirm = check.querySelector("[data-cover-confirm]");
  boxes.forEach((b) => b.addEventListener("change", () => (confirm.disabled = !boxes.every((x) => x.checked))));
  confirm.addEventListener("click", () => {
    if (!boxes.every((x) => x.checked)) return;
    const id = state.coverCheckId;
    state.coverCheckId = null;
    setPhotoCover(state, id, true);
  });
  check.querySelector("[data-cover-cancel]").addEventListener("click", () => {
    state.coverCheckId = null;
    renderPhotos();
  });
}
function setPhotoCover(state, photoId, on) {
  const photo = state.photos.find((p) => p.id === photoId);
  if (!photo || (on && !coverAllowed(photo))) return;
  state.coverBusy = photoId;
  state.message = null;
  renderPhotos();
  getPhotosApi()
    .then((api) => api.setPhotoCover(state.shopId, photoId, on))
    .then(() => {
      state.photos.forEach((p) => {
        if (on && p.id !== photoId) p.isCover = false;
      });
      photo.isCover = on;
      if (!window.shopCovers) window.shopCovers = new Map();
      if (on) window.shopCovers.set(state.shopId, { shopId: state.shopId, photoId, secure_url: photo.secure_url, authorName: photo.authorName });
      else window.shopCovers.delete(state.shopId);
      if (typeof refreshShopImages === "function") refreshShopImages();
    })
    .catch((error) => {
      console.warn("トップ画像の変更に失敗:", error);
      state.message = { key: "adminUpdateError", error: true };
    })
    .then(() => {
      state.coverBusy = null;
      if (photosState === state) renderPhotos();
    });
}

// ---------------------------------------------------------------------
// 写真の拡大表示(画面いっぱい)の部品
// ---------------------------------------------------------------------
const PHOTO_VIEWER_TEXT = {
  ja: { share: "シェア", more: "その他", shareText: (n) => `${n} の写真 #ベトナムフーディー`, copied: "リンクをコピーしました" },
  en: { share: "Share", more: "More", shareText: (n) => `Photo at ${n} #VietnamFoodie`, copied: "Link copied" },
  vi: { share: "Chia sẻ", more: "Khác", shareText: (n) => `Ảnh tại ${n} #VietnamFoodie`, copied: "Đã sao chép liên kết" },
};
function photoViewerText() {
  return PHOTO_VIEWER_TEXT[currentLang] || PHOTO_VIEWER_TEXT.ja;
}
// 自分で描いた、シンプルな線のアイコン
const PV_SVG = (d, fill) =>
  `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="${fill || "none"}" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const PV_ICONS = {
  back: PV_SVG('<path d="M15 5l-7 7 7 7"/>'),
  heart: PV_SVG('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  heartOn: PV_SVG('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', "currentColor"),
  comment: PV_SVG('<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>'),
  share: PV_SVG('<path d="M12 4v11"/><path d="M8 8l4-4 4 4"/><path d="M6 13v6h12v-6"/>'),
  more: PV_SVG('<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>'),
  pin: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
};
function bindPhotoViewer(box, state, visiblePhotos) {
  const viewer = box.querySelector("#photo-lightbox");
  if (!viewer) return;
  const go = (step) => {
    const next = state.lightboxIndex + step;
    if (next < 0 || next >= visiblePhotos.length) return;
    state.lightboxIndex = next;
    state.viewerSheet = null;
    state.viewerCaptionOpen = false;
    const photo = visiblePhotos[next];
    if (photo && !state.commentsByPhoto[photo.id]) loadPhotoComments(state, photo.id);
    renderPhotos();
  };
  viewer.querySelectorAll("[data-pv-sheet]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.viewerSheet = btn.dataset.pvSheet;
      renderPhotos();
    })
  );
  viewer.querySelectorAll("[data-pv-sheet-close]").forEach((btn) =>
    btn.addEventListener("click", () => {
      state.viewerSheet = null;
      renderPhotos();
    })
  );
  const caption = viewer.querySelector("[data-pv-caption]");
  if (caption)
    caption.addEventListener("click", () => {
      state.viewerCaptionOpen = !state.viewerCaptionOpen;
      caption.classList.toggle("is-open", state.viewerCaptionOpen);
    });
  const shareBtn = viewer.querySelector("[data-pv-share]");
  if (shareBtn)
    shareBtn.addEventListener("click", async () => {
      const v = photoViewerText();
      const entry = entries.find((e) => e.shop.id === state.shopId);
      const name = entry ? pick(entry.shop.name) : "";
      const url = location.origin + shopUrl(state.shopId);
      const text = v.shareText(name);
      if (navigator.share) {
        try {
          await navigator.share({ title: name, text, url });
        } catch (e) {
          // 共有画面を閉じただけのときは、何もしない
        }
        return;
      }
      const toast = viewer.querySelector(".pv-toast");
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.textContent = v.copied;
      } catch (e) {
        toast.textContent = url;
      }
      toast.classList.add("is-on");
      setTimeout(() => toast.classList.remove("is-on"), 2500);
    });
  // 上下のスワイプで、前後の写真へ(シートを開いているときは、しない)
  let start = null;
  viewer.addEventListener(
    "touchstart",
    (e) => {
      if (state.viewerSheet || e.touches.length !== 1) return (start = null);
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    { passive: true }
  );
  viewer.addEventListener("touchend", (e) => {
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.5) go(dy < 0 ? 1 : -1);
  });
  // 写真の上で指を動かしても、後ろのページがスクロールしないようにする(シートの中は、スクロールできる)
  viewer.addEventListener(
    "touchmove",
    (e) => {
      if (!e.target.closest(".pv-sheet")) e.preventDefault();
    },
    { passive: false }
  );
  viewer._go = go;
}
// パソコン: ↑↓←→ で前後の写真、Esc で閉じる(シート → 拡大表示の順に閉じる)
document.addEventListener("keydown", (e) => {
  const viewer = document.getElementById("photo-lightbox");
  if (!viewer || typeof photosState === "undefined" || !photosState) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "textarea" || tag === "input") return;
  if (e.key === "Escape") {
    if (photosState.viewerSheet) photosState.viewerSheet = null;
    else photosState.lightboxIndex = null;
    renderPhotos();
  } else if ((e.key === "ArrowDown" || e.key === "ArrowRight") && viewer._go) {
    e.preventDefault();
    viewer._go(1);
  } else if ((e.key === "ArrowUp" || e.key === "ArrowLeft") && viewer._go) {
    e.preventDefault();
    viewer._go(-1);
  }
});
