# Integration decisions

## Metadata and public resources

The shared page advertises a second document. The card is not an iframe you paste into a post, and `twitter:player` is not a direct video URL.

```html
<meta name="twitter:card" content="player">
<meta name="twitter:site" content="@YOUR_REAL_HANDLE">
<meta name="twitter:title" content="Your app">
<meta name="twitter:description" content="A useful, specific description.">
<meta name="twitter:image" content="https://example.com/poster.png">
<meta name="twitter:player" content="https://example.com/embed/">
<meta name="twitter:player:width" content="640">
<meta name="twitter:player:height" content="640">
<meta property="og:type" content="website">
<meta property="og:title" content="Your app">
<meta property="og:description" content="A useful, specific description.">
<meta property="og:image" content="https://example.com/poster.png">
<meta property="og:url" content="https://example.com/">
```

Replace every placeholder before publishing. The starter uses a square 640px viewport and 1200px PNG poster; those are design choices, not platform maxima. Serve the poster with its correct image content type. An SVG favicon is fine; use a raster poster for the card. Verify the full rendered head, including inherited layout tags, rather than only a metadata function. Do not add a stream field unless it points at an actual compatible media stream.

Share, player, image, and any backend/media dependencies must be reachable anonymously over HTTPS. No secrets belong in HTML or URLs. Avoid user-agent-dependent page variants: social crawlers and browsers should receive the same metadata, and a CDN can otherwise cache the wrong variant. Do not run expensive application or generation work merely to answer a crawler.

## Framing and sandbox limits

Dropfield's [October 23, 2026 manual test](verification.md#actual-x-behavior) found inline play in regular posts on web, a web popup targeting `/embed/` in regular posts on mobile, and no working interactive player in X Articles. Treat regular posts as the tested sharing surface. Build the player to work when opened directly as well as inside a frame; it must not depend on initialization or messages from the share page or a parent frame. The mobile popup targets `twitter:player`, not the ordinary share page, and is distinct from the player's outbound full-page link.

The player needs `frame-ancestors 'self' https://x.com https://*.x.com https://twitter.com https://*.twitter.com` in an **HTTP response header**. Meta CSP cannot enforce this directive. `frame-src` governs children of your document, not parents. All ancestors in a nested frame chain must pass. Multiple CSPs are enforced together, so inspect the application, proxy, and CDN for restrictive duplicates. Remove conflicting `DENY`/`SAMEORIGIN` X-Frame-Options on the embed route only.

The House's desktop inspection of a third-party game observed:

```html
sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
allow="autoplay; fullscreen; web-share"
```

Use this as a test fixture, not a platform contract. `allow-same-origin` preserves the child's own origin; it does not expose X's DOM or cookies. Forms and top navigation were not allowed by the observed sandbox. A reader-activated ordinary new-tab link is the practical escape for sign-in, wallet, checkout, and full-app flows. Popup blockers and different X clients can still affect it.

Permission delegation alone cannot override browser autoplay rules. Start silent. Use a child-document gesture to play sound, and catch a rejected audio start without breaking gameplay. Fullscreen and Web Share are optional features, not assumptions. Detect them, handle cancellation, and keep ordinary links. A viewport-based fullscreen fallback remains inside the iframe.

Do not assume third-party storage works even if the observed sandbox contains `allow-same-origin`. Avoid reading it on the critical path. Dropfield makes no storage or API calls. When adapting a connected application, explicitly use anonymous requests (for example `credentials: 'omit'`) and exclude token-reading auth clients, consent-dependent tracking, and private provider evidence.

Visibility changes can pause work, but `document.hidden` alone does not prove a scrolled-away iframe is visible or invisible. Avoid silently changing a full application's background-playback rules just to implement an embed.

## Shared state and short links

For replays or parameterized apps, capture a canonical coordinate and supported settings when the person clicks Share. Parse and validate them consistently at both entry points. Bound numeric values, reject malformed combinations, and keep private/account state out. UI text is not authority for game events, outcomes, audience membership, or timestamps.

An audience-specific cursor belongs to that audience. Fetch only permitted data; hiding spoiler or private state with CSS is insufficient. Keep access checks on metadata, media, player, and backend reads. A short link never grants new access.

If you add short links, the short URL should return its own HTTP 200 with complete metadata and a direct player URL carrying saved settings. Supply an ordinary link to the full destination. Do not rely on client-side redirects for crawler discovery. An HTTP redirect is not categorically forbidden, but verify what the crawler actually receives at every hop.

Dropfield intentionally has no share-state parameters. A new load is a fresh session. It does not promise saved scores or restorable boards. Add validated state only if the user's product needs it.

Farcaster Mini App launch metadata is a separate integration with separate permissions; it does not follow automatically from X Player Cards.

## Next.js adaptation (conditional)

The House used Next.js **16.1.7**. At that version its typed metadata API required `streamUrl`, but an empty string was omitted by the renderer:

```ts
import type { Metadata } from 'next';
const twitter = {
  card: 'player', title, description, images: [posterUrl],
  players: [{ playerUrl, streamUrl: '', width: 640, height: 640 }],
} satisfies NonNullable<Metadata['twitter']>;
```

This is version-specific behavior, not a permanent workaround to copy blindly. Inspect the installed version's public types and test its actual HTML output after upgrades. Do not suppress types with `as any`, omit a field that the renderer dereferences, or invent a fake stream URL. Keep runtime code on public framework APIs.

Twitterbot is among Next's blocking-metadata defaults. The House chose `htmlLimitedBots: /.*/` so all clients get metadata in the initial head. This replaces the default matcher and disables metadata streaming, potentially delaying the response; it is a project tradeoff, not an X requirement. Verify rendered HTML before choosing it.

A child layout cannot remove providers attached by the root. Use a minimal root and site-only route group so the embed avoids auth/wallet/site chrome while sharing the actual player logic. Metadata should load a small eligibility/title/artwork record rather than hydrate a full replay. Preserve independent source permissions and canonical state.

## Source trail

- [The House: How to put an interactive player inside an X post](https://thehouse.game/updates/2026-10-22-interactive-x-embeds) — primary implementation account, October 22, 2026; desktop observations are not a universal platform guarantee.
- [X's official HTML player sample](https://github.com/xdevplatform/cards-player-samples/blob/main/player/page.html) — demonstrates player metadata without a stream field.
- [MDN: frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors) — HTTP-only directive, nested ancestors, and distinction from frame-src.
- [MDN: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) and [autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — browser behavior, not X product policy.
- [Next: htmlLimitedBots](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots) and [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — check against the installed version.

At the time of the original research, the old official Player Card documentation redirected to the general API overview, and X's current documentation index had no card section. This does not establish either approval or prohibition of arbitrary games. Recheck current official material when making platform-policy claims.
