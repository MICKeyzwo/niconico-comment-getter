"use strict";

//外部との通信を行うrequestモジュール
const request = require("request");
//コメントを取得する際のjsonパラメータを生成するテンプレート
const paramTemp = require("./parameter-template.js");
//コールバックを受け取る関数をプロミスでラップするやつ
const wrapByPromise = require("./wrapByPromise.js");
//urlの検索クエリをオブジェクトに展開するやつ
const decodeSearchQuery = require("./decodeSearchQuery.js");

//コメントゲッターのクラス定義
class NiconicoCommentGetter {

    //コンストラクタ
    //コメント取得対象がユーザ動画であればメアドとパスワードは入力する必要はない
    //@param
    //  mail: String => コメント取得に用いるアカウントのメールアドレス
    //  password: String => コメント取得に用いるアカウントのパスワード
    constructor(mail, password) {
        this.mail = mail;
        this.password = password;
        this.isAuthed = false;
        this.r = request.defaults({ jar: true });
    }

    //request.getをプロミスでラップしたもの
    //厳密にはjarの設定が切られた自身のメンバ，this.r.getをラップしている
    //外部から使用することは基本考慮していないが，niconicoにログインしたまま
    //getを叩けるので何かしら使いみちはあるかも？
    _get(url, opt) {
        return wrapByPromise(this.r.get, 2, true, ["res", "body"])(url, opt);
    }

    //request.getをラップした，上と同じようなモノ
    _post(url, opt) {
        return wrapByPromise(this.r.post, 2, true, ["res", "body"])(url, opt);
    }

    //niconicoにログインを試行するメソッド
    //コメント取得以外で上の_get,_postメソッドを叩く場合，このメソッドを介して
    //直接ログインを試行できる
    async auth() {
        if (!this.mail || !this.password) throw "メールアドレス，あるいはパスワードが設定されていません";
        await this._post("https://secure.nicovideo.jp/secure/login?site=niconico", {
            form: {
                mail: this.mail,
                password: this.password
            }
        });
        this.isAuthed = true;
        return;
    }

    //コメントを取得するメソッド
    //@param
    //  id: String => コメントを取得する動画のid
    //  ?cb: Function => コールバック関数．基本的にプロミスを返すが，コールバックを渡して実行することも可能
    //@return Promise => async関数なのでPromiseを返す．idのみで実行した場合，コメントのjsonがresolveに渡されるプロミスが返る．
    //                   コールバックを渡した場合，何もresolveに渡さないプロミスが返る（ハズ）
    async getComment(id, cb) {
        const opt = {};
        try {
            if (id.indexOf("sm") !== -1) {
                const player = await this._get("http://www.nicovideo.jp/watch/" + id, "utf-8");
                const target = player.body.match(/ids&quot;:{&quot;default&quot;:&quot;[0-9]*&quot;/);
                if (target[0]) {
                    opt.threadId = target[0].match(/[0-9]+/)[0];
                }
            } else {
                if (!this.isAuthed) {
                    await this.auth();
                }
                const videoInfo = await this._get("http://flapi.nicovideo.jp/api/getflv/" + id, "utf-8");
                let query = decodeSearchQuery(videoInfo.body);
                opt.threadId = query["thread_id"];
                opt.userId = query["user_id"];
                opt.userKey = query["userkey"];
                const threadInfo = await this._get("http://flapi.nicovideo.jp/api/getthreadkey?thread=" + opt.threadId, "utf-8");
                query = decodeSearchQuery(threadInfo.body);
                opt.threadKey = query["threadkey"];
                opt.force184 = query["force_184"];
            }
            const thumbInfo = await this._get("http://ext.nicovideo.jp/api/getthumbinfo/" + id, "utf-8");
            let len = thumbInfo.body
                .match(/<length>.+?<\/length>/)[0]
                .match(/[0-9]+:[0-9]{2}/)[0]
                .split(":");
            opt.length = +len[0] + (+len[1] > 0 ? 1 : 0);
            const result = await this._post("http://nmsg.nicovideo.jp/api.json/", {
                body: JSON.stringify(id.indexOf("sm") !== -1 ? paramTemp.userVideo(opt) : paramTemp.channelVideo(opt))
            });
            const resultJson = JSON.parse(result.body);
            if (cb && typeof cb === "function") {
                cb(resultJson);
                return;
            }
            return resultJson;
        } catch (e) {
            throw e;
        }
    }

}

module.exports = NiconicoCommentGetter;
