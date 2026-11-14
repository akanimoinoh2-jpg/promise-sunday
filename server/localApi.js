import adminProjectsHandler from "../api/admin/projects.js";
import adminSessionHandler from "../api/admin/session.js";
import projectsHandler from "../api/projects.js";

const apiHandlers = new Map([
  ["/api/admin/projects", adminProjectsHandler],
  ["/api/admin/session", adminSessionHandler],
  ["/api/projects", projectsHandler],
]);
const maxBodyBytes = 600 * 1024;

function addResponseHelpers(res) {
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (value) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(value));
    return res;
  };
}

async function readRequestBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!size) return undefined;

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

export default function localApi() {
  return {
    name: "local-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url || "/", "http://localhost").pathname;
        if (!pathname.startsWith("/api/")) return next();

        addResponseHelpers(res);
        const handler = apiHandlers.get(pathname);
        if (!handler) return res.status(404).json({ error: "API route not found." });

        try {
          req.body = await readRequestBody(req);
          await handler(req, res);
        } catch (error) {
          if (res.writableEnded) return;
          if (error?.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
          }
          console.error("Local API request failed:", error);
          return res.status(500).json({ error: "The admin service could not complete the request." });
        }
      });
    },
  };
}
