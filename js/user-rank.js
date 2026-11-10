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
    return `<div class="urank-progress"><p class="urank-progress-note">${esc(x.top)}<button type="button" class="urank-info-btn" data-rank-info="${esc(rank.key)}" aria-label="${esc((USER_RANK_INFO_TEXT[lang] || USER_RANK_INFO_TEXT.ja).open)}">ⓘ</button></p></div>`;
  }
  const needPosts = Math.max(0, next.min - stats.count);
  const needShops = next.minShops ? Math.max(0, next.minShops - stats.shops) : 0;
  // 進み具合は「いまのランクになってから、次のランクまで」で見せる(ランクが上がったら 0 から数え直す)
  //   例: Expert(25件〜)→ Ambassador(50件〜)は、25件で「0 / 25件」、30件で「5 / 25件」
  const span = next.min - rank.min;
  const done = Math.max(0, Math.min(span, stats.count - rank.min));
  const pct = span > 0 ? Math.round((done / span) * 100) : 100;
  const note = needPosts > 0 ? x.remain(needPosts) : x.remainShops(needShops);
  return (
    `<div class="urank-progress">` +
    `<p class="urank-progress-title">${esc(x.next)}` +
    // ⓘ: ランクの説明を開く
    `<button type="button" class="urank-info-btn" data-rank-info="${esc(rank.key)}" aria-label="${esc((USER_RANK_INFO_TEXT[lang] || USER_RANK_INFO_TEXT.ja).open)}">ⓘ</button></p>` +
    `<div class="urank-progress-row"><span class="urank-progress-name">${esc(next.name[lang])}</span>` +
    `<span class="urank-progress-num">${esc(x.progress(done, span))}</span></div>` +
    `<div class="urank-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${span}" aria-valuenow="${done}"><span style="width:${pct}%"></span></div>` +
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

// ランクの説明(プロフィールの「次のランクまで」の ⓘ を押すと、下から出る)。文章は運営者が用意したもの
const USER_RANK_INFO = {
  beginner: {
    need: { ja: "0〜2件", en: "0–2 posts", vi: "0–2 bài" },
    desc: {
      ja: "Vietnam Foodieでの活動をスタートしたフレッシュなメンバーです。これからさまざまなベトナムグルメに出会い、自分のお気に入りを見つけていく段階です。",
      en: "A fresh member who has just started on Vietnam Foodie. You're about to discover all kinds of Vietnamese food and find your own favorites.",
      vi: "Thành viên mới vừa bắt đầu hoạt động trên Vietnam Foodie. Đây là giai đoạn bạn sẽ gặp gỡ nhiều món ăn Việt Nam và tìm ra những món yêu thích của mình.",
    },
  },
  explorer: {
    need: { ja: "3件〜", en: "3+ posts", vi: "Từ 3 bài" },
    desc: {
      ja: "ベトナムグルメへの興味を広げ、さまざまなお店や料理を発見しているメンバーです。積極的に新しい体験を楽しんでいる段階です。",
      en: "A member who is broadening their interest in Vietnamese food and discovering all kinds of shops and dishes, actively enjoying new experiences.",
      vi: "Thành viên đang mở rộng niềm yêu thích ẩm thực Việt Nam và khám phá nhiều quán, nhiều món ăn khác nhau. Đây là giai đoạn tích cực tận hưởng những trải nghiệm mới.",
    },
  },
  contributor: {
    need: { ja: "10件〜", en: "10+ posts", vi: "Từ 10 bài" },
    desc: {
      ja: "写真やレビューを通じて、ベトナムグルメの情報を継続的に発信しているメンバーです。コミュニティを支える存在として活躍しています。",
      en: "A member who regularly shares information about Vietnamese food through photos and reviews, playing an active part in supporting the community.",
      vi: "Thành viên thường xuyên chia sẻ thông tin ẩm thực Việt Nam qua ảnh và đánh giá, đóng vai trò hỗ trợ cộng đồng.",
    },
  },
  expert: {
    need: { ja: "25件〜", en: "25+ posts", vi: "Từ 25 bài" },
    desc: {
      ja: "豊富な投稿経験と幅広いグルメ情報を持つメンバーです。ベトナムグルメに精通し、コミュニティでも高い活動実績を誇ります。",
      en: "A member with plenty of posting experience and wide-ranging food knowledge. Well versed in Vietnamese food, with an outstanding record of activity in the community.",
      vi: "Thành viên có nhiều kinh nghiệm đăng bài và thông tin ẩm thực phong phú. Am hiểu ẩm thực Việt Nam và có thành tích hoạt động nổi bật trong cộng đồng.",
    },
  },
  ambassador: {
    need: { ja: "50件以上・10店舗以上", en: "50+ posts at 10+ shops", vi: "Từ 50 bài, từ 10 quán" },
    desc: {
      ja: "多くのお店を紹介し、コミュニティに大きく貢献している特別なメンバーです。Vietnam Foodieのトップクラスのユーザーです。",
      en: "A special member who has introduced many shops and contributed greatly to the community. One of the top users of Vietnam Foodie.",
      vi: "Thành viên đặc biệt đã giới thiệu nhiều quán và đóng góp lớn cho cộng đồng. Là người dùng hàng đầu của Vietnam Foodie.",
    },
  },
};
const USER_RANK_INFO_TEXT = {
  ja: { title: "ランクについて", open: "ランクについて", close: "閉じる", current: "いまのランク" },
  en: { title: "About ranks", open: "About ranks", close: "Close", current: "Your rank" },
  vi: { title: "Về hạng", open: "Về hạng", close: "Đóng", current: "Hạng hiện tại" },
};
function openUserRankInfo(currentKey) {
  const lang = typeof currentLang !== "undefined" && USER_RANK_INFO_TEXT[currentLang] ? currentLang : "ja";
  const t = USER_RANK_INFO_TEXT[lang];
  const wrap = document.createElement("div");
  wrap.className = "urank-info-backdrop";
  wrap.innerHTML =
    `<div class="urank-info" role="dialog" aria-modal="true" aria-labelledby="urank-info-title">` +
    `<div class="urank-info-head"><h2 id="urank-info-title">${esc(t.title)}</h2>` +
    `<button type="button" class="urank-info-close" aria-label="${esc(t.close)}">×</button></div>` +
    `<ul class="urank-info-list">` +
    USER_RANKS.map((r) => {
      const info = USER_RANK_INFO[r.key];
      const now = r.key === currentKey;
      return (
        `<li class="urank-info-item${now ? " is-current" : ""}">` +
        `<div class="urank-info-row">${userRankBadgeHtml(r)}<span class="urank-info-sub">${esc(r.sub[lang])}</span>` +
        (now ? `<span class="urank-info-now">${esc(t.current)}</span>` : "") +
        `<span class="urank-info-need">${esc(info.need[lang])}</span></div>` +
        `<p class="urank-info-desc">${esc(info.desc[lang])}</p></li>`
      );
    }).join("") +
    `</ul></div>`;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add("is-open"));
  const close = () => {
    wrap.classList.remove("is-open");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => wrap.remove(), 250);
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", onKey);
  wrap.querySelector(".urank-info-close").addEventListener("click", close);
  wrap.addEventListener("click", (e) => {
    if (e.target === wrap) close();
  });
  wrap.querySelector(".urank-info-close").focus();
}
document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-rank-info]");
  if (btn) openUserRankInfo(btn.dataset.rankInfo);
});
