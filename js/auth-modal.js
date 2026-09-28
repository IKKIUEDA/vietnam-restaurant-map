// =====================================================================
// ログインのモーダル(Google / メールアドレス+パスワード)
// =====================================================================
//
// ■ 開く場所
//   ・ヘッダーの「ログイン」ボタン → openAuthModal()(auth.js の renderAuth から呼ぶ。結果は気にしない)
//   ・Tips・Check-in の送信ボタン(まだログインしていないとき)
//       → window.requestSignIn()(detail.js の ensureSignedIn が呼ぶ)
//         ログインできたら true、閉じただけなら false を返す Promise。
//         Tips・Check-in の「選んだあとで、ログインを求める」しくみ自体は、変えていない。
//         (以前は、ここで直接 Google のポップアップを開いていたが、いまは、この同じモーダルを開く。
//          モーダルの中で、Google・メールアドレス、どちらでログインしても、同じように続きが進む)
//
// ■ 中に入っているもの(3つの画面。ボタン・リンクで切り替える)
//   ① ログイン … 「Googleでログイン」ボタン、メールアドレス+パスワードのログインフォーム
//   ② 新規登録 … ニックネーム・メールアドレス・パスワードを入力(ニックネームは、Firestore に保存する)
//   ③ パスワードの再設定 … メールアドレスを入力すると、Firebase から再設定メールが届く
//
// ■ 表示の作り方
//   画面(view)が変わったとき「だけ」、中身を作り直す(innerHTML を書き換える)。
//   送信中・エラーの表示は、ボタンやエラー欄の部分だけ書き換える(フォームに入力した文字を、消さないため)。
//
// ■ Firebase との橋渡し
//   index.html のモジュールが用意する window.authApi の、次の部品を使う:
//     signIn()                                  … Google(ヘッダーの、これまでのログインと同じ)
//     signInWithEmail(email, password)          … メールアドレス+パスワードでログイン
//     registerWithEmail(email, password, name)  … 新規登録(Firestore への保存も、まとめて行う)
//     sendPasswordReset(email)                  … パスワード再設定メールを送る
//   読み込みに失敗している・準備できていないときは、「ログイン機能を読み込めませんでした」と出す。

// モーダルの入れ物(1回だけ作って、使い回す)
const authModalOverlay = document.createElement("div");
authModalOverlay.className = "auth-modal-overlay";
authModalOverlay.hidden = true;
authModalOverlay.innerHTML = `
  <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
    <button type="button" class="auth-modal-close" id="auth-modal-close" aria-label="close">✕</button>
    <div id="auth-modal-body"></div>
  </div>`;
document.body.appendChild(authModalOverlay);
const authModalBody = authModalOverlay.querySelector("#auth-modal-body");

let modalState = null; // モーダルが閉じているときは null

// ---------------------------------------------------------------------
// 開く・閉じる
// ---------------------------------------------------------------------

function openModal(options = {}) {
  modalState = { view: "login", busy: false, resetSent: false, onSettled: options.onSettled || null };
  authModalOverlay.hidden = false;
  renderModalView();
  document.addEventListener("keydown", onModalKeydown);
}

function closeModal() {
  if (!modalState) return;
  authModalOverlay.hidden = true;
  document.removeEventListener("keydown", onModalKeydown);
  modalState = null;
}

// success: true = ログインできた / false = 閉じただけ。モーダルを閉じて、呼び出しもとに結果を伝える
function settleModal(success) {
  const callback = modalState && modalState.onSettled;
  closeModal();
  if (callback) callback(success);
}

function onModalKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    settleModal(false);
  }
}

authModalOverlay.addEventListener("click", (event) => {
  if (event.target === authModalOverlay) settleModal(false); // 背景(外側)を押したら、閉じる
});
authModalOverlay.querySelector("#auth-modal-close").addEventListener("click", () => settleModal(false));

// ヘッダーの「ログイン」ボタンから開く(結果は、気にしない)
function openAuthModal() {
  openModal({});
}

// Tips・Check-in の送信ボタンから、ログインを求める。ログインできたら true、閉じただけなら false を返す
function requestSignIn() {
  return new Promise((resolve) => openModal({ onSettled: resolve }));
}
window.requestSignIn = requestSignIn; // detail.js の ensureSignedIn から使う

function switchView(view) {
  modalState.view = view;
  modalState.resetSent = false;
  renderModalView();
}

// ---------------------------------------------------------------------
// 表示(画面が変わったときだけ、中身を作り直す)
// ---------------------------------------------------------------------

function renderModalView() {
  const t = ui[currentLang];
  if (modalState.view === "register") {
    authModalBody.innerHTML = registerViewHtml(t);
    bindRegisterView();
  } else if (modalState.view === "reset") {
    authModalBody.innerHTML = resetViewHtml(t);
    bindResetView();
  } else {
    authModalBody.innerHTML = loginViewHtml(t);
    bindLoginView();
  }
}

function errorBoxHtml() {
  return `<p class="auth-modal-error" role="alert" hidden></p>`;
}

function loginViewHtml(t) {
  return `
    <h3 id="auth-modal-title">${esc(t.authModalTitle)}</h3>
    <button type="button" class="btn auth-google-btn" id="auth-google-btn">${esc(t.authLogin)}</button>
    <div class="auth-modal-divider">${esc(t.authOrDivider)}</div>
    <form id="auth-email-login-form">
      <label>${esc(t.authEmailLabel)}<input type="email" name="email" autocomplete="email" required></label>
      <label>${esc(t.authPasswordLabel)}<input type="password" name="password" autocomplete="current-password" required></label>
      <button type="submit" class="btn btn-primary" data-label="${esc(t.authEmailLoginSubmit)}">${esc(t.authEmailLoginSubmit)}</button>
    </form>
    <p class="auth-modal-links">
      <a href="#" id="auth-goto-register">${esc(t.authGoToRegister)}</a><br>
      <a href="#" id="auth-goto-reset">${esc(t.authForgotPassword)}</a>
    </p>
    ${errorBoxHtml()}`;
}

function registerViewHtml(t) {
  return `
    <h3 id="auth-modal-title">${esc(t.authRegisterTitle)}</h3>
    <form id="auth-register-form">
      <label>${esc(t.authNicknameLabel)}<input type="text" name="nickname" maxlength="40" required></label>
      <label>${esc(t.authEmailLabel)}<input type="email" name="email" autocomplete="email" required></label>
      <label>${esc(t.authPasswordLabel)}<input type="password" name="password" autocomplete="new-password" minlength="6" required></label>
      <button type="submit" class="btn btn-primary" data-label="${esc(t.authRegisterSubmit)}">${esc(t.authRegisterSubmit)}</button>
    </form>
    <p class="auth-modal-links"><a href="#" id="auth-goto-login">${esc(t.authGoToLogin)}</a></p>
    ${errorBoxHtml()}`;
}

function resetViewHtml(t) {
  const form = modalState.resetSent
    ? `<p class="detail-note">${esc(t.authResetSent)}</p>`
    : `<form id="auth-reset-form">
         <label>${esc(t.authEmailLabel)}<input type="email" name="email" autocomplete="email" required></label>
         <button type="submit" class="btn btn-primary" data-label="${esc(t.authResetSubmit)}">${esc(t.authResetSubmit)}</button>
       </form>`;
  return `
    <h3 id="auth-modal-title">${esc(t.authResetTitle)}</h3>
    <p>${esc(t.authResetDescription)}</p>
    ${form}
    <p class="auth-modal-links"><a href="#" id="auth-back-to-login">${esc(t.authBackToLogin)}</a></p>
    ${errorBoxHtml()}`;
}

function bindLoginView() {
  authModalBody.querySelector("#auth-google-btn").addEventListener("click", handleGoogleSignIn);
  authModalBody.querySelector("#auth-email-login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleEmailLogin(new FormData(event.currentTarget));
  });
  authModalBody.querySelector("#auth-goto-register").addEventListener("click", (event) => {
    event.preventDefault();
    switchView("register");
  });
  authModalBody.querySelector("#auth-goto-reset").addEventListener("click", (event) => {
    event.preventDefault();
    switchView("reset");
  });
}

function bindRegisterView() {
  authModalBody.querySelector("#auth-register-form").addEventListener("submit", (event) => {
    event.preventDefault();
    handleRegister(new FormData(event.currentTarget));
  });
  authModalBody.querySelector("#auth-goto-login").addEventListener("click", (event) => {
    event.preventDefault();
    switchView("login");
  });
}

function bindResetView() {
  const form = authModalBody.querySelector("#auth-reset-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleReset(new FormData(event.currentTarget));
    });
  }
  authModalBody.querySelector("#auth-back-to-login").addEventListener("click", (event) => {
    event.preventDefault();
    switchView("login");
  });
}

// ---------------------------------------------------------------------
// 送信中・エラーの表示(いまの画面はそのまま。ボタンとエラー欄の部分だけ書き換える)
// ---------------------------------------------------------------------

function setModalBusy(busy) {
  if (!modalState) return;
  modalState.busy = busy;
  authModalBody.querySelectorAll("input, button").forEach((el) => (el.disabled = busy));
  const submit = authModalBody.querySelector('button[type="submit"]');
  if (submit) submit.textContent = busy ? ui[currentLang].authSending : submit.dataset.label;
}

function setModalError(key) {
  if (!modalState) return;
  const box = authModalBody.querySelector(".auth-modal-error");
  if (!box) return;
  box.textContent = key ? ui[currentLang][key] : "";
  box.hidden = !key;
}

// ---------------------------------------------------------------------
// それぞれの送信処理
// ---------------------------------------------------------------------

async function handleGoogleSignIn() {
  const state = modalState;
  if (!state || state.busy) return;
  if (location.protocol === "file:") return setModalError("authUnsupported"); // file:// では、Google ログインは使えない
  if (!window.authApi) return setModalError("authUnavailable");
  setModalError(null);
  setModalBusy(true);
  try {
    await window.authApi.signIn();
    if (modalState === state) settleModal(true);
    return;
  } catch (error) {
    console.warn("Googleログインに失敗:", error && error.code, error);
    if (modalState !== state) return; // すでに、別のモーダルの操作に移っていた
    const key = authErrorKey(error); // auth.js の関数(ポップアップを閉じただけ、などは null を返す)
    if (key) setModalError(key);
  }
  if (modalState === state) setModalBusy(false);
}

async function handleEmailLogin(formData) {
  const state = modalState;
  if (!state || state.busy) return;
  const email = (formData.get("email") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  if (!email || !password) return setModalError("authFillFields");
  if (!window.authApi || typeof window.authApi.signInWithEmail !== "function") return setModalError("authUnavailable");
  setModalError(null);
  setModalBusy(true);
  try {
    await window.authApi.signInWithEmail(email, password);
    if (modalState === state) settleModal(true);
    return;
  } catch (error) {
    console.warn("メールログインに失敗:", error && error.code, error);
    if (modalState !== state) return;
    setModalError(emailAuthErrorKey(error));
  }
  if (modalState === state) setModalBusy(false);
}

async function handleRegister(formData) {
  const state = modalState;
  if (!state || state.busy) return;
  const nickname = (formData.get("nickname") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const password = (formData.get("password") || "").toString();
  if (!nickname) return setModalError("authMissingNickname");
  if (!email || !password) return setModalError("authFillFields");
  if (!window.authApi || typeof window.authApi.registerWithEmail !== "function") return setModalError("authUnavailable");
  setModalError(null);
  setModalBusy(true);
  try {
    await window.authApi.registerWithEmail(email, password, nickname);
    if (modalState === state) settleModal(true);
    return;
  } catch (error) {
    console.warn("新規登録に失敗:", error && error.code, error);
    if (modalState !== state) return;
    setModalError(emailAuthErrorKey(error));
  }
  if (modalState === state) setModalBusy(false);
}

async function handleReset(formData) {
  const state = modalState;
  if (!state || state.busy) return;
  const email = (formData.get("email") || "").toString().trim();
  if (!email) return setModalError("authFillFields");
  if (!window.authApi || typeof window.authApi.sendPasswordReset !== "function") return setModalError("authUnavailable");
  setModalError(null);
  setModalBusy(true);
  try {
    await window.authApi.sendPasswordReset(email);
    if (modalState !== state) return;
    modalState.busy = false; // 送信できたので、解除する(この画面は閉じずに残るため、他のハンドラの busy チェックに、ずっと引っかからないように)
    modalState.resetSent = true;
    renderModalView(); // 「送信しました」の案内に、切り替える
    return;
  } catch (error) {
    console.warn("パスワード再設定メールの送信に失敗:", error && error.code, error);
    if (modalState !== state) return;
    setModalError(emailAuthErrorKey(error));
  }
  if (modalState === state) setModalBusy(false);
}

// Firebase のエラーコードから、出す文言を選ぶ(メールアドレス・パスワードのエラー)
//   ・「メールアドレスが無い」と「パスワードが違う」を区別すると、登録されているメールアドレスを
//     見分けられてしまうため、両方とも同じ文言(authErrWrongPassword)にしている
function emailAuthErrorKey(error) {
  const code = (error && error.code) || "";
  const map = {
    "auth/invalid-email": "authErrInvalidEmail",
    "auth/missing-password": "authFillFields",
    "auth/weak-password": "authErrWeakPassword",
    "auth/email-already-in-use": "authErrEmailInUse",
    "auth/user-not-found": "authErrWrongPassword",
    "auth/wrong-password": "authErrWrongPassword",
    "auth/invalid-credential": "authErrWrongPassword",
    "auth/invalid-login-credentials": "authErrWrongPassword",
    "auth/too-many-requests": "authErrTooManyRequests",
    "auth/network-request-failed": "authErrNetwork",
  };
  return map[code] || "authErrGeneric";
}
