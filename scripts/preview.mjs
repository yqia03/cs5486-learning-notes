import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { root, json, args, basePath, fs, path } from './lib.mjs';

const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
export async function startPreview({ port = 4173, base } = {}) {
  const built = await json('dist/site-manifest.json');
  base = basePath(base || built.base);
  if (base !== built.base) throw new Error('Preview base must match the build base');
  const directory = path.join(root, 'dist');
  const server = http.createServer(async (req, res) => {
    try {
      const requested = new URL(req.url, 'http://localhost');
      if (base !== '/' && requested.pathname === base.slice(0, -1)) { res.writeHead(301, { Location: base + requested.search }); res.end(); return; }
      if (!requested.pathname.startsWith(base)) { res.writeHead(404); res.end('Not found; use the project base path.'); return; }
      let relative = decodeURIComponent(requested.pathname.slice(base.length));
      let filename = path.resolve(directory, relative || '.');
      if (filename !== directory && !filename.startsWith(directory + path.sep)) { res.writeHead(403); res.end(); return; }
      const stat = await fs.stat(filename);
      if (stat.isDirectory()) {
        if (!requested.pathname.endsWith('/')) { res.writeHead(301, { Location: requested.pathname + '/' + requested.search }); res.end(); return; }
        filename = path.join(filename, 'index.html');
      }
      const bytes = await fs.readFile(filename);
      res.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Content-Length': bytes.length, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' }); res.end(await fs.readFile(path.join(directory, '404.html'))); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}${base}` };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const options = args();
  const { server, url } = await startPreview({ port: options.port ? Number(options.port) : 4173, base: options.base });
  console.log(`Local: ${url}`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit()));
}
