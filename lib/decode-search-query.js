"use strict";

//検索クエリをオブジェクトに展開する関数．
//@param
//  str: String => 展開対象の検索クエリ文字列
//@return: Object => 検索クエリを展開したオブジェクト
function decodeSearchQuery(str) {
    str = decodeURIComponent(str);
    let res = {};
    str.split("&").forEach(item => {
        let data = item.split("=");
        res[data[0]] = data[1];
    });
    return res;
}

module.exports = decodeSearchQuery;
