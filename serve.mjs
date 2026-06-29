import { createServer } from "node:http";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, readdir, stat, watch } from "node:fs/promises";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const appName = "truck-notes";
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
const reloadExtensions = new Set([".html", ".js", ".mjs", ".css", ".svg", ".png", ".webmanifest"]);
let reloadTimer = null;

function broadcastReload() {
  for (const response of reloadClients) {
    response.write("event: reload\ndata: now\n\n");
  }
}

async function getReloadVersion() {
  const entries = await readdir(root);
  const mtimes = await Promise.all(entries
    .filter((entry) => reloadExtensions.has(extname(entry)))
    .map(async (entry) => {
      try {
        return (await stat(resolve(root, entry))).mtimeMs;
      } catch {
        return 0;
      }
    }));
  return String(Math.max(0, ...mtimes));
}

async function getGitCommit() {
  try {
    const gitPath = resolve(root, ".git");
    const head = (await readFile(resolve(gitPath, "HEAD"), "utf8")).trim();

    if (!head.startsWith("ref: ")) return head.slice(0, 7);

    const refPath = head.slice(5).trim();
    const commit = (await readFile(resolve(gitPath, refPath), "utf8")).trim();
    return commit.slice(0, 7);
  } catch {
    return "unknown";
  }
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function runLocalFunction(functionName, request) {
  const functionUrl = new URL(`./netlify/functions/${functionName}.mjs`, import.meta.url);
  const { handler } = await import(`${functionUrl.href}?t=${Date.now()}`);
  return handler({
    httpMethod: request.method,
    headers: request.headers,
    body: await readRequestBody(request),
    isBase64Encoded: false
  });
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

    if (url.pathname === "/__version") {
      response.writeHead(200, {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(await getReloadVersion());
      return;
    }

    if (url.pathname === "/__health") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      });
      response.end(JSON.stringify({
        app: appName,
        root,
        commit: await getGitCommit(),
        host: displayHost,
        port
      }, null, 2));
      return;
    }

    if (url.pathname.startsWith("/.netlify/functions/")) {
      const functionName = url.pathname.split("/").pop();
      const functionResponse = await runLocalFunction(functionName, request);
      response.writeHead(functionResponse.statusCode || 200, functionResponse.headers || {});
      response.end(functionResponse.body || "");
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

