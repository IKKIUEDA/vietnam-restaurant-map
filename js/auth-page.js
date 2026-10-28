// アカウントの画面(ログインしていないとき): ページの中に、ログイン・新規会員登録の入力欄を直接出す
//   ・ログイン(?view=account): 上「ログイン」(左: メールアドレス・パスワード / 右: Googleでログイン)、下「はじめてご利用の方」→ 新規会員登録
//   ・新規会員登録(?view=account&signup=1): ニックネーム・メールアドレス・パスワード・利用規約などへの同意 / Googleで登録、下「ログインはこちら」
//   ・お店の保存・レビューなどで出る、小さなログイン画面(js/auth-modal.js)は、今まで通り
//   ・ログイン・登録の処理そのものは、これまでと同じ window.authApi(index.html)を使う
const AUTH_PAGE_TEXT = {
  ja: {
    loginTitle: "ログイン",
    newTitle: "はじめてご利用の方",
    newBtn: "新規会員登録",
    signupTitle: "新規会員登録",
    haveAccount: "すでにアカウントをお持ちの方",
    toLogin: "ログインはこちら",
    google: "Googleでログイン",
    googleSignup: "Googleで登録",
    forgot: "パスワードを忘れた方(再設定)",
    passwordHint: "パスワード(6文字以上)",
    agreePrefix: "",
    agreeMid: "と",
    agreeSuffix: "に同意します",
    needAgree: "利用規約とプライバシーポリシーへの同意が必要です",
    or: "または",
  },
  en: {
    loginTitle: "Sign in",
    newTitle: "New to Vietnam Foodie?",
    newBtn: "Create an account",
    signupTitle: "Create an account",
    haveAccount: "Already have an account?",
    toLogin: "Sign in here",
    google: "Sign in with Google",
    googleSignup: "Sign up with Google",
    forgot: "Forgot your password? (Reset)",
    passwordHint: "Password (6+ characters)",
    agreePrefix: "I agree to the ",
    agreeMid: " and the ",
    agreeSuffix: "",
    needAgree: "Please agree to the Terms of Service and the Privacy Policy",
    or: "or",
  },
  vi: {
    loginTitle: "Đăng nhập",
    newTitle: "Lần đầu sử dụng?",
    newBtn: "Đăng ký thành viên mới",
    signupTitle: "Đăng ký thành viên mới",
    haveAccount: "Bạn đã có tài khoản?",
    toLogin: "Đăng nhập tại đây",
    google: "Đăng nhập bằng Google",
    googleSignup: "Đăng ký bằng Google",
    forgot: "Quên mật khẩu? (Đặt lại)",
    passwordHint: "Mật khẩu (từ 6 ký tự)",
    agreePrefix: "Tôi đồng ý với ",
    agreeMid: " và ",
    agreeSuffix: "",
    needAgree: "Bạn cần đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư",
    or: "hoặc",
  },
};
function authPageText() {
  return AUTH_PAGE_TEXT[currentLang] || AUTH_PAGE_TEXT.ja;
}
function authSignupUrl() {
  return appBase() + "?view=account&signup=1";
}
function authLoginUrl() {
  return appBase() + "?view=account";
}
function isAuthSignupMode() {
  return new URLSearchParams(location.search).get("signup") === "1";
}

// ログインしていないときの、アカウントの画面の中身
function authPageHtml() {
  const a = authPageText();
  const t = ui[currentLang];
  if (isAuthSignupMode()) {
    return (
      `<section class="home-section auth-page">` +
      `<div class="auth-card">` +
      `<h2 class="auth-card-title">${esc(a.signupTitle)}</h2>` +
      `<div class="auth-card-cols">` +
      `<form class="auth-form" id="auth-page-signup" novalidate>` +
      `<input class="auth-input" type="text" name="nickname" maxlength="40" autocomplete="nickname" placeholder="${esc(t.authNicknameLabel)}" aria-label="${esc(t.authNicknameLabel)}" required>` +
      `<input class="auth-input" type="email" name="email" autocomplete="email" placeholder="${esc(t.authEmailLabel)}" aria-label="${esc(t.authEmailLabel)}" required>` +
      `<input class="auth-input" type="password" name="password" minlength="6" autocomplete="new-password" placeholder="${esc(a.passwordHint)}" aria-label="${esc(a.passwordHint)}" required>` +
      `<label class="auth-agree"><input type="checkbox" name="agree" id="auth-page-agree"> <span>${esc(a.agreePrefix)}` +
      `<a href="${esc(termsUrl())}" target="_blank" rel="noopener">${esc(t.termsPageTitle)}</a>${esc(a.agreeMid)}` +
      `<a href="${esc(privacyUrl())}" target="_blank" rel="noopener">${esc(t.privacyPageTitle)}</a>${esc(a.agreeSuffix)}</span></label>` +
      `<p class="auth-page-error" role="alert" hidden></p>` +
      `<button type="submit" class="auth-submit" data-label="${esc(t.authRegisterSubmit)}">${esc(t.authRegisterSubmit)}</button>` +
      `</form>` +
      `<div class="auth-card-or" aria-hidden="true"><span>${esc(a.or)}</span></div>` +
      `<div class="auth-social"><button type="button" class="auth-social-btn" data-auth-page-google>${esc(a.googleSignup)}</button></div>` +
      `</div></div>` +
      `<div class="auth-new"><h3 class="auth-new-title">${esc(a.haveAccount)}</h3>` +
      `<a class="auth-new-btn" href="${esc(authLoginUrl())}" data-home-nav>${esc(a.toLogin)}</a></div>` +
      `</section>`
    );
  }
  return (
    `<section class="home-section auth-page">` +
    `<div class="auth-card">` +
    `<h2 class="auth-card-title">${esc(a.loginTitle)}</h2>` +
    `<div class="auth-card-cols">` +
    `<form class="auth-form" id="auth-page-login" novalidate>` +
    `<input class="auth-input" type="email" name="email" autocomplete="email" placeholder="${esc(t.authEmailLabel)}" aria-label="${esc(t.authEmailLabel)}" required>` +
    `<input class="auth-input" type="password" name="password" autocomplete="current-password" placeholder="${esc(t.authPasswordLabel)}" aria-label="${esc(t.authPasswordLabel)}" required>` +
    `<p class="auth-page-error" role="alert" hidden></p>` +
    `<button type="button" class="auth-forgot" data-auth-page-reset>${esc(a.forgot)}</button>` +
    `<button type="submit" class="auth-submit" data-label="${esc(t.authEmailLoginSubmit)}">${esc(t.authEmailLoginSubmit)}</button>` +
    `</form>` +
    `<div class="auth-card-or" aria-hidden="true"><span>${esc(a.or)}</span></div>` +
    `<div class="auth-social"><button type="button" class="auth-social-btn" data-auth-page-google>${esc(a.google)}</button></div>` +
    `</div></div>` +
    `<div class="auth-new"><h3 class="auth-new-title">${esc(a.newTitle)}</h3>` +
    `<a class="auth-new-btn" href="${esc(authSignupUrl())}" data-home-nav>${esc(a.newBtn)}</a></div>` +
    `</section>`
  );
}

// 送信中・エラーの表示
function authPageBusy(busy) {
  const page = homePage.querySelector(".auth-page");
  if (!page) return;
  page.querySelectorAll("input, button").forEach((el) => (el.disabled = busy));
  const submit = page.querySelector(".auth-submit");
  if (submit) submit.textContent = busy ? ui[currentLang].authSending : submit.dataset.label;
}
function authPageError(textOrKey) {
  const box = homePage.querySelector(".auth-page-error");
  if (!box) return;
  const text = textOrKey ? ui[currentLang][textOrKey] || textOrKey : "";
  box.textContent = text;
  box.hidden = !text;
}
const AUTH_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function authPageLogin(form) {
  const fd = new FormData(form);
  const email = String(fd.get("email") || "").trim();
  const password = String(fd.get("password") || "");
  if (!email || !password) return authPageError("authFillFields");
  // メールアドレスの形式の誤りも、「メールアドレスもしくはパスワードに誤りがあります」と出す(登録の有無を見分けられないように)
  if (!AUTH_EMAIL_RE.test(email)) return authPageError("authErrWrongPassword");
  if (!window.authApi || typeof window.authApi.signInWithEmail !== "function") return authPageError("authUnavailable");
  authPageError("");
  authPageBusy(true);
  try {
    await window.authApi.signInWithEmail(email, password);
    return; // ログインできたら、アカウントの画面に切り替わる(auth-changed)
  } catch (error) {
    const key = emailAuthErrorKey(error);
    authPageError(key === "authErrInvalidEmail" ? "authErrWrongPassword" : key);
  }
  authPageBusy(false);
}

async function authPageSignup(form) {
  const a = authPageText();
  const fd = new FormData(form);
  const nickname = String(fd.get("nickname") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const password = String(fd.get("password") || "");
  if (!nickname) return authPageError("authMissingNickname");
  if (!email || !password) return authPageError("authFillFields");
  if (!AUTH_EMAIL_RE.test(email)) return authPageError("authErrInvalidEmail");
  if (password.length < 6) return authPageError("authErrWeakPassword");
  if (!fd.get("agree")) return authPageError(a.needAgree);
  if (!window.authApi || typeof window.authApi.registerWithEmail !== "function") return authPageError("authUnavailable");
  authPageError("");
  authPageBusy(true);
  try {
    await window.authApi.registerWithEmail(email, password, nickname);
    navigate(authLoginUrl()); // 登録できたら、アカウントの画面へ(ログインした状態)
    return;
  } catch (error) {
    authPageError(emailAuthErrorKey(error));
  }
  authPageBusy(false);
}

async function authPageGoogle() {
  // 新規会員登録の画面では、Google で登録する前にも、同意のチェックを求める
  if (isAuthSignupMode()) {
    const agree = homePage.querySelector("#auth-page-agree");
    if (agree && !agree.checked) return authPageError(authPageText().needAgree);
  }
  if (location.protocol === "file:") return authPageError("authUnsupported");
  if (!window.authApi) return authPageError("authUnavailable");
  authPageError("");
  authPageBusy(true);
  try {
    await window.authApi.signIn();
    if (isAuthSignupMode()) navigate(authLoginUrl());
    return;
  } catch (error) {
    const key = typeof authErrorKey === "function" ? authErrorKey(error) : "authErrGeneric";
    if (key) authPageError(key);
  }
  authPageBusy(false);
}

homePage.addEventListener("submit", (event) => {
  const form = event.target;
  if (form.id === "auth-page-login") {
    event.preventDefault();
    authPageLogin(form);
  } else if (form.id === "auth-page-signup") {
    event.preventDefault();
    authPageSignup(form);
  }
});
homePage.addEventListener("click", (event) => {
  if (event.target.closest("[data-auth-page-google]")) {
    authPageGoogle();
    return;
  }
  if (event.target.closest("[data-auth-page-reset]")) {
    // パスワードの再設定は、これまでの小さな画面の「再設定」を使う
    if (typeof openAuthModal === "function") {
      openAuthModal();
      if (typeof switchView === "function") switchView("reset");
    }
  }
});
