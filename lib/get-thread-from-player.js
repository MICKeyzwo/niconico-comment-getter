"use strict";

const request = require("request");

const getThread = function (id, cb) {
    request.get("http://www.nicovideo.jp/watch/" + id, "utf-8", (err, res, body) => {
        if (err) throw err;
        let target = body.match(/ids&quot;:{&quot;default&quot;:&quot;[0-9]*&quot;/);
        if (target[0]) {
            let thread = target[0].match(/[0-9]+/)[0];
            cb(thread);
        }
    });
}

module.exports = getThread;
