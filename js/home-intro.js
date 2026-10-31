// ホームの、トップ画像のすぐ下の「ベトナムフーディーの紹介」(赤い背景に白い文字)
//   ・上にロゴ、その下に見出しと本文
//   ・PC・スマホとも、はじめから全文を出す
const HOME_INTRO_TEXT = {
  ja: {
    title: ["日本でのベトナムのお店探しには、", "ベトナムフーディー！"],
    body: [
      "ベトナムフーディーは、ベトナムの料理店やカフェ、食材店を見つけられるサービスです。",
      "身近にあるベトナムの魅力を発見。新しいお店やお気に入りの味との出会いを通じて、日本にいながらベトナムスポットをもっと楽しもう。",
      "お気に入りのお店を見つけて、あなただけのベトナム体験を広げましょう。",
    ],
  },
  en: {
    title: ["Looking for Vietnamese spots in Japan?", "Try Vietnam Foodie!"],
    body: [
      "Vietnam Foodie is a service for finding Vietnamese restaurants, cafes and grocery stores.",
      "Discover the charm of Vietnam close to you. Meet new shops and new favorite flavors, and enjoy Vietnamese spots even more while in Japan.",
      "Find your favorite shops and expand your own Vietnamese experience.",
    ],
  },
  vi: {
    title: ["Tìm quán Việt Nam tại Nhật Bản?", "Hãy dùng Vietnam Foodie!"],
    body: [
      "Vietnam Foodie là dịch vụ giúp bạn tìm nhà hàng, quán cà phê và cửa hàng thực phẩm Việt Nam.",
      "Khám phá nét hấp dẫn của Việt Nam ngay gần bạn. Qua những quán mới và hương vị yêu thích, hãy tận hưởng các địa điểm Việt Nam nhiều hơn ngay tại Nhật Bản.",
      "Hãy tìm quán yêu thích và mở rộng trải nghiệm Việt Nam của riêng bạn.",
    ],
  },
};

function homeIntroHtml() {
  const x = HOME_INTRO_TEXT[currentLang] || HOME_INTRO_TEXT.ja;
  return (
    `<section class="home-intro is-open">` +
    `<div class="home-intro-inner">` +
    `<span class="home-intro-logo"><img src="images/logo.png" alt="" width="158" height="208" loading="lazy"></span>` +
    `<h2 class="home-intro-title">${x.title.map((t) => `<span>${esc(t)}</span>`).join("")}</h2>` +
    x.body.map((t) => `<p class="home-intro-text">${esc(t)}</p>`).join("") +
    `</div></section>`
  );
}
