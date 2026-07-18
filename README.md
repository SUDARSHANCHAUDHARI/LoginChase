# LoginChase

LoginChase is a complete, zero-dependency fake login experience where the Login button would rather be anywhere else. It is a joke interface—not an authentication system.

After ten attempts, the button gives up and reveals a celebratory fake dashboard. The fifth attempt asks the important question: “Do you actually remember your password?”

## Features

- Fake email and password fields, Remember Me checkbox, Login, and Cancel controls
- Ten randomized evasive reactions: move, shrink, swap, question, disable, rotate, hide, relabel, split, and last-moment dodge
- A visible and screen-reader-friendly attempt tracker
- Guaranteed success on attempt 10
- Fake dashboard celebration with locally generated confetti
- Mouse, touch, pen, and keyboard interaction paths
- Controls constrained to a bounded arena so they stay on screen
- Locally synthesized sound effects with an accessible sound toggle
- Full reset and replay controls
- Responsive layout, visible focus states, high-contrast support, and reduced-motion support
- Browser and hosting security policies that block form submission and network connections
- Reproducible, dependency-free production artifact generation
- No dependencies, backend, analytics, or external assets

## Privacy and safety

The app never reads, stores, or transmits the email, password, or Remember Me value.

- The form has no `action` and every submission is prevented in JavaScript.
- The inputs have no `name` attributes, so they cannot be serialized by a normal form submission.
- The JavaScript never accesses either input's value.
- No `fetch`, `XMLHttpRequest`, `sendBeacon`, cookies, local storage, session storage, or `FormData` is used.
- Cancel and Reset call the browser's native form reset behavior to clear the fields without reading them.
- Unlocking the fake dashboard also clears every field immediately.
- Sound is generated on the device with the Web Audio API; no media is downloaded.

Like any ordinary form field, typed text exists temporarily in the current page's memory while it is visible. Reloading or closing the page discards it.

## Run locally

No installation or build step is required. Open `index.html` directly, or run a small local server:

```bash
pnpm start
```

Then visit `http://localhost:4173`.

## Verify

Node.js 18+ and pnpm are recommended for the included static checks:

```bash
pnpm verify
```

The verification command validates JavaScript syntax, required controls, all ten reactions, privacy-sensitive API exclusions, accessibility hooks, reduced-motion support, and security headers. It then creates the deployable `dist/` artifact.

No GitHub Actions workflow is included. Run `pnpm verify` locally before every release until CI is explicitly approved and configured.

## Production build

```bash
pnpm build
```

The build recreates `dist/` from a fixed allowlist of runtime files. Deploy the contents of that directory to a static host. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for required headers, cache behavior, and the manual release checklist.

## Keyboard controls

- Press `Tab` to move through controls.
- Press `Enter` or `Space` to activate buttons.
- Pressing `Enter` from a fake input also counts as a login attempt.
- Temporary visual tricks never remove the Login button from the accessibility tree.

## Project structure

```text
LoginChase/
├── AGENTS.md           Local development and privacy invariants
├── CHANGELOG.md        Release history
├── SECURITY.md         Vulnerability reporting policy
├── index.html          Semantic page structure
├── styles.css          Responsive design, reactions, and motion preferences
├── script.js           Attempt state, evasive behavior, sound, and celebration
├── favicon.svg         Local vector favicon
├── _headers            Portable static-host security headers
├── docs/DEPLOYMENT.md  Hosting and release instructions
├── scripts/build.mjs   Allowlisted production artifact builder
├── scripts/verify.mjs  Zero-dependency static verification
├── package.json        Local run and check commands
├── .gitignore          Common local-only files
└── README.md           Project documentation
```

## Browser support

LoginChase targets current evergreen browsers. If Web Audio is unavailable, the game continues silently. If JavaScript is disabled, the page explains why the chase cannot run and still does not submit anything.
