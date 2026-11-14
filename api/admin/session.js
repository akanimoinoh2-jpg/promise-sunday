import {
  adminConfigurationError,
  hasValidAdminSession,
  jsonResponse,
  matchesAdminPassword,
  requestIsSameOrigin,
  setAdminCookie,
} from "../../server/adminAuth.js";

export default function handler(req, res) {
  jsonResponse(res);
  const configError = adminConfigurationError();
  if (configError) return res.status(503).json({ error: configError });

  if (req.method === "GET") {
    return res.status(200).json({ authenticated: hasValidAdminSession(req) });
  }

  if (!requestIsSameOrigin(req)) return res.status(403).json({ error: "Request origin was not accepted." });

  if (req.method === "POST") {
    const password = req.body?.password;
    if (typeof password !== "string" || password.length > 1024 || !matchesAdminPassword(password)) {
      return res.status(401).json({ error: "Incorrect admin password." });
    }
    setAdminCookie(res, 60 * 60 * 12);
    return res.status(200).json({ authenticated: true });
  }

  if (req.method === "DELETE") {
    setAdminCookie(res, 0);
    return res.status(200).json({ authenticated: false });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ error: "Method not allowed." });
}
