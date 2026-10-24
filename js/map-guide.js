// 地図の操作の案内(スマホで、回転・傾けられる地図を初めて開いたときに、1回だけ出す)
//   ・2本指で上下 = 傾ける / 2本指でひねる = 回転 / コンパスのボタン = 北を上に戻す
//   ・一度閉じたら、この端末では二度と出さない(localStorage「vf_map_guide」。日時などは記録しない)
(function () {
  if (typeof map === "undefined" || !map.isGL) return;
  if (!window.matchMedia || !window.matchMedia("(pointer: coarse)").matches) return;
  const KEY = "vf_map_guide";
  try {
    if (localStorage.getItem(KEY)) return;
  } catch (e) {
    return; // 覚えておけない環境では、毎回出てしまうので、出さない
  }
  const T = {
    ja: {
      title: "地図の動かし方",
      tiltTitle: "傾ける",
      tiltText: "2本の指を画面に置いたまま、上・下へ動かします",
      rotateTitle: "回転する",
      rotateText: "2本の指で、つまみを回すようにひねります",
      reset: "右下のコンパスを押すと、北を上・真上から見る向きに戻ります",
      ok: "わかった",
    },
    en: {
      title: "Moving the map",
      tiltTitle: "Tilt",
      tiltText: "Keep two fingers on the screen and move them up or down",
      rotateTitle: "Rotate",
      rotateText: "Twist two fingers as if turning a knob",
      reset: "Tap the compass at the bottom right to return to north-up, top-down view",
      ok: "Got it",
    },
    vi: {
      title: "Cách di chuyển bản đồ",
      tiltTitle: "Nghiêng",
      tiltText: "Đặt hai ngón tay lên màn hình và di chuyển lên hoặc xuống",
      rotateTitle: "Xoay",
      rotateText: "Xoay hai ngón tay như đang vặn núm",
      reset: "Nhấn la bàn ở góc dưới bên phải để trở về hướng bắc ở trên, nhìn từ trên xuống",
      ok: "Đã hiểu",
    },
  };
  // 自分で描いた簡単な絵(2つの指の位置と、動かす向き)
  const TILT_ART =
    '<svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true"><rect x="8" y="8" width="64" height="64" rx="14" fill="#eef4ee"/>' +
    '<circle cx="30" cy="40" r="8" fill="#2e7d32"/><circle cx="50" cy="40" r="8" fill="#2e7d32"/>' +
    '<path d="M40 14v12M35 19l5-5 5 5M40 66V54M35 61l5 5 5-5" fill="none" stroke="#1d2a22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ROTATE_ART =
    '<svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true"><rect x="8" y="8" width="64" height="64" rx="14" fill="#eef4ee"/>' +
    '<circle cx="31" cy="46" r="8" fill="#2e7d32"/><circle cx="49" cy="34" r="8" fill="#2e7d32"/>' +
    '<path d="M22 28a22 22 0 0 1 30-10M58 52a22 22 0 0 1-30 10" fill="none" stroke="#1d2a22" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M47 14l6 4-5 5M33 66l-6-4 5-5" fill="none" stroke="#1d2a22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  let shown = false;
  function show() {
    if (shown) return;
    shown = true;
    const x = T[typeof currentLang !== "undefined" && T[currentLang] ? currentLang : "ja"];
    const wrap = document.createElement("div");
    wrap.className = "map-guide";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "map-guide-title");
    wrap.innerHTML =
      `<div class="map-guide-card">` +
      `<h2 id="map-guide-title">${esc(x.title)}</h2>` +
      `<ul class="map-guide-list">` +
      `<li>${TILT_ART}<div><strong>${esc(x.tiltTitle)}</strong><span>${esc(x.tiltText)}</span></div></li>` +
      `<li>${ROTATE_ART}<div><strong>${esc(x.rotateTitle)}</strong><span>${esc(x.rotateText)}</span></div></li>` +
      `</ul>` +
      `<p class="map-guide-note">${esc(x.reset)}</p>` +
      `<button type="button" class="map-guide-ok">${esc(x.ok)}</button>` +
      `</div>`;
    document.body.appendChild(wrap);
    const close = () => {
      try {
        localStorage.setItem(KEY, "1");
      } catch (e) {
        // 覚えておけなくても、閉じる
      }
      wrap.remove();
    };
    wrap.querySelector(".map-guide-ok").addEventListener("click", close);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) close();
    });
    wrap.querySelector(".map-guide-ok").focus();
  }
  // 地図の画面が出たとき(ホーム・お店のページ・固定ページ以外)に出す
  const mapVisible = () => {
    const c = document.body.classList;
    return !c.contains("view-home") && !c.contains("view-detail") && !c.contains("view-content-page") && map.getContainer().offsetWidth > 0;
  };
  const check = () => {
    if (!shown && mapVisible()) setTimeout(() => mapVisible() && show(), 600);
  };
  new MutationObserver(check).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  check();
})();
