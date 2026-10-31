// 写真を読み込んでいる間は、写真の場所にベトナムフーディーのロゴを出して、ゆっくり回す(1秒で1回転)
//   ・読み込みが終わったら、ロゴは消えて写真が出る(読み込めなかったときも、ロゴは止める)
//   ・ロゴ・アイコン・イラスト(images/ の決まった画像や .svg)は対象外。写真の無いお店の画像(止まったロゴ)も今まで通り
//   ・ロゴは写真そのもの(img)の背景として出すので、画面の並びは変わらない(images/loading-logo.svg)
(function () {
  const SKIP = /\.svg(\?|$)|images\/(logo|entries\/|mylist-|compass-story-logo|features\/|travel-list-)/i;
  function done(event) {
    event.target.classList.remove("is-img-loading");
  }
  function mark(img) {
    if (!(img instanceof HTMLImageElement) || img.dataset.imgLoading) return;
    img.dataset.imgLoading = "1";
    const src = img.getAttribute("src") || "";
    if (!src || SKIP.test(src)) return;
    if (img.closest(".leaflet-container, .maplibregl-map, #map")) return; // 地図のタイル・ピンは対象外
    if (img.complete && img.naturalWidth > 0) return; // もう読み込み済み
    img.classList.add("is-img-loading");
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  }
  function scan(root) {
    if (root instanceof HTMLImageElement) mark(root);
    if (root.querySelectorAll) root.querySelectorAll("img").forEach(mark);
  }
  new MutationObserver((records) => {
    records.forEach((r) => r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n)));
  }).observe(document.documentElement, { childList: true, subtree: true });
  scan(document);
})();
