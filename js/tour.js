// はじめての人向けの「使い方の案内」(地図の画面を初めて開いたときに、1回だけ出す)
//   ・ボタンなどの場所を明るく切り抜き、その横に短い説明を出す。「次へ」で順に進む
//   ・最後まで見る・「スキップ」・Esc のどれでも、この端末では二度と出さない
//     (localStorage「vf_tour_map」に「見た」ことだけを保存。日時や操作の内容は記録しない)
//   ・地図の動かし方の案内(js/map-guide.js)も、この中で説明するので、そちらは出さない
(function () {
  const KEY = "vf_tour_map";
  const GUIDE_KEY = "vf_map_guide"; // js/map-guide.js の「見た」印
  try {
    if (localStorage.getItem(KEY)) return;
  } catch (e) {
    return; // 覚えておけない環境では、毎回出てしまうので、出さない
  }
  const T = {
    ja: {
      back: "戻る", next: "次へ", done: "完了", skip: "スキップ",
      steps: {
        search: ["お店を探す", "店名・エリア・料理名(例: フォー、新宿)で、お店を検索できます"],
        scan: ["この範囲をスキャン", "地図を動かしてから押すと、見えている範囲のお店が一覧で出ます"],
        list: ["リストで見る", "地図に出ているお店を、写真つきの一覧で見られます"],
        locate: ["現在地を表示", "押すと、今いる場所を地図に表示します(位置情報の許可が必要です)"],
        compass: ["地図の向き・傾き", "2本の指でひねると回転、上下に動かすと傾けられます。このボタンで北が上に戻ります"],
      },
    },
    en: {
      back: "Back", next: "Next", done: "Done", skip: "Skip",
      steps: {
        search: ["Find shops", "Search by shop name, area, or dish (e.g. pho, Shinjuku)"],
        scan: ["Scan this area", "Move the map, then tap to list the shops in view"],
        list: ["View as a list", "See the shops on the map as a list with photos"],
        locate: ["Show your location", "Tap to show where you are on the map (location permission needed)"],
        compass: ["Rotate & tilt", "Twist two fingers to rotate, move them up or down to tilt. Tap here to reset north up"],
      },
    },
    vi: {
      back: "Quay lại", next: "Tiếp", done: "Xong", skip: "Bỏ qua",
      steps: {
        search: ["Tìm quán", "Tìm theo tên quán, khu vực hoặc món ăn (vd: phở, Shinjuku)"],
        scan: ["Quét khu vực này", "Di chuyển bản đồ rồi nhấn để xem danh sách quán trong vùng đang hiển thị"],
        list: ["Xem dạng danh sách", "Xem các quán trên bản đồ dưới dạng danh sách có ảnh"],
        locate: ["Hiện vị trí của bạn", "Nhấn để hiện vị trí hiện tại trên bản đồ (cần cho phép vị trí)"],
        compass: ["Xoay & nghiêng", "Xoay hai ngón tay để xoay, di chuyển lên xuống để nghiêng. Nhấn đây để đưa hướng bắc lên trên"],
      },
    },
  };
  // 案内する場所(画面に見えていないものは、飛ばす)
  const STEPS = [
    { key: "search", sel: "#search-bar" },
    { key: "scan", sel: "#scan-button" },
    { key: "list", sel: "#list-overlay-button" },
    { key: "locate", sel: ".live-locate" },
    { key: "compass", sel: ".live-compass", gl: true },
  ];
  const isVisible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && r.bottom > 0 && r.top < window.innerHeight;
  };

  let shown = false;
  function start() {
    if (shown) return;
    const isGL = typeof map !== "undefined" && map.isGL === true;
    const steps = STEPS.filter((s) => (!s.gl || isGL) && isVisible(document.querySelector(s.sel)));
    if (!steps.length) return;
    shown = true;
    const x = T[typeof currentLang !== "undefined" && T[currentLang] ? currentLang : "ja"];
    let i = 0;

    const wrap = document.createElement("div");
    wrap.className = "tour";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "tour-title");
    wrap.innerHTML =
      `<div class="tour-hole" aria-hidden="true"></div>` +
      `<div class="tour-card">` +
      `<button type="button" class="tour-skip">${esc(x.skip)}</button>` +
      `<h2 id="tour-title" class="tour-title"></h2><p class="tour-text"></p>` +
      `<div class="tour-foot"><button type="button" class="tour-back">${esc(x.back)}</button>` +
      `<span class="tour-pos"></span><button type="button" class="tour-next"></button></div>` +
      `<span class="tour-arrow" aria-hidden="true"></span></div>`;
    document.body.appendChild(wrap);
    const hole = wrap.querySelector(".tour-hole");
    const card = wrap.querySelector(".tour-card");
    const arrow = wrap.querySelector(".tour-arrow");

    const place = () => {
      const target = document.querySelector(steps[i].sel);
      if (!target) return;
      const r = target.getBoundingClientRect();
      const pad = 6;
      hole.style.left = r.left - pad + "px";
      hole.style.top = r.top - pad + "px";
      hole.style.width = r.width + pad * 2 + "px";
      hole.style.height = r.height + pad * 2 + "px";
      // カードは、場所の下に空きがあれば下、無ければ上に出す
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cw = Math.min(360, vw - 24);
      card.style.width = cw + "px";
      const ch = card.offsetHeight;
      const below = r.bottom + pad + 14 + ch < vh - 8;
      const top = below ? r.bottom + pad + 14 : Math.max(8, r.top - pad - 14 - ch);
      const cx = r.left + r.width / 2;
      const left = Math.min(vw - cw - 12, Math.max(12, cx - cw / 2));
      card.style.top = top + "px";
      card.style.left = left + "px";
      card.classList.toggle("is-above", !below);
      arrow.style.left = Math.min(cw - 22, Math.max(14, cx - left - 8)) + "px";
    };
    const show = () => {
      const [title, text] = x.steps[steps[i].key];
      wrap.querySelector(".tour-title").textContent = title;
      wrap.querySelector(".tour-text").textContent = text;
      wrap.querySelector(".tour-pos").textContent = `${i + 1}/${steps.length}`;
      wrap.querySelector(".tour-back").style.visibility = i === 0 ? "hidden" : "visible";
      wrap.querySelector(".tour-next").textContent = i === steps.length - 1 ? x.done : x.next;
      place();
      wrap.querySelector(".tour-next").focus();
    };
    const finish = () => {
      try {
        localStorage.setItem(KEY, "1");
        localStorage.setItem(GUIDE_KEY, "1");
      } catch (e) {
        // 覚えておけなくても、閉じる
      }
      window.removeEventListener("resize", place);
      document.removeEventListener("keydown", onKey);
      wrap.remove();
    };
    const onKey = (e) => {
      if (e.key === "Escape") finish();
    };
    wrap.querySelector(".tour-next").addEventListener("click", () => {
      if (i === steps.length - 1) return finish();
      i += 1;
      show();
    });
    wrap.querySelector(".tour-back").addEventListener("click", () => {
      if (i > 0) i -= 1;
      show();
    });
    wrap.querySelector(".tour-skip").addEventListener("click", finish);
    window.addEventListener("resize", place);
    document.addEventListener("keydown", onKey);
    show();
  }

  // 地図の画面が出たとき(ホーム・お店のページ・固定ページ・一覧を開いているとき以外)に出す
  const mapVisible = () => {
    const c = document.body.classList;
    if (c.contains("view-home") || c.contains("view-detail") || c.contains("view-content-page")) return false;
    const overlay = document.getElementById("scan-overlay");
    if (overlay && !overlay.hidden) return false;
    const m = document.getElementById("map");
    return !!m && m.offsetWidth > 0;
  };
  const check = () => {
    if (!shown && mapVisible()) setTimeout(() => !shown && mapVisible() && start(), 900);
  };
  new MutationObserver(check).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  check();
})();
