// 設定の中の各画面(js/account.js の renderAccountSettings から呼ばれる)
//   ・新しいスポットを追加(URL「?view=account&settings=1&sub=spot&type=cafe」など)
//       店名・住所(必須)/ 最寄り駅・公式サイトやSNSのURL・ひとことメモ(任意)を、運営者に送る
//       送った内容は、運営者(管理者)だけが見られる。確認して、良いものを運営者が地図に追加する
//   ・【管理者】届いたスポット(sub=requests)
//   ・メールアドレスの変更・認証(sub=email)/ パスワードのリセットと変更(sub=password)
//       Google でログインしている人は、Google アカウントで管理されている旨だけを出す
//   ・アカウントの削除(sub=delete)
//       本人確認(パスワード、または Google のアカウント選択)→ 投稿などのデータをすべて削除 → アカウントを削除
//   ・Firebase とのやりとりは index.html の authApi・profileApi

const SETTINGS_TEXT = {
  ja: {
    spotName: "店名(必須)",
    spotAddress: "住所(必須)",
    spotAddressPh: "例: 東京都新宿区百人町1-2-3",
    spotStation: "最寄り駅(任意)",
    spotStationPh: "例: 新大久保",
    spotUrl: "公式サイト・SNSのURL(任意)",
    spotMemo: "ひとことメモ(任意・200文字まで)",
    spotMemoPh: "例: フォーがおいしい。週末は混みます",
    spotNotes: [
      "個人の住所・電話番号など、個人を特定できる情報の記載はご遠慮ください。",
      "送信頂いた内容は、運営者のみが閲覧できます。",
      "掲載する際は、運営者が内容を確認した上で、掲載いたします。",
    ],
    spotSend: "送信する",
    spotSending: "送信しています…",
    spotNeed: "店名と住所を入れてください",
    spotBadUrl: "URLは https:// から始まる形で入れてください",
    spotDone: "送信しました。ご協力ありがとうございます。運営者が確認して、地図への追加を検討します。",
    spotAnother: "別のお店を送る",
    adminRequests: "【管理者】届いたスポット",
    reqEmpty: "まだ届いていません",
    reqStatus: { new: "未対応", done: "掲載した", rejected: "見送り" },
    reqDone: "掲載した",
    reqReject: "見送り",
    reqReset: "未対応に戻す",
    reqDelete: "削除",
    reqDeleteConfirm: "本当に削除",
    googleEmail: "Google アカウントでログインしているため、メールアドレスは Google アカウントで管理されています。変更は Google アカウントの設定から行ってください。",
    setPwTitle: "このサイト用のパスワードを設定する",
    setPwLead: (email) => `Google のアカウントはそのままで、このサイト用のパスワードを追加できます。設定すると、Google でも、メールアドレス(${email})+パスワードでも、ログインできるようになります。`,
    setPwBtn: "パスワードを設定する",
    setPwNote: "ボタンを押すと、本人確認のため、Google のアカウント選択画面が開きます。",
    pwSet: "パスワードを設定しました。次回から、メールアドレスとパスワードでもログインできます。",
    pwAlready: "このメールアドレスには、すでにパスワードが設定されています",
    currentEmail: "現在のメールアドレス",
    verified: "認証済み",
    notVerified: "未認証",
    verifyLead: "メールアドレスが本人のものであることを確かめるため、認証メールを送ります。メールの中のリンクを開くと、認証が完了します。",
    sendVerify: "認証メールを送る",
    verifySent: "認証メールを送りました。メールの中のリンクを開いたあと、「認証の状態を更新」を押してください。",
    refreshVerify: "認証の状態を更新",
    changeEmailTitle: "メールアドレスを変更する",
    newEmail: "新しいメールアドレス",
    currentPassword: "現在のパスワード(本人確認のため)",
    changeEmailBtn: "確認メールを送る",
    changeEmailSent: "新しいメールアドレスに確認メールを送りました。メールの中のリンクを開くと、変更が完了します(完了後は、もう一度ログインが必要になることがあります)。",
    sameEmail: "いまと同じメールアドレスです",
    changePwTitle: "パスワードを変更する",
    newPassword: "新しいパスワード(6文字以上)",
    newPassword2: "新しいパスワード(確認のため、もう一度)",
    changePwBtn: "パスワードを変更する",
    pwChanged: "パスワードを変更しました",
    pwMismatch: "新しいパスワードが一致しません",
    resetTitle: "パスワードを忘れた場合",
    resetLead: (email) => `${email} に、パスワードを再設定するためのメールを送ります。`,
    resetBtn: "再設定メールを送る",
    resetSent: "再設定メールを送りました。メールの中のリンクから、新しいパスワードを設定してください。",
    sending: "送っています…",
    deleteLead: "アカウントを削除すると、次のデータがすべて削除され、元に戻せません。",
    deleteList: [
      "アカウント(ログインの情報)",
      "プロフィール(ニックネーム・アイコン・自己紹介)",
      "投稿した写真・レビュー・Tips・チェックイン・いいね・コメント",
      "送ったスポットの情報",
    ],
    deleteNotes: [
      "写真・アイコンの画像ファイルは、画像の保存サービス(Cloudinary)に残る場合があります(本サービスでは表示されなくなります)。画像ファイルの削除をご希望の場合は、sales@compass-story.com までご連絡ください。",
      "すでに地図に掲載したお店の情報は、お店の情報として残ります。",
      "この端末に保存している「保存した店」・マイリスト・閲覧の履歴は、端末の中に残ります。ブラウザの設定で、このサイトのデータを削除すると消せます。",
    ],
    deleteAgree: "削除すると元に戻せないことを理解しました",
    deletePasswordLabel: "パスワード(本人確認のため)",
    deleteGoogleNote: "「アカウントを削除する」を押すと、本人確認のため、Google のアカウント選択画面が開きます。",
    deleteBtn: "アカウントを削除する",
    deleting: (d, t) => (t ? `削除しています… (${d}/${t})` : "削除しています…"),
    deleteNeedAgree: "確認のチェックを入れてください",
    deleteNeedPassword: "パスワードを入れてください",
    deleted: "アカウントを削除しました。ご利用ありがとうございました。",
    deletePartial: "データの一部を削除できませんでした。もう一度お試しいただくか、sales@compass-story.com までご連絡ください。",
    errors: {
      wrongPassword: "パスワードが正しくありません",
      invalidEmail: "メールアドレスの形式が正しくありません",
      emailInUse: "そのメールアドレスは、すでに使われています",
      weakPassword: "パスワードは6文字以上にしてください",
      tooMany: "しばらく時間をおいて、もう一度お試しください",
      network: "通信に失敗しました。もう一度お試しください",
      popupClosed: "本人確認が完了しませんでした。もう一度お試しください",
      wrongAccount: "ログイン中と別の Google アカウントが選ばれました。同じアカウントを選んでください",
      rules: "送信できませんでした(データベースの設定がまだ反映されていない可能性があります)",
      generic: "うまくいきませんでした。時間をおいて、もう一度お試しください",
    },
  },
  en: {
    spotName: "Name (required)",
    spotAddress: "Address (required)",
    spotAddressPh: "e.g. 1-2-3 Hyakunincho, Shinjuku-ku, Tokyo",
    spotStation: "Nearest station (optional)",
    spotStationPh: "e.g. Shin-Okubo",
    spotUrl: "Official website / social media URL (optional)",
    spotMemo: "Short note (optional, up to 200 characters)",
    spotMemoPh: "e.g. Great pho. Busy on weekends",
    spotNotes: [
      "Please refrain from including personal addresses, phone numbers or other information that identifies an individual.",
      "Only the operator can view what you send.",
      "Before listing a place, the operator reviews the details.",
    ],
    spotSend: "Send",
    spotSending: "Sending…",
    spotNeed: "Please enter the name and address",
    spotBadUrl: "Please enter a URL starting with https://",
    spotDone: "Sent. Thank you! We'll review it and consider adding it to the map.",
    spotAnother: "Send another place",
    adminRequests: "[Admin] Submitted places",
    reqEmpty: "Nothing yet",
    reqStatus: { new: "New", done: "Listed", rejected: "Declined" },
    reqDone: "Listed",
    reqReject: "Decline",
    reqReset: "Mark as new",
    reqDelete: "Delete",
    reqDeleteConfirm: "Really delete",
    googleEmail: "You're logged in with Google, so your email address is managed by your Google Account. Please change it in your Google Account settings.",
    setPwTitle: "Set a password for this site",
    setPwLead: (email) => `You can add a password for this site while keeping your Google login. After that, you can log in either with Google or with your email address (${email}) and password.`,
    setPwBtn: "Set password",
    setPwNote: "When you tap the button, the Google account picker opens to confirm it's you.",
    pwSet: "Password set. From now on, you can also log in with your email address and password.",
    pwAlready: "A password is already set for this email address",
    currentEmail: "Current email address",
    verified: "Verified",
    notVerified: "Not verified",
    verifyLead: "We'll send a verification email to confirm this address is yours. Open the link in the email to finish.",
    sendVerify: "Send verification email",
    verifySent: "Verification email sent. After opening the link, tap ‘Refresh status’.",
    refreshVerify: "Refresh status",
    changeEmailTitle: "Change email address",
    newEmail: "New email address",
    currentPassword: "Current password (to confirm it's you)",
    changeEmailBtn: "Send confirmation email",
    changeEmailSent: "We sent a confirmation email to the new address. Open the link in it to finish the change (you may need to log in again afterwards).",
    sameEmail: "That's your current email address",
    changePwTitle: "Change password",
    newPassword: "New password (at least 6 characters)",
    newPassword2: "New password (again, to confirm)",
    changePwBtn: "Change password",
    pwChanged: "Password changed",
    pwMismatch: "The new passwords don't match",
    resetTitle: "Forgot your password?",
    resetLead: (email) => `We'll send an email to ${email} so you can set a new password.`,
    resetBtn: "Send reset email",
    resetSent: "Reset email sent. Use the link in it to set a new password.",
    sending: "Sending…",
    deleteLead: "Deleting your account permanently removes all of the following. This can't be undone.",
    deleteList: [
      "Your account (login information)",
      "Your profile (nickname, icon, bio)",
      "Your photos, reviews, Tips, check-ins, likes and comments",
      "Places you submitted",
    ],
    deleteNotes: [
      "Image files of photos and icons may remain on our image storage service (Cloudinary), though they will no longer be shown on this service. To have the image files deleted, please contact sales@compass-story.com.",
      "Shop information already listed on the map stays as shop information.",
      "Saved shops, My List and browsing history stored on this device stay on the device. You can remove them by deleting this site's data in your browser settings.",
    ],
    deleteAgree: "I understand this can't be undone",
    deletePasswordLabel: "Password (to confirm it's you)",
    deleteGoogleNote: "When you tap ‘Delete account’, the Google account picker opens to confirm it's you.",
    deleteBtn: "Delete account",
    deleting: (d, t) => (t ? `Deleting… (${d}/${t})` : "Deleting…"),
    deleteNeedAgree: "Please tick the confirmation box",
    deleteNeedPassword: "Please enter your password",
    deleted: "Your account has been deleted. Thank you for using Vietnam Foodie.",
    deletePartial: "Some data couldn't be deleted. Please try again or contact sales@compass-story.com.",
    errors: {
      wrongPassword: "Incorrect password",
      invalidEmail: "That email address is not valid",
      emailInUse: "That email address is already in use",
      weakPassword: "Password must be at least 6 characters",
      tooMany: "Please wait a moment and try again",
      network: "Connection failed. Please try again",
      popupClosed: "Confirmation wasn't completed. Please try again",
      wrongAccount: "A different Google account was chosen. Please choose the account you're logged in with",
      rules: "Couldn't send (the database settings may not be updated yet)",
      generic: "Something went wrong. Please try again later",
    },
  },
  vi: {
    spotName: "Tên quán (bắt buộc)",
    spotAddress: "Địa chỉ (bắt buộc)",
    spotAddressPh: "VD: 1-2-3 Hyakunincho, Shinjuku-ku, Tokyo",
    spotStation: "Ga gần nhất (không bắt buộc)",
    spotStationPh: "VD: Shin-Okubo",
    spotUrl: "URL trang web chính thức / mạng xã hội (không bắt buộc)",
    spotMemo: "Ghi chú ngắn (không bắt buộc, tối đa 200 ký tự)",
    spotMemoPh: "VD: Phở ngon. Cuối tuần đông khách",
    spotNotes: [
      "Vui lòng không ghi địa chỉ, số điện thoại cá nhân hay thông tin có thể nhận diện một người.",
      "Chỉ ban quản lý mới xem được nội dung bạn gửi.",
      "Ban quản lý sẽ kiểm tra nội dung trước khi đăng.",
    ],
    spotSend: "Gửi",
    spotSending: "Đang gửi…",
    spotNeed: "Vui lòng nhập tên quán và địa chỉ",
    spotBadUrl: "Vui lòng nhập URL bắt đầu bằng https://",
    spotDone: "Đã gửi. Cảm ơn bạn! Ban quản lý sẽ kiểm tra và cân nhắc thêm vào bản đồ.",
    spotAnother: "Gửi quán khác",
    adminRequests: "[Quản trị] Địa điểm được gửi",
    reqEmpty: "Chưa có",
    reqStatus: { new: "Chưa xử lý", done: "Đã đăng", rejected: "Không đăng" },
    reqDone: "Đã đăng",
    reqReject: "Không đăng",
    reqReset: "Đặt lại chưa xử lý",
    reqDelete: "Xóa",
    reqDeleteConfirm: "Xóa thật",
    googleEmail: "Bạn đang đăng nhập bằng Google, nên địa chỉ email được quản lý bởi tài khoản Google. Vui lòng thay đổi trong phần cài đặt tài khoản Google.",
    setPwTitle: "Đặt mật khẩu cho trang này",
    setPwLead: (email) => `Bạn có thể thêm mật khẩu cho trang này mà vẫn giữ đăng nhập bằng Google. Sau đó, bạn có thể đăng nhập bằng Google hoặc bằng email (${email}) và mật khẩu.`,
    setPwBtn: "Đặt mật khẩu",
    setPwNote: "Khi nhấn nút, màn hình chọn tài khoản Google sẽ mở ra để xác nhận danh tính.",
    pwSet: "Đã đặt mật khẩu. Từ lần sau, bạn cũng có thể đăng nhập bằng email và mật khẩu.",
    pwAlready: "Email này đã có mật khẩu",
    currentEmail: "Email hiện tại",
    verified: "Đã xác minh",
    notVerified: "Chưa xác minh",
    verifyLead: "Chúng tôi sẽ gửi email xác minh để xác nhận email này là của bạn. Mở liên kết trong email để hoàn tất.",
    sendVerify: "Gửi email xác minh",
    verifySent: "Đã gửi email xác minh. Sau khi mở liên kết, hãy nhấn “Cập nhật trạng thái”.",
    refreshVerify: "Cập nhật trạng thái",
    changeEmailTitle: "Đổi địa chỉ email",
    newEmail: "Email mới",
    currentPassword: "Mật khẩu hiện tại (để xác nhận danh tính)",
    changeEmailBtn: "Gửi email xác nhận",
    changeEmailSent: "Đã gửi email xác nhận đến địa chỉ mới. Mở liên kết trong email để hoàn tất (sau đó có thể cần đăng nhập lại).",
    sameEmail: "Đây là email hiện tại của bạn",
    changePwTitle: "Đổi mật khẩu",
    newPassword: "Mật khẩu mới (ít nhất 6 ký tự)",
    newPassword2: "Mật khẩu mới (nhập lại để xác nhận)",
    changePwBtn: "Đổi mật khẩu",
    pwChanged: "Đã đổi mật khẩu",
    pwMismatch: "Mật khẩu mới không khớp",
    resetTitle: "Quên mật khẩu?",
    resetLead: (email) => `Chúng tôi sẽ gửi email đến ${email} để bạn đặt lại mật khẩu.`,
    resetBtn: "Gửi email đặt lại",
    resetSent: "Đã gửi email đặt lại. Hãy dùng liên kết trong email để đặt mật khẩu mới.",
    sending: "Đang gửi…",
    deleteLead: "Khi xóa tài khoản, toàn bộ dữ liệu sau sẽ bị xóa và không thể khôi phục.",
    deleteList: [
      "Tài khoản (thông tin đăng nhập)",
      "Hồ sơ (biệt danh, ảnh đại diện, giới thiệu)",
      "Ảnh, đánh giá, Tips, check-in, lượt thích và bình luận đã đăng",
      "Thông tin địa điểm đã gửi",
    ],
    deleteNotes: [
      "Tệp ảnh của ảnh đã đăng và ảnh đại diện có thể vẫn còn trên dịch vụ lưu trữ ảnh (Cloudinary), nhưng sẽ không còn hiển thị trên dịch vụ này. Nếu muốn xóa tệp ảnh, vui lòng liên hệ sales@compass-story.com.",
      "Thông tin quán đã được đăng trên bản đồ sẽ được giữ lại như thông tin của quán.",
      "Quán đã lưu, My List và lịch sử xem lưu trên thiết bị này vẫn còn trên thiết bị. Bạn có thể xóa bằng cách xóa dữ liệu của trang này trong cài đặt trình duyệt.",
    ],
    deleteAgree: "Tôi hiểu rằng không thể khôi phục sau khi xóa",
    deletePasswordLabel: "Mật khẩu (để xác nhận danh tính)",
    deleteGoogleNote: "Khi nhấn “Xóa tài khoản”, màn hình chọn tài khoản Google sẽ mở ra để xác nhận danh tính.",
    deleteBtn: "Xóa tài khoản",
    deleting: (d, t) => (t ? `Đang xóa… (${d}/${t})` : "Đang xóa…"),
    deleteNeedAgree: "Vui lòng đánh dấu ô xác nhận",
    deleteNeedPassword: "Vui lòng nhập mật khẩu",
    deleted: "Đã xóa tài khoản. Cảm ơn bạn đã sử dụng Vietnam Foodie.",
    deletePartial: "Không xóa được một phần dữ liệu. Vui lòng thử lại hoặc liên hệ sales@compass-story.com.",
    errors: {
      wrongPassword: "Mật khẩu không đúng",
      invalidEmail: "Địa chỉ email không hợp lệ",
      emailInUse: "Địa chỉ email này đã được sử dụng",
      weakPassword: "Mật khẩu phải có ít nhất 6 ký tự",
      tooMany: "Vui lòng đợi một chút rồi thử lại",
      network: "Kết nối thất bại. Vui lòng thử lại",
      popupClosed: "Chưa hoàn tất xác nhận. Vui lòng thử lại",
      wrongAccount: "Bạn đã chọn tài khoản Google khác. Hãy chọn tài khoản đang đăng nhập",
      rules: "Không gửi được (có thể cài đặt cơ sở dữ liệu chưa được cập nhật)",
      generic: "Đã xảy ra lỗi. Vui lòng thử lại sau",
    },
  },
};
function settingsText() {
  return SETTINGS_TEXT[currentLang] || SETTINGS_TEXT.ja;
}

const SPOT_TYPES = ["restaurant", "cafe", "grocery"];

// いま開いている画面の状態(画面が変わったら、作り直す)
//   { key, busy, message, error, done, fields: { 入力中の文字 }, ... }
let settingsState = { key: "" };
function settingsStateFor(key) {
  if (settingsState.key !== key) settingsState = { key, busy: false, message: "", error: false, done: false, fields: {} };
  return settingsState;
}
function settingsField(name) {
  return settingsState.fields[name] || "";
}

// Firebase のエラーを、画面に出す文に変える
function settingsErrorText(error) {
  const e = settingsText().errors;
  const code = (error && error.code) || "";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential" || code === "auth/invalid-login-credentials") return e.wrongPassword;
  if (code === "auth/invalid-email" || code === "auth/missing-email") return e.invalidEmail;
  if (code === "auth/email-already-in-use") return e.emailInUse;
  if (code === "auth/weak-password") return e.weakPassword;
  if (code === "auth/too-many-requests") return e.tooMany;
  if (code === "auth/network-request-failed" || (error && error.message === "timeout")) return e.network;
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request" || code === "auth/popup-blocked") return e.popupClosed;
  if (code === "auth/user-mismatch") return e.wrongAccount;
  if (code === "permission-denied") return e.rules;
  return e.generic;
}

// 画面の部品
function settingsMessageHtml(st) {
  return `<p class="acct-message${st.error ? " is-error" : ""}" role="status"${st.message ? "" : " hidden"}>${esc(st.message)}</p>`;
}
function settingsInput({ name, label, type = "text", max, placeholder, autocomplete, required }) {
  const id = "set-" + name;
  return (
    `<label class="acct-label" for="${id}">${esc(label)}</label>` +
    `<input id="${id}" class="acct-input" name="${name}" type="${type}"${max ? ` maxlength="${max}"` : ""}` +
    `${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}${autocomplete ? ` autocomplete="${autocomplete}"` : ""}` +
    `${required ? " required" : ""} value="${type === "password" ? "" : esc(settingsField(name))}" data-set-field>`
  );
}
function settingsNotes(list) {
  return `<ul class="set-notes">${list.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`;
}

// renderAccountSettings(js/account.js)から呼ばれる。この画面を出したら true
//   page(title, backHref, bodyHtml) で描く
function renderSettingsSub(sub, params, page) {
  const x = accountText();
  const s = settingsText();
  const api = window.authApi;
  const hasPassword = !!(api && typeof api.hasPassword === "function" && api.hasPassword());
  const hasGoogle = !!(api && typeof api.hasGoogle === "function" && api.hasGoogle());

  if (sub === "spot") {
    const type = params.get("type");
    if (!SPOT_TYPES.includes(type)) return false; // 種類を選ぶ画面は account.js
    const st = settingsStateFor("spot-" + type);
    const title = `${x.addSpot}(${x.typeNames[type]})`;
    if (st.done) {
      page(
        title,
        acctSettingsUrl("spot"),
        `<p class="acct-soon set-done">${homeIcon("check", 22)}<span>${esc(s.spotDone)}</span></p>` +
          `<div class="todo-actions set-center"><button type="button" class="todo-secondary" data-set-action="spot-again">${esc(s.spotAnother)}</button></div>`
      );
      return true;
    }
    page(
      title,
      acctSettingsUrl("spot"),
        `<form class="acct-form" data-set-form="spot" data-type="${esc(type)}" novalidate>` +
        settingsInput({ name: "name", label: s.spotName, max: 80, required: true }) +
        settingsInput({ name: "address", label: s.spotAddress, max: 200, placeholder: s.spotAddressPh, required: true }) +
        settingsInput({ name: "station", label: s.spotStation, max: 40, placeholder: s.spotStationPh }) +
        settingsInput({ name: "url", label: s.spotUrl, type: "url", max: 300, placeholder: "https://" }) +
        `<label class="acct-label" for="set-memo">${esc(s.spotMemo)}</label>` +
        `<textarea id="set-memo" class="acct-input" name="memo" maxlength="200" rows="3" placeholder="${esc(s.spotMemoPh)}" data-set-field>${esc(settingsField("memo"))}</textarea>` +
        settingsNotes(s.spotNotes) +
        settingsMessageHtml(st) +
        `<div class="todo-actions"><button type="submit" class="todo-primary"${st.busy ? " disabled" : ""}>${esc(st.busy ? s.spotSending : s.spotSend)}</button></div>` +
        `</form>`
    );
    return true;
  }

  if (sub === "inquiries") {
    if (!isAdminUser(authUser) || typeof renderContactAdmin !== "function") return false;
    renderContactAdmin(page);
    return true;
  }

  if (sub === "requests") {
    if (!isAdminUser(authUser)) return false;
    const st = settingsStateFor("requests");
    if (!st.list && !st.loading) loadSpotRequests(st);
    let body;
    if (st.loading) body = `<p class="acct-note">${esc(x.loading)}</p>`;
    else if (st.loadError) body = `<p class="acct-note is-error">${esc(x.loadError)}</p>`;
    else if (!st.list.length) body = `<p class="acct-note">${esc(s.reqEmpty)}</p>`;
    else
      body = `<ul class="set-requests">${st.list
        .map((r) => {
          const date = typeof formatDate === "function" ? formatDate(r.createdAt) : "";
          const status = s.reqStatus[r.status] || r.status;
          const safeUrl = /^https?:\/\//.test(r.url || "") ? r.url : "";
          return (
            `<li class="set-request is-${esc(r.status)}">` +
            `<div class="set-request-head"><span class="set-request-type">${esc(x.typeNames[r.type] || r.type)}</span>` +
            `<span class="set-request-status">${esc(status)}</span><span class="acct-item-date">${esc(date)}</span></div>` +
            `<p class="set-request-name">${esc(r.name)}</p>` +
            `<p class="set-request-line">${esc(r.address)}</p>` +
            (r.station ? `<p class="set-request-line">🚉 ${esc(r.station)}</p>` : "") +
            (safeUrl ? `<p class="set-request-line"><a href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer nofollow">${esc(safeUrl)}</a></p>` : "") +
            (r.memo ? `<p class="set-request-line set-request-memo">${esc(r.memo)}</p>` : "") +
            `<div class="set-request-actions">` +
            (r.status !== "done" ? `<button type="button" class="acct-pill" data-set-action="req-status" data-id="${esc(r.id)}" data-status="done">${esc(s.reqDone)}</button>` : "") +
            (r.status !== "rejected" ? `<button type="button" class="acct-pill" data-set-action="req-status" data-id="${esc(r.id)}" data-status="rejected">${esc(s.reqReject)}</button>` : "") +
            (r.status !== "new" ? `<button type="button" class="acct-pill" data-set-action="req-status" data-id="${esc(r.id)}" data-status="new">${esc(s.reqReset)}</button>` : "") +
            `<button type="button" class="acct-text-btn${st.confirmDelete === r.id ? " is-confirm" : ""}" data-set-action="req-delete" data-id="${esc(r.id)}">${esc(st.confirmDelete === r.id ? s.reqDeleteConfirm : s.reqDelete)}</button>` +
            `</div></li>`
          );
        })
        .join("")}</ul>`;
    page(s.adminRequests, accountSettingsUrl(), body);
    return true;
  }

  if (sub === "email") {
    const st = settingsStateFor("email");
    // Google でログインできる人のメールアドレスは、Google アカウントのもの(このサイトだけで変えると、ずれてしまう)
    if (hasGoogle || !hasPassword) {
      page(x.emailSetting, acctSettingsUrl("account"), `<p class="acct-soon">${esc(s.googleEmail)}</p>`);
      return true;
    }
    const user = api.currentUser();
    const verified = !!(user && user.emailVerified);
    page(
      x.emailSetting,
      acctSettingsUrl("account"),
      `<div class="acct-card set-card"><p class="acct-label">${esc(s.currentEmail)}</p>` +
        `<p class="set-email">${esc(user ? user.email : "")}<span class="set-badge${verified ? " is-ok" : ""}">${esc(verified ? s.verified : s.notVerified)}</span></p>` +
        (verified
          ? ""
          : `<p class="acct-small">${esc(s.verifyLead)}</p>` +
            `<div class="set-row-btns"><button type="button" class="acct-pill" data-set-action="verify"${st.busy ? " disabled" : ""}>${esc(s.sendVerify)}</button>` +
            `<button type="button" class="acct-pill" data-set-action="verify-refresh">${esc(s.refreshVerify)}</button></div>`) +
        `</div>` +
        `<h3 class="set-heading">${esc(s.changeEmailTitle)}</h3>` +
        `<form class="acct-form" data-set-form="email" novalidate>` +
        settingsInput({ name: "newEmail", label: s.newEmail, type: "email", max: 254, autocomplete: "email", required: true }) +
        settingsInput({ name: "password", label: s.currentPassword, type: "password", autocomplete: "current-password", required: true }) +
        settingsMessageHtml(st) +
        `<div class="todo-actions"><button type="submit" class="todo-primary"${st.busy ? " disabled" : ""}>${esc(st.busy ? s.sending : s.changeEmailBtn)}</button></div>` +
        `</form>`
    );
    return true;
  }

  if (sub === "password") {
    const st = settingsStateFor("password");
    const user = api.currentUser();
    if (!hasPassword) {
      // Google でログインしている人: このサイト用のパスワードを追加できる
      page(
        x.passwordSetting,
        acctSettingsUrl("account"),
        `<h3 class="set-heading">${esc(s.setPwTitle)}</h3>` +
          `<p class="acct-small">${esc(s.setPwLead(user ? user.email : ""))}</p>` +
          `<form class="acct-form" data-set-form="set-password" novalidate>` +
          settingsInput({ name: "newPassword", label: s.newPassword, type: "password", autocomplete: "new-password", required: true }) +
          settingsInput({ name: "newPassword2", label: s.newPassword2, type: "password", autocomplete: "new-password", required: true }) +
          `<p class="acct-small">${esc(s.setPwNote)}</p>` +
          settingsMessageHtml(st) +
          `<div class="todo-actions"><button type="submit" class="todo-primary"${st.busy ? " disabled" : ""}>${esc(st.busy ? x.saving : s.setPwBtn)}</button></div>` +
          `</form>`
      );
      return true;
    }
    page(
      x.passwordSetting,
      acctSettingsUrl("account"),
      `<h3 class="set-heading">${esc(s.changePwTitle)}</h3>` +
        `<form class="acct-form" data-set-form="password" novalidate>` +
        settingsInput({ name: "password", label: s.currentPassword, type: "password", autocomplete: "current-password", required: true }) +
        settingsInput({ name: "newPassword", label: s.newPassword, type: "password", autocomplete: "new-password", required: true }) +
        settingsInput({ name: "newPassword2", label: s.newPassword2, type: "password", autocomplete: "new-password", required: true }) +
        settingsMessageHtml(st) +
        `<div class="todo-actions"><button type="submit" class="todo-primary"${st.busy ? " disabled" : ""}>${esc(st.busy ? x.saving : s.changePwBtn)}</button></div>` +
        `</form>` +
        `<div class="acct-card set-card set-reset"><h3 class="set-heading">${esc(s.resetTitle)}</h3>` +
        `<p class="acct-small">${esc(s.resetLead(user ? user.email : ""))}</p>` +
        (st.resetMessage ? `<p class="acct-message${st.resetError ? " is-error" : ""}" role="status">${esc(st.resetMessage)}</p>` : "") +
        `<button type="button" class="acct-pill" data-set-action="reset"${st.resetBusy ? " disabled" : ""}>${esc(st.resetBusy ? s.sending : s.resetBtn)}</button></div>`
    );
    return true;
  }

  if (sub === "delete") {
    const st = settingsStateFor("delete");
    page(
      x.deleteAccount,
      acctSettingsUrl("account"),
      `<div class="acct-card set-card set-danger-card"><p class="set-danger-lead">${esc(s.deleteLead)}</p>` +
        `<ul class="set-list">${s.deleteList.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div>` +
        settingsNotes(s.deleteNotes) +
        `<form class="acct-form" data-set-form="delete" novalidate>` +
        `<label class="set-check"><input type="checkbox" name="agree" data-set-field${settingsField("agree") ? " checked" : ""}${st.busy ? " disabled" : ""}>` +
        `<span>${esc(s.deleteAgree)}</span></label>` +
        (hasPassword
          ? settingsInput({ name: "password", label: s.deletePasswordLabel, type: "password", autocomplete: "current-password", required: true })
          : `<p class="acct-small">${esc(s.deleteGoogleNote)}</p>`) +
        settingsMessageHtml(st) +
        `<div class="todo-actions"><button type="submit" class="todo-primary set-danger-btn"${st.busy ? " disabled" : ""}>` +
        `${esc(st.busy ? s.deleting(st.done1 || 0, st.total || 0) : s.deleteBtn)}</button></div>` +
        `</form>`
    );
    return true;
  }
  return false;
}

function loadSpotRequests(st) {
  st.loading = true;
  getProfileApi()
    .then((api) => api.fetchSpotRequests())
    .then((list) => {
      st.list = list;
      st.loadError = false;
    })
    .catch((error) => {
      console.warn("届いたスポットを読めませんでした:", error);
      st.list = [];
      st.loadError = true;
    })
    .then(() => {
      st.loading = false;
      if (settingsState === st) renderHomeMode();
    });
}

// 画面を描き直したあと、結果のメッセージが見える位置まで動かす
function settingsRender() {
  renderHomeMode();
  if (typeof showAccountMessage === "function") showAccountMessage();
}

// 入力中の文字を控える(描き直しで消えないように。パスワードは控えない)
homePage.addEventListener("input", (event) => {
  const el = event.target;
  if (!el.matches("[data-set-field]") || el.type === "password") return;
  settingsState.fields[el.name] = el.type === "checkbox" ? (el.checked ? "1" : "") : el.value;
});
homePage.addEventListener("change", (event) => {
  const el = event.target;
  if (el.matches("[data-set-field]") && el.type === "checkbox") settingsState.fields[el.name] = el.checked ? "1" : "";
});

homePage.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-set-action]");
  if (!btn) return;
  const s = settingsText();
  const st = settingsState;
  const action = btn.dataset.setAction;
  const api = window.authApi;
  if (action === "spot-again") {
    settingsState = { key: "" };
    renderHomeMode();
  } else if (action === "verify") {
    st.busy = true;
    renderHomeMode();
    api
      .sendVerification()
      .then(() => {
        st.message = s.verifySent;
        st.error = false;
      })
      .catch((error) => {
        console.warn("認証メールを送れませんでした:", error);
        st.message = settingsErrorText(error);
        st.error = true;
      })
      .then(() => {
        st.busy = false;
        settingsRender();
      });
  } else if (action === "verify-refresh") {
    api
      .reloadUser()
      .catch((error) => console.warn("認証の状態を更新できませんでした:", error))
      .then(() => renderHomeMode());
  } else if (action === "reset") {
    const user = api.currentUser();
    if (!user || !user.email) return;
    st.resetBusy = true;
    renderHomeMode();
    api
      .sendPasswordReset(user.email)
      .then(() => {
        st.resetMessage = s.resetSent;
        st.resetError = false;
      })
      .catch((error) => {
        console.warn("再設定メールを送れませんでした:", error);
        st.resetMessage = settingsErrorText(error);
        st.resetError = true;
      })
      .then(() => {
        st.resetBusy = false;
        renderHomeMode();
      });
  } else if (action === "req-status") {
    const { id, status } = btn.dataset;
    btn.disabled = true;
    getProfileApi()
      .then((p) => p.setSpotStatus(id, status))
      .then(() => {
        const r = (st.list || []).find((x) => x.id === id);
        if (r) r.status = status;
      })
      .catch((error) => console.warn("状態を変えられませんでした:", error))
      .then(() => renderHomeMode());
  } else if (action === "req-delete") {
    const id = btn.dataset.id;
    if (st.confirmDelete !== id) {
      st.confirmDelete = id; // もう1回押すと、本当に削除する
      renderHomeMode();
      return;
    }
    btn.disabled = true;
    getProfileApi()
      .then((p) => p.deleteSpotRequest(id))
      .then(() => {
        st.list = (st.list || []).filter((x) => x.id !== id);
        st.confirmDelete = null;
      })
      .catch((error) => console.warn("削除できませんでした:", error))
      .then(() => renderHomeMode());
  }
});

// 送信(スポット・メールアドレス・パスワード・アカウントの削除)
homePage.addEventListener(
  "submit",
  (event) => {
    const form = event.target;
    if (!form.matches("[data-set-form]")) return;
    event.preventDefault();
    event.stopPropagation();
    const kind = form.dataset.setForm;
    const s = settingsText();
    const st = settingsState;
    if (st.busy) return;
    const val = (name) => {
      const el = form.elements[name];
      return el ? String(el.value || "").trim() : "";
    };
    const fail = (text) => {
      st.message = text;
      st.error = true;
      st.busy = false;
      settingsRender();
    };
    const start = () => {
      st.busy = true;
      st.message = "";
      st.error = false;
      renderHomeMode();
    };
    const api = window.authApi;

    if (kind === "spot") {
      const data = {
        type: form.dataset.type,
        name: val("name").slice(0, 80),
        address: val("address").slice(0, 200),
        station: val("station").slice(0, 40),
        url: val("url").slice(0, 300),
        memo: val("memo").slice(0, 200),
      };
      if (!data.name || !data.address) return fail(s.spotNeed);
      if (data.url && !/^https?:\/\/\S+$/.test(data.url)) return fail(s.spotBadUrl);
      start();
      getProfileApi()
        .then((p) => p.submitSpot(data))
        .then(() => {
          st.busy = false;
          st.done = true;
          st.fields = {};
          renderHomeMode();
          homeView.scrollTop = 0;
        })
        .catch((error) => {
          console.warn("スポットを送れませんでした:", error);
          fail(settingsErrorText(error));
        });
      return;
    }

    if (kind === "email") {
      const newEmail = val("newEmail");
      const password = form.elements.password ? form.elements.password.value : "";
      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return fail(s.errors.invalidEmail);
      const user = api.currentUser();
      if (user && user.email && user.email.toLowerCase() === newEmail.toLowerCase()) return fail(s.sameEmail);
      if (!password) return fail(s.deleteNeedPassword);
      start();
      api
        .reauthWithPassword(password)
        .then(() => api.changeEmail(newEmail))
        .then(() => {
          st.busy = false;
          st.error = false;
          st.message = s.changeEmailSent;
          st.fields = {};
          settingsRender();
        })
        .catch((error) => {
          console.warn("メールアドレスを変更できませんでした:", error);
          fail(settingsErrorText(error));
        });
      return;
    }

    if (kind === "password") {
      const password = form.elements.password.value;
      const p1 = form.elements.newPassword.value;
      const p2 = form.elements.newPassword2.value;
      if (!password) return fail(s.deleteNeedPassword);
      if (p1.length < 6) return fail(s.errors.weakPassword);
      if (p1 !== p2) return fail(s.pwMismatch);
      start();
      api
        .reauthWithPassword(password)
        .then(() => api.changePassword(p1))
        .then(() => {
          st.busy = false;
          st.error = false;
          st.message = s.pwChanged;
          settingsRender();
        })
        .catch((error) => {
          console.warn("パスワードを変更できませんでした:", error);
          fail(settingsErrorText(error));
        });
      return;
    }

    if (kind === "set-password") {
      const p1 = form.elements.newPassword.value;
      const p2 = form.elements.newPassword2.value;
      if (p1.length < 6) return fail(s.errors.weakPassword);
      if (p1 !== p2) return fail(s.pwMismatch);
      start();
      api
        .reauthWithGoogle()
        .then(() => api.linkPassword(p1))
        .then(() => {
          // 設定できたら、パスワードの変更・再設定の画面に切り替わる(次に描くとき hasPassword が true になる)
          settingsState = { key: "password", busy: false, error: false, message: s.pwSet, done: false, fields: {} };
          settingsRender();
        })
        .catch((error) => {
          console.warn("パスワードを設定できませんでした:", error);
          const code = (error && error.code) || "";
          if (code === "auth/provider-already-linked" || code === "auth/email-already-in-use" || code === "auth/credential-already-in-use")
            return fail(s.pwAlready);
          fail(settingsErrorText(error));
        });
      return;
    }

    if (kind === "delete") {
      const agree = form.elements.agree && form.elements.agree.checked;
      if (!agree) return fail(s.deleteNeedAgree);
      const hasPassword = api.hasPassword();
      const password = hasPassword ? form.elements.password.value : "";
      if (hasPassword && !password) return fail(s.deleteNeedPassword);
      start();
      const shopIds = entries.map((e) => e.shop.id);
      (hasPassword ? api.reauthWithPassword(password) : api.reauthWithGoogle())
        .then(() => getProfileApi())
        .then((p) =>
          p.deleteMyData(shopIds, (done, total) => {
            st.done1 = done;
            st.total = total;
            const b = homePage.querySelector(".set-danger-btn");
            if (b) b.textContent = s.deleting(done, total);
          })
        )
        .then(
          () => api.deleteAccount(),
          (error) => {
            // 本人確認の失敗は、そのまま知らせる。データの削除の途中で失敗したときは、アカウントは消さずに知らせる
            if (error && String(error.code || "").startsWith("auth/")) throw error;
            console.warn("データの削除に失敗:", error);
            const e = new Error("partial");
            e.code = "app/partial";
            throw e;
          }
        )
        .then(() => {
          settingsState = { key: "" };
          accountData = null;
          accountGoodbye = s.deleted; // ログアウトした「アカウント」画面に、お知らせとして出す
          navigate(accountUrl());
        })
        .catch((error) => {
          console.warn("アカウントを削除できませんでした:", error);
          st.done1 = 0;
          st.total = 0;
          fail(error && error.code === "app/partial" ? s.deletePartial : settingsErrorText(error));
        });
    }
  },
  true
);
