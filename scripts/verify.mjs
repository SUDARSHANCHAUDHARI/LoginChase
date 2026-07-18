import { readFile } from "node:fs/promises";
import { strict as assert } from "node:assert";

const [html, css, javascript, readme, headers] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("styles.css", "utf8"),
  readFile("script.js", "utf8"),
  readFile("README.md", "utf8"),
  readFile("_headers", "utf8"),
]);

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
assert.doesNotMatch(
  html,
  /\b(?:href|src)=["']https?:\/\//i,
  "Runtime HTML must not load external assets",
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
assert.match(readme, /never reads, stores, or transmits/i, "README must document credential safety");
assert.match(headers, /X-Content-Type-Options:\s*nosniff/i, "Missing nosniff hosting header");
assert.match(headers, /X-Frame-Options:\s*DENY/i, "Missing anti-framing hosting header");

console.log("✓ Required controls and all 10 reactions are present");
console.log("✓ No storage, credential-reading, or network data APIs are used");
console.log("✓ Accessibility, reduced-motion, CSP, and hosting security hooks are present");
