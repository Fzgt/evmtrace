# evmtrace

Trace and gas-profile EVM transactions from Node or the command line.

`evmtrace` replays a transaction with `debug_traceTransaction`, rebuilds the
call tree, decodes it with your ABIs (falling back to 4-byte lookups), and shows
exactly where the gas went — a flamegraph-style view, a per-opcode breakdown,
storage accesses, and decoded revert reasons.

## Features

- **Call-tree decoding** — nested `CALL`/`DELEGATECALL`/`STATICCALL`/`CREATE`
  frames, named and argument-decoded from your ABIs.
- **Gas attribution** — self vs. cumulative gas per frame, plus a per-opcode
  profile and a category roll-up reconstructed from struct logs.
- **Flamegraph output** — a text icicle, or Brendan Gregg "folded stacks" you
  can pipe into `flamegraph.pl` / speedscope.
- **Revert surfacing** — decodes `Error(string)`, `Panic(uint256)`, and custom
  errors from an ABI.
- **Storage access** — the slots each contract read and wrote.
- **Programmatic API + CLI** — use it as a library or as `evmtrace trace …`.

## Install

```bash
pnpm add evmtrace
# or: npm install evmtrace
```

Requires Node 20+ and a node that exposes `debug_traceTransaction` — geth, reth,
or a local [anvil](https://book.getfoundry.sh/anvil/).

## CLI

```bash
evmtrace trace 0x<txhash> \
  --rpc http://127.0.0.1:8545 \
  --abi ./abis/MyToken.json \
  --struct-logs
```

```
Transaction: 0x<txhash>
Status:      success
Gas used:    52,048

Call tree
CALL 0x5fbd…0aa3 transfer(address,uint256)  [gas 52,048, self 49,548]
└─ STATICCALL 0x7099…79c8 balanceOf(address)  [gas 2,500, self 2,500]

Gas by opcode
  SSTORE            22,100   ×1
  SLOAD              2,100   ×1
```

Useful flags: `--json` (machine-readable, bigints as strings), `--flamegraph`
(folded stacks), `--no-color`. ABI files may be bare arrays or
Hardhat/Foundry artifacts.

## Programmatic API

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

Already have a trace object? `analyzeCallFrame(frame, { abis })` decodes a raw
`callTracer` frame with no network access — handy in tests.

## Documentation

- [Architecture](docs/architecture.md) — how a trace flows through the pipeline.
- [Usage guide](docs/usage.md) — recipes for the CLI and the API.
- [API reference](docs/api-reference.md) — the exported surface.
- [Design notes](docs/design-notes.md) — trade-offs and known limitations.

## License

[MIT](LICENSE) © Chris Sun
