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

