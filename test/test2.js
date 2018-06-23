"use strict";

const Ncg = require("../lib/niconico-comment-getter.js");

const myNcg = new Ncg(process.argv[2], process.argv[3]);

myNcg.getComment("1484628320")
.then(res => console.log(res));
