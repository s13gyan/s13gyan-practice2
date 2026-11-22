const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 3001;
const publicDir = path.join(__dirname, 'public');

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  if (url.pathname === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ status: 'ok', app: 'Docker Practice Lab: Level 2' }));
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  let requested;
  try { requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); }
  catch { response.writeHead(400); response.end('Bad request'); return; }
  const file = path.resolve(publicDir, `.${requested}`);
  if (!file.startsWith(`${publicDir}${path.sep}`)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error'); return; }
    const type = path.extname(file) === '.html' ? 'text/html; charset=utf-8' : 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
});

server.listen(port, host, () => console.log(`Docker Practice Lab: Level 2 at http://${host}:${port}`));
