// スマホで、長めの文章(お問い合わせ内容・レビュー・写真へのコメント・自己紹介など)を打ちやすくする
//   ・文章の入力欄(textarea)を押すと、画面いっぱいの「書くための画面」を開く
//     上: 「キャンセル」/ 項目名 / 「完了」、その下にキーボードのすぐ上まで広がる入力欄と文字数
//   ・「完了」で元の入力欄に文章を戻す(元の入力欄の input イベントも出すので、文字数の表示や下書きの保存はそのまま動く)
//   ・「キャンセル」なら、元の文章のまま
//   ・PC(幅 900px 以上)は、今まで通りその場で入力する
//   ・短い入力欄(お名前・メールアドレスなど)は、押したときにキーボードに隠れない位置まで動かし、入力中は下のメニューを隠す
(function () {
  const TEXT = {
    ja: { cancel: "キャンセル", done: "完了", fallback: "入力" },
    en: { cancel: "Cancel", done: "Done", fallback: "Write" },
    vi: { cancel: "Hủy", done: "Xong", fallback: "Nhập" },
  };
  const isMobile = () => window.matchMedia("(max-width: 899px)").matches;
  const tx = () => TEXT[typeof currentLang !== "undefined" && TEXT[currentLang] ? currentLang : "ja"];

  // 入力欄の項目名(画面の上に出す): 対応するラベル → aria-label → 見出しの文字 → 決まった文字
  function titleOf(el) {
    if (el.dataset.editorTitle) return el.dataset.editorTitle;
    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label && label.textContent.trim()) return label.textContent.trim();
    }
    if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");
    const wrapLabel = el.closest("label");
    if (wrapLabel && wrapLabel.textContent.trim()) return wrapLabel.textContent.trim().slice(0, 30);
    return tx().fallback;
  }

  let editor = null; // { wrap, area, count, source }
  function build() {
    const wrap = document.createElement("div");
    wrap.className = "txed";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.hidden = true;
    wrap.innerHTML =
      `<div class="txed-head">` +
      `<button type="button" class="txed-cancel"></button>` +
      `<h2 class="txed-title" id="txed-title"></h2>` +
      `<button type="button" class="txed-done"></button>` +
      `</div>` +
      `<textarea class="txed-area" aria-labelledby="txed-title"></textarea>` +
      `<p class="txed-count" aria-live="polite"></p>`;
    document.body.appendChild(wrap);
    const area = wrap.querySelector(".txed-area");
    const count = wrap.querySelector(".txed-count");
    area.addEventListener("input", () => updateCount());
    // 「キャンセル」「完了」: 指で押したときは、指を離した時点で閉じる(touchend)
    //   ・iPhone では、キーボードを閉じた直後などに、押しても click が届かないことがあるため(押しても閉じない不具合)
    //   ・touchend で preventDefault して、あとから来る click(閉じた後の下の画面への誤タップ)も止める
    //   ・マウス・キーボードで押したときは、今まで通り click で閉じる
    const bindButton = (btn, apply) => {
      btn.addEventListener(
        "touchend",
        (event) => {
          const t = event.changedTouches && event.changedTouches[0];
          if (!t) return;
          const r = btn.getBoundingClientRect();
          const pad = 12; // 指が少しずれても押したことにする
          if (t.clientX < r.left - pad || t.clientX > r.right + pad || t.clientY < r.top - pad || t.clientY > r.bottom + pad) return;
          if (event.cancelable) event.preventDefault();
          close(apply);
        },
        { passive: false }
      );
      btn.addEventListener("click", () => close(apply));
    };
    bindButton(wrap.querySelector(".txed-cancel"), false);
    bindButton(wrap.querySelector(".txed-done"), true);
    editor = { wrap, area, count, source: null };
  }
  function updateCount() {
    const max = Number(editor.area.getAttribute("maxlength")) || 0;
    editor.count.textContent = max ? `${editor.area.value.length} / ${max}` : "";
  }
  // キーボードが出ている間も、画面に見えている高さぴったりにする
  function fit() {
    if (!editor || editor.wrap.hidden) return;
    const vv = window.visualViewport;
    editor.wrap.style.height = (vv ? vv.height : window.innerHeight) + "px";
    editor.wrap.style.top = (vv ? vv.offsetTop : 0) + "px";
  }
  function open(source) {
    if (!editor) build();
    const t = tx();
    editor.source = source;
    editor.wrap.querySelector(".txed-cancel").textContent = t.cancel;
    editor.wrap.querySelector(".txed-done").textContent = t.done;
    editor.wrap.querySelector(".txed-title").textContent = titleOf(source);
    const area = editor.area;
    const max = source.getAttribute("maxlength");
    if (max) area.setAttribute("maxlength", max);
    else area.removeAttribute("maxlength");
    area.placeholder = source.placeholder || "";
    area.value = source.value;
    editor.wrap.hidden = false;
    document.body.classList.add("is-txed-open");
    updateCount();
    fit();
    // 押したその流れのまま入力欄を選ぶ(iPhone でキーボードを出すため)
    area.focus({ preventScroll: true });
    const end = area.value.length;
    try {
      area.setSelectionRange(end, end);
    } catch (e) {
      // 何もしない
    }
  }
  function close(apply) {
    if (!editor || editor.wrap.hidden) return;
    const source = editor.source;
    if (apply && source && document.body.contains(source) && source.value !== editor.area.value) {
      source.value = editor.area.value;
      source.dispatchEvent(new Event("input", { bubbles: true }));
      source.dispatchEvent(new Event("change", { bubbles: true }));
    }
    editor.area.blur();
    editor.wrap.hidden = true;
    editor.source = null;
    closedAt = Date.now();
    document.body.classList.remove("is-txed-open");
  }
  let closedAt = 0; // 閉じた時刻(閉じた直後に、下の入力欄が選ばれて、すぐ開き直してしまうのを防ぐ)

  // 文章の入力欄が選ばれたら、書くための画面を開く(スマホだけ)
  document.addEventListener("focusin", (event) => {
    const el = event.target;
    if (!isMobile() || !(el instanceof HTMLTextAreaElement)) return;
    if (el.classList.contains("txed-area") || el.disabled || el.readOnly || el.dataset.noEditor !== undefined) return;
    el.blur();
    // 「完了」を押した直後(0.6秒以内)に、下の入力欄が選ばれたとき(誤タップ・ブラウザがフォーカスを戻したとき)は、開き直さない
    if (Date.now() - closedAt < 600) return;
    open(el);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editor && !editor.wrap.hidden) close(false);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fit);
    window.visualViewport.addEventListener("scroll", fit);
  }
  // キーボードを閉じたとき(入力欄からフォーカスが外れたとき): iPhone では画面の大きさの知らせが遅れることがあるので、少し待ってから合わせ直す
  document.addEventListener("focusout", (event) => {
    if (!editor || event.target !== editor.area) return;
    setTimeout(fit, 350);
    setTimeout(fit, 800);
  });
  window.addEventListener("resize", fit);

  // 短い入力欄: 入力中は下のメニューを隠し、選んだ欄がキーボードに隠れない位置まで動かす(スマホだけ)
  const isTyping = (el) =>
    el instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "range", "file", "color"].includes(el.type);
  document.addEventListener("focusin", (event) => {
    const el = event.target;
    if (!isMobile() || !isTyping(el)) return;
    document.body.classList.add("is-typing");
    setTimeout(() => {
      if (document.activeElement === el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 300);
  });
  document.addEventListener("focusout", (event) => {
    if (!isTyping(event.target)) return;
    setTimeout(() => {
      if (!isTyping(document.activeElement)) document.body.classList.remove("is-typing");
    }, 100);
  });
})();
