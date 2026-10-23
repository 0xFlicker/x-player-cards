# Publish the starter on Vercel

## Fork, customize, run

1. Fork or use this repository as a GitHub template.
2. Edit `site.config.json`: title, description, actual X handle, and your source repository URL. An empty `twitterSite` omits attribution; it must never be replaced with a fabricated handle.
3. Replace Dropfield's UI, source assets, poster, favicon, and hard-coded accessible descriptions when making a different app. `scripts/build.ts` also contains poster alt text. The pure rules engine is separate from the player shell.
4. Install [Bun](https://bun.sh), then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Visit `http://localhost:4173/`. A direct `file://` open cannot model module loading, response headers, or iframe origin behavior.

## Vercel Git import

Import your fork into the intended Vercel team, choose **Other** for Framework Preset, and leave Root Directory at the repository root. `vercel.json` owns the build command, `dist` output, and route headers. The install uses the committed Bun lockfile. The build runs unit tests before generating the site.

Vercel's `VERCEL_PROJECT_PRODUCTION_URL` supplies the stable hostname. The build uses that for both production and preview metadata rather than accidentally advertising a disposable preview URL. If using a custom domain, set `SITE_URL=https://your-domain.example/` in the appropriate project environments and redeploy. `SITE_URL` contains no secret and must have no query, fragment, or embedded credentials. Localhost is allowed only for local development.

The share page and `/embed/` must be publicly accessible. Vercel's default preview protection may prevent anonymous crawler/browser access on preview aliases; test the production domain. Configure public production access within the intended project rather than giving a crawler an authentication bypass token. Never place bypass credentials in metadata or share links.

The included framing policy lets X and same-origin pages frame `/embed/`, while the share page denies framing. Other websites cannot embed the production player unless you intentionally add their origins. The local cross-origin harness adds its localhost origin only in the development server. Do not copy that development permission into production.

## Authorized CLI deployment

If the user requested publication and the CLI is authenticated, confirm the team and new project name, then link and deploy from this repository:

```sh
bunx vercel link
bunx vercel --prod
```

Do not relink or modify an unrelated existing project. An installed skill is not blanket authority to create public repos, spend money, or post on X. A fork/import flow does not require app secrets. Existing Vercel authentication belongs to the operator's local CLI or Vercel account, never the repository.

## Verify the real deployment

```sh
bun run verify:live https://YOUR-PRODUCTION-DOMAIN/
```

Then exercise the production game in a browser. The script validates public HTML, coherent crawler/human metadata, same-origin HTML player, framing headers, normal-site protection, and a PNG poster. It does not certify every CSP combination or X rendering. Review the final headers manually if middleware, proxies, or CDNs are added.

The GitHub Actions workflow runs unit and browser checks on pushes and pull requests. Vercel builds run unit tests. Git-connected automatic deployments do not inherently wait for the separate GitHub browser checks; configure a deployment check if your release process needs that gate.

## Hosting elsewhere

The built `dist/` is static and portable. `vercel.json` is host-specific; translate its route policies into your actual server or CDN response headers. GitHub Pages cannot configure these custom headers from the repository: `_headers` and HTML meta tags are not a substitute. Choose a host with HTTP header control when an explicit ancestor allowlist is required.

Keep asset links relative and metadata URLs absolute. The build supports a `SITE_URL` subpath, but the example Vercel routes target the domain root; adapt routing/header matches and test all resources if deploying under a subpath.

References: [Vercel project configuration](https://vercel.com/docs/project-configuration), [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), and [deployment protection](https://vercel.com/docs/deployment-protection).
