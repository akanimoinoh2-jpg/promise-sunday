import {
  adminConfigurationError,
  hasValidAdminSession,
  jsonResponse,
  requestIsSameOrigin,
} from "../../server/adminAuth.js";
import { readProjects, validateProjects, writeProjects } from "../../server/projectsStore.js";

export default async function handler(req, res) {
  jsonResponse(res);
  const configError = adminConfigurationError();
  if (configError) return res.status(503).json({ error: configError });
  if (!hasValidAdminSession(req)) return res.status(401).json({ error: "Sign in to manage projects." });

  if (req.method === "GET") {
    try {
      return res.status(200).json(await readProjects());
    } catch (error) {
      return res.status(503).json({ error: error instanceof Error ? error.message : "Could not load projects." });
    }
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!requestIsSameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });

  const projects = req.body?.projects;
  const validationError = validateProjects(projects);
  if (validationError) return res.status(400).json({ error: validationError });
  if (JSON.stringify(projects).length > 500_000) {
    return res.status(413).json({ error: "Project data is too large to save." });
  }

  try {
    const savedProjects = await writeProjects(projects);
    return res.status(200).json({ projects: savedProjects });
  } catch (error) {
    return res.status(503).json({ error: error instanceof Error ? error.message : "Could not save projects." });
  }
}
