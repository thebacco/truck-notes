import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, watch } from "node:fs/promises";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 8010);
const displayHost = host === "0.0.0.0" ? "localhost" : host;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

const reloadClients = new Set();
const reloadExtensions = new Set([".html", ".js", ".css", ".svg", ".png", ".webmanifest"]);
let reloadTimer = null;

function broadcastReload() {
  for (const response of reloadClients) {
    response.write("event: reload\ndata: now\n\n");
  }
}

async function watchForReloads() {
  try {
    for await (const event of watch(root)) {
      if (!event.filename || !reloadExtensions.has(extname(event.filename))) continue;
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(broadcastReload, 80);
    }
  } catch (error) {
    console.warn(`Live reload disabled: ${error.message}`);
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${displayHost}:${port}`);

    if (url.pathname === "/__live-reload") {
      response.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
        "connection": "keep-alive"
      });
      response.write("event: connected\ndata: ok\n\n");
      reloadClients.add(response);
      request.on("close", () => reloadClients.delete(response));
      return;
    }

    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = resolve(root, `.${pathname}`);

    if (!filePath.startsWith(root)) {
      response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    const content = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Serving truck-notes at http://${displayHost}:${port}/`);
});

watchForReloads();

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error("Close the other preview window, or run with a different port:");
    console.error("$env:PORT=8020; npm run dev");
    process.exit(1);
  }

  throw error;
});

