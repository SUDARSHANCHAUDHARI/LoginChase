# Production deployment

LoginChase is host-agnostic and can be deployed to any HTTPS static host.

## Build and verify

From a clean checkout with Node.js 18+ and pnpm 10.28.2:

```bash
pnpm verify
```

This command runs the privacy, behavior, accessibility, and security checks before recreating `dist/` from an explicit allowlist. Deploy only the contents of `dist/`.

## Required hosting behavior

The generated artifact includes `_headers`, which is recognized by hosts such as Netlify and Cloudflare Pages. On hosts that do not support this format, configure the equivalent response headers manually:

- `Content-Security-Policy` as defined in `_headers`
- `Cross-Origin-Opener-Policy: same-origin`
- `Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=(), usb=()`
- `Referrer-Policy: no-referrer`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

The HTML also contains a CSP meta fallback. Response headers remain necessary for protections such as `frame-ancestors`.

Serve all files with `Cache-Control: public, max-age=0, must-revalidate`. The current assets use stable filenames rather than content hashes, so immutable caching is not safe.

## Manual release checklist

1. Confirm the GitHub repository is still private unless public visibility was explicitly approved.
2. Run `pnpm verify` from a clean working tree.
3. Deploy only `dist/` over HTTPS.
4. Confirm the host applies the response headers above.
5. Manually exercise ten attempts with keyboard, pointer, and touch on representative devices.
6. Confirm attempt 5 shows the password prompt and attempt 10 opens the fake dashboard.
7. Confirm Cancel, Reset, sound toggle, and reduced-motion behavior.
8. Confirm no form submission, network request, analytics event, cookie, or storage write occurs.

Browser automation and session captures are not part of this repository's verification workflow. Visual review must be performed manually without recording the session.

## Rollback

Keep the previous verified `dist/` artifact or deployment version. If a release fails any smoke check, restore that previous artifact; LoginChase has no database, migrations, or server state to roll back.
