/**
 * Simple JSON-file database.
 * Every function is synchronous and safe to swap for a real DB later.
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "db.json");

const EMPTY = {
  users: [],
  projects: [],
  news: [],
  events: [],
  lgas: [],
  submissions: [],
  categories: [],
  photos: [],
  documents: [],
  analytics: [],
  manifesto: { title: "Our Manifesto", body: "", updatedAt: null },
};

let data;
try {
  data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
} catch {
  data = JSON.parse(JSON.stringify(EMPTY));
}
for (const k of Object.keys(EMPTY)) if (!(k in data)) data[k] = JSON.parse(JSON.stringify(EMPTY[k]));

const save = () => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export default {
  /* ---- users ---- */
  getUser(id) { return data.users.find((u) => u.id === id); },
  getUserByUsername(username) { return data.users.find((u) => u.username === username); },
  listUsers() { return data.users.map(({ passwordHash, ...rest }) => rest); },
  createUser({ username, displayName, role, passwordHash }) {
    const user = { id: id(), username, displayName, role, passwordHash, createdAt: new Date().toISOString() };
    data.users.push(user); save();
    return user;
  },
  deleteUser(id) {
    const n = data.users.length;
    data.users = data.users.filter((u) => u.id !== id); save();
    return data.users.length < n;
  },
  ensureSeed({ username, password, displayName, role }) {
    if (!data.users.some((u) => u.role === "senator")) {
      this.createUser({ username, displayName, role, passwordHash: bcrypt.hashSync(password, 10) });
      console.log(`Seeded ${role} account — username: ${username}`);
    }
  },

  /* ---- generic resources ---- */
  list(resource) { return data[resource] || []; },
  get(resource, id) { return (data[resource] || []).find((x) => x.id === id); },
  create(resource, body) {
    const item = { id: id(), createdAt: new Date().toISOString(), ...body };
    (data[resource] = data[resource] || []).push(item); save();
    return item;
  },
  update(resource, id, patch) {
    const item = (data[resource] || []).find((x) => x.id === id);
    if (!item) return null;
    Object.assign(item, patch, { updatedAt: new Date().toISOString() }); save();
    return item;
  },
  remove(resource, id) {
    const n = (data[resource] || []).length;
    data[resource] = (data[resource] || []).filter((x) => x.id !== id); save();
    return (data[resource] || []).length < n;
  },

  /* ---- manifesto ---- */
  getManifesto() { return data.manifesto; },
  setManifesto(body) {
    data.manifesto = { ...data.manifesto, ...body, updatedAt: new Date().toISOString() }; save();
    return data.manifesto;
  },
};
