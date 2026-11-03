// ユーザーランク(称号): 公開されている投稿の件数だけで、自動で決める
//   ・数えるもの: レビュー(1件ずつ)+ 写真(同じお店・同じ日の写真は、何枚でも 1件)
//     ※ Tips・新しいスポットの提供は、本人と管理者しか見られない記録のため、いまは数えない
//   ・非表示(管理者が隠したもの)・削除したもの・掲載していないお店のものは数えない
//   ・いつも、いまの件数で判定する(投稿を消せば、ランクも下がる)
//   ・ランクは保存しない。表示するたびに、公開されている投稿から数える(ブラウザで細工しても、ごまかせない)
//   ・Ambassador だけは「50件以上」かつ「10店舗以上」
const USER_RANKS = [
  { key: "beginner", min: 0, name: { ja: "Foodie Beginner", en: "Foodie Beginner", vi: "Foodie Beginner" }, sub: { ja: "初級", en: "Beginner", vi: "Mới bắt đầu" } },
  { key: "explorer", min: 3, name: { ja: "Foodie Explorer", en: "Foodie Explorer", vi: "Foodie Explorer" }, sub: { ja: "探検家", en: "Explorer", vi: "Nhà khám phá" } },
  { key: "contributor", min: 10, name: { ja: "Foodie Contributor", en: "Foodie Contributor", vi: "Foodie Contributor" }, sub: { ja: "貢献者", en: "Contributor", vi: "Người đóng góp" } },
  { key: "expert", min: 25, name: { ja: "Foodie Expert", en: "Foodie Expert", vi: "Foodie Expert" }, sub: { ja: "上級", en: "Expert", vi: "Chuyên gia" } },
  { key: "ambassador", min: 50, minShops: 10, name: { ja: "Vietnam Foodie Ambassador", en: "Vietnam Foodie Ambassador", vi: "Vietnam Foodie Ambassador" }, sub: { ja: "特別称号", en: "Special title", vi: "Danh hiệu đặc biệt" } },
];
const USER_RANK_TEXT = {
  ja: {
    next: "次のランクまで",
    progress: (n, need) => `${n} / ${need}件`,
    remain: (n) => `あと${n}件の投稿でランクアップ!`,
    remainShops: (n) => `あと${n}店舗への投稿でランクアップ!`,
    top: "最高ランクです。いつもありがとうございます!",
    how: "ランクは、レビューと写真の投稿数で決まります(同じお店・同じ日の写真はまとめて1件)",
  },
  en: {
    next: "Next rank",
    progress: (n, need) => `${n} / ${need}`,
    remain: (n) => `${n} more ${n === 1 ? "post" : "posts"} to rank up!`,
    remainShops: (n) => `Post at ${n} more ${n === 1 ? "shop" : "shops"} to rank up!`,
    top: "You've reached the top rank. Thank you!",
    how: "Your rank is based on your reviews and photos (photos at the same shop on the same day count as one).",
  },
  vi: {
    next: "Hạng tiếp theo",
    progress: (n, need) => `${n} / ${need}`,
    remain: (n) => `Đăng thêm ${n} bài để lên hạng!`,
    remainShops: (n) => `Đăng ở thêm ${n} quán để lên hạng!`,
    top: "Bạn đã đạt hạng cao nhất. Cảm ơn bạn!",
    how: "Hạng dựa trên số đánh giá và ảnh bạn đăng (ảnh ở cùng quán trong cùng ngày tính là 1).",
  },
};
function userRankText() {
  return USER_RANK_TEXT[typeof currentLang !== "undefined" && USER_RANK_TEXT[currentLang] ? currentLang : "ja"];
}

// 投稿の一覧から、件数と店舗数を数える
//   photos / reviews: [{ shopId, createdAt, hidden, ... }](js/account.js と同じ形)
function countUserPosts(photos, reviews) {
  const known = (x) => x && !x.hidden && typeof restaurants !== "undefined" && restaurants.some((s) => s.id === x.shopId);
  const day = (t) => {
    const ms = t && typeof t.toMillis === "function" ? t.toMillis() : t && t.seconds ? t.seconds * 1000 : 0;
    const d = new Date(ms);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };
  const photoUnits = new Set((photos || []).filter((p) => known(p) && p.photoStatus !== "removed").map((p) => `${p.shopId}|${day(p.createdAt)}`));
  const shownReviews = (reviews || []).filter(known);
  const shops = new Set([...[...photoUnits].map((k) => k.split("|")[0]), ...shownReviews.map((r) => r.shopId)]);
  return { count: photoUnits.size + shownReviews.length, shops: shops.size };
}

// 件数から、ランクを決める
function userRankFor(stats) {
  let rank = USER_RANKS[0];
  USER_RANKS.forEach((r) => {
    if (stats.count >= r.min && (!r.minShops || stats.shops >= r.minShops)) rank = r;
  });
  return rank;
}

// バッジ(名前の下・横に出す、小さな丸い札)
function userRankBadgeHtml(rank, opts = {}) {
  if (!rank) return "";
  const lang = typeof currentLang !== "undefined" && rank.name[currentLang] ? currentLang : "ja";
  return (
    `<span class="urank urank-${rank.key}${opts.small ? " is-small" : ""}" title="${esc(rank.name[lang])}(${esc(rank.sub[lang])})">` +
    `<span class="urank-icon" aria-hidden="true">${USER_RANK_ICONS[rank.key]}</span>` +
    `<span class="urank-name">${esc(rank.name[lang])}</span></span>`
  );
}
const USER_RANK_ICONS = {
  beginner: "🌱",
  explorer: "🧭",
  contributor: "🤝",
  expert: "⭐",
  ambassador: "🏅",
};

// 自分のプロフィール: 「次のランクまで」の進み具合
function userRankProgressHtml(stats) {
  const x = userRankText();
  const rank = userRankFor(stats);
  const idx = USER_RANKS.indexOf(rank);
  const next = USER_RANKS[idx + 1];
  const lang = typeof currentLang !== "undefined" && rank.name[currentLang] ? currentLang : "ja";
  if (!next) {
    return `<div class="urank-progress"><p class="urank-progress-note">${esc(x.top)}</p></div>`;
  }
  const needPosts = Math.max(0, next.min - stats.count);
  const needShops = next.minShops ? Math.max(0, next.minShops - stats.shops) : 0;
  const pct = Math.max(0, Math.min(100, Math.round((Math.min(stats.count, next.min) / next.min) * 100)));
  const note = needPosts > 0 ? x.remain(needPosts) : x.remainShops(needShops);
  return (
    `<div class="urank-progress">` +
    `<p class="urank-progress-title">${esc(x.next)}</p>` +
    `<div class="urank-progress-row"><span class="urank-progress-name">${esc(next.name[lang])}</span>` +
    `<span class="urank-progress-num">${esc(x.progress(Math.min(stats.count, next.min), next.min))}</span></div>` +
    `<div class="urank-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${next.min}" aria-valuenow="${Math.min(stats.count, next.min)}"><span style="width:${pct}%"></span></div>` +
    `<p class="urank-progress-note">${esc(note)}</p>` +
    `<p class="urank-progress-how">${esc(x.how)}</p>` +
    `</div>`
  );
}

// レビューの一覧など、ほかの人のランク: その人の公開されている投稿を読んで数える(このページを開いている間だけ覚える)
const userRankCache = new Map(); // uid → "loading" | { count, shops, rank } | null
function getUserRankCached(uid) {
  const v = userRankCache.get(uid);
  return v && v !== "loading" ? v : null;
}
function loadUserRank(uid) {
  if (!uid || userRankCache.has(uid) || typeof getProfileApi !== "function") return;
  userRankCache.set(uid, "loading");
  getProfileApi()
    .then((api) => Promise.all([api.fetchUserPhotos(uid), api.fetchUserReviews(uid)]))
    .then(([photos, reviews]) => {
      const stats = countUserPosts(photos, reviews);
      userRankCache.set(uid, { ...stats, rank: userRankFor(stats) });
      document.querySelectorAll(`[data-urank-for="${CSS.escape(uid)}"]`).forEach((el) => (el.innerHTML = userRankBadgeHtml(userRankCache.get(uid).rank, { small: true })));
    })
    .catch(() => userRankCache.set(uid, null));
}
// その人のバッジを入れる場所(読み終わったら、中にバッジが入る)
function userRankSlotHtml(uid) {
  if (!uid) return "";
  loadUserRank(uid);
  const v = getUserRankCached(uid);
  return `<span class="urank-slot" data-urank-for="${esc(uid)}">${v ? userRankBadgeHtml(v.rank, { small: true }) : ""}</span>`;
}
