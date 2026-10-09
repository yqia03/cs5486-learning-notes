import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse, serialize, serializeOuter } from 'parse5';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const read = p => fs.readFile(path.join(root, p), 'utf8');
export const json = async p => JSON.parse(await read(p));
export async function write(p, value) {
  const target = path.join(root, p);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value, null, 2) + '\n');
}
export const sha = value => crypto.createHash('sha256').update(value).digest('hex');
export function all(node, predicate = () => true) {
  const result = [];
  function visit(n) { if (n.tagName && predicate(n)) result.push(n); for (const c of n.childNodes || []) visit(c); }
  visit(node); return result;
}
export const attr = (n, name) => n.attrs?.find(a => a.name === name)?.value;
export function set(n, name, value) {
  const a = n.attrs.find(a => a.name === name);
  if (a) a.value = String(value); else n.attrs.push({ name, value: String(value) });
}
export const hasClass = (n, name) => (attr(n, 'class') || '').split(/\s+/).includes(name);
export const text = n => n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join('');
export const norm = s => s.replace(/\s+/g, ' ').trim();
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const article = d => all(d, n => hasClass(n, 'textbook-body'))[0];
export const bookHeader = d => all(d, n => hasClass(n, 'book-header'))[0];
export const headings = d => all(article(d), n => /^h[2-4]$/.test(n.tagName));
export function args() {
  const result = {};
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i];
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    result[key.slice(2)] = process.argv[i + 1]?.startsWith('--') || i + 1 === process.argv.length ? true : process.argv[++i];
  }
  return result;
}
export function basePath(value) {
  if (typeof value !== 'string' || !/^\/[A-Za-z0-9_/-]*$/.test(value) || value.includes('..')) throw new Error('Invalid base path');
  return value.replace(/\/+$/, '') + '/';
}
export function fingerprint(doc) {
  const body = article(doc);
  if (!body || !bookHeader(doc)) throw new Error('Expected textbook header and article');
  const count = {};
  for (const n of all(body)) count[n.tagName] = (count[n.tagName] || 0) + 1;
  const svgCanonical = n => serializeOuter(n).replace(/w\d{2}-svg\d+-/g, '');
  return {
    text: sha(norm(text(body))), header: sha(norm(text(bookHeader(doc)))),
    counts: Object.fromEntries(['h2', 'h3', 'h4', 'math', 'svg', 'img', 'table', 'details', 'summary'].map(t => [t, count[t] || 0])),
    blocks: Object.fromEntries(['worked-example', 'checkpoint', 'importance', 'rating', 'source'].map(c => [c, all(body, n => hasClass(n, c)).length])),
    headings: headings(doc).map(n => ({ level: Number(n.tagName[1]), title: norm(text(n)) })),
    math: all(body, n => n.tagName === 'math').map(n => sha(serializeOuter(n))),
    svg: all(body, n => n.tagName === 'svg').map(n => sha(svgCanonical(n)))
  };
}
export const topics = [
  '智能系统导论与神经网络的统一框架', 'M-P 神经元、阈值逻辑与感知机', 'ADALINE、多层感知机与反向传播',
  'RBF、显式特征映射与硬间隔 SVM', '软间隔、核 SVM、SVR 与 LS-SVM', '竞争学习、ART 与自组织映射',
  '离散 Hopfield 网络、联想记忆与 BAM', '连续 Hopfield 网络与 TSP 能量建模', '模拟退火、随机网络与 ESN',
  '模糊集合、模糊推理与 Type-2 系统', '进化计算、遗传算法与编码设计', '群体智能、粒子群优化与全课程整合'
];
export { parse, serialize, serializeOuter, fs, path };
