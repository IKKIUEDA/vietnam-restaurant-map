// ホームの「ベトナムフーディーでおすすめの機能」(「エリアから探す」と「トラベル・リスト」の間)
//   ・4枚のカード(番号・絵・英語の小見出し・機能の名前・説明)。押しても何も起きない(説明を見せるだけ)
//   ・PC は横に4枚、スマホは横にスクロール
//   ・絵は運営者が用意した画像(images/features/feature-1〜4.jpg)
const FEATURE_GUIDE_TEXT = {
  ja: {
    title: "ベトナムフーディーでおすすめの機能",
    items: [
      ["マップからお店を探す", "地図や駅名から、近くのベトナム料理店・カフェ・食材店などを検索することができます。現在地や旅行先で、気になるベトナムのスポットを見つけられます。"],
      ["Tips・レビューでお店選び", "お店ごとのTipsやレビューを参考に料理や雰囲気、おすすめのポイントをチェックしましょう。あなたに合ったお店選びに役立てられます。"],
      ["トラベル・リストで行きたい場所を管理", "気になるエリアとジャンルを保存することで、自分だけのリストを作成することが可能です。次のお出かけや旅行先で訪れたいベトナムのスポットを、いつでも振り返ることができます。"],
      ["写真・レビューで情報を共有", "実際に訪れたお店の写真や感想を投稿しましょう。あなたのリアルな体験が他のユーザーの新しいお店探しにもつながります。"],
    ],
  },
  en: {
    title: "Recommended features of Vietnam Foodie",
    items: [
      ["Find shops on the map", "Search for nearby Vietnamese restaurants, cafes and grocery stores by map or station name. Discover Vietnamese spots around you or wherever you travel."],
      ["Choose shops with Tips & reviews", "Check the food, atmosphere and highlights of each shop through Tips and reviews, and find the shop that suits you."],
      ["Manage places with your Travel List", "Save the areas and genres you are interested in to create your own list. Look back anytime at the Vietnamese spots you want to visit on your next outing or trip."],
      ["Share photos & reviews", "Post photos and impressions of the shops you have visited. Your real experience helps other users discover new shops."],
    ],
  },
  vi: {
    title: "Các tính năng nổi bật của Vietnam Foodie",
    items: [
      ["Tìm quán trên bản đồ", "Tìm nhà hàng, quán cà phê và cửa hàng thực phẩm Việt Nam gần bạn theo bản đồ hoặc tên ga. Khám phá các địa điểm Việt Nam ở nơi bạn đang ở hoặc nơi bạn du lịch."],
      ["Chọn quán qua Tips & đánh giá", "Xem món ăn, không khí và điểm nổi bật của từng quán qua Tips và đánh giá để chọn quán phù hợp với bạn."],
      ["Quản lý nơi muốn đến bằng Travel List", "Lưu khu vực và thể loại bạn quan tâm để tạo danh sách của riêng bạn. Xem lại bất cứ lúc nào các địa điểm Việt Nam muốn ghé trong chuyến đi tiếp theo."],
      ["Chia sẻ ảnh & đánh giá", "Đăng ảnh và cảm nhận về những quán bạn đã ghé. Trải nghiệm thật của bạn giúp người dùng khác tìm được quán mới."],
    ],
  },
};
// 英語の小見出し(どの言語でも同じ)
const FEATURE_GUIDE_LABELS = ["Find spots near you", "Choose shops with tips & reviews", "Your personal Travel List", "Share your experience"];

function featureGuideHtml() {
  const x = FEATURE_GUIDE_TEXT[currentLang] || FEATURE_GUIDE_TEXT.ja;
  const cards = x.items
    .map(
      ([name, text], i) =>
        `<li class="fg-card">` +
        `<div class="fg-img"><img src="images/features/feature-${i + 1}.jpg?v=1" alt="" loading="lazy" width="720" height="480">` +
        `<span class="fg-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span></div>` +
        `<div class="fg-body">` +
        `<p class="fg-label" lang="en">${esc(FEATURE_GUIDE_LABELS[i])}</p>` +
        `<h3 class="fg-name">${esc(name)}</h3>` +
        `<p class="fg-text">${esc(text)}</p>` +
        `</div></li>`
    )
    .join("");
  return (
    `<section class="home-section feature-guide">` +
    homeSectionLabel("Features") +
    `<h2 class="home-h2">${esc(x.title)}</h2>` +
    hscrollHtml(`<ul class="fg-cards">${cards}</ul>`, ".fg-cards") +
    `</section>`
  );
}
