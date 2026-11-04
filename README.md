# ToAPIs gift card (GitHub Pages)

- `index.html` — client redeem page (animated). Language from `l` hash param; default `en`.
- `make.html` — Claire's card maker (Chinese UI) with 「客户页语言」 selector (12 languages).
- `i18n.json` — all client-page / card-face strings for the 12 locales (same data inlined in both HTML files).
- `gif.js` + `gif.worker.js` — local gif.js 0.2.0 for「下载动图」(no CDN)

Link: `#n=<name>&c=<code>&a=<amount>&l=<lang>`; lang = en, zh-CN, zh-TW, es, pt-BR, fr, de, ja, ko, ar (RTL), ru, uk.
Make page buttons: 生成链接 / 复制邮件卡片 / 下载 PNG / 下载动图 / 复制链接. PNG/GIF/mail card follow the selected language.
