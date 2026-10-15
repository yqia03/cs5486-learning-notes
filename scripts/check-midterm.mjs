import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {read,json,write,sha,all,attr,hasClass,text,article,fingerprint,args,parse,fs,path,root} from './lib.mjs';
import {prepareIndex,search} from '../web/search-core.js';
const meta=await json('source/topics/midterm.json');
const source=await read('source/topics/midterm.html'),doc=parse(source),built=parse(await read('dist/midterm/index.html'));
assert.equal(sha(source),meta.importedSha256,'re-import edited standalone content');
assert.deepEqual(fingerprint(doc),meta.baseline);
assert.deepEqual(fingerprint(built),meta.baseline,'build must preserve every formula, example and source passage');
const options=args();
if(options.originals)assert.equal(sha(await fs.readFile(path.resolve(root,options.originals,meta.filename))),meta.originalSha256,'standalone changed after import');
const blocks=all(article(built),n=>attr(n,'data-review-block'));
assert.equal(blocks.length,meta.blocks.length);assert(blocks.length>=45,'coverage unexpectedly incomplete');
let examples=0,answers=0,links=0;
for(const block of blocks){
 const id=attr(block,'data-review-block');
 assert(all(block,n=>n.tagName==='h3'&&attr(n,'id')===id).length===1,`stable heading ${id}`);
 const localExamples=all(block,n=>hasClass(n,'review-example'));assert(localExamples.length>0,`${id} needs example`);examples+=localExamples.length;
 assert(all(block,n=>hasClass(n,'review-backlinks')).length===1,`${id} needs precise original notes`);
 const back=all(block,n=>n.tagName==='a'&&attr(n,'data-return-review'));
 assert(back.length&&back.every(n=>/\/weeks\/0[1-6]\/#.+/.test(attr(n,'href'))),`specific original anchors ${id}`);links+=back.length;
 assert(all(block,n=>hasClass(n,'source')).length>0,`source ${id}`);
 assert(text(block).length>200,`substantive review ${id}`);
 assert(['理解','计算','两者'].includes(attr(block,'data-review-mode')));
}
for(const d of all(article(built),n=>n.tagName==='details')){assert.equal(attr(d,'open'),undefined,'default closed examples');assert(attr(d,'id'),'stable details id');if(hasClass(d,'review-answer'))answers++;}
assert.equal(all(built,n=>hasClass(n,'review-example')).length,meta.examples);
const coverage=all(built,n=>hasClass(n,'coverage-table'))[0];
const indexedExamples=new Set(all(coverage,n=>n.tagName==='a').map(n=>attr(n,'href')));
for(const example of all(built,n=>hasClass(n,'review-example')))assert(indexedExamples.has('#'+attr(example,'id')),'coverage index must include every example and final self-test');
for(const n of all(article(built),n=>n.tagName==='table'||(n.tagName==='math'&&attr(n,'display')==='block'))){
 const cls=n.tagName==='table'?'table-wrap':'math-display';let ancestor=n.parentNode;
 while(ancestor&&!hasClass(ancestor,cls))ancestor=ancestor.parentNode;
 assert(ancestor,`${n.tagName} needs a narrow-screen scroll container`);
}
for(const id of ['ls-svm-full','math-tools','model-comparison','self-test-a','self-test-b','coverage'])assert(all(built,n=>attr(n,'id')===id).length===1,`quick entry ${id}`);
const raw=await json('dist/search-index.json'),topic=raw.filter(r=>r.kind==='topic');
assert(topic.length>blocks.length);
assert.equal(topic.filter(r=>r.title.startsWith('答案')).length,answers,'index every nested answer');
assert.equal(topic.filter(r=>r.title.startsWith('例题')).length,meta.examples,'index every example');
const index=prepareIndex(raw);
for(const q of ['期中复习 LS-SVM','期中复习 MAXNET','期中复习 微分','期中复习 2.72'])assert(search(index,q).total>0,`topic search ${q}`);
for(const f of ['verify_w1_w3.py','verify_w4_w5.py','verify_math_ls.py','verify_root.py']){
 const r=spawnSync('python3',[path.join(root,'scripts/numerical',f)],{encoding:'utf8'});
 assert.equal(r.status,0,`${f}: ${r.stderr}\n${r.stdout}`);console.log(r.stdout.trim());
}
const report={passed:true,blocks:blocks.length,examples:meta.examples,nestedAnswers:answers,originalNoteLinks:links,searchPassages:topic.length};
await write('output/midterm-check.json',report);console.log(JSON.stringify(report,null,2));
