const all = s => [...document.querySelectorAll(s)];
const one = s => document.querySelector(s);
for (const button of all('[data-review-toggle]')) button.addEventListener('click', () => {
  const [type, state] = button.dataset.reviewToggle.split(':');
  all(type === 'answers' ? '.review-answer' : '.review-example').forEach(d => { d.open = state === 'open'; if(type==='answers'&&state==='open') for(let p=d.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true; });
  const status=one('#review-toggle-status'); if(status)status.textContent=button.textContent+'：已完成';
});
const returnKey=`cs5486:review:return:${location.pathname}`;
for (const a of all('a[data-return-review]')) a.addEventListener('click', () => {
  try { sessionStorage.setItem(returnKey,JSON.stringify({open:all('.textbook-body details[open]').map(d=>d.id),y:scrollY,width:innerWidth})); }catch{}
});
function restoreReturn(event) {
 if(!event.persisted&&performance.getEntriesByType('navigation')[0]?.type!=='back_forward')return;
 try{const value=JSON.parse(sessionStorage.getItem(returnKey));if(!value)return;for(const id of value.open||[]){const d=document.getElementById(id);if(d?.tagName==='DETAILS')d.open=true;}if(Math.abs(value.width-innerWidth)<80)requestAnimationFrame(()=>requestAnimationFrame(()=>scrollTo({top:value.y,behavior:'instant'})));}catch{}
}
window.addEventListener('pageshow',restoreReturn);
// The exported single file needs no server, module imports, or network requests.
if (!document.documentElement.dataset.base) {
 const html=document.documentElement, storeKey='cs5486:local:midterm:reading:v1';
 const get=k=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
 const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
 html.dataset.theme=get('cs5486:local:theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 one('#local-theme')?.addEventListener('click',()=>{html.dataset.theme=html.dataset.theme==='dark'?'light':'dark';put('cs5486:local:theme',html.dataset.theme);});
 function reveal(){let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}if(!target)return;for(let n=target;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));}
 addEventListener('hashchange',reveal);if(location.hash)reveal();
 const saved=get(storeKey),resume=one('#local-resume');
 if(saved&&document.getElementById(saved.anchor)){resume.hidden=false;resume.addEventListener('click',()=>{location.hash=saved.anchor;resume.hidden=true;});}
 let pending=false;
 addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const heads=all('.textbook-body h2,.textbook-body h3');let h=heads[0];for(const n of heads)if(n.getBoundingClientRect().top<160)h=n;if(h)put(storeKey,{anchor:h.id});});},{passive:true});
 let printState;
 const before=()=>{if(!printState)printState=all('.textbook-body details').map(d=>[d,d.open]);printState.forEach(([d])=>{d.open=true;});};
 const after=()=>{printState?.forEach(([d,open])=>{d.open=open;});printState=null;};
 addEventListener('beforeprint',before);addEventListener('afterprint',after);
 one('#local-print')?.addEventListener('click',()=>{before();try{print();}finally{after();}});
 const input=one('#local-search'),results=one('#local-results');
 input?.addEventListener('input',()=>{
  const terms=input.value.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);results.replaceChildren();if(!terms.length)return;
  const candidates=all('[data-review-block],.review-example,.review-answer');let count=0;
  for(const node of candidates){const excerpt=node.cloneNode(true);excerpt.querySelectorAll('details').forEach(d=>d.remove());const heading=node.closest('[data-review-block]')?.querySelector('h3')?.textContent||'';const content=('期中复习 '+heading+' '+excerpt.textContent).normalize('NFKC').toLowerCase();if(!terms.every(t=>content.includes(t)))continue;if(count++>=40)break;
   const a=document.createElement('a'),li=document.createElement('li');const block=node.closest('[data-review-block]');a.href='#'+(node.id||node.dataset.reviewBlock);a.textContent='期中复习 · '+(block?.querySelector('h3')?.textContent||node.querySelector('summary')?.textContent||'自测')+(node.tagName==='DETAILS'?' · '+node.querySelector('summary').textContent:'');a.addEventListener('click',()=>requestAnimationFrame(reveal));li.append(a);results.append(li);
  }
  if(!count){const li=document.createElement('li');li.textContent='没有找到匹配内容';results.append(li);}
 });
}
