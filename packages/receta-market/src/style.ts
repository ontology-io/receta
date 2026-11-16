// The registry pages' one stylesheet and one script, from design/receta-website.pen
// (the "Market · …" frames). The custom properties are the design's variables; the
// lengths are its pixels. Desktop is drawn at 1440, the phone at 390.

/**
 * The design's two voices, self-hosted from @fontsource; scripts/bundle.ts copies the files.
 * Newsreader keeps its optical-size axis, set with font-optical-sizing: none, which is the
 * cut Pen draws and the website serves. A static file is 5% wider and breaks lines early.
 */
export const FONT_FILES = [
  'newsreader-latin-opsz-normal.woff2',
  'newsreader-latin-opsz-italic.woff2',
  'ibm-plex-mono-latin-400-normal.woff2',
  'ibm-plex-mono-latin-500-normal.woff2',
  'ibm-plex-mono-latin-600-normal.woff2',
] as const

const face = (basePath: string, family: string, file: string, weight: number, style: string): string =>
  `@font-face{font-family:'${family}';src:url(${basePath}/fonts/${file}) format('woff2');font-weight:${weight};font-style:${style};font-display:swap}`

const fonts = (basePath: string): string =>
  face(basePath, 'Newsreader', 'newsreader-latin-opsz-normal.woff2', 400, 'normal') +
  face(basePath, 'Newsreader', 'newsreader-latin-opsz-italic.woff2', 400, 'italic') +
  face(basePath, 'IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', 400, 'normal') +
  face(basePath, 'IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', 500, 'normal') +
  face(basePath, 'IBM Plex Mono', 'ibm-plex-mono-latin-600-normal.woff2', 600, 'normal')

const CSS = `
:root{--ink:#14110e;--ink-2:#1f1a16;--ink-3:#2b2520;--ink-line:#453c33;--on-ink:#f3ede2;--on-ink-2:#b5aa9b;--on-ink-3:#8c8174;--paper:#f3ede2;--paper-2:#e8e0d1;--paper-line:#cfc4b1;--on-paper:#16130f;--on-paper-2:#574e43;--on-paper-3:#665c51;--err:#e2461c;--err-text:#b5320c;--ok:#17694a;--ok-on-ink:#5cc595;--warn:#f0b429;--black:#14110e;--human:'Newsreader',Georgia,serif;--machine:'IBM Plex Mono',ui-monospace,monospace;color-scheme:light}
*{box-sizing:border-box}
/* Newsreader at its default optical size, as Pen draws it; at auto, display sizes run wider.
   Important, because every font shorthand below would reset it to auto. */
*,::before,::after{font-optical-sizing:none!important}
html{background:var(--ink);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--on-paper);font:400 21px/1.35 var(--human)}
a{color:inherit}
code{font-family:var(--machine);font-size:.82em}
button{font:inherit;color:inherit}
.wrap{max-width:1440px;margin:0 auto;position:relative}
.icon{flex:none;display:block}
.mono{font-family:var(--machine)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

/* Header: the site's nav, then the market bar with the crumbs and who is signed in. */
.top{background:var(--ink);color:var(--on-ink)}
.nav{height:84px;padding:0 64px;display:flex;justify-content:space-between;align-items:center}
.logo{display:flex;align-items:flex-end;gap:3px;font:400 32px/1 var(--human);letter-spacing:-.6px;text-decoration:none}
.logo .dot,.stop{display:inline-block;border-radius:50%;background:var(--err)}
.logo .dot{width:8px;height:8px;margin-bottom:6px}
.links{display:flex;gap:40px;list-style:none;margin:0;padding:0;font:400 14px/1.3 var(--machine)}
.links a{color:var(--on-ink-2);text-decoration:none}
.links a:hover{color:var(--on-ink)}
.links a[aria-current]{color:var(--on-ink);text-decoration:underline 2px var(--err);text-underline-offset:9px}
.links .install a{color:var(--on-ink);font-weight:500}
.menu{display:none;position:relative}
.menu summary{list-style:none;cursor:pointer;color:var(--on-ink)}
.menu summary::-webkit-details-marker{display:none}
.menu ul{position:absolute;right:-8px;top:36px;z-index:2;display:flex;flex-direction:column;gap:14px;min-width:180px;margin:0;padding:18px 20px;list-style:none;background:var(--ink-2);font:400 15px/1.3 var(--machine)}
.menu a{text-decoration:none}
.bar{border-top:1px solid var(--ink-line)}
.bar .wrap{min-height:48px;padding:0 64px;display:flex;justify-content:space-between;align-items:center;gap:24px;font:400 13px/1.3 var(--machine);color:var(--on-ink-3)}
.crumbs{display:flex;gap:10px;align-items:center;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.crumbs .root{color:var(--on-ink);font-weight:500;letter-spacing:1.8px;text-decoration:none}
.crumbs a{text-decoration:none}
.crumbs .trail{display:flex;gap:10px;align-items:center}
.session{display:flex;gap:10px;align-items:center;white-space:nowrap;font-size:14px;color:var(--on-ink-2)}
.session a,.session button{color:var(--on-ink);text-decoration:underline;text-underline-offset:3px;background:none;border:0;padding:0;cursor:pointer;font:inherit}
.session form{display:inline}
.session.off{color:var(--on-ink-3)}

/* Sections: a background, the rail at x=104, and content from x=160 to x=1376. */
.sec{background:var(--bg);color:var(--fg);--bg:var(--paper);--fg:var(--on-paper);--rail:var(--on-paper);--muted:var(--on-paper-3);--soft:var(--on-paper-2);--line:var(--paper-line)}
.sec.ink{--bg:var(--ink);--fg:var(--on-ink);--rail:var(--on-ink-3);--muted:var(--on-ink-3);--soft:var(--on-ink-2);--line:var(--ink-line)}
.sec.paper-2{--bg:var(--paper-2)}
.sec>.wrap{padding:96px 64px 104px 160px}
.sec>.wrap::before{content:'';position:absolute;left:102.5px;top:0;bottom:0;width:3px;background:var(--rail)}
.sec:last-of-type>.wrap{padding-bottom:112px}
.mark{position:absolute}
.token{left:89px;top:81px;width:30px;height:30px;border-radius:50%;background:var(--ok)}
.ink .token{background:var(--ok-on-ink)}
.station{left:92px;top:96px;width:24px;height:24px;border-radius:50%;background:var(--bg);border:3px solid var(--rail)}
.tile{left:84px;top:82px;width:40px;height:52px;padding:7px 6px;display:flex;flex-direction:column;gap:4px;background:var(--ink-3)}
.tile i{display:block;height:3px;background:var(--on-ink-3)}
.tile i:nth-child(1){width:93%}.tile i:nth-child(2){width:64%}.tile i:nth-child(3){width:86%}.tile i:nth-child(4){width:50%}
.tile.empty{background:var(--bg);border:3px solid var(--rail)}

.eyebrow{margin:0;font:500 13px/1.3 var(--machine);letter-spacing:1.8px;text-transform:uppercase;color:var(--muted)}
.display{margin:20px 0 0;font:400 96px/1.03 var(--human);letter-spacing:-2.4px}
.stop{width:18px;height:18px;margin-left:8px}
.head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px 40px;flex-wrap:wrap}
h2{margin:16px 0 0;font:400 62px/1.05 var(--human);letter-spacing:-1.4px}
.aside{margin:0;max-width:384px;font-style:italic;font-size:21px;line-height:1.35;color:var(--soft)}
.lede{margin:28px 0 0;max-width:760px;font-size:25px;line-height:1.4;color:var(--soft)}
.later{margin:0;font-style:italic;color:var(--soft)}
.more{display:inline-flex;gap:10px;align-items:center;margin-top:32px;font-size:22px;font-style:italic;text-decoration:none}
.more:hover{text-decoration:underline}

/* The connect command: the one action, in red. */
.connect{margin-top:56px;display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.cmd{display:flex;align-items:center;gap:20px;max-width:100%;padding:18px 24px;background:var(--err);color:var(--black);font:500 17px/1.4 var(--machine)}
.cmd .prompt{opacity:.7;font-weight:400}
.cmd .label{display:none}
.cmd code{font:inherit;overflow-wrap:anywhere}
.copy{display:inline-flex;gap:8px;align-items:center;padding:0;border:0;background:none;cursor:pointer;color:inherit;font:400 14px/1 var(--machine)}
.copy.done .label{display:none}
.copy.done::after{content:'Copied'}
.then{margin:0;font-style:italic;font-size:21px;color:var(--soft)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:56px;margin:80px 0 0;padding:0;list-style:none}
.steps li{border-top:1px solid var(--line);padding-top:20px}
.steps h3{display:flex;gap:12px;margin:0 0 12px;font:500 13px/1.3 var(--machine);letter-spacing:1.8px;text-transform:uppercase}
.steps .n{color:var(--err);font-weight:600}
.steps p{margin:0;font-size:21px;line-height:1.35;color:var(--soft)}
.guard{display:flex;gap:14px;align-items:center;margin:64px 0 0;font-size:30px;line-height:1.2}
.guard .icon{color:var(--warn)}
.note{display:flex;gap:10px;align-items:center;margin:20px 0 0;font:400 14px/1.5 var(--machine);color:var(--soft)}

/* The category index: two columns whose rows line up. */
.index{display:grid;grid-template-columns:1fr 1fr;column-gap:64px;margin:48px 0 0;padding:0;list-style:none;border-bottom:1px solid var(--line)}
.index a{display:block;height:100%;padding:18px 0 20px;border-top:1px solid var(--line);text-decoration:none}
.index a:hover .name{text-decoration:underline}
.index .row-top{display:flex;justify-content:space-between;align-items:center;gap:16px}
.index .name{font:500 19px/1.3 var(--machine)}
.index .all .name{font:italic 400 22px/1.3 var(--human)}
.index .count{display:flex;gap:10px;align-items:center;font:400 15px/1 var(--machine);color:var(--muted)}
.index .about{display:block;margin:6px 0 0;font-size:20px;line-height:1.3;color:var(--soft)}

/* Lists of functions: offered, most wanted, a category, all of them. */
.list{margin:40px 0 0;padding:0;list-style:none;border-bottom:1px solid var(--line)}
.item{display:flex;gap:48px;padding:28px 0 30px;border-top:1px solid var(--line)}
.item .main{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
.item .side{flex:none;width:340px;display:flex;justify-content:flex-end;align-items:flex-start;padding-top:4px}
.ranked .item{gap:32px;padding:26px 0 28px}
.rank{flex:none;width:40px;font-size:34px;line-height:1;color:var(--muted)}
.title-line{display:flex;align-items:center;gap:8px 14px;flex-wrap:wrap}
.fn{font:400 21px/1.3 var(--machine);text-decoration:none;overflow-wrap:anywhere}
.fn .cat{color:var(--muted)}
.fn b{font-weight:600}
a.fn:hover b{text-decoration:underline}
.summary{margin:0;font-size:22px;line-height:1.35}
.ranked .summary,.plain .summary{color:var(--soft)}
.why{margin:0;font-style:italic;font-size:19px;line-height:1.35;color:var(--soft)}
.meta{margin:0;font:400 13px/1.5 var(--machine);color:var(--muted)}
.meta a{color:var(--soft)}
.sig{margin:0;font:400 14px/1.5 var(--machine);color:var(--muted);overflow-wrap:anywhere}
.empty-state{padding:36px 0 40px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:40px}
.empty-state h3{margin:0;font-weight:400;font-size:30px;line-height:1.3}
.empty-state p{margin:10px 0 0;max-width:720px;font-style:italic;font-size:21px;line-height:1.4;color:var(--soft)}
.empty-state .more{margin-top:18px}

.badge{display:inline-flex;align-items:center;padding:4px 8px;border-radius:3px;font:600 12px/16px var(--machine);letter-spacing:1.2px;text-transform:uppercase;white-space:nowrap}
.badge.unreviewed{background:var(--warn);color:var(--black)}
.badge.reviewed{box-shadow:inset 0 0 0 1.5px var(--ok);color:var(--ok)}
.badge.declined{box-shadow:inset 0 0 0 1.5px var(--on-paper-3);color:var(--on-paper-3)}

/* Counts: people's votes, then agents' reports, counted apart. */
.counts{display:inline-flex;align-items:center;gap:14px;font:500 15px/1.3 var(--machine);color:var(--on-paper-3);white-space:nowrap}
.counts .votes{font-weight:600;color:var(--on-paper)}
.counts .rule{width:1px;height:16px;background:var(--paper-line)}
.counts .agents{font-size:13px}
.worked.some{color:var(--ok)}
.failed.some{color:var(--err-text)}

/* A function's own page. */
.detail>.wrap{padding-top:72px}
.back{display:inline-flex;gap:8px;align-items:center;font:500 13px/1.3 var(--machine);letter-spacing:1.8px;text-transform:uppercase;color:var(--muted);text-decoration:none}
.back:hover{color:var(--fg)}
.title-row{display:flex;align-items:center;gap:12px 20px;flex-wrap:wrap;margin-top:18px}
h1.fn{margin:0;font-size:42px;line-height:1.2;letter-spacing:-.6px}
.count-of{font:400 21px/1 var(--machine);color:var(--muted)}
.summary-lg{margin:20px 0 0;max-width:860px;font-size:30px;line-height:1.3}
.cols{display:flex;gap:64px;align-items:flex-start;margin-top:48px}
.cols .main{flex:1;min-width:0;display:flex;flex-direction:column;gap:40px}
.warning{display:flex;gap:18px;padding:22px 26px;border-radius:3px;background:var(--warn);color:var(--black)}
.warning h2{margin:0;font-size:25px;line-height:1.2;letter-spacing:0}
.warning p{margin:6px 0 0;font-size:19px;line-height:1.4}
.review-note{margin:0;font-style:italic;font-size:21px;color:var(--soft)}
.use-when .text{margin:12px 0 0;font-size:22px;line-height:1.45}
.facts{margin:0;border-bottom:1px solid var(--line)}
.fact{display:flex;gap:24px;padding:18px 0;border-top:1px solid var(--line)}
.fact dt{flex:none;width:180px;padding-top:5px;font:500 13px/1.3 var(--machine);letter-spacing:1.8px;text-transform:uppercase;color:var(--muted)}
.fact dd{flex:1;min-width:0;margin:0;font-size:22px;line-height:1.35}
.fact .mono{font-size:17px;line-height:1.5;overflow-wrap:anywhere}
.fact .soft{color:var(--soft)}
.fact .import{display:flex;justify-content:space-between;align-items:center;gap:16px;font:400 15px/1.5 var(--machine)}
.fact .import code{font-size:inherit;overflow-wrap:anywhere}
.fact .link{display:inline-flex;gap:12px;align-items:center;flex-wrap:wrap;font:500 17px/1.4 var(--machine);text-decoration:none}
.fact .link .key{text-decoration:underline;text-underline-offset:3px}
.fact .tags{font-size:15px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{padding:5px 10px;border:1px solid var(--line);border-radius:3px;font:400 14px/1.3 var(--machine)}
.chip.remeda{color:var(--soft)}
.tally{flex:none;width:352px;padding:28px 28px 32px;background:var(--paper-2)}
.big{display:flex;align-items:flex-end;gap:10px;padding:10px 0 18px}
.big .n{font-size:76px;line-height:1;letter-spacing:-1.6px}
.big .unit{padding-bottom:10px;font:400 15px/1 var(--machine);color:var(--soft)}
.big.off .n{color:var(--muted)}
.you-voted{display:flex;gap:8px;align-items:center;padding-bottom:12px;font:500 14px/1.3 var(--machine);color:var(--ok)}
.btn{display:flex;width:100%;justify-content:center;align-items:center;gap:10px;padding:12px 18px;border:0;border-radius:0;background:none;box-shadow:inset 0 0 0 1.5px var(--on-paper);color:var(--on-paper);font:500 15px/20px var(--machine);text-decoration:none;cursor:pointer}
.btn.primary{background:var(--err);box-shadow:none;color:var(--black);font-weight:600}
.btn.closed{box-shadow:none;color:var(--on-paper-3);cursor:default}
.tally form{margin:0}
.help{margin:12px 0 0;font-style:italic;font-size:18px;line-height:1.35;color:var(--soft)}
.tally hr{margin:24px 0;border:0;border-top:1px solid var(--line)}
.reports{display:flex;gap:20px;margin:12px 0 10px;font:500 19px/1.3 var(--machine);color:var(--muted)}
.reports .worked{font-weight:600}
.place{margin:10px 0 0;font:500 17px/1.3 var(--machine)}
.near{margin:6px 0 0;padding:0;list-style:none}
.near li{padding:8px 0}
.near a{font:500 15px/1.4 var(--machine)}
.near p{margin:3px 0 0;font-size:17px;line-height:1.3;color:var(--soft)}

/* Code: the whole file, numbered, ready to copy. */
.code{margin-top:48px;background:var(--ink);color:var(--on-ink)}
.code-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 24px;background:var(--ink-2);font:400 14px/1.3 var(--machine)}
.code-head .file{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.code-head .status{font-size:13px;color:var(--ok-on-ink)}
.code-head .status.unchecked{color:var(--warn)}
.code-head .copy{color:var(--on-ink-2)}
.code pre{margin:0;padding:20px 24px 24px 0;overflow-x:auto;font:400 14px/1.7 var(--machine);counter-reset:line}
.code pre code{font:inherit}
.line::before{counter-increment:line;content:counter(line);display:inline-block;width:48px;margin-right:20px;text-align:right;font-size:13px;color:var(--on-ink-3)}
.line.doc{color:var(--on-ink-2)}
.line.ex{color:var(--ok-on-ink)}

.foot{background:var(--ink);color:var(--on-ink)}
.foot .wrap{display:flex;justify-content:space-between;align-items:center;gap:16px 32px;flex-wrap:wrap;padding:32px 64px 36px}
.foot .logo{font-size:30px}
.foot .pkg{font:400 14px/1.3 var(--machine);letter-spacing:.2px;color:var(--on-ink-3)}
.foot ul{display:flex;gap:28px;margin:0;padding:0;list-style:none}
.foot ul a{display:inline-flex;gap:7px;align-items:center;font-style:italic;font-size:22px;text-decoration:none}

@media (max-width:1100px){
.cols{flex-direction:column}
.tally{width:100%}
.item{flex-direction:column;gap:14px}
.item .side{width:auto;justify-content:flex-start}
.ranked .item{flex-direction:row;flex-wrap:wrap}
.ranked .item .side{flex-basis:100%;padding-left:72px}
.steps{grid-template-columns:1fr;gap:0}
.steps li{padding-bottom:22px}
.links{gap:24px}
}

/* The phone: the rail moves to the edge, x=22, and content runs from x=48. */
@media (max-width:760px){
body{font-size:18px}
.nav{height:68px;padding:0 24px}
.logo{font-size:27px}
.links{display:none}
.menu{display:block}
.bar .wrap{padding:13px 24px;min-height:0;font-size:12px}
.crumbs .root{letter-spacing:1.4px}
.crumbs .trail,.session .as{display:none}
.session{font-size:13px;gap:8px}
.sec>.wrap,.detail>.wrap{padding:44px 24px 56px 48px}
.sec:last-of-type>.wrap{padding-bottom:56px}
.sec>.wrap::before{left:20.5px}
.token{left:12px;top:42px;width:20px;height:20px}
.station{left:15px;top:45px;width:14px;height:14px}
.tile{left:10px;top:38px;width:24px;height:30px;padding:5px 4px;gap:3px}
.tile i{height:2px}
.eyebrow,.back,.fact dt,.steps h3{font-size:12px;letter-spacing:1.4px}
.display{margin-top:14px;font-size:56px;line-height:1.02;letter-spacing:-1.6px}
.stop{width:11px;height:11px;margin-left:5px}
h2{margin-top:10px;font-size:40px;letter-spacing:-.9px}
.aside,.lede{font-size:18px}
.lede{margin-top:20px;font-size:20px}
.connect{margin-top:36px;gap:12px;align-items:stretch}
.cmd{display:block;padding:14px 16px;font-size:13px;line-height:1.55}
.cmd .prompt{margin-right:8px}
.cmd .copy{display:flex;margin-top:12px;font-size:13px;font-weight:600}
.cmd .label{display:inline}
.then,.steps p{font-size:18px}
.steps{margin-top:40px}
.steps li{padding:16px 0 22px}
.guard{margin-top:16px;font-size:22px;align-items:flex-start}
.note{font-size:12px;align-items:flex-start}
.index{grid-template-columns:1fr;margin-top:28px}
.index a{padding:14px 0 16px}
.index .name{font-size:16px}
.index .about{font-size:17px}
.list{margin-top:24px}
.item,.ranked .item{padding:18px 0 20px;gap:8px}
.ranked .item{gap:14px}
.rank{width:18px;font-size:24px}
.ranked .item .side{padding-left:32px}
.fn{font-size:16px}
.summary{font-size:18px}
.why{font-size:16px}
.counts{flex-wrap:wrap;gap:6px 10px;font-size:14px}
.counts .votes{flex-basis:100%}
.counts .rule{display:none}
.counts .agents{font-size:12px}
.more{font-size:20px}
h1.fn{font-size:26px}
.summary-lg{font-size:22px}
.cols{margin-top:32px}
.fact{flex-direction:column;gap:6px}
.fact dt{width:auto;padding:0}
.fact dd{font-size:19px}
.fact .mono{font-size:15px}
.warning{padding:18px;gap:12px}
.warning h2{font-size:21px}
.warning p{font-size:17px}
.code pre{font-size:12px}
.line::before{width:28px;margin-right:12px;font-size:11px}
.code-head{padding:12px 16px}
.empty-state h3{font-size:24px}
.empty-state p{font-size:18px}
.foot .wrap{flex-direction:column;align-items:flex-start;padding:28px 24px 32px}
.foot ul a{font-size:19px}
}
`

/** The stylesheet for pages served under `basePath`, which the font URLs start with. */
export const stylesheet = (basePath: string): string => fonts(basePath) + CSS

/**
 * Copies the text of the element a `[data-copy]` button names. It is the page's only
 * script, allowed by its hash in the Content-Security-Policy.
 */
export const SCRIPT =
  "document.addEventListener('click',function(e){var b=e.target instanceof Element&&e.target.closest('[data-copy]');if(!b)return;var t=document.getElementById(b.getAttribute('data-copy'));if(!t||!navigator.clipboard)return;navigator.clipboard.writeText(t.textContent||'').then(function(){b.classList.add('done');setTimeout(function(){b.classList.remove('done')},1600)})})"

/** sha256 of SCRIPT, base64. A test keeps the two in step. */
export const SCRIPT_HASH = 'sha256-0O59OM2JRN4UJesmpNZhxDSSl1+wEaBToAJshud+T5M='
