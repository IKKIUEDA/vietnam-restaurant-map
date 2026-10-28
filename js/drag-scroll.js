// PC(マウス)で、横に並んだ写真やカード(エリアから探す・あなたへのおすすめ・特集・お店の写真など)を、
// 押したまま左右に引っ張ってスライドできるようにする
//   ・スマホ・タブレット(指)は、もともと指でスライドできるので、何もしない
//   ・少しでも引っ張ったときは、離したときのクリック(お店のページへ移るなど)を取り消す
//   ・横にスクロールできる枠(overflow-x が auto / scroll で、中身がはみ出しているもの)なら、どこでも使える
(function () {
  const MOVE_START = 6; // これ以上動いたら「引っ張っている」とみなす(px)
  let drag = null; // { el, startX, startScroll, moved }

  // 押した場所から外側へたどり、横にスクロールできる枠を探す
  function findScroller(node) {
    for (let el = node; el && el !== document.body; el = el.parentElement) {
      if (el.id === "map") return null; // 地図は、地図そのものの動かし方を使う
      if (el.scrollWidth <= el.clientWidth + 1) continue;
      const ox = getComputedStyle(el).overflowX;
      if (ox === "auto" || ox === "scroll") return el;
    }
    return null;
  }

  document.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (e.target.closest("input, textarea, select, [contenteditable], .leaflet-container, .maplibregl-map")) return;
    const el = findScroller(e.target);
    if (!el) return;
    drag = { el, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < MOVE_START) return;
      drag.moved = true;
      drag.el.classList.add("is-drag-scrolling"); // 引っ張っている間は、写真の位置合わせ(スナップ)を止める
    }
    drag.el.scrollLeft = drag.startScroll - dx;
    e.preventDefault();
  });

  function end() {
    if (!drag) return;
    const { el, moved } = drag;
    drag = null;
    if (!moved) return;
    // 離したあとの1回のクリックを取り消す(引っ張っただけで、お店のページに移らないように)
    const cancel = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    window.addEventListener("click", cancel, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", cancel, { capture: true }), 0);
    // スナップを元に戻すと、いちばん近いカードの位置に合う
    const left = el.scrollLeft;
    el.classList.remove("is-drag-scrolling");
    const after = el.scrollLeft;
    if (after !== left) {
      el.scrollLeft = left;
      el.scrollTo({ left: after, behavior: "smooth" });
    }
  }
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);

  // 写真をつかんだときに、画像そのものを持ち出す動き(ドラッグ&ドロップ)にならないようにする
  document.addEventListener("dragstart", (e) => {
    if (e.target.closest && findScroller(e.target)) e.preventDefault();
  });
})();
