"use strict";

//第一引数の配列のstringの並びをキーに，第二引数の値をオブジェクトに展開する関数
const patNameToObject = (names, values) => names.reduce((res, name, idx) => {res[name] = values[idx]; return res;}, {});

//コールバックを引数に取る関数をプロミスでラップする関数
//@param
//  func: Function => ラップ対象のコールバックを受け取る関数
//  ?cbpos: Number => コールバック関数が引数のどこに位置するかを表す値．初期値は引数列の最後尾
//  ?erropt: Boolean => コールバック関数が第一引数にエラーを渡すか否かのオプション
//  ?names: Array<String> => コールバック関数の引数列に与える名前の配列
//                           Promiseのresolveは単一の引数のみ受け取るため，コールバックの引数はオブジェクトにまとめられる
//                           この引数オブジェクトの各値のキーの名前をこのnamesで設定できる
//@return Promise => funcをPromiseでラップした関数
const wrapByPromise = (func, cbpos = func.length - 1, erropt = false, names) => {
    if (Array.isArray(cbpos)) names = cbpos, cbpos = func.length - 1, erropt = false;
    if (typeof cbpos === "boolean") {
        if (Array.isArray(erropt)) names = erropt;
        erropt = cbpos, cbpos = func.length - 1;
    } else if (Array.isArray(erropt)) names = erropt, erropt = false;
    return (...args) => new Promise((res, rej) => 
        func(...args.slice(0, cbpos), 
        (err, ...a) => erropt ? 
            (err ? 
                rej(err) : 
                res(Array.isArray(names) ? 
                    patNameToObject(names, a) : 
                    a
                )
            ) 
        : res(Array.isArray(names) ? 
            patNameToObject(names, [err, ...a]) : 
            [err, ...a]
        ), 
        ...args.slice(cbpos, args.length))
    );
};

module.exports = wrapByPromise;
