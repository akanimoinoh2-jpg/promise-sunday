# Promise Sunday — Data Analyst Portfolio

A responsive React portfolio built with Vite and React Router. It includes overview, projects, project details, about, services, and contact routes. The Vercel rewrites keep direct links to projects and the admin route inside the React app.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; preview it with `npm run preview`.

The `public/assets` directory contains the supplied portrait, dashboard screenshots and recordings, CV, source workbook, and supporting reports. The contact form prepares an email in the visitor's mail app; it does not submit or store messages.

## Private project admin

Select **Admin** on the portfolio or open `/admin`. The admin login is handled by Vercel serverless functions. Project data is stored in a Vercel Blob store, so admin changes are available to all visitors and devices. The login uses an HTTP-only, signed, 12-hour session cookie; the password and signing secret are never included in browser code.

### Configure Vercel

1. In the Vercel project, create and connect a **Blob** store. Vercel makes `BLOB_READ_WRITE_TOKEN` available to the project.
2. In Vercel **Settings → Environment Variables**, set:
   - `ADMIN_PASSWORD`: choose a strong password or passphrase at least 8 characters long; 16 or more characters is recommended.
   - `ADMIN_SESSION_SECRET`: generate a random secret of at least 32 characters. For example, run `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` locally and paste its output directly into Vercel.
3. Apply the variables to Production and any Preview environments where the admin should work, then redeploy.
4. Open `https://promise-sunday.vercel.app/admin`, enter `ADMIN_PASSWORD`, and press **Enter**. The first public project request uses the six projects in `src/projects.js`; the first saved update stores the full project list in Vercel Blob.
5. If your Vercel plan includes Firewall rate limits, apply a limit to `POST /api/admin/session` to slow repeated password guesses.

Do not put the password, session secret, or Blob token in source code or commit them. For local testing, the Vite development server runs the `/api` handlers locally and reads secrets from `.env.local`. A Blob store and `BLOB_READ_WRITE_TOKEN` are still required to save project changes.

The contact form prepares an email in the visitor's mail app; it does not submit or store messages.
