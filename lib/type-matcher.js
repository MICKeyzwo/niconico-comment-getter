"use strict";

//型を求める関数
const getType = require("./type-getter.js");

//引数列の型に応じて処理を選択、実行する関数
//@param
//  args: Array<Any> => 引数列の配列
//  patterns: Object => 引数列に対応する型名を列挙した文字列
//                      フォーマットは"型名, 型名, ..."という形
//  other: Function => 引数列が上記の型列挙に当てはまらなかった場合に実行される関数
//                      patternsに"other"というプロパティに対応した関数があった場合、そちらのみ実行される
const typeMatch = (args, patterns, other) => {
    const pat = {};
    Object.keys(patterns).forEach(p => {
        let _p = p.replace(/\s/g, "");
        pat[_p] = patterns[p];
        if (_p == "other") other = patterns[p];
    });
    let argT = "";
    args.forEach((a, i) => {
        const type = getType(a);
        if (type != "Undefined") {
            i && (argT += ",");
            argT += type;
        }
    });
    if (argT in pat) {
        if (typeof pat[argT] == "function") pat[argT](...args);
        return;
    }
    if (typeof other == "function") other(...args);
}

module.exports = typeMatch;
