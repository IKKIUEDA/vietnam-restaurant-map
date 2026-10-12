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
    saved: "♡ 保存した店",
    savedCount: (n) => `${n}件`,
    editProfile: "プロフィールを編集",
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
    publicNote: "ニックネーム・アイコン・自己紹介と、投稿した写真・レビューは、プロフィールとして他の利用者も見られます。住所・電話番号など、個人を特定できる情報は書かないでください。",
    save: "保存する",
    cancel: "やめる",
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
    saved: "♡ Saved shops",
    savedCount: (n) => `${n}`,
    editProfile: "Edit profile",
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
    publicNote: "Your nickname, picture, bio, and the photos and reviews you post are visible to other users on your profile. Don't include your address, phone number or other personal details.",
    save: "Save",
    cancel: "Cancel",
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
    saved: "♡ Quán đã lưu",
    savedCount: (n) => `${n} quán`,
    editProfile: "Sửa hồ sơ",
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
    publicNote: "Biệt danh, ảnh đại diện, giới thiệu và ảnh, đánh giá bạn đăng sẽ hiển thị cho người dùng khác trên hồ sơ. Đừng ghi địa chỉ, số điện thoại hay thông tin cá nhân.",
    save: "Lưu",
    cancel: "Hủy",
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
let accountMessage = ""; // 保存しました など(1回だけ出す)
let accountAdminMessage = "";

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
      accountHeader(x.title) +
      `<section class="home-section acct-section">` +
      `<div class="acct-card acct-login">${accountAvatar("", "?", 64)}<p>${esc(x.loginLead)}</p>` +
      `<button type="button" class="todo-primary" data-acct-action="login">${esc(x.login)}</button></div>` +
      savedRowHtml() +
      `</section>`;
    return;
  }
  const uid = authUser.uid;
  loadAccountData(uid, true);
  if (accountEditing) {
    renderAccountEdit();
    return;
  }
  const data = accountData;
  const name = accountDisplayName(data, resolveAuthName(authUser));
  const photoURL = data.profile && data.profile.photoURL;
  const bio = data.profile && data.profile.bio;
  const msg = accountMessage;
  accountMessage = "";
  homePage.innerHTML =
    accountHeader(x.title) +
    (msg ? `<p class="mylist-toast" role="status">${homeIcon("check", 18)}<span>${esc(msg)}</span></p>` : "") +
    `<section class="home-section acct-section">` +
    `<div class="acct-card acct-profile">${accountAvatar(photoURL, name, 76)}` +
    `<div class="acct-profile-body"><h3 class="acct-name">${esc(name)}</h3>` +
    (bio ? `<p class="acct-bio">${esc(bio)}</p>` : "") +
    `</div></div>` +
    `<div class="acct-actions">` +
    `<button type="button" class="todo-secondary" data-acct-action="edit">${esc(x.editProfile)}</button>` +
    `<a class="acct-link" href="${esc(userUrl(uid))}" data-acct-nav>${esc(x.viewPublic)} ›</a></div>` +
    savedRowHtml() +
    accountPostsHtml(data, ["photos", "reviews", "checkins"]) +
    `<div class="acct-bottom">` +
    `<button type="button" class="acct-logout" data-acct-action="logout">${esc(x.logout)}</button>` +
    (isAdminUser(authUser)
      ? `<button type="button" class="acct-admin" data-acct-action="backfill">${esc(x.adminBackfill)}</button>` +
        (accountAdminMessage ? `<p class="acct-note">${esc(accountAdminMessage)}</p>` : "")
      : "") +
    `</div></section>`;
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
    `<p class="acct-small">${esc(x.publicNote)}</p>` +
    // 結果(エラーなど)は、目立つ枠で出す
    `<p class="acct-message${d.error ? " is-error" : ""}" role="status"${d.message ? "" : " hidden"}>${esc(d.message)}</p>` +
    `<div class="todo-actions">` +
    `<button type="submit" class="todo-primary"${d.busy ? " disabled" : ""}>${esc(d.busy ? x.saving : x.save)}</button>` +
    `<button type="button" class="todo-secondary" data-acct-action="cancel"${d.busy ? " disabled" : ""}>${esc(x.cancel)}</button></div>` +
    (data && data.profile
      ? `<div class="todo-delete-row"><button type="button" class="todo-delete${d.confirmDelete ? " is-confirm" : ""}" data-acct-action="delete">${esc(d.confirmDelete ? x.deleteConfirm : x.deleteProfile)}</button></div>`
      : "") +
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
  } else if (action === "delete") {
    keepAccountDraftInputs();
    if (!accountDraft.confirmDelete) {
      accountDraft.confirmDelete = true; // もう1回押すと、本当に削除する
      renderHomeMode();
      return;
    }
    accountDraft.busy = true;
    getProfileApi()
      .then((api) => api.deleteProfile())
      .then(() => {
        accountEditing = false;
        accountDraft = null;
        accountData = null;
        accountMessage = x.deleted;
      })
      .catch((error) => {
        console.warn("プロフィールを削除できませんでした:", error);
        accountDraft.busy = false;
        accountDraft.message = x.saveError;
        accountDraft.error = true;
      })
      .then(() => renderHomeMode());
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
        accountMessage = x.saved_ok;
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
