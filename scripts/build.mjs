import postcss from 'postcss';
import { root, read, json, write, sha, all, attr, set, hasClass, text, norm, article, bookHeader, headings, esc, args, basePath, parse, serializeOuter, fs, path } from './lib.mjs';

const config = await json('site.config.json');
const base = basePath(args().base || process.env.BASE_PATH || config.base);
const url = p => base + p.replace(/^\/+/, '');
const manifest = await json('source/manifest.json');
if (manifest.weeks.length !== 12) throw new Error('Import all twelve weeks before building');
const docs = await Promise.all(manifest.weeks.map(async w => parse(await read(`source/weeks/${w.id}.html`))));
await fs.rm(path.join(root, 'dist'), { recursive: true, force: true });
await fs.mkdir(path.join(root, 'dist/assets/materials'), { recursive: true });
await fs.cp(path.join(root, 'source/assets'), path.join(root, 'dist/assets/materials'), { recursive: true });
await fs.cp(path.join(root, 'web'), path.join(root, 'dist/assets'), { recursive: true });

// Common original CSS is shared; week-specific extensions only load on that week.
const styles = docs.map(d => postcss.parse(text(all(d, n => n.tagName === 'style')[0])));
let sharedLength = 0;
while (styles[0].nodes[sharedLength] && styles.every(s => s.nodes[sharedLength]?.toString() === styles[0].nodes[sharedLength].toString())) sharedLength++;
function scopedCSS(nodes) {
  const css = postcss.root({ nodes: nodes.map(n => n.clone()) });
  css.walkRules(rule => {
    const selectors = postcss.list.comma(rule.selector).filter(s => !/^(?::root|html|body|main)$/.test(s.trim()) && !/\.(?:book-bar|book-layout|book-sidebar|book-footer|book-mark|book-label|toc|skip-link|sidebar-note|nav-label)(?:\b|[ .:#])/.test(s));
    if (!selectors.length) rule.remove(); else rule.selector = selectors.map(s => `.lesson-content ${s}`).join(', ');
  });
  return css.toString();
}
await write('dist/assets/textbook.css', scopedCSS(styles[0].nodes.slice(0, sharedLength)));
for (const [i, w] of manifest.weeks.entries()) await write(`dist/assets/week-${w.id}.css`, scopedCSS(styles[i].nodes.slice(sharedLength)));

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#17645b"/><path d="M18 16h22a6 6 0 0 1 6 6v27H23a5 5 0 0 1-5-5V16Zm0 25h28M26 24h13M26 31h9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`;
await write('dist/assets/favicon.svg', icon);
const weekHref = w => url(`weeks/${w.id}/`);
function shell({ title, route, body, week, toc = '' }) {
  const pageTitle = title === config.title ? title : `${title} · ${config.title}`;
  const courses = `<ol class="site-week-list">${manifest.weeks.map(w => `<li><a href="${weekHref(w)}" ${week?.id === w.id ? 'aria-current="page"' : ''}><span class="site-week-number">${w.id}</span><span>${esc(w.title)}</span></a></li>`).join('')}</ol>`;
  return `<!doctype html>
<html lang="zh-CN" data-base="${base}" data-week="${week?.id || ''}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark">
<title>${esc(pageTitle)}</title><meta name="description" content="${esc(week?.subtitle || '个人整理的 CS5486 智能系统十二周学习资料：知识讲解、完整推导、例题、练习与答案。')}">
<link rel="canonical" href="${config.origin}${url(route)}"><link rel="icon" href="${url('assets/favicon.svg')}" type="image/svg+xml">
<script src="${url('assets/theme.js')}"></script>
${week ? `<link rel="stylesheet" href="${url('assets/textbook.css')}"><link rel="stylesheet" href="${url(`assets/week-${week.id}.css`)}">` : ''}
<link rel="stylesheet" href="${url('assets/site.css')}"><script type="module" src="${url('assets/app.js')}"></script></head>
<body><a class="site-skip" href="#site-main" tabindex="0">跳至正文</a>
<header class="site-header"><a class="site-brand" href="${base}" aria-label="CS5486 智能系统学习手册"><span class="site-brand-mark" aria-hidden="true">CS</span><span><strong>5486</strong><span class="site-brand-label">智能系统学习手册</span></span></a>
<nav aria-label="网站导航" class="site-header-actions"><a href="${base}#curriculum" class="site-all-weeks">十二周课程</a><button type="button" id="site-search-open"><span aria-hidden="true">⌕</span> 搜索<span class="site-key" aria-hidden="true">/</span></button><button type="button" id="site-theme" aria-label="切换主题">主题</button></nav></header>
${week ? `<div class="site-reading-layout"><aside class="site-course"><details class="site-nav-panel" open><summary>课程目录 <span>第 ${week.id} 周</span></summary><nav aria-label="十二周课程">${courses}</nav></details></aside>
<main id="site-main" tabindex="-1" class="site-main"><div class="site-reading-tools"><a href="${base}">课程首页</a><span>第 ${week.id} / 12 周</span><button id="site-print" type="button">打印本周</button></div><div class="site-progress-row"><span id="site-progress-label">阅读位置 0%</span><progress id="site-progress" max="100" value="0" aria-label="本周阅读位置"></progress><button type="button" id="site-resume" hidden>继续上次阅读</button></div>${body}</main>
<aside class="site-toc"><details class="site-nav-panel" open><summary>本周目录 <span>${week.baseline.counts.h2} 章</span></summary><nav aria-label="本周章节">${toc}</nav></details></aside></div>` : `<main id="site-main" tabindex="-1" class="site-page">${body}</main>`}
<footer class="site-footer"><p><strong>CS5486 智能系统学习手册</strong><br>个人整理的学习资料 · 从问题出发，理解每一步。</p><nav aria-label="页脚导航"><a href="${url('sources/')}">来源与资料说明</a><a href="${url('about/')}">关于与许可</a><a href="https://github.com/${config.repository}">GitHub</a></nav><p class="site-footer-note">${week ? '正文保留原教材内容及交付说明。本站图片已独立存储；课件 PDF 仅保留引用，不提供下载。' : '十二周按学习顺序编排，并非官方授课周历。课程及第三方资料的权利归原权利人所有。'}</p></footer>
<dialog id="site-search" aria-labelledby="site-search-title"><div class="site-search-top"><h2 id="site-search-title">搜索学习手册</h2><button type="button" id="site-search-close" aria-label="关闭搜索">关闭 <kbd>Esc</kbd></button></div><form id="site-search-form" role="search"><label for="site-search-input">关键词或周次</label><input id="site-search-input" type="search" placeholder="例如：感知机、SVM、Week 03" autocomplete="off"><button type="submit">搜索</button></form><p class="site-search-hint">支持中文、英文术语及周次，也可以搜索折叠答案。</p><p id="site-search-status" role="status" aria-live="polite">输入关键词开始搜索</p><ol id="site-search-results"></ol></dialog>
<noscript><p class="site-noscript">正文、目录和折叠答案可直接阅读。全文搜索、主题选择与阅读位置保存需要启用 JavaScript。</p></noscript>
</body></html>`;
}

const references = new Map(), external = new Set(), searchIndex = [];
const weekOutputs = [];
for (const [i, w] of manifest.weeks.entries()) {
  const doc = docs[i], body = article(doc);
  let currentHeading = 'page-title';
  for (const n of all(body)) {
    if (/^h[2-4]$/.test(n.tagName)) currentHeading = attr(n, 'id');
    if (n.tagName === 'img') set(n, 'src', url(`assets/materials/${path.posix.basename(attr(n, 'src'))}`));
    if (n.tagName === 'a') {
      const href = attr(n, 'href') || '';
      if (/^https?:\/\//.test(href)) { external.add(href); continue; }
      if (/\.pdf(?:#|$)/i.test(href)) {
        const key = 'ref-' + sha(href).slice(0, 12);
        if (!references.has(key)) references.set(key, { id: key, file: decodeURIComponent(href.split('#')[0]).split('/').pop(), page: /#page=(\d+)/.exec(href)?.[1] || null, occurrences: [] });
        const ref = references.get(key), occurrence = { week: w.id, anchor: currentHeading };
        if (!ref.occurrences.some(o => o.week === occurrence.week && o.anchor === occurrence.anchor)) ref.occurrences.push(occurrence);
        set(n, 'href', url('sources/') + '#' + key);
        set(n, 'title', `${ref.file}${ref.page ? ' · PDF 实际页序 ' + ref.page : ''}（来源说明；本站不托管原 PDF）`);
      }
    }
  }
  // WebKit does not consistently constrain MathML's intrinsic inline width.
  // An HTML scroll container preserves every MathML node while containing it.
  for (const math of all(body, n => n.tagName === 'math' && attr(n, 'display') === 'inline')) {
    const parent = math.parentNode;
    const wrapper = { nodeName: 'span', tagName: 'span', attrs: [{ name: 'class', value: 'site-inline-math' }], namespaceURI: 'http://www.w3.org/1999/xhtml', childNodes: [math], parentNode: parent };
    parent.childNodes[parent.childNodes.indexOf(math)] = wrapper;
    math.parentNode = wrapper;
  }
  // Sections and answer blocks form independent search passages.
  const records = [];
  let trail = [], active = null;
  const ids = new Set(all(doc, n => attr(n, 'id')).map(n => attr(n, 'id')));
  function record(anchor, title, breadcrumb) {
    const value = { week: w.id, weekTitle: w.title, title, breadcrumb: breadcrumb.join(' › '), href: weekHref(w) + '#' + anchor, text: '' };
    records.push(value); return value;
  }
  active = record('page-title', w.title, []);
  function indexNode(n) {
    if (n.nodeName === '#text') { active.text += n.value; return; }
    if (['style', 'script'].includes(n.tagName)) return;
    const saved = n.tagName === 'details' ? { active, trail: [...trail] } : null;
    if (/^h[2-4]$/.test(n.tagName || '')) {
      const title = norm(text(n)), level = Number(n.tagName[1]);
      trail = trail.filter(t => t.level < level); trail.push({ level, title });
      active = record(attr(n, 'id'), title, trail.map(t => t.title));
    } else if (saved) {
      if (!attr(n, 'id')) {
        const seed = 'answer-' + sha(`${active.href}:${norm(text(n))}`).slice(0, 12);
        let key = seed, suffix = 2; while (ids.has(key)) key = `${seed}-${suffix++}`;
        set(n, 'id', key); ids.add(key);
      }
      active = record(attr(n, 'id'), `答案 · ${trail.at(-1)?.title || w.title}`, trail.map(t => t.title));
    }
    for (const child of n.childNodes || []) indexNode(child);
    if (/^(p|li|td|tr|div|summary|h[1-6])$/.test(n.tagName || '')) active.text += ' ';
    if (saved) { active = saved.active; trail = saved.trail; }
  }
  indexNode(body);
  const passages = records.map(r => ({ ...r, text: norm(r.text) }));
  for (const [position, passage] of passages.entries()) {
    if (passage.text !== passage.title || !passage.breadcrumb) continue;
    // A heading directly followed by a subheading has no paragraph of its own.
    // Use a verbatim excerpt from its first substantive child for its preview.
    const child = passages.slice(position + 1).find(r => r.breadcrumb.startsWith(passage.breadcrumb + ' › ') && r.text !== r.title && r.text);
    if (child) {
      const excerpt = child.text.startsWith(child.title) ? child.text.slice(child.title.length).trim() : child.text;
      passage.text = `${passage.title} ${excerpt.slice(0, 600)}`;
    }
  }
  searchIndex.push(...passages.filter(r => r.text));
  const toc = `<ol class="site-chapter-list">${headings(doc).map(h => `<li class="site-toc-level-${h.tagName[1]}"><a href="#${esc(attr(h, 'id'))}">${esc(norm(text(h)))}</a></li>`).join('')}</ol>`;
  const adjacent = `<nav class="site-adjacent" aria-label="前后周导航">${i > 0 ? `<a rel="prev" href="${weekHref(manifest.weeks[i - 1])}"><span>← 上一周 · ${manifest.weeks[i - 1].id}</span><strong>${esc(manifest.weeks[i - 1].title)}</strong></a>` : '<span></span>'}${i < 11 ? `<a rel="next" href="${weekHref(manifest.weeks[i + 1])}"><span>下一周 · ${manifest.weeks[i + 1].id} →</span><strong>${esc(manifest.weeks[i + 1].title)}</strong></a>` : `<a href="${base}#curriculum"><span>完成十二周</span><strong>返回课程目录 →</strong></a>`}</nav>`;
  await write(`dist/weeks/${w.id}/index.html`, shell({ title: `第 ${w.id} 周｜${w.title}`, route: `weeks/${w.id}/`, week: w, toc, body: `<div class="lesson-content">${serializeOuter(bookHeader(doc))}${serializeOuter(body)}</div>${adjacent}` }));
  weekOutputs.push({ id: w.id, href: weekHref(w), title: w.title, headings: headings(doc).map(n => ({ id: attr(n, 'id'), title: norm(text(n)), level: Number(n.tagName[1]) })) });
}

const cards = manifest.weeks.map(w => `<li><a class="site-week-card" href="${weekHref(w)}" data-card-week="${w.id}"><div class="site-card-top"><span>第 ${w.id} 周</span><span class="site-card-arrow" aria-hidden="true">↗</span></div><h3>${esc(w.title)}</h3><p>${esc(w.subtitle)}</p><div class="site-card-bottom"><span>${w.baseline.counts.h2} 章 · ${w.baseline.counts.details} 组练习答案</span><span class="site-card-progress" data-progress-week="${w.id}">开始阅读</span></div></a></li>`).join('');
await write('dist/index.html', shell({ title: config.title, route: '', body: `<section class="site-hero"><p class="site-eyebrow">CS5486 · INTELLIGENT SYSTEMS</p><h1>智能系统<br><span>学习手册</span></h1><p class="site-hero-description">从基础概念到完整推导，从神经网络到群体智能。<br class="site-desktop-break">按十二周的学习顺序，理解模型如何表示、学习与求解。</p><div class="site-hero-actions"><a class="site-primary" href="${weekHref(manifest.weeks[0])}">从第 01 周开始 <span aria-hidden="true">→</span></a><a id="site-continue" class="site-secondary" href="#curriculum" hidden>继续上次阅读</a></div><p class="site-personal">个人整理的学习资料 · 无需登录 · 进度保存在本机</p><div class="site-hero-stats"><div><strong>12</strong><span>周学习路径</span></div><div><strong>129</strong><span>章节循序展开</span></div><div><strong>115</strong><span>组折叠答案</span></div></div></section><section id="curriculum" class="site-curriculum"><div class="site-section-heading"><div><p class="site-eyebrow">课程目录</p><h2>循序阅读，也可按需查阅</h2></div><p>知识讲解 · 推导与图解 · 例题与练习</p></div><ol class="site-card-grid">${cards}</ol></section><section class="site-reading-note"><h2>怎样使用这本手册</h2><p>每周从必要前置开始，保留完整讲解、重要性评级与来源索引。先尝试练习，再展开答案；遇到概念时，可用全站搜索回到相关章节。</p><p>周次按概念依赖安排，并非官方授课周历。评级表示学习依赖与应用价值，不代表考试概率。引用课件的文件名与 PDF 实际页序均保留在<a href="${url('sources/')}">来源说明</a>中。</p></section>` }));

const grouped = new Map();
for (const ref of references.values()) { if (!grouped.has(ref.file)) grouped.set(ref.file, []); grouped.get(ref.file).push(ref); }
const referenceHTML = [...grouped].map(([file, refs]) => `<section class="site-reference-group"><h2>${esc(file)}</h2><ul>${refs.sort((a, b) => Number(a.page || 0) - Number(b.page || 0)).map(r => `<li id="${r.id}"><strong>${r.page ? `PDF 实际页序 ${r.page}` : '文件整体引用'}</strong><span class="site-reference-context">引用位置：${r.occurrences.map(o => `<a href="${url(`weeks/${o.week}/`)}#${esc(o.anchor)}">第 ${o.week} 周</a>`).join('、')}</span></li>`).join('')}</ul></section>`).join('');
await write('dist/sources/index.html', shell({ title: '来源与资料说明', route: 'sources/', body: `<div class="site-document"><p class="site-eyebrow">资料溯源</p><h1>来源与资料说明</h1><p class="site-lead">教材中的引用仍可追溯到文件名和 PDF 实际页序。本站不托管原始课件、Tutorial 或论文 PDF。</p><div class="site-notice"><strong>这里是引用说明，不是 PDF 下载页。</strong><p>如已持有课程资料，请在对应文件中打开所列页码。页码从 PDF 第一页开始计数，可能与幻灯片页脚编号不同。公开论文与官方资料的外部链接保留在各周正文中。</p></div><p>所有已嵌入教材的图片均原样保留并注明原教材提供的来源。课程资料及第三方内容不适用本站代码的 MIT 许可证；详见<a href="${url('about/')}">关于与许可</a>。</p>${referenceHTML}</div>` }));
await write('dist/about/index.html', shell({ title: '关于与许可', route: 'about/', body: `<div class="site-document"><p class="site-eyebrow">关于本站</p><h1>为理解而整理</h1><p class="site-lead">CS5486 智能系统学习手册是一份个人整理的中文学习资料，关键术语保留英文。本站不是官方课程网站。</p><h2>内容与来源</h2><p>网站由已有十二周 HTML 教材导入，保留知识讲解、推导、例题、图表、练习、答案、重要性评级和来源索引。各周顺序遵循原教材，不按主课件页码重新排列。</p><h2>许可范围</h2><p>新编写的网站程序、构建脚本及界面样式采用 MIT License。教材正文、课程截图、第三方图文、引用与原教材样式不因网站代码许可而获得 MIT 授权；其权利归原权利人所有。已知来源沿用原教材标注，未明确提供再分发许可的内容不宣称已获得该许可。本站不提供原始课件或 Tutorial PDF 下载。</p><p>详细文件范围与说明见仓库中的 LICENSE 和 THIRD_PARTY_NOTICES.md。</p><h2>阅读位置与隐私</h2><p>主题及阅读位置仅保存于当前浏览器，不上传至服务器，也不跨设备同步。清除浏览器站点数据会重置记录。本站没有账号系统或分析追踪脚本；托管服务可能记录常规访问日志。</p><h2>资料疑点与修改记录</h2><p>本次网站整合没有作知识性改写。原教材已列出的资料限制继续保留，包括第 10 周去模糊化示例缺少完整函数、第 11 周 Inversion 图示含义，以及第 12 周迭代次数与实验记录的差异。</p><p>新增疑点及经证据核实的修改记录在仓库 docs/CONTENT_REVIEW.md；导入转换及保真指纹分别记录在 docs/IMPORT_REPORT.md 与 source/manifest.json。</p><h2>更新与反馈</h2><p>教材可按周重新导入、验证和发布。发现问题时，请附周次、小节链接、问题描述与可核对依据，提交至<a href="https://github.com/${config.repository}/issues">GitHub Issues</a>。</p></div>` }));
await write('dist/404.html', shell({ title: '未找到页面', route: '404.html', body: `<div class="site-document"><p class="site-eyebrow">404</p><h1>这个页面暂时找不到</h1><p>可以返回课程目录，或搜索你正在查阅的知识点。</p><a class="site-primary" href="${base}">返回课程首页 →</a></div>` }));
await write('dist/search-index.json', JSON.stringify(searchIndex));
await write('dist/site-manifest.json', { base, weeks: weekOutputs, references: [...references.values()] });
await write('dist/.nojekyll', '');
await write('dist/robots.txt', `User-agent: *\nAllow: ${base}\nSitemap: ${config.origin}${url('sitemap.xml')}\n`);
await write('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', 'sources/', 'about/', ...manifest.weeks.map(w => `weeks/${w.id}/`)].map(r => `<url><loc>${config.origin}${url(r)}</loc></url>`).join('')}</urlset>`);
await write('output/external-links.json', [...external].sort());
console.log(`Built ${manifest.weeks.length} weeks, ${searchIndex.length} search passages, ${references.size} source references at ${base}`);
