// お知らせ(アカウント画面の右上の🔔。URL「?view=account&notifications=1」)
//   出すもの:
//     ・新しくフォローされた(follows の to が自分のもの)
//     ・自分の写真へのコメント(自分の新しい写真 20枚分。自分のコメントは除く)
//     ・ランクアップ(js/user-rank.js。上がったことに気づいたときに、この端末に記録する)
//     ・運営からのお知らせ(announcements。管理者が、この画面から書く・消す)
//   ・サーバーでお知らせを作る仕組みは使わず、もとの記録から、開いたときに組み立てる(追加料金なし)
//   ・「見た」時刻と、ランクアップの記録は、この端末(localStorage)にだけ保存する
//   ・🔔 の赤い数字: 最後にお知らせを開いたあとに増えたものの数
const NOTIF_TEXT = {
  ja: {
    title: "お知らせ",
    open: "お知らせ",
    empty: "まだお知らせはありません",
    loading: "読み込み中…",
    follow: (name) => `${name}さんがあなたをフォローしました`,
    comment: (name) => `${name}さんがあなたの写真にコメントしました`,
    rank: (rank) => `${rank} にランクアップしました!`,
    someone: "だれか",
    adminTitle: "運営からのお知らせを書く(管理者だけ)",
    adminSubject: "タイトル",
    adminBody: "本文",
    adminPost: "お知らせを出す",
    adminDelete: "このお知らせを消す",
    adminConfirm: "このお知らせを消しますか?",
    adminError: "送れませんでした。時間をおいて、もう一度お試しください",
    ago: (ms) => {
      const m = Math.floor(ms / 60000);
      if (m < 1) return "たった今";
      if (m < 60) return `${m}分前`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}時間前`;
      const d = Math.floor(h / 24);
      if (d < 30) return `${d}日前`;
      return `${Math.floor(d / 30)}か月前`;
    },
  },
  en: {
    title: "Notifications",
    open: "Notifications",
    empty: "No notifications yet",
    loading: "Loading…",
    follow: (name) => `${name} started following you`,
    comment: (name) => `${name} commented on your photo`,
    rank: (rank) => `You ranked up to ${rank}!`,
    someone: "Someone",
    adminTitle: "Post an announcement (admins only)",
    adminSubject: "Title",
    adminBody: "Message",
    adminPost: "Post",
    adminDelete: "Delete this announcement",
    adminConfirm: "Delete this announcement?",
    adminError: "Couldn't send. Please try again later.",
    ago: (ms) => {
      const m = Math.floor(ms / 60000);
      if (m < 1) return "just now";
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      const d = Math.floor(h / 24);
      if (d < 30) return `${d}d ago`;
      return `${Math.floor(d / 30)}mo ago`;
    },
  },
  vi: {
    title: "Thông báo",
    open: "Thông báo",
    empty: "Chưa có thông báo",
    loading: "Đang tải…",
    follow: (name) => `${name} đã theo dõi bạn`,
    comment: (name) => `${name} đã bình luận ảnh của bạn`,
    rank: (rank) => `Bạn đã lên hạng ${rank}!`,
    someone: "Ai đó",
    adminTitle: "Viết thông báo (chỉ quản trị viên)",
    adminSubject: "Tiêu đề",
    adminBody: "Nội dung",
    adminPost: "Đăng thông báo",
    adminDelete: "Xóa thông báo này",
    adminConfirm: "Xóa thông báo này?",
    adminError: "Không gửi được. Vui lòng thử lại sau.",
    ago: (ms) => {
      const m = Math.floor(ms / 60000);
      if (m < 1) return "vừa xong";
      if (m < 60) return `${m} phút trước`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} giờ trước`;
      const d = Math.floor(h / 24);
      if (d < 30) return `${d} ngày trước`;
      return `${Math.floor(d / 30)} tháng trước`;
    },
  },
};
function notifText() {
  return NOTIF_TEXT[typeof currentLang !== "undefined" && NOTIF_TEXT[currentLang] ? currentLang : "ja"];
}
function notificationsUrl() {
  return appBase() + "?view=account&notifications=1";
}
const notifMillis = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : t && t.seconds ? t.seconds * 1000 : Number(t) || 0);

// この端末に保存するもの(ユーザーごと)
function notifStore(uid) {
  try {
    const v = JSON.parse(localStorage.getItem("vf_notif_" + uid) || "{}");
    // はじめて開く端末では、ここ7日分だけを「新しい」とする(昔のお知らせまで、赤い数字に数えないように)
    const first = Date.now() - 7 * 86400000;
    return { seenAt: Number(v.seenAt) || first, rankKey: v.rankKey || "", ranks: Array.isArray(v.ranks) ? v.ranks : [] };
  } catch (e) {
    return { seenAt: Date.now() - 7 * 86400000, rankKey: "", ranks: [] };
  }
}
function notifSave(uid, v) {
  try {
    localStorage.setItem("vf_notif_" + uid, JSON.stringify(v));
  } catch (e) {
    // 保存できない環境では、何もしない
  }
}

// ランクアップに気づいたら、記録する(はじめて見たときは、今のランクを覚えるだけ。お知らせにはしない)
function notifCheckRank(uid, rank) {
  if (!uid || !rank || typeof USER_RANKS === "undefined") return;
  const v = notifStore(uid);
  const now = USER_RANKS.findIndex((r) => r.key === rank.key);
  const before = USER_RANKS.findIndex((r) => r.key === v.rankKey);
  if (!v.rankKey) {
    v.rankKey = rank.key;
  } else if (now > before) {
    v.ranks = [...v.ranks, { key: rank.key, at: Date.now() }].slice(-10);
    v.rankKey = rank.key;
  } else if (now < before) {
    v.rankKey = rank.key; // 投稿を消してランクが下がったときは、覚え直すだけ(お知らせにはしない)
  } else return;
  notifSave(uid, v);
}

// お知らせを組み立てる(このページを開いている間は、同じユーザーの分を覚えておく)
let notifState = { uid: null, status: "idle", items: [] };
function loadNotifications(uid, force) {
  if (!uid || typeof getProfileApi !== "function") return;
  if (!force && notifState.uid === uid && notifState.status !== "idle") return;
  const state = { uid, status: "loading", items: [] };
  notifState = state;
  getProfileApi()
    .then(async (api) => {
      const [followers, announcements, photos] = await Promise.all([
        api.fetchMyFollowers().catch(() => []),
        api.fetchAnnouncements().catch(() => []),
        api.fetchUserPhotos(uid).catch(() => []),
      ]);
      // 自分の写真へのコメント(新しい写真 20枚分だけ見る。読み込みを増やしすぎないため)
      const recent = photos
        .filter((p) => !p.hidden)
        .sort((a, b) => notifMillis(b.createdAt) - notifMillis(a.createdAt))
        .slice(0, 20);
      const photosApi = typeof getPhotosApi === "function" ? await getPhotosApi().catch(() => null) : null;
      const comments = photosApi
        ? (
            await Promise.all(
              recent.map((p) =>
                photosApi
                  .fetchComments(p.shopId, p.id)
                  .then((list) => list.map((c) => ({ ...c, shopId: p.shopId })))
                  .catch(() => [])
              )
            )
          ).flat()
        : [];
      // フォローしてくれた人の名前・アイコン
      const fromIds = [...new Set(followers.map((f) => f.from).filter(Boolean))].slice(0, 30);
      const profiles = {};
      await Promise.all(
        fromIds.map((id) =>
          api
            .fetchProfile(id)
            .then((pr) => (profiles[id] = pr))
            .catch(() => null)
        )
      );
      const items = [
        ...followers
          .filter((f) => f.from)
          .map((f) => ({ kind: "follow", at: notifMillis(f.createdAt), uid: f.from, name: profiles[f.from] && profiles[f.from].displayName, photoURL: profiles[f.from] && profiles[f.from].photoURL })),
        ...comments
          .filter((c) => c.uid !== uid && !c.hidden)
          .map((c) => ({ kind: "comment", at: notifMillis(c.createdAt), uid: c.uid, name: c.authorName, text: c.comment, shopId: c.shopId })),
        ...notifStore(uid).ranks.map((r) => ({ kind: "rank", at: r.at, rankKey: r.key })),
        ...announcements.map((a) => ({ kind: "news", at: notifMillis(a.createdAt), id: a.id, title: a.title, body: a.body })),
      ]
        .filter((it) => it.at > 0)
        .sort((a, b) => b.at - a.at)
        .slice(0, 60);
      state.items = items;
      state.status = "ready";
    })
    .catch((error) => {
      console.warn("お知らせを読めませんでした:", error);
      state.status = "error";
    })
    .then(() => {
      if (notifState !== state) return;
      updateNotifBadge();
      if (document.body.classList.contains("view-home") && isNotificationsPage()) renderHomeMode();
    });
}
function isNotificationsPage() {
  return typeof homeMode !== "undefined" && homeMode === "account" && new URLSearchParams(location.search).get("notifications") === "1";
}
function notifUnreadCount() {
  if (!authUser || notifState.uid !== authUser.uid || notifState.status !== "ready") return 0;
  const seen = notifStore(authUser.uid).seenAt;
  return notifState.items.filter((it) => it.at > seen).length;
}

// アカウント画面の右上の🔔(赤い数字つき)
function notifBellHtml() {
  if (!authUser) return "";
  loadNotifications(authUser.uid);
  const n = notifUnreadCount();
  const x = notifText();
  return (
    `<a class="notif-bell" href="${esc(notificationsUrl())}" data-acct-nav aria-label="${esc(x.open)}${n ? ` (${n})` : ""}" title="${esc(x.open)}">` +
    `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>` +
    `<span class="notif-badge"${n ? "" : " hidden"}>${n > 99 ? "99+" : n}</span></a>`
  );
}
function updateNotifBadge() {
  const badge = document.querySelector(".notif-bell .notif-badge");
  if (!badge) return;
  const n = notifUnreadCount();
  badge.textContent = n > 99 ? "99+" : String(n);
  badge.hidden = !n;
}

// お知らせの画面
function renderNotificationsPage() {
  const x = notifText();
  const uid = authUser.uid;
  loadNotifications(uid);
  const seenBefore = notifStore(uid).seenAt;
  let body;
  if (notifState.status === "loading" || notifState.status === "idle") body = `<p class="acct-note">${esc(x.loading)}</p>`;
  else if (!notifState.items.length) body = `<p class="acct-note">${esc(x.empty)}</p>`;
  else {
    const now = Date.now();
    const admin = typeof isAdminUser === "function" && isAdminUser(authUser);
    body =
      `<ul class="notif-list">` +
      notifState.items
        .map((it) => {
          const isNew = it.at > seenBefore;
          const when = `<span class="notif-time">${esc(x.ago(now - it.at))}</span>`;
          let icon = "";
          let main = "";
          let href = "";
          if (it.kind === "follow") {
            icon = typeof accountAvatar === "function" ? accountAvatar(it.photoURL || "", it.name || "?", 40) : "👤";
            main = esc(x.follow(it.name || x.someone));
            href = userUrl(it.uid);
          } else if (it.kind === "comment") {
            icon = `<span class="notif-icon">💬</span>`;
            main = esc(x.comment(it.name || x.someone)) + (it.text ? `<span class="notif-sub">「${esc(it.text.slice(0, 80))}」</span>` : "");
            href = shopUrl(it.shopId);
          } else if (it.kind === "rank") {
            const rank = (typeof USER_RANKS !== "undefined" && USER_RANKS.find((r) => r.key === it.rankKey)) || null;
            const lang = typeof currentLang !== "undefined" && rank && rank.name[currentLang] ? currentLang : "ja";
            icon = `<span class="notif-icon">🎉</span>`;
            main = esc(x.rank(rank ? rank.name[lang] : it.rankKey));
            href = accountUrl();
          } else {
            icon = `<span class="notif-icon">📢</span>`;
            main = `<strong>${esc(it.title || "")}</strong>` + (it.body ? `<span class="notif-sub notif-news-body">${esc(it.body)}</span>` : "");
          }
          const inner = `${icon}<span class="notif-body"><span class="notif-main">${main}</span>${when}</span>`;
          return (
            `<li class="notif-item${isNew ? " is-new" : ""}">` +
            (href ? `<a class="notif-row" href="${esc(href)}" data-acct-nav>${inner}</a>` : `<div class="notif-row">${inner}</div>`) +
            (it.kind === "news" && admin
              ? `<button type="button" class="notif-admin-delete" data-notif-delete="${esc(it.id)}">${esc(x.adminDelete)}</button>`
              : "") +
            `</li>`
          );
        })
        .join("") +
      `</ul>`;
  }
  const adminForm =
    typeof isAdminUser === "function" && isAdminUser(authUser)
      ? `<form class="notif-admin" id="notif-admin-form">` +
        `<p class="notif-admin-title">${esc(x.adminTitle)}</p>` +
        `<label class="visually-hidden" for="notif-admin-subject">${esc(x.adminSubject)}</label>` +
        `<input id="notif-admin-subject" type="text" maxlength="80" placeholder="${esc(x.adminSubject)}" required>` +
        `<label class="visually-hidden" for="notif-admin-body">${esc(x.adminBody)}</label>` +
        `<textarea id="notif-admin-body" maxlength="1000" rows="3" placeholder="${esc(x.adminBody)}"></textarea>` +
        `<button type="submit" class="btn btn-primary">${esc(x.adminPost)}</button></form>`
      : "";
  homePage.innerHTML = accountHeader(x.title, accountUrl()) + `<section class="home-section acct-section">${adminForm}${body}</section>`;
  // 開いたら「見た」にする(赤い数字を消す。この画面の「新しい」の印は、開いている間は残す)
  if (notifState.status === "ready") {
    const v = notifStore(uid);
    v.seenAt = Date.now();
    notifSave(uid, v);
  }
  const form = homePage.querySelector("#notif-admin-form");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const title = form.querySelector("#notif-admin-subject").value.trim();
      const text = form.querySelector("#notif-admin-body").value.trim();
      if (!title) return;
      form.querySelector("button").disabled = true;
      try {
        const api = await getProfileApi();
        await api.addAnnouncement(title, text);
        loadNotifications(uid, true);
      } catch (error) {
        console.warn("お知らせを出せませんでした:", error);
        window.alert(x.adminError);
        form.querySelector("button").disabled = false;
      }
    });
  }
}
document.addEventListener("click", async (event) => {
  const del = event.target.closest("[data-notif-delete]");
  if (!del) return;
  const x = notifText();
  if (!window.confirm(x.adminConfirm)) return;
  try {
    const api = await getProfileApi();
    await api.deleteAnnouncement(del.dataset.notifDelete);
    if (authUser) loadNotifications(authUser.uid, true);
  } catch (error) {
    console.warn("お知らせを消せませんでした:", error);
    window.alert(x.adminError);
  }
});
