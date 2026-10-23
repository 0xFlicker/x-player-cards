// A separate origin, with X's observed nested sandbox. This is a test model,
// not a claim that X will accept the card or use these attributes forever.
const sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';
Bun.serve({ port: 4174, hostname: 'localhost', fetch(request) {
  const url = new URL(request.url);
  const size = Number(url.searchParams.get('size')) === 320 ? 320 : 640;
  const src = url.pathname === '/inner' ? 'http://127.0.0.1:4173/embed/' : `/inner?size=${size}`;
  return new Response(`<!doctype html><html><head><title>Sandbox harness</title></head><body style="margin:0"><iframe title="sandbox" src="${src}" width="${size}" height="${size}" style="border:0;display:block" sandbox="${sandbox}" allow="autoplay; fullscreen; web-share"></iframe></body></html>`, { headers: { 'Content-Type': 'text/html' } });
} });
