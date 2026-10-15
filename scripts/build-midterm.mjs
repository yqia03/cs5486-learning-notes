import postcss from 'postcss';
import {read,json,write,all,attr,set,text,norm,article,bookHeader,headings,esc,parse,serializeOuter,sourceReferenceId} from './lib.mjs';
export async function buildMidterm({shell,url,manifest,references,searchIndex}) {
 const meta=await json('source/topics/midterm.json'),doc=parse(await read('source/topics/midterm.html')),body=article(doc);
 const css=postcss.parse(all(doc,n=>n.tagName==='style').map(text).join('\n'));
 css.walkRules(rule=>{
  const selectors=postcss.list.comma(rule.selector).filter(s=>! /^(?::root|html|body|main)(?:\[.*\])?$/.test(s.trim())&&!/\.(?:book-bar|book-layout|book-sidebar|book-footer|book-mark|book-label|toc|skip-link|sidebar-note|nav-label|local-only)(?:\b|[ .:#])/.test(s));
  if(!selectors.length)rule.remove();else rule.selector=selectors.map(s=>`.lesson-content ${s}`).join(', ');
 });
 await write('dist/assets/week-midterm.css',css.toString());
 let current='page-title';
 for(const n of all(body)) {
  if(/^h[2-4]$/.test(n.tagName))current=attr(n,'id');
  if(n.tagName!=='a')continue;
  const href=attr(n,'href')||'';
  const match=/^(?:\.\/)?([^/#]+\.html)(#.*)?$/.exec(href);
  const week=match&&manifest.weeks.find(w=>w.filename===decodeURIComponent(match[1]));
  if(week){set(n,'href',url(`weeks/${week.id}/`)+(match[2]||''));continue;}
  if(!/^https?:/.test(href)&&/\.pdf(?:#|$)/i.test(href)) {
   const id=sourceReferenceId(href);
   if(!references.has(id))references.set(id,{id,file:decodeURIComponent(href.split('#')[0]).split('/').pop(),page:/#page=(\d+)/.exec(href)?.[1]||null,occurrences:[]});
   const ref=references.get(id);
   if(!ref.occurrences.some(o=>o.week==='midterm'&&o.anchor===current))ref.occurrences.push({week:'midterm',anchor:current});
   set(n,'href',url('sources/')+'#'+id);set(n,'title','来源说明；PDF 实际页序，本站不托管原 PDF');
  }
 }
 // Record each knowledge block and each nested example/answer independently.
 const records=[];let active,trail=[];
 function record(anchor,title){const r={kind:'topic',label:'期中复习',week:'midterm',weekTitle:'期中复习',title,breadcrumb:trail.map(t=>t.title).join(' › '),href:url('midterm/')+'#'+anchor,text:''};records.push(r);return r;}
 active=record('page-title',meta.title);
 function visit(n){
  if(n.nodeName==='#text'){active.text+=n.value;return;}
  const saved=n.tagName==='details'?{active,trail:[...trail]}:null;
  if(/^h[2-4]$/.test(n.tagName||'')){const level=Number(n.tagName[1]),title=norm(text(n));trail=trail.filter(t=>t.level<level);trail.push({level,title});active=record(attr(n,'id'),title);}
  else if(saved){if(!attr(n,'id'))throw new Error('Topic details need stable IDs');const summary=all(n,x=>x.tagName==='summary')[0];active=record(attr(n,'id'),`${(attr(n,'class')||'').includes('review-answer')?'答案':'例题'} · ${trail.at(-1)?.title||meta.title} · ${norm(text(summary))}`);}
  for(const c of n.childNodes||[])visit(c);
  if(/^(p|li|td|tr|div|summary|h[1-6])$/.test(n.tagName||''))active.text+=' ';
  if(saved){active=saved.active;trail=saved.trail;}
 }
 visit(body);searchIndex.push(...records.map(r=>({...r,text:norm(r.text)})).filter(r=>r.text));
 const toc=`<ol class="site-chapter-list">${headings(doc).map(h=>`<li class="site-toc-level-${h.tagName[1]}"><a href="#${esc(attr(h,'id'))}">${esc(norm(text(h)))}</a></li>`).join('')}</ol>`;
 await write('dist/midterm/index.html',shell({title:'期中考试复习特别篇：从基础到 MAXNET',route:'midterm/',week:meta,toc,body:`<div class="lesson-content">${serializeOuter(bookHeader(doc))}${serializeOuter(body)}</div>`}));
 return meta;
}
