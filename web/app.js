const html = document.documentElement;
const base = html.dataset.base;
const week = html.dataset.week;
const key = `cs5486:${base}:reading:v1`;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const get = (name, fallback) => { try { return JSON.parse(localStorage.getItem(name)) || fallback; } catch { return fallback; } };
const put = (name, value) => { try { localStorage.setItem(name, JSON.stringify(value)); } catch {} };
const stored = get(key, { weeks: {} });
const progressState = stored && typeof stored === 'object' && stored.weeks && typeof stored.weeks === 'object' ? stored : { weeks: {} };
const theme = $('#site-theme');
function themeLabel() {
  const dark = html.dataset.theme === 'dark';
  theme.textContent = dark ? '☀ 浅色' : '☾ 深色';
  theme.setAttribute('aria-label', dark ? '切换至浅色主题' : '切换至深色主题');
}
themeLabel();
theme.addEventListener('click', () => {
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('cs5486:theme', html.dataset.theme); } catch {}
  themeLabel();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  let saved; try { saved = localStorage.getItem('cs5486:theme'); } catch {}
  if (!saved) { html.dataset.theme = event.matches ? 'dark' : 'light'; themeLabel(); }
});

// Native details keep both navigation and answers usable without JavaScript.
const wide = matchMedia('(min-width: 1280px)');
const adaptNavigation = () => $$('.site-nav-panel').forEach(panel => { panel.open = wide.matches; });
adaptNavigation(); wide.addEventListener('change', adaptNavigation);
$$('.site-nav-panel a').forEach(link => link.addEventListener('click', () => {
  if (!wide.matches) link.closest('details').open = false;
}));

const dialog = $('#site-search');
const input = $('#site-search-input');
const status = $('#site-search-status');
const results = $('#site-search-results');
let worker, request = 0, timer, returnFocus;
function openSearch() {
  if (!dialog.open) { returnFocus = document.activeElement; dialog.showModal(); }
  input.focus(); input.select();
}
function closeSearch() {
  dialog.close();
  const target = returnFocus?.isConnected && returnFocus.tabIndex >= 0 && !returnFocus.closest('dialog') ? returnFocus : $('#site-search-open');
  target.focus({ preventScroll: true });
}
$('#site-search-open').addEventListener('click', openSearch);
$('#site-search-close').addEventListener('click', closeSearch);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeSearch(); });
dialog.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) closeSearch(); });
document.addEventListener('keydown', event => {
  if ((event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input,textarea,select,[contenteditable]')) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) { event.preventDefault(); openSearch(); }
});
function markText(node, value, terms) {
  if (!terms.length) { node.textContent = value; return; }
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(escaped.join('|'), 'gi');
  let position = 0;
  for (const match of value.matchAll(pattern)) {
    node.append(document.createTextNode(value.slice(position, match.index)));
    const mark = document.createElement('mark'); mark.textContent = match[0]; node.append(mark);
    position = match.index + match[0].length;
  }
  node.append(document.createTextNode(value.slice(position)));
}
function render(data) {
  if (data.id !== request) return;
  results.replaceChildren();
  if (data.error) { status.textContent = data.error; return; }
  status.textContent = data.total ? `找到 ${data.total} 处相关内容${data.total > 40 ? '，显示最相关的 40 条；可增加关键词缩小范围' : ''}` : '没有找到相关内容。可以换用英文术语或缩短关键词。';
  for (const item of data.results) {
    const li = document.createElement('li'), a = document.createElement('a'), label = document.createElement('span'), title = document.createElement('strong'), snippet = document.createElement('p');
    const destination = new URL(item.href, location.origin); destination.searchParams.set('q', input.value.trim());
    a.href = destination.href; label.className = 'site-result-label'; label.textContent = `第 ${item.week} 周 · ${item.weekTitle}`;
    markText(title, item.title, data.terms); markText(snippet, item.snippet, data.terms);
    a.append(label);
    if (item.breadcrumb && item.breadcrumb !== item.title) {
      const trail = document.createElement('span'); trail.className = 'site-result-path'; trail.textContent = item.breadcrumb; a.append(trail);
    }
    a.append(title, snippet); li.append(a); results.append(li);
    a.addEventListener('click', closeSearch);
  }
}
function runSearch() {
  clearTimeout(timer); request++;
  const query = input.value.trim();
  if (!query) { results.replaceChildren(); status.textContent = '输入关键词开始搜索'; return; }
  status.textContent = '正在搜索…';
  if (!worker) {
    try {
      worker = new Worker(`${base}assets/search-worker.js`, { type: 'module' });
      worker.onmessage = event => render(event.data);
      worker.onerror = () => { status.textContent = '搜索暂时无法启动，请刷新后重试。'; worker?.terminate(); worker = undefined; };
    } catch { status.textContent = '当前浏览器无法启动搜索，仍可使用课程目录阅读。'; return; }
  }
  worker.postMessage({ id: request, query });
}
input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(runSearch, 130); });
$('#site-search-form').addEventListener('submit', event => { event.preventDefault(); runSearch(); });
dialog.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeSearch(); return; }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  const links = [...results.querySelectorAll('a')]; if (!links.length) return;
  const current = links.indexOf(document.activeElement);
  event.preventDefault(); links[(current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus();
});

function revealHash() {
  if (!location.hash) return;
  let target; try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
  if (!target) return;
  for (let node = target; node; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true;
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
}
window.addEventListener('hashchange', revealHash);
revealHash();

function validReading(saved) { return saved && typeof saved.anchor === 'string' && Number.isFinite(saved.percent); }
for (const label of $$('[data-progress-week]')) {
  const saved = progressState.weeks[label.dataset.progressWeek];
  if (validReading(saved)) label.textContent = `读至 ${Math.round(saved.percent)}%`;
}
const last = progressState.last;
if (/^(0[1-9]|1[0-2])$/.test(last || '') && validReading(progressState.weeks[last]) && $('#site-continue')) {
  const link = $('#site-continue'); link.hidden = false;
  link.href = `${base}weeks/${last}/?resume=1#${encodeURIComponent(progressState.weeks[last].anchor)}`;
  link.textContent = `继续第 ${last} 周 →`;
}

if (week) {
  const body = $('.textbook-body'), headings = $$('.textbook-body h2,.textbook-body h3,.textbook-body h4');
  const prior = progressState.weeks[week];
  const resumeButton = $('#site-resume');
  function resume() {
    if (!validReading(prior)) return;
    const target = document.getElementById(prior.anchor); if (!target) return;
    for (let n = target; n; n = n.parentElement) if (n.tagName === 'DETAILS') n.open = true;
    const offset = Math.abs((prior.width || innerWidth) - innerWidth) < 80 && Number.isFinite(prior.offset) ? Math.min(prior.offset, 1500) : -100;
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset, behavior: 'instant' });
    resumeButton.hidden = true;
  }
  if (validReading(prior) && prior.percent > 1) { resumeButton.hidden = false; resumeButton.addEventListener('click', resume); }
  if (new URLSearchParams(location.search).get('resume') === '1') requestAnimationFrame(() => requestAnimationFrame(resume));
  let scheduled = false, moved = false;
  function update(save = false) {
    scheduled = false;
    const rect = body.getBoundingClientRect();
    const value = Math.min(100, Math.max(0, Math.round((-rect.top + 105) / Math.max(1, body.scrollHeight - innerHeight + 150) * 100)));
    let heading = headings[0];
    for (const h of headings) if (h.getBoundingClientRect().top <= 160 && h.getClientRects().length) heading = h;
    $('#site-progress').value = value; $('#site-progress-label').textContent = `阅读位置 ${value}%`;
    $$('.site-chapter-list a').forEach(a => {
      if (a.hash === '#' + heading.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    if (save && heading) {
      progressState.last = week;
      progressState.weeks[week] = { anchor: heading.id, offset: -heading.getBoundingClientRect().top, percent: value, width: innerWidth };
      put(key, progressState);
    }
  }
  update();
  window.addEventListener('scroll', () => { moved = true; if (!scheduled) { scheduled = true; requestAnimationFrame(() => update(true)); } }, { passive: true });
  window.addEventListener('pagehide', () => { if (moved || !validReading(prior)) update(true); });

  let printState;
  function beforePrint() {
    if (!printState) printState = $$('.textbook-body details').map(d => [d, d.open]);
    for (const [d] of printState) d.open = true;
    $$('.textbook-body img').forEach(img => { img.loading = 'eager'; });
  }
  function afterPrint() { if (printState) { for (const [d, open] of printState) d.open = open; printState = undefined; } }
  window.addEventListener('beforeprint', beforePrint); window.addEventListener('afterprint', afterPrint);
  $('#site-print').addEventListener('click', async () => {
    const button = $('#site-print'); button.disabled = true; button.textContent = '准备打印…';
    beforePrint();
    try {
      await Promise.all($$('.textbook-body img').map(img => img.decode().catch(() => {})));
      await document.fonts.ready; window.print();
    } finally { afterPrint(); button.disabled = false; button.textContent = '打印本周'; }
  });
}
