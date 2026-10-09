import { root, read, json, write, sha, all, attr, set, text, norm, article, headings, fingerprint, topics, args, parse, serialize, fs, path } from './lib.mjs';

const options = args();
const source = path.resolve(root, options.source || '..');
const selected = options.week === undefined ? Array.from({ length: 12 }, (_, i) => i + 1) : [Number(options.week)];
if (selected.some(n => !Number.isInteger(n) || n < 1 || n > 12)) throw new Error('--week must be 01–12');
let manifest = { version: 1, weeks: [] };
try { manifest = await json('source/manifest.json'); } catch (e) { if (e.code !== 'ENOENT') throw e; }

for (const week of selected) {
  const id = String(week).padStart(2, '0');
  const filename = `CS5486-Week${id}-学习教材.html`;
  const input = await fs.readFile(path.join(source, filename));
  const document = parse(input.toString('utf8'));
  const changes = [];
  if (all(document, n => n.tagName === 'script' || (n.tagName === 'link' && attr(n, 'rel') === 'stylesheet') || n.attrs?.some(a => /^on/i.test(a.name) || a.name === 'srcset')).length) {
    throw new Error(`${filename}: new script or stylesheet/image-set dependency requires explicit import support`);
  }
  // Only this source-management sentence contains a machine-specific path.
  function clean(n) {
    if (n.nodeName === '#text') {
      const before = n.value;
      n.value = n.value.replace(/\/Users\/[^/\s<>]+\/Desktop\/CS5486/g, '资料根目录');
      if (n.value !== before) changes.push('Replace local absolute path with 资料根目录; teaching content unchanged.');
    }
    for (const c of n.childNodes || []) clean(c);
  }
  clean(document);
  const baseline = fingerprint(document);
  const ids = new Set();
  for (const n of all(document, n => attr(n, 'id'))) {
    const key = attr(n, 'id');
    if (ids.has(key)) throw new Error(`${filename}: duplicate ID ${key}`);
    ids.add(key);
  }
  let added = 0;
  for (const n of headings(document)) {
    if (attr(n, 'id')) continue;
    const seed = `section-${sha(norm(text(n))).slice(0, 12)}`;
    let key = seed, suffix = 2;
    while (ids.has(key)) key = `${seed}-${suffix++}`;
    set(n, 'id', key); ids.add(key); added++;
  }
  if (added) changes.push(`Add stable anchors to ${added} headings.`);
  let svgIndex = 0;
  for (const svg of all(article(document), n => n.tagName === 'svg')) {
    svgIndex++;
    const mapping = new Map(all(svg, n => attr(n, 'id')).map(n => [attr(n, 'id'), `w${id}-svg${svgIndex}-${attr(n, 'id')}`]));
    for (const n of all(svg)) for (const a of n.attrs) {
      if (a.name === 'id' && mapping.has(a.value)) a.value = mapping.get(a.value);
      else if (['href', 'xlink:href'].includes(a.name) && a.value.startsWith('#') && mapping.has(a.value.slice(1))) a.value = '#' + mapping.get(a.value.slice(1));
      else if (['aria-labelledby', 'aria-describedby'].includes(a.name)) a.value = a.value.split(/\s+/).map(v => mapping.get(v) || v).join(' ');
      else a.value = a.value.replace(/url\(#([^)]+)\)/g, (m, key) => mapping.has(key) ? `url(#${mapping.get(key)})` : m);
    }
  }
  changes.push(`Namespace references within ${svgIndex} SVGs.`);
  const images = [];
  for (const n of all(document, n => n.tagName === 'img')) {
    const value = attr(n, 'src');
    const match = /^data:image\/png;base64,([A-Za-z0-9+/=\s]+)$/.exec(value || '');
    if (!match) throw new Error(`${filename}: unsupported image dependency; inspect before publishing`);
    const bytes = Buffer.from(match[1], 'base64');
    if (bytes.toString('base64') !== match[1].replace(/\s/g, '')) throw new Error('Invalid base64 image');
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG signature');
    const hash = sha(bytes), width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    const target = `source/assets/${hash}.png`;
    await write(target, bytes);
    if (sha(await fs.readFile(path.join(root, target))) !== hash) throw new Error('Image extraction mismatch');
    set(n, 'src', `../assets/${hash}.png`);
    set(n, 'width', width); set(n, 'height', height); set(n, 'loading', 'lazy'); set(n, 'decoding', 'async');
    images.push({ file: `${hash}.png`, sha256: hash, bytes: bytes.length, width, height, alt: attr(n, 'alt') || '' });
  }
  if (images.length) changes.push(`Extract ${images.length} PNG images without recompression; retain pixel dimensions and alt text.`);
  if (JSON.stringify(baseline) !== JSON.stringify(fingerprint(document))) throw new Error(`${filename}: content changed during import`);
  const output = serialize(document);
  if (/\/Users\/|file:\/\/|\/private\//.test(output)) throw new Error(`${filename}: local path remains`);
  await write(`source/weeks/${id}.html`, output);
  const metadata = {
    id, title: topics[week - 1], filename, originalSha256: sha(input), importedSha256: sha(output),
    subtitle: norm(text(all(document, n => (attr(n, 'class') || '').split(/\s+/).includes('book-subtitle'))[0] || {})),
    baseline, images, transformations: changes
  };
  manifest.weeks = manifest.weeks.filter(w => w.id !== id).concat(metadata).sort((a, b) => a.id.localeCompare(b.id));
  if (sha(await fs.readFile(path.join(source, filename))) !== sha(input)) throw new Error('Original source changed while importing');
  console.log(`Week ${id}: ${baseline.counts.math} formulas, ${baseline.counts.svg} SVGs, ${images.length} images; content verified`);
}
await write('source/manifest.json', manifest);
// Remove only generated assets that no imported week references.
const used = new Set(manifest.weeks.flatMap(w => w.images.map(i => i.file)));
for (const file of await fs.readdir(path.join(root, 'source/assets')).catch(() => [])) {
  if (/^[a-f0-9]{64}\.png$/.test(file) && !used.has(file)) await fs.unlink(path.join(root, 'source/assets', file));
}
await write('docs/IMPORT_REPORT.md', '# 教材导入记录\n\n原始教材未修改。以下操作仅发生于网站导入副本；无知识性改写。原文件 SHA-256、正文与公式指纹详见 source/manifest.json。\n\n' + manifest.weeks.map(w => `## 第 ${w.id} 周\n\n${w.transformations.map(t => '- ' + t).join('\n')}\n`).join('\n') + '\n构建时另外将本地 PDF 引用改为站内来源条目，保留引用文字、文件名及实际页码；为行内公式增加 HTML 滚动容器，以适配 WebKit，MathML 节点本身不变。教材的旧交付说明原样保留，由网站页脚说明当前资源布局。\n');
