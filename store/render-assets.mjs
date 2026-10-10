// Génère assets/ (icône, premier plan adaptatif, fond, splash) à partir de store/icon.svg
// Usage : node store/render-assets.mjs store/icon.svg assets (Playwright + Chromium requis), puis
// npx @capacitor/assets@3 generate --android --iconBackgroundColor "#0b1018" --splashBackgroundColor "#0b1018"
// (remettre android/app/src/main/AndroidManifest.xml avec git checkout : l outil le reformate)
import { chromium } from 'playwright'
import { readFileSync } from 'fs'
const [svgPath, outDir] = process.argv.slice(2)
const svg = readFileSync(svgPath, 'utf8')
const b = await chromium.launch({executablePath: process.env.HOME+'/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'})
const p = await b.newPage({ viewport: { width: 1024, height: 1024 } })
const shot = async (html, file, w = 1024, h = 1024, transparent = false) => {
  await p.setViewportSize({ width: w, height: h })
  await p.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`)
  await p.screenshot({ path: `${outDir}/${file}`, omitBackground: transparent })
}
const fgOnly = svg.replace(/<rect width="1024" height="1024" fill="url\(#bg\)"\/>/, '')
// icône complète
await shot(svg.replace('<svg ', '<svg width="1024" height="1024" '), 'icon-only.png')
// premier plan adaptatif : ballon réduit dans la zone sûre (66 %)
await shot(fgOnly.replace('<svg ', '<svg width="1024" height="1024" ').replace('<g id="fg">', '<g id="fg" transform="translate(512 505) scale(1.25) translate(-512 -505)">'), 'icon-foreground.png', 1024, 1024, true)
await shot('<div style="width:1024px;height:1024px;background:linear-gradient(135deg,#1a2233,#0b1018)"></div>', 'icon-background.png')
// splash : ballon centré sur fond sombre
const ballSvg = fgOnly.replace('<svg ', '<svg width="900" height="900" ')
await shot(`<div style="width:2732px;height:2732px;background:#0b1018;display:flex;align-items:center;justify-content:center">${ballSvg}</div>`, 'splash.png', 2732, 2732)
await shot(`<div style="width:2732px;height:2732px;background:#0b1018;display:flex;align-items:center;justify-content:center">${ballSvg}</div>`, 'splash-dark.png', 2732, 2732)
await b.close()
