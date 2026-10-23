# Prove each layer

## Local app and framing

```sh
bun test tests
bunx playwright install chromium
bun run test:browser
```

Unit tests cover collisions, rotation, randomized seven-shape bags, hard drop, line clearing, scoring, level progression, top-out, metadata escaping, and invalid deployment URLs. Browser checks cover initial crawler HTML, headers, PNG delivery, nested cross-origin frames, denied storage/cookies, keyboard/touch controls, pause/resume, game-over/restart, overflow at 320 and 640px, and ordinary outbound links.

The cross-origin harness models the **observed** sandbox permissions. It adds a localhost ancestor to the test server only. It does not emulate every X restriction or native client. Do not weaken production framing to run this test. A same-origin harness alone does not establish third-party behavior.

For adaptations with shared URL state, test both entry paths, malformed/out-of-range settings, correct restoration, back/forward interaction, and audience/visibility boundaries. Test all existing game inputs and source permissions independently of the embed shell. Include audio rejection, storage denial, fonts/images that load late, unmount cancellation, bounded network retries, and meaningful error/retry states where those dependencies exist.

## Public transport

Fetch anonymously, not through a signed-in browser session:

```sh
curl -fsSL -A 'Twitterbot/1.0' 'https://YOUR-DOMAIN/' -o /tmp/card.html
rg 'twitter:|og:' /tmp/card.html
curl -sSL -D /tmp/player-headers.txt 'https://YOUR-DOMAIN/embed/' -o /tmp/player.html
cat /tmp/player-headers.txt
bun run verify:live https://YOUR-DOMAIN/
```

Inspect the initial head, HTTP status, redirects, content types, actual poster bytes, every CSP and X-Frame-Options header, and same metadata for browser/crawler user agents. Confirm no localhost or private/internal asset URLs remain. A local build cannot prove public reachability. A valid head cannot prove that dependent API or media reads are anonymous.

## Actual X behavior

Post the **share URL**, not `/embed/`, only if the user authorized an X post. Activate the resulting card on desktop and the mobile clients that matter. Record date, client/browser version, whether it stayed inline, controls, sound gesture behavior, outbound links, and any permission errors. Leave this explicitly unverified when no authorized real-post/device test occurred.

No current guaranteed approval process, card-cache TTL, forced refresh API, or universal native-app behavior is established by the source article. Do not invent those promises. A real third-party example does not prove this domain's acceptance.

## Debug in this order

| Symptom | Inspect |
| --- | --- |
| No card or ordinary image only | Initial tags, competing card types, public crawl/poster access, then platform handling of this domain. |
| Poster works, player blank | Final player URL, CSP/X-Frame-Options, mixed content, JavaScript errors. |
| Works directly, fails in-frame | Nested ancestors, auth/storage dependencies, permissions, frame-size layout. |
| Old title or art persists | Compare fresh public HTML to the card. Your CDN and X's cache are independent. |
| Sound does not start | Gesture inside the child document, browser policy, rejected audio operation. |

A fresh authorized test share URL can help distinguish stale metadata from incorrect current output. Do not invent endless versioned routes as the production cache design. Purging your CDN does not prove X recrawled. Revoking source access cannot erase posters already cached or downloaded by others.

## Completion evidence

Report the repo/commit, deployed share and player URLs, test results, deployed header checks, and the boundary of real-client evidence. Keep source verification, public transport verification, browser behavior, and X platform acceptance separate.
