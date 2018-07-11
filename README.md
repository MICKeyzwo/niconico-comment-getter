# niconico-comment-getter
ニコニコのコメントをゲットするやつです

## 使い方

```js
const Ncg = require("niconico-comment-getter.js");
const myNcg = new Ncg(mail, password);
myNcg.getComment("sm9").then(res => console.log(res));
```

## テスト

```js
npm test [コメントを取得する動画のid] [ニコニコの登録メアド] [メアドに対応したパスワード]
```
