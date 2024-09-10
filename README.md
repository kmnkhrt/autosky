# Autosky

Autosky のサイトはこちら\
[https://portfolio-bsky-app.web.app/](https://portfolio-bsky-app.web.app/)

Bluesky へ定期投稿・予約投稿をすることができる web アプリケーションです。

## 仕様
Blueskyのアカウントで登録、ログインをすることで利用できます。\
ポートフォリオとして見ていただくため、ログインをしなくても次の画面に移ることができるボタンも用意しています。

投稿は予約or定期(毎週or毎日or毎時)を設定することができ、曜日、時、分(10分刻み)を指定することができます。\
1アカウントにつき最大10個まで投稿を保存することができます。\
保存したまま投稿を無効化しておくこともできます。\
予約投稿は投稿が行われれば保存していたものは削除されます。

## こだわり

サイト内に使用したfaviconを除く4つのアイコン画像はすべて自作したsvg画像です。\
手動で座標などを入力し思い描いていたアイコンを作成しました。

## 利用した主な言語やサービス等

**HTML**\
**CSS**\
**JavaScript**\
**TypeScript**\
**Node.js**

**Firebase**\
Cloud Firestore\
Cloud Functions for Firebase\
Firebase Admin SDK\
Firebase Authentication

**Google Cloud**\
Google Cloud SDK\
Cloud Scheduler

**Bluesky API**\
@atproto/api
