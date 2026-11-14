import { list, put } from "@vercel/blob";
import { initialProjects } from "../src/projects.js";

const PROJECTS_BLOB_PATH = "portfolio/projects.json";

export async function readProjects() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return initialProjects;

  const { blobs } = await list({ prefix: PROJECTS_BLOB_PATH, limit: 1 });
  const projectBlob = blobs.find((blob) => blob.pathname === PROJECTS_BLOB_PATH);
  if (!projectBlob) return initialProjects;

  const response = await fetch(projectBlob.url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not read project storage (HTTP ${response.status}).`);
  const projects = await response.json();
  if (!Array.isArray(projects)) throw new Error("Stored project data is invalid.");
  return projects;
}

export async function writeProjects(projects) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Project storage is not configured. Connect a Vercel Blob store.");
  }
  await put(PROJECTS_BLOB_PATH, JSON.stringify(projects), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  return projects;
}

export function validateProjects(projects) {
  if (!Array.isArray(projects) || projects.length > 100) return "Projects must be a list of no more than 100 items.";
  const slugs = new Set();
  const requiredText = ["number", "type", "title", "subtitle", "summary", "finding", "findingLabel", "details"];
  for (const project of projects) {
    if (!project || typeof project !== "object" || Array.isArray(project)) return "Each project must be an object.";
    if (typeof project.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) return "Every project needs a valid URL slug.";
    if (slugs.has(project.slug)) return "Project URL slugs must be unique.";
    slugs.add(project.slug);
    for (const key of requiredText) {
      if (typeof project[key] !== "string" || !project[key].trim() || project[key].length > 5000) {
        return `Project field "${key}" is required and must be no longer than 5000 characters.`;
      }
    }
    if (!project.image && !project.video) return "Each project needs an image or video.";
    if (project.tags !== undefined && (!Array.isArray(project.tags) || project.tags.some((tag) => typeof tag !== "string"))) {
      return "Project tags must be a list of text values.";
    }
    if (project.proofPoints !== undefined && (!Array.isArray(project.proofPoints) || project.proofPoints.some((point) => !Array.isArray(point) || point.length !== 2 || point.some((value) => typeof value !== "string")))) {
      return "Project proof points must be pairs of text values.";
    }
    for (const key of ["image", "imageAlt", "video", "mediaLabel", "link", "linkLabel", "download", "downloadLabel"]) {
      if (project[key] !== undefined && (typeof project[key] !== "string" || project[key].length > 5000)) {
        return `Project field "${key}" must be text no longer than 5000 characters.`;
      }
    }
  }
  return "";
}
