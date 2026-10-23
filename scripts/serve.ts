import { resolve, sep } from 'node:path';
const root = resolve(import.meta.dir, '../dist');
const port = Number(process.env.PORT || 4173);
const policy = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'";
const server = Bun.serve({
  hostname: '127.0.0.1', port,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/embed') return Response.redirect(new URL('/embed/', url), 308);
    let pathname: string;
    try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('Bad URL', { status: 400 }); }
    const file = resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + sep)) return new Response('Forbidden', { status: 403 });
    const body = Bun.file(file);
    if (!await body.exists()) return new Response('Not found', { status: 404 });
    const isPlayer = pathname.startsWith('/embed/');
    // Test-only extra origin models an external host. Never used in production config.
    const ancestors = isPlayer ? `'self' https://x.com https://*.x.com https://twitter.com https://*.twitter.com ${process.env.TEST_FRAME_ORIGIN || ''}`.trim() : "'none'";
    return new Response(body, { headers: {
      'Content-Security-Policy': `${policy}; frame-src 'self'; frame-ancestors ${ancestors}`,
      'X-Content-Type-Options': 'nosniff',
      ...(isPlayer ? {} : { 'X-Frame-Options': 'DENY' }),
    } });
  },
});
console.log(`Dropfield: ${server.url}`);
