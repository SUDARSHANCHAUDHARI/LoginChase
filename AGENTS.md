# LoginChase Repository Instructions

LoginChase is a zero-dependency static web application built with HTML, CSS, and vanilla JavaScript.

## Required checks

- Run `pnpm check` after source or documentation changes.
- Run `pnpm verify` before committing release-ready changes.
- Treat `dist/` as generated output; never commit it.
- Do not add GitHub Actions or other CI workflows without Sudarshan's explicit approval.

## Privacy invariants

- Never read, serialize, store, log, or transmit the fake email, password, or Remember Me values.
- Do not add a form `action`, input `name` attributes, analytics, external assets, network requests, cookies, or browser storage.
- Preserve the CSP restrictions for `connect-src 'none'` and `form-action 'none'`.
- Keep all generated UI content on safe DOM APIs such as `textContent`; do not introduce HTML injection sinks.

## Interaction invariants

- Attempt 5 must display “Do you actually remember your password?”
- Attempt 10 must always unlock the fake dashboard.
- Mouse, touch, pen, and keyboard paths must remain usable.
- Controls must stay inside the bounded arena, and reduced-motion behavior must remain available.

## Repository workflow

- This is a personal repository using `SUDARSHANCHAUDHARI <sunny.sudarshan@gmail.com>`.
- Stage files explicitly and keep commits atomic.
- Keep the GitHub repository private until Sudarshan explicitly approves public visibility.
