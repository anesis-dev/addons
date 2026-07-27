# test-fixture

A throwaway project used by `anesis addon test <addon> <command>`. The command
copies this directory twice, applies the addon to one copy, and prints the diff —
this directory itself is never modified.

It is deliberately minimal: it exists to exercise the addon's steps, not to be a
runnable application. What matters is that every file the addon injects into is
present, with the `anesis:` markers in the same places the real template has
them.

```bash
anesis addon test <addon-id> install
```
