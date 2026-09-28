// =====================================================================
// ヘッダーのログイン表示(Firebase Authentication)
// =====================================================================
//
// ■ 表示
//   ・ログインしていないとき … 「ログイン」ボタン(押すと、js/auth-modal.js のモーダルが開く)
//   ・ログイン中             … アイコン + ユーザー名 + 「ログアウト」ボタン
//       - Google でログインしたときは、Google アカウントの名前・アイコンをそのまま使う
//       - メールアドレス+パスワードでログインしたときは、新規登録のときに入力したニックネームを、
//         Firestore(users/{ユーザーID})から取ってきて使う(アイコンは、名前の頭文字の丸)
//   ・Firebase の準備ができるまで(ログイン状態が分かるまで)は、何も出さない(「ログイン」が一瞬出て、すぐ切り替わるのを防ぐため)
//
// ■ ログインの保持
//   Firebase Authentication 標準の仕組みで、ログイン状態がブラウザに保存されます。
//   ページを再読み込みしても、onChange が、保存されていたユーザーで呼ばれるので、自動で復元されます。
//
// ■ 今は、ログインしていなくても、すべての機能が、これまで通り使えます(ログイン必須の機能は、まだありません)。
//
// ■ Firebase との橋渡し
//   index.html のモジュールが用意する window.authApi(signIn / signInWithEmail / registerWithEmail /
//   sendPasswordReset / signOut / onChange / fetchUserProfile)を使います。
//   読み込めなかったときは、auth-api-failed の通知が来て、「ログインできない」旨を出します(他の機能には影響しません)。

const authArea = document.getElementById("auth-area");
const AUTH_API_WAIT_MS = 10000; // Firebase の準備を待つ長さ
const AUTH_MESSAGE_MS = 6000; // エラーの表示を出しておく長さ

let authApiStatus = "waiting"; // "waiting" | "ready" | "failed"
let authUser; // undefined = ログイン状態がまだ分からない / null = ログインしていない / ユーザー
let authBusy = false; // ログイン・ログアウトの操作中(ボタンを、連続で押せなくする)
let authMessageKey = null; // 表示しているエラーの文言のキー(ui のキー)
let authMessageTimer = null;
let authProfileName = null; // メールでログインしたユーザーの、Firestore から取った表示名(取得できるまでは null)
let authProfileUid = null; // authProfileName が、どのユーザーのものか(ユーザーが変わったら、破棄する)

// Google でログインしているか、メールアドレス+パスワードでログインしているか
function isEmailProvider(user) {
  return Array.isArray(user.providerData) && user.providerData.some((p) => p.providerId === "password");
}

// 管理者か(このメールアドレスでログインしているときだけ。Google・メールアドレス、どちらのログインでも判定できる)
//   ・実際の許可は、Firestore のルール(firestore.rules の isAdmin)が、ログインのトークンで判定している。
//     ここでの判定は、画面に「非表示にする」ボタンを出すかどうかだけに使う(表示上の判定)。
const ADMIN_EMAIL = "sales@compass-story.com";
function isAdminUser(user) {
  return !!user && user.email === ADMIN_EMAIL;
}

// いまの authUser の、画面に出す名前(Google はそのまま、メールは Firestore のニックネーム)
function resolveAuthName(user) {
  if (isEmailProvider(user) && authProfileUid === user.uid && authProfileName) return authProfileName;
  return user.displayName || user.email || "";
}

// メールでログインしたユーザーの、ニックネームを Firestore から取ってくる(取れたら、ヘッダーを描き直す)
function loadAuthProfileName(user) {
  if (!window.authApi || typeof window.authApi.fetchUserProfile !== "function") return;
  window.authApi
    .fetchUserProfile(user.uid)
    .then((profile) => {
      if (authUser !== user) return; // 取得している間に、別のユーザーになっていた
      authProfileName = (profile && typeof profile.displayName === "string" && profile.displayName) || null;
      authProfileUid = user.uid;
      renderAuth();
    })
    .catch((error) => {
      console.warn("ユーザー名の取得に失敗:", error); // 取れなくても、メールアドレスを表示するので、画面は壊れない
    });
}

// エラーを、ヘッダーの下に一定時間だけ出す
function showAuthMessage(key) {
  authMessageKey = key;
  clearTimeout(authMessageTimer);
  authMessageTimer = setTimeout(() => {
    authMessageKey = null;
    renderAuth();
  }, AUTH_MESSAGE_MS);
  renderAuth();
}

// Firebase のエラーコードから、出す文言を選ぶ(ログインをやめただけのときは、何も出さない)
function authErrorKey(error) {
  const code = (error && error.code) || "";
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return null;
  if (code === "auth/popup-blocked") return "authPopupBlocked";
  if (code === "auth/operation-not-supported-in-this-environment" || code === "auth/unauthorized-domain") return "authUnsupported";
  if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") return "authNotEnabled";
  return "authLoginError";
}

async function signOutFromGoogle() {
  if (authBusy || !window.authApi) return;
  authBusy = true;
  renderAuth();
  try {
    await window.authApi.signOut();
  } catch (error) {
    console.warn("ログアウトに失敗:", error && error.code, error && error.message);
    showAuthMessage("authLogoutError");
  } finally {
    authBusy = false;
    renderAuth();
  }
}

// ユーザーのアイコン(画像が無い・読み込めないときは、名前の頭文字の丸)
function createAvatar(user, name) {
  name = name || user.displayName || user.email || "?";
  const initial = () => {
    const span = document.createElement("span");
    span.className = "auth-avatar auth-avatar-initial";
    span.textContent = Array.from(name)[0].toUpperCase();
    return span;
  };
  if (!user.photoURL) return initial();
  const img = document.createElement("img");
  img.className = "auth-avatar";
  img.alt = "";
  img.width = 32;
  img.height = 32;
  img.referrerPolicy = "no-referrer"; // Google のアイコン画像が、読み込めなくなることがあるため
  img.src = user.photoURL;
  img.addEventListener("error", () => img.replaceWith(initial()), { once: true });
  return img;
}

// shortLabel があるときは、幅の狭い画面では、短い文字に切り替える(CSS で、どちらを出すかを決める)
function createAuthButton(label, onClick, extraClass = "", shortLabel = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `auth-btn ${extraClass}`.trim();
  if (shortLabel) {
    const long = document.createElement("span");
    long.className = "auth-label-long";
    long.textContent = label;
    const short = document.createElement("span");
    short.className = "auth-label-short";
    short.textContent = shortLabel;
    button.append(long, short);
    button.setAttribute("aria-label", label); // 短い文字のときも、読み上げは、長い文字
  } else {
    button.textContent = label;
  }
  button.disabled = authBusy;
  button.addEventListener("click", onClick);
  return button;
}

// ヘッダーの表示を、いまの状態と言語に合わせて作り直す(app.js の showTexts からも呼ばれる)
function renderAuth() {
  const t = ui[currentLang];
  authArea.replaceChildren();

  if (authUser) {
    // ログイン中: アイコン + ユーザー名 + ログアウト
    const name = resolveAuthName(authUser);
    const who = document.createElement("span");
    who.className = "auth-user";
    who.title = name;
    who.append(createAvatar(authUser, name));
    if (name) {
      const nameEl = document.createElement("span");
      nameEl.className = "auth-name";
      nameEl.textContent = name; // 文字として入れる(名前に変わった文字が入っても安全にするため)
      who.append(nameEl);
    }
    authArea.append(who, createAuthButton(t.authLogout, signOutFromGoogle, "auth-btn-outline"));
  } else if (authUser === null || authApiStatus === "failed") {
    // 未ログイン(Firebase を読み込めなかったときも、ボタンは出す。押すと、js/auth-modal.js のモーダルが開く)
    authArea.append(createAuthButton(t.authOpenLogin, () => openAuthModal(), ""));
  }
  // ログイン状態がまだ分からないときは、何も出さない

  if (authMessageKey) {
    const message = document.createElement("p");
    message.className = "auth-message";
    message.setAttribute("role", "alert");
    message.textContent = t[authMessageKey];
    authArea.append(message);
  }
}

// Firebase の準備を待って、ログイン状態の監視を始める
function watchAuth() {
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    authApiStatus = "ready";
    // ログイン状態が変わるたび(最初の復元も含む)に呼ばれる
    window.authApi.onChange((user) => {
      const firstTime = authUser === undefined; // まだ、一度も分かっていなかったか
      authUser = user;
      if (user) authMessageKey = null;
      if (!user || authProfileUid !== user.uid) {
        authProfileName = null; // 別のユーザーになった(または、ログアウトした)ので、前のニックネームは捨てる
        authProfileUid = user ? user.uid : null;
      }
      renderAuth();
      if (user && isEmailProvider(user)) loadAuthProfileName(user); // メールのユーザーだけ、ニックネームを取りに行く
      window.dispatchEvent(new Event("auth-changed")); // ログイン状態が変わったことを、他の部品(detail.js の Tips・Check-in)へ知らせる
      if (firstTime) window.dispatchEvent(new Event("auth-settled")); // 「ログインしているか、分かった」ことを、最初の1回だけ知らせる
    });
  };
  const fail = () => {
    if (started) return;
    authApiStatus = "failed";
    renderAuth();
    window.dispatchEvent(new Event("auth-settled")); // 読み込みに失敗したときも、「分かった」(=未ログイン扱い)として知らせる
  };

  if (window.authApi) return start();
  if (window.authApiFailed) return fail();
  window.addEventListener("auth-api-ready", start, { once: true });
  window.addEventListener("auth-api-failed", fail, { once: true });
  setTimeout(fail, AUTH_API_WAIT_MS); // 待ちすぎたとき(あとで準備できたら、start が上書きする)
}

renderAuth();
watchAuth();
