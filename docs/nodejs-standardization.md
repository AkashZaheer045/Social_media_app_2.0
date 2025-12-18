# Node.js Standardization Guide

This document defines the standards each project that relies on our Node.js platform should follow. It is a shared contract between teams and serves as both a quality gate and onboarding accelerator. Update it whenever platform-wide expectations change to keep the repository structure consistent and auditable.

## 1. Runtime & Tooling Baseline

- **Node.js**: Target the current Active LTS release (Node 20.x as of Nov 2025). Use `.nvmrc` or CI to enforce. Avoid syntax that is not supported by the pinned version.
- **Package manager**: npm (ships with Node). Always run `npm install` without `--legacy-peer-deps`. Commit the generated `package-lock.json` once created.
- **Process manager**: Use the scripts defined in `package.json` (`npm run dev` for hot reload via nodemon, `npm start` for production parity). Do not introduce parallel entry points without updating the scripts table.
- **Type system & linting**: JavaScript (CommonJS) today. When adding linting, prefer ESLint with the node, security, and jest plugins plus Prettier for formatting. Keep configuration in `configs/` or a top-level RC file.

## 2. Repository Layout Contract

```
.
├── app.js                    # Main bootstrap - Express, middleware, modules
├── src/
│   └── modules/
│       └── <domain>/         # Vertical slices per feature
│           ├── app.js        # Module router factory
│           ├── controllers/
│           ├── routes/
│           ├── services/
│           └── validations/
├── middleware/               # Cross-cutting Express middleware
├── helpers/                  # Pure utility helpers (pagination, transforms)
├── utils/                    # Framework-agnostic utilities
│   └── uploads/
├── db/
│   ├── migrations.sql        # SQL scripts until migrator adopted
│   ├── schemas/              # Sequelize model definitions
│   └── sequelize/            # Connection, associations, hooks
├── config/                   # JSON-based static configuration
├── views/                    # EJS/email templates
│   ├── emails/
│   ├── letters_docs/
│   └── user_emails/
├── docs/                     # Documentation and runbooks
│   └── nodejs-standardization.md
├── __tests__/                # Jest tests mirroring source tree
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
└── package.json
```

### Key Rules

- Group secrets (`.env`, certificates) outside the repo or in encrypted storage
- If a module needs shared assets, nest them inside the module to avoid leaking boundaries
- When introducing new directories, update this document and `README.md`

## 3. Coding Conventions

### Modules
Stick to CommonJS (`module.exports` / `require`) until a repo-wide migration plan exists. Avoid mixing ESM imports in the same file.

### Async Patterns
Use `async/await` everywhere; never rely on unhandled promise rejections. Wrap async route handlers with centralized error middleware.

### Error Handling
Bubble domain errors with custom types or codes defined in `utils/custom_exceptions.json`, then map to HTTP responses using `middleware/response_handler.js`.

### Validation
Keep schema logic inside `src/modules/<domain>/validations/`. Use `express-validator` or Zod; never validate inside controllers directly.

### Logging
Use `console-stamp` (already included) or a consistent logger wrapper. Every request should log trace ID, actor, and outcome at minimum.

### Naming
Files are lowercase with underscores (legacy). New files should converge on kebab-case or camelCase; pick one per directory and stay consistent.

### Comments
Use block comments only for non-obvious logic. Prefer self-documenting code and helper extraction.

## 4. Configuration & Environment Management

- Load configuration via `dotenv` at process start, before any module imports that rely on env vars
- Prefix environment variables by domain (`AUTH_JWT_SECRET`, `DB_READ_URL`). Document expected vars in `.env.example`
- Keep runtime toggles (feature flags) in `config/constants.json` or dedicated flag service

## 5. Dependency Hygiene

- Introduce dependencies only after checking the tree (`npm ls <pkg>`). Remove unused packages promptly
- Prefer standard APIs (crypto, URL, fetch) before adding third-party modules
- Record security-sensitive packages (auth, crypto, file upload) in this doc when added
- Run `npm audit` at least monthly and before releases

## 6. HTTP & API Standards

### Routing
Define routes in `src/modules/<domain>/routes`. Keep routes declarative—no business logic in route files.

### Controllers
Only coordinate request flow: parse inputs, call services, map responses. No DB access here.

### Services
Own business logic and orchestration. They may call db/ repositories, external APIs (via axios), or helpers.

### Responses
Use centralized helpers from `utils/response.js` to ensure shape consistency:
```json
{ "success": true, "data": {}, "errors": [], "meta": {} }
```

### Pagination
Reuse `helpers/pagination.js` utilities for list endpoints to standardize parameters (page, limit, sort).

### Versioning
Expose version via URL prefix (`/api/v1`) or headers. Document breaking changes in `CHANGELOG.md`.

## 7. Data & Persistence

- Use Sequelize models under `db/schemas/`
- Define associations in `db/sequelize/associations.js` only
- All SQL or migration scripts belong in `db/migrations.sql` until automated tooling is introduced
- Never access the database through ad-hoc mysql2 or raw queries from controllers

## 8. Security Expectations

- Enforce authentication in `middleware/auth.js` and authorization in module-level guards
- Sanitize all user inputs before persisting or rendering into templates
- For file uploads (`utils/uploader.js`), validate MIME types with `mime-types` and scan file sizes before uploading
- Rotate secrets outside of the codebase; do not embed AWS keys, SMTP creds, or JWT secrets in config files
- Use HTTPS in production and set `trust proxy` when behind load balancers

## 9. Testing & Quality Gates

- **Testing stack**: prefer Jest for unit/integration, Supertest for HTTP, and Sinon for spies
- Place tests under `__tests__/` mirroring the source tree
- Every new module must ship with controller and service tests covering success and failure paths
- Run tests plus `npm run lint` in CI before merge

## 10. Delivery Workflow

- Feature branches: `feat/<ticket>`
- Fixes: `fix/<ticket>`
- Chores: `chore/<desc>`
- Use Conventional Commits in pull requests (`feat: add user activation flow`)
- Tag releases with semantic versioning

## 11. Quick Checklist Before Opening a PR

- [ ] Node version matches `.nvmrc`/CI
- [ ] Added/updated tests pass locally
- [ ] Linting/formatting run
- [ ] New environment variables documented
- [ ] Sensitive data scrubbed from logs and configs
- [ ] README and this standard updated if expectations changed
