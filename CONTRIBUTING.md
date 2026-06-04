# Contributing

Thanks for taking a look! evmtrace is a small project and contributions are
welcome — bug reports, docs, and PRs alike.

## Getting started

```bash
pnpm install
pnpm test          # run the unit suite (Vitest)
pnpm run typecheck  # tsc --noEmit
pnpm run lint       # eslint
pnpm run format     # prettier --write
```

Node 20+ and [pnpm](https://pnpm.io) are expected. The integration tests under
`tests/integration` only run when `EVMTRACE_ANVIL_RPC` points at a live
[anvil](https://book.getfoundry.sh/anvil/) node; they are skipped otherwise.

## Ground rules

- **Keep the core pure.** Anything under `src/trace`, `src/gas`, `src/decode`,
  `src/storage`, and `src/format` should be a function over plain data — no
  network. Fetching lives in `src/rpc` and `src/tracer`.
- **Add a test with a fixture.** New decoding or gas logic should come with a
  small JSON fixture under `tests/fixtures` and a test that pins the numbers.
- **Run the checks.** Lint, format, typecheck, and tests must pass; CI runs the
  same commands across Node 20, 22, and 24.

## Commits & PRs

Conventional-ish commit messages are appreciated (`feat:`, `fix:`, `docs:`,
`refactor:`), but clear plain English is fine too. Open a PR against `main` and
fill in the template. Update `CHANGELOG.md` for anything user-facing.
