# Security Policy

This repository holds the addons the Anesis CLI applies to existing projects.
**Addons can execute code on a user's machine**, so it is the most
security-sensitive part of the registry.

## Reporting a problem

**Do not open a public issue.** Use GitHub's private vulnerability reporting:
[Security → Report a vulnerability](https://github.com/anesis-dev/addons/security/advisories/new).

Report immediately if you find an addon here that:

- runs a shell command that does anything other than what its `description` says,
- exfiltrates files, environment variables, or credentials,
- installs a package that is not the one it names,
- writes outside the project directory,
- injects code into a project that weakens its security.

## What an addon is allowed to do

Two step kinds do more than edit files under the project root:

- **`packages`** invokes the user's package manager, which runs the installed
  package's own lifecycle scripts.
- **`run`** executes an arbitrary shell command and cannot be rolled back —
  `anesis undo` reports it as irreversible and leaves its effects in place.

The CLI asks before every `run` step, and refuses them entirely in a
non-interactive session unless `--allow-run` is passed. The full trust model is
in [anesis-cli/SECURITY.md](https://github.com/anesis-dev/anesis-cli/blob/main/SECURITY.md).

## For addon authors

- Use `copy`, `create`, `inject` and friends wherever possible. They are
  reversible; `run` is not.
- If you need a `run` step, give it a `description` that says exactly what it
  does. That description is what the user reads before approving it.
- Ship a `test-fixture/` so `anesis addon test <id> <command>` can show a
  reviewer the full diff your addon produces.
- Never read a credential, and never contact a network host other than the
  package registry the `packages` step already uses.

## Out of scope

- Vulnerabilities in packages an addon installs — report those upstream.
- A `run` step doing what its description says, after the user approved it.
