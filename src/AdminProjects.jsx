import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const emptyProject = {
  slug: "",
  number: "",
  type: "",
  title: "",
  subtitle: "",
  image: "",
  imageAlt: "",
  video: "",
  mediaLabel: "",
  summary: "",
  finding: "",
  findingLabel: "",
  proofPoints: "",
  details: "",
  tags: "",
  link: "",
  linkLabel: "",
  download: "",
  downloadLabel: "",
};

function toForm(project) {
  return {
    ...emptyProject,
    ...project,
    proofPoints: (project.proofPoints || []).map(([value, label]) => `${value} | ${label}`).join("\n"),
    tags: (project.tags || []).join(", "),
  };
}

function toProject(form) {
  const proofPoints = form.proofPoints
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([value, label]) => value && label);
  const project = {
    slug: form.slug.trim(),
    number: form.number.trim(),
    type: form.type.trim(),
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    summary: form.summary.trim(),
    finding: form.finding.trim(),
    findingLabel: form.findingLabel.trim(),
    details: form.details.trim(),
    tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
  for (const key of ["image", "imageAlt", "video", "mediaLabel", "link", "linkLabel", "download", "downloadLabel"]) {
    if (form[key].trim()) project[key] = form[key].trim();
  }
  if (proofPoints.length) project.proofPoints = proofPoints;
  return project;
}

function Field({ label, name, value, onChange, required = false, hint, multiline = false }) {
  const sharedProps = {
    id: `project-${name}`,
    name,
    value,
    onChange,
    required,
    "aria-describedby": hint ? `hint-${name}` : undefined,
  };
  return (
    <div className={multiline ? "admin-field admin-field-wide" : "admin-field"}>
      <label htmlFor={sharedProps.id}>{label}{required ? " *" : ""}</label>
      {multiline ? <textarea {...sharedProps} rows={4} /> : <input {...sharedProps} type="text" />}
      {hint && <small id={`hint-${name}`}>{hint}</small>}
    </div>
  );
}

async function readJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const body = await response.text();
    if (body && body.trim().startsWith("<")) {
      throw new Error(fallbackMessage);
    }
    throw new Error(fallbackMessage);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }
}

export default function AdminProjects({ projects, onSave, refreshProjects }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("info");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Manage projects — Promise Sunday";
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        const result = await readJsonResponse(response, "Could not connect to the admin service.");
        if (!response.ok) throw new Error(result.error || `Admin service returned HTTP ${response.status}.`);
        return result;
      })
      .then((result) => {
        if (active) setAuthenticated(result.authenticated === true);
      })
      .catch((error) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Could not connect to the admin service.");
          setMessageKind("error");
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, []);

  async function signIn(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await readJsonResponse(response, "Sign-in failed.");
      if (!response.ok) throw new Error(result.error || "Sign-in failed.");
      setAuthenticated(true);
      setPassword("");
      setMessage("");
      await refreshProjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
      setMessageKind("error");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      const result = await readJsonResponse(response, "Could not sign out.");
      if (!response.ok) throw new Error(result.error || "Could not sign out.");
      setAuthenticated(false);
      setForm(null);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign out.");
      setMessageKind("error");
    }
  }

  function startNewProject() {
    setEditingSlug(null);
    setForm({ ...emptyProject, number: String(projects.length + 1).padStart(2, "0") });
    setMessage("");
  }

  function startEditing(project) {
    setEditingSlug(project.slug);
    setForm(toForm(project));
    setMessage("");
  }

  async function saveProject(event) {
    event.preventDefault();
    if (!form) return;
    const content = toProject(form);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(content.slug)) {
      setMessage("Use a lowercase project URL slug with letters, numbers, and hyphens.");
      setMessageKind("error");
      return;
    }
    if (projects.some((project) => project.slug === content.slug && project.slug !== editingSlug)) {
      setMessage("That project URL slug is already in use. Choose a different slug.");
      setMessageKind("error");
      return;
    }
    if (!content.image && !content.video) {
      setMessage("Add an image or video URL for this project.");
      setMessageKind("error");
      return;
    }
    if (content.image && !content.imageAlt) {
      setMessage("Add alternative text for the project image.");
      setMessageKind("error");
      return;
    }

    const nextProjects = editingSlug
      ? projects.map((project) => project.slug === editingSlug ? content : project)
      : [...projects, content];
    setSaving(true);
    const error = await onSave(nextProjects);
    setSaving(false);
    if (error) {
      setMessage(error);
      setMessageKind("error");
      return;
    }
    setForm(null);
    setEditingSlug(null);
    setMessage("Project saved and published on the portfolio.");
    setMessageKind("success");
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete “${project.title}” from the public portfolio? This cannot be undone.`)) return;
    setSaving(true);
    const error = await onSave(projects.filter((item) => item.slug !== project.slug));
    setSaving(false);
    if (error) {
      setMessage(error);
      setMessageKind("error");
      return;
    }
    setMessage("Project deleted from the public portfolio.");
    setMessageKind("success");
  }

  if (!authenticated) {
    return (
      <main className="admin-page">
        <form className="admin-login-card admin-signin" onSubmit={signIn}>
          <span className="admin-eyebrow">ADMIN ACCESS</span>
          <h1>Sign in to add projects</h1>
          <input
            id="admin-password"
            type="password"
            aria-label="Admin password"
            placeholder="Admin password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoFocus
          />
          {message && <p className={`admin-message ${messageKind}`} role={messageKind === "error" ? "alert" : "status"}>{message}</p>}
          {checkingSession
            ? <p className="admin-signin-hint" role="status">Checking sign-in…</p>
            : <button className="admin-button" type="submit" disabled={saving}>{saving ? "Signing in…" : "Enter"}</button>}
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-dashboard">
        <header className="admin-header">
          <div>
            <Link className="admin-back-link" to="/">← View public portfolio</Link>
            <span className="admin-eyebrow">PRIVATE ADMIN</span>
            <h1>Manage projects</h1>
            <p>Changes are saved online and appear on the public portfolio.</p>
          </div>
          <button className="admin-button admin-button-secondary" type="button" onClick={signOut}>Sign out</button>
        </header>

        {message && <p className={`admin-message ${messageKind}`} role={messageKind === "error" ? "alert" : "status"}>{message}</p>}

        {form ? (
          <form className="admin-panel" onSubmit={saveProject}>
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">{editingSlug ? "EDIT PROJECT" : "NEW PROJECT"}</span><h2>{editingSlug ? `Update ${form.title}` : "Add a project"}</h2></div>
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setForm(null)}>Cancel</button>
            </div>
            <div className="admin-form-grid">
              <Field label="Project title" name="title" value={form.title} required onChange={(event) => setForm({ ...form, title: event.target.value })} />
              <Field label="URL slug" name="slug" value={form.slug} required hint="Example: customer-sales-analysis" onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/\s+/g, "-") })} />
              <Field label="Project number" name="number" value={form.number} required onChange={(event) => setForm({ ...form, number: event.target.value })} />
              <Field label="Category / tool" name="type" value={form.type} required onChange={(event) => setForm({ ...form, type: event.target.value })} />
              <Field label="Subtitle" name="subtitle" value={form.subtitle} required onChange={(event) => setForm({ ...form, subtitle: event.target.value })} />
              <Field label="Tags" name="tags" value={form.tags} hint="Separate tags with commas." onChange={(event) => setForm({ ...form, tags: event.target.value })} />
              <Field label="Image URL" name="image" value={form.image} hint="For example: /assets/project-image.jpg" onChange={(event) => setForm({ ...form, image: event.target.value })} />
              <Field label="Image alternative text" name="imageAlt" value={form.imageAlt} onChange={(event) => setForm({ ...form, imageAlt: event.target.value })} />
              <Field label="Video URL" name="video" value={form.video} hint="For example: /assets/project-demo.mp4" onChange={(event) => setForm({ ...form, video: event.target.value })} />
              <Field label="Video description" name="mediaLabel" value={form.mediaLabel} onChange={(event) => setForm({ ...form, mediaLabel: event.target.value })} />
              <Field label="Summary" name="summary" value={form.summary} required multiline onChange={(event) => setForm({ ...form, summary: event.target.value })} />
              <Field label="Detailed notes" name="details" value={form.details} required multiline onChange={(event) => setForm({ ...form, details: event.target.value })} />
              <Field label="Featured finding" name="finding" value={form.finding} required onChange={(event) => setForm({ ...form, finding: event.target.value })} />
              <Field label="Finding description" name="findingLabel" value={form.findingLabel} required onChange={(event) => setForm({ ...form, findingLabel: event.target.value })} />
              <Field label="Proof points" name="proofPoints" value={form.proofPoints} multiline hint="One per line, in the format: value | description" onChange={(event) => setForm({ ...form, proofPoints: event.target.value })} />
              <Field label="Report URL" name="link" value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} />
              <Field label="Report link text" name="linkLabel" value={form.linkLabel} onChange={(event) => setForm({ ...form, linkLabel: event.target.value })} />
              <Field label="Download URL" name="download" value={form.download} onChange={(event) => setForm({ ...form, download: event.target.value })} />
              <Field label="Download link text" name="downloadLabel" value={form.downloadLabel} onChange={(event) => setForm({ ...form, downloadLabel: event.target.value })} />
            </div>
            <div className="admin-form-actions">
              <button className="admin-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save project"}</button>
              <button className="admin-button admin-button-secondary" type="button" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        ) : (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="admin-eyebrow">PORTFOLIO CONTENT</span><h2>Projects ({projects.length})</h2></div>
              <button className="admin-button" type="button" onClick={startNewProject}>Add project</button>
            </div>
            {projects.length ? (
              <div className="admin-project-list">
                {projects.map((project) => (
                  <article className="admin-project-row" key={project.slug}>
                    <div className="admin-project-info">
                      <span className="admin-status published">Published</span>
                      <h3>{project.title}</h3>
                      <p>{project.type} · /projects/{project.slug}</p>
                    </div>
                    <div className="admin-project-actions">
                      <button className="admin-button admin-button-secondary" type="button" onClick={() => startEditing(project)}>Edit</button>
                      <button className="admin-button admin-button-danger" type="button" disabled={saving} onClick={() => deleteProject(project)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <h3>No projects yet.</h3>
                <p>Add a project to start building your portfolio.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
