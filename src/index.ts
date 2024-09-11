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
            break;
        case 'test':
            test();
            break;
        default:
            if (target.classList.contains('edit_post')) { //既存の投稿がクリックされた時はクラス名から起動
                editting = target.getAttribute('data-id'); //どの投稿がクリックされたか変数に保存
                edit_doc_load() //編集する投稿をロード
            }
    }
});
//クリックではないイベントを独自に監視
window.addEventListener('load', loading);
window.addEventListener('resize', resize);
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

//画面表示関連
function loading() {
    resize()
    const index_area = document.getElementById('index_html') as HTMLElement;
    index_area.style.display = 'block';
}
function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const index_area = document.getElementById('index_html') as HTMLElement;
    const edit_area = document.getElementById('edit_html') as HTMLElement;
    if (edit_area.style.display === 'none') {
        const index_left = document.getElementById('index_left') as HTMLElement;
        const index_right = document.getElementById('index_right') as HTMLElement;
        const title_right = document.getElementById('title_right') as HTMLElement;
        const sign_message = document.getElementById('sign_message') as HTMLElement;
        if (width > height) {
            const signs = Array.from(document.getElementsByClassName('signs'));
            signs.forEach(sign => {
                sign.classList.add('sign1');
                sign.classList.remove('sign2');
                (sign as HTMLElement).style.width = '';
            });
            const svgs = Array.from(document.getElementsByClassName('svg2'));
            svgs.forEach(svg => {
                svg.classList.add('svg1');
                svg.classList.remove('svg2');
            });
            const blues = Array.from(document.getElementsByClassName('button-blue2'));
            blues.forEach(blue => {
                blue.classList.add('button-blue1');
                blue.classList.remove('button-blue2');
            });
            index_right.classList.add('index-right1');
            index_right.classList.remove('index-right2');
            sign_message.classList.add('font-blue-jp1');
            sign_message.classList.remove('font-blue-jp2');
            title_right.style.display = "none";
            index_left.style.display = "block";
        } else {
            const signs = Array.from(document.getElementsByClassName('signs'));
            signs.forEach(sign => {
                sign.classList.add('sign2');
                sign.classList.remove('sign1');
                (sign as HTMLElement).style.width = `${width * 0.9 - height / 20}px`;
            });
            const svgs = Array.from(document.getElementsByClassName('svg1'));
            svgs.forEach(svg => {
                svg.classList.add('svg2');
                svg.classList.remove('svg1');
            });
            const blues = Array.from(document.getElementsByClassName('button-blue1'));
            blues.forEach(blue => {
                blue.classList.add('button-blue2');
                blue.classList.remove('button-blue1');
            });
            index_right.classList.add('index-right2');
            index_right.classList.remove('index-right1');
            sign_message.classList.add('font-blue-jp2');
            sign_message.classList.remove('font-blue-jp1');
            index_left.style.display = "none";
            title_right.style.display = "block";
        }
    }
    if (index_area.style.display === 'none') {
        const edit_left = document.getElementById('edit_left') as HTMLElement;
        const edit_right = document.getElementById('edit_right') as HTMLElement;
        const edit_top = document.getElementById('edit_top') as HTMLElement;
        const etitle = document.getElementById('etitle') as HTMLElement;
        const posts = document.getElementById('posts') as HTMLElement;
        const gray = document.getElementById('this-post-delete') as HTMLElement;
        if (width > height) {
            edit_left.classList.add('edit-left1');
            edit_left.classList.remove('edit-left2');
            edit_right.classList.add('edit-right1');
            edit_right.classList.remove('edit-right2');
            edit_top.classList.add('edit-top1');
            edit_top.classList.remove('edit-top2');
            post_textarea.classList.add('post_textarea1');
            post_textarea.classList.remove('post_textarea2');
            etitle.classList.add('title-medium1');
            etitle.classList.remove('title-medium2');
            posts.classList.add('list-items1');
            posts.classList.remove('list-items2');
            gray.classList.add('button-gray1');
            gray.classList.remove('button-gray2');
            Array.from(document.getElementsByClassName('svg4')).forEach(svg => {
                svg.classList.add('svg3');
                svg.classList.remove('svg4');
            });
            Array.from(document.getElementsByClassName('font2')).forEach(font => {
                font.classList.add('font1');
                font.classList.remove('font2');
            });
            Array.from(document.getElementsByClassName('pulldown2')).forEach(pulldown => {
                pulldown.classList.add('pulldown1');
                pulldown.classList.remove('pulldown2');
            });
            Array.from(document.getElementsByClassName('dis2')).forEach(dis => {
                (dis as HTMLElement).style.display = 'none'
            });
            Array.from(document.getElementsByClassName('dis1')).forEach(dis => {
                (dis as HTMLElement).style.display = ''
            });
            Array.from(document.getElementsByClassName('edit_post')).forEach(edit_post => {
                edit_post.classList.add('edit_post1');
                edit_post.classList.remove('edit_post2');
            });
            Array.from(document.getElementsByClassName('button-blue2')).forEach(blue => {
                blue.classList.add('button-blue1');
                blue.classList.remove('button-blue2');
            });
            Array.from(document.getElementsByClassName('scrollbar2')).forEach(bar => {
                bar.classList.add('scrollbar1');
                bar.classList.remove('scrollbar2');
            });
        } else {
            edit_left.classList.add('edit-left2');
            edit_left.classList.remove('edit-left1');
            edit_right.classList.add('edit-right2');
            edit_right.classList.remove('edit-right1');
            edit_top.classList.add('edit-top2');
            edit_top.classList.remove('edit-top1');
            post_textarea.classList.add('post_textarea2');
            post_textarea.classList.remove('post_textarea1');
            etitle.classList.add('title-medium2');
            etitle.classList.remove('title-medium1');
            posts.classList.add('list-items2');
            posts.classList.remove('list-items1');
            gray.classList.add('button-gray2');
            gray.classList.remove('button-gray1');
            Array.from(document.getElementsByClassName('svg3')).forEach(svg => {
                svg.classList.add('svg4');
                svg.classList.remove('svg3');
            });
            Array.from(document.getElementsByClassName('font1')).forEach(font => {
                font.classList.add('font2');
                font.classList.remove('font1');
            });
            Array.from(document.getElementsByClassName('pulldown1')).forEach(pulldown => {
                pulldown.classList.add('pulldown2');
                pulldown.classList.remove('pulldown1');
            });
            Array.from(document.getElementsByClassName('dis1')).forEach(dis => {
                (dis as HTMLElement).style.display = 'none'
            });
            Array.from(document.getElementsByClassName('dis2')).forEach(dis => {
                (dis as HTMLElement).style.display = ''
            });
            Array.from(document.getElementsByClassName('edit_post')).forEach(edit_post => {
                edit_post.classList.add('edit_post2');
                edit_post.classList.remove('edit_post1');
            });
            Array.from(document.getElementsByClassName('button-blue1')).forEach(blue => {
                blue.classList.add('button-blue2');
                blue.classList.remove('button-blue1');
            });
            Array.from(document.getElementsByClassName('scrollbar1')).forEach(bar => {
                bar.classList.add('scrollbar2');
                bar.classList.remove('scrollbar1');
            });
        }
    }
}
function test() {
    const index_area = document.getElementById('index_html') as HTMLElement; //↓画面遷移
    const edit_area = document.getElementById('edit_html') as HTMLElement;
    index_area.style.display = 'none';
    resize()
    edit_area.style.display = 'block';
    iema(false, '')
    document.title = 'Edit - Autosky'
}

//保存されている投稿をロード
async function docs_load() {
    const querySnapshot = await getDocs(collection(db, user.uid));
    const docsArray = querySnapshot.docs.reverse(); //逆にすることで最新のものを上に表示
    const posts_area = document.getElementById('posts') as HTMLElement;
    const docs_counting_area = document.getElementById('docs_counting') as HTMLElement;
    posts_area.innerHTML = ""; //すでに表示されているものを一旦消す
    docsArray.forEach((doc) => {
        const docDiv = document.createElement('div');
        docDiv.className = "edit_post selector";
        docDiv.setAttribute('data-id', doc.id); //後でどれがクリックされたか判別するためidを埋める
        docDiv.innerHTML = doc.data().post_text; //投稿するテキストのみ表示
        posts_area.appendChild(docDiv);
    });
    docs_counting_area.innerHTML = `${docsArray.length} / 10`
    if (docsArray.length >= 10) { docs_counting_area.style.color = '#F00' } else { docs_counting_area.style.color = '' }
}

function hour_u_to_j(utc: number) {
    return (utc + 9) % 24
}

function dow_u_to_j(dow_utc: number, hour_utc: number) {
    return (dow_utc + (hour_utc > 14 ? 1 : 0)) % 7
}

//編集する投稿をロード
async function edit_doc_load() {
    const docSnap = await getDoc(doc(db, user.uid, editting)); //変数に埋めたidを使って読み込む
    if (docSnap.exists()) {
        const hour_utc = docSnap.data().post_hour
        const hour_jst = hour_u_to_j(hour_utc); //UTCで保存しているのでJSTに戻す、曜日も
        const dow_jst = dow_u_to_j(docSnap.data().post_dow, hour_utc);
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
        await agent.login({ identifier: mail, password: key }); //Blueskyへログインする
    } catch (error: any) { iema(true, `Blueskyへのログインに失敗しました。 ${error.message}`); console.error(error); return }
    try {
        await createUserWithEmailAndPassword(auth, mail, key);//ログインに成功したならfirebaseへアカウントを作成
        user = auth.currentUser;
        const index_area = document.getElementById('index_html') as HTMLElement; //↓画面遷移
        const edit_area = document.getElementById('edit_html') as HTMLElement;
        index_area.style.display = 'none';
        resize()
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
        await docs_load()
        docs_count_max()
        eema(false, "ログインに成功しました")
        index_area.style.display = 'none';
        resize()
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
    resize()
    const posts_area = document.getElementById('posts') as HTMLElement;
    posts_area.innerHTML = '';
    index_area.style.display = 'block';
    document.title = 'Autosky';
    new_post_create()
}

//投稿のインターバルが変更された時に要らないものを隠す関数
function change() {
    const only_once_area = document.getElementById('only_once') as HTMLInputElement;
    const dowt = document.getElementById('dowt') as HTMLSelectElement;
    const hourt = document.getElementById('hourt') as HTMLSelectElement;
    const intervals = document.getElementById('intervals') as HTMLInputElement;
    if (only_once_area.checked) {
        dowt.style.display = 'inline';
        hourt.style.display = 'inline';
        intervals.style.display = 'none';
    } else if (interval_area.value === '0') {
        dowt.style.display = 'inline';
        hourt.style.display = 'inline';
        intervals.style.display = 'inline';
    }
    else if (interval_area.value === '1') {
        dowt.style.display = 'none';
        hourt.style.display = 'inline';
        intervals.style.display = 'inline';
    }
    else if (interval_area.value === '2') {
        dowt.style.display = 'none';
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
    let date = new Date()
    let dow = date.getDay()
    let hour = date.getHours()
    let minute = (date.getMinutes() / 10 + 1) % 6
    if (minute == 0) { hour = (hour + 1) % 24; if (hour == 0) { dow = (dow + 1) % 7 }; }
    edit_buttons_new()
    eema(false, '')
    change_confirm('', 0, dow, hour, minute, false, false)
    docs_count_max()
    if ((document.getElementById('docs_counting') as HTMLElement).innerHTML === '10 / 10') {
        eema(true, '保存数の上限に達しているため新規保存できません')
    }
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
    const c_count1 = document.getElementById('c_count1') as HTMLElement;
    c_count1.textContent = `${textLength} / 300`;
    const c_count2 = document.getElementById('c_count2') as HTMLElement;
    c_count2.textContent = `${textLength} / 300`;
    if (textLength <= 300) {
        c_count1.style.color = ''
        c_count2.style.color = ''
    } else {
        c_count1.style.color = '#F00'
        c_count2.style.color = '#F00'
    }
}

//投稿を保存する関数
async function save() {
    if (editting === null && (document.getElementById('docs_counting') as HTMLElement).innerHTML === '10 / 10') {
        eema(true, '保存数の上限に達しているため新規保存できません')
    }
    if (post_textarea.value == '') { eema(true, 'テキストが入力されていません。'); return };
    if (post_textarea.value.length > 300) { eema(true, 'テキストが300文字を超えています。'); return };
    if (user === null) { eema(true, 'ログインしていません'); return };
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
    }, { merge: true })
        .then(function () {
            console.log('Document written with ID: ', docRef.id);
            docs_load()
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
    await docs_load(); //投稿一覧を読み込みなおす
    new_post_create(); //編集画面をリセット
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
    await setDoc(doc(db, 'user_data', user.uid), { all_post_disable: apd_area.checked }, { merge: true })
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
    const only_once_area = document.getElementById('only_once') as HTMLSelectElement;
    only_once_area.disabled = post_disable_area.checked
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
    resize()
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

function docs_count_max() {
    if ((document.getElementById('docs_counting') as HTMLElement).innerHTML === '10 / 10') {
        const dow_area = document.getElementById('dow') as HTMLSelectElement;
        const hour_area = document.getElementById('hour') as HTMLSelectElement;
        const minute_area = document.getElementById('minute') as HTMLSelectElement;
        post_textarea.disabled = true
        interval_area.disabled = true
        dow_area.disabled = true
        hour_area.disabled = true
        minute_area.disabled = true
    }
}