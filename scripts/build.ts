import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function siteURL(input: string) {
  const url = new URL(input);
  if (url.username || url.password || url.search || url.hash) throw new Error('SITE_URL must not include credentials, a query, or a fragment.');
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('SITE_URL must use HTTPS (HTTP is allowed only on localhost).');
  url.pathname = url.pathname.replace(/\/*$/, '/');
  return url;
}
export const escapeHTML = (text: string) => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function metadata(base: URL, config: { title: string; description: string; twitterSite: string }) {
  if (config.twitterSite && !/^@[A-Za-z0-9_]{1,15}$/.test(config.twitterSite)) throw new Error('twitterSite must be an actual @handle, or empty.');
  const tags = [
    ['name', 'description', config.description],
    ['name', 'twitter:card', 'player'],
    ...(config.twitterSite ? [['name', 'twitter:site', config.twitterSite]] : []),
    ['name', 'twitter:title', config.title], ['name', 'twitter:description', config.description],
    ['name', 'twitter:image', new URL('poster.png', base).href],
    ['name', 'twitter:image:alt', 'Dropfield: a falling-block game with a sage, lilac, and apricot playfield.'],
    ['name', 'twitter:player', new URL('embed/', base).href],
    ['name', 'twitter:player:width', '640'], ['name', 'twitter:player:height', '640'],
    ['property', 'og:type', 'website'], ['property', 'og:title', config.title],
    ['property', 'og:description', config.description], ['property', 'og:url', base.href],
    ['property', 'og:image', new URL('poster.png', base).href],
    ['property', 'og:image:width', '1200'], ['property', 'og:image:height', '1200'],
  ];
  return `<link rel="canonical" href="${escapeHTML(base.href)}">\n` + tags.map(([attr, key, value]) => `  <meta ${attr}="${key}" content="${escapeHTML(value)}">`).join('\n');
}

export async function build() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const source = resolve(root, 'examples/dropfield'), output = resolve(root, 'dist');
  const config = await Bun.file(resolve(root, 'site.config.json')).json();
  // Vercel supplies the stable production hostname; preview URLs must not become canonical.
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const base = siteURL(process.env.SITE_URL || (host ? `https://${host}` : 'http://localhost:4173/'));
  if (process.env.VERCEL && base.protocol !== 'https:') throw new Error('Set SITE_URL or enable Vercel system environment variables before deploying.');
  await rm(output, { recursive: true, force: true });
  await mkdir(resolve(output, 'embed'), { recursive: true });
  const template = await Bun.file(resolve(source, 'index.html')).text();
  const html = template.replace('{{METADATA}}', metadata(base, config)).replaceAll('{{TITLE}}', escapeHTML(config.title)).replaceAll('{{REPOSITORY}}', escapeHTML(config.repository));
  if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error('Unresolved build template field.');
  await Bun.write(resolve(output, 'index.html'), html);
  await cp(resolve(source, 'player.html'), resolve(output, 'embed/index.html'));
  for (const name of ['engine.js', 'player.js', 'player.css', 'site.css', 'favicon.svg', 'poster.png']) await cp(resolve(source, name), resolve(output, name));
  await Bun.write(resolve(output, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  console.log(`Built ${output} for ${base.href}`);
}
if (import.meta.main) await build();
