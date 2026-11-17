# Lab Mango docs

The Lab Mango documentation site (Docusaurus), served from its own server:

- **User guides** for lab users, lab coordinators and lab admins, written here in `docs/guides/`.
- **Developer handbook** synced on every build from the frontend (`beauty`) and backend (`lab-mango`) repositories:
  architecture, design specs, conventions, API standards, feature specs, decisions and engineering rules.

| Path | What | Edited where |
|---|---|---|
| `docs/guides/` | User guides | Here |
| `docs/developer/index.md`, `docs-workflow.md` | Developer handbook landing pages | Here |
| `docs/developer/frontend/` | Frontend docs (generated, gitignored) | Frontend repository: `README.md`, `docs/` |
| `docs/developer/backend/` | Backend docs (generated, gitignored) | Backend repository: `docs/`, `core/**/docs/`, … |
| `scripts/sync-docs.mjs` | Copies and link-rewrites the developer docs | Here |
| `Dockerfile`, `deploy/nginx.conf` | The docs server | Here |

## Work locally

Clone the three repositories side by side:

```text
workspace/
├── lab-mango-docs/   (this repository)
├── beauty/           (frontend)
└── lab-mango/        (backend)
```

```bash
npm ci
npm start          # sync + live preview on http://localhost:3001/
npm run build      # sync + production build into build/
npm run serve      # serve build/ on http://localhost:3001/
```

Other locations: set `FRONTEND_DIR` and `BACKEND_DIR`. A missing checkout gives a "not synced" page and link
warnings locally; CI (`DOCS_REQUIRE_ALL=1`) fails instead.

## Deploy

On every push to `main`, every docs change in the frontend or backend repository, nightly, and on manual runs,
`.github/workflows/docs.yml` builds the site and publishes `ghcr.io/<owner>/lab-mango-docs:latest` (and a
`:<commit>` tag). The image is a static Nginx server on port 8080 with `/healthz`.

```bash
docker run -d --name lab-mango-docs -p 8080:8080 ghcr.io/<owner>/lab-mango-docs:latest
```

Put it behind the company reverse proxy with TLS on its own hostname, for example `docs.labmango.<company>`.
To restrict the developer section to engineers, protect `/developer/` at the proxy (for example with SSO).

### Configuration

| Where | Name | Purpose |
|---|---|---|
| Secret (this repo) | `SOURCE_REPOS_READ_TOKEN` | Read access to the frontend and backend repositories |
| Variable (this repo) | `DOCS_SITE_URL` | Public URL of the docs, e.g. `https://docs.labmango.example` |
| Variable (this repo) | `DOCS_APP_URL` | URL of the Lab Mango app, for the "Open Lab Mango" link (hidden if unset) |
| Variable (this repo) | `FRONTEND_REPO`, `BACKEND_REPO` | Only if the repositories are not `<same owner>/beauty` and `<same owner>/lab-mango` |
| Secret (frontend, backend) | `DOCS_DISPATCH_TOKEN` | Lets them ask this repository to rebuild |
| Variable (frontend, backend) | `DOCS_REPO` | Only if this repository is not `<same owner>/lab-mango-docs` |
| Frontend build | `VITE_DOCS_URL` | Shows the docs link in the app header |

Full details: [`docs/developer/docs-workflow.md`](docs/developer/docs-workflow.md).
