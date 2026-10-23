---
name: x-player-cards
description: Build and verify compact interactive web apps, games, and replay players for X Player Cards, including share metadata, iframe permissions, anonymous operation, and deployment. Use for apps embedded inside X posts, not embedding X posts in a website.
---

# Build an interactive X Player Card

Create a useful standalone web app with a compact, anonymous player that X can load in an iframe. Start from the user's app and hosting choices. The included Dropfield game is an example, not the required product or framework.

Read [the integration guide](references/integration.md) for metadata, headers, sandbox behavior, URL state, and Next.js details. Read [verification](references/verification.md) before claiming completion. For this starter or Vercel publishing, read [deployment](references/deployment.md).

## Preserve the three-resource contract

- **Share page:** a useful ordinary page returning HTTP 200 and one coherent `twitter:card=player` definition in its initial HTML head, plus Open Graph fallback tags.
- **Player:** a separate public HTTPS HTML URL in `twitter:player`, containing only the compact experience. Keep authentication, account providers, wallet flows, and operator controls out of this shell.
- **Poster:** a public absolute HTTPS raster-image URL; no private bucket URLs, expiring credentials, login, or bot challenges.

No X SDK or posting API is required for the HTML integration. Do not add a fake `twitter:player:stream`: it is for a real media stream, not HTML. Do not invent an account handle. Keep crawler and human metadata consistent, and framing headers present for ordinary browsers too.

## Build the player boundary

Use existing app logic where possible. Opening a replay or crawling its metadata should read existing artifacts, not start a new game, paid generation, or an export job. Apply source visibility checks to metadata, player reads, and media independently; a UI toggle is not an authorization boundary.

Keep guest play usable with cookies, localStorage, sessionStorage, and IndexedDB unavailable. Use in-memory preferences. Where a backend exists, make public reads explicitly anonymous rather than invoking a token-reading client. Do not use wildcard API CORS to solve iframe permissions.

Fit real 320–640px frames, with legible controls, keyboard focus, and touch support. Begin silently with an explicit start action. Request sound from a gesture inside the player; the click that created the iframe may not activate the child document. Keep an ordinary `target="_blank" rel="noopener noreferrer"` link to the full experience. Feature-detect optional fullscreen and Web Share.

## Set headers where they are enforced

Allow X ancestors on the **player response**, using an HTTP CSP header:

```http
Content-Security-Policy: frame-ancestors 'self' https://x.com https://*.x.com https://twitter.com https://*.twitter.com
```

Retain appropriate non-framing CSP directives. A meta tag cannot set `frame-ancestors`; `frame-src` is a different control. Every ancestor in nested frames must be allowed. Remove conflicting X-Frame-Options on the player and inspect all CSP headers after redirects. An added permissive CSP does not loosen an existing restrictive policy. Keep the normal site protected.

## Start from the working example when useful

This skill directory is also the complete repository. `examples/dropfield/` holds a dependency-free browser game, separate rules engine, full page, compact player, and poster. `scripts/build.ts` emits initial-head metadata with absolute URLs. `vercel.json` sets player-only framing permissions. The runtime needs no framework, server, secrets, or external requests.

For a new project, copy those resources plus `scripts/`, `tests/`, `browser-tests/`, `playwright.config.ts`, `bunfig.toml`, `package.json`, `bun.lock`, `site.config.json`, and `vercel.json` into the user's chosen workspace. Customize branding, account attribution, repository links, poster and accessible text together. Preserve an existing app's structure instead when that is simpler.

Use Bun for this starter: `bun install --frozen-lockfile`, `bun run dev`, `bun test tests`, and `bun run test:browser`. Build with the target's real public `SITE_URL`; never publish localhost metadata. Installing or invoking this skill does not authorize posting to X or publishing a new repository. Deploy when that is in the user's requested scope.

## Report what was actually proved

Distinguish source review, local tests, deployed anonymous HTTP/browser tests, and actual X-client tests. Successful metadata and iframe tests do **not** prove X accepts a domain or renders an inline card in every client. The source observations were desktop-specific; current platform policy, approval requirements, cache lifetimes, and mobile behavior remain unestablished until independently checked.

This skill adapts [The House's October 22, 2026 implementation notes](https://thehouse.game/updates/2026-10-22-interactive-x-embeds). Supporting sources and their scope are in the references.
