# Contributing an addon

An addon is a manifest of reversible steps applied to an existing project.

## Before you start

Open an issue first. The registry is curated, and an addon that overlaps an
existing one needs a reason.

**Read [SECURITY.md](SECURITY.md) before writing any `run` step.** Addons execute
on other people's machines; that document is the contract.

## Layout

```
<addon-id>/
  anesis.addon.json     the manifest
  files/<command>/...   files referenced by `copy` steps
  test-fixture/         a minimal project the addon can be applied to
```

`registry-lint` fails if a `copy` step names a file that is not there, or if the
`test-fixture/` is missing a file (or an anchor) that an `inject` step needs.

## Step kinds, most to least preferred

1. `copy`, `create` — add files. Fully reversible.
2. `inject`, `replace`, `append` — edit files at a marker. Reversible; the
   original content is stored in the journal.
3. `delete`, `rename`, `move` — reversible.
4. `packages` — installs dependencies, which runs their lifecycle scripts.
5. `run` — arbitrary shell. **Not reversible.** `anesis undo` reports it and
   leaves its effects in place.

Reach for `run` last. When you must use it, write a `description` that says
exactly what the command does — that text is what the user reads before
approving it, and it is the only thing standing between them and an unreviewed
shell command.

## Injection

Target the `// anesis:` markers templates place, and set `if_not_found: "error"`
so a mismatch fails loudly instead of silently doing nothing.

## Test fixtures

Ship a `test-fixture/`: a minimal project with every file your `inject` steps
target, markers included. Then anyone can see exactly what your addon does:

```bash
anesis addon test <addon-id> install
```

It copies the fixture twice, applies the addon to one copy, and prints the diff.

## Before opening a PR

```bash
# From a checkout that also has ../templates and ../stacks alongside:
registry-lint ../templates . ../stacks

# And the real thing:
anesis addon link .
anesis addon test <addon-id> install
```

## Idempotence

A command marked `once: true` must be safe to skip on re-run. A command that is
not `once` must be safe to run twice — use `if_exists: "skip"` on `create`/`copy`
rather than blindly overwriting a user's file.

## License

Contributions are licensed under Apache-2.0, per [LICENSE](LICENSE).
