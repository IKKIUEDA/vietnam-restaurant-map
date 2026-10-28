// お問い合わせ
//   ・ホームの一番下の「お問い合わせ」から開くフォーム(URL「?view=contact」)
//   ・種類・お名前・メールアドレス・内容を入れて送る。送った内容は Firebase(inquiries)に保存し、運営者(管理者)だけが見られる
//   ・ログインしていなくても送れる。プライバシーポリシーへの同意が必要
//   ・【管理者】届いたお問い合わせの一覧: 設定 →「【管理者】お問い合わせ」(URL「?view=account&settings=1&sub=inquiries」。js/settings.js から呼ぶ)

const CONTACT_TYPES = ["general", "shop", "owner", "other"];
const CONTACT_TEXT = {
  ja: {
    bandLead: "ベトナムフーディーへのご意見・ご要望や、お店の掲載についてのご相談は、こちらからお気軽にご連絡ください。",
    bandBtn: "お問い合わせ",
    title: "お問い合わせ",
    lead: "以下の各項目について、お間違えのないようご入力のうえ、ページ下部にある「送信する」ボタンを押してください。",
    selectPh: "選択してください",
    required: "必須",
    typeLabel: "お問い合わせの種類",
    types: {
      general: "ベトナムフーディーのサービス全般について",
      shop: "掲載しているお店の情報について(誤り・閉店など)",
      owner: "お店の方からのご連絡(掲載・掲載内容の変更など)",
      other: "その他",
    },
    nameLabel: "お名前",
    namePh: "例)山田 花子",
    emailLabel: "メールアドレス",
    emailPh: "例)name@example.com",
    messageLabel: "お問い合わせ内容",
    messageLead: "お問い合わせ内容をできるだけ詳しく入力して、「送信する」を押してください。",
    messageWarn: "※お問い合わせ内容には、住所・電話番号などの個人情報は書かないでください。",
    messagePh: "例)〇〇駅の近くの「〇〇」というお店の営業時間が変わっていました。",
    count: (n) => `${n} / 2000`,
    agree: (link) => `${link}に同意する`,
    privacy: "プライバシーポリシー",
    send: "送信する",
    sending: "送信しています…",
    needType: "お問い合わせの種類を選んでください",
    needName: "お名前を入れてください",
    needEmail: "メールアドレスを正しく入れてください",
    needMessage: "お問い合わせ内容を入れてください",
    needAgree: "プライバシーポリシーへの同意にチェックを入れてください",
    error: "送信できませんでした。時間をおいて、もう一度お試しください",
    doneTitle: "お問い合わせを受け付けました",
    doneText: "内容を確認のうえ、ご入力いただいたメールアドレスにご連絡します。お返事まで数日かかる場合があります。内容によっては、お返事できないこともありますので、ご了承ください。",
    toHome: "ホームに戻る",
    back: "戻る",
    adminTitle: "【管理者】お問い合わせ",
    adminEmpty: "まだ届いていません",
    adminDone: "対応済みにする",
    adminUndo: "未対応に戻す",
    adminDelete: "削除",
    adminDeleteConfirm: "本当に削除",
    adminStatus: { new: "未対応", done: "対応済み" },
    adminReply: "メールで返信",
  },
  en: {
    bandLead: "For feedback, requests or questions about listing a shop on Vietnam Foodie, please feel free to contact us here.",
    bandBtn: "Contact us",
    title: "Contact us",
    lead: "Please fill in each item below correctly, then press the “Send” button at the bottom of the page.",
    selectPh: "Please select",
    required: "Required",
    typeLabel: "Type of inquiry",
    types: {
      general: "About Vietnam Foodie in general",
      shop: "About information on a listed shop (errors, closures, etc.)",
      owner: "From a shop owner (listing, changes to details, etc.)",
      other: "Other",
    },
    nameLabel: "Name",
    namePh: "e.g. Hanako Yamada",
    emailLabel: "Email address",
    emailPh: "e.g. name@example.com",
    messageLabel: "Message",
    messageLead: "Please describe your inquiry in as much detail as possible, then tap ‘Send’.",
    messageWarn: "* Please do not include personal information such as addresses or phone numbers in your message.",
    messagePh: "e.g. The opening hours of “XX” near XX Station have changed.",
    count: (n) => `${n} / 2000`,
    agree: (link) => `I agree to the ${link}`,
    privacy: "Privacy Policy",
    send: "Send",
    sending: "Sending…",
    needType: "Please choose the type of inquiry",
    needName: "Please enter your name",
    needEmail: "Please enter a valid email address",
    needMessage: "Please enter your message",
    needAgree: "Please tick the box to agree to the Privacy Policy",
    error: "Couldn't send. Please try again later",
    doneTitle: "We have received your inquiry",
    doneText: "We will review it and reply to the email address you entered. It may take a few days to reply, and depending on the content we may not be able to reply.",
    toHome: "Back to home",
    back: "Back",
    adminTitle: "[Admin] Inquiries",
    adminEmpty: "Nothing yet",
    adminDone: "Mark as done",
    adminUndo: "Mark as new",
    adminDelete: "Delete",
    adminDeleteConfirm: "Really delete",
    adminStatus: { new: "New", done: "Done" },
    adminReply: "Reply by email",
  },
  vi: {
    bandLead: "Mọi ý kiến, đề xuất hoặc trao đổi về việc đăng quán trên Foodie Việt Nam, vui lòng liên hệ với chúng tôi tại đây.",
    bandBtn: "Liên hệ",
    title: "Liên hệ",
    lead: "Vui lòng nhập chính xác từng mục dưới đây, rồi nhấn nút “Gửi” ở cuối trang.",
    selectPh: "Vui lòng chọn",
    required: "Bắt buộc",
    typeLabel: "Loại câu hỏi",
    types: {
      general: "Về dịch vụ Foodie Việt Nam nói chung",
      shop: "Về thông tin quán đã đăng (sai sót, đóng cửa, v.v.)",
      owner: "Từ chủ quán (đăng quán, thay đổi nội dung, v.v.)",
      other: "Khác",
    },
    nameLabel: "Họ tên",
    namePh: "VD: Nguyễn Văn A",
    emailLabel: "Địa chỉ email",
    emailPh: "VD: name@example.com",
    messageLabel: "Nội dung",
    messageLead: "Vui lòng nhập nội dung càng chi tiết càng tốt, rồi nhấn “Gửi”.",
    messageWarn: "* Vui lòng không ghi thông tin cá nhân như địa chỉ, số điện thoại vào nội dung.",
    messagePh: "VD: Giờ mở cửa của quán “XX” gần ga XX đã thay đổi.",
    count: (n) => `${n} / 2000`,
    agree: (link) => `Tôi đồng ý với ${link}`,
    privacy: "Chính sách quyền riêng tư",
    send: "Gửi",
    sending: "Đang gửi…",
    needType: "Vui lòng chọn loại câu hỏi",
    needName: "Vui lòng nhập họ tên",
    needEmail: "Vui lòng nhập đúng địa chỉ email",
    needMessage: "Vui lòng nhập nội dung",
    needAgree: "Vui lòng đánh dấu đồng ý với Chính sách quyền riêng tư",
    error: "Không gửi được. Vui lòng thử lại sau",
    doneTitle: "Chúng tôi đã nhận được câu hỏi của bạn",
    doneText: "Chúng tôi sẽ kiểm tra và trả lời qua địa chỉ email bạn đã nhập. Có thể mất vài ngày để trả lời, và tùy nội dung, chúng tôi có thể không trả lời được.",
    toHome: "Về trang chủ",
    back: "Quay lại",
    adminTitle: "[Quản trị] Liên hệ",
    adminEmpty: "Chưa có",
    adminDone: "Đánh dấu đã xử lý",
    adminUndo: "Đặt lại chưa xử lý",
    adminDelete: "Xóa",
    adminDeleteConfirm: "Xóa thật",
    adminStatus: { new: "Chưa xử lý", done: "Đã xử lý" },
    adminReply: "Trả lời qua email",
  },
};
function contactText() {
  return CONTACT_TEXT[currentLang] || CONTACT_TEXT.ja;
}
// お問い合わせのURL: 「https://vietnamfoodie.compass-story.net/contact」
//   ・直接開いたとき・再読み込みしたときは、contact.html が「/?view=contact」に送り、ここで「/contact」の表示に戻す
function contactUrl() {
  return appBase() + "contact";
}
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get("view") === "contact" && [...params.keys()].length === 1) {
    try {
      history.replaceState(history.state, "", contactUrl() + location.hash);
    } catch (e) {
      // 書き換えられない環境(file:// など)は、そのまま
    }
  }
})();
// PC(幅 900px 以上・マウス)では、お問い合わせを新しいタブで開く(スマホは、今まで通り同じ画面で開く)
function contactOpensNewTab() {
  return window.matchMedia("(min-width: 900px) and (hover: hover)").matches;
}
document.addEventListener(
  "click",
  (event) => {
    const link = event.target.closest && event.target.closest("a[data-contact-link]");
    if (!link || !contactOpensNewTab()) return;
    event.preventDefault();
    event.stopPropagation();
    window.open(link.href, "_blank", "noopener");
  },
  true
);

function getContactApi() {
  if (window.contactApi) return Promise.resolve(window.contactApi);
  if (window.contactApiFailed) return Promise.reject(new Error("contact api failed"));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => done(reject, new Error("contact api timeout")), 15000);
    const onReady = () => done(resolve, window.contactApi);
    const onFailed = () => done(reject, new Error("contact api failed"));
    function done(fn, value) {
      clearTimeout(timer);
      window.removeEventListener("contact-api-ready", onReady);
      window.removeEventListener("contact-api-failed", onFailed);
      fn(value);
    }
    window.addEventListener("contact-api-ready", onReady);
    window.addEventListener("contact-api-failed", onFailed);
  });
}

// ホームの一番下の帯(js/home.js の renderHome が呼ぶ)
function homeContactHtml() {
  const x = contactText();
  return (
    `<section class="home-contact">` +
    `<p class="home-contact-lead">${esc(x.bandLead)}</p>` +
    `<a class="home-contact-btn" href="${esc(contactUrl())}" data-home-nav data-contact-link>${esc(x.bandBtn)}${homeIcon("forward", 18)}</a>` +
    `</section>`
  );
}

// ---------------------------------------------------------------------
// フォーム(URL「?view=contact」)
// ---------------------------------------------------------------------
let contactState = { type: "", name: "", email: "", message: "", agree: false, busy: false, error: "", done: false };

function renderContactPage() {
  const x = contactText();
  const st = contactState;
  const head =
    `<div class="todo-create-head mylist-page-head">` +
    `<a class="todo-back" href="${esc(homeUrl())}" data-home-nav aria-label="${esc(x.back)}">${homeIcon("back", 24)}</a>` +
    `<h2 class="todo-create-title">${esc(x.title)}</h2></div>`;
  // フォームの画面では、上の帯にはタイトルを出さず、ページの中に大きく出す
  const headBack = head.replace(/<h2 class="todo-create-title">.*?<\/h2>/, "");
  if (st.done) {
    homePage.innerHTML =
      head +
      `<section class="home-section contact-section"><div class="contact-done">${homeIcon("check", 28)}` +
      `<h3>${esc(x.doneTitle)}</h3><p>${esc(x.doneText)}</p>` +
      `<a class="todo-primary contact-home" href="${esc(homeUrl())}" data-home-nav>${esc(x.toHome)}</a></div></section>`;
    return;
  }
  // 見た目: 1行ずつ線で区切り、PC は左に項目名(と「必須」)、右に入力欄。スマホは項目名の下に入力欄
  const req = `<span class="contact-req">${esc(x.required)}</span>`;
  const label = (text, forId) => `<div class="contact-label"><label for="${forId}">${esc(text)}</label>${req}</div>`;
  const row = (labelHtml, inputHtml) => `<div class="contact-row">${labelHtml}<div class="contact-input">${inputHtml}</div></div>`;
  const privacyLink = `<a href="${esc(privacyUrl())}" target="_blank" rel="noopener">${esc(x.privacy)}</a>`;
  homePage.innerHTML =
    headBack +
    `<section class="home-section contact-section">` +
    `<h2 class="contact-title">${esc(x.title)}</h2>` +
    `<p class="contact-lead">${esc(x.lead)}</p>` +
    `<form class="contact-form" data-contact-form novalidate>` +
    row(
      label(x.typeLabel, "contact-type"),
      `<select id="contact-type" class="contact-control" name="type">` +
        `<option value=""${st.type ? "" : " selected"}>${esc(x.selectPh)}</option>` +
        CONTACT_TYPES.map((t) => `<option value="${t}"${st.type === t ? " selected" : ""}>${esc(x.types[t])}</option>`).join("") +
        `</select>`
    ) +
    row(
      label(x.nameLabel, "contact-name"),
      `<input id="contact-name" class="contact-control" name="name" maxlength="50" autocomplete="name" placeholder="${esc(x.namePh)}" value="${esc(st.name)}">`
    ) +
    row(
      label(x.emailLabel, "contact-email"),
      `<input id="contact-email" class="contact-control" name="email" type="email" maxlength="254" autocomplete="email" placeholder="${esc(x.emailPh)}" value="${esc(st.email)}">`
    ) +
    row(
      label(x.messageLabel, "contact-message"),
      `<p class="contact-note">${esc(x.messageLead)}</p><p class="contact-warn">${esc(x.messageWarn)}</p>` +
        `<textarea id="contact-message" class="contact-control" name="message" rows="8" maxlength="2000" placeholder="${esc(x.messagePh)}">${esc(st.message)}</textarea>` +
        `<p class="contact-count" data-contact-count>${esc(x.count(st.message.length))}</p>`
    ) +
    `<div class="contact-bottom">` +
    `<label class="set-check contact-agree"><input type="checkbox" name="agree"${st.agree ? " checked" : ""}><span>${x.agree(privacyLink)}</span></label>` +
    `<p class="acct-message is-error" role="alert"${st.error ? "" : " hidden"}>${esc(st.error)}</p>` +
    `<button type="submit" class="contact-submit"${st.busy ? " disabled" : ""}>${esc(st.busy ? x.sending : x.send)}</button>` +
    `</div>` +
    `</form></section>`;
}

// 入力中の内容を控える(描き直しても消えないように)
function keepContactInputs(form) {
  const f = form || homePage.querySelector("[data-contact-form]");
  if (!f) return;
  contactState.type = f.elements.type.value; // お問い合わせの種類(選択欄)
  contactState.name = f.elements.name.value;
  contactState.email = f.elements.email.value;
  contactState.message = f.elements.message.value;
  contactState.agree = f.elements.agree.checked;
}

homePage.addEventListener("input", (event) => {
  if (!event.target.closest("[data-contact-form]")) return;
  if (event.target.name === "message") {
    const c = homePage.querySelector("[data-contact-count]");
    if (c) c.textContent = contactText().count(event.target.value.length);
  }
});

homePage.addEventListener(
  "submit",
  (event) => {
    const form = event.target;
    if (!form.matches("[data-contact-form]")) return;
    event.preventDefault();
    event.stopPropagation();
    const x = contactText();
    const st = contactState;
    if (st.busy) return;
    keepContactInputs(form);
    const name = st.name.trim().slice(0, 50);
    const email = st.email.trim().slice(0, 254);
    const message = st.message.trim().slice(0, 2000);
    let error = "";
    if (!CONTACT_TYPES.includes(st.type)) error = x.needType;
    else if (!name) error = x.needName;
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) error = x.needEmail;
    else if (!message) error = x.needMessage;
    else if (!st.agree) error = x.needAgree;
    st.error = error;
    if (error) {
      renderContactPage();
      const el = homePage.querySelector(".acct-message");
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    st.busy = true;
    renderContactPage();
    getContactApi()
      .then((api) => api.send({ type: st.type, name, email, message, lang: ["ja", "en", "vi"].includes(currentLang) ? currentLang : "ja" }))
      .then(() => {
        contactState = { type: "", name: "", email: "", message: "", agree: false, busy: false, error: "", done: true };
        renderContactPage();
        homeView.scrollTop = 0;
      })
      .catch((e) => {
        console.warn("お問い合わせを送れませんでした:", e);
        st.busy = false;
        st.error = x.error;
        renderContactPage();
      });
  },
  true
);

// 「お問い合わせ」を開き直したら、前回の「受け付けました」は消して、新しいフォームにする
function resetContactIfDone() {
  if (contactState.done) contactState = { type: "", name: "", email: "", message: "", agree: false, busy: false, error: "", done: false };
}

// ---------------------------------------------------------------------
// 【管理者】届いたお問い合わせ(設定の中。js/settings.js の renderSettingsSub から呼ぶ)
// ---------------------------------------------------------------------
let contactAdmin = { list: null, loading: false, error: false, confirmDelete: null };
function renderContactAdmin(page) {
  const x = contactText();
  const a = contactAdmin;
  if (!a.list && !a.loading) {
    a.loading = true;
    getContactApi()
      .then((api) => api.list())
      .then((list) => {
        a.list = list;
        a.error = false;
      })
      .catch((e) => {
        console.warn("お問い合わせを読めませんでした:", e);
        a.list = [];
        a.error = true;
      })
      .then(() => {
        a.loading = false;
        renderHomeMode();
      });
  }
  let body;
  if (a.loading) body = `<p class="acct-note">${esc(accountText().loading)}</p>`;
  else if (a.error) body = `<p class="acct-note is-error">${esc(accountText().loadError)}</p>`;
  else if (!a.list.length) body = `<p class="acct-note">${esc(x.adminEmpty)}</p>`;
  else
    body = `<ul class="set-requests">${a.list
      .map((q) => {
        const date = typeof formatDate === "function" ? formatDate(q.createdAt) : "";
        const mail = `mailto:${encodeURIComponent(q.email || "")}`;
        return (
          `<li class="set-request is-${q.status === "done" ? "done" : "new"}">` +
          `<div class="set-request-head"><span class="set-request-type">${esc((x.types && x.types[q.type]) || q.type)}</span>` +
          `<span class="set-request-status">${esc(x.adminStatus[q.status] || q.status)}</span><span class="acct-item-date">${esc(date)}</span></div>` +
          `<p class="set-request-name">${esc(q.name)}</p>` +
          `<p class="set-request-line">${esc(q.email)}</p>` +
          `<p class="set-request-line set-request-memo">${esc(q.message)}</p>` +
          `<div class="set-request-actions">` +
          `<a class="acct-pill" href="${esc(mail)}">${esc(x.adminReply)}</a>` +
          `<button type="button" class="acct-pill" data-inq-status="${esc(q.id)}" data-status="${q.status === "done" ? "new" : "done"}">${esc(q.status === "done" ? x.adminUndo : x.adminDone)}</button>` +
          `<button type="button" class="acct-text-btn${a.confirmDelete === q.id ? " is-confirm" : ""}" data-inq-delete="${esc(q.id)}">${esc(a.confirmDelete === q.id ? x.adminDeleteConfirm : x.adminDelete)}</button>` +
          `</div></li>`
        );
      })
      .join("")}</ul>`;
  page(x.adminTitle, accountSettingsUrl(), body);
}

homePage.addEventListener("click", (event) => {
  const st = event.target.closest("[data-inq-status]");
  if (st) {
    const id = st.dataset.inqStatus;
    const status = st.dataset.status;
    st.disabled = true;
    getContactApi()
      .then((api) => api.setStatus(id, status))
      .then(() => {
        const q = (contactAdmin.list || []).find((v) => v.id === id);
        if (q) q.status = status;
      })
      .catch((e) => console.warn("状態を変えられませんでした:", e))
      .then(() => renderHomeMode());
    return;
  }
  const del = event.target.closest("[data-inq-delete]");
  if (del) {
    const id = del.dataset.inqDelete;
    if (contactAdmin.confirmDelete !== id) {
      contactAdmin.confirmDelete = id;
      renderHomeMode();
      return;
    }
    del.disabled = true;
    getContactApi()
      .then((api) => api.remove(id))
      .then(() => {
        contactAdmin.list = (contactAdmin.list || []).filter((v) => v.id !== id);
        contactAdmin.confirmDelete = null;
      })
      .catch((e) => console.warn("削除できませんでした:", e))
      .then(() => renderHomeMode());
  }
});
