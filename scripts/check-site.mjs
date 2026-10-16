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
assert(spatialCss.includes('.site-header button,.site-header a{pointer-events:auto}'), 'Header links must accept pointer input');
assert(spatialCss.includes('--cursor-scene:url(') && !spatialCss.includes('cursor:grab'), '3D canvas must use the custom scene cursor');
assert(!spatialScene.includes("'grab'") && !spatialScene.includes("'grabbing'"), '3D scene must not use grab cursors');
assert(!/cursor:\s*grabb?(?:ing)?/.test(appCss), '2D pages must not use grab cursors');
assert(spatialScene.includes("else if(target?.type==='layer')setLayer(target.item.layer.id)"), '3D layer titles must switch to their layer when clicked');
assert(spatialCss.includes('--collection-blue:#1677ff') && html.includes('#1677ff') && !/247b50/.test(spatialCss + html + spatialScene), '3D navigation must use the original deep blue');
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
