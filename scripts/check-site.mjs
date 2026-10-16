import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const read = name => readFileSync(join(dist, name), 'utf8');
const projects = JSON.parse(read('projects.json'));
const original = JSON.parse(readFileSync(join(root, 'scripts/portfolio-source.json'), 'utf8'));
const html = read('index.html');
const flatHtml = read('2d/index.html');
const spatialCss = read('style.css');
const spatialScene = read('scene.js');
const spatialApp = read('app.js');
const appCss = readFileSync(join(root, 'src/App.css'), 'utf8');
const flatHeader = readFileSync(join(root, 'src/components/Header.tsx'), 'utf8');

function exists(url, from = '/') {
  if (!url || /^(?:#|https?:|mailto:|data:|\/\/)/.test(url)) return;
  const resolved = new URL(url.replaceAll('&amp;', '&'), 'https://www.yiranshu.com' + from);
  let file = join(dist, decodeURIComponent(resolved.pathname));
  assert(existsSync(file), `Missing local URL ${url} from ${from}`);
  if (statSync(file).isDirectory()) file = join(file, 'index.html');
  assert(existsSync(file), `Missing index for ${url}`);
}
for (const [name, text] of [['/index.html', html], ['/2d/index.html', flatHtml], ['/404.html', read('404.html')]]) {
  for (const [, url] of text.matchAll(/\b(?:href|src)="([^"]+)"/g)) exists(url, name);
}
exists('/studio/');
assert.equal(read('CNAME').trim(), 'www.yiranshu.com');
assert(existsSync(join(dist, '.nojekyll')));
assert(html.includes('href="./2d/"'));
assert(html.includes('<span aria-hidden="true">|</span><a href="./2d/"') && flatHeader.includes('<span aria-hidden="true">|</span>'), '3D and 2D view switches must use the same vertical separator as the language switch');
assert(spatialCss.includes('.portfolio-view-switch [aria-current=page],.portfolio-view-switch a{display:inline-flex;align-items:center;justify-content:center;flex:0 0 28px;width:28px') && spatialCss.includes('.portfolio-view-switch>span[aria-hidden]{display:block;align-self:center;flex:0 0 1px;width:1px;height:11px') && appCss.includes('.portfolio-view-switch [aria-current=page] { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 28px; width: 28px;') && appCss.includes('.portfolio-view-switch > span[aria-hidden="true"] { display: block; align-self: center; flex: 0 0 1px; width: 1px; height: 11px;'), '3D and 2D view separators must sit between equal-width labels as true centered vertical rules');
assert(spatialCss.includes('.site-header button,.site-header a{pointer-events:auto}'), 'Header links must accept pointer input');
assert(spatialCss.includes('--cursor-scene:url(') && spatialCss.includes("width='25' height='25'") && spatialCss.includes("fill='%23000' stroke='%23fff'") && spatialCss.includes("fill='%23fff' stroke='%23000'") && spatialCss.includes("stroke-linecap='round'") && !spatialCss.includes("stroke='%233aa7ff'") && !spatialCss.includes('cursor:grab'), '3D canvas must use the fuller rounded monochrome cursor');
assert(!spatialScene.includes("'grab'") && !spatialScene.includes("'grabbing'"), '3D scene must not use grab cursors');
assert(!/cursor:\s*grabb?(?:ing)?/.test(appCss), '2D pages must not use grab cursors');
assert(spatialScene.includes("else if(target?.type==='layer')setLayer(target.item.layer.id)"), '3D layer titles must switch to their layer when clicked');
assert(spatialScene.includes("glowContext.fillStyle='#fff'") && !spatialScene.includes('glowContext.shadowBlur') && spatialScene.includes('heading.glow.material.opacity=.22'), '3D layer title hover must brighten subtly without a broad glow');
assert(spatialScene.includes("const label=textPlane(card.project.title") && !spatialApp.includes("$('#hover-detail')"), '3D image labels and tooltips must show only the project title');
assert(spatialCss.includes('width:min(320px,calc(100vw - 20px));max-width:none;aspect-ratio:140/17;padding:0 16px') && spatialCss.includes('margin-bottom:0;font-size:13px') && spatialCss.includes('justify-content:flex-start;text-align:left'), '3D image tooltips must scale up proportionally with larger left-aligned titles');
assert(html.includes('id="color-mode"') && spatialApp.includes('spatial?.setColorMode(colorMode)') && spatialScene.includes('setColorMode(value)'), 'Color Mode must synchronize the interface and 3D scene');
assert(spatialCss.includes('html[data-color-mode=off]') && spatialCss.includes('filter:grayscale(1)') && spatialCss.includes('--collection-blue:#d7dce3'), 'Color Mode off must use bright silver accents and grayscale previews');
assert(spatialCss.includes('.hud-button{') && spatialCss.includes('.color-mode-toggle,.color-mode-toggle:hover,.color-mode-toggle:focus-visible,.color-mode-toggle[aria-pressed=true]{color:#929292}'), 'Color Mode controls must always match the default control icon gray');
assert(html.includes('</button><div class="language-switch" role="group" aria-label="Language / 语言">') && spatialCss.includes('.orientation .language-switch{position:static') && spatialCss.includes('width:132px;min-height:28px;color:#929292'), 'Language controls must sit below Color Mode with matching dimensions and neutral gray styling');
assert(spatialCss.includes('--collection-blue:#ff2020') && spatialScene.includes('value?0xff2020:0xd7dce3'), 'Color Mode on must retain the vivid red comparison color');
assert(spatialCss.includes('#auto-orbit[aria-pressed=true]{color:#929292}') && spatialCss.includes('#auto-orbit[aria-pressed=true] .orbit-play{display:none}') && spatialCss.includes('#auto-orbit[aria-pressed=true] .orbit-pause{display:block}'), 'Auto orbit must keep its neutral gray while only the badge symbol changes');
assert(spatialScene.includes('const layerEdgeThickness=.07*.75;') && spatialCss.includes('.orientation line{stroke:var(--collection-blue);stroke-width:.7}'), 'Layer X/Y edges must be slightly stronger while the orientation widget matches the collection plate');
assert(spatialCss.includes('stroke-width:.7;filter:drop-shadow(0 0 1px #1677ff66)') && spatialCss.includes('.collection-links path{opacity:.3') && spatialCss.includes('.collection-links path.active{opacity:.5}') && html.includes('data-link="digital architecture" stroke="url(#collection-link-horizontal)"') && html.includes('collection-link-down') && spatialCss.includes('.layer-dot{position:relative;display:block;width:12px;height:12px;border:1px solid currentColor') && spatialCss.includes('.layer-dot:after{content:"";position:absolute;inset:3px') && html.includes('href="#icon-layers"') && spatialCss.includes('.collection-all .hud-icon{width:21px;height:21px'), 'Collection plate must fully restore its original network, ring-dot nodes, and center layers icon');
assert(spatialCss.includes('.collection-node{font-size:13px}') && spatialCss.includes('.collection-node:hover .node-label,.collection-node.active .node-label,.collection-node:focus-visible .node-label{') && spatialCss.includes('0 0 42px var(--collection-glow)') && spatialCss.includes('0 0 46px var(--collection-glow)'), 'Collection labels must be 13px and glow with nodes using the stronger layered halo');
assert(spatialApp.includes("orbit=!matchMedia('(prefers-reduced-motion: reduce)').matches") && spatialApp.includes('spatial.setOrbit(orbit)'), '3D view must start orbiting unless reduced motion is requested');
assert(spatialScene.includes('controls.autoRotateSpeed = -.18') && !spatialScene.includes('clearHover();stopOrbit();'), '3D orbit must remain slow, clockwise, and resume after direct manipulation');
assert(flatHtml.includes('/2d/assets/'), 'The React bundle must load from /2d/');
assert(!existsSync(join(dist, '2d/images')), 'Shared images must retain their root URLs without duplication');

const developer = projects.filter(project => project.externalUrl);
assert.deepEqual(developer.map(project => [project.title, project.externalUrl, project.images[0].name]),
  original.developer.map(project => [project.title, project.link, project.img]));
for (const project of developer) {
  const links = [...html.matchAll(new RegExp(`data-external="${project.id}" href="([^"]+)"`, 'g'))];
  assert.equal(links.length, 2);
  links.forEach(link => assert.equal(link[1].replaceAll('&amp;', '&'), project.externalUrl));
}
let imageCount = 0;
for (const project of projects) {
  for (const image of project.images) {
    exists(image.image); exists(image.thumb); imageCount++;
  }
}
assert.equal(imageCount, 48);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length);
for (const name of ['app.js', 'scene.js']) {
  for (const [, id] of read(name).matchAll(/\$\('#([\w-]+)'\)/g)) assert(ids.includes(id), `Missing UI target: ${id}`);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const originals = walk(join(root, 'public/images'));
for (const file of originals) exists('/' + relative(join(root, 'public'), file));

// Exercise real old URLs and new work links, including query strings and
// independently hosted projects, without requiring a WebGL browser.
function redirects(code, url, changeHash) {
  const parsed = new URL(url, 'https://www.yiranshu.com');
  const result = [];
  const listeners = {};
  const location = { pathname: parsed.pathname, hash: parsed.hash, search: parsed.search, replace: value => result.push(value) };
  vm.runInNewContext(code, { location, window: { addEventListener: (name, fn) => { listeners[name] = fn; } } });
  if (changeHash) { location.hash = changeHash; listeners.hashchange?.(); }
  return result;
}
const redirect = read('legacy-routes.js');
assert.deepEqual(redirects(redirect, '/#/architecture'), ['/2d/#/architecture']);
assert.deepEqual(redirects(redirect, '/?ref=archive#/contact?sent=1'), ['/2d/?ref=archive#/contact?sent=1']);
assert.deepEqual(redirects(redirect, '/#/'), ['/2d/#/']);
assert.deepEqual(redirects(redirect, '/'), []);
assert.deepEqual(redirects(redirect, '/#work/the-tool/2'), []);
assert.deepEqual(redirects(redirect, '/#/unknown'), []);
assert.deepEqual(redirects(redirect, '/', '#/digital-fabrication'), ['/2d/#/digital-fabrication']);
const notFoundScript = read('404.html').match(/<script>([\s\S]*?)<\/script>/)[1];
assert.deepEqual(redirects(notFoundScript, '/architecture'), ['/2d/#/architecture']);
assert.deepEqual(redirects(notFoundScript, '/2d/contact?sent=1'), ['/2d/#/contact?sent=1']);
assert.deepEqual(redirects(notFoundScript, '/nuwa-creation/'), []);
assert.deepEqual(redirects(notFoundScript, '/missing-project/'), []);
console.log(`Checked 3D + 2D build, ${originals.length} original images, ${imageCount} 3D images, ${developer.length} unchanged Developer links, domain, UI targets and 11 routing cases.`);
