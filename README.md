# evmtrace

Trace and gas-profile EVM transactions from Node or the command line.

`evmtrace` replays a transaction with `debug_traceTransaction`, rebuilds the
call tree, decodes it with your ABIs (falling back to 4-byte lookups), and shows
exactly where the gas went — including a flamegraph-style view, per-opcode
breakdown, storage accesses, and decoded revert reasons.

## Features

- **Call-tree decoding** — nested `CALL`/`DELEGATECALL`/`STATICCALL`/`CREATE`
  frames, named and argument-decoded from your ABIs.
- **Gas attribution** — self vs. cumulative gas per frame, plus a per-opcode
  profile reconstructed from struct logs.
- **Flamegraph output** — a text icicle, or Brendan Gregg "folded stacks" you
  can pipe into `flamegraph.pl` / speedscope.
- **Revert surfacing** — decodes `Error(string)`, `Panic(uint256)`, and custom
  errors from an ABI.
- **Storage access** — the slots each contract read and wrote.
- **Programmatic API + CLI** — use it as a library or as `evmtrace trace …`.

## Quick start

```ts
import { traceTransaction, formatReport } from 'evmtrace';
import { parseAbi } from 'viem';

const result = await traceTransaction('0x…txhash', {
  rpcUrl: 'http://127.0.0.1:8545',
  abis: [parseAbi(['function transfer(address,uint256) returns (bool)'])],
  structLogs: true,
});

console.log(formatReport(result));
```

Works against any node that exposes `debug_traceTransaction` — geth, reth, or a
local [anvil](https://book.getfoundry.sh/anvil/) node.

## Status

Early days — the API may still shift before `1.0`.
