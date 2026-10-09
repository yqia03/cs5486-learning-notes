import assert from 'node:assert/strict';
import { chromium, webkit } from 'playwright';
import { root, json, write, args, fs, path } from './lib.mjs';
import { startPreview } from './preview.mjs';

const options = args();
const manifest = await json('source/manifest.json');
const engine = options.engine || 'chromium';
if (!['chromium', 'webkit'].includes(engine)) throw new Error('Use --engine chromium or webkit');
const preview = options.url ? null : await startPreview({ port: 0 });
const baseURL = options.url || preview.url;
const browser = await ({ chromium, webkit }[engine]).launch();
const mode = options.url ? 'online' : 'local';
const output = `output/playwright/${mode}-${engine}`;
await fs.mkdir(path.join(root, output), { recursive: true });
const report = { engine, baseURL, scenarios: [], errors: [], consoleErrors: [], resourceFailures: [] };
const visit = async (page, route = '') => {
  const response = await page.goto(new URL(route, baseURL).href, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => document.querySelector('#site-theme').textContent !== '主题');
};
const scenario = async (name, action) => {
  try { await action(); report.scenarios.push(name); console.log('PASS', name); }
  catch (error) { report.errors.push({ name, message: error.message }); console.log('FAIL', name, error.message); }
};
function watch(page) {
  page.on('pageerror', error => report.consoleErrors.push({ page: page.url(), error: error.message }));
  page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push({ page: page.url(), error: message.text() }); });
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(baseURL)) report.resourceFailures.push({ url: response.url(), status: response.status() }); });
  page.on('requestfailed', request => { if (!/ERR_ABORTED|cancelled|canceled|NS_BINDING_ABORTED/i.test(request.failure()?.errorText || '') && request.url().startsWith(baseURL)) report.resourceFailures.push({ url: request.url(), error: request.failure()?.errorText }); });
}

try {
  for (const width of [1440, 834, 390]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await context.addInitScript(theme => localStorage.setItem('cs5486:theme', theme), theme);
    const page = await context.newPage(); watch(page);
    await scenario(`home ${width} ${theme}`, async () => {
      await visit(page);
      assert.equal(await page.locator('.site-week-card').count(), 12);
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'horizontal page overflow');
      await page.screenshot({ path: path.join(root, output, `home-${width}-${theme}.png`) });
    });
    for (const week of manifest.weeks) await scenario(`week-${week.id} ${width} ${theme}`, async () => {
      await visit(page, `weeks/${week.id}/`);
      await page.evaluate(async () => {
        const images = [...document.querySelectorAll('.textbook-body img')]; images.forEach(i => { i.loading = 'eager'; });
        await Promise.all(images.map(i => i.decode()));
      });
      const metrics = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        math: document.querySelectorAll('.textbook-body math').length,
        svg: document.querySelectorAll('.textbook-body svg').length,
        details: document.querySelectorAll('.textbook-body details').length,
        missingImages: [...document.querySelectorAll('.textbook-body img')].filter(i => !i.complete || !i.naturalWidth).length,
        currentWeek: document.querySelector('.site-week-list [aria-current="page"]')?.getAttribute('href'),
        mathHasLayout: [...document.querySelectorAll('.textbook-body .math-display math')].some(m => m.getBoundingClientRect().height > 10),
        badOverflow: [...document.querySelectorAll('.textbook-body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 2 && !e.closest('.table-wrap,.math-display,figure,pre,.math-inline,.math-inline-scroll,math')).slice(0, 5).map(e => ({ tag:e.tagName, class:e.className, text:e.textContent.slice(0,70) }))
      }));
      assert.equal(metrics.math, week.baseline.counts.math); assert.equal(metrics.svg, week.baseline.counts.svg); assert.equal(metrics.details, week.baseline.counts.details);
      assert.equal(metrics.missingImages, 0); assert(metrics.mathHasLayout, 'MathML has no layout');
      assert(metrics.currentWeek.endsWith(`/weeks/${week.id}/`));
      assert(metrics.scrollWidth <= width + 1, `horizontal overflow: ${JSON.stringify(metrics)}`);
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
      await page.screenshot({ path: path.join(root, output, `week-${week.id}-${width}-${theme}.png`) });
      // Expand every answer: nested formula/table overflow must also remain contained.
      await page.locator('.textbook-body details').evaluateAll(nodes => nodes.forEach(n => { n.open = true; }));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'expanded answers overflow');
      if (width === 390 || (width === 1440 && theme === 'dark')) {
        const formula = page.locator('.math-display').first();
        await formula.scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(root, output, `formula-${week.id}-${width}-${theme}.png`) });
      }
    });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); watch(page);
  await scenario('keyboard navigation and theme persistence', async () => {
    await visit(page); await page.keyboard.press('Tab');
    assert(await page.locator('.site-skip').evaluate(e => e === document.activeElement));
    await page.keyboard.press('Enter');
    assert(await page.locator('#site-main').evaluate(e => e === document.activeElement));
    const original = await page.locator('html').getAttribute('data-theme');
    await page.locator('#site-theme').click(); await page.reload();
    assert.notEqual(await page.locator('html').getAttribute('data-theme'), original);
  });
  async function searchFor(query) {
    if (!(await page.locator('#site-search').evaluate(e => e.open))) await page.locator('#site-search-open').click();
    await page.locator('#site-search-input').fill(query);
    await page.locator('#site-search-form').evaluate(e => e.requestSubmit());
    await page.waitForFunction(() => /^找到|没有找到/.test(document.querySelector('#site-search-status').textContent));
  }
  await scenario('Chinese, English, week and no-result searches', async () => {
    await visit(page);
    for (const query of ['感知机', 'SVM', 'Hopfield', '第三周', 'Week 03']) {
      await searchFor(query); assert(await page.locator('#site-search-results a').count() > 0, query);
      if (query === '感知机') {
        const chapter = page.locator('#site-search-results a[href$="#perceptron"]');
        assert((await chapter.locator('p').textContent()).length > 50, 'chapter result needs a substantive excerpt');
      }
      if (['第三周', 'Week 03'].includes(query)) assert((await page.locator('#site-search-results a').evaluateAll(nodes => nodes.map(n => n.href))).every(h => h.includes('/weeks/03/')));
    }
    await searchFor('不存在的关键词XYZZZZ'); assert.equal(await page.locator('#site-search-results a').count(), 0);
    await page.keyboard.press('Escape'); assert(!(await page.locator('#site-search').evaluate(e => e.open)));
    await page.keyboard.press('/'); assert(await page.locator('#site-search').evaluate(e => e.open));
    await page.keyboard.press('Escape');
  });
  await scenario('search result opens a collapsed answer and survives refresh', async () => {
    await searchFor('答案');
    const answer = page.locator('#site-search-results a[href*="#answer-"]').first();
    assert(await answer.count() > 0);
    await answer.click(); await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.open === true);
    await page.reload();
    await page.waitForFunction(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.open === true);
    const top = await page.evaluate(() => document.getElementById(decodeURIComponent(location.hash.slice(1))).getBoundingClientRect().top);
    assert(top >= 60 && top <= 240, `answer scroll position ${top}`);
  });
  await scenario('chapter anchors, next and previous week', async () => {
    await visit(page, 'weeks/04/');
    await page.locator('.site-chapter-list a').nth(6).click();
    const hash = new URL(page.url()).hash; assert(hash.length > 1);
    await page.reload(); assert.equal(new URL(page.url()).hash, hash);
    await page.locator('a[rel="next"]').click(); await page.waitForLoadState('networkidle'); assert(page.url().includes('/weeks/05/'));
    await page.locator('a[rel="prev"]').click(); await page.waitForLoadState('networkidle'); assert(page.url().includes('/weeks/04/'));
  });
  await scenario('reading progress persists and explicit hash wins', async () => {
    await visit(page, 'weeks/03/');
    await page.locator('.textbook-body h2').nth(5).scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const key = `cs5486:${document.documentElement.dataset.base}:reading:v1`;
      return JSON.parse(localStorage.getItem(key))?.weeks['03']?.percent > 5;
    });
    await visit(page);
    assert(await page.locator('#site-continue').isVisible());
    assert((await page.locator('#site-continue').getAttribute('href')).includes('/weeks/03/'));
    await page.locator('#site-continue').click();
    await page.waitForFunction(() => scrollY > 1000);
    await visit(page, 'weeks/03/#sources');
    const y = await page.locator('#sources').evaluate(e => e.getBoundingClientRect().top);
    assert(y >= 60 && y <= 240, `explicit anchor not respected: ${y}`);
  });
  await scenario('mobile navigation and answer interaction', async () => {
    await page.setViewportSize({ width:390, height:844 }); await visit(page, 'weeks/12/');
    assert(!(await page.locator('.site-toc details').evaluate(e => e.open)));
    await page.locator('.site-toc summary').click();
    await page.locator('.site-chapter-list a').nth(3).click();
    assert(!(await page.locator('.site-toc details').evaluate(e => e.open)));
    const answer = page.locator('.textbook-body details').first(); await answer.locator('summary').click(); assert(await answer.evaluate(e => e.open));
    await answer.locator('summary').click(); assert(!(await answer.evaluate(e => e.open)));
  });
  await scenario('print expands answers, resets theme and restores state', async () => {
    await page.setViewportSize({ width:794, height:1123 }); await visit(page, 'weeks/05/');
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; window.dispatchEvent(new Event('beforeprint')); });
    assert(await page.locator('.textbook-body details').evaluateAll(nodes => nodes.every(n => n.open)));
    await page.emulateMedia({ media:'print' });
    assert.equal(await page.locator('.site-header').isVisible(), false);
    assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(255, 255, 255)');
    await page.screenshot({ path: path.join(root, output, 'print.png') });
    if (engine === 'chromium') await page.pdf({ path: path.join(root, output, 'week-05-print.pdf'), format:'A4', printBackground:true });
    await page.emulateMedia({ media:'screen' }); await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    assert(await page.locator('.textbook-body details').evaluateAll(nodes => nodes.every(n => !n.open)));
  });
  await context.close();
  const blocked = await browser.newContext({ viewport:{width:390,height:844} });
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } }));
  const blockedPage = await blocked.newPage(); watch(blockedPage);
  await scenario('blocked storage does not break reading', async () => {
    await visit(blockedPage, 'weeks/02/'); await blockedPage.locator('#site-theme').click();
    await blockedPage.locator('.textbook-body details').first().locator('summary').click();
    assert(await blockedPage.locator('.textbook-body details').first().evaluate(n => n.open));
  });
  await blocked.close();
  const noJS = await browser.newContext({ javaScriptEnabled:false, viewport:{width:390,height:844} });
  const plain = await noJS.newPage();
  await scenario('text and native answers work without JavaScript', async () => {
    const response = await plain.goto(new URL('weeks/01/',baseURL).href); assert.equal(response.status(),200);
    assert.equal(await plain.locator('.textbook-body math').count(),13);
    await plain.locator('.textbook-body details').first().locator('summary').click();
    assert(await plain.locator('.textbook-body details').first().evaluate(n=>n.open));
  });
  await noJS.close();
} finally {
  await browser.close(); if (preview) await new Promise(resolve=>preview.server.close(resolve));
  report.passed = !report.errors.length && !report.consoleErrors.length && !report.resourceFailures.length;
  await write(`${output}/report.json`, report);
  console.log(JSON.stringify({ passed:report.passed, scenarios:report.scenarios.length, errors:report.errors, consoleErrors:report.consoleErrors, resourceFailures:report.resourceFailures },null,2));
  if (!report.passed) process.exitCode=1;
}
