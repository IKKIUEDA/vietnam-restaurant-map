// チェックインしたお店の「はいかがでしたか?」(レビューのお願い)
//   ・ログインしている人が、チェックインしてから 2時間〜7日 たったお店で、まだレビューを書いていないとき、
//     次にホーム(トップ)か地図を開いたときに、下から小さな画面を出す
//   ・1回の表示につき1店だけ。ページを開いている間に出すのは1回だけ
//   ・「あとで」・「評価する」のどちらを押しても、そのお店のお願いは、二度と出さない(しつこくしないため)
//     どのお店で出したかは、この端末(localStorage)にだけ記録する
//   ・星を選んで「評価する」を押すと、そのお店のページで、選んだ星が入ったレビューの画面を開く
//     (実際に開くのは detail.js の loadReviews。window.pendingReviewOpen を見る)
(function reviewPrompt() {
  const MIN_AGE = 2 * 60 * 60 * 1000; // チェックインしてから、2時間たってから
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7日まで
  const START_DELAY = 2500; // 開いてすぐ(ロゴの表示・読み込みの画面の間)には出さない
  const STORE_KEY = "vf_review_prompt_done";

  const TEXT = {
    ja: {
      title: (name) => `${name}<br>はいかがでしたか?`,
      sub: (days) => (days <= 0 ? "今日チェックインしたお店" : days === 1 ? "昨日チェックインしたお店" : `${days}日前にチェックインしたお店`),
      tap: "タップして評価",
      later: "あとで",
      rate: "評価する",
      star: (n) => `${n}つ星`,
    },
    en: {
      title: (name) => `How was<br>${name}?`,
      sub: (days) => (days <= 0 ? "You checked in today" : days === 1 ? "You checked in yesterday" : `You checked in ${days} days ago`),
      tap: "Tap to rate",
      later: "Later",
      rate: "Rate",
      star: (n) => (n === 1 ? "1 star" : `${n} stars`),
    },
    vi: {
      title: (name) => `${name}<br>thế nào?`,
      sub: (days) => (days <= 0 ? "Bạn đã check-in hôm nay" : days === 1 ? "Bạn đã check-in hôm qua" : `Bạn đã check-in ${days} ngày trước`),
      tap: "Chạm để đánh giá",
      later: "Để sau",
      rate: "Đánh giá",
      star: (n) => `${n} sao`,
    },
  };
  const text = () => TEXT[typeof currentLang !== "undefined" && TEXT[currentLang] ? currentLang : "ja"];

  // この端末で、もう出したお店(ユーザーごと)
  function doneList(uid) {
    try {
      const all = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      return Array.isArray(all[uid]) ? all[uid] : [];
    } catch (e) {
      return [];
    }
  }
  function markDone(uid, shopId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      const list = Array.isArray(all[uid]) ? all[uid] : [];
      if (!list.includes(shopId)) list.push(shopId);
      all[uid] = list.slice(-300);
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
    } catch (e) {
      // 記録できない環境では、何もしない(このページを開いている間は、もう出さない)
    }
  }

  const millis = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : t && t.seconds ? t.seconds * 1000 : Number(t) || 0);

  // いま、ホーム(トップ)か地図を見ているか(お店のページ・固定ページ・ほかのホームの画面・最初の案内の間は出さない)
  function onTopOrMap() {
    const c = document.body.classList;
    if (c.contains("view-detail") || c.contains("view-content-page") || c.contains("onboard-open")) return false;
    if (document.getElementById("vf-splash")) return false;
    if (c.contains("view-home")) return c.contains("is-home-top");
    return true;
  }

  let started = false;
  let shown = false;

  function start() {
    if (started || typeof authUser === "undefined" || !authUser) return;
    started = true;
    const uid = authUser.uid;
    getProfileApi()
      .then((api) => Promise.all([api.fetchMyCheckins(), api.fetchUserReviews(uid)]))
      .then(([checkins, reviews]) => {
        if (!authUser || authUser.uid !== uid) return;
        const reviewed = new Set((reviews || []).map((r) => r.shopId));
        const done = doneList(uid);
        const now = Date.now();
        const pickOne = (checkins || [])
          .map((c) => ({ shopId: c.shopId, at: millis(c.checkedInAt), hidden: c.hidden }))
          .filter((c) => !c.hidden && c.at && now - c.at >= MIN_AGE && now - c.at <= MAX_AGE)
          .filter((c) => !reviewed.has(c.shopId) && !done.includes(c.shopId))
          .filter((c) => restaurants.some((s) => s.id === c.shopId))
          .sort((a, b) => b.at - a.at)[0];
        if (pickOne) waitAndShow(uid, pickOne);
      })
      .catch((error) => console.warn("レビューのお願いを確認できませんでした:", error));
  }

  // ホームか地図を見ているときまで待ってから出す
  function waitAndShow(uid, item) {
    const tryShow = () => {
      if (shown || !onTopOrMap()) return false;
      shown = true;
      observer.disconnect();
      show(uid, item);
      return true;
    };
    const observer = new MutationObserver(() => setTimeout(tryShow, 300));
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    tryShow();
  }

  function show(uid, item) {
    const shop = restaurants.find((s) => s.id === item.shopId);
    if (!shop) return;
    markDone(uid, item.shopId); // 出した時点で記録する(どのボタンでも、二度と出さない)
    const t = text();
    const image = typeof getShopImage === "function" ? getShopImage(shop) : { src: "images/default-shop.svg" };
    const days = Math.floor((startOfDay(Date.now()) - startOfDay(item.at)) / 86400000);
    let rating = 0;

    const wrap = document.createElement("div");
    wrap.className = "rp-backdrop";
    wrap.innerHTML =
      `<div class="rp-sheet" role="dialog" aria-modal="true" aria-labelledby="rp-title">` +
      `<img class="rp-photo" src="${esc(image.src)}" alt="" width="96" height="96">` +
      `<p class="rp-title" id="rp-title">${t.title(`<strong>${esc(pick(shop.name))}</strong>`)}</p>` +
      `<p class="rp-sub">${esc(t.sub(days))}</p>` +
      `<p class="rp-tap">${esc(t.tap)}</p>` +
      `<div class="rp-stars" role="radiogroup">` +
      [1, 2, 3, 4, 5].map((n) => `<button type="button" class="rp-star" data-value="${n}" role="radio" aria-checked="false" aria-label="${esc(t.star(n))}">★</button>`).join("") +
      `</div>` +
      `<div class="rp-actions"><button type="button" class="rp-later">${esc(t.later)}</button>` +
      `<button type="button" class="rp-rate" disabled>${esc(t.rate)}</button></div>` +
      `</div>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("is-open"));

    const close = () => {
      wrap.classList.remove("is-open");
      setTimeout(() => wrap.remove(), 250);
    };
    const stars = [...wrap.querySelectorAll(".rp-star")];
    const rateBtn = wrap.querySelector(".rp-rate");
    stars.forEach((btn) =>
      btn.addEventListener("click", () => {
        rating = Number(btn.dataset.value);
        stars.forEach((s) => {
          const on = Number(s.dataset.value) <= rating;
          s.classList.toggle("is-on", on);
          s.setAttribute("aria-checked", String(Number(s.dataset.value) === rating));
        });
        rateBtn.disabled = false;
      })
    );
    wrap.querySelector(".rp-later").addEventListener("click", close);
    wrap.addEventListener("click", (event) => {
      if (event.target === wrap) close(); // 外側(暗いところ)を押したときも「あとで」と同じ
    });
    rateBtn.addEventListener("click", () => {
      if (!rating) return;
      window.pendingReviewOpen = { shopId: shop.id, rating };
      close();
      if (typeof navigate === "function" && typeof shopUrl === "function") navigate(shopUrl(shop.id));
    });
  }

  function startOfDay(ms) {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  // ログイン状態が分かってから、少し待って調べる
  const kick = () => setTimeout(start, START_DELAY);
  if (typeof authUser !== "undefined" && authUser !== undefined) kick();
  window.addEventListener("auth-changed", kick);
})();
