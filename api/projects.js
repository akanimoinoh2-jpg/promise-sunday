import { readProjects } from "../server/projectsStore.js";
import { jsonResponse } from "../server/adminAuth.js";

export default async function handler(req, res) {
  jsonResponse(res);
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const projects = await readProjects();
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(503).json({ error: error instanceof Error ? error.message : "Could not load projects." });
  }
}
