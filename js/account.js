// アカウント・プロフィール
//   ・「アカウント」(URL「?view=account」): 自分のプロフィール・保存した店・自分の投稿・ログイン/ログアウト
//       ログインしていないときは、ログインの案内と「保存した店」だけを出す
//   ・プロフィール(URL「?user=ユーザーID」): その人のニックネーム・アイコン・自己紹介と、投稿した写真・レビュー
//       (誰でも見られる。チェックインは、行った場所の記録なので、本人の「アカウント」にだけ出す)
//   ・プロフィールの保存先: Firestore の profiles/{ユーザーID}(index.html の profileApi・firestore.rules)
//   ・アイコン画像は、写真投稿と同じ Cloudinary に保存する(端末の中で 256×256 に縮めてから送る)

const ACCOUNT_TEXT = {
  ja: {
    title: "アカウント",
    loginLead: "ログインすると、プロフィールの設定や、写真・レビューの投稿ができます",
    login: "ログイン・新規登録",
    loginTitle: "ログインまたは新規登録",
    saved: "♡ 保存した店",
    clearHistory: "閲覧・検索の履歴を消す",
    clearHistoryNote: "ホームの「あなたへのおすすめ」に使っている、この端末の中の記録(見たお店・検索した言葉・選んだ種類)を消します",
    clearHistoryConfirm: "本当に消す",
    clearHistoryDone: "履歴を消しました",
    savedCount: (n) => `${n}件`,
    editProfile: "プロフィールを編集",
    shareProfile: "プロフィールをシェア",
    shareTitle: (name) => `${name}のプロフィール | ベトナムフーディー`,
    linkCopied: "プロフィールのリンクをコピーしました",
    linkCopyFailed: (url) => `リンク: ${url}`,
    settings: "設定",
    addSpot: "新しいスポットを追加",
    addSpotLead: "追加したいお店の種類を選んでください",
    accountSettings: "アカウント設定",
    emailSetting: "メールアドレスの変更・認証",
    passwordSetting: "パスワードのリセットと変更",
    deleteAccount: "アカウントの削除",
    comingSoon: "この機能は準備中です。もうしばらくお待ちください。",
    typeNames: { restaurant: "レストラン", cafe: "カフェ", grocery: "食材店" },
    settingsOpen: "設定を開く",
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    viewPublic: "公開プロフィールを見る",
    photos: "写真",
    reviews: "レビュー",
    checkins: "チェックイン",
    onlyMe: "自分だけに表示",
    noPhotos: "まだ写真の投稿はありません",
    noReviews: "まだレビューの投稿はありません",
    noCheckins: "まだチェックインはありません",
    loading: "読み込み中…",
    loadError: "読み込めませんでした。時間をおいて、もう一度開いてください",
    logout: "ログアウト",
    notFound: "このプロフィールは見つかりませんでした",
    back: "戻る",
    editTitle: "プロフィールを編集",
    nameLabel: "ニックネーム(30文字まで)",
    bioLabel: "自己紹介(160文字まで・任意)",
    bioPlaceholder: "例: ベトナム料理が好きです。フォーとバインミーを食べ歩いています",
    iconLabel: "アイコン画像(任意)",
    iconChoose: "画像を選ぶ",
    iconRemove: "画像を外す",
    iconNote: "自分で撮った写真やイラストなど、使ってよい画像だけを選んでください。他の人の顔が写った写真や、有名人・キャラクターの画像は使えません。",
    save: "保存する",
    cancel: "閉じる",
    saved_ok: "保存しました",
    saveError: "保存できませんでした。時間をおいて、もう一度お試しください",
    saving: "保存しています…",
    rulesError: "保存できませんでした(データベースの設定がまだ反映されていない可能性があります)",
    needName: "ニックネームを入れてください",
    uploading: "画像を送っています…",
    deleteProfile: "プロフィールを削除",
    deleteConfirm: "本当に削除する",
    deleted: "プロフィールを削除しました",
    adminDelete: "【管理者】このプロフィールを削除",
    adminBackfill: "【管理者】前からのレビュー・チェックインを一覧に出す",
    adminBackfillDone: (n) => `${n}件に、投稿者の情報を書き足しました`,
    stars: (n) => "★".repeat(n) + "☆".repeat(5 - n),
  },
  en: {
    title: "Account",
    loginLead: "Log in to set up your profile and post photos and reviews",
    login: "Log in / Sign up",
    loginTitle: "Log in or sign up",
    saved: "♡ Saved shops",
    clearHistory: "Clear browsing and search history",
    clearHistoryNote: "Deletes the records on this device used for ‘Picked for you’ on the home screen (shops you viewed, words you searched, kinds you chose)",
    clearHistoryConfirm: "Really clear",
    clearHistoryDone: "History cleared",
    savedCount: (n) => `${n}`,
    editProfile: "Edit profile",
    shareProfile: "Share profile",
    shareTitle: (name) => `${name}'s profile | Vietnam Foodie`,
    linkCopied: "Profile link copied",
    linkCopyFailed: (url) => `Link: ${url}`,
    settings: "Settings",
    addSpot: "Add a new spot",
    addSpotLead: "Choose the kind of shop you want to add",
    accountSettings: "Account settings",
    emailSetting: "Change / verify email address",
    passwordSetting: "Reset / change password",
    deleteAccount: "Delete account",
    comingSoon: "This feature is coming soon.",
    typeNames: { restaurant: "Restaurant", cafe: "Cafe", grocery: "Grocery" },
    settingsOpen: "Open settings",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    viewPublic: "View public profile",
    photos: "Photos",
    reviews: "Reviews",
    checkins: "Check-ins",
    onlyMe: "Only visible to you",
    noPhotos: "No photos yet",
    noReviews: "No reviews yet",
    noCheckins: "No check-ins yet",
    loading: "Loading…",
    loadError: "Couldn't load. Please try again later",
    logout: "Log out",
    notFound: "This profile couldn't be found",
    back: "Back",
    editTitle: "Edit profile",
    nameLabel: "Nickname (up to 30 characters)",
    bioLabel: "About you (up to 160 characters, optional)",
    bioPlaceholder: "e.g. I love Vietnamese food — always looking for good pho and banh mi",
    iconLabel: "Profile picture (optional)",
    iconChoose: "Choose image",
    iconRemove: "Remove image",
    iconNote: "Only use images you have the right to use, such as your own photos or drawings. Photos of other people's faces, celebrities or characters are not allowed.",
    save: "Save",
    cancel: "Close",
    saved_ok: "Saved",
    saveError: "Couldn't save. Please try again later",
    saving: "Saving…",
    rulesError: "Couldn't save (the database settings may not be updated yet)",
    needName: "Please enter a nickname",
    uploading: "Uploading image…",
    deleteProfile: "Delete profile",
    deleteConfirm: "Really delete",
    deleted: "Your profile was deleted",
    adminDelete: "[Admin] Delete this profile",
    adminBackfill: "[Admin] Show older reviews and check-ins in lists",
    adminBackfillDone: (n) => `Added author info to ${n} posts`,
    stars: (n) => "★".repeat(n) + "☆".repeat(5 - n),
  },
  vi: {
    title: "Tài khoản",
    loginLead: "Đăng nhập để cài đặt hồ sơ và đăng ảnh, đánh giá",
    login: "Đăng nhập / Đăng ký",
    loginTitle: "Đăng nhập hoặc đăng ký",
    saved: "♡ Quán đã lưu",
    clearHistory: "Xóa lịch sử xem và tìm kiếm",
    clearHistoryNote: "Xóa dữ liệu trên thiết bị này dùng cho ‘Gợi ý cho bạn’ ở trang chủ (quán đã xem, từ khóa đã tìm, loại quán đã chọn)",
    clearHistoryConfirm: "Xóa thật",
    clearHistoryDone: "Đã xóa lịch sử",
    savedCount: (n) => `${n} quán`,
    editProfile: "Sửa hồ sơ",
    shareProfile: "Chia sẻ hồ sơ",
    shareTitle: (name) => `Hồ sơ của ${name} | Vietnam Foodie`,
    linkCopied: "Đã sao chép liên kết hồ sơ",
    linkCopyFailed: (url) => `Liên kết: ${url}`,
    settings: "Cài đặt",
    addSpot: "Thêm địa điểm mới",
    addSpotLead: "Chọn loại quán bạn muốn thêm",
    accountSettings: "Cài đặt tài khoản",
    emailSetting: "Đổi / xác minh địa chỉ email",
    passwordSetting: "Đặt lại / đổi mật khẩu",
    deleteAccount: "Xóa tài khoản",
    comingSoon: "Tính năng này đang được chuẩn bị.",
    typeNames: { restaurant: "Nhà hàng", cafe: "Cà phê", grocery: "Tạp hóa" },
    settingsOpen: "Mở cài đặt",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách quyền riêng tư",
    viewPublic: "Xem hồ sơ công khai",
    photos: "Ảnh",
    reviews: "Đánh giá",
    checkins: "Check-in",
    onlyMe: "Chỉ mình bạn thấy",
    noPhotos: "Chưa có ảnh",
    noReviews: "Chưa có đánh giá",
    noCheckins: "Chưa có check-in",
    loading: "Đang tải…",
    loadError: "Không tải được. Vui lòng thử lại sau",
    logout: "Đăng xuất",
    notFound: "Không tìm thấy hồ sơ này",
    back: "Quay lại",
    editTitle: "Sửa hồ sơ",
    nameLabel: "Biệt danh (tối đa 30 ký tự)",
    bioLabel: "Giới thiệu (tối đa 160 ký tự, không bắt buộc)",
    bioPlaceholder: "VD: Mình thích món Việt, hay đi ăn phở và bánh mì",
    iconLabel: "Ảnh đại diện (không bắt buộc)",
    iconChoose: "Chọn ảnh",
    iconRemove: "Bỏ ảnh",
    iconNote: "Chỉ dùng ảnh bạn có quyền sử dụng, như ảnh tự chụp hoặc tranh tự vẽ. Không dùng ảnh có mặt người khác, người nổi tiếng hay nhân vật.",
    save: "Lưu",
    cancel: "Đóng",
    saved_ok: "Đã lưu",
    saveError: "Không lưu được. Vui lòng thử lại sau",
    saving: "Đang lưu…",
    rulesError: "Không lưu được (cài đặt cơ sở dữ liệu có thể chưa được cập nhật)",
    needName: "Hãy nhập biệt danh",
    uploading: "Đang gửi ảnh…",
    deleteProfile: "Xóa hồ sơ",
    deleteConfirm: "Xóa thật",
    deleted: "Đã xóa hồ sơ",
    adminDelete: "[Quản trị] Xóa hồ sơ này",
    adminBackfill: "[Quản trị] Hiện đánh giá, check-in cũ trong danh sách",
    adminBackfillDone: (n) => `Đã thêm thông tin người đăng cho ${n} mục`,
    stars: (n) => "★".repeat(n) + "☆".repeat(5 - n),
  },
};
function accountText() {
  return ACCOUNT_TEXT[currentLang] || ACCOUNT_TEXT.ja;
}

function accountUrl() {
  return location.pathname + "?view=account";
}
function userUrl(uid) {
  return location.pathname + "?user=" + encodeURIComponent(uid);
}

// Firebase の準備ができたら profileApi を返す(getReviewsApi と同じ仕組み)
function getProfileApi() {
  if (window.profileApi) return Promise.resolve(window.profileApi);
  if (window.profileApiFailed) return Promise.reject(new Error("profile api failed"));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => done(reject, new Error("profile api timeout")), 15000);
    const onReady = () => done(resolve, window.profileApi);
    const onFailed = () => done(reject, new Error("profile api failed"));
    function done(fn, value) {
      clearTimeout(timer);
      window.removeEventListener("profile-api-ready", onReady);
      window.removeEventListener("profile-api-failed", onFailed);
      fn(value);
    }
    window.addEventListener("profile-api-ready", onReady);
    window.addEventListener("profile-api-failed", onFailed);
  });
}

// ---------------------------------------------------------------------
// 表示するデータ(開いているプロフィールごとに、1回だけ読み込む)
// ---------------------------------------------------------------------
let accountData = null; // { uid, status: "loading"|"ready"|"error", profile, photos, reviews, checkins }
let accountTab = "photos";
let accountEditing = false;
let accountDraft = null; // { displayName, bio, photoURL, busy, message, error, confirmDelete }
let accountMessage = ""; // 保存しました など(数秒だけ出す)
let accountMessageTimer = null;
function setAccountMessage(text) {
  accountMessage = text;
  clearTimeout(accountMessageTimer);
  accountMessageTimer = setTimeout(() => {
    accountMessage = "";
  }, 3000);
}
let accountAdminMessage = "";
let accountGoodbye = ""; // アカウントを削除したあとのお知らせ(ログアウトした画面に出す)

function loadAccountData(uid, withCheckins) {
  if (accountData && accountData.uid === uid && accountData.withCheckins === withCheckins) return;
  const data = { uid, withCheckins, status: "loading", profile: null, photos: [], reviews: [], checkins: [] };
  accountData = data;
  getProfileApi()
    .then((api) =>
      Promise.all([
        api.fetchProfile(uid).catch((e) => (console.warn("プロフィールを読めませんでした:", e), null)),
        api.fetchUserPhotos(uid).catch((e) => (console.warn("写真の一覧を読めませんでした:", e), [])),
        api.fetchUserReviews(uid).catch((e) => (console.warn("レビューの一覧を読めませんでした:", e), [])),
        withCheckins ? api.fetchMyCheckins().catch((e) => (console.warn("チェックインの一覧を読めませんでした:", e), [])) : [],
      ])
    )
    .then(([profile, photos, reviews, checkins]) => {
      const time = (x) => (x && typeof x.toMillis === "function" ? x.toMillis() : 0);
      // 非表示(管理者が隠したもの)・登録していないお店のものは出さない。新しい順
      const known = (x) => entries.some((e) => e.shop.id === x.shopId);
      data.profile = profile;
      data.photos = photos.filter((p) => !p.hidden && known(p)).sort((a, b) => time(b.createdAt) - time(a.createdAt));
      data.reviews = reviews.filter((r) => !r.hidden && known(r)).sort((a, b) => time(b.createdAt) - time(a.createdAt));
      data.checkins = checkins.filter((c) => !c.hidden && known(c)).sort((a, b) => time(b.checkedInAt) - time(a.checkedInAt));
      data.status = "ready";
    })
    .catch((error) => {
      console.warn("プロフィールを読めませんでした:", error);
      data.status = "error";
    })
    .then(() => {
      if (accountData === data && document.body.classList.contains("view-home")) renderHomeMode();
    });
}

// 表示する名前(プロフィール → ログインの名前 → 投稿に残っている名前)
function accountDisplayName(data, fallback) {
  if (data && data.profile && data.profile.displayName) return data.profile.displayName;
  if (fallback) return fallback;
  const post = data && (data.reviews[0] || data.photos[0]);
  return (post && post.authorName) || "";
}

function accountAvatar(url, name, size) {
  const initial = esc(Array.from(name || "?")[0].toUpperCase());
  return url
    ? `<span class="acct-avatar" style="width:${size}px;height:${size}px"><img src="${esc(url)}" alt="" width="${size}" height="${size}" referrerpolicy="no-referrer"></span>`
    : `<span class="acct-avatar is-initial" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px">${initial}</span>`;
}

function shopNameOf(shopId) {
  const e = entries.find((x) => x.shop.id === shopId);
  return e ? pick(e.shop.name) : "";
}

// Cloudinary の画像を、小さい正方形で読み込む(一覧用。元の画像はそのまま)
function thumbUrl(url) {
  return String(url || "").replace("/image/upload/", "/image/upload/c_fill,w_300,h_300,q_auto,f_auto/");
}

function formatDate(ts) {
  if (!ts || typeof ts.toDate !== "function") return "";
  const d = ts.toDate();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// 投稿の一覧(写真・レビュー・チェックイン)
function accountPostsHtml(data, tabs) {
  const x = accountText();
  if (data.status === "loading") return `<p class="acct-note">${esc(x.loading)}</p>`;
  if (data.status === "error") return `<p class="acct-note is-error">${esc(x.loadError)}</p>`;
  if (!tabs.includes(accountTab)) accountTab = tabs[0];
  const tabBtn = (key, label, n) =>
    `<button type="button" class="acct-tab${accountTab === key ? " is-on" : ""}" role="tab" aria-selected="${accountTab === key}" data-acct-tab="${key}">` +
    `${esc(label)}<span>${n}</span></button>`;
  const head =
    `<div class="acct-tabs" role="tablist">` +
    tabs.map((k) => tabBtn(k, x[k], data[k].length)).join("") +
    `</div>`;
  let body = "";
  if (accountTab === "photos") {
    body = data.photos.length
      ? `<ul class="acct-photos">${data.photos
          .map(
            (p) =>
              `<li><a href="${esc(shopUrl(p.shopId))}" data-shop-id="${esc(p.shopId)}" title="${esc(shopNameOf(p.shopId))}">` +
              `<img src="${esc(thumbUrl(p.secure_url))}" alt="${esc(shopNameOf(p.shopId))}" loading="lazy" width="300" height="300"></a></li>`
          )
          .join("")}</ul>`
      : `<p class="acct-note">${esc(x.noPhotos)}</p>`;
  } else if (accountTab === "reviews") {
    body = data.reviews.length
      ? `<ul class="acct-list">${data.reviews
          .map(
            (r) =>
              `<li><a class="acct-item" href="${esc(shopUrl(r.shopId))}" data-shop-id="${esc(r.shopId)}">` +
              `<span class="acct-item-head"><span class="acct-item-name">${esc(shopNameOf(r.shopId))}</span>` +
              `<span class="acct-item-date">${esc(formatDate(r.createdAt))}</span></span>` +
              `<span class="acct-stars" aria-label="${Number(r.rating) || 0}/5">${esc(x.stars(Math.max(0, Math.min(5, Number(r.rating) || 0))))}</span>` +
              (r.comment ? `<span class="acct-item-text">${esc(r.comment)}</span>` : "") +
              `</a></li>`
          )
          .join("")}</ul>`
      : `<p class="acct-note">${esc(x.noReviews)}</p>`;
  } else {
    body =
      `<p class="acct-onlyme">🔒 ${esc(x.onlyMe)}</p>` +
      (data.checkins.length
        ? `<ul class="acct-list">${data.checkins
            .map(
              (c) =>
                `<li><a class="acct-item" href="${esc(shopUrl(c.shopId))}" data-shop-id="${esc(c.shopId)}">` +
                `<span class="acct-item-head"><span class="acct-item-name">${esc(shopNameOf(c.shopId))}</span>` +
                `<span class="acct-item-date">${esc(formatDate(c.checkedInAt))}</span></span></a></li>`
            )
            .join("")}</ul>`
        : `<p class="acct-note">${esc(x.noCheckins)}</p>`);
  }
  return head + `<div class="acct-tab-body">${body}</div>`;
}

function accountHeader(title, backHref) {
  const x = accountText();
  return (
    `<div class="todo-create-head mylist-page-head">` +
    (backHref ? `<a class="todo-back" href="${esc(backHref)}" data-acct-nav aria-label="${esc(x.back)}">${homeIcon("back", 24)}</a>` : "") +
    `<h2 class="todo-create-title acct-title">${esc(title)}</h2></div>`
  );
}

function savedRowHtml() {
  const x = accountText();
  const n = typeof favorites !== "undefined" ? favorites.size : 0;
  return (
    `<button type="button" class="acct-row" data-acct-action="saved">` +
    `<span class="acct-row-label">${esc(x.saved)}</span>` +
    `<span class="acct-row-value">${esc(x.savedCount(n))}${homeIcon("forward", 18)}</span></button>`
  );
}

// ---------------------------------------------------------------------
// 「アカウント」(URL「?view=account」)
// ---------------------------------------------------------------------
function renderAccountPage() {
  const x = accountText();
  if (authUser === undefined) {
    homePage.innerHTML = accountHeader(x.title) + `<section class="home-section"><p class="acct-note">${esc(x.loading)}</p></section>`;
    return;
  }
  if (!authUser) {
    accountEditing = false;
    homePage.innerHTML =
      // ログインしていないとき: シンプルに「ログインまたは新規登録」だけを、画面のまん中に
      //   (保存した店は、地図の「♡ 保存した店」から見られる。履歴を消すは、ログイン後のアカウント画面にある)
      accountHeader(x.title) +
      (accountGoodbye ? `<p class="mylist-toast" role="status">${homeIcon("check", 18)}<span>${esc(accountGoodbye)}</span></p>` : "") +
      `<section class="home-section acct-section acct-guest">` +
      `<div class="acct-guest-main"><div class="acct-guest-card">` +
      `<p class="acct-guest-title">${esc(x.loginTitle)}</p>` +
      `<button type="button" class="acct-guest-btn" data-acct-action="login">${esc(x.login)}</button>` +
      `</div></div>` +
      `</section>`;
    return;
  }
  accountGoodbye = "";
  const uid = authUser.uid;
  loadAccountData(uid, true);
  if (accountEditing) {
    renderAccountEdit();
    return;
  }
  if (new URLSearchParams(location.search).get("settings") === "1") {
    renderAccountSettings();
    return;
  }
  const data = accountData;
  const name = accountDisplayName(data, resolveAuthName(authUser));
  const photoURL = data.profile && data.profile.photoURL;
  const bio = data.profile && data.profile.bio;
  const msg = accountMessage;
  homePage.innerHTML =
    accountHeader(x.title) +
    (msg ? `<p class="mylist-toast" role="status">${homeIcon("check", 18)}<span>${esc(msg)}</span></p>` : "") +
    `<section class="home-section acct-section">` +
    `<div class="acct-card acct-profile">${accountAvatar(photoURL, name, 76)}` +
    `<div class="acct-profile-body"><h3 class="acct-name">${esc(name)}</h3>` +
    (bio ? `<p class="acct-bio">${esc(bio)}</p>` : "") +
    `</div></div>` +
    // プロフィールの編集 / シェア / アカウント設定(歯車)
    `<div class="acct-action-row">` +
    `<button type="button" class="acct-pill" data-acct-action="edit">${esc(x.editProfile)}</button>` +
    `<button type="button" class="acct-pill" data-acct-action="share">${esc(x.shareProfile)}</button>` +
    `<a class="acct-square" href="${esc(accountSettingsUrl())}" data-acct-nav aria-label="${esc(x.settingsOpen)}" title="${esc(x.settings)}">${ACCOUNT_GEAR_ICON}</a>` +
    `</div>` +
    savedRowHtml() +
    accountPostsHtml(data, ["photos", "reviews", "checkins"]) +
    `</section>`;
}

// アカウント設定(URL「?view=account&settings=1」。プロフィール画面の歯車から開く)
//   公開プロフィール・履歴を消す・利用規約・プライバシーポリシー・ログアウト(管理者は、管理用のボタンも)
// 設定(URL「?view=account&settings=1」。プロフィール画面の歯車から開く)
//   ・sub=spot(新しいスポットを追加 → 種類を選ぶ)/ sub=account(アカウント設定)
//     sub=email / password / delete(アカウント設定の中の各画面)
//   ・各機能の中身は js/settings.js(sub=requests は管理者だけの「届いたスポット」)
const ACCT_ICONS = {
  spot: '<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"></path><path d="M3 21h18"></path><path d="M9 7h1M14 7h1M9 11h1M14 11h1"></path><path d="M10 21v-4h4v4"></path>',
  account: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="10" r="3"></circle><path d="M6.5 18.5c1.2-2 3.2-3 5.5-3s4.3 1 5.5 3"></path>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>',
  doc: '<path d="M6 3h9l4 4v14H6z"></path><path d="M15 3v4h4"></path><path d="M9 12h6M9 16h6"></path>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"></path>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v4h4"></path><path d="M12 8v4l3 2"></path>',
  logout: '<path d="M9 4H5v16h4"></path><path d="M14 8l4 4-4 4"></path><path d="M18 12H9"></path>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M3 7l9 6 9-6"></path>',
  key: '<circle cx="8" cy="15" r="4"></circle><path d="M11 12l9-9M17 6l3 3M14 9l2 2"></path>',
  trash: '<path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="M6 7l1 13h10l1-13"></path>',
};
function acctIcon(name) {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ACCT_ICONS[name]}</svg>`;
}
function acctSettingsUrl(sub, extra) {
  return accountSettingsUrl() + (sub ? "&sub=" + encodeURIComponent(sub) : "") + (extra || "");
}
// 1行(アイコン・文字・›)。href があればリンク、無ければボタン
function acctRow({ icon, iconHtml, label, href, action, danger, nav = "data-acct-nav" }) {
  const inner =
    `<span class="acct-setting-icon">${iconHtml || acctIcon(icon)}</span>` +
    `<span class="acct-setting-label">${esc(label)}</span>${homeIcon("forward", 18)}`;
  const cls = `acct-setting${danger ? " is-danger" : ""}`;
  return href
    ? `<li><a class="${cls}" href="${esc(href)}" ${nav}>${inner}</a></li>`
    : `<li><button type="button" class="${cls}" data-acct-action="${esc(action)}">${inner}</button></li>`;
}

function renderAccountSettings() {
  const x = accountText();
  const t = ui[currentLang];
  const params = new URLSearchParams(location.search);
  const sub = params.get("sub");
  const page = (title, backHref, body) => {
    homePage.innerHTML = accountHeader(title, backHref) + `<section class="home-section acct-section">${body}</section>`;
  };
  // 各機能の画面(スポットの入力・メール・パスワード・削除・管理者の一覧)は js/settings.js
  if (typeof renderSettingsSub === "function" && renderSettingsSub(sub, params, page)) return;

  if (sub === "spot") {
    page(
      x.addSpot,
      accountSettingsUrl(),
      `<p class="acct-lead">${esc(x.addSpotLead)}</p><ul class="acct-settings">` +
        ["restaurant", "cafe", "grocery"]
          .map((ty) =>
            acctRow({
              iconHtml: `<span class="acct-type-icon home-entry-${ty}"><span class="home-entry-icon">${homeIcon(ty, 22)}</span></span>`,
              label: x.typeNames[ty],
              href: acctSettingsUrl("spot", "&type=" + ty),
            })
          )
          .join("") +
        `</ul>`
    );
    return;
  }
  if (sub === "account") {
    page(
      x.accountSettings,
      accountSettingsUrl(),
      `<ul class="acct-settings">` +
        acctRow({ icon: "mail", label: x.emailSetting, href: acctSettingsUrl("email") }) +
        acctRow({ icon: "key", label: x.passwordSetting, href: acctSettingsUrl("password") }) +
        acctRow({ icon: "trash", label: x.deleteAccount, href: acctSettingsUrl("delete"), danger: true }) +
        `</ul>`
    );
    return;
  }

  // 設定のトップ
  page(
    x.settings,
    accountUrl(),
    `<ul class="acct-settings">` +
      acctRow({ icon: "spot", label: x.addSpot, href: acctSettingsUrl("spot") }) +
      acctRow({ icon: "account", label: x.accountSettings, href: acctSettingsUrl("account") }) +
      acctRow({ icon: "eye", label: x.viewPublic, href: userUrl(authUser.uid) }) +
      `</ul>` +
      `<ul class="acct-settings">` +
      acctRow({ icon: "doc", label: t.termsPageTitle || x.terms, href: termsUrl(), nav: "data-home-nav" }) +
      acctRow({ icon: "shield", label: t.privacyPageTitle || x.privacy, href: privacyUrl(), nav: "data-home-nav" }) +
      acctRow({ icon: "logout", label: x.logout, action: "logout" }) +
      `</ul>` +
      (isAdminUser(authUser)
        ? `<ul class="acct-settings">` +
          acctRow({ icon: "spot", label: settingsText().adminRequests, href: acctSettingsUrl("requests") }) +
          `</ul>` +
          `<div class="acct-bottom"><button type="button" class="acct-admin" data-acct-action="backfill">${esc(x.adminBackfill)}</button>` +
          (accountAdminMessage ? `<p class="acct-note">${esc(accountAdminMessage)}</p>` : "") +
          `</div>`
        : "")
  );
}
function accountSettingsUrl() {
  return location.pathname + "?view=account&settings=1";
}
const ACCOUNT_GEAR_ICON = typeof TODO_GEAR_ICON !== "undefined" ? TODO_GEAR_ICON : homeIcon("sparkle", 22);

// プロフィールをシェア: スマホなどは、端末のシェア画面(LINE・メールなど)。使えないときは、リンクをコピー
function shareMyProfile() {
  const x = accountText();
  const url = location.origin + location.pathname + "?user=" + encodeURIComponent(authUser.uid);
  const name = accountDisplayName(accountData, resolveAuthName(authUser));
  if (navigator.share) {
    navigator.share({ title: x.shareTitle(name), url }).catch(() => {}); // やめたときは、何もしない
    return;
  }
  const done = (text) => {
    setAccountMessage(text);
    renderHomeMode();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => done(x.linkCopied), () => done(x.linkCopyFailed(url)));
  } else done(x.linkCopyFailed(url));
}

// プロフィールの編集
function renderAccountEdit() {
  const x = accountText();
  const data = accountData;
  if (!accountDraft) {
    const p = (data && data.profile) || {};
    accountDraft = {
      displayName: p.displayName || resolveAuthName(authUser) || "",
      bio: p.bio || "",
      photoURL: p.photoURL || "",
      busy: false,
      message: "",
      confirmDelete: false,
    };
  }
  const d = accountDraft;
  homePage.innerHTML =
    accountHeader(x.editTitle) +
    `<section class="home-section acct-section">` +
    `<form class="acct-form" data-acct-form novalidate>` +
    `<div class="acct-icon-edit">${accountAvatar(d.photoURL, d.displayName, 88)}` +
    `<div><p class="acct-label">${esc(x.iconLabel)}</p>` +
    `<label class="todo-secondary acct-file"><input type="file" accept="image/*" data-acct-file hidden>${esc(x.iconChoose)}</label>` +
    (d.photoURL ? ` <button type="button" class="acct-text-btn" data-acct-action="icon-remove">${esc(x.iconRemove)}</button>` : "") +
    `</div></div>` +
    `<p class="acct-small">${esc(x.iconNote)}</p>` +
    `<label class="acct-label" for="acct-name">${esc(x.nameLabel)}</label>` +
    `<input id="acct-name" class="acct-input" maxlength="30" value="${esc(d.displayName)}" autocomplete="nickname">` +
    `<label class="acct-label" for="acct-bio">${esc(x.bioLabel)}</label>` +
    `<textarea id="acct-bio" class="acct-input" maxlength="160" rows="4" placeholder="${esc(x.bioPlaceholder)}">${esc(d.bio)}</textarea>` +
    // 結果(エラーなど)は、目立つ枠で出す
    `<p class="acct-message${d.error ? " is-error" : ""}" role="status"${d.message ? "" : " hidden"}>${esc(d.message)}</p>` +
    `<div class="todo-actions">` +
    `<button type="submit" class="todo-primary"${d.busy ? " disabled" : ""}>${esc(d.busy ? x.saving : x.save)}</button>` +
    `<button type="button" class="todo-secondary" data-acct-action="cancel"${d.busy ? " disabled" : ""}>${esc(x.cancel)}</button></div>` +
    `</form></section>`;
}

// 入力中の文字を、描き直しで消さないように、下書きに控える
function keepAccountDraftInputs() {
  if (!accountDraft) return;
  const name = homePage.querySelector("#acct-name");
  const bio = homePage.querySelector("#acct-bio");
  if (name) accountDraft.displayName = name.value;
  if (bio) accountDraft.bio = bio.value;
}

// 画像を、中央の正方形に切り取って 256×256 の JPEG にする(写真の位置情報などのデータは、ここで消える)
function makeAvatarBlob(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      canvas.getContext("2d").drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

// ---------------------------------------------------------------------
// プロフィール(URL「?user=ユーザーID」)。誰でも見られる
// ---------------------------------------------------------------------
function renderUserPage(uid) {
  const x = accountText();
  if (!uid || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) {
    homePage.innerHTML = accountHeader(x.title, homeUrl()) + `<section class="home-section"><p class="acct-note">${esc(x.notFound)}</p></section>`;
    return;
  }
  loadAccountData(uid, false);
  const data = accountData;
  const isMe = !!(authUser && authUser.uid === uid);
  const clicked = window.lastUserLink && window.lastUserLink.uid === uid ? window.lastUserLink.name : "";
  const name = accountDisplayName(data, isMe ? resolveAuthName(authUser) : "") || clicked;
  const backHref = history.length > 1 ? "back" : homeUrl();
  if (data.status === "ready" && !data.profile && !data.photos.length && !data.reviews.length && !isMe && !clicked) {
    homePage.innerHTML = accountHeader(x.title, backHref) + `<section class="home-section"><p class="acct-note">${esc(x.notFound)}</p></section>`;
    return;
  }
  const photoURL = data.profile && data.profile.photoURL;
  const bio = data.profile && data.profile.bio;
  homePage.innerHTML =
    accountHeader(name || x.title, backHref) +
    `<section class="home-section acct-section">` +
    `<div class="acct-card acct-profile">${accountAvatar(photoURL, name, 76)}` +
    `<div class="acct-profile-body"><h3 class="acct-name">${esc(name)}</h3>` +
    (bio ? `<p class="acct-bio">${esc(bio)}</p>` : "") +
    `</div></div>` +
    (isMe ? `<div class="acct-actions"><a class="acct-link" href="${esc(accountUrl())}" data-acct-nav>${esc(x.editProfile)} ›</a></div>` : "") +
    accountPostsHtml(data, ["photos", "reviews"]) +
    (authUser && isAdminUser(authUser) && !isMe && data.profile
      ? `<div class="acct-bottom"><button type="button" class="acct-admin" data-acct-action="admin-delete" data-uid="${esc(uid)}">${esc(x.adminDelete)}</button></div>`
      : "") +
    `</section>`;
}

// ---------------------------------------------------------------------
// 操作
// ---------------------------------------------------------------------
homePage.addEventListener("click", (event) => {
  const t = event.target;
  const nav = t.closest("[data-acct-nav]");
  if (nav) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    if (nav.getAttribute("href") === "back") history.back();
    else navigate(nav.getAttribute("href"));
    return;
  }
  const tab = t.closest("[data-acct-tab]");
  if (tab) {
    accountTab = tab.dataset.acctTab;
    renderHomeMode();
    return;
  }
  const btn = t.closest("[data-acct-action]");
  if (!btn) return;
  const x = accountText();
  const action = btn.dataset.acctAction;
  if (action === "share") {
    shareMyProfile();
    return;
  }
  if (action === "login") openAuthModal();
  else if (action === "saved") {
    navigate(mapUrl());
    resetFilters();
    favoritesOnly = true;
    applyFilters();
    renderTabs();
  } else if (action === "logout") {
    accountData = null;
    signOutFromGoogle();
  } else if (action === "edit") {
    accountEditing = true;
    accountDraft = null;
    renderHomeMode();
    homeView.scrollTop = 0;
  } else if (action === "cancel") {
    accountEditing = false;
    accountDraft = null;
    renderHomeMode();
  } else if (action === "icon-remove") {
    keepAccountDraftInputs();
    accountDraft.photoURL = "";
    renderHomeMode();
  } else if (action === "admin-delete") {
    const uid = btn.dataset.uid;
    getProfileApi()
      .then((api) => api.deleteProfile(uid))
      .then(() => {
        accountData = null;
        renderHomeMode();
      })
      .catch((error) => console.warn("プロフィールを削除できませんでした:", error));
  } else if (action === "backfill") {
    btn.disabled = true;
    getProfileApi()
      .then((api) => api.backfillUids())
      .then((n) => {
        accountAdminMessage = x.adminBackfillDone(n);
        accountData = null;
      })
      .catch((error) => {
        console.warn("書き足しに失敗:", error);
        accountAdminMessage = x.saveError;
      })
      .then(() => renderHomeMode());
  }
});

// アイコン画像を選んだら、縮めてアップロードする
homePage.addEventListener("change", (event) => {
  if (!event.target.matches("[data-acct-file]")) return;
  const file = event.target.files && event.target.files[0];
  if (!file || !accountDraft) return;
  const x = accountText();
  keepAccountDraftInputs();
  accountDraft.busy = true;
  accountDraft.message = x.uploading;
  accountDraft.error = false;
  renderHomeMode();
  makeAvatarBlob(file)
    .then((blob) => getProfileApi().then((api) => api.uploadAvatar(blob)))
    .then((url) => {
      accountDraft.photoURL = url;
      accountDraft.message = "";
    })
    .catch((error) => {
      console.warn("アイコン画像を送れませんでした:", error);
      accountDraft.message = x.saveError;
      accountDraft.error = true;
    })
    .then(() => {
      accountDraft.busy = false;
      renderHomeMode();
    });
});

// プロフィールを保存する
homePage.addEventListener(
  "submit",
  (event) => {
    if (!event.target.matches("[data-acct-form]")) return;
    event.preventDefault();
    event.stopPropagation();
    const x = accountText();
    keepAccountDraftInputs();
    const d = accountDraft;
    const displayName = d.displayName.trim().slice(0, 30);
    const bio = d.bio.trim().slice(0, 160);
    if (!displayName) {
      d.message = x.needName;
      d.error = true;
      renderHomeMode();
      showAccountMessage();
      return;
    }
    d.busy = true;
    d.message = "";
    d.error = false;
    renderHomeMode();
    getProfileApi()
      .then((api) => api.saveProfile({ displayName, bio, photoURL: d.photoURL || "" }))
      .then(() => {
        accountEditing = false;
        accountDraft = null;
        accountData = null; // 読み込み直す
        setAccountMessage(x.saved_ok);
        homeView.scrollTop = 0;
      })
      .catch((error) => {
        console.warn("プロフィールを保存できませんでした:", error);
        d.busy = false;
        d.error = true;
        // 「権限がない」= Firestore のルール(firestore.rules)が、まだ新しいものになっていない
        d.message = error && error.code === "permission-denied" ? x.rulesError : x.saveError;
      })
      .then(() => {
        renderHomeMode();
        showAccountMessage();
      });
  },
  true
);

// エラーなどの結果が、画面の外にあっても見えるように、そこまで動かす
function showAccountMessage() {
  const el = homePage.querySelector(".acct-message:not([hidden])");
  if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
}

// ログイン・ログアウトしたら、アカウント画面を描き直す(js/auth.js の renderAuth から呼ばれる)
let accountLastUid;
function onAccountAuthChanged() {
  const uid = authUser ? authUser.uid : authUser === null ? null : undefined;
  if (uid === accountLastUid) return;
  accountLastUid = uid;
  accountEditing = false;
  accountDraft = null;
  if (document.body.classList.contains("view-home") && (homeMode === "account" || homeMode === "user")) renderHomeMode();
}
