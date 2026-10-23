import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
// Original artwork rendered from HTML/CSS, with a fixed illustrative stack.
// Run `bun scripts/make-poster.ts` after installing Playwright's Chromium.
const palette = ['#d2eab5', '#e9ba7d', '#b7a3dd', '#95c9bc', '#dc947f', '#9db6da', '#d5cd92'];
const stack = [
  [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,3,0,0,0,0], [0,0,3,3,3,0,0,0],
  [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0], [0,0,0,0,0,0,2,2],
  [1,1,1,1,0,0,2,2], [6,0,4,4,0,7,7,7], [6,6,6,4,4,0,0,7], [5,5,3,3,3,0,2,2],
];
const cells = stack.flatMap((row,y) => row.map((v,x) => `<i style="grid-area:${y+1}/${x+1};${v ? `background:${palette[v-1]};box-shadow:inset 0 3px #ffffff40,inset 0 -3px #00000018` : ''}"></i>`)).join('');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;background:#f2f1e9;color:#242a22;font-family:Arial,sans-serif}.top{display:flex;justify-content:space-between;padding:58px 62px;border-bottom:1px solid #d3d7c9;font-size:16px;letter-spacing:2px}.logo{font-size:32px;font-weight:900;letter-spacing:-2px}.content{display:flex;padding:74px 62px;gap:56px}.copy{flex:1;padding-top:50px}.label{font-size:13px;letter-spacing:3px;color:#687f52}h1{font-size:123px;line-height:.95;letter-spacing:-7px;font-weight:500;margin:38px 0}em{font-family:Georgia,serif;color:#6a7f53;font-weight:400}p{font-size:25px;line-height:1.6;color:#606858}.cta{display:inline-block;border-radius:5px;background:#d4efb5;padding:23px 28px;font-size:20px;margin-top:24px}.cabinet{width:400px;background:#171a18;border-radius:12px;padding:26px;color:#f3f1e8;transform:rotate(3deg);box-shadow:0 30px 50px #26321b22}.cabinet-title{font-size:26px;font-weight:900;letter-spacing:-1px;margin:0 0 22px}.board{display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(16,1fr);aspect-ratio:1/2;background:#111611;border:1px solid #414b3b}.board i{border:1px solid #263020}.buttons{display:flex;gap:8px;margin-top:20px}.buttons span{flex:1;text-align:center;background:#293024;border:1px solid #46503d;border-radius:4px;padding:12px;font-size:20px}.bottom{position:absolute;bottom:58px;left:62px;right:62px;display:flex;justify-content:space-between;font-size:14px;letter-spacing:1px;color:#6c735f}</style></head><body><div class="top"><span class="logo">dropfield ↘</span><span>SMALL GAMES, OPEN WEB</span></div><div class="content"><div class="copy"><div class="label">ONE BLOCK AT A TIME</div><h1>A little<br>space to<br><em>stack.</em></h1><p>Find your rhythm.<br>Make room. Go again.</p><div class="cta">Let’s play &nbsp; ↗</div></div><div class="cabinet"><div class="cabinet-title">dropfield ↘</div><div class="board">${cells}</div><div class="buttons"><span>←</span><span>↻</span><span>→</span><span>↡</span></div></div></div><div class="bottom"><span>NO SIGN-IN. JUST PLAY.</span><span>AN OPEN-SOURCE ARCADE</span></div></body></html>`);
  await page.screenshot({ path: resolve(import.meta.dir, '../examples/dropfield/poster.png') });
} finally { await browser.close(); }
