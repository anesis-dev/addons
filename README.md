# Anesis addons

The official addon registry for [**Anesis**](https://anesis-dev.vercel.app).

An addon is a reusable, versioned change you apply to an already-scaffolded
project — add Prisma to a NestJS app, add a `/health` endpoint, add a
`docker-compose.yml`. Every step is recorded, so `anesis undo` can take it back
out again.

## Use an addon

```bash
cd my-app
anesis addon install nest-prisma-v7
anesis use nest-prisma-v7 install       # apply it
anesis use nest-prisma-v7 generate      # run a named command
anesis undo nest-prisma-v7              # revert it
```

Browse them all at
[anesis-dev.vercel.app/addons](https://anesis-dev.vercel.app/addons).

## Available addons

### Frontend (React and Next.js templates)

Each of these picks its own variant from the project's build tool, so the same
addon id works on Vite, Rsbuild, Farm and Next.

| Addon | What it does | Commands |
| --- | --- | --- |
| `tailwind` | Tailwind CSS v4, wired into the project's own build — the first-party plugin on Vite, `@tailwindcss/postcss` on Rsbuild, Farm and Next — with `@import "tailwindcss"` in the entry stylesheet. | `install` |
| `react-router` | React Router v7 in declarative mode: wraps the app root in a `<BrowserRouter>` and adds a routes file with a home route and a catch-all. | `install` |
| `tanstack-query` | TanStack Query v5 with its provider mounted at the app root. Next gets a `'use client'` `Providers` component instead of a module-level client. | `install` |
| `zustand` | Zustand plus a worked example store. No provider: a store is a hook, so it works in SPAs and Next client components alike. | `install` |
| `prettier` | Prettier with a shared `.prettierrc` / `.prettierignore` and `format` scripts. Leaves an existing `format` script alone. | `install` |

### NestJS

| Addon | What it does | Commands |
| --- | --- | --- |
| `nest-auth-jwt` | Cookie-based JWT auth for NestJS: register/login/me/logout/refresh, argon2 hashing, Passport access + refresh strategies, a global `AccessTokenGuard` with `@Public()` bypass, and a `User` Prisma model. Requires `nest-prisma-v7` and `nest-validation`. | `install` |
| `nest-docker` | Multi-stage `Dockerfile`, `docker-compose.yml` (app + PostgreSQL) and `.dockerignore` so a NestJS project is container-ready. | `install` |
| `nest-health` | Adds `@nestjs/terminus` and a `/health` endpoint with a memory check — a ready-made liveness/readiness probe. | `install` |
| `nest-prisma-v7` | Adds Prisma 7 (PostgreSQL) to a NestJS project — the `prisma-client` generator plus the `@prisma/adapter-pg` driver adapter — and a resource generator that replaces `nest g res`. | `install`, `generate` |
| `nest-swagger` | Adds `@nestjs/swagger` and exposes Swagger UI at `/api`. | `install` |
| `nest-validation` | Adds `class-validator` + `class-transformer` with a global `ValidationPipe`. | `install` |

### Rust (Axum)

| Addon | What it does | Commands |
| --- | --- | --- |
| `axum-error` | A single `AppError` with an `IntoResponse` impl, so handlers can use `?` and still return the right status and a consistent JSON body. Internal causes are logged, not returned. | `install` |
| `axum-tracing` | A `tracing-subscriber` driven by `RUST_LOG` plus tower-http's `TraceLayer`, so every request is logged with method, path, status and latency. | `install` |
| `axum-sqlx` | A SQLx PostgreSQL pool on `AppState`, migrations that run at startup, and a `GET /health/db` readiness route. | `install` |

### Any project

| Addon | What it does | Commands |
| --- | --- | --- |
| `docker-compose` | Creates a `docker-compose.yml` and adds common dev services on demand (postgres, redis, mongo, rabbitmq, mailpit), auto-filling `.env` / `.env.example` with the matching connection variables. | `install`, `add-postgres`, `add-redis`, `add-mongo`, `add-rabbitmq`, `add-mailpit` |

## What an addon is

One directory, one manifest. `addons/{addon-id}/anesis.addon.json` is the whole
addon unless it uses `copy` steps, which pull files from the same directory.

```jsonc
{
  "$schema": "https://anesis-server.onrender.com/schema/anesis.addon.schema.json",
  "schema_version": "1",
  "id": "my-addon",          // must match the directory name
  "name": "My Addon",
  "version": "0.1.0",
  "description": "...",
  "author": { "name": "Maksym Zhuk", "github": "anesis-dev" },
  "requires": [],            // addons that must already be installed
  "inputs": [],              // values prompted from the user
  "detect": [],              // rules that pick a variant for this project
  "variants": []             // per-environment command sets
}
```

A manifest is built from:

- **inputs** — values prompted from the user, exposed to steps as Tera variables
  (`{{ name }}`, `{{ name_pascal }}`, `{{ name_kebab }}`, …).
- **detect** — rules (`file_exists`, `file_contains`, `json_contains`,
  `toml_contains`, `yaml_contains`) that select a variant, so one addon can
  behave differently on Express and Fastify.
- **variants → commands → steps** — the actual work: `create`, `inject`,
  `replace`, `append`, `copy`, `packages`, `run`, `delete`, `rename`, `move`.

[`CLAUDE.md`](./CLAUDE.md) in this repository is the full field-by-field
reference for the manifest format.

## A note on `run` steps

A `run` step executes a shell command from a remote manifest on your machine.
Anesis prints the exact command and asks before running it.

That prompt is **not** waived by `--yes`. Non-interactively — `--yes`, any
`--stack` apply, the MCP server — a `run` step fails with an explanation unless
you also pass `--allow-run` (or set `ANESIS_ALLOW_RUN=1`). Accepting defaults and
accepting remote shell execution are deliberately separate decisions.

`run` steps are also the one step type that cannot be reverted: `anesis undo`
will tell you the command's effects remain.

## Testing an addon

```bash
anesis addon test <addon-id> <command> --project ./path/to/fixture-project
```

The fixture is copied into a temp directory, the command runs there with default
inputs, and you get a diff of what changed. The original is never touched. Omit
`--project` to use a `test-fixture/` directory shipped with the addon.

## Contributing an addon

You do not need write access here. Publish from your own repository, which must
have `anesis.addon.json` at its root:

```bash
anesis addon publish https://github.com/<you>/<repo>
```

To add one to this registry, open a pull request. CI validates every manifest
against the published JSON Schema.

Full guide:
[Creating addons](https://anesis-dev.vercel.app/docs/addons/creating).

## License

The contents of this repository are licensed under the
[Apache License 2.0](./LICENSE) — code these addons add to your project carries
no restriction on commercial use.

The Anesis CLI itself is licensed separately, under the
[PolyForm Noncommercial License 1.0.0](https://github.com/anesis-dev/anesis-cli/blob/main/LICENSE.md).
That license covers the tool, not what you build with it.
