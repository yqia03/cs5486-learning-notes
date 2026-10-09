const normalize = value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const numbers = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 十一: 11, 十二: 12 };
export function parseQuery(value) {
  let query = normalize(value).slice(0, 160), week = null;
  const match = /\bweek\s*0?(\d{1,2})\b|第?\s*0?(\d{1,2})\s*周|第?([一二三四五六七八九十]+)周/.exec(query);
  if (match) { week = Number(match[1] || match[2] || numbers[match[3]]); query = query.replace(match[0], '').trim(); }
  return { week, terms: query.split(/\s+/).filter(Boolean) };
}
export function prepareIndex(index) {
  return index.map(record => ({ ...record, normalized: normalize(`${record.weekTitle} ${record.breadcrumb} ${record.title} ${record.text}`), normalizedTitle: normalize(record.title), normalizedText: normalize(record.text) }));
}
export function search(index, query) {
  const { week, terms } = parseQuery(query);
  if (!week && !terms.length) return { total: 0, results: [], terms };
  const matches = [];
  for (const record of index) {
    if (week !== null && Number(record.week) !== week) continue;
    if (!terms.every(term => record.normalized.includes(term))) continue;
    let score = terms.reduce((s, t) => s + (record.normalizedTitle.includes(t) ? 30 : 0) + (record.normalizedText.includes(t) ? 5 : 0), 0);
    if (!record.title.startsWith('答案')) score += 1;
    const offsets = terms.map(t => record.normalizedText.indexOf(t)).filter(p => p >= 0);
    const start = Math.max(0, (offsets.length ? Math.min(...offsets) : 0) - 45);
    const snippet = (start ? '…' : '') + record.text.slice(start, start + 165) + (start + 165 < record.text.length ? '…' : '');
    matches.push({ week: record.week, weekTitle: record.weekTitle, title: record.title, breadcrumb: record.breadcrumb, href: record.href, snippet, score });
  }
  matches.sort((a, b) => b.score - a.score || a.week.localeCompare(b.week));
  return { total: matches.length, results: matches.slice(0, 40), terms };
}
