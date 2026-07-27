# Addons — Reference for Claude Code

Each addon lives in its own subdirectory: `addons/{addon-id}/anesis.addon.json`.
That JSON file is the entire addon — no other files are required unless the addon uses `copy` steps (which pull files from the same directory).

---

## Top-level structure

```jsonc
{
  "$schema": "https://anesis-server-.../schema/anesis.addon.schema.json",
  "schema_version": "1",
  "id": "my-addon",           // must match the directory name
  "name": "My Addon",
  "version": "0.1.0",
  "description": "...",       // 10-300 characters
  "author": { "name": "Maksym Zhuk", "github": "anesis-dev" },
  "requires": [],             // IDs of addons that must already be installed
  "inputs": [],               // manifest-level inputs (prompted once, shared across all commands)
  "detect": [],               // detection blocks → selects a variant
  "variants": []              // list of variants (conditional + universal fallback)
}
```

---

## Inputs

Prompted interactively from the user. Defined at manifest level (shared) or command level (per-command).

```jsonc
{
  "name": "resource_name",
  "type": "text",             // "text" | "boolean" | "select"
  "description": "Prompt shown to the user",
  "required": true,
  "default": "my-default",   // optional
  "options": []              // only for type "select"
}
```

**Template variables auto-derived from every input** (works in both `path` and `content` fields):

| Variable | Example (input = "blog-post") |
|---|---|
| `{{ name }}` | blog-post |
| `{{ name_pascal }}` | BlogPost |
| `{{ name_camel }}` | blogPost |
| `{{ name_kebab }}` | blog-post |
| `{{ name_snake }}` | blog_post |

Template syntax is Tera: `{{ var }}`, `{% if %}`, `{% for %}`, etc.

---

## Detect blocks

Used to auto-detect the project environment and pick the right variant.

```jsonc
{
  "id": "fastify",         // variant id this block activates
  "match": "all",          // "all" (default: "any")
  "rules": [
    { "type": "file_exists",    "file": "nest-cli.json" },
    { "type": "file_contains",  "file": "main.ts", "contains": "FastifyAdapter" },
    { "type": "json_contains",  "file": "package.json", "key_path": "dependencies.@nestjs/platform-fastify" },
    { "type": "json_contains",  "file": "package.json", "key_path": "scripts.start", "value": "nest start" },
    { "type": "toml_contains",  "file": "Cargo.toml", "key_path": "package.name", "value": "my-crate" },
    { "type": "yaml_contains",  "file": "pubspec.yaml", "key_path": "name" }
  ]
}
```

- All rule types support `"negate": true` to invert the result.
- `key_path` uses dot notation: `"dependencies.react"`, `"scripts.build"`.
- Omitting `value` in `*_contains` rules checks only for key existence.

---

## Variants

```jsonc
{
  "when": "fastify",    // matches a detect block id; null = universal fallback
  "commands": [ ... ]
}
```

Variant selection order: first matching `when` → then `when: null` fallback. Always include a `null` fallback unless the addon is strictly environment-specific.

---

## Commands

```jsonc
{
  "name": "install",
  "description": "...",
  "once": true,                      // if true, CLI refuses to run it twice (tracked in anesis.lock)
  "requires_commands": ["install"],  // commands that must have run first
  "inputs": [ ... ],                 // command-level inputs
  "steps": [ ... ]
}
```

---

## Steps

All step types are discriminated by `"type"`. Paths are relative to the **project root** (not the addon dir). Tera template syntax works in `path`, `content`, `src`, `dest`, `from`, `to`, `find`, `replace`.

### `create` — write a file

```jsonc
{
  "type": "create",
  "path": "src/{{ resource_name_kebab }}/{{ resource_name_kebab }}.service.ts",
  "content": "// file content here\n",
  "if_exists": "skip"    // "overwrite" (default) | "skip" | "ask"
}
```

### `inject` — insert lines relative to a marker

```jsonc
{
  "type": "inject",
  "target": { "type": "file", "file": "src/app.module.ts" },
  "content": "import { FooModule } from './foo/foo.module';",
  "after": "// anesis:top-imports",    // inserts AFTER the line containing this string
  // OR:
  "before": "// anesis:module-imports", // inserts BEFORE the line containing this string
  "if_not_found": "error"  // "warn_and_ask" (default) | "skip" | "error"
}
```

Omitting both `after` and `before` prepends the content to the file.

### `replace` — find-and-replace inside a file

```jsonc
{
  "type": "replace",
  "target": { "type": "file", "file": "package.json" },
  "find": "\"dependencies\": {",
  "replace": "\"dependencies\": {\n    \"express\": \"^4.18.0\",",
  "if_not_found": "skip"
}
```

### `append` — append content to the end of a file

```jsonc
{
  "type": "append",
  "target": { "type": "file", "file": ".env.example" },
  "content": "NEW_VAR=value\n"
}
```

### `copy` — copy a static file from the addon directory into the project

```jsonc
{
  "type": "copy",
  "src": "files/eslint.config.js",    // relative to ~/.anesis/cache/addons/{addon-id}/
  "dest": "eslint.config.js",          // relative to project root
  "if_exists": "skip"
}
```

`if_exists: "ask"` prompts before overwriting. Non-interactively (`--yes`, any
`--stack` apply, MCP) it resolves to the prompt's own default and keeps the
user's file — so an addon can use `ask` without becoming unusable in a stack.

### `packages` — install dependencies with the project's package manager

```jsonc
{
  "type": "packages",
  "dependencies": ["express@^4.18", "@prisma/client@^6.6.0"],
  "dev_dependencies": ["@types/express", "prisma@^6.6.0"]
}
```

The CLI detects the package manager from lock-files (`bun.lock`/`bun.lockb` → bun, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, else `package.json` → npm; `Cargo.toml` → `cargo add`) and runs its install/add command in the project root. Prefer this over hand-editing `package.json` with `replace`.

- Specs are passed verbatim, so `pkg@^1.2` version ranges work.
- Rollback/undo restores the pre-install manifest + lock file (dropping the added entries); `node_modules`/`target` are left as-is.
- Runs a real subprocess and hits the network — it's counted under "edited" in the confirmation prompt, skipped in `--dry-run`.

### `run` — run a shell command in the project root

```jsonc
{
  "type": "run",
  "command": "npx prisma generate",
  "description": "Generate the Prisma client"   // optional, shown before running
}
```

Runs `sh -c "<command>"` in the project root. Tera vars work in `command`.

- **Not reversible**: `undo` warns that the command's effects remain rather than trying to revert them. Use it for codegen/formatting, not for state you'll want to roll back.
- Runs arbitrary code: the exact command is shown and confirmed before it runs (`--yes` accepts; `--dry-run` only prints it). Declining aborts the command (triggering rollback of earlier steps).

### `delete` — delete a file or glob of files

```jsonc
{ "type": "delete", "target": { "type": "file", "file": "jest.config.ts" } }
{ "type": "delete", "target": { "type": "glob", "glob": "**/*.test.ts" } }
```

### `rename` / `move` — rename or move files (Tera vars work in `from`/`to`)

```jsonc
{ "type": "rename", "from": "old-name.ts", "to": "{{ resource_name_kebab }}.ts" }
{ "type": "move",   "from": "src/foo.ts",  "to": "src/bar/foo.ts" }
```

---

## Targets

Used by `inject`, `replace`, `append`, `delete`:

```jsonc
{ "type": "file", "file": "src/app.module.ts" }
{ "type": "glob", "glob": "src/**/*.controller.ts" }
```

---

## Lock file (`anesis.lock`)

Written to the project root after each successful command run. Tracks which addons are installed and which commands have been executed. Used to enforce `once: true` and `requires_commands` constraints. Do not edit manually.

---

## Injection markers the registry templates provide

Every template in `anesis-dev/templates` carries the same named anchors, so an
addon can target them by name instead of pattern-matching the template's own
code. Inject with `if_not_found: "error"` against these: a missing marker is a
bug in the template, and silence would ship a half-applied addon.

| Marker | Where | Inject |
| --- | --- | --- |
| `// anesis:top-imports` | entry file, bundler config, `app.module.ts`, `main.rs`, `state.rs`, `routers/mod.rs` | `after` — import statements |
| `{/* anesis:providers-start */}` / `{/* anesis:providers-end */}` | React entry file (`src/main.*` or `src/index.*`), Next `layout.tsx` | `after` the start and `before` the end — a provider that *wraps* the app |
| `/* anesis:css-imports */` | `src/index.css` (`src/app/globals.css` on Next) | `after` — `@import` rules |
| `// anesis:build-plugins` | `vite.config.*`, `rsbuild.config.*`, `farm.config.ts` | `before` — an entry in the `plugins` array |
| `// anesis:next-config` | `next.config.ts` | `before` — keys on the config object |
| `// anesis:module-imports` | NestJS `src/app.module.ts` | `before` — module names in `imports: [ ]` |
| `# anesis:dependencies` | `Cargo.toml` | `before` — crates with their feature lists |
| `// anesis:modules` | `src/main.rs` | `before` — `mod x;` declarations |
| `// anesis:startup` | `src/main.rs` | `before` for things that must run first (logging), `after` for the rest |
| `// anesis:state-fields` / `// anesis:state-init` | `src/state.rs` / `src/main.rs` | `before` — an `AppState` field and its initialiser |
| `// anesis:routes` / `// anesis:layers` | `src/routers/mod.rs` | `before` — `.route(...)` / `.layer(...)` |
| `// anesis:handler-modules` / `// anesis:handler-exports` | `src/handlers/mod.rs` | `before` — `mod x;` / `pub use x::x;` |

### Wrapping vs. inserting

The provider markers are a pair for a reason: an addon that wraps the app opens
before `providers-start`'s content and closes before `providers-end`, so several
addons nest correctly no matter what order they were installed in.

Injection order is worth thinking about. `after: "// anesis:startup"` puts your
content directly below the marker, so a *later* addon's content ends up above
yours. If your step must run first regardless (initialising logging, for
example), anchor it with `before` instead.

### Entry files differ by template

React entry files are `src/main.tsx`, `src/main.jsx`, `src/index.tsx` or
`src/index.jsx` depending on the template. Target them with a glob
(`src/*.[jt]sx`) and `if_not_found: "skip"`: only the entry file carries the
markers, so the addon's own `App.tsx` sibling is skipped harmlessly.

### Adding npm packages

Use the `packages` step — it detects the package manager and installs for real, so no manual `npm install` afterwards. (Legacy addons `replace` into `"dependencies": {`; prefer `packages` for new ones.)

### Generating resources (repeatable commands)

Set `"once": false` and `"requires_commands": ["install"]`. Collect a `resource_name` input and use `{{ resource_name_pascal }}`, `{{ resource_name_kebab }}`, etc. throughout file paths and content.

---

## Testing an addon locally

```bash
anesis addon test <addon-id> <command> --project ./path/to/fixture-project
```

Copies the fixture project into a throwaway temp dir, runs the command there with default inputs (non-interactive), and prints a diff of what changed — the original is never touched. Omit `--project` to use a `test-fixture/` directory shipped alongside the addon. `anesis.lock` is excluded from the diff (it's internal bookkeeping).

## Publishing

```bash
anesis addon publish https://github.com/org/repo
```

The repo must have `anesis.addon.json` at its root. The server reads `anesis.addon.json`, validates it, and stores it with a `commit_sha`.
