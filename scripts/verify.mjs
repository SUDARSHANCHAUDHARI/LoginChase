import { readFile } from "node:fs/promises";
import { strict as assert } from "node:assert";

const [html, css, javascript, readme, headers] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("styles.css", "utf8"),
  readFile("script.js", "utf8"),
  readFile("README.md", "utf8"),
  readFile("_headers", "utf8"),
]);

function contrastRatio(first, second) {
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
    const linear = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function ruleBody(selector, source = css) {
  const start = source.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `Missing CSS rule ${selector}`);
  return source.slice(source.indexOf("{", start) + 1, source.indexOf("}", start));
}

function declaration(selector, property, source = css) {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*${property.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*:\\s*([\\s\\S]*?);`,
  );
  let cursor = 0;
  let value;

  while ((cursor = source.indexOf(`${selector} {`, cursor)) !== -1) {
    const body = source.slice(source.indexOf("{", cursor) + 1, source.indexOf("}", cursor));
    const match = body.match(pattern);
    if (match) value = match[1].trim();
    cursor += selector.length + 2;
  }

  assert.ok(value, `Missing ${property} in ${selector}`);
  return value;
}

function resolvedColor(value, seen = new Set()) {
  const variable = value.match(/^var\(--([^)]+)\)$/);
  if (!variable) {
    assert.match(value, /^#[0-9a-f]{6}$/i, `Unsupported color ${value}`);
    return value.toLowerCase();
  }
  assert.equal(seen.has(variable[1]), false, `Circular CSS variable --${variable[1]}`);
  seen.add(variable[1]);
  return resolvedColor(declaration(":root", `--${variable[1]}`), seen);
}

function mediaStart(query) {
  const position = css.indexOf(`@media ${query} {`);
  assert.notEqual(position, -1, `Missing media query ${query}`);
  return position;
}

const requiredIds = [
  "fake-email",
  "fake-password",
  "remember-me",
  "login-button",
  "cancel-button",
  "sound-toggle",
  "reset-button",
  "attempt-meter",
  "game-status",
  "dashboard",
];

requiredIds.forEach((id) => {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Missing required control #${id}`);
});

const documentIds = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
assert.equal(new Set(documentIds).size, documentIds.length, "HTML ids must be unique");
const remoteReferences = [...html.matchAll(/\b(?:href|src)=["'](https?:\/\/[^"']+)["']/gi)].map(
  (match) => match[1],
);
assert.deepEqual(
  remoteReferences,
  ["https://sudarshanchaudhari.github.io/TinyChaos/"],
  "Only the TinyChaos gallery navigation may use a remote URL",
);

const requiredReactions = [
  "move-away",
  "shrink",
  "swap-with-cancel",
  "are-you-sure",
  "temporarily-disabled",
  "rotate",
  "hide-behind-form",
  "maybe-later",
  "split-into-fake-buttons",
  "last-moment-move",
];

requiredReactions.forEach((reaction) => {
  assert.match(javascript, new RegExp(`name: ["']${reaction}["']`), `Missing reaction ${reaction}`);
});

const forbiddenDataApis = [
  /\.value\b/,
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /sendBeacon/,
  /localStorage/,
  /sessionStorage/,
  /document\.cookie/,
  /new\s+FormData/,
];

forbiddenDataApis.forEach((pattern) => {
  assert.doesNotMatch(javascript, pattern, `Potential data handling API found: ${pattern}`);
});

[/innerHTML/, /outerHTML/, /insertAdjacentHTML/, /\beval\s*\(/, /new\s+Function\b/].forEach(
  (pattern) => {
    assert.doesNotMatch(javascript, pattern, `Unsafe DOM or execution API found: ${pattern}`);
  },
);

const formTag = html.match(/<form\b[^>]*>/i)?.[0];
assert.ok(formTag, "Missing login form");
assert.doesNotMatch(formTag, /\saction\s*=/i, "Fake form must not have an action");

["fake-email", "fake-password", "remember-me"].forEach((id) => {
  const inputTag = html.match(new RegExp(`<input\\b[^>]*id=["']${id}["'][^>]*>`, "i"))?.[0];
  assert.ok(inputTag, `Missing fake input #${id}`);
  assert.doesNotMatch(inputTag, /\sname\s*=/i, `Fake input #${id} must not be serializable`);
});

assert.match(html, /<meta\s+name="viewport"/, "Missing responsive viewport metadata");
assert.match(html, /http-equiv="Content-Security-Policy"/, "Missing browser-enforced CSP");
assert.match(html, /connect-src 'none'/, "CSP must prevent network connections");
assert.match(html, /form-action 'none'/, "CSP must prevent form submission");
assert.match(html, /aria-live="polite"/, "Missing polite live status region");
assert.match(html, /role="progressbar"/, "Missing accessible attempt progress");
assert.match(html, /<label\b[^>]*for="fake-email"/, "Fake email needs a visible label");
assert.match(html, /<label\b[^>]*for="fake-password"/, "Fake password needs a visible label");
assert.match(html, /<label\b[^>]*for="remember-me"/, "Remember Me needs a visible label");
assert.match(javascript, /Do you actually remember your password\?/, "Missing fifth-attempt message");
assert.match(javascript, /MAX_ATTEMPTS\s*=\s*10/, "Login must succeed after ten attempts");
assert.match(javascript, /addEventListener\("pointerenter"/, "Missing mouse approach support");
assert.match(javascript, /addEventListener\("pointerdown"/, "Missing touch and pen support");
assert.match(javascript, /addEventListener\("click"/, "Missing native button activation support");
assert.match(javascript, /addEventListener\("submit"/, "Missing keyboard form submission support");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Missing reduced-motion support");
assert.match(css, /:focus-visible/, "Missing visible keyboard focus styles");
for (const color of ["#15152a", "#fff5df", "#ff5d5d", "#4f7cff", "#ffd166", "#58d6a9", "#b695ff"]) {
  assert.match(css, new RegExp(color, "i"), `Missing shared TinyChaos color ${color}`);
}
assert.match(html, /href="https:\/\/sudarshanchaudhari\.github\.io\/TinyChaos\/"/);
assert.match(html, /LoginChase · by Sudarshan Chaudhari/);
assert.match(html, /LoginChase \/ An exercise in patience, not authentication\./);
assert.match(css, /outline:\s*4px solid var\(--blue\)/, "Focus treatment must use TinyChaos blue");
assert.match(css, /\.dashboard \.action-button:focus-visible\s*\{[^}]*var\(--paper\)[^}]*var\(--ink\)/s);
assert.match(css, /--display-font:\s*Impact/);
assert.match(css, /--body-font:\s*"Arial Rounded MT Bold"/);
assert.match(css, /\.attempt-readout strong\s*\{[^}]*color:\s*var\(--coral-text\)/s);
assert.match(css, /\.login-button\s*\{[^}]*color:\s*var\(--ink\)[^}]*background:\s*var\(--blue\)/s);
assert.match(css, /\.decoy-button\s*\{[^}]*color:\s*var\(--ink\)[^}]*background:\s*var\(--blue\)/s);
assert.match(css, /\.dashboard\s*\{[^}]*background:\s*var\(--blue-dark\)/s);
assert.match(css, /overflow-x:\s*clip/);
const loginPanelBackground = resolvedColor(declaration(".login-panel,\n.dashboard", "background"));
assert.ok(contrastRatio(resolvedColor(declaration(".attempt-readout strong", "color")), loginPanelBackground) >= 4.5);
assert.ok(contrastRatio(resolvedColor(declaration(".login-button", "color")), resolvedColor(declaration(".login-button", "background"))) >= 4.5);
const dashboardBackground = resolvedColor(declaration(".dashboard", "background"));
assert.ok(contrastRatio(resolvedColor(declaration(".dashboard", "color")), dashboardBackground) >= 4.5);
assert.ok(contrastRatio(resolvedColor(declaration(".dashboard-kicker", "color")), dashboardBackground) >= 4.5);
assert.ok(
  contrastRatio(
    resolvedColor(declaration(".noscript-message", "color")),
    resolvedColor(declaration(".noscript-message", "background")),
  ) >= 4.5,
  "No-script message must meet WCAG AA",
);

const widths = [...css.matchAll(/@media \(max-width: (\d+)px\)\s*\{/g)].map((match) => Number(match[1]));
assert.deepEqual(widths, [880, 560], "Width breakpoints must cover tablet and 320/375px layouts");
const tablet = mediaStart("(max-width: 880px)");
const mobile = mediaStart("(max-width: 560px)");
const narrowShort = mediaStart("(max-width: 640px) and (max-height: 500px)");
const reduced = mediaStart("(prefers-reduced-motion: reduce)");
assert.ok(tablet < mobile && mobile < narrowShort && narrowShort < reduced, "Responsive cascade order changed");
const narrowSection = css.slice(narrowShort, reduced);
assert.equal(declaration("main", "min-height", narrowSection), "auto");
assert.equal(declaration("main", "padding", narrowSection), "2rem 0 3rem");
assert.doesNotMatch(css.slice(reduced), /main\s*\{[^}]*min-height\s*:/s, "A later rule overrides narrow/short flow");
assert.equal(declaration("body", "overflow-y"), "auto");
assert.equal(declaration("body", "overflow-x"), "clip");
assert.equal(declaration("body", "min-width"), "0");
assert.doesNotMatch(ruleBody("html"), /min-width\s*:\s*(?!0(?:px)?\s*;)/, "HTML has a positive minimum width");
assert.match(declaration(".page-shell", "width", css.slice(0, tablet)), /1180px/, "Base rule must retain laptop/desktop cap");
assert.match(readme, /never reads, stores, or transmits/i, "README must document credential safety");
assert.match(headers, /X-Content-Type-Options:\s*nosniff/i, "Missing nosniff hosting header");
assert.match(headers, /X-Frame-Options:\s*DENY/i, "Missing anti-framing hosting header");

console.log("✓ Required controls and all 10 reactions are present");
console.log("✓ No storage, credential-reading, or network data APIs are used");
console.log("✓ Accessibility, reduced-motion, CSP, and hosting security hooks are present");
