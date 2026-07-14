# Rhino PWA Agent Guide

This file is the shared convention source for Rhino mobile-first PWA projects.
The canonical copy lives in `C:\Projects\pwa-starter\AGENTS.md`.

When a PWA convention changes, update `pwa-starter` first, then copy the exact
same `AGENTS.md` into:

- `C:\Projects\batch-bar`
- `C:\Projects\truck-notes`
- `C:\Projects\receipt-scanner`

Commit and push all affected repos. Keep the four copies byte-for-byte in sync
unless a user explicitly asks for a repo-specific exception.

## Project Setup

Start a new Rhino PWA by copying the starter:

```powershell
Copy-Item C:\Projects\pwa-starter C:\Projects\new-app-name -Recurse
cd C:\Projects\new-app-name
npm run dev
```

Open the local preview at:

```text
http://127.0.0.1:8010/
```

If port `8010` is already in use:

```powershell
$env:PORT=8020; npm run dev
```

Before app-specific development, update:

- `package.json` app name.
- `manifest.webmanifest` `name`, `short_name`, and `description`.
- `sw.js` `CACHE_NAME`.
- `index.html` title, app copy, storage keys, and app-specific workflow logic.

## File Structure Defaults

The starter is intentionally simple:

- `index.html` contains markup, CSS, and app logic for small PWAs.
- `manifest.webmanifest` defines install metadata.
- `sw.js` provides the production service worker.
- `serve.mjs` provides local static preview and live reload.
- `icon.png` and `icon.svg` wire app icons.
- `start-preview.cmd` is the Windows-friendly preview launcher.

Prefer this static architecture for small staff tools unless the app clearly
needs a framework, backend, build step, or external package.

## Local Preview And Cache Behavior

Use `npm run dev` or `node serve.mjs` for local preview.

The preview server:

- Serves from `127.0.0.1`.
- Defaults to port `8010`.
- Sends no-store cache headers.
- Auto-refreshes when `.html`, `.js`, `.css`, `.svg`, `.png`, or
  `.webmanifest` files change.

In local preview, unregister service workers and clear browser caches so stale
PWA assets do not hide current changes. In production, keep service workers
enabled and use update checks so installed PWAs pick up new builds.

## PWA Install And Update Defaults

Every Rhino PWA should include:

- `display: "standalone"` in the manifest.
- `orientation: "portrait"` unless the workflow needs landscape.
- `theme_color` and `background_color` matching the warm panel color.
- `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, and
  `apple-mobile-web-app-status-bar-style` meta tags.
- A one-time install prompt or install affordance.
- `beforeinstallprompt` handling when supported.
- A fallback toast telling the user to use browser install or Add to Home Screen.
- Service worker `skipWaiting`, `clients.claim`, stale-cache cleanup, and
  navigation fallback to `index.html`.
- Production update checks on focus and visibility changes.
- Automatic reload on `controllerchange`.

Installed app refresh behavior matters. When committing and pushing PWA changes,
make sure cache names or update logic allow phones to pick up the new build.

## Visual Design Defaults

Use the Rhino mobile staff-tool look:

- Warm off-white panel surface: `#fffdf8`.
- Charcoal ink: `#161616`, with darker headings around `#121110`.
- Muted text: `#6b6760`.
- Soft divider line: `#ded8cc`.
- Wash/background control fill: `#f3efe6`.
- Red primary accent: `#b12f24`.
- Navy secondary action: `#1f3f66`.
- Green operational accent: `#386a55`.
- Gold accent: `#c58d3b`.
- Light text on filled buttons: `#fff8ef`.

Typography:

- Use `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif`.
- Keep letter spacing at `0`.
- Use compact, strong labels for staff workflows.
- Avoid oversized marketing-style hero typography inside operational tools.

Geometry:

- Use 8px radius for panels, cards, inputs, and standard buttons.
- Use rounded icon buttons only for icon-only controls.
- Keep tap targets comfortable: inputs around 44px high and primary actions
  around 52px high.
- Use restrained shadows. Surfaces should feel polished, not like stacked heavy
  cards.
- Avoid nested cards.

## Button And Control Defaults

Use consistent action hierarchy:

- `.primary`: red fill with light text for the main action.
- `.secondary`: navy fill with light text for secondary navigation or support
  actions.
- `.small-button`: wash fill with dark text for low-emphasis inline actions.
- `.icon-button`: dark circular control for compact icon-only actions.

Use icons for compact tool actions when the meaning is standard, and include
accessible labels. Do not use decorative text pills where a familiar icon button
would be clearer.

Inputs, textareas, and selects:

- Full width by default.
- 8px radius.
- Warm light fill.
- Navy focus ring.
- Inherit the app font.
- Use numeric `inputmode` for phone-first numeric entry.
- For fields users often replace entirely, select the current value on focus or
  tap so typing overwrites the old value.

## Layout Defaults

Use the phone-shell pattern for previews:

- `body` centers a `.phone` frame on desktop.
- `.phone` is roughly `min(430px, 100vw)` by `min(900px, 100vh)`.
- On mobile widths, remove the frame, border, notch, and shadow so the app fills
  the screen.
- Header stays at the top.
- Main content scrolls.
- Bottom action bar is fixed within the phone shell and uses
  `env(safe-area-inset-bottom)`.

Prefer a bottom action bar for primary navigation. Keep controls close to the
workflow, and avoid landing pages for internal tools. The first screen should be
the usable app experience.

## Interaction Patterns

Mobile-first behavior is the default.

Use:

- `-webkit-tap-highlight-color: transparent` on buttons.
- Native controls where possible.
- Persistent visible controls on phone-first interactions. Do not rely on
  hover-only UI such as desktop number spinners.
- Short toasts for lightweight confirmations, typically around 2200ms.
- Dialogs for decisions that block progress or cannot be safely ignored.
- Clear button labels with direct verbs.

For modal dialogs:

- Use an overlay/scrim.
- Keep the dialog compact.
- Use explicit presented choices.
- Do not allow important confirmations to be dismissed accidentally if the user
  must choose a path.

For swipe or paged workflows:

- Only add swipe when it reduces real mobile friction.
- Track finger movement continuously where possible.
- Distinguish horizontal swipes from vertical scrolls before taking ownership.
- Use velocity and distance thresholds, not distance alone.
- Add rubber-band resistance at edges.
- Settle with a short cubic-bezier transition near `.2, .82, .18, 1`.
- Keep tabs/buttons available as a visible non-gesture alternative.
- Do not let nested scroll lists steal unrelated gestures.

For scrollable lists:

- Prefer faded edge masks as scroll affordances when scrollbars are hidden.
- Use `-webkit-overflow-scrolling: touch`.
- Use `overscroll-behavior` to contain scroll where appropriate.
- Keep list height and padding stable so dynamic content does not shift controls.

## Persistence Defaults

For no-login staff tools, prefer local device persistence first:

- Keep simple state in `localStorage`.
- Use app-specific versioned storage keys, such as `appNameState:v1`.
- Save on input changes when safe.
- Save on `pagehide`, `beforeunload`, and visibility changes.
- Use IndexedDB for larger binary data such as scanned images.

Never put secrets, credentials, private tokens, or sensitive account data in
frontend storage.

## Accessibility And Mobile Polish

Include:

- `role="application"` only for the app shell when appropriate.
- `aria-label` for icon-only buttons.
- `role="dialog"` and `aria-modal="true"` for modals.
- `role="status"` and `aria-live="polite"` for toasts.
- Empty `alt=""` for decorative images.
- Real labels or clear placeholders for form fields.

Prevent common mobile irritants where appropriate:

- Avoid accidental zoom on repeated taps.
- Blur focused fields on intentional background taps when it helps keyboard
  dismissal.
- Keep text inside buttons and controls from wrapping awkwardly or clipping.
- Keep every important action reachable above the bottom safe area.

## Engineering Defaults

- Keep changes scoped and static unless the app needs more machinery.
- Prefer existing local patterns over introducing new abstractions.
- Keep all edited files ASCII unless the file already uses non-ASCII content for
  a clear reason.
- Use succinct comments only where they clarify non-obvious behavior.
- Test in local preview after UI changes.
- For phone-first changes, verify mobile-sized layout and touch behavior when
  possible.
- Before commit, run `git status --short --branch` and inspect the diff.
- Commit with a clear message and push to the tracked remote.

## Sync Protocol For This Guide

When the user gives a new PWA convention:

1. Update `C:\Projects\pwa-starter\AGENTS.md` first.
2. Copy that exact file to:
   - `C:\Projects\batch-bar\AGENTS.md`
   - `C:\Projects\truck-notes\AGENTS.md`
   - `C:\Projects\receipt-scanner\AGENTS.md`
3. Commit and push each repo with a message describing the convention change.
4. Confirm which repos were updated and provide the commit hash for each.

