# ToAPIs gift card (GitHub Pages)

- `index.html` — customer redeem page (animated). Language from `l` (hash params).
- `make.html` — Claire's card maker (Chinese UI): 客户名 / 兑换码 / 金额 / 客户页语言 (12).
- `cardface.js` — shared card-face renderer (used by both pages, so PNG/GIF/mail card and the customer page are identical).
- `i18n.json` — all client-page / card-face strings for the 12 locales (same data inlined in both HTML files).
- `bg_blank.png` — default holo orange background, fully opaque (corner-fixed).
- `gif.js` + `gif.worker.js` — local gif.js 0.2.0 for「下载动图」(no CDN; already in repo).
- Fonts `Inter.ttf` / `InterTight.ttf` / `JetBrainsMono.ttf` — already in repo.

Card face: no chip; bold white `toapis.com` bottom-right; bottom tip = `cardTap` of the chosen language
(zh-CN: 点击卡片，将自动复制兑换码并前往页面兑换).

Link: `#n=<name>&c=<code>&a=<amount>&l=<lang>`
- lang = en, zh-CN, zh-TW, es, pt-BR, fr, de, ja, ko, ar (RTL), ru, uk (default en)
- URL param `t` / `theme` is ignored (default card only).

Click / CTA: copies the code, then opens `https://toapis.com/login?aff=zjQg&redirect=/dashboard/billing`.

Rounded corners: radius 40 on a 1149×672 card (CSS 3.5%/6%). The PNG/mail card is clipped in canvas (transparent AA corners);
the customer page clips with CSS only (`clip:false`) to avoid a double anti-aliased edge.
