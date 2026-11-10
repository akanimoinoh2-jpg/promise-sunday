/* Ekong Sampson Connect — admin portal front-end logic.
   Talks to the backend API at /api. Keeps JWT in localStorage. */
(() => {
  const API = "/api";
  const $ = (s) => document.querySelector(s);
  const token = () => localStorage.getItem("esc_token");
  const user = () => JSON.parse(localStorage.getItem("esc_user") || "null");
  const isSenator = () => user()?.role === "senator";
  const isAdmin = () => ["admin", "senator"].includes(user()?.role);

  const message = (text, ok = false) => {
    const el = $("#admin-message");
    el.textContent = text;
    el.classList.toggle("ok", ok);
    el.classList.toggle("error", !ok);
    if (text) setTimeout(() => (el.textContent = ""), 5000);
  };

  async function api(path, { method = "GET", body, form } = {}) {
    const res = await fetch(API + path, {
      method,
      headers: {
        ...(form ? {} : { "Content-Type": "application/json" }),
        ...(token() ? { Authorization: "Bearer " + token() } : {}),
      },
      body: form ? form : body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { signOut(); throw new Error(data.error || "Please sign in again"); }
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  /* ================= Session ================= */
  function showWorkspace() {
    const u = user();
    $("#login-panel").classList.add("hidden");
    $("#workspace").classList.remove("hidden");
    $("#signed-in-user").textContent = `${u.displayName} (${u.role})`;
    buildNav();
    loadProjects();
    loadUsers();
    if (isSenator()) $("#senator-tools").classList.remove("hidden");
  }
  function signOut() {
    localStorage.removeItem("esc_token");
    localStorage.removeItem("esc_user");
    $("#workspace").classList.add("hidden");
    $("#login-panel").classList.remove("hidden");
  }

  /* ---- shared credentials: autofill & copy ---- */
  $("#autofill-creds").addEventListener("click", () => {
    $("#login-username").value = "senator";
    $("#login-password").value = "EkongSampson2026!";
  });
  document.querySelectorAll(".copy-btn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy"), 1500); } catch {}
    })
  );

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const { token: t, user: u } = await api("/auth/login", {
        method: "POST",
        body: {
          username: $("#login-username").value.trim(),
          password: $("#login-password").value,
        },
      });
      localStorage.setItem("esc_token", t);
      localStorage.setItem("esc_user", JSON.stringify(u));
      showWorkspace();
      message("Signed in successfully.", true);
    } catch (err) {
      message(err.message);
    }
  });
  $("#logout-button").addEventListener("click", signOut);
  $("#password-toggle").addEventListener("click", () => {
    const input = $("#login-password");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    $("#password-toggle").textContent = show ? "Hide" : "Show";
    $("#password-toggle").setAttribute("aria-pressed", show);
  });

  /* ================= Tab navigation ================= */
  const TABS = ["projects", "news", "photos", "documents", "events", "lgas", "submissions", "categories", "manifesto", "analytics", "team"];
  const TAB_LABEL = { projects: "Projects", news: "News", photos: "Photos", documents: "Documents", events: "Events", lgas: "LGAs / Communities", submissions: "Submissions", categories: "Categories", manifesto: "Manifesto", analytics: "Analytics", team: "Team & access" };

  function buildNav() {
    const nav = $("#admin-tabs");
    nav.innerHTML = TABS.filter((t) => t !== "team" || isSenator())
      .map((t) => `<button type="button" data-tab="${t}" class="admin-tab">${TAB_LABEL[t]}</button>`)
      .join("");
    nav.querySelectorAll(".admin-tab").forEach((b) =>
      b.addEventListener("click", () => {
        document.querySelectorAll(".admin-tab").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        document.querySelectorAll(".admin-tabpane").forEach((p) => p.classList.add("hidden"));
        document.getElementById("pane-" + b.dataset.tab).classList.remove("hidden");
      })
    );
    nav.querySelector(".admin-tab")?.classList.add("active");
  }

  /* ================= Projects ================= */
  $("#project-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData();
    const fields = { title: "#project-title", lga: "#project-lga", community: "#project-community", sector: "#project-sector", year: "#project-year", status: "#project-status", description: "#project-description", funding: "#project-funding", evidence: "#project-evidence" };
    for (const [k, sel] of Object.entries(fields)) fd.append(k, $(sel).value);
    const image = $("#project-image").files[0];
    if (image) fd.append("image", image);
    const editId = $("#project-form").dataset.editId;
    try {
      if (editId) {
        await api(`/projects/${editId}`, { method: "PUT", body: Object.fromEntries([...fd.entries()].filter(([k]) => k !== "image")) });
        if (image) await api(`/upload/photos`, { method: "POST", form: fd }); // keep image as gallery photo
        message("Project updated.", true);
      } else {
        const proj = await api("/projects", { method: "POST", body: Object.fromEntries([...fd.entries()].filter(([k]) => k !== "image")) });
        if (image) {
          const up = new FormData();
          up.append("file", image);
          up.append("caption", proj.title);
          await api("/upload/photos", { method: "POST", form: up });
        }
        message("Project published.", true);
      }
      $("#project-form").reset();
      delete $("#project-form").dataset.editId;
      $("#project-form-title").textContent = "Publish a project";
      loadProjects();
    } catch (err) { message(err.message); }
  });

  async function loadProjects() {
    try {
      const items = await api("/projects");
      $("#admin-project-list").innerHTML = items.length
        ? items
            .map(
              (p) => `<div class="admin-list-item">
                <div><strong>${esc(p.title)}</strong><span class="badge ${p.status}">${esc(p.status)}</span>
                <p class="hint">${esc(p.lga)} — ${esc(p.community)} · ${esc(p.year)}</p></div>
                <div class="admin-actions">
                  <button data-act="edit" data-id="${p.id}" class="button outline small">Edit</button>
                  ${isAdmin() ? `<button data-act="del-project" data-id="${p.id}" class="button danger small">Delete</button>` : ""}
                </div></div>`
            )
            .join("")
        : `<p class="notice">No projects yet — publish the first one.</p>`;
    } catch (err) { message(err.message); }
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const { act, id } = btn.dataset;
    try {
      if (act === "edit") {
        const p = await api(`/projects/${id}`);
        Object.entries({ title: "#project-title", community: "#project-community", funding: "#project-funding", description: "#project-description", evidence: "#project-evidence", year: "#project-year" }).forEach(([k, sel]) => ($(sel).value = p[k] || ""));
        ["lga", "sector", "status"].forEach((k) => ($(`#project-${k}`).value = p[k] || "other"));
        $("#project-form").dataset.editId = id;
        $("#project-form-title").textContent = "Edit project";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (act === "del-project") { if (confirm("Delete this project permanently?")) { await api(`/projects/${id}`, { method: "DELETE" }); message("Project deleted.", true); loadProjects(); } }
      if (act === "del-news") { await api(`/news/${id}`, { method: "DELETE" }); loadNews(); }
      if (act === "del-photo") { await api(`/photos/${id}`, { method: "DELETE" }); loadPhotos(); }
      if (act === "del-doc") { await api(`/documents/${id}`, { method: "DELETE" }); loadDocs(); }
      if (act === "del-event") { await api(`/events/${id}`, { method: "DELETE" }); loadEvents(); }
      if (act === "del-lga") { await api(`/lgas/${id}`, { method: "DELETE" }); loadLgas(); }
      if (act === "del-cat") { await api(`/categories/${id}`, { method: "DELETE" }); loadCats(); }
      if (act === "sub-approve") { await api(`/submissions/${id}`, { method: "PUT", body: { status: "approved" } }); loadSubs(); }
      if (act === "sub-reject") { await api(`/submissions/${id}`, { method: "PUT", body: { status: "rejected" } }); loadSubs(); }
      if (act === "del-user") { if (confirm("Remove this team member's access?")) { await api(`/users/${id}`, { method: "DELETE" }); loadUsers(); } }
      message("Done.", true);
    } catch (err) { message(err.message); }
  });

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ================= News ================= */
  $("#news-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/news", { method: "POST", body: { title: $("#news-title").value, body: $("#news-body").value } });
      $("#news-form").reset(); message("News published.", true); loadNews();
    } catch (err) { message(err.message); }
  });
  async function loadNews() {
    const items = await api("/news").catch(() => []);
    $("#news-list").innerHTML = items.map((n) => `<div class="admin-list-item"><div><strong>${esc(n.title)}</strong><p class="hint">${esc((n.body || "").slice(0, 90))}</p></div>${isAdmin() ? `<button data-act="del-news" data-id="${n.id}" class="button danger small">Delete</button>` : ""}</div>`).join("") || `<p class="notice">No news yet.</p>`;
  }

  /* ================= Photos / Documents ================= */
  $("#photo-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("file", $("#photo-file").files[0]);
    fd.append("caption", $("#photo-caption").value);
    try { await api("/upload/photos", { method: "POST", form: fd }); $("#photo-form").reset(); message("Photo uploaded.", true); loadPhotos(); }
    catch (err) { message(err.message); }
  });
  async function loadPhotos() {
    const items = await api("/photos").catch(() => []);
    $("#photo-list").innerHTML = items.map((p) => `<div class="admin-list-item"><div>🖼 <strong>${esc(p.name)}</strong><p class="hint">${esc(p.caption)}</p></div>${isAdmin() ? `<button data-act="del-photo" data-id="${p.id}" class="button danger small">Delete</button>` : ""}</div>`).join("") || `<p class="notice">No photos uploaded yet.</p>`;
  }

  $("#doc-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("file", $("#doc-file").files[0]);
    fd.append("name", $("#doc-name").value);
    try { await api("/upload/documents", { method: "POST", form: fd }); $("#doc-form").reset(); message("Document uploaded.", true); loadDocs(); }
    catch (err) { message(err.message); }
  });
  async function loadDocs() {
    const items = await api("/documents").catch(() => []);
    $("#doc-list").innerHTML = items.map((d) => `<div class="admin-list-item"><div>📄 <strong>${esc(d.name)}</strong></div>${isAdmin() ? `<button data-act="del-doc" data-id="${d.id}" class="button danger small">Delete</button>` : ""}</div>`).join("") || `<p class="notice">No documents uploaded yet.</p>`;
  }

  /* ================= Events ================= */
  $("#event-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/events", { method: "POST", body: { title: $("#event-title").value, date: $("#event-date").value, venue: $("#event-venue").value } });
      $("#event-form").reset(); message("Event added.", true); loadEvents();
    } catch (err) { message(err.message); }
  });
  async function loadEvents() {
    const items = await api("/events").catch(() => []);
    $("#event-list").innerHTML = items.map((ev) => `<div class="admin-list-item"><div><strong>${esc(ev.title)}</strong><p class="hint">${esc(ev.date)} · ${esc(ev.venue || "")}</p></div>${isAdmin() ? `<button data-act="del-event" data-id="${ev.id}" class="button danger small">Delete</button>` : ""}</div>`).join("") || `<p class="notice">No events yet.</p>`;
  }

  /* ================= LGAs / communities ================= */
  $("#lga-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/lgas", { method: "POST", body: { name: $("#lga-name").value, type: $("#lga-type").value } });
      $("#lga-form").reset(); message("Added.", true); loadLgas();
    } catch (err) { message(err.message); }
  });
  async function loadLgas() {
    const items = await api("/lgas").catch(() => []);
    $("#lga-list").innerHTML = items.map((l) => `<div class="admin-list-item"><div>📍 <strong>${esc(l.name)}</strong> <span class="badge ${l.type}">${esc(l.type)}</span></div>${isAdmin() ? `<button data-act="del-lga" data-id="${l.id}" class="button danger small">Remove</button>` : ""}</div>`).join("") || `<p class="notice">No LGAs added yet.</p>`;
  }

  /* ================= Submissions ================= */
  async function loadSubs() {
    const items = await api("/submissions").catch(() => []);
    $("#sub-list").innerHTML = items.map((s) => `<div class="admin-list-item"><div><strong>${esc(s.subject)}</strong><p class="hint">${esc(s.from || "anonymous")} · ${esc(s.date || "")} · ${esc(s.status)}</p></div>
      <div class="admin-actions"><button data-act="sub-approve" data-id="${s.id}" class="button small">Approve</button><button data-act="sub-reject" data-id="${s.id}" class="button outline small">Reject</button></div></div>`).join("") || `<p class="notice">No submissions yet.</p>`;
  }

  /* ================= Categories ================= */
  $("#cat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/categories", { method: "POST", body: { name: $("#cat-name").value } });
      $("#cat-form").reset(); message("Category added.", true); loadCats();
    } catch (err) { message(err.message); }
  });
  async function loadCats() {
    const items = await api("/categories").catch(() => []);
    $("#cat-list").innerHTML = items.map((c) => `<div class="admin-list-item"><div>🏷 <strong>${esc(c.name)}</strong></div>${isAdmin() ? `<button data-act="del-cat" data-id="${c.id}" class="button danger small">Remove</button>` : ""}</div>`).join("") || `<p class="notice">No categories yet.</p>`;
  }

  /* ================= Manifesto ================= */
  $("#manifesto-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/manifesto", { method: "PUT", body: { title: $("#manifesto-title").value, body: $("#manifesto-body").value } });
      message("Manifesto saved.", true);
    } catch (err) { message(err.message); }
  });
  async function loadManifesto() {
    const m = await api("/manifesto").catch(() => ({ title: "Our Manifesto", body: "" }));
    $("#manifesto-title").value = m.title || "";
    $("#manifesto-body").value = m.body || "";
  }

  /* ================= Analytics ================= */
  async function loadAnalytics() {
    const s = await api("/analytics/summary").catch(() => null);
    if (!s) return;
    const cells = [["Projects published", s.projects.total], ["News posts", s.news.total], ["Photos", s.photos.total], ["Documents", s.documents.total], ["Submissions pending", s.submissions.pending], ["Upcoming events", s.events.upcoming]];
    $("#analytics-cards").innerHTML = cells.map(([l, v]) => `<div class="stat"><div class="num">${v}</div><div class="lbl">${l}</div></div>`).join("");
  }

  /* ================= Team management (senator only) ================= */
  $("#user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/users", { method: "POST", body: { username: $("#user-username").value.trim(), password: $("#user-password").value, displayName: $("#user-display").value.trim(), role: $("#user-role").value } });
      $("#user-form").reset(); message("Team member added — they can now sign in.", true); loadUsers();
    } catch (err) { message(err.message); }
  });
  async function loadUsers() {
    if (!isSenator()) return;
    const items = await api("/users").catch(() => []);
    $("#user-list").innerHTML = items.map((u) => `<div class="admin-list-item"><div><strong>${esc(u.displayName)}</strong><p class="hint">${esc(u.username)} · ${esc(u.role)}</p></div><button data-act="del-user" data-id="${u.id}" class="button danger small">Revoke access</button></div>`).join("");
  }

  /* ================= Boot ================= */
  if (token() && user()) showWorkspace();
  const refreshAll = () => { loadNews(); loadPhotos(); loadDocs(); loadEvents(); loadLgas(); loadSubs(); loadCats(); loadManifesto(); loadAnalytics(); };
  const origShow = showWorkspace;
  window._bootTabs = () => { refreshAll(); };
  document.addEventListener("click", (e) => { if (e.target.closest(".admin-tab")) setTimeout(refreshAll, 0); });
})();
