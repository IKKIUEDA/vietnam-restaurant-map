// ほかのユーザーを見つけて、フォローする(ホームの「ユーザー」と、その一覧のページ「?view=people」)
//   ・プロフィール(ニックネーム・アイコン)を作っているユーザーを、新しく更新した順に出す(自分は出さない)
//   ・「フォロー」を押すと、その場でフォローする(ログインしていなければ、ログインを求める)
//   ・カードを押すと、その人のプロフィール(「?user=ID」)へ
const PEOPLE_TEXT = {
  ja: {
    title: "ユーザー", sub: "気になる人をフォローして、おすすめのお店を見つけよう", more: "もっと見る",
    pageTitle: "ユーザーを探す", search: "名前で検索", invite: "友だちを招待する", inviteText: "ベトナムフーディーで、日本の中のベトナムを一緒に探そう",
    suggestion: "おすすめのユーザー", follow: "フォロー", following: "フォロー中", member: "ベトナムフーディーのユーザー",
    empty: "まだユーザーがいません。ユーザーが増えると、ここに表示されます。", noMatch: "見つかりませんでした", loading: "読み込み中…",
    error: "読み込めませんでした", retry: "再読み込み", copied: "リンクをコピーしました", from: (c) => `${c}出身`, live: (c) => `${c}在住`,
  },
  en: {
    title: "People", sub: "Follow people to discover great shops", more: "See more",
    pageTitle: "Find people", search: "Search by name", invite: "Invite friends", inviteText: "Let's find Vietnam in Japan together on Vietnam Foodie",
    suggestion: "Suggested for you", follow: "Follow", following: "Following", member: "Vietnam Foodie member",
    empty: "No users yet. People will appear here as the community grows.", noMatch: "No one found", loading: "Loading…",
    error: "Couldn't load", retry: "Retry", copied: "Link copied", from: (c) => `From ${c}`, live: (c) => `Lives in ${c}`,
  },
  vi: {
    title: "Mọi người", sub: "Theo dõi mọi người để khám phá quán ngon", more: "Xem thêm",
    pageTitle: "Tìm người dùng", search: "Tìm theo tên", invite: "Mời bạn bè", inviteText: "Cùng tìm Việt Nam tại Nhật Bản trên Vietnam Foodie",
    suggestion: "Gợi ý cho bạn", follow: "Theo dõi", following: "Đang theo dõi", member: "Thành viên Vietnam Foodie",
    empty: "Chưa có người dùng. Mọi người sẽ hiện ở đây khi cộng đồng lớn hơn.", noMatch: "Không tìm thấy", loading: "Đang tải…",
    error: "Không tải được", retry: "Tải lại", copied: "Đã sao chép liên kết", from: (c) => `Đến từ ${c}`, live: (c) => `Sống tại ${c}`,
  },
};
function peopleText() {
  return PEOPLE_TEXT[currentLang] || PEOPLE_TEXT.ja;
}
function peopleUrl() {
  return location.pathname + "?view=people";
}

const peopleState = {
  status: "idle", // "idle" | "loading" | "ready" | "error"
  list: [], // [{ uid, displayName, photoURL, homeCountry, liveCountry }]
  following: new Set(), // 自分がフォローしている人
  followingFor: null, // following を読み込んだアカウント
  busy: new Set(), // フォロー・解除の通信中
  query: "",
};

function loadPeople(force) {
  if (!force && (peopleState.status === "loading" || peopleState.status === "ready")) return;
  peopleState.status = "loading";
  getProfileApi()
    .then((api) => api.fetchProfilesList(60))
    .then((list) => {
      peopleState.list = Array.isArray(list) ? list.filter((p) => p && p.uid && p.displayName) : [];
      peopleState.status = "ready";
    })
    .catch((error) => {
      console.warn("ユーザーの読み込みに失敗:", error);
      peopleState.status = "error";
    })
    .then(refreshPeopleViews);
  loadMyFollowing();
}
function loadMyFollowing() {
  const uid = authUser && authUser.uid;
  if (!uid) {
    peopleState.following = new Set();
    peopleState.followingFor = null;
    return;
  }
  if (peopleState.followingFor === uid) return;
  peopleState.followingFor = uid;
  getProfileApi()
    .then((api) => api.fetchFollowList(uid, "following"))
    .then((ids) => {
      if (peopleState.followingFor !== uid) return;
      peopleState.following = new Set(ids || []);
      refreshPeopleViews();
    })
    .catch((error) => console.warn("フォロー中の読み込みに失敗:", error));
}
window.addEventListener("auth-changed", () => {
  peopleState.followingFor = null;
  loadMyFollowing();
  refreshPeopleViews();
});

// 画面に出ているところ(ホームの「ユーザー」・一覧のページ)だけを描き直す(ページ全体は作り直さない)
function refreshPeopleViews() {
  const section = document.getElementById("home-people");
  if (section) section.innerHTML = homePeopleInnerHtml();
  const grid = document.getElementById("people-grid");
  if (grid) grid.innerHTML = peopleGridHtml();
}

function peopleVisible() {
  const me = authUser && authUser.uid;
  return peopleState.list.filter((p) => p.uid !== me);
}
function peopleSubText(p) {
  const x = peopleText();
  const home = typeof validCountry === "function" ? validCountry(p.homeCountry) : "";
  const live = typeof validCountry === "function" ? validCountry(p.liveCountry) : "";
  if (home) return `${countryFlag(home)} ${x.from(countryName(home))}`;
  if (live) return `${countryFlag(live)} ${x.live(countryName(live))}`;
  return x.member;
}
function peopleCardHtml(p) {
  const x = peopleText();
  const on = peopleState.following.has(p.uid);
  const busy = peopleState.busy.has(p.uid);
  return (
    `<li class="people-card">` +
    `<a class="people-link" href="${esc(userUrl(p.uid))}" data-home-nav>` +
    accountAvatar(p.photoURL, p.displayName, 64) +
    `<span class="people-name">${esc(p.displayName)}</span>` +
    `<span class="people-sub">${esc(peopleSubText(p))}</span></a>` +
    `<button type="button" class="people-follow${on ? " is-on" : ""}" data-people-follow="${esc(p.uid)}" aria-pressed="${on}"${busy ? " disabled" : ""}>` +
    `${esc(on ? x.following : x.follow)}</button>` +
    `</li>`
  );
}

// ホームの「ユーザー」(特集の下)
function homePeopleHtml() {
  return `<section class="home-section home-people" id="home-people">${homePeopleInnerHtml()}</section>`;
}
function homePeopleInnerHtml() {
  const x = peopleText();
  if (peopleState.status === "idle") loadPeople();
  const list = peopleVisible().slice(0, 12);
  let body;
  if (peopleState.status === "ready" || list.length) {
    body = list.length
      ? `<ul class="people-row">${list.map(peopleCardHtml).join("")}</ul>`
      : `<p class="people-empty">${esc(x.empty)}</p>`;
  } else if (peopleState.status === "error") {
    body = `<p class="people-empty">${esc(x.error)}</p>`;
  } else {
    body = `<p class="people-empty">${esc(x.loading)}</p>`;
  }
  return (
    homeSectionLabel("User") +
    `<div class="home-area-head"><h2 class="home-h2">${esc(x.title)}</h2>` +
    `<a class="mylist-see-all" href="${esc(peopleUrl())}" data-home-nav>${esc(x.more)}</a></div>` +
    `<p class="home-section-sub">${esc(x.sub)}</p>` +
    body
  );
}

// 一覧のページ(「?view=people」): 検索・友だちを招待・おすすめのユーザー(2列)
function peopleGridHtml() {
  const x = peopleText();
  if (peopleState.status === "error") {
    return `<p class="people-empty">${esc(x.error)} <button type="button" class="people-retry" data-people-retry>${esc(x.retry)}</button></p>`;
  }
  if (peopleState.status !== "ready") return `<p class="people-empty">${esc(x.loading)}</p>`;
  const q = peopleState.query.trim().toLowerCase();
  const all = peopleVisible();
  const list = q ? all.filter((p) => p.displayName.toLowerCase().includes(q)) : all;
  if (!list.length) return `<p class="people-empty">${esc(all.length ? x.noMatch : x.empty)}</p>`;
  return `<ul class="people-grid-list">${list.map(peopleCardHtml).join("")}</ul>`;
}
function renderPeoplePage() {
  const x = peopleText();
  const h = homeText();
  if (peopleState.status === "idle" || peopleState.status === "error") loadPeople(true);
  homePage.innerHTML =
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(homeUrl())}" data-home-nav aria-label="${esc(h.back)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(x.pageTitle)}</h2></div>` +
    `<section class="home-section people-page">` +
    `<label class="people-search">${homeIcon("search", 20)}<span class="visually-hidden">${esc(x.search)}</span>` +
    `<input type="search" id="people-search" placeholder="${esc(x.search)}" autocomplete="off" enterkeyhint="search" value="${esc(peopleState.query)}"></label>` +
    `<button type="button" class="people-invite" data-people-invite>` +
    `<span class="people-invite-icon" aria-hidden="true">${SHARE_ICON}</span><span>${esc(x.invite)}</span>${homeIcon("forward", 18)}</button>` +
    `<p class="people-invite-msg" role="status" aria-live="polite"></p>` +
    `<h3 class="people-h3">${esc(x.suggestion)}</h3>` +
    `<div id="people-grid">${peopleGridHtml()}</div>` +
    `</section>`;
  const input = homePage.querySelector("#people-search");
  input.addEventListener("input", () => {
    peopleState.query = input.value;
    homePage.querySelector("#people-grid").innerHTML = peopleGridHtml();
  });
}

async function invitePeople(btn) {
  const x = peopleText();
  const msg = homePage.querySelector(".people-invite-msg");
  const data = { title: document.title, text: x.inviteText, url: SHARE_URL };
  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (e) {
      // 共有画面を閉じただけのときは、何もしない
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${x.inviteText}\n${SHARE_URL}`);
    if (msg) msg.textContent = x.copied;
  } catch (e) {
    if (msg) msg.textContent = SHARE_URL;
  }
}

function togglePeopleFollow(uid) {
  if (peopleState.busy.has(uid)) return;
  if (!authUser) {
    if (typeof openAuthModal === "function") openAuthModal();
    return;
  }
  const on = peopleState.following.has(uid);
  peopleState.busy.add(uid);
  refreshPeopleViews();
  getProfileApi()
    .then((api) => (on ? api.unfollow(uid) : api.follow(uid)))
    .then(() => {
      if (on) peopleState.following.delete(uid);
      else peopleState.following.add(uid);
      // プロフィールの「フォロー・フォロワーの数」も、読み直せるようにする
      if (typeof userStatsCache !== "undefined") userStatsCache.clear();
      if (typeof followListCache !== "undefined") followListCache.clear();
    })
    .catch((error) => console.warn("フォローの変更に失敗:", error))
    .then(() => {
      peopleState.busy.delete(uid);
      refreshPeopleViews();
    });
}

document.addEventListener("click", (event) => {
  const followBtn = event.target.closest && event.target.closest("[data-people-follow]");
  if (followBtn) {
    event.preventDefault();
    togglePeopleFollow(followBtn.dataset.peopleFollow);
    return;
  }
  if (event.target.closest && event.target.closest("[data-people-invite]")) {
    invitePeople();
    return;
  }
  if (event.target.closest && event.target.closest("[data-people-retry]")) loadPeople(true);
});
