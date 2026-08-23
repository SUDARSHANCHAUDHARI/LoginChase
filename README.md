# LoginChase

LoginChase is a humorous, accessible fake login experience where the Login button actively avoids the user. It is built as a standalone static website using HTML, CSS, and vanilla JavaScript.

> **Important:** LoginChase is a joke interface, not an authentication system. It has no backend, accounts, analytics, credential handling, or network communication.

## Table of Contents

- [Project status](#project-status)
- [Features](#features)
- [Login reactions](#login-reactions)
- [Technology](#technology)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Commands](#commands)
- [Privacy and security](#privacy-and-security)
- [Accessibility](#accessibility)
- [Verification](#verification)
- [Production deployment](#production-deployment)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Browser support](#browser-support)
- [Release history](#release-history)
- [License and ownership](#license-and-ownership)
- [About](#about)

## Project status

- **Version:** 1.0.0
- **Release readiness:** Production-ready source and deployable static artifact
- **Repository visibility:** Private until public release is explicitly approved
- **Default branch:** `main`
- **Runtime dependencies:** None
- **Repository:** [SUDARSHANCHAUDHARI/LoginChase](https://github.com/SUDARSHANCHAUDHARI/LoginChase)

After ten attempts, the Login button gives up and reveals a celebratory fake dashboard. Attempt five asks the important question: “Do you actually remember your password?”

## Features

- Fake email and password fields
- Remember Me checkbox
- Login and Cancel controls
- Ten randomized evasive reactions
- Visible and screen-reader-friendly attempt tracking
- Guaranteed fifth-attempt prompt and tenth-attempt success
- Fake dashboard celebration with locally generated confetti
- Mouse, touch, pen, form-submit, and keyboard interaction paths
- Controls constrained to a bounded arena so they remain on screen
- Locally synthesized sound effects with an accessible sound toggle
- Reset, Cancel, and replay behavior that clears the fake fields without reading them
- Responsive layout for mobile and desktop
- Visible keyboard focus and native semantic controls
- High-contrast and reduced-motion support
- Browser and hosting security policies that block form submission and network connections
- Reproducible, dependency-free production artifact generation

## Login reactions

Each unsuccessful attempt randomly selects a reaction without immediately repeating the previous one.

| Reaction | Behavior |
| --- | --- |
| Move away | Relocates the Login button inside the bounded arena |
| Shrink | Temporarily makes the Login button much smaller |
| Swap with Cancel | Exchanges the visual positions of Login and Cancel |
| Are you sure? | Changes the Login label into a follow-up question |
| Temporarily disabled | Disables the button briefly, then restores it |
| Rotate | Tilts the Login button by nineteen degrees |
| Hide behind the form | Places the button visually behind the form while preserving keyboard access |
| Maybe Later | Relabels Login as “Maybe Later” |
| Split into fake buttons | Creates two additional accessible decoy buttons |
| Last-moment move | Moves once, then performs a second delayed dodge |

## Technology

- **Markup:** Semantic HTML5
- **Styling:** Modern CSS with responsive, forced-colors, and reduced-motion media queries
- **Behavior:** Vanilla JavaScript in a strict-mode isolated function
- **Sound:** Web Audio API with locally synthesized tones
- **Verification and build:** Node.js scripts using only built-in modules
- **Local server:** Python standard-library HTTP server
- **Package manager:** pnpm 10.28.2
- **Dependencies:** No runtime or development packages

## Requirements

The website itself can be opened directly without installing anything. The repository commands require:

- Node.js 18 or newer
- pnpm 10.28.2
- Python 3 for `pnpm start`
- A current evergreen browser for the complete experience

## Getting started

The GitHub repository is private, so cloning requires access to the `SUDARSHANCHAUDHARI` account or an authorized collaborator account.

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/LoginChase.git
cd LoginChase
pnpm start
```

Visit `http://localhost:4173`.

No dependency installation or build step is required for local development. You can also open `index.html` directly, although a local HTTP server more closely matches production behavior.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm start` | Serve the source directory at `http://localhost:4173` |
| `pnpm check` | Check JavaScript syntax and run the static project verifier |
| `pnpm test` | Run the same verification suite through the test entry point |
| `pnpm build` | Recreate the allowlisted production artifact in `dist/` |
| `pnpm verify` | Run all checks and then generate the production artifact |

## Privacy and security

The application never reads, stores, or transmits the fake email, password, or Remember Me value. It also never serializes or logs those values.

- The form has no `action`, and JavaScript prevents every submission.
- The fake inputs have no `name` attributes, so a browser cannot serialize them as normal form data.
- The JavaScript never accesses an input's `.value`.
- No `fetch`, `XMLHttpRequest`, `sendBeacon`, `FormData`, cookies, local storage, or session storage is used.
- No analytics, external scripts, external fonts, or remote media are loaded.
- Cancel, Reset, and successful fake login use the browser's native form reset behavior.
- Sound is synthesized on the device; no audio file is downloaded.
- The content security policy uses `connect-src 'none'` and `form-action 'none'`.
- The production `_headers` file adds anti-framing, no-sniff, referrer, permissions, and cross-origin protections.

Like any ordinary form field, typed text exists temporarily in the current page while it is visible. Clearing, resetting, successfully completing, reloading, or closing the page discards it.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and the supported-version policy.

## Accessibility

- Native labels, inputs, checkbox, and buttons are used before ARIA.
- Attempt progress is exposed through an accessible progress bar.
- Dynamic reactions are announced through a polite live status region.
- Keyboard users can activate Login with `Enter` or `Space`.
- Pressing `Enter` from a fake input also counts as an attempt.
- Touch and pen users use pointer-down handling instead of hover-only behavior.
- Temporary button states preserve or conservatively restore keyboard focus.
- Moved and generated buttons remain inside the bounded arena.
- `prefers-reduced-motion` disables nonessential animation and smooth scrolling.
- Forced-colors styles preserve important boundaries in high-contrast modes.

## Verification

Run the complete local quality gate before committing release-ready changes:

```bash
pnpm verify
```

The verifier checks:

- JavaScript syntax
- Required controls and unique HTML IDs
- All ten reactions
- Exact fifth-attempt and tenth-attempt rules
- Mouse, touch, pen, keyboard, and form-submit event paths
- Absence of credential-reading, storage, serialization, and network APIs
- Absence of unsafe HTML injection and dynamic-code execution APIs
- Local-only runtime assets
- Form and input serialization protections
- Labels, live regions, progress semantics, visible focus, and reduced-motion hooks
- Browser CSP and production hosting security headers
- Authoritative privacy documentation

The production build then recreates `dist/` from a fixed allowlist and rejects unexpected artifact contents.

No GitHub Actions workflow is included. Run `pnpm verify` locally before every release until CI is explicitly approved and configured.

## Production deployment

```bash
pnpm verify
```

Deploy only the generated `dist/` directory to an HTTPS static host. The artifact contains:

```text
dist/
├── .nojekyll
├── _headers
├── favicon.svg
├── index.html
├── script.js
└── styles.css
```

The `_headers` format is supported directly by hosts such as Netlify and Cloudflare Pages. Other hosts must be configured with the equivalent response headers.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for required headers, caching rules, the manual release checklist, and rollback instructions.

## Architecture

LoginChase deliberately uses a small static architecture:

1. `index.html` provides semantic content and native controls.
2. `styles.css` defines the visual system, responsive layout, reaction states, and accessibility preferences.
3. `script.js` owns in-memory attempt state, input-specific event handling, randomized reactions, local sound, and fake-dashboard transitions.
4. `scripts/verify.mjs` enforces behavior, privacy, accessibility, and security invariants without third-party packages.
5. `scripts/build.mjs` copies only approved runtime files into the deployable artifact.

There is no server, API, database, authentication provider, build framework, or persistent application state.

## Project structure

```text
LoginChase/
├── .editorconfig       Cross-editor text formatting rules
├── .gitattributes      Repository line-ending and binary-file rules
├── .gitignore          Secrets, local files, caches, and generated output
├── AGENTS.md           Local development and privacy invariants
├── CHANGELOG.md        Release history
├── README.md           Project documentation
├── SECURITY.md         Vulnerability reporting policy
├── _headers            Portable static-host security headers
├── docs/
│   └── DEPLOYMENT.md   Hosting, release, and rollback instructions
├── favicon.svg         Local vector favicon
├── index.html          Semantic page structure
├── package.json        Project metadata and repository commands
├── script.js           Game state, evasive behavior, sound, and celebration
├── scripts/
│   ├── build.mjs       Allowlisted production artifact builder
│   └── verify.mjs      Zero-dependency static verification
└── styles.css          Responsive design, reaction states, and motion preferences
```

Generated `dist/` output is intentionally excluded from Git and should always be recreated with `pnpm build` or `pnpm verify`.

## Browser support

LoginChase targets current evergreen versions of Chrome, Edge, Firefox, and Safari. If Web Audio is unavailable or blocked, the game continues silently. If JavaScript is disabled, the page explains why the chase cannot run and still cannot submit the form.

## Release history

See [CHANGELOG.md](CHANGELOG.md) for versioned user-facing changes.

## License and ownership

Copyright © 2026 Sudarshan Chaudhari / SudarshanTechLabs.

This private project is currently **UNLICENSED**. No permission is granted to copy, modify, distribute, or publish the source unless the author provides explicit permission or adds a license in a future release.

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
