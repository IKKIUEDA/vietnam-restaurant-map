// はじめての人への質問画面(ポップアップ)
//   ・ホームを開いたときに、画面いっぱいに出す。はじめての1回と、そのあとは30日ごとに1回
//   ・質問1: どのエリアに行く?(東京・神奈川・千葉・埼玉。いくつでも)
//     質問2: 何を探す?(料理店・カフェ・食材店。いくつでも)
//     → 選んだ内容は、マイリスト(js/todo.js)にエリアごとに保存する
//   ・「スキップ」でいつでも閉じられる。閉じた日時を、この端末(localStorage)の中だけに保存して、次に出す日を決める
//   ・選んだ内容も、出した日時も、サーバーや第三者には送らない
//   ・確認用: URL に「?onboard=1」を付けると、間隔に関係なく出す

const ONBOARD_KEY = "vf_onboard_at"; // 最後に出した日時(ミリ秒)
const ONBOARD_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000; // 30日

const ONBOARD_TEXT = {
  ja: {
    question: (n, total) => `質問 ${n} / ${total}`,
    q1a: "どのエリアに",
    q1b: "行きますか?",
    q1sub: "行きたいエリアを、いくつでも選んでください",
    q2a: "何を",
    q2b: "探しますか?",
    q2sub: "探したいお店を、いくつでも選んでください",
    skip: "スキップ",
    next: "次へ",
    back: "戻る",
    doneLabel: "準備ができました",
    doneA: "さあ、",
    doneB: "はじめよう!",
    doneSub: "マイリストに追加しました",
    myAreas: "選んだエリア",
    start: "さがしはじめる",
    close: "閉じる",
    needArea: "エリアを1つ以上選んでください",
    needType: "探したいお店を1つ以上選んでください",
  },
  en: {
    question: (n, total) => `Question ${n} of ${total}`,
    q1a: "Where are",
    q1b: "you going?",
    q1sub: "Choose all the areas you'd like to visit",
    q2a: "What are you",
    q2b: "looking for?",
    q2sub: "Choose all the kinds of shops you're looking for",
    skip: "Skip",
    next: "Next",
    back: "Back",
    doneLabel: "All done",
    doneA: "You're",
    doneB: "all set!",
    doneSub: "Added to My List",
    myAreas: "My areas",
    start: "Start exploring",
    close: "Close",
    needArea: "Please choose at least one area",
    needType: "Please choose at least one kind of shop",
  },
  vi: {
    question: (n, total) => `Câu hỏi ${n}/${total}`,
    q1a: "Bạn sẽ đến",
    q1b: "khu vực nào?",
    q1sub: "Chọn tất cả khu vực bạn muốn đến",
    q2a: "Bạn đang",
    q2b: "tìm gì?",
    q2sub: "Chọn tất cả loại quán bạn muốn tìm",
    skip: "Bỏ qua",
    next: "Tiếp",
    back: "Quay lại",
    doneLabel: "Hoàn tất",
    doneA: "Sẵn sàng",
    doneB: "rồi!",
    doneSub: "Đã thêm vào danh sách của tôi",
    myAreas: "Khu vực đã chọn",
    start: "Bắt đầu khám phá",
    close: "Đóng",
    needArea: "Hãy chọn ít nhất một khu vực",
    needType: "Hãy chọn ít nhất một loại quán",
  },
};
function onboardText() {
  return ONBOARD_TEXT[currentLang] || ONBOARD_TEXT.ja;
}

// 背景の写真(「エリアから探す」と同じ写真。js/home.js の HOME_AREAS)
const ONBOARD_PHOTOS = ["新宿", "横浜", "大宮"];
function onboardPhoto(step) {
  const station = ONBOARD_PHOTOS[step] || ONBOARD_PHOTOS[0];
  const area = typeof HOME_AREAS !== "undefined" ? HOME_AREAS.find((a) => a.station === station) : null;
  return area && area.image ? area.image : "images/hero-saigon-night.jpg";
}

const onboard = { open: false, step: 0, prefs: [], types: [], message: "", lastFocus: null };
let onboardEl = null;

function onboardLastShown() {
  try {
    return Number(localStorage.getItem(ONBOARD_KEY)) || 0;
  } catch (e) {
    return Date.now(); // 読めないとき(プライベートブラウズなど)は、出さない
  }
}
function onboardMarkShown() {
  try {
    localStorage.setItem(ONBOARD_KEY, String(Date.now()));
  } catch (e) {
    // 保存できなくても、画面は閉じる
  }
}
function onboardDue() {
  if (new URLSearchParams(location.search).get("onboard") === "1") return true;
  return Date.now() - onboardLastShown() >= ONBOARD_INTERVAL_MS;
}

function openOnboard() {
  if (onboard.open || typeof myListPrefs !== "function") return;
  const items = typeof loadMyListItems === "function" ? loadMyListItems() : [];
  onboard.open = true;
  onboard.step = 0;
  onboard.prefs = items.map((it) => it.pref); // すでにマイリストにあるエリアは、選んだ状態から
  onboard.types = items.length ? MYLIST_TYPES.filter((t) => items.some((it) => it.types.includes(t))) : ["restaurant"];
  onboard.message = "";
  onboard.lastFocus = document.activeElement;
  onboardMarkShown(); // 出した時点で記録する(途中で閉じても、30日は出さない)
  onboardEl = document.createElement("div");
  onboardEl.className = "onboard";
  onboardEl.setAttribute("role", "dialog");
  onboardEl.setAttribute("aria-modal", "true");
  onboardEl.setAttribute("aria-labelledby", "onboard-title");
  document.body.appendChild(onboardEl);
  document.body.classList.add("onboard-open");
  renderOnboard();
}

function closeOnboard() {
  if (!onboardEl) return;
  onboardEl.remove();
  onboardEl = null;
  onboard.open = false;
  document.body.classList.remove("onboard-open");
  if (onboard.lastFocus && typeof onboard.lastFocus.focus === "function") onboard.lastFocus.focus();
}

function renderOnboard() {
  if (!onboardEl) return;
  const x = onboardText();
  const h = homeText();
  const step = onboard.step;
  const photo = `<div class="onboard-photo"><img src="${esc(onboardPhoto(step))}" alt="" width="480" height="336"></div>`;
  let body = "";
  if (step === 0 || step === 1) {
    const isArea = step === 0;
    const choices = isArea
      ? myListPrefs().map((p) => ({ key: p.key, label: pick(p.label), on: onboard.prefs.includes(p.key) }))
      : myListTypeChoices().map((t) => ({ key: t, label: h.typeLabel[t], on: onboard.types.includes(t), icon: homeIcon(t, 22) }));
    body =
      `<p class="onboard-step">${esc(x.question(step + 1, 2))}</p>` +
      `<h2 class="onboard-title" id="onboard-title">${esc(isArea ? x.q1a : x.q2a)} <span>${esc(isArea ? x.q1b : x.q2b)}</span></h2>` +
      `<p class="onboard-sub">${esc(isArea ? x.q1sub : x.q2sub)}</p>` +
      `<div class="onboard-choices${isArea ? "" : " is-types"}">` +
      choices
        .map(
          (c) =>
            `<button type="button" class="onboard-choice${c.on ? " is-on" : ""}" aria-pressed="${c.on}" data-onboard-pick="${esc(c.key)}">` +
            (c.icon || "") +
            `<span>${esc(c.label)}</span>${c.on ? homeIcon("check", 18) : ""}</button>`
        )
        .join("") +
      `</div>` +
      `<p class="onboard-message" role="status"${onboard.message ? "" : " hidden"}>${esc(onboard.message)}</p>` +
      `<div class="onboard-actions">` +
      (step === 0
        ? `<button type="button" class="onboard-btn" data-onboard="skip">${esc(x.skip)}</button>`
        : `<button type="button" class="onboard-btn" data-onboard="back">${esc(x.back)}</button>`) +
      `<button type="button" class="onboard-btn is-primary" data-onboard="next">${esc(x.next)}</button>` +
      `</div>`;
  } else {
    const names = myListPrefs()
      .filter((p) => onboard.prefs.includes(p.key))
      .map((p) => `<span class="onboard-tag">${homeIcon("check", 16)}${esc(pick(p.label))}</span>`)
      .join("");
    body =
      `<p class="onboard-step">${esc(x.doneLabel)}</p>` +
      `<h2 class="onboard-title" id="onboard-title">${esc(x.doneA)} <span>${esc(x.doneB)}</span></h2>` +
      `<p class="onboard-sub">${esc(x.doneSub)}</p>` +
      `<p class="onboard-step onboard-tags-label">${esc(x.myAreas)}</p>` +
      `<div class="onboard-tags">${names}</div>` +
      `<div class="onboard-actions"><button type="button" class="onboard-btn is-primary is-wide" data-onboard="finish">${esc(x.start)}</button></div>`;
  }
  onboardEl.innerHTML =
    photo +
    `<button type="button" class="onboard-close" data-onboard="skip" aria-label="${esc(x.close)}">${homeIcon("close", 22)}</button>` +
    `<div class="onboard-panel">${body}</div>`;
  const first = onboardEl.querySelector(".onboard-choice, .onboard-btn.is-primary");
  if (first) first.focus({ preventScroll: true });
}

// 選んだ内容を、マイリストに保存する(エリアごと。すでにあるエリアは、種類を上書き)
function onboardSave() {
  if (typeof loadMyListItems !== "function" || typeof saveMyListItems !== "function") return;
  const types = MYLIST_TYPES.filter((t) => onboard.types.includes(t));
  const items = loadMyListItems().filter((it) => !onboard.prefs.includes(it.pref));
  onboard.prefs.forEach((pref) => items.push({ pref, types }));
  saveMyListItems(items);
}

document.addEventListener("click", (event) => {
  if (!onboardEl || !onboardEl.contains(event.target)) return;
  const x = onboardText();
  const pickBtn = event.target.closest("[data-onboard-pick]");
  if (pickBtn) {
    const list = onboard.step === 0 ? "prefs" : "types";
    const k = pickBtn.dataset.onboardPick;
    onboard[list] = onboard[list].includes(k) ? onboard[list].filter((v) => v !== k) : [...onboard[list], k];
    onboard.message = "";
    renderOnboard();
    const again = onboardEl.querySelector(`[data-onboard-pick="${CSS.escape(k)}"]`);
    if (again) again.focus({ preventScroll: true });
    return;
  }
  const btn = event.target.closest("[data-onboard]");
  if (!btn) return;
  const action = btn.dataset.onboard;
  if (action === "skip") closeOnboard();
  else if (action === "back") {
    onboard.step = Math.max(0, onboard.step - 1);
    onboard.message = "";
    renderOnboard();
  } else if (action === "next") {
    if (onboard.step === 0 && !onboard.prefs.length) onboard.message = x.needArea;
    else if (onboard.step === 1 && !onboard.types.length) onboard.message = x.needType;
    else {
      onboard.message = "";
      onboard.step += 1;
      if (onboard.step === 2) onboardSave();
    }
    renderOnboard();
  } else if (action === "finish") {
    closeOnboard();
    // ホームのマイリストに、すぐ反映する
    if (document.body.classList.contains("view-home") && typeof renderHomeMode === "function") renderHomeMode();
  }
});

// Esc キーで閉じる(スキップと同じ)
document.addEventListener("keydown", (event) => {
  if (onboardEl && event.key === "Escape") closeOnboard();
});

// ホームを開いたときだけ、出すかどうか判断する(お店のページなどのリンクから来た人の邪魔をしない)
function maybeOpenOnboard() {
  if (onboard.open || !onboardDue()) return;
  if (!document.body.classList.contains("view-home") || typeof homeMode === "undefined" || homeMode !== "home") return;
  openOnboard();
}
setTimeout(maybeOpenOnboard, 600);
