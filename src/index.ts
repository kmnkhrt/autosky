import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    deleteUser
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    getDoc
} from 'firebase/firestore';
const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
let user: any = null; //ログインしているかどうか確認するための変数
let editting: any = null; //編集中かどうか、編集中ならidは何かを保存するための変数

//クリックイベントから各関数へ繋げる
document.addEventListener('click', function (event) {
    if (!event.target) { return }
    const target = event.target as HTMLElement;
    const cid = target.id;
    switch (cid) {
        case 'button_create_account':
            create_account();
            break;
        case 'button_signin':
            signin();
            break;
        case 'signout':
            signout();
            break;
        case 'all_delete_click':
            all_delete_click();
            break;
        case 'all_delete_cancel':
            all_delete_cancel();
            break;
        case 'new_save':
        case 'change_save':
            save();
            break;
        case 'this_post_delete_confirm':
            this_post_delete_confirm();
            break;
        case 'new_post_create':
            new_post_create();
            break;
        case 'all_post_disable':
            all_post_disable();
            break;
        case 'this_post_disable':
            this_post_disable();
            break;
        case 'all_delete_confirm':
            all_delete_confirm();
            break;
        case 'only_once':
            change();
        default:
            if (target.classList.contains('edit_post')) { //既存の投稿がクリックされた時はクラス名から起動
                editting = target.getAttribute('data-id'); //どの投稿がクリックされたか変数に保存
                edit_doc_load() //編集する投稿をロード
            }
    }
});
//クリックではないイベントを独自に監視
const interval_area = document.getElementById('interval') as HTMLSelectElement;
interval_area.addEventListener('change', change);
const key_area = document.getElementById('sign_key') as HTMLInputElement;
key_area.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); signin(); }
});
const post_textarea = document.getElementById('post_textarea') as HTMLTextAreaElement;
post_textarea.addEventListener('input', () => {
    c_count_change()
});

//保存されている投稿をロード
async function docs_lord() {
    const querySnapshot = await getDocs(collection(db, user.uid));
    const docsArray = querySnapshot.docs.reverse(); //逆にすることで最新のものを上に表示
    const posts_area = document.getElementById('posts') as HTMLElement;
    posts_area.innerHTML = ""; //すでに表示されているものを一旦消す
    docsArray.forEach((doc) => {
        const docDiv = document.createElement('div');
        docDiv.className = "edit_post selector";
        docDiv.setAttribute('data-id', doc.id); //後でどれがクリックされたか判別するためidを埋める
        docDiv.innerHTML = doc.data().post_text; //投稿するテキストのみ表示
        posts_area.appendChild(docDiv);
    });
}

//編集する投稿をロード
async function edit_doc_load() {
    const docSnap = await getDoc(doc(db, user.uid, editting)); //変数に埋めたidを使って読み込む
    if (docSnap.exists()) {
        const hour_jst = (docSnap.data().post_hour + 9) % 24; //UTCで保存しているのでJSTに戻す、曜日も
        const dow_jst = (docSnap.data().post_dow + (hour_jst < 9 ? 6 : 0)) % 7;
        //変更を適用する関数へロードする内容を渡す
        change_confirm(
            docSnap.data().post_text,
            docSnap.data().interval,
            dow_jst,
            hour_jst,
            docSnap.data().post_minute,
            docSnap.data().post_disable,
            docSnap.data().only_once
        )
        edit_buttons_put() //編集中用のボタンを出す
        eema(false, 'ロードしました')
    } else {
        eema(true, '見つかりません')
    }
}

//アカウントを作成する関数
async function create_account() {
    const mail_area = document.getElementById('sign_mail') as HTMLInputElement;
    const mail = mail_area.value;
    const key = key_area.value; //↓入力が足りていないならエラーを出して終える
    if (!mail && key) { iema(true, "メールアドレスを入力してください"); return }
    if (mail && !key) { iema(true, "パスワードかアプリパスワードを入力してください"); return }
    if (!mail && !key) { iema(true, "アカウント情報を入力してください"); return }
    try {
        const { BskyAgent } = await import("@atproto/api");
        const agent = new BskyAgent({ service: 'https://bsky.social' })
        const res = await agent.login({ identifier: mail, password: key }); //Blueskyへログインする
        if (res === null) { iema(true, 'Blueskyへのログインに失敗しました。'); return };
        await createUserWithEmailAndPassword(auth, mail, key);//ログインに成功したならfirebaseへアカウントを作成
        user = auth.currentUser;
        const index_area = document.getElementById('index_html') as HTMLElement; //↓画面遷移
        const edit_area = document.getElementById('edit_html') as HTMLElement;
        index_area.style.display = 'none';
        await setDoc(doc(db, "user_data", user.uid), {
            all_post_disable: false,
            mail: mail,
            key: key
        });
        edit_area.style.display = 'block'
        mail_area.value = ''
        key_area.value = ''
        iema(false, '')
        eema(false, "アカウントの作成に成功しました")
        document.title = 'Edit - Autosky'
    } catch (error: any) { iema(true, error.message); console.error(error); }
}

//ログインする関数
async function signin() {
    const mail_area = document.getElementById('sign_mail') as HTMLInputElement;
    const mail = mail_area.value;
    const key = key_area.value; //↓入力が足りていないならエラーを出して終える
    if (!mail && key) { iema(true, "メールアドレスを入力してください"); return }
    if (mail && !key) { iema(true, "パスワードかアプリパスワードを入力してください"); return }
    if (!mail && !key) { iema(true, "アカウント情報を入力してください"); return }
    try {
        await signInWithEmailAndPassword(auth, mail, key); //ログインする
        user = auth.currentUser;
        const index_area = document.getElementById('index_html') as HTMLElement; //↓画面遷移
        const edit_area = document.getElementById('edit_html') as HTMLElement;
        docs_lord()
        eema(false, "ログインに成功しました")
        index_area.style.display = 'none';
        edit_area.style.display = 'block';
        mail_area.value = '';
        key_area.value = '';
        iema(false, '')
        document.title = 'Edit - Autosky'
        const docSnap = await getDoc(doc(db, 'user_data', user.uid)); //↓保存している投稿をロードする
        if (docSnap.exists()) {
            const apd_area = document.getElementById('all_post_disable') as HTMLInputElement;
            apd_area.checked = docSnap.data().all_post_disable
        }
    } catch (error: any) { iema(true, error.message); console.error(error); }
}

//ログアウトする関数
function signout() {
    const index_area = document.getElementById('index_html') as HTMLElement;
    const edit_area = document.getElementById('edit_html') as HTMLElement;
    if (user !== null) {
        signOut(auth).then(() => { iema(false, 'ログアウトしました'); user = null; })
            .catch((error) => { eema(true, 'ログアウトに失敗しました'); console.error(error); });
    }
    edit_area.style.display = 'none'; //↓画面遷移
    const posts_area = document.getElementById('posts') as HTMLElement;
    posts_area.innerHTML = '';
    index_area.style.display = 'block';
    document.title = 'Autosky';
    new_post_create()
}

//投稿のインターバルが変更された時に要らないものを隠す関数
function change() {
    const dow_area = document.getElementById('dow') as HTMLSelectElement;
    const hour_area = document.getElementById('hour') as HTMLSelectElement;
    const only_once_area = document.getElementById('only_once') as HTMLInputElement;
    const dowt = document.getElementById('dowt') as HTMLSelectElement;
    const hourt = document.getElementById('hourt') as HTMLSelectElement;
    const intervals = document.getElementById('intervals') as HTMLInputElement;
    if (only_once_area.checked) {
        dow_area.disabled = false;
        dowt.style.display = 'inline';
        hour_area.disabled = false;
        hourt.style.display = 'inline';
        intervals.style.display = 'none';
    } else if (interval_area.value === '0') {
        dow_area.disabled = false;
        dowt.style.display = 'inline';
        hour_area.disabled = false;
        hourt.style.display = 'inline';
        intervals.style.display = 'inline';
    }
    else if (interval_area.value === '1') {
        dow_area.disabled = true;
        dowt.style.display = 'none';
        hour_area.disabled = false;
        hourt.style.display = 'inline';
        intervals.style.display = 'inline';
    }
    else if (interval_area.value === '2') {
        dow_area.disabled = true;
        dowt.style.display = 'none';
        hour_area.disabled = true;
        hourt.style.display = 'none';
        intervals.style.display = 'inline';
    }
}

//「Autoskyのアカウントを削除」を押した時の画面遷移
function all_delete_click() {
    const settings = document.getElementById('settings') as HTMLElement;
    settings.style.display = 'none';
    const all_delete = document.getElementById('all_delete') as HTMLElement;
    all_delete.style.display = 'block';
}

//アカウントの削除をキャンセルした時の画面遷移
function all_delete_cancel() {
    const settings = document.getElementById('settings') as HTMLElement;
    settings.style.display = 'block';
    const all_delete = document.getElementById('all_delete') as HTMLElement;
    all_delete.style.display = 'none';
}

//新規投稿を作成する時やログアウトする時に編集画面をリセットするやつ
function new_post_create() {
    edit_buttons_new()
    eema(false, '')
    change_confirm('', 0, 0, 0, 0, false, false)
}

//編集画面へ変更を反映する関数
function change_confirm(
    text: string,
    interval: number,
    dow: number,
    hour: number,
    minute: number,
    post_disable: boolean,
    only_once: boolean) {
    const dow_area = document.getElementById('dow') as HTMLSelectElement;
    const hour_area = document.getElementById('hour') as HTMLSelectElement;
    const minute_area = document.getElementById('minute') as HTMLSelectElement;
    const post_disable_area = document.getElementById('this_post_disable') as HTMLInputElement;
    const only_once_area = document.getElementById('only_once') as HTMLInputElement;
    post_textarea.value = text;
    interval_area.selectedIndex = interval;
    dow_area.selectedIndex = dow;
    hour_area.selectedIndex = hour;
    minute_area.selectedIndex = minute;
    post_disable_area.checked = post_disable;
    only_once_area.checked = only_once;
    change() //投稿のインターバルが変更される可能性があるため適用させる
    c_count_change() //現在の文字数カウントが変更される可能性があるため適用させる
    this_post_disable() //投稿が無効化されているかが変更される可能性があるため適用させる
}

//文字数カウント
function c_count_change() {
    const textLength = post_textarea.value.length;
    const c_count = document.getElementById('c_count') as HTMLElement;
    c_count.textContent = `${textLength} / 300`;
    if (textLength <= 300) {
        c_count.style.color = ''
    } else {
        c_count.style.color = '#F00'
    }
}

//投稿を保存する関数
async function save() {
    if (post_textarea.value == '') { eema(true, 'テキストが入力されていません。'); return };
    if (post_textarea.value.length > 300) { eema(true, 'テキストが300文字を超えています。'); return };
    const dow_area = document.getElementById('dow') as HTMLSelectElement;
    const hour_area = document.getElementById('hour') as HTMLSelectElement;
    const minute_area = document.getElementById('minute') as HTMLSelectElement;
    const post_disable_area = document.getElementById('this_post_disable') as HTMLInputElement;
    const only_once_area = document.getElementById('only_once') as HTMLInputElement;
    let save_message = '新規'; //↓編集中なら既存の投稿を削除する。idを新しくすることで作成順に並べるため。
    if (editting !== null) { await deleteDoc(doc(db, user.uid, editting)); save_message = '変更の' };
    const id = new Date().toISOString(); //現在時刻をidとする
    const hour_jst = Number(hour_area.value); //↓時間と曜日をUTCに変換する
    const hour_utc = (hour_jst + 15) % 24;
    const dow_utc = (Number(dow_area.value) + (hour_jst < 9 ? 6 : 0)) % 7;
    const docRef = doc(db, user.uid, id);
    let interval = Number(interval_area.value);
    if (only_once_area.checked) {
        interval = 0;
    }
    await setDoc(docRef, { //保存する
        post_text: post_textarea.value,
        interval: interval,
        post_dow: dow_utc,
        post_hour: hour_utc,
        post_minute: Number(minute_area.value),
        post_disable: post_disable_area.checked,
        only_once: only_once_area.checked
    })
        .then(function () {
            console.log('Document written with ID: ', docRef.id);
            docs_lord()
            edit_buttons_put()
            editting = docRef.id
            eema(false, `${save_message}保存に成功しました`)
        })
        .catch(function (error) {
            eema(true, error)
            console.error('Error: ', error);
        });
}

//「この投稿を削除」が押された時の関数
async function this_post_delete_confirm() {
    if (user.uid === null || editting === null) {
        eema(true, 'エラーが発生しました')
        return
    }
    await deleteDoc(doc(db, user.uid, editting)) //編集中のidで削除
    new_post_create(); //編集画面をリセット
    docs_lord(); //投稿一覧を読み込みなおす
    eema(false, '削除しました');
}

//「この投稿を無効化」「この投稿を削除」「変更を保存」を表示して、「新規保存」を隠す関数
function edit_buttons_put() {
    const newsave_button = document.getElementById('new_save') as HTMLInputElement;
    const buttons_area = document.getElementById('edit_buttons') as HTMLElement;
    newsave_button.style.display = "none"
    buttons_area.style.display = "block"
}

//「この投稿を無効化」「この投稿を削除」「変更を保存」を隠して、「新規保存」を表示する関数
function edit_buttons_new() {
    const buttons_area = document.getElementById('edit_buttons') as HTMLElement;
    const newsave_button = document.getElementById('new_save') as HTMLInputElement;
    buttons_area.style.display = "none"
    newsave_button.style.display = "block"
    editting = null;
}

//トップ画面下部にメッセージを表示する関数。エラーの際は一つ目の引数にtrueを入れて赤文字に。
function iema(color_error: boolean, iemamessage: string) {
    const iema = document.getElementById('error_message') as HTMLElement;
    if (color_error) {
        iema.style.color = "#F00"
    }
    else {
        iema.style.color = "#ddd"
    }
    iema.innerHTML = iemamessage
}

//編集画面下部にメッセージを表示する関数。エラーの際は一つ目の引数にtrueを入れて赤文字に。
function eema(color_error: boolean, eemamessage: string) {
    const eema = document.getElementById('editor_message') as HTMLElement;
    if (color_error) {
        eema.style.color = "#F00"
    }
    else {
        eema.style.color = "#ddd"
    }
    eema.innerHTML = eemamessage
}

//「全ての投稿を無効化」がクリックされた時の関数
async function all_post_disable() {
    const apd_area = document.getElementById('all_post_disable') as HTMLInputElement;
    await setDoc(doc(db, 'user_data', user.uid), { all_post_disable: apd_area.checked })
    let apd_message = '全ての投稿の無効化を解除しました'
    if (apd_area.checked) { apd_message = '全ての投稿を無効化しました' }
    eema(false, apd_message)
}

//「この投稿を無効化」がクリックされた時などに編集画面を編集不可にしたりそれを解除したりする関数。
function this_post_disable() {
    const dow_area = document.getElementById('dow') as HTMLSelectElement;
    const hour_area = document.getElementById('hour') as HTMLSelectElement;
    const minute_area = document.getElementById('minute') as HTMLSelectElement;
    const post_disable_area = document.getElementById('this_post_disable') as HTMLInputElement;
    post_textarea.disabled = post_disable_area.checked
    interval_area.disabled = post_disable_area.checked
    dow_area.disabled = post_disable_area.checked
    hour_area.disabled = post_disable_area.checked
    minute_area.disabled = post_disable_area.checked
}

//アカウントを削除する関数
async function all_delete_confirm() {
    const query1 = await getDocs(collection(db, user.uid));
    for (const doc of query1.docs) { await deleteDoc(doc.ref); } //全ての投稿を削除
    await deleteDoc(doc(db, "user_data", user.uid)) //アカウント情報を削除
    const index_area = document.getElementById('index_html') as HTMLElement; //↓画面遷移
    const edit_area = document.getElementById('edit_html') as HTMLElement;
    const posts_area = document.getElementById('posts') as HTMLElement;
    edit_area.style.display = 'none';
    posts_area.innerHTML = '';
    index_area.style.display = 'block';
    document.title = 'Autosky';
    new_post_create()
    deleteUser(user).then(() => {
        iema(false, 'アカウントの情報の削除が完了しました')
    }).catch((error) => {
        iema(true, `'アカウントの削除に失敗しました。'${error}`)
        eema(true, `'アカウントの削除に失敗しました。'${error}`)
    });
    user = null
}