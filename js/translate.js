// レビュー・コメントの「翻訳する」ボタン
//   ・投稿された文章は、書かれた言葉(原文)のまま表示する
//   ・画面の言語と違う言葉で書かれていそうな文章の下にだけ、「翻訳する」を出す
//   ・押したとき:
//       1. ブラウザに翻訳の機能(端末の中で翻訳する Translator API。いまは一部の Chrome)があれば、その場で訳して表示する
//          (文章は端末の外に送らない)。もう一度押すと原文に戻る
//       2. 無ければ、Google 翻訳のページを新しいタブで開く(そのとき、その文章が Google に送られる)
//   ・自動で翻訳することはない(押したときだけ)
const TRANSLATE_TEXT = {
  ja: { translate: "翻訳する", original: "原文を表示", working: "翻訳中…", note: "自動翻訳", failed: "翻訳できませんでした" },
  en: { translate: "Translate", original: "Show original", working: "Translating…", note: "Auto-translated", failed: "Couldn't translate" },
  vi: { translate: "Dịch", original: "Xem bản gốc", working: "Đang dịch…", note: "Dịch tự động", failed: "Không dịch được" },
};
function translateText() {
  return TRANSLATE_TEXT[currentLang] || TRANSLATE_TEXT.ja;
}

// 文章の言葉を、文字の種類からおおまかに見分ける("ja" / "zh" / "ko" / "vi" / "en" / "")
function guessTextLang(text) {
  const s = String(text || "");
  if (/[぀-ヿ]/.test(s)) return "ja"; // ひらがな・カタカナ
  if (/[가-힯]/.test(s)) return "ko";
  if (/[一-鿿]/.test(s)) return "zh"; // 漢字だけ(かなが無い)
  if (/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(s)) return "vi";
  if (/[a-z]/i.test(s)) return "en";
  return "";
}

// 端末の中で翻訳できるか(Translator API)
const canTranslateOnDevice = () => typeof self !== "undefined" && "Translator" in self;

// 「翻訳する」ボタンの HTML(画面の言語と同じ言葉の文章には出さない)
//   variant: "dark"(写真の上など、暗い背景)
function translateButtonHtml(text, variant) {
  const src = guessTextLang(text);
  if (!text || src === currentLang) return "";
  const x = translateText();
  return (
    `<button type="button" class="tr-btn${variant === "dark" ? " is-dark" : ""}" data-tr data-tr-src="${src}">` +
    `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M4 5h9M8.5 3v2M6 5c.8 3.2 3 5.6 6 7M11 5c-.8 3.2-3 5.6-6 7"/><path d="M13 21l4-9 4 9M14.5 18h5"/></svg>` +
    `<span>${esc(x.translate)}</span>${canTranslateOnDevice() ? "" : '<span class="tr-ext" aria-hidden="true">↗</span>'}</button>`
  );
}

const translatorCache = new Map();
async function translateOnDevice(text, source, target) {
  const key = `${source}>${target}`;
  if (!translatorCache.has(key)) {
    const avail = await self.Translator.availability({ sourceLanguage: source, targetLanguage: target });
    if (avail === "unavailable") throw new Error("unavailable");
    translatorCache.set(key, self.Translator.create({ sourceLanguage: source, targetLanguage: target }));
  }
  const translator = await translatorCache.get(key);
  return translator.translate(text);
}

function openGoogleTranslate(text) {
  const url = `https://translate.google.com/?sl=auto&tl=${encodeURIComponent(currentLang)}&text=${encodeURIComponent(text)}&op=translate`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.addEventListener("click", async (event) => {
  const btn = event.target.closest && event.target.closest("[data-tr]");
  if (!btn) return;
  event.preventDefault();
  event.stopPropagation();
  const target = btn.previousElementSibling; // 文章は、ボタンのすぐ上
  if (!target) return;
  const x = translateText();
  const label = btn.querySelector("span");
  // 訳を表示中なら、原文に戻す
  if (btn.dataset.trState === "done") {
    target.textContent = btn.dataset.trOriginal;
    btn.dataset.trState = "";
    label.textContent = x.translate;
    return;
  }
  const original = btn.dataset.trOriginal || target.textContent;
  if (!canTranslateOnDevice() || !btn.dataset.trSrc) {
    openGoogleTranslate(original);
    return;
  }
  btn.disabled = true;
  label.textContent = x.working;
  try {
    const translated = await translateOnDevice(original, btn.dataset.trSrc, currentLang);
    btn.dataset.trOriginal = original;
    target.textContent = translated;
    const note = document.createElement("span");
    note.className = "tr-note";
    note.textContent = ` (${x.note})`;
    target.appendChild(note);
    btn.dataset.trState = "done";
    label.textContent = x.original;
  } catch (e) {
    // 端末で訳せない言葉の組み合わせのときは、Google 翻訳を開く
    label.textContent = x.translate;
    openGoogleTranslate(original);
  } finally {
    btn.disabled = false;
  }
});
