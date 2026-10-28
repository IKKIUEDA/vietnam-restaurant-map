// 多言語対応(日本語 / English / Tiếng Việt)まわりの部品です。

// 画面に固定で出す文字(お店のデータ以外)
const ui = {
  ja: {
    title: "ベトナムフーディー",
    tagline: "日本の中にある、ベトナムを探そう。",
    listTitle: "ベトナム料理・食材店・カフェ", // (見出しは、下の result〜 で「どこの・何が・何件」を作ります)
    mapLink: "Googleマップで見る",
    scanButton: "🔍スキャンする",
    scanStatus: "周辺のお店を検索中",
    scanOverlayBack: "← 戻る",
    scanOverlayTitle: "周辺のお店",
    scanOverlayEmpty: "この範囲には、お店がありませんでした",
    sheetToggle: "お店の一覧を広げる・縮める",
    listOverlayButton: (n) => `📋 ${n}件をリストで見る`,
    // 一覧の見出し: 「何が、どこに、何件あるのか」(例: 東京のベトナム料理 128件 / 新宿のベトナム料理・食材店 24件)
    resultWhat: (type, saved) =>
      (saved ? "保存した" : "") + ({ restaurant: "ベトナム料理", grocery: "ベトナム食材店", cafe: "ベトナムカフェ" }[type] || "ベトナム料理・食材店・カフェ"),
    resultWhere: (kind, place) =>
      ({ default: "関東", scan: "この周辺", near: `${place}周辺`, search: place }[kind] || place),
    resultHeading: (where, what) => `${where}の${what}`,
    resultCount: (n) => `${n}件`,
    areaPreviewSeparator: "、",
    areaPreviewMore: "ほか",
    nearbyNote: "現在地から近いベトナム料理店・食材店・カフェを表示するために位置情報を使用します。位置情報は保存されません。",
    detailLink: "詳細を見る",
    mapBtn: "地図で見る",
    detailBack: "← 一覧に戻る",
    detailNotFound: "お店が見つかりませんでした",
    detailNotFoundText: "URLが正しいか確認するか、一覧から探してください。",
    detailInfo: "基本情報",
    dtCategory: "カテゴリー",
    dtArea: "エリア",
    dtAddress: "住所",
    dtDishes: "料理",
    notRegistered: "情報未登録",
    straightLine: "(直線距離)",
    distanceFromHere: (d) => `現在地から約${d}`,
    distanceFromStart: (d) => `起点から約${d}`,
    distanceButton: "📍 現在地からの距離を表示",
    distanceLoading: "現在地を取得しています…",
    distanceFailed: "現在地を取得できなかったため、距離は表示していません",
    mapTitle: "地図・ルート確認",
    mapRoute: "Googleマップでルートを見る",
    photosTitle: "みんなの写真",
    photosAdd: "写真を追加する",
    photosNote: "あなたが撮影した写真、または投稿する権利のある写真のみアップロードしてください。",
    photosSubmit: "投稿する",
    photosUploading: "アップロード中…",
    photosCompressing: "画像を処理しています…",
    photosLoading: "写真を読み込んでいます…",
    photosLoadError: "写真を読み込めませんでした",
    photosEmpty: "📷 まだ写真はありません。最初の写真を投稿してみませんか?",
    photosThanks: "写真を投稿しました。ありがとうございます!",
    photosUploadError: "写真をアップロードできませんでした。通信状況を確認して、もう一度お試しください。",
    photosLoginNeeded: "写真を投稿するには、ログインしてください",
    photosDeleted: "写真を削除しました。",
    photosDeleteError: "写真を削除できませんでした。もう一度お試しください。",
    photosFileTypeError: "画像ファイル(jpg・png・webpなど)を選んでください。",
    photosFileTooLargeError: "この画像は圧縮しても大きすぎるため、アップロードできません。別の画像でお試しください。",
    photosCompressError: "画像を処理できませんでした。別の画像でお試しください。",
    photosEnlarge: "拡大表示",
    // 投稿前の必須チェック(利用規約への同意だけ。個別4項目は、下の注意文(photosNoticeLines)に統合してある)
    photosConsentTermsPrefix: "",
    photosConsentTermsSuffix: "を確認し、投稿ルールに同意します",
    // 投稿フォーム(写真の枠・説明文・投稿先・カテゴリー)
    photosAddButton: "写真を追加する",
    photosCancel: "キャンセル",
    photosAddBoxText: "写真を追加",
    photosDescriptionPlaceholder: "説明を書く...",
    photosRemovePhoto: "選んだ写真を取り消す",
    photosAddMore: "追加",
    photosMaxNote: (max) => `1回の投稿で${max}枚まで選べます`,
    photosPicked: (n, max) => `選んだ写真 ${n} / ${max}枚`,
    photosTooMany: "1回の投稿で選べるのは5枚までです。5枚を超えた分は追加していません。",
    photosSubmitN: (n) => `${n}枚を投稿する`,
    photosUploadingN: (i, n) => `アップロード中… (${i} / ${n}枚)`,
    photosPartialError: "一部の写真をアップロードできませんでした。残りの写真は選んだままなので、もう一度「投稿する」を押してください。",
    photosPostingTo: "投稿先",
    photosCategoryTitle: "カテゴリーを選択",
    photosCategories: [
      { key: "dish", label: "料理" },
      { key: "interior", label: "内観" },
      { key: "exterior", label: "外観" },
      { key: "people", label: "人物" },
      { key: "menu", label: "メニュー" },
    ],
    // 写真への「いいね」
    photoLikeButton: "いいねする",
    photoLikeError: "いいねの更新に失敗しました。もう一度お試しください。",
    // 写真へのコメント
    photoCommentsTitle: "コメント",
    photoCommentsLoading: "コメントを読み込んでいます…",
    photoCommentsLoadError: "コメントを読み込めませんでした",
    photoCommentsEmpty: "まだコメントはありません",
    photoCommentSubmit: "送信する",
    photoCommentSending: "送信中…",
    photoCommentThanks: "コメントを投稿しました。ありがとうございます!",
    photoCommentError: "コメントを送信できませんでした。通信状況を確認して、もう一度お試しください。",
    photoCommentLoginNeeded: "コメントを投稿するには、ログインしてください",
    photoCommentEmpty: "コメントを入力してください",
    photoCommentTooLong: "コメントは300文字以内にしてください",
    photoCommentDeleted: "コメントを削除しました。",
    photoCommentDeleteError: "コメントを削除できませんでした。もう一度お試しください。",
    // 投稿画面の、簡潔な注意事項
    photosNoticeTitle: "📷 写真を投稿する前に",
    photosNoticeLines: [
      "自分が撮影した写真、または自分が投稿する権利を持っている写真を投稿してください",
      "他人の写真やWebサイト・SNSなどから無断転載しないでください",
      "人物が写っている場合は、プライバシーに配慮し、必要に応じて本人の同意を得てください",
      "個人情報など、他人の権利を侵害する情報が含まれていないか、確認してください",
      "問題のある写真はレポートされ、非公開・削除される場合があります",
      "投稿された写真は、運営者が内容を確認したうえで、お店のトップ画像に使うことがあります(値段・人物・個人情報が写った写真は使いません)",
    ],
    photosNoticeFooterPrefix: "詳しいルールは",
    photosNoticeFooterSuffix: "をご確認ください。",
    // 写真の報告(誰でも利用できる。ログインは不要)
    reportPhotoButton: "🚩 この写真を報告",
    reportPhotoTitle: "報告の理由を選んでください",
    reportPhotoReasons: [
      { key: "copyright", label: "著作権・権利に問題がある" },
      { key: "person", label: "人物が無断で写っている" },
      { key: "privacy", label: "個人情報が含まれている" },
      { key: "unrelated", label: "店舗と関係のない写真" },
      { key: "inappropriate", label: "不適切な写真" },
      { key: "misleading", label: "写真の内容が実際と異なる" },
      { key: "other", label: "その他" },
    ],
    reportPhotoSubmit: "報告する",
    reportPhotoSending: "送信中…",
    reportPhotoThanks: "報告を受け付けました。ご協力ありがとうございます。",
    reportPhotoError: "報告を送信できませんでした。通信状況を確認して、もう一度お試しください。",
    reportPhotoNoneSelected: "理由を選んでください",
    // 【管理者だけ】写真の報告件数・理由の確認
    adminReportCount: (n) => `🚩 報告 ${n}件`,
    adminViewReports: "報告理由を見る",
    adminReportsLoading: "報告理由を読み込んでいます…",
    adminReportsLoadError: "報告理由を読み込めませんでした",
    adminReportsEmpty: "まだ報告はありません",
    // 利用規約ページ
    termsPageTitle: "利用規約",
    termsIntro:
      "「ベトナムフーディー」(以下「本サービス」)をご利用いただく前に、以下の利用規約(以下「本規約」)をお読みください。本サービスを利用された場合、本規約に同意されたものとみなします。",
    termsSections: [
      {
        title: "1. サービスについて",
        body: "本サービスは、日本国内のベトナムに関するお店・スポットを紹介する情報サイトです。掲載されている店舗情報・写真・レビューなどは、運営者またはユーザーの投稿をもとに構成されています。",
      },
      {
        title: "2. ユーザー投稿について",
        body: "本サービスでは、ログインしたユーザーが、写真・Tips(お店の良いところ)・レビュー(評価・コメント)・チェックインなどを投稿できます。投稿された内容は、他のユーザーにも公開されます。投稿された写真は、運営者が内容を確認したうえで、そのお店のページや一覧の代表画像(トップ画像)として表示することがあります。値段が分かるメニュー・値札、人物、個人情報が写った写真は、代表画像には使いません。投稿者が写真を削除した場合や、写真が非表示になった場合は、代表画像からも外れます。また、ログインしたユーザーは、設定の「新しいスポットを追加」から、まだ掲載されていないお店の情報を運営者に送ることができます。送られた情報は運営者が確認し、掲載するかどうかと掲載する内容を判断します(掲載をお約束するものではなく、掲載するときに内容を確認・編集することがあります)。",
      },
      {
        title: "3. 投稿できる写真",
        body: "投稿できるのは、次のいずれかに当てはまる写真に限ります。",
        list: [
          "投稿者ご自身が撮影した写真",
          "投稿者ご自身が、投稿する正当な権利を持っている写真(権利者から許可を得ている場合など)",
        ],
      },
      {
        title: "4. 禁止される投稿",
        body: "以下のような写真・投稿は禁止します。見つかった場合、非表示または削除の対象となります。",
        list: [
          "他人が撮影した写真を、無断で転載したもの",
          "Google マップなど、他のウェブサービスの画像を、無断で転載したもの",
          "店舗の公式サイト・SNSなどの画像を、無断で転載したもの",
          "他のユーザーが本サービスに投稿した写真を、無断で転載したもの",
          "本人の許可を得ずに、第三者を撮影・掲載したもの",
          "個人情報(氏名・連絡先・車のナンバーなど)が、判読できる状態で写り込んでいるもの",
          "特定の個人・団体を誹謗中傷する内容",
          "差別的な内容、または嫌がらせを目的とした内容",
          "性的な内容を含むもの",
          "暴力的な内容を含むもの",
          "著作権・商標権・肖像権など、第三者の権利を侵害するもの",
          "実際の店舗・料理とは異なる、虚偽の情報",
          "その他、運営者が本サービスにふさわしくないと判断するもの",
        ],
      },
      {
        title: "5. 投稿者の責任",
        body: "投稿する写真・情報の内容については、投稿したご本人に責任があります。ご自身の投稿が、他人の権利を侵害していないか、投稿前に必ずご確認ください。",
      },
      {
        title: "6. 著作権・肖像権など、第三者の権利について",
        body: "写真には、撮影した方に著作権が生じます。また、写っている人には、肖像権(自分の姿を無断で撮影・公開されない権利)があります。特に、次のような場合は、注意が必要です。",
        list: [
          "店舗のスタッフの方が写っている場合: 個人が特定できる形で掲載するには、本人の同意が必要です。",
          "他のお客様が写っている場合: 同じく、個人が特定できる形で掲載するには、本人の同意が必要です。偶然写り込んでしまった場合は、投稿前に、顔にモザイクをかける・トリミングするなど、写っている方への配慮をお願いします。",
        ],
      },
      {
        title: "7. 投稿内容の削除・非公開について",
        body: "投稿した内容は、投稿者ご自身が、いつでも削除できます(削除すると、また新しく投稿できる状態に戻ります)。また、本規約に反する投稿が見つかった場合、運営者の判断で、投稿を非表示にすることがあります(データ自体は、すぐには削除せず、確認のうえで対応します)。",
      },
      {
        title: "8. レポート・削除依頼について",
        body: "他のユーザーの投稿に問題があると感じた場合は、各写真の「この写真を報告」から、理由を選んで報告できます(ログインは不要です)。報告内容は、運営者が内容を確認したうえで、対応を判断します。報告したからといって、自動的に写真が非表示になるわけではありません。また、ご自身やご自身のお店が写った写真の削除を希望される場合も、同じレポート機能からご連絡ください。",
      },
      {
        title: "9. サービスの変更・停止について",
        body: "本サービスは、予告なく内容を変更、または一時的に停止することがあります。",
      },
      {
        title: "10. 免責事項",
        body: "本サービスに掲載されている情報・写真・レビューの内容については、可能な限り正確な情報を心がけていますが、その正確性・最新性を完全に保証するものではありません。本サービスの利用によって生じたトラブルについて、運営者は責任を負いかねますので、あらかじめご了承ください。",
      },
      {
        title: "11. 規約の変更について",
        body: "本規約の内容は、必要に応じて変更することがあります。変更後の規約は、本ページに掲載した時点から効力を持ちます。",
      },
    ],
    // プライバシーポリシーページ
    privacyPageTitle: "プライバシーポリシー",
    privacyIntro: "「ベトナムフーディー」（以下「本サービス」といいます）は、利用者の個人情報および利用に関する情報を、以下のとおり取り扱います。",
    privacySections: [
      {
        "title": "1. はじめに",
        "paras": [
          "本ポリシーでは、本サービスが取得する情報、その利用目的、保存・管理方法などについて説明します。本サービスをご利用になる前に、ご確認ください。"
        ]
      },
      {
        "title": "2. 取得する情報と利用目的",
        "paras": [
          "本サービスでは、機能の提供および運営のため、以下の情報を取得・利用します。"
        ],
        "subs": [
          {
            "title": "2-1. ログイン情報",
            "paras": [
              "メールアドレス、Googleアカウントの表示名、アカウントIDなどを、アカウントの管理や投稿者の表示に利用します。",
              "メールアドレスでログインしている場合、利用者の操作に応じて、メールアドレスの認証・変更やパスワードの再設定に必要なメールをFirebaseの仕組みを通じて送信します。"
            ]
          },
          {
            "title": "2-2. 新しいスポットの追加に関する情報",
            "paras": [
              "設定画面から送信された店舗の種類、店名、住所、最寄り駅、URL、メモ、送信日時、送信者のアカウントIDを取得します。",
              "これらの情報は、運営者が内容を確認し、本サービスへの掲載可否を判断するために利用します。送信された情報や送信者の名前は、ほかの利用者には公開しません。掲載が決まった場合は、店舗情報として公開します。"
            ]
          },
          {
            "title": "2-3. 投稿情報",
            "paras": [
              "Tips、レビュー、コメント、チェックイン、写真、いいねなどの投稿内容や投稿日時を、店舗情報の共有および本サービス内での表示に利用します。",
              "投稿の公開範囲については、「3. 情報の公開範囲」をご確認ください。"
            ]
          },
          {
            "title": "2-4. 位置情報・端末の向き",
            "paras": [
              "位置情報は、利用者がブラウザで許可した場合に、近くの店舗の検索、地図上の現在地の表示、店舗までの距離の計算などに利用します。",
              "位置情報は端末内で利用し、本サービスのサーバーには保存・送信しません。",
              "また、地図のコンパス機能では、利用者がコンパスボタンを押したときに端末の向きを取得し、地図上の方角の表示に利用します。端末の向きも保存・送信しません。"
            ]
          },
          {
            "title": "2-5. 本サービス内での行動の記録",
            "paras": [
              "閲覧した店舗、検索した言葉、選択した店舗の種類、閲覧した特集などの情報を、おすすめ機能の提供に利用します。",
              "これらの情報はブラウザ内に保存し、本サービスのサーバーには送信しません。おすすめの計算も端末内で行います。",
              "保存された情報は、ブラウザの設定から本サービスのサイトデータを削除することで消去できます。"
            ]
          },
          {
            "title": "2-6. 保存した店舗",
            "paras": [
              "保存マークを押した店舗の情報を、アカウント画面の「保存したお店」に表示するために利用します。",
              "保存情報はログイン中のアカウントに紐づけてFirebaseに保存し、本人のみが閲覧できるようにします。ほかの利用者には公開しません。保存マークを再度押すことで保存を解除できます。アカウントを削除した場合は、保存情報も削除します。",
              "なお、以前のバージョンでブラウザ内に保存していた店舗情報は、初回ログイン時にアカウントへ移行する場合があります。"
            ]
          },
          {
            "title": "2-7. トラベル・リスト",
            "paras": [
              "選択したエリアや探したい店舗の種類などを、トラベル・リストの表示やおすすめ機能に利用します。",
              "これらの情報はブラウザ内に保存し、本サービスのサーバーには送信しません。ホーム画面で表示される質問への回答や、次回の質問表示時期を決めるための日時も、同様にブラウザ内に保存します。",
              "情報はトラベル・リストの画面から追加・変更・削除できます。また、ブラウザのサイトデータを削除すると、保存された情報も消去されます。"
            ]
          },
          {
            "title": "2-8. 使い方の案内",
            "paras": [
              "操作説明を適切に表示するため、案内を表示したかどうかの情報をブラウザ内に保存します。この情報は本サービスのサーバーには送信しません。"
            ]
          },
          {
            "title": "2-9. 翻訳機能",
            "paras": [
              "レビューやコメントなどの「翻訳する」を押した場合に、対象の文章を翻訳します。",
              "ブラウザに端末内で翻訳する機能がある場合は、その機能を利用します。端末内で翻訳できない場合は、Google翻訳（Google LLC）のページを新しいタブで開き、対象の文章をGoogleに送信します。この場合、Googleにおける情報の取り扱いは、Googleのプライバシーポリシーに従います。",
              "翻訳は利用者の操作に応じて行い、本サービスが翻訳を自動実行したり、翻訳結果を保存したりすることはありません。"
            ]
          },
          {
            "title": "2-10. シェア機能",
            "paras": [
              "ホーム画面の「このページをシェアする」からX、Facebook、LINEを選択した場合、本サービスのURLと紹介文を各サービスのシェア画面に渡します。",
              "各サービスにおける情報の取り扱いは、それぞれのプライバシーポリシーに従います。本サービスでは、シェア操作を行ったこと自体を記録しません。"
            ]
          },
          {
            "title": "2-11. プロフィール情報",
            "paras": [
              "利用者が任意で設定するニックネーム、アイコン画像、自己紹介、出身国、在住国などを、プロフィールの表示に利用します。",
              "ニックネーム、アイコン画像、出身国、在住国は、ほかの利用者も閲覧できるプロフィールやユーザー一覧に表示されます。プロフィールには、本人が投稿した写真やレビューなども表示されます。",
              "チェックインした店舗の一覧は本人のアカウント画面にのみ表示し、ほかの利用者には公開しません。",
              "プロフィール情報はアカウント画面から変更できます。アカウントを削除した場合、プロフィール情報も削除します。アイコン画像は、写真投稿と同じCloudinaryに保存します。"
            ]
          },
          {
            "title": "2-12. フォロー情報・チェックイン数",
            "paras": [
              "フォローした相手やフォローした日時などの情報を、フォロー・フォロワーの一覧や件数の表示に利用します。誰が誰をフォローしているかは、ほかの利用者も閲覧できます。",
              "フォローはいつでも解除できます。アカウントを削除した場合、フォロー情報も削除します。",
              "また、チェックインの件数をプロフィールに表示します。チェックインした店舗の一覧は、本人にのみ公開します。"
            ]
          },
          {
            "title": "2-13. Cookie・アクセスログ",
            "paras": [
              "ログイン状態の保持、サービスの安定運用、利用状況の把握、不正利用の防止などのため、Cookieやアクセスログなどの情報を利用する場合があります。Firebaseなどの利用サービスが標準的に記録する情報を含みます。"
            ]
          },
          {
            "title": "2-14. お問い合わせ情報",
            "paras": [
              "お問い合わせフォームに入力されたお問い合わせの種類、お名前、メールアドレス、内容、送信日時を取得します。ログイン中に送信された場合は、アカウントIDも取得することがあります。",
              "これらの情報は、お問い合わせへの確認・回答のために利用し、Firebaseに保存します。閲覧できるのは運営者に限られます。対応終了後、保存の必要がなくなった情報は削除します。"
            ]
          }
        ]
      },
      {
        "title": "3. 情報の公開範囲",
        "paras": [
          "本サービスでは、機能に応じて情報の公開範囲が異なります。"
        ],
        "list": [
          {
            "label": "ほかの利用者に公開される情報：",
            "text": "公開対象となるTips、レビュー、コメント、写真、プロフィール情報、フォロー・フォロワーの一覧、チェックインの件数など"
          },
          {
            "label": "本人のみが閲覧できる情報：",
            "text": "保存した店舗、チェックインした店舗の一覧など"
          },
          {
            "label": "運営者が確認する情報：",
            "text": "新しいスポットの追加申請、お問い合わせ情報など"
          }
        ],
        "after": [
          "投稿やプロフィールを利用する際は、公開される情報の内容をご確認ください。"
        ]
      },
      {
        "title": "4. 情報の保存・管理と外部サービスの利用",
        "paras": [
          "本サービスでは、アカウント情報や投稿情報などの保存・管理に、Google LLCが提供するFirebaseを利用しています。また、アイコン画像や投稿写真の保存にはCloudinaryを利用しています。",
          "本サービスの機能によっては、Google翻訳やGoogle アナリティクスなどの外部サービスを利用します。翻訳機能では対象の文章をGoogleに送信する場合があり、Google アナリティクスでは利用状況に関する情報がGoogleに送信されます。",
          "各サービスにおける情報の取り扱いは、それぞれのプライバシーポリシーや利用条件に従います。"
        ]
      },
      {
        "title": "5. Cookie・アクセス解析について",
        "paras": [
          "本サービスでは、ログイン状態の保持やサービスの動作、利用状況の把握などのため、Cookieなどの技術を利用する場合があります。",
          "また、サービスの改善を目的として、Google LLCが提供するアクセス解析ツール「Google アナリティクス」を利用しています。Google アナリティクスは、Cookieなどを利用して利用状況に関する情報を収集し、Googleに送信します。",
          "収集・処理される情報の内容や取り扱いは、Googleのポリシーに従います。Google アナリティクスによる情報収集を希望しない場合は、以下のオプトアウト用アドオンを利用できます。"
        ],
        "list": [
          "Googleのプライバシーポリシー：https://policies.google.com/privacy",
          "Google アナリティクス オプトアウト アドオン：https://tools.google.com/dlpage/gaoptout"
        ],
        "after": [
          "ブラウザの設定でCookieを制限・削除できますが、その場合、本サービスの一部の機能が正しく動作しないことがあります。"
        ]
      },
      {
        "title": "6. 情報の保存期間・削除について",
        "paras": [
          "投稿したTips、チェックイン、レビュー、写真などは、各投稿の削除機能から削除できます。",
          "アカウント画面の「設定」から「アカウント設定」を開き、「アカウントの削除」を選択することで、いつでも退会できます。",
          "退会時には、アカウント情報、プロフィール、投稿（写真・レビュー・Tips・チェックイン・いいね・コメント）、送信したスポットの追加申請などを削除します。",
          "ただし、写真やアイコン画像のファイルは、画像保存サービスであるCloudinary上に残る場合があります。本サービス内では表示されなくなりますが、画像ファイルの削除を希望する場合や退会について相談したい場合は、下記のお問い合わせ窓口までご連絡ください。",
          "また、すでに地図に掲載された店舗情報は、店舗情報として本サービス内に残ります。"
        ]
      },
      {
        "title": "7. 第三者への情報提供について",
        "paras": [
          "本サービスは、法令に基づく場合などを除き、利用者の同意なく、取得した個人情報を第三者に提供しません。",
          "ただし、本ポリシーに記載した外部サービスの利用に伴い、機能の提供やアクセス解析などに必要な情報が各サービスに送信される場合があります。送信される情報やその取り扱いについては、各サービスに関する説明をご確認ください。"
        ]
      },
      {
        "title": "8. お問い合わせ窓口",
        "paras": [
          "本ポリシーや、本サービスにおける情報の取り扱いについて、ご質問・ご要望がある場合は、以下までお問い合わせください。"
        ],
        "list": [
          "メールアドレス：sales@compass-story.com"
        ]
      },
      {
        "title": "9. プライバシーポリシーの変更について",
        "paras": [
          "本ポリシーは、必要に応じて変更することがあります。変更後の内容は、本ページに掲載した時点から適用します。"
        ]
      }
    ],
    // 運営者情報ページ
    aboutPageTitle: "事業者情報",
    aboutIntro: "",
    aboutSections: [
      {
        "title": "サービス概要",
        "rows": [
          {
            "label": "サービス名",
            "value": [
              "ベトナムフーディー（Vietnam Foodie）"
            ]
          },
          {
            "label": "運営",
            "value": [
              "Compass Story（コンパスストーリー）"
            ]
          },
          {
            "label": "サービス内容",
            "value": [
              "ベトナムフーディーは、日本国内のベトナム料理店、ベトナム食材店、カフェなど、ベトナムに関連するお店やスポットを地図から検索できるWebサービスです。",
              "店舗情報や利用者の投稿を通じて、お店探しや新しいベトナムスポットとの出会いをサポートします。"
            ]
          }
        ]
      },
      {
        "title": "お問い合わせ",
        "paras": [
          "本サービスに関するご質問、ご意見、ご要望などは、以下のメールアドレスまたはお問い合わせフォームからお問い合わせください。"
        ],
        "rows": [
          {
            "label": "メールアドレス",
            "value": [
              "sales@compass-story.com"
            ],
            "link": "mailto:sales@compass-story.com"
          },
              {
                "label": "お問い合わせフォーム",
                "value": [
                  "お問い合わせフォームはこちら"
                ],
                "contact": true
              }
        ]
      }
    ],
    tipsTitle: "このお店のTips",
    tipsLoading: "Tipsを読み込んでいます…",
    tipsLoadError: "Tipsを読み込めませんでした",
    tipsRetry: "再読み込み",
    tipsEmpty: "まだTipsはありません。最初のTipsを追加してみませんか?",
    tipsAdd: "Tipsを追加する",
    tipsFormTitle: "このお店の良いところを選んでください(複数選択できます。投稿は、1人につき、1店舗1回です)",
    tipsSubmit: "送信する",
    tipsSending: "送信中…",
    tipsClose: "閉じる",
    tipsNoneSelected: "Tipsを1つ以上選んでください",
    tipsThanks: "Tipsを追加しました。ありがとうございます!",
    tipsSubmitError: "Tipsを送信できませんでした。通信状況を確認して、もう一度お試しください。",
    tipsPeople: (n) => `${n}人`,
    tipsLoginNeeded: "Tipsを追加するには、ログインしてください(1人につき、お店ごとに1回投稿できます)",
    tipsChecking: "投稿状況を確認しています…",
    tipsMineError: "投稿状況を確認できませんでした",
    tipsPosted: "このお店のTipsは投稿済みです。ありがとうございます!(投稿は、1人につき、お店ごとに1回です)",
    tipsMine: "あなたが選んだTips",
    tipsDenied: "Tipsを送信できませんでした。すでにこのお店のTipsを投稿済みの可能性があります。",
    tipsDeleted: "Tipsの投稿を削除しました。また投稿できます。",
    tipsDeleteError: "Tipsを削除できませんでした。もう一度お試しください。",
    statTips: "Tips",
    statCount: (n) => `${n}件`,
    deleteButton: "🗑️ 削除する",
    deleting: "削除中…",
    deleteConfirm: "本当に削除しますか?この操作は取り消せません。",
    authLogin: "Googleでログイン",
    authLogout: "ログアウト",
    authLoginError: "ログインできませんでした。もう一度お試しください。",
    authPopupBlocked: "ポップアップがブロックされました。ブラウザの設定で許可して、もう一度お試しください。",
    authUnsupported: "この開き方ではログインできません。http://localhost:8000 などで開いてください。",
    authNotEnabled: "Google ログインが有効になっていません(管理者の設定が必要です)。",
    authUnavailable: "ログイン機能を読み込めませんでした。通信状況を確認してください。",
    authLogoutError: "ログアウトできませんでした。もう一度お試しください。",
    authOpenLogin: "ログイン",
    authModalTitle: "ログイン",
    authOrDivider: "または",
    authEmailLabel: "メールアドレス",
    authPasswordLabel: "パスワード",
    authEmailLoginSubmit: "ログイン",
    authGoToRegister: "新規登録はこちら",
    authForgotPassword: "パスワードをお忘れですか?",
    authRegisterTitle: "新規登録",
    authNicknameLabel: "ニックネーム",
    authRegisterSubmit: "登録する",
    authGoToLogin: "ログインはこちら",
    authResetTitle: "パスワードの再設定",
    authResetDescription: "登録したメールアドレスに、パスワード再設定用のメールを送ります。",
    authResetSubmit: "送信する",
    authResetSent: "パスワード再設定用のメールを送りました。メールをご確認ください。",
    authBackToLogin: "← ログインに戻る",
    authSending: "送信中…",
    authFillFields: "メールアドレスとパスワードを入力してください。",
    authMissingNickname: "ニックネームを入力してください。",
    authErrInvalidEmail: "メールアドレスの形式が正しくありません。",
    authErrWeakPassword: "パスワードは6文字以上にしてください。",
    authErrEmailInUse: "そのメールアドレスは、すでに登録されています。",
    authErrWrongPassword: "メールアドレスもしくはパスワードに誤りがあります",
    authErrTooManyRequests: "しばらく時間をおいて、もう一度お試しください。",
    authErrNetwork: "通信に失敗しました。もう一度お試しください。",
    authErrGeneric: "エラーが発生しました。もう一度お試しください。",
    checkinTitle: "このお店にチェックイン",
    checkinButton: "チェックインする",
    checkinDone: "チェックイン済み",
    checkinSending: "チェックイン中…",
    checkinStatus: (n) => `${n}人がチェックイン済み`,
    checkinLoginNeeded: "チェックインするには、ログインしてください",
    checkinChecking: "確認しています…",
    checkinMineError: "チェックイン状況を確認できませんでした",
    checkinLoadError: "チェックイン人数を読み込めませんでした",
    checkinSuccess: "Check In Success!",
    checkinShareText: (name) => `${name}にチェックインしました`,
    checkinShareCopied: "共有用テキストをコピーしました",
    checkinShareCopyError: "共有用テキストをコピーできませんでした",
    checkinSubmitError: "チェックインできませんでした。もう一度お試しください。",
    checkinDenied: "チェックインできませんでした。すでにこのお店にチェックイン済みの可能性があります。",
    checkinDeleted: "チェックインを取り消しました。またチェックインできます。",
    checkinDeleteError: "チェックインの取り消しに失敗しました。もう一度お試しください。",
    reviewsTitle: "レビュー",
    reviewsEmpty: "⭐ まだレビューはありません",
    reviewWrite: "レビューを書く",
    reviewsLoading: "レビューを読み込んでいます…",
    reviewsLoadError: "レビューを読み込めませんでした",
    reviewsAverage: (avg, count) => `⭐ ${avg} (${count}件)`,
    reviewRatingLabel: "評価",
    reviewCommentLabel: "コメント(任意)",
    reviewSubmit: "投稿する",
    reviewSending: "投稿中…",
    reviewNoRating: "評価(星)を選んでください",
    reviewCommentTooLong: "コメントは500文字以内にしてください",
    reviewThanks: "レビューを投稿しました。ありがとうございます!",
    reviewPosted: "このお店にレビューを投稿済みです。ありがとうございます!(投稿は、1人につき、お店ごとに1回です)",
    reviewLoginNeeded: "レビューを投稿するには、ログインしてください(1人につき、お店ごとに1回投稿できます)",
    reviewDenied: "レビューを投稿できませんでした。すでにこのお店にレビューを投稿済みの可能性があります。",
    reviewDeleted: "レビューを削除しました。また投稿できます。",
    reviewDeleteError: "レビューの削除に失敗しました。もう一度お試しください。",
    reviewSubmitError: "レビューを送信できませんでした。通信状況を確認して、もう一度お試しください。",
    reviewNoComment: "コメントはありません",
    // 管理者(sales@compass-story.com)専用: Tips・Check-in・レビューの投稿を、非表示にする/元に戻す
    adminHide: "⚠️ 非表示にする",
    adminRestore: "🔁 元に戻す",
    adminHiddenBadge: "🙈 非表示中",
    adminTipsListTitle: "🛡 管理者用:Tips投稿一覧",
    adminCheckinListTitle: "🛡 管理者用:チェックイン一覧",
    adminListLoading: "投稿一覧を読み込んでいます…",
    adminListLoadError: "投稿一覧を読み込めませんでした",
    adminListEmpty: "投稿はまだありません",
    adminPosterLabel: (uid) => `投稿者ID: ${uid}`,
    adminUpdateError: "更新できませんでした。もう一度お試しください。",
    reportOpen: "⚠️ この店舗情報に問題があります",
    shareReviewTitle: "あなたのレビューをシェアしよう",
    shareReviewLead: "行ったお店の感想を、友だちや家族に教えよう",
    shareReviewButton: "シェアする",
    shareReviewText: (name) => `${name}｜ベトナムフーディーで見つけたお店`,
    shareReviewCopied: "シェアする文とリンクをコピーしました",
    reportTitle: "どんな問題ですか?",
    reportOptions: ["閉店している", "住所が違う", "営業時間が違う", "店舗名が違う", "写真が違う", "その他"],
    reportNote: "詳しい内容(任意)",
    reportSubmit: "報告する",
    reportClose: "閉じる",
    reportSoon: "報告機能は準備中です。今回入力された内容は、送信も保存もされていません。",
    filterDish: "料理",
    filterType: "種類",
    typeRestaurant: "🍜 料理店",
    typeGrocery: "🛒 食材店",
    typeCafe: "☕ カフェ",
    filterReset: "× 条件をリセット",
    filterSummary: "🔎 絞り込み",
    favOnly: "♡ 保存した店",
    noPhoto: "写真準備中",
    favAdd: "このお店を保存する",
    favRemove: "保存を外す",
    filterEmptyFav: "お気に入りのお店は、まだありません。お店の ♡ を押して登録できます",
    searchPlaceholder: "🔍 店名・エリア・料理名で検索",
    searchExample: "例: 新宿、池袋、横浜、千葉…",
    filterAll: "すべて",
    filterCount: (n) => `${n}件のお店を表示中`,
    filterEmpty: "この条件に合うお店は、まだ登録されていません",
  },
  en: {
    title: "Vietnam Foodie",
    tagline: "Discover Vietnam-related shops and spots in Japan.",
    listTitle: "Vietnamese restaurants, grocery stores & cafes",
    mapLink: "View on Google Maps",
    scanButton: "🔍 Scan",
    scanStatus: "Searching nearby shops…",
    scanOverlayBack: "← Back",
    scanOverlayTitle: "Nearby",
    scanOverlayEmpty: "No shops found in this area",
    sheetToggle: "Expand or shrink the shop list",
    listOverlayButton: (n) => `📋 View ${n} in a list`,
    resultWhat: (type, saved) =>
      (saved ? "Saved " : "") +
      ({ restaurant: "Vietnamese restaurants", grocery: "Vietnamese grocery stores", cafe: "Vietnamese cafes" }[type] ||
        "Vietnamese restaurants, grocery stores & cafes"),
    resultWhere: (kind, place) =>
      ({ default: "in the Kanto area", scan: "in this area", near: `near ${place}`, search: `for “${place}”`, place: `in ${place}` }[kind] || place),
    resultHeading: (where, what) => `${what} ${where}`,
    resultCount: (n) => String(n),
    areaPreviewSeparator: ", ",
    areaPreviewMore: ", and more",
    nearbyNote: "Your location is used to show Vietnamese restaurants and shops near you. Your location is not stored.",
    detailLink: "View details",
    mapBtn: "Show on map",
    detailBack: "← Back to list",
    detailNotFound: "Shop not found",
    detailNotFoundText: "Please check the URL, or find the shop from the list.",
    detailInfo: "Basic info",
    dtCategory: "Category",
    dtArea: "Area",
    dtAddress: "Address",
    dtDishes: "Dishes",
    notRegistered: "Not registered yet",
    straightLine: "(straight-line)",
    distanceFromHere: (d) => `About ${d} from your location`,
    distanceFromStart: (d) => `About ${d} from your starting point`,
    distanceButton: "📍 Show distance from my location",
    distanceLoading: "Getting your location…",
    distanceFailed: "Could not get your location, so the distance is not shown",
    mapTitle: "Map & route",
    mapRoute: "Get directions in Google Maps",
    photosTitle: "Photos from everyone",
    photosAdd: "Add a photo",
    photosNote: "Please only upload photos you took yourself, or that you have the right to share.",
    photosSubmit: "Post",
    photosUploading: "Uploading…",
    photosCompressing: "Processing image…",
    photosLoading: "Loading photos…",
    photosLoadError: "Couldn't load photos",
    photosEmpty: "📷 No photos yet. Be the first to add one!",
    photosThanks: "Your photo has been posted. Thank you!",
    photosUploadError: "Couldn't upload the photo. Check your connection and try again.",
    photosLoginNeeded: "Please log in to post a photo",
    photosDeleted: "Photo deleted.",
    photosDeleteError: "Couldn't delete the photo. Please try again.",
    photosFileTypeError: "Please choose an image file (jpg, png, webp, etc).",
    photosFileTooLargeError: "This image is still too large even after compression. Please try a different image.",
    photosCompressError: "Couldn't process this image. Please try a different image.",
    photosEnlarge: "Enlarge",
    // Required consent checkbox shown before posting (Terms of Service only; the other 4 items are folded into the notice below)
    photosConsentTermsPrefix: "I have read the ",
    photosConsentTermsSuffix: " and agree to the posting rules",
    // Posting form (photo box, description, destination, category)
    photosAddButton: "Add a photo",
    photosCancel: "Cancel",
    photosAddBoxText: "Add a photo",
    photosDescriptionPlaceholder: "Write a caption...",
    photosRemovePhoto: "Remove selected photo",
    photosAddMore: "Add",
    photosMaxNote: (max) => `You can choose up to ${max} photos per post`,
    photosPicked: (n, max) => `Selected photos ${n} / ${max}`,
    photosTooMany: "You can choose up to 5 photos per post. Photos beyond 5 were not added.",
    photosSubmitN: (n) => `Post ${n} photos`,
    photosUploadingN: (i, n) => `Uploading… (${i} / ${n})`,
    photosPartialError: "Some photos couldn't be uploaded. The remaining photos are still selected, so tap “Post” again.",
    photosPostingTo: "Posting to",
    photosCategoryTitle: "Choose a category",
    photosCategories: [
      { key: "dish", label: "Food" },
      { key: "interior", label: "Interior" },
      { key: "exterior", label: "Exterior" },
      { key: "people", label: "People" },
      { key: "menu", label: "Menu" },
    ],
    // Likes on photos
    photoLikeButton: "Like",
    photoLikeError: "Couldn't update your like. Please try again.",
    // Comments on photos
    photoCommentsTitle: "Comments",
    photoCommentsLoading: "Loading comments…",
    photoCommentsLoadError: "Couldn't load comments",
    photoCommentsEmpty: "No comments yet",
    photoCommentSubmit: "Post",
    photoCommentSending: "Sending…",
    photoCommentThanks: "Your comment has been posted. Thank you!",
    photoCommentError: "Couldn't send your comment. Check your connection and try again.",
    photoCommentLoginNeeded: "Please log in to post a comment",
    photoCommentEmpty: "Please enter a comment",
    photoCommentTooLong: "Comments must be 300 characters or fewer",
    photoCommentDeleted: "Comment deleted.",
    photoCommentDeleteError: "Couldn't delete the comment. Please try again.",
    // Short notice shown on the posting screen
    photosNoticeTitle: "📷 Before you post a photo",
    photosNoticeLines: [
      "Only post photos you took yourself, or that you have the right to post",
      "Do not repost someone else's photo from another site or social media without permission",
      "Please be mindful of privacy if people appear in the photo, and get their consent where needed",
      "Please check the photo does not contain personal information or infringe on someone else's rights",
      "Problematic photos may be reported and hidden or removed",
      "After review by the operator, a posted photo may be used as the shop's main image (photos showing prices, people or personal information are never used)",
    ],
    photosNoticeFooterPrefix: "For details, please see our ",
    photosNoticeFooterSuffix: ".",
    // Reporting a photo (available to everyone, no login required)
    reportPhotoButton: "🚩 Report this photo",
    reportPhotoTitle: "Please choose a reason",
    reportPhotoReasons: [
      { key: "copyright", label: "Copyright or rights issue" },
      { key: "person", label: "A person appears without permission" },
      { key: "privacy", label: "Contains personal information" },
      { key: "unrelated", label: "Not related to this shop" },
      { key: "inappropriate", label: "Inappropriate photo" },
      { key: "misleading", label: "Photo doesn't match reality" },
      { key: "other", label: "Other" },
    ],
    reportPhotoSubmit: "Report",
    reportPhotoSending: "Sending…",
    reportPhotoThanks: "Thanks for letting us know. We've received your report.",
    reportPhotoError: "Couldn't send your report. Check your connection and try again.",
    reportPhotoNoneSelected: "Please choose a reason",
    // Admin only: checking report counts and reasons on photos
    adminReportCount: (n) => `🚩 ${n} ${n === 1 ? "report" : "reports"}`,
    adminViewReports: "View report reasons",
    adminReportsLoading: "Loading report reasons…",
    adminReportsLoadError: "Couldn't load report reasons",
    adminReportsEmpty: "No reports yet",
    // Terms of Service page
    termsPageTitle: "Terms of Service",
    termsIntro:
      "Before using “Vietnam Foodie” (the “Service”), please read the following Terms of Service (the “Terms”). By using the Service, you are considered to have agreed to these Terms.",
    termsSections: [
      {
        title: "1. About the Service",
        body: "This Service is an information site introducing Vietnam-related shops and spots in Japan. Store information, photos, and reviews shown here are based on content from the operator and from user submissions.",
      },
      {
        title: "2. About user submissions",
        body: "Logged-in users can post photos, Tips (things they liked about a shop), reviews (a rating and comment), and check-ins. Submitted content is shown to other users. After review by the operator, a posted photo may be shown as the main image of that shop on its page and in lists. Photos showing prices (menus or price tags), people or personal information are never used as main images. If the poster deletes the photo or it is hidden, it is also removed as the main image. Logged-in users can also send information about places not yet listed to the operator via ‘Add a new spot’ in Settings. The operator reviews it and decides whether and how to list it (listing is not guaranteed, and the details may be checked and edited before listing).",
      },
      {
        title: "3. Photos you may post",
        body: "You may only post photos that meet one of the following:",
        list: [
          "Photos you took yourself",
          "Photos you have a legitimate right to post (for example, with the rights holder's permission)",
        ],
      },
      {
        title: "4. Prohibited submissions",
        body: "The following photos and submissions are prohibited. If found, they may be hidden or deleted.",
        list: [
          "Photos taken by someone else, reposted without permission",
          "Images copied without permission from other web services such as Google Maps",
          "Images copied without permission from a shop's official website or social media",
          "Other users' photos on this Service, reposted without permission",
          "Photos of a third person taken or posted without that person's permission",
          "Photos where personal information (such as a name, contact details, or a license plate) is legible",
          "Content that defames a specific person or organization",
          "Discriminatory content, or content intended to harass",
          "Sexual content",
          "Violent content",
          "Content that infringes on copyright, trademark, publicity rights, or other third-party rights",
          "False information that misrepresents the actual shop or food",
          "Anything else the operator determines is unsuitable for this Service",
        ],
      },
      {
        title: "5. Your responsibility as a poster",
        body: "You are responsible for the content of any photo or information you post. Before posting, please make sure it does not infringe on anyone else's rights.",
      },
      {
        title: "6. Copyright, publicity rights, and other third-party rights",
        body: "Copyright in a photo belongs to the person who took it. People who appear in a photo also have publicity rights (the right not to have their likeness taken or published without permission). Please take particular care in the following cases:",
        list: [
          "Shop staff appear in the photo: posting it in a way that identifies them requires their consent.",
          "Other customers appear in the photo: the same applies. If someone is captured incidentally, please consider blurring their face or cropping the photo before posting.",
        ],
      },
      {
        title: "7. Removing or hiding content",
        body: "You may delete your own submissions at any time (once deleted, you can post again). If a submission is found to violate these Terms, the operator may hide it at its discretion (the underlying data is not deleted immediately, pending review).",
      },
      {
        title: "8. Reports and removal requests",
        body: "If you feel another user's submission is a problem, you can report it with a reason from the ‘Report this photo’ option on each photo (no login required). The operator will review the report and decide how to respond. A report does not automatically hide the photo. If you would like a photo of yourself or your shop removed, please also use this report feature to let us know.",
      },
      {
        title: "9. Changes to or suspension of the Service",
        body: "The Service may be changed or temporarily suspended without prior notice.",
      },
      {
        title: "10. Disclaimer",
        body: "We try to keep the information, photos, and reviews on this Service accurate, but we cannot fully guarantee their accuracy or that they are up to date. We are not responsible for any trouble arising from your use of the Service.",
      },
      {
        title: "11. Changes to these Terms",
        body: "These Terms may be changed as needed. Any changes take effect once posted on this page.",
      },
    ],
    // Privacy Policy page
    privacyPageTitle: "Privacy Policy",
    privacyIntro: "“Vietnam Foodie” (the “Service”) handles users' personal information and information about their use of the Service as described below.",
    privacySections: [
      {
        "title": "1. Introduction",
        "paras": [
          "This policy explains what information the Service collects, why it is used, and how it is stored and managed. Please read it before using the Service."
        ]
      },
      {
        "title": "2. Information we collect and how we use it",
        "paras": [
          "To provide and operate its features, the Service collects and uses the following information."
        ],
        "subs": [
          {
            "title": "2-1. Login information",
            "paras": [
              "Your email address, Google account display name, account ID and similar information are used to manage your account and to show who posted content.",
              "If you sign in with an email address, emails needed to verify or change your email address or to reset your password are sent through Firebase in response to your actions."
            ]
          },
          {
            "title": "2-2. Information about suggested new spots",
            "paras": [
              "When you send a new spot from the settings screen, we collect the type of shop, shop name, address, nearest station, URL, notes, the date and time it was sent, and the sender's account ID.",
              "The operator uses this information to review the content and decide whether to list it on the Service. The information you send and your name are not shown to other users. If the spot is listed, it is published as shop information."
            ]
          },
          {
            "title": "2-3. Posts",
            "paras": [
              "The content and posting date of Tips, reviews, comments, check-ins, photos, likes and other posts are used to share shop information and to display it within the Service.",
              "For who can see your posts, see “3. Who can see your information”."
            ]
          },
          {
            "title": "2-4. Location and device orientation",
            "paras": [
              "If you allow it in your browser, your location is used to search for nearby shops, show your current location on the map, calculate the distance to shops, and similar purposes.",
              "Your location is used only on your device and is not stored on or sent to the Service's servers.",
              "The map's compass feature reads your device's orientation only when you press the compass button, to show directions on the map. Device orientation is not stored or sent either."
            ]
          },
          {
            "title": "2-5. Activity within the Service",
            "paras": [
              "Information such as shops you viewed, words you searched, types of shops you selected and features you viewed is used to provide recommendations.",
              "This information is stored in your browser and is not sent to the Service's servers. Recommendations are also calculated on your device.",
              "You can erase it by deleting this site's data in your browser settings."
            ]
          },
          {
            "title": "2-6. Saved shops",
            "paras": [
              "Shops you mark with the save icon are used to show them under “Saved shops” on your account screen.",
              "Saved shops are stored in Firebase, linked to the account you are signed in with, and can be seen only by you. They are not shown to other users. Press the save icon again to remove a shop. If you delete your account, your saved shops are also deleted.",
              "Shops saved in your browser in an earlier version may be moved to your account the first time you sign in."
            ]
          },
          {
            "title": "2-7. Travel List",
            "paras": [
              "The areas and types of shops you choose are used to show your Travel List and to provide recommendations.",
              "This information is stored in your browser and is not sent to the Service's servers. Your answers to the questions shown on the home screen, and the date used to decide when to ask again, are also stored in your browser.",
              "You can add, change or delete this information on the Travel List screen. Deleting this site's data in your browser also erases it."
            ]
          },
          {
            "title": "2-8. Usage guide",
            "paras": [
              "To show the usage guide appropriately, we store in your browser whether the guide has been shown. This information is not sent to the Service's servers."
            ]
          },
          {
            "title": "2-9. Translation",
            "paras": [
              "When you press “Translate” on a review, comment or similar text, that text is translated.",
              "If your browser can translate on your device, that feature is used. If it cannot, a Google Translate (Google LLC) page opens in a new tab and the text is sent to Google. In that case, Google handles the information under Google's privacy policy.",
              "Translation happens only when you request it; the Service does not translate automatically or store translations."
            ]
          },
          {
            "title": "2-10. Sharing",
            "paras": [
              "If you choose X, Facebook or LINE under “Share this page” on the home screen, the Service's URL and a short description are passed to that service's share screen.",
              "Each service handles the information under its own privacy policy. The Service does not record that you shared."
            ]
          },
          {
            "title": "2-11. Profile information",
            "paras": [
              "The nickname, icon image, self-introduction, home country, country of residence and similar information you choose to set are used to show your profile.",
              "Your nickname, icon image, home country and country of residence are shown on your profile and in the user list, which other users can see. Photos, reviews and other content you posted are also shown on your profile.",
              "The list of shops you checked in to is shown only on your own account screen and is not shown to other users.",
              "You can change your profile information on the account screen. If you delete your account, your profile information is also deleted. Icon images are stored in Cloudinary, the same service used for photo posts."
            ]
          },
          {
            "title": "2-12. Follows and number of check-ins",
            "paras": [
              "Information such as who you follow and when is used to show follow and follower lists and counts. Other users can see who follows whom.",
              "You can unfollow at any time. If you delete your account, your follow information is also deleted.",
              "The number of your check-ins is shown on your profile. The list of shops you checked in to is visible only to you."
            ]
          },
          {
            "title": "2-13. Cookies and access logs",
            "paras": [
              "Cookies, access logs and similar information may be used to keep you signed in, run the Service reliably, understand how it is used, and prevent misuse. This includes information that services we use, such as Firebase, record as standard."
            ]
          },
          {
            "title": "2-14. Inquiries",
            "paras": [
              "We collect the type of inquiry, name, email address, message and the date and time sent through the contact form. If you send it while signed in, your account ID may also be collected.",
              "This information is used to review and reply to your inquiry and is stored in Firebase. Only the operator can see it. Information that no longer needs to be kept after we have dealt with the inquiry is deleted."
            ]
          }
        ]
      },
      {
        "title": "3. Who can see your information",
        "paras": [
          "Who can see information depends on the feature."
        ],
        "list": [
          {
            "label": "Visible to other users:",
            "text": "public Tips, reviews, comments, photos, profile information, follow and follower lists, number of check-ins, etc."
          },
          {
            "label": "Visible only to you:",
            "text": "saved shops, the list of shops you checked in to, etc."
          },
          {
            "label": "Reviewed by the operator:",
            "text": "suggested new spots, inquiries, etc."
          }
        ],
        "after": [
          "When posting or using your profile, please check what information will be public."
        ]
      },
      {
        "title": "4. Storage, management and external services",
        "paras": [
          "The Service uses Firebase, provided by Google LLC, to store and manage account information, posts and other data. Icon images and posted photos are stored in Cloudinary.",
          "Some features use external services such as Google Translate and Google Analytics. The translation feature may send text to Google, and Google Analytics sends information about usage to Google.",
          "Each service handles information under its own privacy policy and terms."
        ]
      },
      {
        "title": "5. Cookies and analytics",
        "paras": [
          "The Service may use cookies and similar technologies to keep you signed in, make the Service work, understand how it is used, and similar purposes.",
          "To improve the Service, we use Google Analytics, an analytics tool provided by Google LLC. Google Analytics uses cookies and similar technologies to collect information about usage and sends it to Google.",
          "The information collected and processed and how it is handled follow Google's policies. If you do not want Google Analytics to collect information, you can use the opt-out add-on below."
        ],
        "list": [
          "Google Privacy Policy: https://policies.google.com/privacy",
          "Google Analytics Opt-out Browser Add-on: https://tools.google.com/dlpage/gaoptout"
        ],
        "after": [
          "You can restrict or delete cookies in your browser settings, but some features of the Service may then not work correctly."
        ]
      },
      {
        "title": "6. Retention and deletion",
        "paras": [
          "You can delete Tips, check-ins, reviews, photos and other posts with the delete function on each post.",
          "You can leave the Service at any time by opening “Settings” → “Account settings” on the account screen and choosing “Delete account”.",
          "When you leave, we delete your account information, profile, posts (photos, reviews, Tips, check-ins, likes, comments), the new spots you sent, and similar information.",
          "However, photo and icon image files may remain on Cloudinary, the image storage service. They will no longer be shown in the Service, but if you would like the image files deleted or want to talk to us about leaving, please contact us at the address below.",
          "Shop information already listed on the map remains in the Service as shop information."
        ]
      },
      {
        "title": "7. Disclosure to third parties",
        "paras": [
          "Except where required by law or similar cases, the Service does not provide personal information it has collected to third parties without your consent.",
          "However, when using the external services described in this policy, information needed to provide features, analyze access and similar purposes may be sent to those services. For what is sent and how it is handled, please see the explanation of each service."
        ]
      },
      {
        "title": "8. Contact",
        "paras": [
          "If you have questions or requests about this policy or how the Service handles information, please contact us below."
        ],
        "list": [
          "Email: sales@compass-story.com"
        ]
      },
      {
        "title": "9. Changes to this policy",
        "paras": [
          "We may change this policy as needed. Changes take effect from the time they are posted on this page."
        ]
      }
    ],
    // About page
    aboutPageTitle: "Business Information",
    aboutIntro: "",
    aboutSections: [
      {
        "title": "Service overview",
        "rows": [
          {
            "label": "Service name",
            "value": [
              "Vietnam Foodie (ベトナムフーディー)"
            ]
          },
          {
            "label": "Operator",
            "value": [
              "Compass Story"
            ]
          },
          {
            "label": "What we offer",
            "value": [
              "Vietnam Foodie is a web service for finding Vietnam-related shops and spots in Japan, such as Vietnamese restaurants, Vietnamese grocery stores and cafes, on a map.",
              "Through shop information and posts from users, we help you find shops and discover new Vietnamese spots."
            ]
          }
        ]
      },
      {
        "title": "Contact",
        "paras": [
          "For questions, feedback or requests about the Service, please contact us by email or through the contact form below."
        ],
        "rows": [
          {
            "label": "Email",
            "value": [
              "sales@compass-story.com"
            ],
            "link": "mailto:sales@compass-story.com"
          },
              {
                "label": "Contact form",
                "value": [
                  "Open the contact form"
                ],
                "contact": true
              }
        ]
      }
    ],
    tipsTitle: "Tips for this shop",
    tipsLoading: "Loading tips…",
    tipsLoadError: "Could not load tips",
    tipsRetry: "Reload",
    tipsEmpty: "No tips yet. Be the first to add one!",
    tipsAdd: "Add tips",
    tipsFormTitle: "Select what is good about this shop (you can choose several). You can submit tips once per shop.",
    tipsSubmit: "Submit",
    tipsSending: "Sending…",
    tipsClose: "Close",
    tipsNoneSelected: "Please select at least one tip",
    tipsThanks: "Your tips were added. Thank you!",
    tipsSubmitError: "Could not send your tips. Please check your connection and try again.",
    tipsPeople: (n) => `${n} ${n === 1 ? "person" : "people"}`,
    tipsLoginNeeded: "Please sign in to add tips (you can submit tips once per shop).",
    tipsChecking: "Checking your submission…",
    tipsMineError: "Could not check whether you have already submitted",
    tipsPosted: "You have already submitted tips for this shop. Thank you! (Once per shop.)",
    tipsMine: "Your choice",
    tipsDenied: "Could not send your tips. You may have already submitted tips for this shop.",
    tipsDeleted: "Your tips have been removed. You can submit again.",
    tipsDeleteError: "Couldn't remove your tips. Please try again.",
    statTips: "Tips",
    statCount: (n) => `${n}`,
    deleteButton: "🗑️ Delete",
    deleting: "Deleting…",
    deleteConfirm: "Are you sure you want to delete this? This can't be undone.",
    authLogin: "Sign in with Google",
    authLogout: "Sign out",
    authLoginError: "Could not sign in. Please try again.",
    authPopupBlocked: "The sign-in popup was blocked. Please allow popups in your browser and try again.",
    authUnsupported: "Sign-in does not work when the page is opened this way. Please open it via http://localhost:8000 or similar.",
    authNotEnabled: "Google sign-in is not enabled yet (the administrator needs to set it up).",
    authUnavailable: "Could not load sign-in. Please check your connection.",
    authLogoutError: "Could not sign out. Please try again.",
    authOpenLogin: "Sign in",
    authModalTitle: "Sign in",
    authOrDivider: "or",
    authEmailLabel: "Email address",
    authPasswordLabel: "Password",
    authEmailLoginSubmit: "Sign in",
    authGoToRegister: "Create an account",
    authForgotPassword: "Forgot your password?",
    authRegisterTitle: "Create an account",
    authNicknameLabel: "Nickname",
    authRegisterSubmit: "Sign up",
    authGoToLogin: "Back to sign in",
    authResetTitle: "Reset your password",
    authResetDescription: "We'll send a password reset link to your email address.",
    authResetSubmit: "Send",
    authResetSent: "We sent a password reset email. Please check your inbox.",
    authBackToLogin: "← Back to sign in",
    authSending: "Sending…",
    authFillFields: "Please enter your email address and password.",
    authMissingNickname: "Please enter a nickname.",
    authErrInvalidEmail: "That email address is not valid.",
    authErrWeakPassword: "Password must be at least 6 characters.",
    authErrEmailInUse: "That email address is already registered.",
    authErrWrongPassword: "The email address or password is incorrect",
    authErrTooManyRequests: "Please wait a moment and try again.",
    authErrNetwork: "Connection failed. Please try again.",
    authErrGeneric: "Something went wrong. Please try again.",
    checkinTitle: "Check in at this shop",
    checkinButton: "Check in",
    checkinDone: "Checked in",
    checkinSending: "Checking in…",
    checkinStatus: (n) => `${n} ${n === 1 ? "person has" : "people have"} checked in`,
    checkinLoginNeeded: "Please sign in to check in.",
    checkinChecking: "Checking…",
    checkinMineError: "Could not check your check-in status",
    checkinLoadError: "Could not load the number of check-ins",
    checkinSuccess: "Check In Success!",
    checkinShareText: (name) => `I checked in at ${name}!`,
    checkinShareCopied: "Copied the text to share.",
    checkinShareCopyError: "Could not copy the text to share.",
    checkinSubmitError: "Could not check in. Please try again.",
    checkinDenied: "Could not check in. You may have already checked in at this shop.",
    checkinDeleted: "Your check-in has been removed. You can check in again.",
    checkinDeleteError: "Couldn't remove your check-in. Please try again.",
    reviewsTitle: "Reviews",
    reviewsEmpty: "⭐ No reviews yet",
    reviewWrite: "Write a review",
    reviewsLoading: "Loading reviews…",
    reviewsLoadError: "Could not load reviews",
    reviewsAverage: (avg, count) => `⭐ ${avg} (${count} ${count === 1 ? "review" : "reviews"})`,
    reviewRatingLabel: "Rating",
    reviewCommentLabel: "Comment (optional)",
    reviewSubmit: "Submit",
    reviewSending: "Submitting…",
    reviewNoRating: "Please select a star rating",
    reviewCommentTooLong: "Please keep your comment under 500 characters",
    reviewThanks: "Your review was posted. Thank you!",
    reviewPosted: "You have already posted a review for this shop. Thank you! (Once per shop.)",
    reviewLoginNeeded: "Please sign in to post a review (you can post a review once per shop).",
    reviewDenied: "Could not post your review. You may have already reviewed this shop.",
    reviewDeleted: "Your review has been deleted. You can post again.",
    reviewDeleteError: "Couldn't delete your review. Please try again.",
    reviewSubmitError: "Could not send your review. Please check your connection and try again.",
    reviewNoComment: "No comment",
    // Admin only (sales@compass-story.com): hide/restore Tips, check-in, and review submissions
    adminHide: "⚠️ Hide",
    adminRestore: "🔁 Restore",
    adminHiddenBadge: "🙈 Hidden",
    adminTipsListTitle: "🛡 Admin: All Tips submissions",
    adminCheckinListTitle: "🛡 Admin: All check-ins",
    adminListLoading: "Loading submissions…",
    adminListLoadError: "Couldn't load submissions",
    adminListEmpty: "No submissions yet",
    adminPosterLabel: (uid) => `User ID: ${uid}`,
    adminUpdateError: "Couldn't update. Please try again.",
    reportOpen: "⚠️ There is a problem with this shop's info",
    shareReviewTitle: "Share your review",
    shareReviewLead: "Tell your friends and family what you thought of this place",
    shareReviewButton: "Share",
    shareReviewText: (name) => `${name} | found on Vietnam Foodie`,
    shareReviewCopied: "Copied the text and link to share",
    reportTitle: "What is the problem?",
    reportOptions: ["It is closed", "Wrong address", "Wrong opening hours", "Wrong name", "Wrong photo", "Other"],
    reportNote: "Details (optional)",
    reportSubmit: "Report",
    reportClose: "Close",
    reportSoon: "Reporting is coming soon. Nothing you entered has been sent or saved.",
    filterDish: "Dish",
    filterType: "Type",
    typeRestaurant: "🍜 Restaurants",
    typeGrocery: "🛒 Grocery stores",
    typeCafe: "☕ Cafes",
    filterReset: "× Reset filters",
    filterSummary: "🔎 Filters",
    favOnly: "♥ Favorites only",
    noPhoto: "Photo coming soon",
    favAdd: "Save this shop",
    favRemove: "Remove from saved",
    filterEmptyFav: "No favorites yet. Tap ♡ on a shop to add it",
    searchPlaceholder: "🔍 Search by name, area, or dish",
    searchExample: "e.g. Shinjuku, Ikebukuro, Yokohama, Chiba…",
    filterAll: "All",
    filterCount: (n) => (n === 1 ? "Showing 1 shop" : `Showing ${n} shops`),
    filterEmpty: "No shops are registered for this filter yet",
  },
  vi: {
    title: "Foodie Việt Nam",
    tagline: "Khám phá các quán và địa điểm liên quan đến Việt Nam tại Nhật Bản.",
    listTitle: "Quán ăn, tạp hóa & cà phê Việt",
    mapLink: "Xem trên Google Maps",
    scanButton: "🔍 Quét",
    scanStatus: "Đang tìm quán gần đây…",
    scanOverlayBack: "← Quay lại",
    scanOverlayTitle: "Quán gần đây",
    scanOverlayEmpty: "Không có quán nào trong khu vực này",
    sheetToggle: "Mở rộng hoặc thu nhỏ danh sách quán",
    listOverlayButton: (n) => `📋 Xem ${n} quán dạng danh sách`,
    resultWhat: (type, saved) =>
      ({ restaurant: "Quán ăn Việt", grocery: "Tiệm tạp hóa Việt", cafe: "Quán cà phê Việt" }[type] || "Quán ăn, tạp hóa & cà phê Việt") +
      (saved ? " đã lưu" : ""),
    resultWhere: (kind, place) =>
      ({ default: "ở vùng Kanto", scan: "ở khu vực này", near: `gần ${place}`, search: `cho “${place}”`, place: `ở ${place}` }[kind] || place),
    resultHeading: (where, what) => `${what} ${where}`,
    resultCount: (n) => `${n} quán`,
    areaPreviewSeparator: ", ",
    areaPreviewMore: " và các quán khác",
    nearbyNote: "Vị trí của bạn được dùng để hiển thị các quán Việt gần bạn. Vị trí không được lưu lại.",
    detailLink: "Xem chi tiết",
    mapBtn: "Xem trên bản đồ",
    detailBack: "← Quay lại danh sách",
    detailNotFound: "Không tìm thấy quán",
    detailNotFoundText: "Hãy kiểm tra lại URL hoặc tìm quán trong danh sách.",
    detailInfo: "Thông tin cơ bản",
    dtCategory: "Loại hình",
    dtArea: "Khu vực",
    dtAddress: "Địa chỉ",
    dtDishes: "Món ăn",
    notRegistered: "Chưa có thông tin",
    straightLine: "(đường thẳng)",
    distanceFromHere: (d) => `Cách vị trí của bạn khoảng ${d}`,
    distanceFromStart: (d) => `Cách điểm xuất phát khoảng ${d}`,
    distanceButton: "📍 Hiển thị khoảng cách từ vị trí của tôi",
    distanceLoading: "Đang lấy vị trí của bạn…",
    distanceFailed: "Không lấy được vị trí nên không hiển thị khoảng cách",
    mapTitle: "Bản đồ & đường đi",
    mapRoute: "Xem đường đi trên Google Maps",
    photosTitle: "Ảnh từ mọi người",
    photosAdd: "Thêm ảnh",
    photosNote: "Vui lòng chỉ tải lên ảnh do bạn tự chụp, hoặc ảnh bạn có quyền chia sẻ.",
    photosSubmit: "Đăng",
    photosUploading: "Đang tải lên…",
    photosCompressing: "Đang xử lý ảnh…",
    photosLoading: "Đang tải ảnh…",
    photosLoadError: "Không thể tải ảnh",
    photosEmpty: "📷 Chưa có ảnh nào. Hãy là người đầu tiên đăng ảnh!",
    photosThanks: "Đã đăng ảnh của bạn. Cảm ơn bạn!",
    photosUploadError: "Không thể tải ảnh lên. Vui lòng kiểm tra kết nối mạng và thử lại.",
    photosLoginNeeded: "Vui lòng đăng nhập để đăng ảnh",
    photosDeleted: "Đã xóa ảnh.",
    photosDeleteError: "Không thể xóa ảnh. Vui lòng thử lại.",
    photosFileTypeError: "Vui lòng chọn một tệp hình ảnh (jpg, png, webp, v.v.).",
    photosFileTooLargeError: "Ảnh này vẫn quá lớn dù đã nén. Vui lòng thử ảnh khác.",
    photosCompressError: "Không thể xử lý ảnh này. Vui lòng thử ảnh khác.",
    photosEnlarge: "Phóng to",
    // Xác nhận bắt buộc trước khi đăng (chỉ Điều khoản sử dụng; 4 mục còn lại đã gộp vào lưu ý bên dưới)
    photosConsentTermsPrefix: "Tôi đã đọc ",
    photosConsentTermsSuffix: " và đồng ý với các quy định đăng bài",
    // Biểu mẫu đăng ảnh (khung ảnh, mô tả, quán đăng ảnh, danh mục)
    photosAddButton: "Thêm ảnh",
    photosCancel: "Hủy",
    photosAddBoxText: "Thêm ảnh",
    photosDescriptionPlaceholder: "Viết mô tả...",
    photosRemovePhoto: "Bỏ ảnh đã chọn",
    photosAddMore: "Thêm",
    photosMaxNote: (max) => `Mỗi lần đăng có thể chọn tối đa ${max} ảnh`,
    photosPicked: (n, max) => `Ảnh đã chọn ${n} / ${max}`,
    photosTooMany: "Mỗi lần đăng chỉ chọn được tối đa 5 ảnh. Những ảnh vượt quá 5 chưa được thêm.",
    photosSubmitN: (n) => `Đăng ${n} ảnh`,
    photosUploadingN: (i, n) => `Đang tải lên… (${i} / ${n})`,
    photosPartialError: "Một số ảnh chưa tải lên được. Các ảnh còn lại vẫn đang được chọn, hãy nhấn “Đăng” lần nữa.",
    photosPostingTo: "Đăng cho quán",
    photosCategoryTitle: "Chọn danh mục",
    photosCategories: [
      { key: "dish", label: "Món ăn" },
      { key: "interior", label: "Không gian trong quán" },
      { key: "exterior", label: "Bên ngoài quán" },
      { key: "people", label: "Con người" },
      { key: "menu", label: "Thực đơn" },
    ],
    // Lượt thích trên ảnh
    photoLikeButton: "Thích",
    photoLikeError: "Không thể cập nhật lượt thích. Vui lòng thử lại.",
    // Bình luận trên ảnh
    photoCommentsTitle: "Bình luận",
    photoCommentsLoading: "Đang tải bình luận…",
    photoCommentsLoadError: "Không thể tải bình luận",
    photoCommentsEmpty: "Chưa có bình luận nào",
    photoCommentSubmit: "Gửi",
    photoCommentSending: "Đang gửi…",
    photoCommentThanks: "Đã đăng bình luận của bạn. Cảm ơn bạn!",
    photoCommentError: "Không thể gửi bình luận. Vui lòng kiểm tra kết nối mạng và thử lại.",
    photoCommentLoginNeeded: "Vui lòng đăng nhập để bình luận",
    photoCommentEmpty: "Vui lòng nhập bình luận",
    photoCommentTooLong: "Bình luận tối đa 300 ký tự",
    photoCommentDeleted: "Đã xóa bình luận.",
    photoCommentDeleteError: "Không thể xóa bình luận. Vui lòng thử lại.",
    // Lưu ý ngắn gọn hiển thị trên màn hình đăng ảnh
    photosNoticeTitle: "📷 Trước khi đăng ảnh",
    photosNoticeLines: [
      "Chỉ đăng ảnh do chính bạn chụp, hoặc ảnh bạn có quyền đăng",
      "Không đăng lại ảnh của người khác từ trang web hay mạng xã hội khi chưa được phép",
      "Nếu có người xuất hiện trong ảnh, vui lòng cân nhắc về quyền riêng tư và xin phép khi cần thiết",
      "Vui lòng kiểm tra ảnh không chứa thông tin cá nhân hoặc xâm phạm quyền của người khác",
      "Ảnh có vấn đề có thể bị báo cáo và bị ẩn hoặc xóa",
      "Sau khi đơn vị vận hành kiểm tra, ảnh đã đăng có thể được dùng làm ảnh chính của quán (không dùng ảnh có giá tiền, người hoặc thông tin cá nhân)",
    ],
    photosNoticeFooterPrefix: "Để biết chi tiết, vui lòng xem ",
    photosNoticeFooterSuffix: ".",
    // Báo cáo ảnh (ai cũng có thể dùng, không cần đăng nhập)
    reportPhotoButton: "🚩 Báo cáo ảnh này",
    reportPhotoTitle: "Vui lòng chọn lý do",
    reportPhotoReasons: [
      { key: "copyright", label: "Có vấn đề về bản quyền/quyền lợi" },
      { key: "person", label: "Có người xuất hiện mà không được phép" },
      { key: "privacy", label: "Chứa thông tin cá nhân" },
      { key: "unrelated", label: "Ảnh không liên quan đến quán" },
      { key: "inappropriate", label: "Ảnh không phù hợp" },
      { key: "misleading", label: "Nội dung ảnh khác với thực tế" },
      { key: "other", label: "Khác" },
    ],
    reportPhotoSubmit: "Báo cáo",
    reportPhotoSending: "Đang gửi…",
    reportPhotoThanks: "Đã nhận được báo cáo của bạn. Cảm ơn bạn đã hợp tác.",
    reportPhotoError: "Không thể gửi báo cáo. Vui lòng kiểm tra kết nối mạng và thử lại.",
    reportPhotoNoneSelected: "Vui lòng chọn lý do",
    // Chỉ dành cho quản trị viên: xem số lượt báo cáo và lý do của ảnh
    adminReportCount: (n) => `🚩 ${n} báo cáo`,
    adminViewReports: "Xem lý do báo cáo",
    adminReportsLoading: "Đang tải lý do báo cáo…",
    adminReportsLoadError: "Không thể tải lý do báo cáo",
    adminReportsEmpty: "Chưa có báo cáo nào",
    // Trang Điều khoản sử dụng
    termsPageTitle: "Điều khoản sử dụng",
    termsIntro:
      "Trước khi sử dụng “Vietnam Foodie” (gọi là “Dịch vụ”), vui lòng đọc kỹ Điều khoản sử dụng sau đây (gọi là “Điều khoản”). Khi sử dụng Dịch vụ, bạn được xem là đã đồng ý với Điều khoản này.",
    termsSections: [
      {
        title: "1. Về Dịch vụ",
        body: "Đây là trang thông tin giới thiệu các quán và địa điểm liên quan đến Việt Nam tại Nhật Bản. Thông tin quán, ảnh và đánh giá trên trang được xây dựng dựa trên nội dung của đơn vị vận hành và nội dung do người dùng đăng tải.",
      },
      {
        title: "2. Về nội dung người dùng đăng tải",
        body: "Người dùng đã đăng nhập có thể đăng ảnh, Tips (điểm tốt của quán), đánh giá (số sao và bình luận) và check-in. Nội dung đã đăng sẽ được hiển thị cho những người dùng khác. Sau khi đơn vị vận hành kiểm tra, ảnh đã đăng có thể được hiển thị làm ảnh chính của quán trên trang quán và trong danh sách. Ảnh có giá tiền (thực đơn, bảng giá), người hoặc thông tin cá nhân sẽ không được dùng làm ảnh chính. Nếu người đăng xóa ảnh hoặc ảnh bị ẩn, ảnh đó cũng sẽ không còn là ảnh chính. Ngoài ra, người dùng đã đăng nhập có thể gửi thông tin về quán chưa được đăng cho đơn vị vận hành qua mục “Thêm địa điểm mới” trong Cài đặt. Đơn vị vận hành sẽ kiểm tra và quyết định có đăng hay không và đăng nội dung nào (không đảm bảo sẽ được đăng, và nội dung có thể được kiểm tra, chỉnh sửa trước khi đăng).",
      },
      {
        title: "3. Ảnh có thể đăng",
        body: "Bạn chỉ có thể đăng những ảnh thuộc một trong các trường hợp sau:",
        list: [
          "Ảnh do chính bạn chụp",
          "Ảnh mà bạn có quyền hợp pháp để đăng (ví dụ: đã được người có quyền cho phép)",
        ],
      },
      {
        title: "4. Nội dung bị cấm đăng",
        body: "Các loại ảnh, nội dung sau đây bị cấm. Nếu phát hiện, nội dung có thể bị ẩn hoặc xóa.",
        list: [
          "Ảnh do người khác chụp, đăng lại mà không được phép",
          "Ảnh sao chép không phép từ các dịch vụ khác như Google Maps",
          "Ảnh sao chép không phép từ trang web chính thức, mạng xã hội của quán",
          "Ảnh của người dùng khác trên Dịch vụ này, đăng lại mà không được phép",
          "Ảnh chụp hoặc đăng người khác mà không được người đó cho phép",
          "Ảnh có thể đọc được thông tin cá nhân (tên, thông tin liên hệ, biển số xe, v.v.)",
          "Nội dung phỉ báng một cá nhân, tổ chức cụ thể",
          "Nội dung phân biệt đối xử, hoặc nhằm mục đích quấy rối",
          "Nội dung khiêu dâm",
          "Nội dung bạo lực",
          "Nội dung xâm phạm bản quyền, nhãn hiệu, quyền hình ảnh hoặc quyền khác của bên thứ ba",
          "Thông tin sai sự thật, khác với quán/món ăn thực tế",
          "Nội dung khác mà đơn vị vận hành cho là không phù hợp với Dịch vụ",
        ],
      },
      {
        title: "5. Trách nhiệm của người đăng",
        body: "Bạn chịu trách nhiệm về nội dung ảnh, thông tin mà mình đăng tải. Vui lòng kiểm tra kỹ trước khi đăng, để đảm bảo không xâm phạm quyền của người khác.",
      },
      {
        title: "6. Bản quyền, quyền hình ảnh và quyền của bên thứ ba",
        body: "Bản quyền ảnh thuộc về người chụp ảnh đó. Người xuất hiện trong ảnh cũng có quyền hình ảnh (quyền không bị chụp, đăng tải hình ảnh của mình mà không được phép). Đặc biệt, cần lưu ý trong các trường hợp sau:",
        list: [
          "Nhân viên quán xuất hiện trong ảnh: cần có sự đồng ý của người đó nếu đăng theo cách có thể nhận diện được cá nhân.",
          "Khách hàng khác xuất hiện trong ảnh: tương tự, cần có sự đồng ý của người đó. Nếu vô tình chụp phải, vui lòng cân nhắc làm mờ khuôn mặt hoặc cắt ảnh trước khi đăng.",
        ],
      },
      {
        title: "7. Xóa hoặc ẩn nội dung",
        body: "Bạn có thể xóa nội dung mình đã đăng bất cứ lúc nào (sau khi xóa, bạn có thể đăng lại). Nếu phát hiện nội dung vi phạm Điều khoản này, đơn vị vận hành có thể ẩn nội dung đó theo quyết định riêng (dữ liệu không bị xóa ngay mà sẽ được xem xét trước).",
      },
      {
        title: "8. Báo cáo và yêu cầu xóa",
        body: "Nếu bạn cảm thấy nội dung của người dùng khác có vấn đề, bạn có thể chọn lý do và báo cáo qua mục ‘Báo cáo ảnh này’ trên mỗi ảnh (không cần đăng nhập). Đơn vị vận hành sẽ xem xét nội dung báo cáo và quyết định cách xử lý. Báo cáo không đồng nghĩa với việc ảnh sẽ tự động bị ẩn. Nếu bạn muốn yêu cầu xóa ảnh có hình ảnh của bạn hoặc quán của bạn, cũng vui lòng liên hệ qua chức năng báo cáo này.",
      },
      {
        title: "9. Thay đổi hoặc tạm ngừng Dịch vụ",
        body: "Dịch vụ có thể được thay đổi hoặc tạm ngừng mà không cần báo trước.",
      },
      {
        title: "10. Miễn trừ trách nhiệm",
        body: "Chúng tôi cố gắng đảm bảo thông tin, ảnh và đánh giá trên Dịch vụ là chính xác, nhưng không thể đảm bảo hoàn toàn về tính chính xác hay tính cập nhật của chúng. Chúng tôi không chịu trách nhiệm về bất kỳ rắc rối nào phát sinh từ việc sử dụng Dịch vụ.",
      },
      {
        title: "11. Thay đổi Điều khoản",
        body: "Điều khoản này có thể được thay đổi khi cần thiết. Điều khoản sau khi thay đổi sẽ có hiệu lực kể từ khi được đăng trên trang này.",
      },
    ],
    // Trang Chính sách quyền riêng tư
    privacyPageTitle: "Chính sách quyền riêng tư",
    privacyIntro: "“Vietnam Foodie” (sau đây gọi là “Dịch vụ”) xử lý thông tin cá nhân của người dùng và thông tin về việc sử dụng Dịch vụ như sau.",
    privacySections: [
      {
        "title": "1. Giới thiệu",
        "paras": [
          "Chính sách này giải thích Dịch vụ thu thập những thông tin gì, sử dụng vào mục đích gì và lưu trữ, quản lý như thế nào. Vui lòng đọc trước khi sử dụng Dịch vụ."
        ]
      },
      {
        "title": "2. Thông tin thu thập và mục đích sử dụng",
        "paras": [
          "Để cung cấp và vận hành các tính năng, Dịch vụ thu thập và sử dụng các thông tin sau."
        ],
        "subs": [
          {
            "title": "2-1. Thông tin đăng nhập",
            "paras": [
              "Địa chỉ email, tên hiển thị của tài khoản Google, ID tài khoản và các thông tin tương tự được dùng để quản lý tài khoản và hiển thị người đăng bài.",
              "Nếu bạn đăng nhập bằng email, theo thao tác của bạn, chúng tôi gửi qua cơ chế của Firebase các email cần thiết để xác minh hoặc thay đổi địa chỉ email và đặt lại mật khẩu."
            ]
          },
          {
            "title": "2-2. Thông tin về địa điểm mới đề xuất",
            "paras": [
              "Khi bạn gửi địa điểm mới từ màn hình cài đặt, chúng tôi thu thập loại cửa hàng, tên quán, địa chỉ, ga gần nhất, URL, ghi chú, thời điểm gửi và ID tài khoản của người gửi.",
              "Đơn vị vận hành dùng thông tin này để kiểm tra nội dung và quyết định có đăng lên Dịch vụ hay không. Thông tin đã gửi và tên người gửi không được công khai cho người dùng khác. Nếu được đăng, địa điểm sẽ được công khai dưới dạng thông tin cửa hàng."
            ]
          },
          {
            "title": "2-3. Bài đăng",
            "paras": [
              "Nội dung và thời điểm đăng của Tips, đánh giá, bình luận, check-in, ảnh, lượt thích và các bài đăng khác được dùng để chia sẻ thông tin cửa hàng và hiển thị trong Dịch vụ.",
              "Về phạm vi công khai của bài đăng, vui lòng xem “3. Phạm vi công khai thông tin”."
            ]
          },
          {
            "title": "2-4. Vị trí và hướng của thiết bị",
            "paras": [
              "Nếu bạn cho phép trên trình duyệt, vị trí của bạn được dùng để tìm quán gần đây, hiển thị vị trí hiện tại trên bản đồ, tính khoảng cách đến quán và các mục đích tương tự.",
              "Vị trí chỉ được dùng trên thiết bị của bạn, không được lưu hay gửi đến máy chủ của Dịch vụ.",
              "Tính năng la bàn trên bản đồ chỉ đọc hướng của thiết bị khi bạn nhấn nút la bàn, để hiển thị phương hướng trên bản đồ. Hướng của thiết bị cũng không được lưu hay gửi đi."
            ]
          },
          {
            "title": "2-5. Hoạt động trong Dịch vụ",
            "paras": [
              "Các thông tin như quán đã xem, từ khóa đã tìm, loại cửa hàng đã chọn và chuyên đề đã xem được dùng để cung cấp tính năng gợi ý.",
              "Thông tin này được lưu trong trình duyệt và không gửi đến máy chủ của Dịch vụ. Việc tính toán gợi ý cũng được thực hiện trên thiết bị.",
              "Bạn có thể xóa bằng cách xóa dữ liệu trang web này trong cài đặt trình duyệt."
            ]
          },
          {
            "title": "2-6. Quán đã lưu",
            "paras": [
              "Các quán bạn nhấn biểu tượng lưu được dùng để hiển thị trong “Quán đã lưu” trên màn hình tài khoản.",
              "Quán đã lưu được lưu trên Firebase, gắn với tài khoản đang đăng nhập, và chỉ bạn xem được. Không công khai cho người dùng khác. Nhấn lại biểu tượng lưu để bỏ lưu. Nếu bạn xóa tài khoản, quán đã lưu cũng bị xóa.",
              "Các quán đã lưu trong trình duyệt ở phiên bản trước có thể được chuyển sang tài khoản khi bạn đăng nhập lần đầu."
            ]
          },
          {
            "title": "2-7. Travel List",
            "paras": [
              "Khu vực và loại cửa hàng bạn chọn được dùng để hiển thị Travel List và cung cấp gợi ý.",
              "Thông tin này được lưu trong trình duyệt và không gửi đến máy chủ của Dịch vụ. Câu trả lời cho các câu hỏi hiển thị trên trang chủ và thời điểm dùng để quyết định khi nào hỏi lại cũng được lưu trong trình duyệt.",
              "Bạn có thể thêm, thay đổi hoặc xóa trên màn hình Travel List. Xóa dữ liệu trang web trong trình duyệt cũng sẽ xóa thông tin này."
            ]
          },
          {
            "title": "2-8. Hướng dẫn sử dụng",
            "paras": [
              "Để hiển thị hướng dẫn sử dụng phù hợp, chúng tôi lưu trong trình duyệt thông tin về việc hướng dẫn đã được hiển thị hay chưa. Thông tin này không gửi đến máy chủ của Dịch vụ."
            ]
          },
          {
            "title": "2-9. Dịch",
            "paras": [
              "Khi bạn nhấn “Dịch” ở đánh giá, bình luận hoặc văn bản tương tự, văn bản đó sẽ được dịch.",
              "Nếu trình duyệt có thể dịch ngay trên thiết bị, tính năng đó sẽ được dùng. Nếu không, trang Google Dịch (Google LLC) sẽ mở trong tab mới và văn bản được gửi đến Google. Khi đó, Google xử lý thông tin theo chính sách quyền riêng tư của Google.",
              "Việc dịch chỉ diễn ra khi bạn yêu cầu; Dịch vụ không tự động dịch hay lưu bản dịch."
            ]
          },
          {
            "title": "2-10. Chia sẻ",
            "paras": [
              "Nếu bạn chọn X, Facebook hoặc LINE ở “Chia sẻ trang này” trên trang chủ, URL của Dịch vụ và một đoạn giới thiệu ngắn sẽ được chuyển đến màn hình chia sẻ của dịch vụ đó.",
              "Mỗi dịch vụ xử lý thông tin theo chính sách quyền riêng tư riêng. Dịch vụ không ghi lại việc bạn đã chia sẻ."
            ]
          },
          {
            "title": "2-11. Thông tin hồ sơ",
            "paras": [
              "Biệt danh, ảnh đại diện, giới thiệu bản thân, quốc gia xuất thân, quốc gia đang sống và các thông tin tương tự mà bạn tự chọn thiết lập được dùng để hiển thị hồ sơ.",
              "Biệt danh, ảnh đại diện, quốc gia xuất thân và quốc gia đang sống được hiển thị trên hồ sơ và danh sách người dùng mà người dùng khác cũng xem được. Ảnh, đánh giá và nội dung khác bạn đã đăng cũng hiển thị trên hồ sơ.",
              "Danh sách quán bạn đã check-in chỉ hiển thị trên màn hình tài khoản của bạn và không công khai cho người dùng khác.",
              "Bạn có thể thay đổi thông tin hồ sơ trên màn hình tài khoản. Nếu xóa tài khoản, thông tin hồ sơ cũng bị xóa. Ảnh đại diện được lưu trên Cloudinary, giống như ảnh đăng bài."
            ]
          },
          {
            "title": "2-12. Theo dõi và số lần check-in",
            "paras": [
              "Thông tin như người bạn theo dõi và thời điểm theo dõi được dùng để hiển thị danh sách và số lượng Đang theo dõi / Người theo dõi. Người dùng khác cũng xem được ai theo dõi ai.",
              "Bạn có thể bỏ theo dõi bất cứ lúc nào. Nếu xóa tài khoản, thông tin theo dõi cũng bị xóa.",
              "Số lần check-in được hiển thị trên hồ sơ. Danh sách quán đã check-in chỉ công khai cho riêng bạn."
            ]
          },
          {
            "title": "2-13. Cookie và nhật ký truy cập",
            "paras": [
              "Cookie, nhật ký truy cập và thông tin tương tự có thể được dùng để duy trì trạng thái đăng nhập, vận hành ổn định, nắm bắt tình hình sử dụng và ngăn chặn hành vi lạm dụng. Bao gồm cả thông tin mà các dịch vụ chúng tôi sử dụng như Firebase ghi lại theo tiêu chuẩn."
            ]
          },
          {
            "title": "2-14. Thông tin liên hệ",
            "paras": [
              "Chúng tôi thu thập loại câu hỏi, họ tên, địa chỉ email, nội dung và thời điểm gửi được nhập vào biểu mẫu liên hệ. Nếu gửi khi đang đăng nhập, ID tài khoản cũng có thể được thu thập.",
              "Thông tin này được dùng để kiểm tra và trả lời câu hỏi, và được lưu trên Firebase. Chỉ đơn vị vận hành xem được. Thông tin không còn cần lưu sau khi xử lý xong sẽ bị xóa."
            ]
          }
        ]
      },
      {
        "title": "3. Phạm vi công khai thông tin",
        "paras": [
          "Phạm vi công khai thông tin khác nhau tùy theo tính năng."
        ],
        "list": [
          {
            "label": "Công khai cho người dùng khác:",
            "text": "Tips, đánh giá, bình luận, ảnh công khai, thông tin hồ sơ, danh sách Đang theo dõi / Người theo dõi, số lần check-in, v.v."
          },
          {
            "label": "Chỉ bạn xem được:",
            "text": "quán đã lưu, danh sách quán đã check-in, v.v."
          },
          {
            "label": "Đơn vị vận hành kiểm tra:",
            "text": "đề xuất địa điểm mới, thông tin liên hệ, v.v."
          }
        ],
        "after": [
          "Khi đăng bài hoặc sử dụng hồ sơ, vui lòng kiểm tra những thông tin sẽ được công khai."
        ]
      },
      {
        "title": "4. Lưu trữ, quản lý và dịch vụ bên ngoài",
        "paras": [
          "Dịch vụ sử dụng Firebase do Google LLC cung cấp để lưu trữ và quản lý thông tin tài khoản, bài đăng và dữ liệu khác. Ảnh đại diện và ảnh đăng bài được lưu trên Cloudinary.",
          "Một số tính năng sử dụng dịch vụ bên ngoài như Google Dịch và Google Analytics. Tính năng dịch có thể gửi văn bản đến Google, và Google Analytics gửi thông tin về tình hình sử dụng đến Google.",
          "Mỗi dịch vụ xử lý thông tin theo chính sách quyền riêng tư và điều khoản riêng."
        ]
      },
      {
        "title": "5. Cookie và phân tích truy cập",
        "paras": [
          "Dịch vụ có thể sử dụng cookie và các công nghệ tương tự để duy trì trạng thái đăng nhập, giúp Dịch vụ hoạt động, nắm bắt tình hình sử dụng và các mục đích tương tự.",
          "Để cải thiện Dịch vụ, chúng tôi sử dụng Google Analytics, công cụ phân tích truy cập do Google LLC cung cấp. Google Analytics dùng cookie và công nghệ tương tự để thu thập thông tin về tình hình sử dụng và gửi đến Google.",
          "Nội dung thông tin được thu thập, xử lý và cách xử lý tuân theo chính sách của Google. Nếu không muốn Google Analytics thu thập thông tin, bạn có thể dùng tiện ích chặn dưới đây."
        ],
        "list": [
          "Chính sách quyền riêng tư của Google: https://policies.google.com/privacy",
          "Google Analytics Opt-out Browser Add-on: https://tools.google.com/dlpage/gaoptout"
        ],
        "after": [
          "Bạn có thể hạn chế hoặc xóa cookie trong cài đặt trình duyệt, nhưng khi đó một số tính năng của Dịch vụ có thể không hoạt động đúng."
        ]
      },
      {
        "title": "6. Thời gian lưu trữ và xóa",
        "paras": [
          "Bạn có thể xóa Tips, check-in, đánh giá, ảnh và các bài đăng khác bằng chức năng xóa ở từng bài đăng.",
          "Bạn có thể rời Dịch vụ bất cứ lúc nào bằng cách mở “Cài đặt” → “Cài đặt tài khoản” trên màn hình tài khoản và chọn “Xóa tài khoản”.",
          "Khi rời Dịch vụ, chúng tôi xóa thông tin tài khoản, hồ sơ, bài đăng (ảnh, đánh giá, Tips, check-in, lượt thích, bình luận), các địa điểm mới bạn đã gửi và thông tin tương tự.",
          "Tuy nhiên, tệp ảnh và ảnh đại diện có thể vẫn còn trên Cloudinary, dịch vụ lưu trữ ảnh. Chúng sẽ không còn hiển thị trong Dịch vụ, nhưng nếu bạn muốn xóa tệp ảnh hoặc muốn trao đổi về việc rời Dịch vụ, vui lòng liên hệ địa chỉ bên dưới.",
          "Thông tin cửa hàng đã được đăng trên bản đồ vẫn còn trong Dịch vụ dưới dạng thông tin cửa hàng."
        ]
      },
      {
        "title": "7. Cung cấp thông tin cho bên thứ ba",
        "paras": [
          "Trừ trường hợp theo quy định của pháp luật hoặc tương tự, Dịch vụ không cung cấp thông tin cá nhân đã thu thập cho bên thứ ba khi chưa có sự đồng ý của bạn.",
          "Tuy nhiên, khi sử dụng các dịch vụ bên ngoài được nêu trong chính sách này, thông tin cần thiết để cung cấp tính năng, phân tích truy cập và các mục đích tương tự có thể được gửi đến các dịch vụ đó. Về thông tin được gửi và cách xử lý, vui lòng xem phần giải thích về từng dịch vụ."
        ]
      },
      {
        "title": "8. Liên hệ",
        "paras": [
          "Nếu bạn có câu hỏi hoặc yêu cầu về chính sách này hoặc cách Dịch vụ xử lý thông tin, vui lòng liên hệ bên dưới."
        ],
        "list": [
          "Email: sales@compass-story.com"
        ]
      },
      {
        "title": "9. Thay đổi chính sách",
        "paras": [
          "Chúng tôi có thể thay đổi chính sách này khi cần. Nội dung sau khi thay đổi có hiệu lực từ thời điểm được đăng trên trang này."
        ]
      }
    ],
    // Trang thông tin đơn vị vận hành
    aboutPageTitle: "Thông tin doanh nghiệp",
    aboutIntro: "",
    aboutSections: [
      {
        "title": "Tổng quan dịch vụ",
        "rows": [
          {
            "label": "Tên dịch vụ",
            "value": [
              "Vietnam Foodie (ベトナムフーディー)"
            ]
          },
          {
            "label": "Đơn vị vận hành",
            "value": [
              "Compass Story"
            ]
          },
          {
            "label": "Nội dung dịch vụ",
            "value": [
              "Vietnam Foodie là dịch vụ web giúp bạn tìm trên bản đồ các cửa hàng và địa điểm liên quan đến Việt Nam tại Nhật Bản, như nhà hàng Việt Nam, cửa hàng thực phẩm Việt Nam và quán cà phê.",
              "Thông qua thông tin cửa hàng và bài đăng của người dùng, chúng tôi hỗ trợ bạn tìm quán và khám phá những địa điểm Việt Nam mới."
            ]
          }
        ]
      },
      {
        "title": "Liên hệ",
        "paras": [
          "Nếu bạn có câu hỏi, ý kiến hoặc yêu cầu về Dịch vụ, vui lòng liên hệ qua địa chỉ email hoặc biểu mẫu liên hệ dưới đây."
        ],
        "rows": [
          {
            "label": "Email",
            "value": [
              "sales@compass-story.com"
            ],
            "link": "mailto:sales@compass-story.com"
          },
              {
                "label": "Biểu mẫu liên hệ",
                "value": [
                  "Mở biểu mẫu liên hệ"
                ],
                "contact": true
              }
        ]
      }
    ],
    tipsTitle: "Mẹo về quán này",
    tipsLoading: "Đang tải mẹo…",
    tipsLoadError: "Không thể tải mẹo",
    tipsRetry: "Tải lại",
    tipsEmpty: "Chưa có mẹo nào. Hãy là người đầu tiên thêm mẹo!",
    tipsAdd: "Thêm mẹo",
    tipsFormTitle: "Hãy chọn những điểm tốt của quán này (có thể chọn nhiều). Mỗi người chỉ gửi mẹo một lần cho mỗi quán.",
    tipsSubmit: "Gửi",
    tipsSending: "Đang gửi…",
    tipsClose: "Đóng",
    tipsNoneSelected: "Vui lòng chọn ít nhất một mẹo",
    tipsSubmitError: "Không thể gửi mẹo. Vui lòng kiểm tra kết nối và thử lại.",
    tipsThanks: "Đã thêm mẹo. Cảm ơn bạn!",
    tipsPeople: (n) => `${n} người`,
    tipsLoginNeeded: "Vui lòng đăng nhập để thêm mẹo (mỗi người chỉ gửi một lần cho mỗi quán).",
    tipsChecking: "Đang kiểm tra trạng thái gửi…",
    tipsMineError: "Không thể kiểm tra bạn đã gửi mẹo hay chưa",
    tipsPosted: "Bạn đã gửi mẹo cho quán này. Cảm ơn bạn! (Mỗi người một lần cho mỗi quán.)",
    tipsMine: "Lựa chọn của bạn",
    tipsDenied: "Không thể gửi mẹo. Có thể bạn đã gửi mẹo cho quán này rồi.",
    tipsDeleted: "Đã xóa mẹo của bạn. Bạn có thể gửi lại.",
    tipsDeleteError: "Không thể xóa mẹo của bạn. Vui lòng thử lại.",
    statTips: "Mẹo",
    statCount: (n) => `${n}`,
    deleteButton: "🗑️ Xóa",
    deleting: "Đang xóa…",
    deleteConfirm: "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
    authLogin: "Đăng nhập bằng Google",
    authLogout: "Đăng xuất",
    authLoginError: "Không thể đăng nhập. Vui lòng thử lại.",
    authPopupBlocked: "Cửa sổ đăng nhập bị chặn. Vui lòng cho phép cửa sổ bật lên trong trình duyệt và thử lại.",
    authUnsupported: "Không thể đăng nhập khi mở trang theo cách này. Vui lòng mở qua http://localhost:8000 hoặc tương tự.",
    authNotEnabled: "Đăng nhập Google chưa được bật (cần quản trị viên thiết lập).",
    authUnavailable: "Không thể tải chức năng đăng nhập. Vui lòng kiểm tra kết nối.",
    authLogoutError: "Không thể đăng xuất. Vui lòng thử lại.",
    authOpenLogin: "Đăng nhập",
    authModalTitle: "Đăng nhập",
    authOrDivider: "hoặc",
    authEmailLabel: "Địa chỉ email",
    authPasswordLabel: "Mật khẩu",
    authEmailLoginSubmit: "Đăng nhập",
    authGoToRegister: "Đăng ký tài khoản mới",
    authForgotPassword: "Quên mật khẩu?",
    authRegisterTitle: "Đăng ký tài khoản",
    authNicknameLabel: "Biệt danh",
    authRegisterSubmit: "Đăng ký",
    authGoToLogin: "Quay lại đăng nhập",
    authResetTitle: "Đặt lại mật khẩu",
    authResetDescription: "Chúng tôi sẽ gửi email đặt lại mật khẩu đến địa chỉ email của bạn.",
    authResetSubmit: "Gửi",
    authResetSent: "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
    authBackToLogin: "← Quay lại đăng nhập",
    authSending: "Đang gửi…",
    authFillFields: "Vui lòng nhập địa chỉ email và mật khẩu.",
    authMissingNickname: "Vui lòng nhập biệt danh.",
    authErrInvalidEmail: "Địa chỉ email không hợp lệ.",
    authErrWeakPassword: "Mật khẩu phải có ít nhất 6 ký tự.",
    authErrEmailInUse: "Địa chỉ email này đã được đăng ký.",
    authErrWrongPassword: "Email hoặc mật khẩu không chính xác",
    authErrTooManyRequests: "Vui lòng đợi một chút rồi thử lại.",
    authErrNetwork: "Kết nối thất bại. Vui lòng thử lại.",
    authErrGeneric: "Đã xảy ra lỗi. Vui lòng thử lại.",
    checkinTitle: "Check-in tại quán này",
    checkinButton: "Check-in",
    checkinDone: "Đã check-in",
    checkinSending: "Đang check-in…",
    checkinStatus: (n) => `${n} người đã check-in`,
    checkinLoginNeeded: "Vui lòng đăng nhập để check-in.",
    checkinChecking: "Đang kiểm tra…",
    checkinMineError: "Không thể kiểm tra trạng thái check-in của bạn",
    checkinLoadError: "Không thể tải số lượt check-in",
    checkinSuccess: "Check In Success!",
    checkinShareText: (name) => `Tôi vừa check-in tại ${name}!`,
    checkinShareCopied: "Đã sao chép văn bản để chia sẻ.",
    checkinShareCopyError: "Không thể sao chép văn bản để chia sẻ.",
    checkinSubmitError: "Không thể check-in. Vui lòng thử lại.",
    checkinDenied: "Không thể check-in. Có thể bạn đã check-in tại quán này rồi.",
    checkinDeleted: "Đã hủy check-in của bạn. Bạn có thể check-in lại.",
    checkinDeleteError: "Không thể hủy check-in của bạn. Vui lòng thử lại.",
    reviewsTitle: "Đánh giá",
    reviewsEmpty: "⭐ Chưa có đánh giá",
    reviewWrite: "Viết đánh giá",
    reviewsLoading: "Đang tải đánh giá…",
    reviewsLoadError: "Không thể tải đánh giá",
    reviewsAverage: (avg, count) => `⭐ ${avg} (${count} đánh giá)`,
    reviewRatingLabel: "Đánh giá",
    reviewCommentLabel: "Bình luận (không bắt buộc)",
    reviewSubmit: "Gửi",
    reviewSending: "Đang gửi…",
    reviewNoRating: "Vui lòng chọn số sao đánh giá",
    reviewCommentTooLong: "Vui lòng nhập bình luận dưới 500 ký tự",
    reviewThanks: "Đã đăng đánh giá. Cảm ơn bạn!",
    reviewPosted: "Bạn đã đánh giá quán này rồi. Cảm ơn bạn! (Mỗi người một lần cho mỗi quán.)",
    reviewLoginNeeded: "Vui lòng đăng nhập để đăng đánh giá (mỗi người chỉ đăng một lần cho mỗi quán).",
    reviewDenied: "Không thể đăng đánh giá. Có thể bạn đã đánh giá quán này rồi.",
    reviewDeleted: "Đã xóa đánh giá của bạn. Bạn có thể đăng lại.",
    reviewDeleteError: "Không thể xóa đánh giá của bạn. Vui lòng thử lại.",
    reviewSubmitError: "Không thể gửi đánh giá. Vui lòng kiểm tra kết nối và thử lại.",
    reviewNoComment: "Không có bình luận",
    // Chỉ dành cho quản trị viên (sales@compass-story.com): ẩn/khôi phục bài Tips, check-in, đánh giá
    adminHide: "⚠️ Ẩn",
    adminRestore: "🔁 Khôi phục",
    adminHiddenBadge: "🙈 Đang ẩn",
    adminTipsListTitle: "🛡 Quản trị: Danh sách Tips",
    adminCheckinListTitle: "🛡 Quản trị: Danh sách check-in",
    adminListLoading: "Đang tải danh sách…",
    adminListLoadError: "Không thể tải danh sách",
    adminListEmpty: "Chưa có bài đăng nào",
    adminPosterLabel: (uid) => `ID người dùng: ${uid}`,
    adminUpdateError: "Không thể cập nhật. Vui lòng thử lại.",
    reportOpen: "⚠️ Thông tin quán này có vấn đề",
    shareReviewTitle: "Chia sẻ đánh giá của bạn",
    shareReviewLead: "Kể cho bạn bè và gia đình cảm nhận của bạn về quán",
    shareReviewButton: "Chia sẻ",
    shareReviewText: (name) => `${name} | tìm thấy trên Foodie Việt Nam`,
    shareReviewCopied: "Đã sao chép nội dung và liên kết để chia sẻ",
    reportTitle: "Vấn đề là gì?",
    reportOptions: ["Quán đã đóng cửa", "Địa chỉ sai", "Giờ mở cửa sai", "Tên quán sai", "Ảnh sai", "Khác"],
    reportNote: "Chi tiết (không bắt buộc)",
    reportSubmit: "Báo cáo",
    reportClose: "Đóng",
    reportSoon: "Tính năng báo cáo sẽ sớm ra mắt. Nội dung bạn nhập chưa được gửi hay lưu.",
    filterDish: "Món ăn",
    filterType: "Loại",
    typeRestaurant: "🍜 Nhà hàng",
    typeGrocery: "🛒 Tạp hóa",
    typeCafe: "☕ Cà phê",
    filterReset: "× Đặt lại bộ lọc",
    filterSummary: "🔎 Bộ lọc",
    favOnly: "♥ Chỉ hiện quán yêu thích",
    noPhoto: "Ảnh đang được cập nhật",
    favAdd: "Lưu quán này",
    favRemove: "Bỏ lưu",
    filterEmptyFav: "Chưa có quán yêu thích. Nhấn ♡ ở quán để thêm",
    searchPlaceholder: "🔍 Tìm theo tên quán, khu vực, món ăn",
    searchExample: "VD: Shinjuku, Ikebukuro, Yokohama, Chiba…",
    filterAll: "Tất cả",
    filterCount: (n) => `Đang hiển thị ${n} quán`,
    filterEmpty: "Chưa có quán nào phù hợp với bộ lọc này",
  },
};

// 店舗詳細ページの「Tips」の選択肢(この順番で、フォームに並びます)
//   key   : Firestore のフィールド名になります(あとから変えると、これまでの人数と結びつかなくなります)
//   label : 画面に出す文字
const tipOptions = [
  { key: "delicious", icon: "🍜", label: { ja: "料理がおいしい", en: "Delicious food", vi: "Đồ ăn ngon" } },
  { key: "value", icon: "💰", label: { ja: "コスパがいい", en: "Good value for money", vi: "Giá cả hợp lý" } },
  { key: "portion", icon: "🍚", label: { ja: "ボリュームがある", en: "Generous portions", vi: "Phần ăn nhiều" } },
  { key: "staff", icon: "😊", label: { ja: "店員さんが親切", en: "Friendly staff", vi: "Nhân viên thân thiện" } },
  { key: "atmosphere", icon: "✨", label: { ja: "店内の雰囲気がいい", en: "Nice atmosphere", vi: "Không khí quán tốt" } },
  { key: "solo", icon: "🙋", label: { ja: "一人でも入りやすい", en: "Easy to visit alone", vi: "Dễ đi một mình" } },
  { key: "family", icon: "👨‍👩‍👧", label: { ja: "家族で利用しやすい", en: "Great for families", vi: "Phù hợp đi cùng gia đình" } },
  { key: "date", icon: "💕", label: { ja: "デートにおすすめ", en: "Good for dates", vi: "Thích hợp để hẹn hò" } },
  { key: "takeout", icon: "🥡", label: { ja: "テイクアウトにおすすめ", en: "Great for takeout", vi: "Phù hợp mua mang về" } },
  { key: "station", icon: "🚉", label: { ja: "駅から行きやすい", en: "Easy to reach from the station", vi: "Dễ đến từ ga" } },
];

// 食材店(data.js で type: "grocery" のお店)の「Tips」の選択肢
//   ・value / staff / station は、料理店と同じキーを使っています(人数はお店ごとに数えるので、混ざりません)
//   ・キーを増やしたり変えたりするときは、firestore.rules の tipKeys() も同じように直してください
const groceryTipOptions = [
  { key: "herbs", icon: "🌿", label: { ja: "ハーブ・生鮮野菜がある", en: "Fresh herbs & vegetables", vi: "Có rau thơm, rau tươi" } },
  { key: "variety", icon: "🛒", label: { ja: "品揃えが豊富", en: "Wide selection", vi: "Hàng hóa đa dạng" } },
  { key: "value", icon: "💰", label: { ja: "価格が手ごろ", en: "Reasonable prices", vi: "Giá cả phải chăng" } },
  { key: "frozen", icon: "🧊", label: { ja: "冷凍食品・肉・魚がある", en: "Frozen food, meat & fish", vi: "Có đồ đông lạnh, thịt, cá" } },
  { key: "dried", icon: "🍜", label: { ja: "麺・ライスペーパーなどの乾物が充実", en: "Good range of noodles & rice paper", vi: "Nhiều bún, phở khô, bánh tráng" } },
  { key: "deli", icon: "🥖", label: { ja: "惣菜・バインミーなどが買える", en: "Ready-made food & banh mi", vi: "Có đồ ăn sẵn, bánh mì" } },
  { key: "staff", icon: "😊", label: { ja: "店員さんが親切", en: "Friendly staff", vi: "Nhân viên thân thiện" } },
  { key: "japanese", icon: "🗣️", label: { ja: "日本語が通じる", en: "Japanese spoken", vi: "Có thể nói tiếng Nhật" } },
  { key: "station", icon: "🚉", label: { ja: "駅から行きやすい", en: "Easy to reach from the station", vi: "Dễ đến từ ga" } },
  { key: "parking", icon: "🅿️", label: { ja: "駐車場がある", en: "Parking available", vi: "Có chỗ đậu xe" } },
];

// そのお店で使う Tips の選択肢(食材店なら groceryTipOptions、それ以外は tipOptions)
function tipOptionsFor(shopId) {
  const shop = typeof restaurants !== "undefined" ? restaurants.find((s) => s.id === shopId) : null;
  return shop && shop.type === "grocery" ? groceryTipOptions : tipOptions;
}

// 料理店・食材店の、すべての選択肢(同じキーは1つだけ)。Firestore から来た人数を整えるときに使う
const allTipOptions = [...tipOptions, ...groceryTipOptions.filter((g) => !tipOptions.some((o) => o.key === g.key))];

// 今選ばれている言語
let currentLang = "ja";

// お店のデータから、今の言語の文字を取り出す。
//   - "Viet Nhat" のような普通の文字列なら、そのまま返す(どの言語でも同じ)
//   - { ja: "...", en: "...", vi: "..." } なら、今の言語のものを返す
//   - その言語の分が書かれていなければ、日本語を返す
function pick(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[currentLang] || value.ja || "";
}
