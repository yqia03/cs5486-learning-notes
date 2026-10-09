import { json, write } from './lib.mjs';
const urls = await json('output/external-links.json');
const queue = [...new Set(urls.map(u => u.split('#')[0]))], records = [];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    try {
      const response = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent':'CS5486-learning-notes-link-check/1.0', Range:'bytes=0-1023' } });
      await response.body?.cancel();
      const state = response.ok ? '可访问' : [404,410].includes(response.status) ? '待人工核对' : '访问受限或服务器错误，未确认失效';
      records.push({ url, status: response.status, final: response.url, state });
      console.log(response.status, url);
    } catch { records.push({ url, status: null, state:'连接或证书检查未通过，未确认失效' }); console.log('unverified',url); }
  }
}
await Promise.all(Array.from({ length:5 }, worker));
records.sort((a,b) => a.url.localeCompare(b.url));
await write('output/link-check.json',records);
await write('docs/LINK_REPORT.md', '# 外部来源链接检查\n\n自动请求仅能确认当次可访问性。限流、证书、访问保护或超时不等同于来源失效；未确认的链接保留原文，不擅自替换来源。站内页面、资源与锚点由 npm run check 全量验证。\n\n| 来源 | HTTP | 结果 |\n|---|---|---|\n' + records.map(r => `| [来源](${r.url}) | ${r.status ?? '—'} | ${r.state} |`).join('\n') + '\n');
console.log(JSON.stringify({ total:records.length, accessible:records.filter(r=>r.status>=200&&r.status<300).length, unresolved:records.filter(r=>!(r.status>=200&&r.status<300)).length }));
