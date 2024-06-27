import * as admin from 'firebase-admin';
import * as functions from "firebase-functions";
import { BskyAgent, RichText } from "@atproto/api";
const serviceAccount = {
  "type": process.env.GOOGLE_TYPE,
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
  "private_key": process.env.GOOGLE_PRIVATE_KEY,
  "client_email": process.env.GOOGLE_CLIENT_EMAIL,
  "client_id": process.env.GOOGLE_CLIENT_ID,
  "auth_uri": process.env.GOOGLE_AUTH_URI,
  "token_uri": process.env.GOOGLE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.GOOGLE_CLIENT_X509_CERT_URL,
  "universe_domain": process.env.GOOGLE_UNIVERSE_DOMAIN
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://portfolio-bsky-app-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const db = admin.firestore();
const agent = new BskyAgent({ service: 'https://bsky.social' });

exports.main = functions.https.onRequest(async (req, res) => {
  const last_doc = db.collection('scheduling').doc('last')
  const last = (await last_doc.get()).data()
  if (!last) { return }
  //現在の時刻を取得して10分単位に整形
  const now = new Date(Math.round((new Date()).getTime() / 600000) * 600000) //10分は60万ミリ秒なので
  const dow = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes() / 10 //10分なら1、20分なら2という風に保存しているので合わせる
  //今の時間が最後の更新より後なら最後の更新時間を更新し進む、そうでないなら終わり
  if (now.toISOString() > last.time.toDate().toISOString()) { await last_doc.set({ time: now }) } else { return }
  for (const auser of (await db.collection('user_data').get()).docs) { //ユーザーループ
    if (auser.data().all_post_disable) { continue } //「全ての投稿を無効化」されていたら次のユーザーへ
    let login = false //ログイン状態をfalseと設定
    for (const apost of (await db.collection(auser.id).get()).docs) { //投稿ループ
      if (apost.data().post_disable) { continue } //無効化されていたら次の投稿へ
      //時間が合っているかどうか検証する
      if (apost.data().interval === 0 && apost.data().post_dow !== dow) { continue }
      if (apost.data().interval !== 2 && apost.data().post_hour !== hour) { continue }
      if (apost.data().post_minute !== minute) { continue }
      if (!login) { //Blueskyにログインしていないならログインする　次のユーザーループに行くとリセットされる
        await agent.login({ identifier: auser.data().mail, password: auser.data().key })
        login = true
      }
      const rt = new RichText({
        text: `${apost.data().post_text}`
      })
      await rt.detectFacets(agent)
      await agent.post({
        text: rt.text,
        facets: rt.facets,
      })
      if (apost.data().only_once) {
        await db.collection(auser.id).doc(apost.id).delete();
      }
    }
  }
  console.log(`問題なく終わったよ`)
  res.send('ok')
});
