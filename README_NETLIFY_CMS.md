Netlify CMS integration
=======================

Steps to enable the CMS on this static site:

- Push this repository to GitHub (or Git provider) and connect it to Netlify.
- In your Netlify site dashboard: enable "Identity" (Netlify Identity) and then enable "Git Gateway" under Identity > Services.
- Deploy the site on Netlify. The CMS will be available at `https://<your-site>.netlify.app/admin/`.
- Log in via the admin page; Netlify Identity will handle authentication and Git Gateway will commit changes to the repo.

Notes and configuration:
- The CMS config lives at `admin/config.yml`.
- Media uploads are stored under `assets/img/uploads`.
- Collections write markdown files to `content/pages` (example: `content/pages/home.md`).
- If you prefer direct GitHub OAuth instead of Git Gateway, update `admin/config.yml` backend to `github` and set the `repo` field.

Local preview:
- To test locally with Netlify Identity/Git Gateway you can use `netlify dev` from the Netlify CLI and enable identity service.
