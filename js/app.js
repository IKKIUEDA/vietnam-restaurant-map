// 1. 地図を作る(最初は日本全体が見える位置に表示)
// ※ maxZoom(いちばん拡大できる段階)は、ここで決めておく。ピンをまとめる部品(markercluster)が、これが無いと動かないため
//   (前は、地図の画像の設定(maxZoom: 19)から自動で決まっていたが、データから描く地図ではそれが無い)
const map = L.map("map", { maxZoom: 19 }).setView([36.0, 137.0], 5);

// 2. 背景の地図
//   ・OpenStreetMap Japan(OSMFJ)の「MapTiler Basic(日本語)」を、画像ではなく「データ(ベクトルタイル)」で受け取り、
//     MapLibre でブラウザの中に描く。データで受け取ると、文字の種類ごとに、出す・出さない・大きさを決められる
//     (customizeBaseMap で、丁目・埋立地などの細かい地名や番地を消し、区・市の名前を大きく・英語つきにしている)
//   ・MapLibre を読み込めなかったとき・古い端末で使えないときは、これまでどおりの「画像」の地図にする
//   ・無料・APIキー不要。出典の表示だけ必要
const MAP_ATTRIBUTION =
  '&copy; <a href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a>' +
  ' &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

const vectorMaps = []; // ベクトル地図(一覧の地図・詳細ページの地図)。言語を切り替えたときに、地名の書き方を変えるため

// 背景の地図を作る関数。一覧の地図と、詳細ページの地図で、同じものを使う
function createBaseLayer() {
  if (canUseVectorMap()) {
    try {
      const layer = L.maplibreGL({
        style: "https://tile.openstreetmap.jp/styles/maptiler-basic-ja/style.json",
        attribution: MAP_ATTRIBUTION,
        attributionControl: false, // 出典は、Leaflet の右下の表示に出す(上の attribution)
      });
      layer.on("add", (event) => {
        // 出典(OpenMapTiles・OpenStreetMap)を、地図の右下に出す(このプラグインは自動では出さないため)
        const m = event.target._map;
        if (m && m.attributionControl) m.attributionControl.addAttribution(MAP_ATTRIBUTION);
        const gl = layer.getMaplibreMap();
        if (!gl) return;
        if (!vectorMaps.includes(gl)) vectorMaps.push(gl);
        if (gl.isStyleLoaded()) customizeBaseMap(gl);
        else gl.once("load", () => customizeBaseMap(gl));
      });
      return layer;
    } catch (e) {
      // うまく作れなかったときは、下の「画像」の地図にする
    }
  }
  return L.tileLayer("https://tile.openstreetmap.jp/styles/maptiler-basic-ja/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: MAP_ATTRIBUTION,
  });
}

// MapLibre(と、Leaflet 用のプラグイン)が読み込めていて、端末が WebGL(地図を描く機能)に対応しているか
function canUseVectorMap() {
  if (typeof L.maplibreGL !== "function" || typeof maplibregl === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch (e) {
    return false;
  }
}

// 区・市の名前の書き方(日本語の画面: 英語(小さく)の下に日本語 / それ以外: 英語だけ)
function cityLabelField() {
  const en = ["coalesce", ["get", "name:en"], ["get", "name:latin"], ["get", "name"]];
  return currentLang === "ja"
    ? ["format", ["upcase", en], { "font-scale": 0.5 }, "\n", {}, ["get", "name"], {}]
    : ["format", en, {}];
}

// 背景の地図の見た目を、このアプリ向けに変える(地図のデザインが変わってレイヤーが無くなっても、壊れないようにする)
function customizeBaseMap(gl) {
  const set = (fn) => {
    try {
      fn();
    } catch (e) {
      // そのレイヤーが無いときは、何もしない
    }
  };
  // ① 丁目・埋立地・島などの細かい地名を消す(町・村などの名前だけ残す)
  set(() => gl.setFilter("place_label_other", ["all", ["==", "$type", "Point"], ["in", "class", "town", "village", "suburb"]]));
  // ② 区・市の名前を、大きく・太く(拡大するほど大きい)。「東京都」の文字は出さない
  set(() => gl.setFilter("place_label_city", ["all", ["==", "$type", "Point"], ["==", "class", "city"], ["!=", "name", "東京都"]]));
  set(() => gl.setLayoutProperty("place_label_city", "text-field", cityLabelField()));
  set(() => gl.setLayoutProperty("place_label_city", "text-font", ["migu1c-bold"]));
  set(() => gl.setLayoutProperty("place_label_city", "text-size", ["interpolate", ["linear"], ["zoom"], 9, 13, 11, 18, 13, 24, 15, 28]));
  set(() => gl.setPaintProperty("place_label_city", "text-color", "#4a5562"));
  set(() => gl.setPaintProperty("place_label_city", "text-halo-color", "#ffffff"));
  set(() => gl.setPaintProperty("place_label_city", "text-halo-width", 2));
  // ③ 番地と、お店・施設の名前を消す(駅の名前だけ残す)
  set(() => gl.setLayoutProperty("housenumber", "visibility", "none"));
  set(() => gl.setFilter("poi_label", ["all", ["==", "$type", "Point"], ["==", "class", "railway"]]));
  // ④ 道路の名前は、少し薄く(お店のピンや目印を目立たせる)
  set(() => gl.setPaintProperty("road_major_label", "text-color", "#8a8f96"));
}

// 言語を切り替えたら、区・市の名前の書き方も変える
document.getElementById("lang-select").addEventListener("change", () => {
  vectorMaps.forEach((gl) => {
    try {
      gl.setLayoutProperty("place_label_city", "text-field", cityLabelField());
    } catch (e) {
      // 地図の準備ができていないときは、何もしない(準備ができたときに customizeBaseMap が反映する)
    }
  });
});

createBaseLayer().addTo(map);

// お店のピン(料理店は「🍽️」の白地に緑の丸、食材店(type: "grocery")は「🛒」の白地にオレンジの丸)。
// 一覧の地図と、詳細ページの地図で、同じものを使う
//   ・まとめ表示(クラスター)の丸い数字アイコンは、これとは別(.shop-cluster)で、変更していない
//   ・現在地・起点の目印(.user-location の青い点)とも、別の見た目(形・色)にして、見分けられるようにしている
function createShopIcon(shop) {
  const isGrocery = shop && shop.type === "grocery";
  return L.divIcon({
    className: isGrocery ? "shop-marker shop-marker-grocery" : "shop-marker",
    html: isGrocery ? "🛒" : "🍽️",
    iconSize: [30, 30],
    iconAnchor: [15, 15], // 丸の中心が、実際の場所(緯度・経度)に来るようにする
    popupAnchor: [0, -18], // ポップアップは、丸の少し上に開く
  });
}

// 詳細ページへのリンクを作るための部品(詳細ページの表示は、detail.js)
const SHOP_PARAM = "shop";

// 詳細ページのURL(相対URL。サイトを置く場所が変わっても、そのまま動く)。例: ?shop=viet-nhat
function shopUrl(id) {
  return `?${SHOP_PARAM}=${encodeURIComponent(id)}`;
}

// 利用規約・プライバシーポリシー・運営者情報、固定ページへのリンクを作るための部品(表示は、detail.js)
const PAGE_PARAM = "page";

// 固定ページのURL。例: ?page=terms
function contentPageUrl(page) {
  return `?${PAGE_PARAM}=${page}`;
}
function termsUrl() {
  return contentPageUrl("terms");
}
function privacyUrl() {
  return contentPageUrl("privacy");
}
function aboutUrl() {
  return contentPageUrl("about");
}

// data.js の文字を、HTMLに埋め込んでも安全な形にする(< や & などを、ただの文字にする)
function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// 「Cmd + クリック」など、新しいタブで開く操作か(そのときは、ブラウザの普通のリンクの動きに任せる)
function isNewTabClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

// 3. data.js のお店を1件ずつ、「ピン」と「一覧の1行」にして表示する
const listElement = document.getElementById("shop-list-items");

// お気に入り: お店の名前を目印にして、ブラウザの localStorage に保存する
//   ※ 詳細ページ用の id を data.js に追加しましたが、お気に入りの目印は、今までどおり「店名」のままです
//     (id に変えると、すでに登録したお気に入りが消えてしまうため)
//   ※ localStorage が使えない環境(プライベートモードなど)でも、エラーにせず、そのページを開いている間だけ覚える
const FAVORITES_KEY = "vietnamFoodie.favorites";
let favoritesOnly = false; // 「♥ お気に入りのみ表示」がオンか

function favoriteKey(shop) {
  return typeof shop.name === "string" ? shop.name : shop.name.ja;
}

function loadFavorites() {
  try {
    const list = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return new Set(Array.isArray(list) ? list.filter((x) => typeof x === "string") : []);
  } catch (error) {
    return new Set();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  } catch (error) {
    // 保存できなくても、画面の動きは止めない
  }
}

const favorites = loadFavorites();
const isFavorite = (shop) => favorites.has(favoriteKey(shop));

// いま詳細ページで表示しているお店の id(一覧を表示しているときは null)。detail.js が更新する
let currentShopId = null;

// 近い場所のピンを、数字つきの丸い1つのアイコンにまとめる(Leaflet.markercluster)
//   ・丸をクリックすると、その地域が拡大されて、個別のピンが出る
//   ・お店のピンは、地図(map)ではなく、このグループ(clusterGroup)に出し入れする
const clusterGroup = L.markerClusterGroup({
  maxClusterRadius: 60, // この距離(画面上のpx)より近いピンを、1つにまとめる
  showCoverageOnHover: false, // マウスを乗せたときの、範囲の線は出さない
  spiderfyOnMaxZoom: true, // それ以上ズームできないほど重なっているピンは、放射状に広げる
  disableClusteringAtZoom: 18, // ここまで拡大したら、まとめずに、すべてのピンを個別に出す(一度分かれたピンが、またまとまらないように)
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    const size = count >= 30 ? "large" : count >= 10 ? "medium" : "small";
    const px = { small: 40, medium: 48, large: 56 }[size];
    return L.divIcon({
      html: `<span>📍${count}</span>`,
      className: `shop-cluster shop-cluster-${size}`,
      iconSize: L.point(px, px),
    });
  },
});
map.addLayer(clusterGroup);

// 選択中のお店(地図のポップアップが開いているお店)。一覧の行を強調表示する
let selectedEntry = null;
//   toTop が true(ピンを選んだとき)は、そのお店のカードが一覧の一番上に来るまでスクロールする。
//   false(詳細ページから戻ったときなど)は、画面外にあるときだけ、見える位置までスクロールする
function setSelected(entry, toTop = false) {
  if (selectedEntry === entry) return;
  if (selectedEntry) selectedEntry.item.classList.remove("selected"); // 前の選択を解除
  selectedEntry = entry;
  if (entry) {
    expandToEntry(entry); // 階層(アコーディオン)表示のときは、そのお店の都道府県・エリアを開く
    entry.item.classList.add("selected");
    if (toTop) {
      // 一覧の中だけをスクロールする(ページ全体は動かさない)
      const panel = document.getElementById("shop-list");
      const offset = entry.item.getBoundingClientRect().top - panel.getBoundingClientRect().top;
      panel.scrollTo({ top: Math.max(0, panel.scrollTop + offset - 4), behavior: "smooth" }); // 4px: 枠と影が切れないように
    } else {
      entry.item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
}

// そのお店へ地図をなめらかに移動して、ポップアップを開く
//   ピンがクラスターの中にあるときは、ズームインして展開し、個別のピンを出してから開く
function showShop(entry) {
  const latlng = L.latLng(entry.shop.lat, entry.shop.lng);
  const openPopup = () => clusterGroup.zoomToShowLayer(entry.marker, () => entry.marker.openPopup());
  if (map.getZoom() >= 16 && map.getCenter().distanceTo(latlng) < 1) {
    openPopup(); // すでに、そのお店の真上にいるとき
    return;
  }
  map.once("moveend", openPopup); // 移動が終わってから開く
  map.flyTo(latlng, 16);
}

// ポップアップが、地図上部に浮かんでいる「🔍スキャンする」ボタン(と、「周辺のお店を検索中」の表示)に
// 重ならないようにする。Leaflet は、ポップアップが地図の外にはみ出しそうなとき、自動で地図を少しずらして
// 全体が見えるようにする(autoPan)。その「ここまでは、ポップアップを近づけない」という余白を、上側だけ、
// #scan-panel の実際の高さ(状態表示が出た場合の分も、少し多めに)に合わせて広げておく。
//   ・スマホ(画面が縦長で、ボタンが目立つ)・PC、どちらでも同じしくみを使う(#scan-panel の大きさは、画面幅で変わらないため)
const scanPanelEl = document.getElementById("scan-panel");
function popupAutoPanOptions() {
  const panelHeight = scanPanelEl.getBoundingClientRect().height || 40; // 測れなければ、念のため既定値を使う
  const topPadding = Math.ceil(panelHeight) + 10 /* #scan-panel の top */ + 40; // 「検索中」表示が出る分の余裕
  return {
    autoPanPaddingTopLeft: L.point(24, topPadding),
    autoPanPaddingBottomRight: L.point(24, 24),
  };
}
const POPUP_OPTIONS = popupAutoPanOptions();

// 緯度・経度がまったく同じお店(同じビルに2軒ある、など)は、ピンが完全に重なって、どれだけ拡大しても分かれない。
// そこで、2軒目以降のピンだけ、地図の上で少し(十数メートル)ずらして立てる。
//   ・ずらすのは、地図のピンの位置だけ。お店のデータ(shop.lat / shop.lng)は変えないので、ルート・距離は、元の位置で計算される
const samePlaceCount = {}; // 「緯度,経度」ごとに、これまでに何軒あったか
function markerLatLng(shop) {
  const key = `${shop.lat},${shop.lng}`;
  const n = samePlaceCount[key] || 0; // この場所の、何軒目か(0 = 1軒目)
  samePlaceCount[key] = n + 1;
  if (n === 0) return [shop.lat, shop.lng];
  const angle = (n - 1) * (Math.PI / 2); // 2軒目は東、3軒目は北…と、90度ずつ向きを変える
  const meters = 15;
  const dLat = (meters / 111320) * Math.sin(angle);
  const dLng = (meters / (111320 * Math.cos((shop.lat * Math.PI) / 180))) * Math.cos(angle);
  return [shop.lat + dLat, shop.lng + dLng];
}

// ピンと一覧の行を、お店ごとにしまっておく(言語を切り替えたときに文字を差し替えるため)
const entries = restaurants.map((shop) => {
  // 地図に出すピン(ポップアップの中身は、あとで showTexts が入れる)
  const marker = L.marker(markerLatLng(shop), { icon: createShopIcon(shop) }).bindPopup("", POPUP_OPTIONS);

  // 一覧に1行追加する(中身は、あとで showTexts が入れる)
  //   shop-item: 店舗カードの目印(都道府県・エリアの見出しの <li> と、見た目のCSSを分けるため)
  const item = document.createElement("li");
  item.className = "shop-item";

  // visible: 絞り込みの条件に合って、いま表示されているか
  const entry = { shop, marker, item, visible: true };

  // 一覧のカードをクリックしたら、そのお店の詳細ページを開く(URLが「?shop=店舗ID」に変わる)
  //   ・♡(お気に入り)・📍(地図で見る)・ルートを見る は、それぞれ別の動きなので、ここでは何もしない
  //   ・「Cmd + クリック」など、新しいタブで開く操作は、店名のリンクの普通の動きに任せる
  item.addEventListener("click", (event) => {
    if (event.target.closest(".fav-btn, .map-btn, .route-link")) return;
    if (event.target.closest("a.shop-link") && isNewTabClick(event)) return;
    event.preventDefault();
    openShop(entry);
  });

  // ポップアップが開いたお店(ピンをクリックした場合も含む)を「選択中」にする。閉じたら解除する
  //   ポップアップが開いている間だけ、一覧に has-selection を付けて、選択中でないカードを薄くする(CSS)
  marker.on("popupopen", (event) => {
    listElement.classList.add("has-selection"); // 先に付ける(末尾に余白が入り、最後のお店も一番上まで動かせる)
    setSelected(entry, true);
    renderFavorites(); // 開いたポップアップの ♡ / ♥ を、いまの登録状態に合わせる
    loadPopupTipsCount(entry); // ポップアップの「💡 Tips ○件」を、最新の件数にする
    loadPopupReviewCount(entry); // ポップアップの「⭐ レビュー ○件」を、最新の件数にする
    const box = event.popup.getElement();
    if (box && !box.dataset.favBound) {
      box.dataset.favBound = "1";
      box.addEventListener("click", (e) => {
        if (e.target.closest(".fav-btn")) toggleFavorite(entry);
        // 「詳細を見る」: 詳細ページを開く(Cmd + クリックなら、新しいタブで開く)
        if (e.target.closest("a.detail-link") && !isNewTabClick(e)) {
          e.preventDefault();
          openShop(entry);
        }
      });
    }
  });
  marker.on("popupclose", () => {
    if (selectedEntry === entry) setSelected(null);
    listElement.classList.remove("has-selection"); // 別のピンに移るときは、すぐあとの popupopen で付け直される
  });

  listElement.appendChild(item);
  return entry;
});

// 一覧の並び順(通常は data.js に書いた順。現在地周辺モードでは、近い順に入れ替える)
//   entries 自体の順は変えず、表示の順だけを、ここで持つ
let listOrder = entries.slice();

// 一覧のカードの ♡ のクリック(カードは作り直されるので、外側の一覧で受ける)
listElement.addEventListener("click", (event) => {
  const btn = event.target.closest(".fav-btn");
  if (btn) toggleFavorite(entries[Number(btn.dataset.idx)]);
  // 📍: 今までどおり、地図をそのお店へ移動して、ポップアップを開く(一覧と地図の連動)
  const mapBtn = event.target.closest(".map-btn");
  if (mapBtn) showShop(entries[Number(mapBtn.dataset.idx)]);
});

// 一覧のカードの「📍(地図で見る)」ボタンのHTML
function mapButtonHtml(idx) {
  const label = ui[currentLang].mapBtn;
  return `<button type="button" class="map-btn" data-idx="${idx}" aria-label="${esc(label)}" title="${esc(label)}">📍</button>`;
}

// ♡ / ♥ のボタンの HTML(idx は entries の番号)
function favButtonHtml(entry, idx) {
  const on = isFavorite(entry.shop);
  const t = ui[currentLang];
  return (
    `<button type="button" class="fav-btn${on ? " active" : ""}" data-idx="${idx}" ` +
    `aria-pressed="${on}" aria-label="${on ? t.favRemove : t.favAdd}" title="${on ? t.favRemove : t.favAdd}">` +
    `${on ? "♥" : "♡"}</button>`
  );
}

// 画面にあるすべての ♡ / ♥(一覧のカード・開いているポップアップ)と、「お気に入りのみ表示」ボタンを、いまの状態に合わせる
function renderFavorites() {
  const t = ui[currentLang];
  document.querySelectorAll(".fav-btn").forEach((btn) => {
    const on = isFavorite(entries[Number(btn.dataset.idx)].shop);
    btn.classList.toggle("active", on);
    btn.textContent = on ? "♥" : "♡";
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? t.favRemove : t.favAdd);
    btn.title = on ? t.favRemove : t.favAdd;
  });
  const only = document.getElementById("fav-only");
  only.textContent = t.favOnly;
  only.classList.toggle("active", favoritesOnly);
  only.setAttribute("aria-pressed", String(favoritesOnly));
}

// お気に入りの登録/解除
function toggleFavorite(entry) {
  const key = favoriteKey(entry.shop);
  if (favorites.has(key)) favorites.delete(key);
  else favorites.add(key);
  saveFavorites();
  renderFavorites();
  // 「お気に入りのみ表示」中に解除したお店は、地図とリストから外す(地図は動かさない)
  if (favoritesOnly) applyFilters(false, true);
}
clusterGroup.addLayers(entries.map((entry) => entry.marker));

// 店舗の画像
//   ・data.js の image に書かれた画像を使う。空・省略・使えない書き方のときは、デフォルト画像(イラスト)を使う
//   ・画像は、自分のフォルダ(images/...)か、https:// で始まるURLだけを使う(javascript: などは使わない)
//   ・外部のサイトから、画像を自動で集める処理は、このアプリにはありません
const DEFAULT_IMAGE = "images/default-shop.svg"; // 一覧のカード用(正方形)
const DEFAULT_HERO_IMAGE = "images/default-hero.svg"; // 詳細ページ用(横長)

function getShopImage(shop) {
  const value = typeof shop.image === "string" ? shop.image.trim() : "";
  const safe = /^https?:\/\//i.test(value) || (value !== "" && !value.includes(":") && !value.startsWith("//"));
  return safe ? { src: value, isDefault: false } : { src: DEFAULT_IMAGE, isDefault: true };
}

// 画像が読み込めなかったとき(ファイル名の間違いなど)は、デフォルト画像に切り替える(1回だけ)
//   ※ 画像の読み込みエラーは、上に伝わらないので、一覧全体で受け取る(第3引数 true)
listElement.addEventListener(
  "error",
  (event) => {
    const img = event.target;
    if (!img.classList || !img.classList.contains("shop-thumb") || img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = DEFAULT_IMAGE;
    img.alt = ui[currentLang].noPhoto;
    const credit = img.parentElement.querySelector(".thumb-credit");
    if (credit) credit.remove(); // 表示できていない画像のクレジットは、出さない
  },
  true
);

// Google マップのURLを返す
//   - data.js に googleMapsUrl が書かれていれば、それを使う
//   - 無ければ、店名と住所で Google マップを検索するURLを作る
function getGoogleMapsUrl(shop) {
  if (shop.googleMapsUrl && /^https?:\/\//.test(shop.googleMapsUrl)) {
    return shop.googleMapsUrl;
  }
  // 検索には、日本語の住所がいちばん正確なので、言語に関係なく日本語を使う
  const jaAddress = typeof shop.address === "string" ? shop.address : shop.address.ja;
  const query = `${pick(shop.name)} ${jaAddress}`;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

// 4. スキャン: いまの地図の表示範囲(四隅の緯度経度)に映っているお店だけに絞り込む
//   ・位置情報(現在地)は使わない。ボタンを押した瞬間の、地図の表示範囲(map.getBounds())だけで判定する
//   ・都道府県 → エリア → 店舗の階層表示は維持したまま、各階層を、範囲内のお店だけに絞り込む
//     (絞り込みのやり方は、料理カテゴリーの絞り込みと同じ考え方。matchesFilter に含めている)
//   ・「× 条件をリセット」で、この絞り込みも解除される(resetFilters を参照)
let nearbyOrigin = null; // 店舗詳細ページの「現在地からの距離」が使う起点(このファイルでは、もう設定しない。常に null)

// 位置情報の取得(店舗詳細ページの「現在地からの距離」が使う設定)
//   enableHighAccuracy を true(GPS優先)にすると、GPS の無いパソコンでは時間切れになりやすい。
//   お店探しには、Wi-Fi・携帯電波による位置(数十〜数百m の誤差)で十分なので false にしている。
//   maximumAge: 0 は「ブラウザが覚えている古い位置を使わず、毎回、新しく取得する」という意味
//   (位置情報を、使い回さない・残さないための設定)。
const GEO_OPTIONS = { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 };
function requestCurrentPosition(onSuccess, onError) {
  navigator.geolocation.getCurrentPosition(onSuccess, onError, GEO_OPTIONS);
}

const scanButton = document.getElementById("scan-button");
const scanStatus = document.getElementById("scan-status");
const SCAN_STATUS_MS = 700; // 一瞬で終わる処理でも、「検索中」だと伝わるように、この長さは表示しておく
let scanStatusTimer = null;
let scanBounds = null; // スキャンした時点の、地図の表示範囲(L.LatLngBounds)。null なら、スキャンによる絞り込みはしていない

// 2点間の直線距離(km)を返す(ハーサイン公式。地球は半径 6371km の球として計算)
function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// 距離を「0.5km」の形にする(10km以上は小数なし、0.1km未満は「<0.1km」)
function formatDistance(km) {
  if (km < 0.1) return "&lt;0.1km";
  if (km < 10) return km.toFixed(1) + "km";
  return Math.round(km) + "km";
}

// レビューの件数を返す(お店の id を渡す)。店舗詳細ページの件数エリアと、地図のポップアップの、両方で使う
//   Firestore(index.html の window.reviewsApi)から、件数だけを軽く数える(レビュー本文は読み込まない)
//   window.reviewsApi が、まだ読み込まれていない(detail.js より前に、この関数が呼ばれた)ときは、少し待つ
async function fetchReviewCount(shopId) {
  const api = await new Promise((resolve, reject) => {
    if (window.reviewsApi) return resolve(window.reviewsApi);
    if (window.reviewsApiFailed) return reject(new Error("reviews api failed"));
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
    }, 8000);
    window.addEventListener("reviews-api-ready", onReady);
    window.addEventListener("reviews-api-failed", onFailed);
  });
  return api.fetchCount(shopId);
}

// 地図のポップアップの「⭐ レビュー ○件」: ポップアップが開くたびに、件数を取得して、開いているポップアップに反映する
//   entry.reviewCount: undefined = まだ取得していない(「…」) / null = 取得できなかった(「–」) / 数 = 件数
function reviewCountText(entry) {
  if (entry.reviewCount === undefined) return "…";
  if (entry.reviewCount === null) return "–";
  return ui[currentLang].statCount(entry.reviewCount);
}

function updatePopupReviewCount(entry) {
  const popup = entry.marker.getPopup();
  const box = popup && popup.isOpen() ? popup.getElement() : null;
  const target = box && box.querySelector(".popup-reviews strong");
  if (target) target.textContent = reviewCountText(entry);
}

// 地図のポップアップの「💡 Tips ○件」: 店舗詳細ページの件数エリアと、同じ仕組み(detail.js の
//   getTipsApi・cleanTipCounts)を再利用して、各Tipsの人数を合計する。detail.js より先に読み込まれるため、
//   関数が無ければ(読み込み順が変わった、など)、件数を取れなかった扱いにする
//   entry.tipsCount: undefined = まだ取得していない(「…」) / null = 取得できなかった(「–」) / 数 = 件数
function tipsCountText(entry) {
  if (entry.tipsCount === undefined) return "…";
  if (entry.tipsCount === null) return "–";
  return ui[currentLang].statCount(entry.tipsCount);
}

function updatePopupTipsCount(entry) {
  const popup = entry.marker.getPopup();
  const box = popup && popup.isOpen() ? popup.getElement() : null;
  const target = box && box.querySelector(".popup-tips strong");
  if (target) target.textContent = tipsCountText(entry);
}

function loadPopupTipsCount(entry) {
  if (typeof getTipsApi !== "function" || typeof cleanTipCounts !== "function") {
    entry.tipsCount = null;
    updatePopupTipsCount(entry);
    return;
  }
  getTipsApi()
    .then((api) => api.fetchCounts(entry.shop.id))
    .then((data) => {
      const counts = cleanTipCounts(data);
      entry.tipsCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
    })
    .catch((error) => {
      console.warn("Tips件数の取得に失敗:", error);
      entry.tipsCount = null;
    })
    .then(() => {
      updatePopupTipsCount(entry);
      updateScanOverlayCard(entry, "tips"); // スキャン結果オーバーレイのカードにも、同じ件数を反映する(開いていなければ何もしない)
    });
}

function loadPopupReviewCount(entry) {
  fetchReviewCount(entry.shop.id)
    .then((count) => {
      entry.reviewCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
    })
    .catch((error) => {
      console.warn("レビュー件数の取得に失敗:", error);
      entry.reviewCount = null;
    })
    .then(() => {
      updatePopupReviewCount(entry);
      updateScanOverlayCard(entry, "reviews"); // スキャン結果オーバーレイのカードにも、同じ件数を反映する(開いていなければ何もしない)
    });
}

// お店が、スキャンした範囲の中にあるか(スキャンしていなければ、いつも true)
function matchesScan(shop) {
  return !scanBounds || scanBounds.contains([shop.lat, shop.lng]);
}

// 「🔍スキャンする」を押したときの処理
//   ・押した、その瞬間の地図の表示範囲(map.getBounds())を覚える(位置情報は使わない)
//   ・一瞬で終わる処理だが、「検索中」だと伝わるように、SCAN_STATUS_MS の間は、状態表示を出しておく
//   ・連続で押せないよう、その間はボタンを押せなくする
function runScan() {
  const bounds = map.getBounds(); // いま押した瞬間の範囲を、先に覚えておく
  scanButton.disabled = true;
  scanStatus.hidden = false;
  clearTimeout(scanStatusTimer);
  scanStatusTimer = setTimeout(() => {
    scanBounds = bounds;
    expandScannedGroups(); // 該当する都道府県・エリアを、タップしなくても見える状態にする(スキャンのときだけ。階層表示に戻したときのため)
    applyFilters(); // これが、entry.visible を更新する(一覧オーバーレイは、この結果を使う)
    openScanOverlay("scan"); // 結果を、フルスクリーンに近い一覧オーバーレイで見せる(すでに開いていれば、中身だけ作り直す)。PC・スマホ、どちらでも開く
    scanStatus.hidden = true;
    scanButton.disabled = false;
  }, SCAN_STATUS_MS);
}

function renderScanTexts() {
  const t = ui[currentLang];
  scanButton.textContent = t.scanButton;
  scanStatus.textContent = t.scanStatus;
}

scanButton.addEventListener("click", runScan);

// ---------------------------------------------------------------------
// スキャン結果の一覧オーバーレイ(都道府県・エリアの階層を使わない、フラットな一覧。#content いっぱいに重ねて出す)
// ---------------------------------------------------------------------
//   ・カードの並びは、いま表示条件に合っている(entry.visible な)お店を、listOrder の順のまま使う
//   ・一覧の下には、いま使っている本物の地図(#map-wrap)を、そのまま移動させて置く(コピーではない)。
//     閉じるときは、#content の元の場所(#shop-list の次)へ戻す
//   ・写真(投稿された写真の1枚目)・Tips件数・レビュー件数は、カードを出したあとに読み込んで、あとから差し込む
//     (地図のポップアップの「💡 Tips」「⭐ レビュー」と、同じ考え方)
//   ・スキャンだけでなく、スマホ(幅の狭い画面)での検索・お気に入り・料理の絞り込み、「お店一覧を見る」ボタンでも、
//     この同じオーバーレイを開く(syncMobileListOverlay を参照)。見出しの文字だけ、開いた理由(scanOverlayReason)で変える
const contentEl = document.getElementById("content");
const mapWrapEl = document.getElementById("map-wrap");
const scanOverlay = document.getElementById("scan-overlay");
const scanOverlayBackBtn = document.getElementById("scan-overlay-back");
const scanOverlayTitleEl = document.getElementById("scan-overlay-title");
const scanOverlayScrollEl = document.getElementById("scan-overlay-scroll");
const scanOverlayList = document.getElementById("scan-overlay-list");
const scanOverlayMapSlot = document.getElementById("scan-overlay-map-slot");
const listOverlayPanel = document.getElementById("list-overlay-panel");
const listOverlayButton = document.getElementById("list-overlay-button");
let scanOverlayOpen = false;
let scanOverlayReason = "scan"; // "scan"(🔍スキャンする) / "list"(検索・絞り込み・「お店一覧を見る」ボタン)

function renderScanOverlayTexts() {
  const t = ui[currentLang];
  scanOverlayBackBtn.textContent = t.scanOverlayBack;
  scanOverlayTitleEl.textContent = scanOverlayReason === "scan" ? t.scanOverlayTitle : t.listTitle;
  listOverlayButton.textContent = t.listOverlayButton;
}

// カードの画像を設定する: 投稿された写真の1枚目(entry.scanPhotoUrl)があれば、それ。無ければ、一覧のカードと同じ、いつもの画像
function setScanOverlayImage(img, entry) {
  if (!img) return;
  const name = pick(entry.shop.name);
  if (entry.scanPhotoUrl) {
    img.src = entry.scanPhotoUrl;
    img.alt = name;
    return;
  }
  const image = getShopImage(entry.shop);
  img.src = image.src;
  img.alt = image.isDefault ? ui[currentLang].noPhoto : name;
}

// 投稿された写真を、あとから読み込む(detail.js の getPhotosApi。読み込まれていなければ、いつもの画像のままにする)
//   entry.scanPhotoUrl: undefined = まだ取得していない / null = 写真が無い(か、取得できなかった) / 文字列 = 写真のURL
function loadScanOverlayPhoto(entry) {
  if (entry.scanPhotoUrl !== undefined || typeof getPhotosApi !== "function") return;
  entry.scanPhotoUrl = null; // 取得中も「まだ無い」扱いにして、二重に取得しないようにする
  getPhotosApi()
    .then((api) => api.fetchPhotos(entry.shop.id))
    .then((photos) => {
      const first = Array.isArray(photos) ? photos.find((p) => p && !p.hidden && p.secure_url) : null;
      entry.scanPhotoUrl = first ? first.secure_url : null;
    })
    .catch((error) => {
      console.warn("お店の写真の取得に失敗:", error);
      entry.scanPhotoUrl = null;
    })
    .then(() => updateScanOverlayCard(entry, "photo"));
}

// カード1件(その中の、いま分かっている情報)の見た目を作る。写真・件数は、あとから差し込むので、ここでは空のまま
function scanOverlayCardHtml(entry) {
  const t = ui[currentLang];
  const idx = entries.indexOf(entry);
  const shop = entry.shop;
  const name = pick(shop.name);
  const areaText = pick(shop.area);
  return (
    `<li class="scan-overlay-item" data-idx="${idx}">` +
    `<div class="scan-overlay-card">` +
    `<div class="scan-overlay-thumb-wrap"><img class="scan-overlay-thumb" width="72" height="72" loading="lazy" alt=""></div>` +
    `<div class="scan-overlay-body">` +
    `<div class="scan-overlay-name">${esc(name)}</div>` +
    (areaText ? `<div class="scan-overlay-line">📍 ${esc(areaText)}</div>` : "") +
    `<div class="scan-overlay-line scan-overlay-meta">` +
    `<span class="scan-overlay-tips">💡 ${esc(t.statTips)} <strong>${esc(tipsCountText(entry))}</strong></span>` +
    `<span class="scan-overlay-reviews">⭐ ${esc(t.reviewsTitle)} <strong>${esc(reviewCountText(entry))}</strong></span>` +
    `</div></div></div></li>`
  );
}

// カード1件の、写真・Tips件数・レビュー件数の表示だけを更新する(あとから読み込んだ結果を差し込む)
//   ・オーバーレイが閉じている、または、そのカードがいま出ていなければ、何もしない
function updateScanOverlayCard(entry, kind) {
  if (!scanOverlayOpen) return;
  const idx = entries.indexOf(entry);
  const li = scanOverlayList.querySelector(`.scan-overlay-item[data-idx="${idx}"]`);
  if (!li) return;
  if (kind === "photo") setScanOverlayImage(li.querySelector(".scan-overlay-thumb"), entry);
  else if (kind === "tips") li.querySelector(".scan-overlay-tips strong").textContent = tipsCountText(entry);
  else if (kind === "reviews") li.querySelector(".scan-overlay-reviews strong").textContent = reviewCountText(entry);
}

// いまの表示条件(entry.visible)に合わせて、一覧オーバーレイの中身(カード一覧)を作り直す
function renderScanOverlay() {
  const t = ui[currentLang];
  renderScanOverlayTexts();
  const shown = listOrder.filter((entry) => entry.visible);
  scanOverlayList.innerHTML = shown.length
    ? shown.map((entry) => scanOverlayCardHtml(entry)).join("")
    : `<li class="scan-overlay-empty">${esc(t.scanOverlayEmpty)}</li>`;
  shown.forEach((entry) => {
    updateScanOverlayCard(entry, "photo"); // まずは、いま分かっている画像(いつもの画像 or すでに取得済みの写真)を出す
    loadScanOverlayPhoto(entry); // まだ取得していなければ、投稿された写真を読み込みに行く
    if (entry.tipsCount === undefined) loadPopupTipsCount(entry);
    else updateScanOverlayCard(entry, "tips");
    if (entry.reviewCount === undefined) loadPopupReviewCount(entry);
    else updateScanOverlayCard(entry, "reviews");
  });
}

// オーバーレイを開く(まだ開いていなければ、本物の地図をこの中に移動する。すでに開いていれば、中身だけ作り直す)
//   reason: "scan"(🔍スキャンする) / "list"(検索・絞り込み・「お店一覧を見る」ボタン)。見出しの文字を切り替えるだけで、中身の作り方は同じ
function openScanOverlay(reason) {
  scanOverlayReason = reason || "scan";
  if (!scanOverlayOpen) {
    scanOverlayOpen = true;
    scanOverlay.hidden = false;
    listOverlayButton.hidden = true; // オーバーレイが開いている間は、「お店一覧を見る」ボタンは要らない
    scanOverlayMapSlot.appendChild(mapWrapEl); // 一覧の下に、本物の地図(#map-wrap)を、そのまま移動する
    scanOverlayScrollEl.scrollTop = 0;
    requestAnimationFrame(() => map.invalidateSize()); // 大きさが変わったので、地図に測り直させる
  }
  renderScanOverlay();
}

// オーバーレイを閉じて、地図を元の場所(#content の中、#shop-list の次)へ戻す
function closeScanOverlay() {
  if (!scanOverlayOpen) return;
  scanOverlayOpen = false;
  scanOverlay.hidden = true;
  listOverlayButton.hidden = false; // 閉じたら、また「お店一覧を見る」ボタンを出す(スマホでは、CSSで見えるようになる)
  contentEl.appendChild(mapWrapEl); // 元の場所へ戻す(#shop-list の次 = #content の最後の子)
  requestAnimationFrame(() => map.invalidateSize());
}

scanOverlayBackBtn.addEventListener("click", closeScanOverlay);

// 「お店一覧を見る」ボタン(スマホだけ): 絞り込み条件に関わらず、いまの一覧をオーバーレイで見せる
listOverlayButton.addEventListener("click", () => openScanOverlay("list"));

// スマホ(幅の狭い画面)では、検索・お気に入り・料理の絞り込みが1つでも効いていれば、一覧オーバーレイを自動的に開く
//   (無ければ閉じて、「お店一覧を見る」ボタンだけの状態に戻す)。PC では、これまで通り #shop-list にその場で表示するので、何もしない
//   ・スキャンは、これとは別に runScan が openScanOverlay("scan") を直接呼ぶ(PC・スマホ、どちらでも、これまで通り開く)
function syncMobileListOverlay() {
  if (!narrowScreen.matches) return;
  if (isFilterActive()) openScanOverlay(scanBounds !== null ? "scan" : "list");
  else closeScanOverlay();
}

// カードをタップしたら、これまで通り店舗詳細ページへ移動する(♡・📍 のようなボタンは、このカードには無い)
scanOverlayList.addEventListener("click", (event) => {
  const li = event.target.closest(".scan-overlay-item[data-idx]");
  if (!li) return;
  const entry = entries[Number(li.dataset.idx)];
  if (entry) openShop(entry); // detail.js の openShop が、移動する前にオーバーレイを閉じる(navigate の中で)
});

// 写真が読み込めなかったとき(投稿された写真が、あとで削除されていた場合など)は、いつもの画像に切り替える
scanOverlayList.addEventListener(
  "error",
  (event) => {
    const img = event.target;
    if (!img.classList || !img.classList.contains("scan-overlay-thumb") || img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = DEFAULT_IMAGE;
    img.alt = ui[currentLang].noPhoto;
  },
  true
);

// 5. 絞り込み(料理・お気に入り・検索・スキャン): 条件に合うお店だけを、地図とリストに表示する
//   都道府県・エリアは、絞り込みボタンではなく、一覧の階層(アコーディオン。下のほう)で選びます
const dishChips = document.getElementById("dish-chips");
const typeChips = document.getElementById("type-chips");
const filterCount = document.getElementById("filter-count");
const filterReset = document.getElementById("filter-reset");

const ALL = "all"; // 「すべて」が選ばれている状態
let selectedDish = ALL; // 選択中の料理(dishTypes の key)
let selectedType = ALL; // 選択中のお店の種類("restaurant" か "grocery")

// お店の種類。data.js で type を書いていないお店は、料理店("restaurant")として扱う
function shopType(shop) {
  return shop.type === "grocery" ? "grocery" : "restaurant";
}
let searchTerms = []; // 検索ボックスに入力された言葉(スペース区切り。整えたもの)
let lastFitKey = entries.map((_, i) => i).join(","); // 前回、地図を合わせたときの「表示中のお店」

// エリアを見分けるための名前(日本語)。area は文字列でも { ja, en, vi } でもOK
function areaKey(area) {
  return (typeof area === "string" ? area : area && area.ja) || "";
}

// 検索用に文字を整える(検索する言葉も、お店の文字も、同じ整え方をして比べる)
//   ・全角/半角、大文字/小文字の違いをなくす(ＰＨＯ → pho)
//   ・ベトナム語の声調記号を取る(Phở → pho、Đ → d)
//   ・ひらがなをカタカナにそろえる(ふぉー → フォー)
function normalizeText(text) {
  return String(text)
    .normalize("NFKC")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // 声調記号などの「くっつく記号」を取る
    .normalize("NFC") // 濁点つきのかなを元の形に戻す
    .replace(/đ/g, "d")
    .replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

// { ja, en, vi } でも普通の文字列でも、中の文字をすべて取り出す
function allTexts(value) {
  if (!value) return [];
  return typeof value === "string" ? [value] : Object.values(value);
}

// お店ごとの検索用の文字(店名・都道府県・住所・エリア・料理名を、日本語/英語/ベトナム語ぜんぶ)。最初の1回だけ作る
const searchTextCache = new Map();
function getSearchText(shop) {
  if (!searchTextCache.has(shop)) {
    const parts = [...allTexts(shop.name), ...allTexts(shop.address), ...allTexts(shop.area)];
    // 都道府県: 「東京都」と、ボタンの名前(「東京」「Tokyo」など)の両方で探せるようにする
    if (shop.prefecture) {
      parts.push(shop.prefecture);
      const pref = prefectures.find((p) => p.key === shop.prefecture);
      if (pref) parts.push(...allTexts(pref.label));
    }
    (shop.dishes || []).forEach((key) => {
      parts.push(key);
      const type = dishTypes.find((d) => d.key === key);
      if (type) parts.push(...allTexts(type.label), ...(type.aliases || [])); // 別名(aliases)でも探せる(いまは、別名を使う分類は、ありません)
    });
    searchTextCache.set(shop, parts.map(normalizeText).join("\n")); // 改行でつなぐと、項目をまたいだ一致が起きない
  }
  return searchTextCache.get(shop);
}

// 検索の言葉が、店名・都道府県・住所・エリア・料理名のどれかに部分一致するか(スペースで区切った言葉は、すべて満たす必要がある)
function matchesSearch(shop) {
  const text = getSearchText(shop);
  return searchTerms.every((term) => text.includes(term));
}

// 「東京」「新宿」「フォー」のように、検索でよく使う言葉の一覧(都道府県・エリア・料理。長い順)
let searchKeywords = null;
function getSearchKeywords() {
  if (!searchKeywords) {
    const words = [];
    prefectures.forEach((p) => words.push(p.key, ...allTexts(p.label)));
    restaurants.forEach((shop) => words.push(...allTexts(shop.area)));
    dishTypes.forEach((d) => words.push(d.key, ...allTexts(d.label), ...(d.aliases || [])));
    restaurants.forEach((shop) => (shop.dishes || []).forEach((key) => words.push(key)));
    searchKeywords = [...new Set(words.map(normalizeText).filter(Boolean))].sort((a, b) => b.length - a.length);
  }
  return searchKeywords;
}

// スペースなしでつなげて入力された言葉(「東京フォー」「船橋フォー」)を、「東京」「フォー」のように分ける。
//   ・そのままで、どれかのお店に一致する言葉(店名など)は、分けない
//   ・よく使う言葉(都道府県・エリア・料理)を見つけたら、そこで区切る。
//     間に残った文字(「船橋」のような市の名前や、入力の途中の「フォ」など)も、1つの言葉として使う
//   ・よく使う言葉が1つも無いときは、分けない
function splitByKeywords(term) {
  if (restaurants.some((shop) => getSearchText(shop).includes(term))) return [term];
  const keywords = getSearchKeywords();
  const parts = [];
  let unknown = ""; // よく使う言葉ではない部分(たまっている間の文字)
  let foundKeyword = false;
  let pos = 0;
  while (pos < term.length) {
    const word = keywords.find((w) => term.startsWith(w, pos));
    if (word) {
      if (unknown) parts.push(unknown);
      unknown = "";
      parts.push(word);
      foundKeyword = true;
      pos += word.length;
    } else {
      unknown += term[pos];
      pos += 1;
    }
  }
  if (unknown) parts.push(unknown);
  return foundKeyword ? parts : [term];
}

// 検索ボックスの文字から、検索する言葉のリストを作る(スペース区切り + スペースなしの連続入力の分割)
function buildSearchTerms(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(splitByKeywords);
}

// お店が、いま選ばれている条件(検索 × お気に入り × 料理 × スキャン)を、すべて満たすか
function matchesFilter(shop) {
  if (favoritesOnly && !isFavorite(shop)) return false;
  if (!matchesSearch(shop)) return false;
  if (selectedType !== ALL && shopType(shop) !== selectedType) return false;
  if (selectedDish !== ALL && !(shop.dishes || []).includes(selectedDish)) return false;
  if (!matchesScan(shop)) return false;
  return true;
}

// 料理の名前を、いまの言語で返す(dishTypes に無い料理は、書かれた名前のまま)
function dishLabel(key) {
  const type = dishTypes.find((d) => d.key === key);
  return type ? pick(type.label) : key;
}

// 料理の選択肢を、data.js のお店から自動で作る
// (お店の dishes に書かれた料理。並びは dishTypes の順で、dishTypes に無いものは最後)
function getDishOptions() {
  const used = new Set();
  restaurants.forEach((shop) => (shop.dishes || []).forEach((key) => used.add(key)));
  const order = dishTypes.map((d) => d.key);
  const rank = (key) => (order.includes(key) ? order.indexOf(key) : order.length);
  return [...used].sort((a, b) => rank(a) - rank(b)).map((key) => ({ key, label: dishLabel(key) }));
}

// 絞り込みボタン(1つ分)を作る
function makeChip(label, isActive, onClick) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip" + (isActive ? " active" : "");
  chip.textContent = label;
  chip.setAttribute("aria-pressed", String(isActive));
  chip.addEventListener("click", onClick);
  return chip;
}

// 絞り込みボタンと件数を、いまの状態・言語に合わせて作り直す
function renderFilters() {
  const t = ui[currentLang];
  document.getElementById("dish-label").textContent = t.filterDish;
  document.getElementById("type-label").textContent = t.filterType;

  // 種類のボタン(すべて/料理店/食材店)
  typeChips.replaceChildren(
    makeChip(t.filterAll, selectedType === ALL, () => selectType(ALL)),
    makeChip(t.typeRestaurant, selectedType === "restaurant", () => selectType("restaurant")),
    makeChip(t.typeGrocery, selectedType === "grocery", () => selectType("grocery"))
  );
  // 食材店を選んでいるときは、料理の絞り込みは関係ないので隠す
  const hideDish = selectedType === "grocery";
  document.getElementById("dish-label").hidden = hideDish;
  dishChips.hidden = hideDish;

  dishChips.replaceChildren(
    makeChip(t.filterAll, selectedDish === ALL, () => selectDish(ALL)),
    ...getDishOptions().map((o) =>
      makeChip(o.label, selectedDish === o.key, () => selectDish(o.key))
    )
  );

  const shown = entries.filter((entry) => entry.visible).length;
  const noFavorites = favoritesOnly && favorites.size === 0;
  filterCount.textContent =
    shown > 0
      ? t.filterCount(shown)
      : noFavorites
        ? t.filterEmptyFav
        : t.filterEmpty;

  // 「× 条件をリセット」は、絞り込みが1つでも選ばれているときだけ表示する
  filterReset.textContent = t.filterReset;
  filterReset.hidden = !isFilterActive();
  renderFavorites(); // 「♥ お気に入りのみ表示」ボタンの色も、いまの状態に合わせる
  document.getElementById("filter-summary").textContent = t.filterSummary;
}

// スマホ(幅の狭い画面)では、絞り込みボタンを最初は閉じておく(店舗カードを見やすくするため)。PC では開いたまま
const filterDetails = document.getElementById("filter-details");
const narrowScreen = window.matchMedia("(max-width: 600px)");
function syncFilterDetails() {
  filterDetails.open = !narrowScreen.matches;
}
syncFilterDetails();
narrowScreen.addEventListener("change", () => {
  syncFilterDetails();
  // PC ⇔ スマホの境目をまたいだとき:
  //   ・PC 側になったときは、「list」(検索・絞り込み・ボタンで開いた)一覧オーバーレイなら閉じる(#shop-list に、その場で表示されるため)。
  //     「scan」(🔍スキャンする)で開いたものは、PC でも、これまで通り表示したままにする
  //   ・スマホ側になったときは、いまの絞り込み条件に合わせて、開くべきなら開く
  if (!narrowScreen.matches) {
    if (scanOverlayOpen && scanOverlayReason === "list") closeScanOverlay();
  } else {
    syncMobileListOverlay();
  }
});

// 絞り込み条件が、1つでも選ばれているか(検索の言葉の入力も含む)
//   都道府県・エリアは、絞り込みではなく、一覧の階層(アコーディオン)の開閉なので、ここには含めない
function isFilterActive() {
  return favoritesOnly || selectedType !== ALL || selectedDish !== ALL || searchTerms.length > 0 || scanBounds !== null;
}

// すべての絞り込み条件を解除する(料理は「すべて」に、検索ボックスは空にする。スキャンの絞り込みも解除する)
function resetFilters() {
  favoritesOnly = false;
  selectedType = ALL;
  selectedDish = ALL;
  searchInput.value = "";
  searchTerms = [];
  scanBounds = null;
  closeScanOverlay(); // スキャン結果の一覧オーバーレイも閉じて、通常の階層表示に戻す
  applyFilters();
}
filterReset.addEventListener("click", resetFilters);

// 「♥ お気に入りのみ表示」のオン/オフ
document.getElementById("fav-only").addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  applyFilters();
});

// ---------------------------------------------------------------------
// 一覧の表示(階層(アコーディオン) or フラット)
// ---------------------------------------------------------------------
//   ・都道府県 → エリア → 店舗カード の3階層(アコーディオン)が、基本の表示。
//     料理の絞り込み・スキャンを使っているときも、階層表示は維持したまま、各階層を、条件に合うお店だけに絞り込む
//     (合うお店が1件も無い都道府県・エリアの見出しは、階層から消える)。
//   ・検索・「お気に入りのみ表示」を使っているときだけ、これまで通り、階層をやめて、
//     条件に合う店舗カードだけが、フラットに並ぶ一覧に切り替える。
//   ・地図のピンは、entry.visible だけで決まり、階層の開け閉めでは変わらない(この2つの関数は、
//     entry.visible にはいっさい触れない)。

// 開いている都道府県・エリアの見出し(一覧を作り直しても、開閉の状態は残る)
const expandedPrefectures = new Set(); // 都道府県の key(例: "東京都")
const expandedAreas = new Set(); // "都道府県|エリア" の形(同じエリア名が、別の都道府県にもありうるため)

function isHierarchicalMode() {
  return !favoritesOnly && searchTerms.length === 0;
}

// 都道府県の見出しに出す文字。日本語は、お店データの都道府県名(例: 「東京都」)をそのまま使う。
// 英語・ベトナム語は、data.js の prefectures の名前(例: "Tokyo")を使う(対応する訳が無ければ、都道府県名のまま)
function prefectureLabel(prefKey) {
  if (currentLang === "ja") return prefKey;
  const pref = prefectures.find((p) => p.key === prefKey);
  return pref ? pick(pref.label) : prefKey;
}

// listOrder(表示の順)を、都道府県 → エリアの木構造にまとめる
//   都道府県は、data.js の prefectures に書かれた順(無いものは、最後)。エリアは、その中で最初に出てきた順
//   ・entry.visible なお店だけを木に入れる(料理の絞り込みで合わないお店は、階層からも消える)。
//     合うお店が1件も無い都道府県・エリアは、Map に何も登録されないので、そのまま見出しごと出てこない
function buildShopTree() {
  const prefOrder = prefectures.map((p) => p.key);
  const byPref = new Map(); // prefKey -> Map(areaKey -> { areaLabel, entries: [] })
  listOrder.forEach((entry) => {
    if (!entry.visible) return;
    const shop = entry.shop;
    const prefKey = shop.prefecture || "";
    if (!byPref.has(prefKey)) byPref.set(prefKey, new Map());
    const areas = byPref.get(prefKey);
    const aKey = areaKey(shop.area);
    if (!areas.has(aKey)) areas.set(aKey, { areaKey: aKey, areaLabel: shop.area, entries: [] });
    areas.get(aKey).entries.push(entry);
  });
  const prefKeys = [...byPref.keys()].sort((a, b) => {
    const ia = prefOrder.indexOf(a);
    const ib = prefOrder.indexOf(b);
    return (ia === -1 ? prefOrder.length : ia) - (ib === -1 ? prefOrder.length : ib);
  });
  return prefKeys.map((prefKey) => {
    const areas = [...byPref.get(prefKey).values()];
    return { prefKey, areas, count: areas.reduce((sum, a) => sum + a.entries.length, 0) };
  });
}

// 店名が長いときに、見出しが長くなりすぎないよう、途中で省略する(「…」)
const AREA_PREVIEW_NAME_MAX = 12; // 店名1件あたりの、最大の文字数
function truncateName(name, max) {
  const chars = Array.from(name); // 絵文字・サロゲートペアも、1文字として正しく数える
  return chars.length > max ? chars.slice(0, max).join("") + "…" : name;
}

// エリアの見出しに出す、代表的な店舗名のプレビュー(例: 「サンプル店、Hasunamuほか」)
//   ・1件なら、その店名だけ。2件なら、両方。3件以上なら、先頭2件 + 「ほか」
//   ・エリアの中の並び順(listOrder。ふだんは data.js に書いた順)の、最初の1〜2件を使う
function areaPreviewText(t, areaEntries) {
  const names = areaEntries.slice(0, 2).map((entry) => truncateName(pick(entry.shop.name), AREA_PREVIEW_NAME_MAX));
  const joined = names.join(t.areaPreviewSeparator);
  return areaEntries.length > 2 ? joined + t.areaPreviewMore : joined;
}

// いまの状態(階層 or フラット)に合わせて、一覧のDOMを作り直す(entry.item は、作り直さず、移動するだけ)
function renderShopList() {
  listElement.classList.toggle("is-hierarchical", isHierarchicalMode());
  if (isHierarchicalMode()) renderHierarchicalList();
  else renderFlatList();
}

// フラット表示: 条件に合う(visible な)お店だけを、listOrder の順に並べる
function renderFlatList() {
  listElement.replaceChildren();
  listOrder.forEach((entry) => {
    if (entry.visible) listElement.appendChild(entry.item);
  });
}

// 階層(アコーディオン)表示: 都道府県 → エリア → 店舗カード
function renderHierarchicalList() {
  const t = ui[currentLang];
  listElement.replaceChildren();
  buildShopTree().forEach(({ prefKey, areas, count }) => {
    const prefLi = document.createElement("li");
    prefLi.className = "pref-group";

    const prefDetails = document.createElement("details");
    prefDetails.open = expandedPrefectures.has(prefKey);
    prefDetails.addEventListener("toggle", () => {
      if (prefDetails.open) expandedPrefectures.add(prefKey);
      else expandedPrefectures.delete(prefKey);
    });

    const prefSummary = document.createElement("summary");
    prefSummary.className = "pref-header";
    prefSummary.innerHTML = `${esc(prefectureLabel(prefKey))} <span class="group-count">(${count})</span>`;

    const areaUl = document.createElement("ul");
    areaUl.className = "area-list";
    areas.forEach(({ areaKey: aKey, areaLabel, entries: areaEntries }) => {
      const areaFullKey = `${prefKey}|${aKey}`;
      const areaLi = document.createElement("li");
      areaLi.className = "area-group";

      const areaDetails = document.createElement("details");
      areaDetails.open = expandedAreas.has(areaFullKey);
      areaDetails.addEventListener("toggle", () => {
        if (areaDetails.open) expandedAreas.add(areaFullKey);
        else expandedAreas.delete(areaFullKey);
      });

      const areaSummary = document.createElement("summary");
      areaSummary.className = "area-header";
      // area-name・group-count は縮めない(エリア名・件数は、いつも全部見える)。area-preview だけ、
      // 幅が足りないときに縮めて「…」で省略する(狭い画面でも、見出しの行がはみ出さないように)
      areaSummary.innerHTML =
        `<span class="area-name">${esc(pick(areaLabel))}</span>` +
        `<span class="group-count">(${areaEntries.length})</span>` +
        `<span class="area-preview">- ${esc(areaPreviewText(t, areaEntries))}</span>`;

      const shopUl = document.createElement("ul");
      shopUl.className = "shop-sublist";
      areaEntries.forEach((entry) => shopUl.appendChild(entry.item)); // 既存のカードを、そのまま移動する

      areaDetails.append(areaSummary, shopUl);
      areaLi.appendChild(areaDetails);
      areaUl.appendChild(areaLi);
    });

    prefDetails.append(prefSummary, areaUl);
    prefLi.appendChild(prefDetails);
    listElement.appendChild(prefLi);
  });
}

// 地図のピンをクリックしたときなど: 階層表示なら、そのお店の都道府県・エリアの見出しを開く
//   (フラット表示のときは、開く必要が無い。開いたことで一覧の並びが変わるので、変わったときだけ作り直す)
function expandToEntry(entry) {
  if (!isHierarchicalMode()) return;
  const shop = entry.shop;
  const prefKey = shop.prefecture || "";
  const areaFullKey = `${prefKey}|${areaKey(shop.area)}`;
  let changed = false;
  if (!expandedPrefectures.has(prefKey)) {
    expandedPrefectures.add(prefKey);
    changed = true;
  }
  if (!expandedAreas.has(areaFullKey)) {
    expandedAreas.add(areaFullKey);
    changed = true;
  }
  if (changed) renderHierarchicalList();
}

// スキャン(🔍スキャンする)の結果を、開いた状態で見せる: 該当する都道府県だけでなく、その中の該当エリアも、
// タップしなくても店舗カードが見えるように、自動的に開く(matchesFilter に合うお店を、直接調べて開く)。
//   ・entry.visible の更新(applyFilters)より前に呼んでよい(matchesFilter を、直接使っているため)
//   ・料理カテゴリーの絞り込み(selectDish)では、この関数を呼ばない。これまで通り、都道府県・エリアの
//     開閉は、ユーザーがタップした状態のままにする
function expandScannedGroups() {
  entries.forEach((entry) => {
    if (!matchesFilter(entry.shop)) return;
    const shop = entry.shop;
    const prefKey = shop.prefecture || "";
    expandedPrefectures.add(prefKey);
    expandedAreas.add(`${prefKey}|${areaKey(shop.area)}`);
  });
}

// 条件に合うお店だけ、ピンとリストに出す。合わないお店は隠す
//   onlyIfChanged が true のとき(検索の入力中)は、表示するお店が変わったときだけ地図を動かす
//   skipFit が true のとき(お気に入りの解除)は、地図を動かさない
function applyFilters(onlyIfChanged = false, skipFit = false) {
  const toShow = [];
  const toHide = [];
  entries.forEach((entry) => {
    entry.visible = matchesFilter(entry.shop); // スキャンの範囲も、matchesFilter の中で見ている
    if (entry.visible) {
      if (!clusterGroup.hasLayer(entry.marker)) toShow.push(entry.marker);
    } else {
      toHide.push(entry.marker);
    }
  });
  // 地図のピン: まとめて出し入れすると、クラスター(丸い数字)が自動で計算し直される
  clusterGroup.removeLayers(toHide);
  clusterGroup.addLayers(toShow);
  renderShopList(); // 一覧のDOM(階層 or フラット)を、いまの条件に合わせて作り直す
  // 選択中のお店が隠れたときは、選択を解除する
  if (selectedEntry && !selectedEntry.visible) {
    map.closePopup();
    setSelected(null);
  }
  renderFilters();

  // 表示中のお店がぜんぶ見える範囲に、地図を合わせる(1店だけのときは寄りすぎないよう制限)
  const shown = entries.filter((entry) => entry.visible);
  const fitKey = shown.map((entry) => entries.indexOf(entry)).join(",");
  const changed = fitKey !== lastFitKey;
  lastFitKey = fitKey;
  if (shown.length > 0 && !skipFit && (changed || !onlyIfChanged)) {
    map.fitBounds(shown.map((entry) => [entry.shop.lat, entry.shop.lng]), {
      padding: [40, 40],
      maxZoom: 15,
    });
  }
  syncMobileListOverlay(); // スマホでは、絞り込み条件に合わせて、一覧オーバーレイを自動で開閉する(PC では何もしない)
}

// 種類を選ぶ(食材店を選んだときは、料理の絞り込みを「すべて」に戻す。食材店には料理の情報がないため)
function selectType(key) {
  selectedType = key;
  if (key === "grocery") selectedDish = ALL;
  applyFilters();
}

function selectDish(key) {
  selectedDish = key;
  applyFilters();
}

// 検索ボックス: 入力するたびに絞り込む(日本語入力の変換中も、リアルタイムで反映される)
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", () => {
  searchTerms = buildSearchTerms(searchInput.value);
  applyFilters(true);
});

// ブラウザのタブの題名: 一覧は「ベトナムフーディー - サブタイトル」、詳細ページ・固定ページは「見出し | ベトナムフーディー」
function applyDocumentTitle() {
  const t = ui[currentLang];
  const plainTitle = t.title.replace(/^[^\p{L}\p{N}]+/u, ""); // 先頭に絵文字があれば除く
  const entry = currentShopId !== null && entries.find((e) => e.shop.id === currentShopId);
  const contentMeta = typeof CONTENT_PAGES !== "undefined" && currentContentPage ? CONTENT_PAGES[currentContentPage] : null;
  if (entry) {
    document.title = `${pick(entry.shop.name)} | ${plainTitle}`;
  } else if (document.body.classList.contains("view-content-page") && contentMeta) {
    document.title = `${t[contentMeta.titleKey]} | ${plainTitle}`;
  } else {
    document.title = `${plainTitle} - ${t.tagline}`;
  }
}

// 6. 選ばれている言語で、すべての文字を書き換える
function showTexts() {
  document.documentElement.lang = currentLang;
  applyDocumentTitle();
  document.getElementById("app-title").textContent = ui[currentLang].title;
  document.getElementById("app-logo").alt = ui[currentLang].title; // ロゴの代替テキスト
  document.getElementById("app-tagline").textContent = ui[currentLang].tagline;
  document.getElementById("list-title").textContent = ui[currentLang].listTitle;
  renderScanTexts();
  if (scanOverlayOpen) renderScanOverlay(); // 開いていれば、見出し・戻るボタン・カードの文字も、選ばれた言語で作り直す
  else renderScanOverlayTexts(); // 閉じていても、見出し・戻るボタンの文字だけは、次に開いたときのために整えておく
  renderFilters();
  renderFavorites();
  document.getElementById("search-placeholder-main").textContent = ui[currentLang].searchPlaceholder;
  document.getElementById("search-placeholder-example").textContent = ui[currentLang].searchExample;
  searchInput.setAttribute("aria-label", ui[currentLang].searchPlaceholder.replace("🔍 ", ""));

  entries.forEach((entry, idx) => {
    const { shop, marker, item } = entry;
    const name = pick(shop.name);
    const address = pick(shop.address);
    // 特徴(feature)が書かれているお店だけ、特徴の行を出す
    const feature = pick(shop.feature);
    // 取り扱い料理(dishes が書かれているお店だけ)。いまは、すべてのお店が「ベトナム料理」
    const dishText = (shop.dishes || []).map(dishLabel).join("・");

    // ポップアップ: 店名と ♡・Tips件数・レビュー件数・住所・(特徴)・「詳細を見る」ボタン
    //   料理カテゴリー(dishText)は、一覧のカードには出すが、ポップアップには出さない
    marker.setPopupContent(
      `<div class="popup-title"><strong>${name}</strong>${favButtonHtml(entry, idx)}</div>` +
        `<div class="popup-meta">` +
        `<span class="popup-tips">💡 ${ui[currentLang].statTips} <strong>${tipsCountText(entry)}</strong></span>` +
        `<span class="popup-reviews">⭐ ${ui[currentLang].reviewsTitle} <strong>${reviewCountText(entry)}</strong></span>` +
        `</div>${address}` +
        (feature ? `<br>${feature}` : "") +
        `<div class="popup-buttons"><a class="detail-link" href="${esc(shopUrl(shop.id))}">${ui[currentLang].detailLink}</a></div>`
    );

    // 一覧のカード: 左に画像、右に「店名・エリア・主な料理」(住所・価格帯・営業時間は、地図のポップアップに出る)
    const areaText = pick(shop.area);
    const credit = typeof shop.imageCredit === "string" ? shop.imageCredit.trim() : "";
    const image = getShopImage(shop);
    item.innerHTML =
      `<div class="shop-card">` +
      `<div class="shop-thumb-wrap"><img class="shop-thumb" width="88" height="88" loading="lazy" alt="">` +
      (credit && !image.isDefault ? `<span class="thumb-credit"></span>` : "") +
      `</div>` +
      `<div class="shop-body">` +
      `<div class="shop-head"><div class="shop-name"><a class="shop-link" href="${esc(shopUrl(shop.id))}">${name}</a></div>` +
      `<div class="card-actions">${mapButtonHtml(idx)}${favButtonHtml(entry, idx)}</div></div>` +
      (areaText ? `<div class="shop-line shop-area">📍 ${areaText}</div>` : "") +
      (dishText ? `<div class="shop-line shop-dishes">🍜 ${dishText}</div>` : "") +
      (feature ? `<div class="shop-line shop-feature">${feature}</div>` : "") +
      `</div></div>`;

    // 画像は、文字として埋め込まず、あとから設定する(画像の名前などに、変わった文字が入っても安全にするため)
    const img = item.querySelector(".shop-thumb");
    img.src = image.src;
    img.alt = image.isDefault ? ui[currentLang].noPhoto : name;
    if (!image.isDefault && credit) {
      item.querySelector(".thumb-credit").textContent = credit; // クレジット(画像の下に小さく出る)
      const source = typeof shop.imageSource === "string" ? shop.imageSource.trim() : "";
      item.querySelector(".shop-thumb-wrap").title = source ? `${credit} / ${source}` : credit;
    }
  });

  renderShopList(); // 都道府県・エリアの見出しの文字(と、店舗カードの並び)を、選ばれた言語で作り直す

  // 詳細ページを表示中なら、選ばれた言語で作り直す(detail.js の関数)
  if (currentShopId !== null && typeof renderDetail === "function") renderDetail();

  // 固定ページ(利用規約など)を表示中なら、選ばれた言語で作り直す(detail.js の関数)
  if (document.body.classList.contains("view-content-page") && typeof renderContentPage === "function") renderContentPage();

  // フッターの3つのリンクの文字も、選ばれた言語のものに書き換える
  document.getElementById("footer-link-terms").textContent = ui[currentLang].termsPageTitle;
  document.getElementById("footer-link-privacy").textContent = ui[currentLang].privacyPageTitle;
  document.getElementById("footer-link-about").textContent = ui[currentLang].aboutPageTitle;

  // ヘッダーのログイン表示も、選ばれた言語で書き換える(auth.js の関数。まだ読み込まれていなければ、何もしない)
  if (typeof renderAuth === "function") renderAuth();
}

// 言語の選択が変わったら、文字を書き換える
document.getElementById("lang-select").addEventListener("change", (event) => {
  currentLang = event.target.value;
  showTexts();
});

showTexts();

// 7. 全部のお店のピンが見える範囲に、地図の表示を合わせる
map.fitBounds(restaurants.map((shop) => [shop.lat, shop.lng]), {
  padding: [40, 40],
});
