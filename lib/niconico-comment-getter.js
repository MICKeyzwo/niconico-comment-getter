"use strict";

const request = require("request");
const util = require("util");
const xml2js = require("xml2js");

const NiconicoCommentGetter = (_ => {

    const r = request.defaults({ jar: true });
    
    function auth (mail, password, id, cb) {
        r.post({
            url: "https://secure.nicovideo.jp/secure/login?site=niconico",
            form: {
                mail: mail,
                password: password
            }
        }, (err, res, body) => {
            if (err) throw err;
            getVideoInfo(id, cb);
        });
    }

    function getVideoInfo (id, cb) {
        r.get("http://flapi.nicovideo.jp/api/getflv/" + id, (err, res, body) => {
            if (err) throw err;
            let query = decodeSearchQuery(body);
            let opt = {
                commentUrl: query["ms"],
                threadId: query["thread_id"],
                userId: query["user_id"]
            };
            setOfficialVideoParam(opt, id, cb);
        });
    }

    function decodeSearchQuery (str) {
        str = decodeURIComponent(str);
        let res = {};
        str.split("&").forEach(item => {
            let data = item.split("=");
            res[data[0]] = data[1];
        });
        return res;
    }

    function setOfficialVideoParam (opt, id, cb) {
        if (id.indexOf("sm") === -1) {
            r.get("http://flapi.nicovideo.jp/api/getthreadkey?thread=" + id, (err, res, body) => {
                if (err) throw err;
                let query = decodeSearchQuery(body);
                opt.threadKey = query["threadkey"];
                opt.force184 = query["force_184"];
                r.get("http://flapi.nicovideo.jp/api/getwaybackkey?thread=" + id, (err, res, body) => {
                    if (err) throw err;
                    query = decodeSearchQuery(body);
                    opt.wayBackKey = query["waybackkey"];
                    getComment(opt, cb);
                });
            });
        } else {
            getComment(opt, cb);
        }
    }

    function getComment (opt, cb) {
        let resFrom = 1000, when = "";
        let postXml = util.format(
            `<thread thread="%s" version="%s" res_from="%s" user_id="%s" threadkey="%s" force_184="%s" when="%s" waybackkey="%s" />`,
            opt.threadId, 20090904, resFrom, opt.userId, opt.threadKey, opt.force184, when, opt.wayBackKey
        );
        r.post({
            url: opt.commentUrl,
            headers: { "content-type" : "application/xml" },
            body: postXml
        }, (err, res, body) => {
            if (err) throw err;
            let tmp = body.replace(/^<.+?>/, "");
            xml2js.parseString(tmp, (err, res) => {
                if (err) throw err;
                cb(res);
            });
        });
    }

    return class {

        constructor (mail, password) {
            this.mail = mail;
            this.password = password;
            this.isAuthed = false;
        }
    
        getComment (id, cb) {
            if (!this.isAuthed) {
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
