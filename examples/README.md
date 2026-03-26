# Examples

Runnable scripts that exercise the public API. They import from `../src`, so run
them straight from a checkout with [`tsx`](https://github.com/privatenumber/tsx):

```bash
pnpm dlx tsx examples/trace-tx.ts http://127.0.0.1:8545 0x<txhash>
```

| Script             | What it shows                                            |
| ------------------ | -------------------------------------------------------- |
| `trace-tx.ts`      | Full gas report for a transaction (call tree + opcodes). |
| `profile-gas.ts`   | The per-opcode gas profile, most expensive first.        |
| `decode-revert.ts` | Decoding `Error`, `Panic`, and custom-error reverts.     |
| `flamegraph.ts`    | Folded stacks you can pipe into `flamegraph.pl`.         |

`trace-tx.ts`, `profile-gas.ts`, and `flamegraph.ts` need a node that exposes
`debug_traceTransaction` (a local `anvil` works well). `decode-revert.ts` runs
offline.
