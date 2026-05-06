# Usage

## CLI

```bash
evmtrace trace <txHash> --rpc <url> [options]
```

| Option              | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `-r, --rpc <url>`   | JSON-RPC endpoint exposing `debug_traceTransaction`.  |
| `-a, --abi <path…>` | ABI JSON file(s); bare arrays or artifacts both work. |
| `-s, --struct-logs` | Also profile opcodes and storage via struct logs.     |
| `--flamegraph`      | Print folded flamegraph stacks instead of a report.   |
| `--json`            | Emit JSON (bigints serialised as strings).            |
| `--no-color`        | Disable ANSI colours.                                 |

### Recipes

Trace against a local anvil node with a decoded ABI:

```bash
evmtrace trace 0xabc… --rpc http://127.0.0.1:8545 --abi ./out/Token.sol/Token.json
```

Produce a flamegraph SVG (needs [FlameGraph](https://github.com/brendangregg/FlameGraph)):

```bash
evmtrace trace 0xabc… --rpc $RPC --flamegraph | flamegraph.pl > trace.svg
```

Pull one field out of the JSON with `jq`:

```bash
evmtrace trace 0xabc… --rpc $RPC --json | jq '.gasUsed'
```

## API

### Trace over RPC

```ts
import { traceTransaction } from 'evmtrace';

const result = await traceTransaction(txHash, {
  rpcUrl: 'http://127.0.0.1:8545',
  abis: [myAbi],
  structLogs: true, // enables opcodeProfile + storageAccesses
});
```

### Analyse a trace you already have

```ts
import { analyzeCallFrame } from 'evmtrace';

const result = analyzeCallFrame(callTracerFrame, { abis: [myAbi] });
```

### Render

```ts
import { formatReport, renderCallTree, foldStacks } from 'evmtrace';

formatReport(result); // full text report
renderCallTree(result.root, { color: true }); // just the tree
foldStacks(result.root); // folded flamegraph stacks
```

### Decode a revert on its own

```ts
import { decodeRevert } from 'evmtrace';

decodeRevert('0x08c379a0…', { abi: myAbi }).message;
```
