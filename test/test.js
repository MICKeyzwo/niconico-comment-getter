"use strict";

const Ncg = require("../lib/niconico-comment-getter.js");

const myNcg = new Ncg(process.argv[3], process.argv[4]);

myNcg.getComment(process.argv[2])
.then(res => console.log(res));
