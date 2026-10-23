import { expect, test } from 'bun:test';
import { metadata, siteURL } from '../scripts/build';

test('metadata preserves a deployment base path and escapes content', () => {
  const html = metadata(siteURL('https://example.org/arcade'), { title: 'A "great" <game>', description: 'stack & play', twitterSite: '@example' });
  expect(html).toContain('https://example.org/arcade/embed/');
  expect(html).toContain('https://example.org/arcade/poster.png');
  expect(html).toContain('A &quot;great&quot; &lt;game&gt;');
  expect(html.match(/name="twitter:card"/g)).toHaveLength(1);
  expect(html).not.toContain('twitter:player:stream');
  expect(html).toContain('property="og:url"');
});
test('deployment URLs reject credentials, non-HTTPS, query and fragments', () => {
  for (const url of ['https://u:p@example.com', 'http://example.com', 'https://example.com/?token=a', 'https://example.com/#x', 'javascript:alert(1)']) expect(() => siteURL(url)).toThrow();
  expect(siteURL('http://localhost:4173').href).toBe('http://localhost:4173/');
});
test('never invent or accept an invalid account handle', () => {
  expect(() => metadata(siteURL('https://example.com'), { title: 'Game', description: '', twitterSite: 'not a handle' })).toThrow();
  expect(metadata(siteURL('https://example.com'), { title: 'Game', description: '', twitterSite: '' })).not.toContain('twitter:site');
});
