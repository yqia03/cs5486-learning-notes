import assert from 'node:assert/strict';
import { root, read, json, write, sha, all, attr, article, fingerprint, args, parse, fs, path } from './lib.mjs';
import { prepareIndex, search } from '../web/search-core.js';

const source = await json('source/manifest.json');
const site = await json('dist/site-manifest.json');
const options = args();
const failures = [], totals = {};
async function check(label, fn) { try { await fn(); } catch (error) { failures.push(`${label}: ${error.message}`); } }
const documents = new Map();
async function files(dir) {
  const output = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await files(p)); else output.push(p);
  }
  return output;
}
for (const p of await files(path.join(root, 'dist'))) {
  if (!p.endsWith('.html')) continue;
  const html = await fs.readFile(p, 'utf8');
  const doc = parse(html);
  documents.set(p, doc);
  await check(path.relative(root, p), () => {
    assert(!/\/Users\/|file:\/\/|\/private\/|localhost:\d|127\.0\.0\.1/.test(html), 'local machine reference leaked');
    assert.equal(all(doc, n => n.tagName === 'main').length, 1, 'one main landmark');
    assert.equal(all(doc, n => n.tagName === 'h1').length, 1, 'one page heading');
    assert.equal(all(doc, n => n.tagName === 'iframe').length, 0, 'no iframe content');
    const ids = all(doc, n => attr(n, 'id')).map(n => attr(n, 'id'));
    assert.equal(new Set(ids).size, ids.length, 'duplicate DOM IDs');
    for (const node of all(doc)) {
      for (const a of node.attrs) {
        if (a.name === 'aria-labelledby' || a.name === 'aria-describedby') for (const id of a.value.split(/\s+/)) assert(ids.includes(id), `missing accessible label ${id}`);
        for (const match of a.value.matchAll(/url\(#([^)]+)\)/g)) assert(ids.includes(match[1]), `broken SVG reference ${match[1]}`);
      }
      if (node.tagName === 'img') {
        assert(attr(node, 'alt'), 'image needs alt text');
        assert(Number(attr(node, 'width')) > 0 && Number(attr(node, 'height')) > 0, 'image dimensions missing');
      }
    }
  });
}
for (const w of source.weeks) {
  for (const [key, count] of Object.entries(w.baseline.counts)) totals[key] = (totals[key] || 0) + count;
  await check(`Week ${w.id} fidelity`, async () => {
    const imported = await read(`source/weeks/${w.id}.html`);
    assert.equal(sha(imported), w.importedSha256, 'imported source was manually modified; re-import instead');
    assert.deepEqual(fingerprint(parse(imported)), w.baseline, 'imported text or structural fingerprint changed');
    assert.deepEqual(fingerprint(documents.get(path.join(root, `dist/weeks/${w.id}/index.html`))), w.baseline, 'built content differs from imported baseline');
    if (options.originals) {
      const bytes = await fs.readFile(path.resolve(root, options.originals, w.filename));
      assert.equal(sha(bytes), w.originalSha256, 'original changed since import');
    }
    const built = documents.get(path.join(root, `dist/weeks/${w.id}/index.html`));
    const images = all(article(built), n => n.tagName === 'img');
    assert.equal(images.length, w.images.length);
    for (const [i, image] of w.images.entries()) {
      const data = await fs.readFile(path.join(root, 'dist/assets/materials', image.file));
      assert.equal(sha(data), image.sha256, 'image binary mismatch');
      assert.equal(attr(images[i], 'alt'), image.alt, 'image description changed');
    }
    for (const h of site.weeks.find(v => v.id === w.id).headings) assert(all(built, n => attr(n, 'id') === h.id).length === 1, 'missing heading anchor');
  });
}
let links = 0;
for (const [p, doc] of documents) {
  const relative = path.relative(path.join(root, 'dist'), p).split(path.sep).join('/');
  const pageURL = new URL(site.base + relative, 'https://example.invalid');
  for (const node of all(doc)) for (const name of ['src', 'href']) {
    const value = attr(node, name);
    if (!value || /^(https?:|data:|mailto:)/.test(value)) continue;
    links++;
    await check(`${relative} → ${value}`, async () => {
      const target = new URL(value, pageURL);
      assert(target.pathname.startsWith(site.base), 'link escapes project subpath');
      const file = path.join(root, 'dist', decodeURIComponent(target.pathname.slice(site.base.length)) + (target.pathname.endsWith('/') ? 'index.html' : ''));
      assert((await fs.stat(file)).isFile(), 'missing resource');
      if (target.hash) {
        const targetDoc = documents.get(file);
        assert(targetDoc, 'fragment must point to an HTML page');
        assert(all(targetDoc, n => attr(n, 'id') === decodeURIComponent(target.hash.slice(1))).length === 1, 'broken fragment');
      }
    });
  }
}
await check('Search content and matching', async () => {
  const raw = await json('dist/search-index.json'), index = prepareIndex(raw);
  assert.equal(new Set(raw.map(r => r.week)).size, 12);
  for (const query of ['感知机', 'SVM', 'svm', 'Hopfield', '隶属度', 'PSO']) assert(search(index, query).total > 0, `query has no results: ${query}`);
  assert.equal(search(index, 'SVM').total, search(index, 'svm').total);
  for (const query of ['Week 03', 'week3', '第3周', '第三周']) assert(search(index, query).results.every(r => r.week === '03') && search(index, query).total > 0, `week recognition: ${query}`);
  assert(search(index, '第十周').results.every(r => r.week === '10'));
  assert(search(index, '第5周 核').results.every(r => r.week === '05'));
  assert.equal(search(index, '不存在的关键词XYZZZZ').total, 0);
  for (const record of raw) {
    const u = new URL(record.href, 'https://example.invalid');
    const d = documents.get(path.join(root, 'dist', u.pathname.slice(site.base.length), 'index.html'));
    assert(d && all(d, n => attr(n, 'id') === decodeURIComponent(u.hash.slice(1))).length, 'search result target missing');
  }
  const answers = raw.filter(r => r.title.startsWith('答案'));
  assert.equal(answers.length, totals.details, 'all collapsed answers must be indexed');
});
const report = { passed: failures.length === 0, pages: documents.size, links, totals, failures };
await write('output/content-check.json', report);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
