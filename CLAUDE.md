# Addons — Reference for Claude Code

Each addon lives in its own subdirectory: `addons/{addon-id}/oxide.addon.json`.
That JSON file is the entire addon — no other files are required unless the addon uses `copy` steps (which pull files from the same directory).

---

## Top-level structure

```jsonc
{
  "$schema": "https://oxide-server-.../schema/oxide.addon.schema.json",
  "schema_version": "1",
  "id": "my-addon",           // must match the directory name
  "name": "My Addon",
  "version": "0.1.0",
  "description": "...",
  "author": "oxide-cli",
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
  "once": true,                      // if true, CLI refuses to run it twice (tracked in oxide.lock)
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
  "after": "// oxide:top-imports",    // inserts AFTER the line containing this string
  // OR:
  "before": "// oxide:module-imports", // inserts BEFORE the line containing this string
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
  "src": "files/eslint.config.js",    // relative to ~/.oxide/cache/addons/{addon-id}/
  "dest": "eslint.config.js",          // relative to project root
  "if_exists": "skip"
}
```

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

## Lock file (`oxide.lock`)

Written to the project root after each successful command run. Tracks which addons are installed and which commands have been executed. Used to enforce `once: true` and `requires_commands` constraints. Do not edit manually.

---

## Typical patterns

### NestJS module registration

Templates must have these markers in `src/app.module.ts`:

```ts
// oxide:top-imports    ← inject import statements after this line
@Module({
  imports: [
    // oxide:module-imports    ← inject module names before this line
  ],
})
```

### Adding npm packages

Use `replace` on `package.json` — inject into `"dependencies": {` or `"devDependencies": {`. The user runs `npm install` / `yarn` manually after.

### Generating resources (repeatable commands)

Set `"once": false` and `"requires_commands": ["install"]`. Collect a `resource_name` input and use `{{ resource_name_pascal }}`, `{{ resource_name_kebab }}`, etc. throughout file paths and content.

---

## Publishing

```bash
oxide addon publish https://github.com/org/repo
```

The repo must have `oxide.addon.json` at its root. The server reads `oxide.addon.json`, validates it, and stores it with a `commit_sha`.
