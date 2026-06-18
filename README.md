# Truck Notes

A simple no-login PWA for food truck staff to collect notes during a shift and send a nightly report to a fixed recipient list.

## Local preview

On Windows, double-click:

```text
start-preview.cmd
```

Or run from a terminal:

```powershell
.\start-preview.cmd
```

Run the static artifact locally:

```powershell
node serve.mjs
```

If you have npm installed, this also works:

```powershell
npm run dev
```

Then open:

```text
http://127.0.0.1:8010/
```

Local preview pages auto-refresh when `index.html`, `sw.js`, the manifest, or image assets change.

You can override the port when needed:

```powershell
$env:PORT=8020; npm run dev
```

The fixed recipient list lives in `RECIPIENTS` inside `index.html`.

## Design standards

### Type

- Use Centrifuge for headings, section labels, navigation, and action labels.
- Use Univers for operational data, user-entered values, names, recipients, notes, and other content the app is carrying for the user.
- If the text is part of the interface telling the user what to do, default to Centrifuge. If the text is data the user entered, selected, or needs to read back, default to Univers.

### Menus

- Use overflow menus for lower-frequency utility actions, not primary workflows.
- Prefer a plain icon by default. Do not add a persistent circular/chip background unless the surrounding design already requires it.
- When a menu is open, add a subtle active background to the trigger so the control visibly owns the popover.
- Commands may close a menu after activation. Stateful controls, such as toggles, should leave the menu open so the user can see the completed state.

### Scroll Lists

- Prefer hidden native scrollbars on compact mobile list fields.
- Use mask/fade zones instead of painted shadows, so the list items themselves fade while preserving their rounded shape.
- Size scroll fields to reveal a partial final item in the starting position when more content exists.
- Default scroll fields so the partial final item exposes enough centered label text for about 60% of that text to stay readable while the rest enters the fade zone. This makes the continuation cue obvious without adding desktop-style scrollbar hardware.
- Keep the shared implementation values in CSS variables (`--scroll-list-height` and `--scroll-mask-depth`) so the behavior stays consistent across list fields.

