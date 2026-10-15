import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {root,json,write,args,fs,path} from './lib.mjs';
import {startPreview} from './preview.mjs';
const opts=args(),engine=opts.engine||'chromium',preview=opts.url?null:await startPreview({port:0}),base=opts.url||preview.url;
const browser=await ({chromium,webkit}[engine]).launch(),report={base,engine,scenarios:[],errors:[],resources:[]};
const folder=`output/playwright/midterm-${opts.url?'online':'local'}-${engine}`;await fs.mkdir(path.join(root,folder),{recursive:true});
const meta=await json('source/topics/midterm.json');
const run=async(name,fn)=>{try{await fn();report.scenarios.push(name);console.log('PASS midterm',name);}catch(e){report.errors.push(`${name}: ${e.message}`);console.log('FAIL midterm',name,e.message);}};
const watch=p=>{p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});p.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)report.resources.push(`${r.status()} ${r.url()}`);});};
const visit=async(p,route='midterm/')=>{const r=await p.goto(new URL(route,base).href,{waitUntil:'networkidle'});assert.equal(r.status(),200);await p.waitForFunction(()=>document.querySelector('#site-theme').textContent!=='主题');};
try{
 for(const width of [1440,834,390])for(const theme of ['light','dark']){
  const c=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});await c.addInitScript(t=>localStorage.setItem('cs5486:theme',t),theme);const p=await c.newPage();watch(p);
  await run(`${width} ${theme} layout and all examples`,async()=>{
   await visit(p);assert.equal(await p.locator('[data-review-block]').count(),meta.blocks.length);assert.equal(await p.locator('.review-example[open]').count(),0);
   assert.equal(await p.locator('html').getAttribute('data-theme'),theme);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.screenshot({path:path.join(root,folder,`overview-${width}-${theme}.png`)});
   await p.locator('[data-review-toggle="answers:open"]').click();assert.equal(await p.locator('.review-answer:not([open])').count(),0);
   await p.locator('[data-review-toggle="examples:open"]').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'expanded overflow');
   for(const anchor of ['ls-svm-full','mx-iteration','model-comparison']){await p.locator(`#${anchor}`).scrollIntoViewIfNeeded();await p.screenshot({path:path.join(root,folder,`${anchor}-${width}-${theme}.png`)});}
   await p.locator('[data-review-toggle="examples:close"]').click();assert.equal(await p.locator('.review-example[open]').count(),0);
   await p.locator('.review-example>summary').first().focus();await p.keyboard.press('Enter');assert.equal(await p.locator('.review-example[open]').count(),1);
   await p.locator('[data-review-toggle="answers:close"]').click();assert.equal(await p.locator('.review-answer[open]').count(),0);
  });await c.close();
 }
 const c=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'}),p=await c.newPage();watch(p);
 await run('home entry and twelve-week order',async()=>{await visit(p,'');assert.equal(await p.locator('.site-week-card').count(),12);await p.locator('[data-midterm-entry]').click();await p.waitForURL('**/midterm/');assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('.site-header a[href="https://github.com/yqia03/cs5486-learning-notes"]').textContent(),'支持GitHub');});
 await run('Chinese English and nested-answer search',async()=>{
  for(const q of ['期中复习 微分','期中复习 LS-SVM','期中复习 2.72']){
   await p.locator('#site-search-open').click();await p.locator('#site-search-input').fill(q);await p.locator('#site-search-form').evaluate(e=>e.requestSubmit());
   await p.waitForFunction(()=>document.querySelector('#site-search-status').textContent.startsWith('找到'));
   const links=p.locator('#site-search-results a');assert(await links.count()>0);assert((await links.first().textContent()).includes('期中复习'));
   if(q.endsWith('2.72')){const target=p.locator('#site-search-results a[href*="#ans-b-maxnet"]');assert.equal(await target.count(),1);await target.click();await p.waitForURL('**#ans-b-maxnet');assert(await p.locator('#ans-b-maxnet').evaluate(n=>n.open&&n.parentElement.open));}
   else await p.locator('#site-search-close').click();
  }
 });
 await run('deep anchors, original note and browser back',async()=>{
  await visit(p,'midterm/#mx-iteration');await p.reload({waitUntil:'networkidle'});assert(await p.locator('#mx-iteration').evaluate(e=>e.getBoundingClientRect().top>=0&&e.getBoundingClientRect().top<500));
  await p.locator('#ex-mx-iteration>summary').click();await p.locator('#ans-mx-iteration>summary').click();
  await p.locator('#block-mx-iteration .review-backlinks a').click();await p.waitForURL('**/weeks/06/#maxnet-calc');assert(await p.locator('#maxnet-calc').isVisible());
  await p.goBack({waitUntil:'networkidle'});assert(await p.locator('#ex-mx-iteration').evaluate(d=>d.open));assert(await p.locator('#ans-mx-iteration').evaluate(d=>d.open));
 });
 await run('topic progress isolated from all twelve weeks',async()=>{
  await visit(p,'');const basePath=new URL(base).pathname;
  const marker={weeks:{'05':{anchor:'svr',percent:42,offset:0,width:1440}},last:'05'};
  await p.evaluate(({basePath,marker})=>localStorage.setItem(`cs5486:${basePath}:reading:v1`,JSON.stringify(marker)),{basePath,marker});
  await visit(p,'midterm/');await p.locator('#ls-svm-full').scrollIntoViewIfNeeded();await p.waitForTimeout(150);
  const states=await p.evaluate(basePath=>[JSON.parse(localStorage.getItem(`cs5486:${basePath}:reading:v1`)),JSON.parse(localStorage.getItem(`cs5486:${basePath}:midterm-reading:v1`))],basePath);
  assert.deepEqual(states[0],marker);assert(states[1]?.weeks?.midterm);await p.reload({waitUntil:'networkidle'});assert(await p.locator('#site-resume').isVisible());
 });
 await run('print expands all answers and restores states',async()=>{
  await visit(p);const before=await p.locator('.textbook-body details').evaluateAll(ds=>ds.map(d=>d.open));
  await p.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert.equal(await p.locator('.textbook-body details:not([open])').count(),0);
  await p.emulateMedia({media:'print'});if(engine==='chromium')await p.pdf({path:path.join(root,folder,'midterm-print.pdf'),format:'A4',printBackground:true});
  await p.emulateMedia({media:'screen'});await p.evaluate(()=>dispatchEvent(new Event('afterprint')));assert.deepEqual(await p.locator('.textbook-body details').evaluateAll(ds=>ds.map(d=>d.open)),before);
 });
 await c.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await nojs.newPage();
 await run('no-JavaScript content and native folding',async()=>{await staticPage.goto(new URL('midterm/',base).href);await staticPage.locator('.review-example>summary').first().click();assert(await staticPage.locator('.review-example').first().evaluate(d=>d.open));});await nojs.close();
}finally{await browser.close();await preview?.server.close();}
report.passed=report.errors.length===0&&report.resources.length===0;await write(`${folder}/report.json`,report);console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
