// PC だけ: ホームを下にスクロールしたとき、見出し・写真・カードを、下からふわっと浮かび上がるように表示する
//   ・画面に入ったときに1回だけ動く(もう一度上に戻っても、隠れない)
//   ・ページを開いたときに、もう画面に見えているところは、動かさずにそのまま出す
//   ・スマホ(幅 900px 未満)と、「動きを減らす」設定にしている端末では、何もしない
const REVEAL_SINGLE = [
  ".home-intro-inner",
  ".home-section > .home-label",
  ".home-section > .home-h2",
  ".home-section > .home-section-sub",
  ".home-section > .home-area-head",
  ".todo-intro-text",
  ".todo-intro-cta",
];
// 並んでいるもの: 中のカードを、左から少しずつ遅らせて出す
const REVEAL_GROUPS = [".home-areas", ".home-rec-cards", ".fg-cards", ".home-features", ".people-row", ".todo-intro-phones"];
let homeRevealObserver = null;

function setupHomeReveal() {
  if (homeRevealObserver) homeRevealObserver.disconnect();
  homeRevealObserver = null;
  if (!window.matchMedia("(min-width: 900px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const items = []; // [{ el, delay }]
  homePage.querySelectorAll(REVEAL_SINGLE.join(",")).forEach((el) => items.push({ el, delay: 0 }));
  homePage.querySelectorAll(REVEAL_GROUPS.join(",")).forEach((list) => {
    [...list.children].forEach((el, i) => items.push({ el, delay: Math.min(i, 5) * 90, group: list }));
  });
  const vh = window.innerHeight;
  homeRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // 並びの枠が画面に入ったら、中のカードをまとめて出す
        const targets = el.dataset.revealGroup ? [...el.children].filter((c) => c.classList.contains("reveal")) : [el];
        targets.forEach((t) => t.classList.add("is-shown"));
        homeRevealObserver.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  const groups = new Set();
  items.forEach(({ el, delay, group }) => {
    const box = (group || el).getBoundingClientRect();
    if (box.top < vh) return; // もう見えているところは、そのまま
    el.classList.add("reveal");
    if (delay) el.style.transitionDelay = delay + "ms";
    if (group) groups.add(group);
    else homeRevealObserver.observe(el);
  });
  groups.forEach((g) => {
    g.dataset.revealGroup = "1";
    homeRevealObserver.observe(g);
  });
}
