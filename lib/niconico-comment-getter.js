"use strict";

const request = require("request");
const paramTemp = require("./parameter-template.js");
const getThread = require("./get-thread-from-player.js");

const NiconicoCommentGetter = (_ => {

    const r = request.defaults({ jar: true });

    function auth(mail, password, id, cb) {
        r.post({
            url: "https://secure.nicovideo.jp/secure/login?site=niconico",
            form: { mail, password }
        }, (err, res, body) => {
            if (err) throw err;
            getVideoInfo(id, cb);
        });
    }

    function getVideoInfo(id, cb) {
        r.get("http://flapi.nicovideo.jp/api/getflv/" + id, (err, res, body) => {
            if (err) throw err;
            let query = decodeSearchQuery(body);
            //console.log(query);
            let opt = {
                //commentUrl: query["ms"],
                threadId: query["thread_id"],
                userId: query["user_id"],
                userKey: query["userkey"]
            };
            setOfficialVideoParam(opt, id, cb);
        });
    }

    function decodeSearchQuery(str) {
        str = decodeURIComponent(str);
        let res = {};
        str.split("&").forEach(item => {
            let data = item.split("=");
            res[data[0]] = data[1];
        });
        return res;
    }

    function setOfficialVideoParam(opt, id, cb) {
        r.get("http://flapi.nicovideo.jp/api/getthreadkey?thread=" + opt.threadId, (err, res, body) => {
            if (err) throw err;
            let query = decodeSearchQuery(body);
            //console.log(query);
            opt.threadKey = query["threadkey"];
            opt.force184 = query["force_184"];
            r.get("http://flapi.nicovideo.jp/api/getwaybackkey?thread=" + opt.threadId, (err, res, body) => {
                if (err) throw err;
                query = decodeSearchQuery(body);
                opt.wayBackKey = query["waybackkey"];
                getComment(opt, id, cb);
            });
        });
    }

    function getComment(opt, id, cb) {
        let resFrom = 1000, when = "", param;
        if (id.indexOf("sm") !== -1)
            param = paramTemp.userVideo(opt);
        else
            param = paramTemp.channelVideo(opt);
        //console.log(param);
        r.post({
            url: "http://nmsg.nicovideo.jp/api.json/",
            body: JSON.stringify(param)
        }, (err, res, body) => {
            if (err) throw err;
            cb(JSON.parse(body));
        });
    }

    return class {

        constructor(mail, password) {
            this.mail = mail;
            this.password = password;
            this.isAuthed = false;
        }

        getComment(id, cb) {
            if (id.indexOf("sm") !== -1) {
                if (typeof cb === "function")
                    getThread(id, thread => getComment({ threadId: thread }, id, cb));
                else
                    return new Promise(cb => getThread(id, thread => getComment({ threadId: thread }, id, cb)));
            } else if (!this.isAuthed) {
                this.isAuthed = true;
                if (typeof cb === "function")
                    auth(this.mail, this.password, cb);
                else
                    return new Promise(cb => auth(this.mail, this.password, id, cb));
            } else {
                if (typeof cb === "function")
                    getVideoInfo(id, cb)
                else
                    return new Promise(cb => getVideoInfo(id, cb));
            }
        }

    }
})();

module.exports = NiconicoCommentGetter;
