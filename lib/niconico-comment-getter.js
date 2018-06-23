"use strict";

const request = require("request");
const paramTemp = require("./parameter-template.js");
const getThread = require("./get-thread-from-player.js");

const NiconicoCommentGetter = (_ => {

    function decodeSearchQuery(str) {
        str = decodeURIComponent(str);
        let res = {};
        str.split("&").forEach(item => {
            let data = item.split("=");
            res[data[0]] = data[1];
        });
        return res;
    }

    function auth(r, mail, password, id, cb) {
        r.post({
            url: "https://secure.nicovideo.jp/secure/login?site=niconico",
            form: { mail, password }
        }, (err, res, body) => {
            if (err) throw err;
            getVideoInfo(r, id, cb);
        });
    }

    function getVideoInfo(r, id, cb) {
        r.get("http://flapi.nicovideo.jp/api/getflv/" + id, (err, res, body) => {
            if (err) throw err;
            let query = decodeSearchQuery(body);
            let opt = {
                threadId: query["thread_id"],
                userId: query["user_id"],
                userKey: query["userkey"]
            };
            setThreadKey(r, opt, id, cb);
        });
    }

    function setThreadKey(r, opt, id, cb) {
        r.get("http://flapi.nicovideo.jp/api/getthreadkey?thread=" + opt.threadId, (err, res, body) => {
            if (err) throw err;
            let query = decodeSearchQuery(body);
            opt.threadKey = query["threadkey"];
            opt.force184 = query["force_184"];
            getComment(r, opt, id, cb);
        });
    }

    function getComment(r, opt, id, cb) {
        r.get("http://ext.nicovideo.jp/api/getthumbinfo/" + id, "utf-8", (err, res, body) => {
            if (err) throw err;
            let len = body
                        .match(/<length>.+?<\/length>/)[0]
                        .match(/[0-9]+:[0-9]{2}/)[0]
                        .split(":");
            let length = +len[0] + (+len[1] > 0 ? 1 : 0);
            opt.length = length;
            let param;
            if (id.indexOf("sm") !== -1)
                param = paramTemp.userVideo(opt);
            else
                param = paramTemp.channelVideo(opt);
            r.post({
                url: "http://nmsg.nicovideo.jp/api.json/",
                body: JSON.stringify(param)
            }, (err, res, body) => {
                if (err) throw err;
                cb(JSON.parse(body));
            });
        });
    }

    return class {

        constructor(mail, password) {
            this.mail = mail;
            this.password = password;
            this.isAuthed = false;
            this.r = request.defaults({ jar: true });
        }

        getComment(id, cb) {
            if (id.indexOf("sm") !== -1) {
                if (typeof cb === "function")
                    getThread(id, thread => getComment(this.r, { threadId: thread }, id, cb));
                else
                    return new Promise(cb => getThread(id, thread => getComment(this.r, { threadId: thread }, id, cb)));
            } else if (!this.isAuthed) {
                this.isAuthed = true;
                if (typeof cb === "function")
                    auth(this.r, this.mail, this.password, cb);
                else
                    return new Promise(cb => auth(this.r, this.mail, this.password, id, cb));
            } else {
                if (typeof cb === "function")
                    getVideoInfo(this.r, id, cb)
                else
                    return new Promise(cb => getVideoInfo(this.r, id, cb));
            }
        }

    }
})();

module.exports = NiconicoCommentGetter;
