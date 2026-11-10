/**
 * Ekong Sampson Connect — backend server
 *
 * Roles:
 *   senator  -> full access to everything (manage users, delete anything)
 *   admin    -> manage content (everything except user management)
 *   staff    -> create/edit own content, cannot delete others' or manage users
 *
 * Auth: JWT bearer tokens.  Passwords are hashed with bcrypt.
 * Storage: JSON file database (db.json) + uploads/ folder for files.
 *         Swap the db.js module for Postgres/Supabase later without
 *         changing any route — routes only call db.* functions.
 */
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";

/* ---- load .env (no dependency needed) ---- */
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env");
try {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch { /* .env is optional */ }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || (() => { console.warn("WARNING: JWT_SECRET not set — using insecure default. Set it in .env"); return "insecure-dev-default"; })();
const UPLOAD_DIR = path.join(__dirname, "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ---------------- uploads ---------------- */
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpe?g|png|webp|gif|pdf|docx?|xlsx?|csv)$/i;
    allowed.test(file.originalname) ? cb(null, true) : cb(new Error("File type not allowed"));
  },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

/* ---------------- auth helpers ---------------- */
const ROLE_RANK = { staff: 1, admin: 2, senator: 3 };

function sign(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
}

function auth(required = 1) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      if (required === 0) { req.user = null; return next(); } // public read
      return res.status(401).json({ error: "Not signed in" });
    }
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      if (ROLE_RANK[req.user.role] < required)
        return res.status(403).json({ error: "Your role does not permit this action" });
      next();
    } catch {
      res.status(401).json({ error: "Session expired — please sign in again" });
    }
  };
}

const api = express.Router();

/* ---------------- auth routes ---------------- */
api.post("/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
  const user = db.getUserByUsername(String(username).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: "Invalid username or password" });
  res.json({ token: sign(user), user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } });
});

api.get("/auth/me", auth(), (req, res) => {
  const user = db.getUser(req.user.id);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  res.json({ user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } });
});

/* ---------------- users (senator only) ---------------- */
api.get("/users", auth(3), (req, res) => res.json(db.listUsers()));
api.post("/users", auth(3), (req, res) => {
  const { username, password, displayName, role } = req.body || {};
  if (!username || !password || !role) return res.status(400).json({ error: "username, password and role are required" });
  if (!["staff", "admin", "senator"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  if (db.getUserByUsername(username.toLowerCase())) return res.status(409).json({ error: "That username already exists" });
  const user = db.createUser({
    username: username.toLowerCase(),
    displayName: displayName || username,
    role,
    passwordHash: bcrypt.hashSync(password, 10),
  });
  res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName, role: user.role });
});
api.delete("/users/:id", auth(3), (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: "You cannot delete your own account" });
  db.deleteUser(req.params.id) ? res.json({ ok: true }) : res.status(404).json({ error: "User not found" });
});

/* ---------------- generic CRUD factory ---------------- */
const RESOURCES = ["projects", "news", "events", "lgas", "submissions", "categories", "photos", "documents"];

for (const resource of RESOURCES) {
  api.get(`/${resource}`, auth(0), (req, res) => res.json(db.list(resource)));            // public read
  api.get(`/${resource}/:id`, auth(0), (req, res) => {
    const item = db.get(resource, req.params.id);
    item ? res.json(item) : res.status(404).json({ error: "Not found" });
  });
  api.post(`/${resource}`, auth(1), (req, res) => {                                        // staff+
    const item = db.create(resource, { ...req.body, createdBy: req.user.username });
    res.status(201).json(item);
  });
  api.put(`/${resource}/:id`, auth(1), (req, res) => {                                     // staff+
    const item = db.update(resource, req.params.id, req.body);
    item ? res.json(item) : res.status(404).json({ error: "Not found" });
  });
  api.delete(`/${resource}/:id`, auth(2), (req, res) => {                                  // admin+ only
    db.remove(resource, req.params.id) ? res.json({ ok: true }) : res.status(404).json({ error: "Not found" });
  });
}

/* ---------------- file uploads ---------------- */
const FILE_RESOURCE = { photos: "photos", documents: "documents" };

for (const [route, resource] of Object.entries(FILE_RESOURCE)) {
  api.post(`/upload/${route}`, auth(1), upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file received" });
    const item = db.create(resource, {
      name: req.body.name || req.file.originalname,
      caption: req.body.caption || "",
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.username,
    });
    res.status(201).json(item);
  });
}

/* ---------------- manifesto (single doc, senator/admin) ---------------- */
api.get("/manifesto", auth(0), (req, res) => res.json(db.getManifesto()));
api.put("/manifesto", auth(2), (req, res) => res.json(db.setManifesto(req.body || {})));

/* ---------------- analytics summary ---------------- */
api.get("/analytics/summary", auth(1), (req, res) => {
  res.json({
    projects: { total: db.list("projects").length },
    news: { total: db.list("news").length },
    submissions: {
      total: db.list("submissions").length,
      pending: db.list("submissions").filter((s) => s.status === "pending").length,
    },
    events: { upcoming: db.list("events").filter((e) => e.date >= new Date().toISOString().slice(0, 10)).length },
    photos: { total: db.list("photos").length },
    documents: { total: db.list("documents").length },
  });
});

app.use("/api", api);

/* ---------------- static front-end (admin.html etc.) ---------------- */
app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get(/^\/(?!api|uploads|index\.html).*/, (req, res) => res.sendFile(path.join(__dirname, "admin.html")));

/* ---------------- errors ---------------- */
app.use((err, req, res, next) => {
  if (err) return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: err.message });
  next();
});

/* ---------------- seed the senator account ---------------- */
db.ensureSeed({
  username: "senator",
  password: "EkongSampson2026!",
  displayName: "Senator Ekong Sampson",
  role: "senator",
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Ekong Sampson Connect backend running on http://localhost:${PORT}`);
  console.log(`Admin portal:            http://localhost:${PORT}/admin.html`);
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal)
        console.log(`On your network:         http://${net.address}:${PORT}/  (share this for internet/LAN access)`);
    }
  }
});
