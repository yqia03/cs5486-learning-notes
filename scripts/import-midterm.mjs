import { root, write, sha, all, attr, text, norm, article, bookHeader, fingerprint, args, parse, serializeOuter, fs, path } from './lib.mjs';
const opts=args();
const filename='CS5486-期中考试复习特别篇-至MAXNET.html';
const file=path.resolve(root,opts.file || path.join(opts.source || '../学习笔记',filename));
const input=await fs.readFile(file,'utf8'), doc=parse(input);
if(!article(doc)||!bookHeader(doc)) throw new Error('Expected textbook header and article');
const styles=all(doc,n=>n.tagName==='style').map(serializeOuter).join('\n');
// Reading/search scripts belong to the standalone export; website uses shared assets.
const output=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>期中考试复习特别篇：从基础到 MAXNET</title>${styles}</head><body>${serializeOuter(bookHeader(doc))}${serializeOuter(article(doc))}</body></html>`;
if(/\/Users\/|file:\/\/|\/private\//.test(output)) throw new Error('Machine path in topic source');
const d=parse(output),ids=all(d,n=>attr(n,'id')).map(n=>attr(n,'id'));
if(new Set(ids).size!==ids.length)throw new Error('Duplicate topic IDs');
if(all(d,n=>n.tagName==='script'||n.tagName==='iframe'||n.tagName==='img'||n.attrs?.some(a=>/^on/i.test(a.name))).length)throw new Error('Unexpected external dependency in topic');
for(const h of all(article(d),n=>/^h[2-4]$/.test(n.tagName)))if(!attr(h,'id'))throw new Error('Every topic heading needs a stable ID');
const blocks=all(d,n=>attr(n,'data-review-block'));
const metadata={id:'midterm',kind:'topic',title:'期中复习：从基础到 MAXNET',subtitle:'复习基础理解、建模推导与计算；加强 LS-SVM、微分、线性代数与模型比较。',filename,originalSha256:sha(input),importedSha256:sha(output),baseline:fingerprint(d),blocks:blocks.map(b=>({id:attr(b,'data-review-block'),week:attr(b,'data-review-week'),mode:attr(b,'data-review-mode'),title:norm(text(all(b,n=>n.tagName==='h3')[0]))})),examples:all(d,n=>(attr(n,'class')||'').split(' ').includes('review-example')).length};
await write('source/topics/midterm.html',output);
await write('source/topics/midterm.json',metadata);
console.log(`Imported midterm: ${blocks.length} blocks, ${metadata.examples} examples; scripts excluded, MathML/SVG preserved`);
