# API reference

Everything below is exported from the package root (`import { … } from 'evmtrace'`).

## Orchestration

### `traceTransaction(txHash, options): Promise<TraceResult>`

Fetch and fully decode a transaction.

- `options.rpcUrl` — endpoint (required unless `options.client` is given).
- `options.client` — a `TraceClient` to use instead of `rpcUrl`.
- `options.abis` — `Abi[]` used to decode calls, arguments, and custom errors.
- `options.structLogs` — also fetch a struct-log trace for `opcodeProfile` and
  `storageAccesses`.

### `analyzeCallFrame(frame, options?): TraceResult`

Decode a raw `callTracer` frame with no I/O. `options` accepts `abis`, `txHash`,
and a `structLogs` trace.

### `decodeCallTree(root, abi, registry): void`

Annotate a `CallNode` tree in place with function names, decoded arguments, and
revert reasons.

## Traces & gas

- `buildCallTree(frame, depth?)` → `CallNode`
- `reconstructCallTree(trace, context)` → `CallNode` (from struct logs)
- `walkCallTree(root, visit)` / `flattenCalls(root)` — traversal helpers
- `attributeGas(root)` — fill in `gasSelf`
- `buildOpcodeProfile(trace)` → `OpcodeGasProfile`
- `summarizeByCategory(profile)` → `CategoryGasEntry[]`

## Decoding

- `decodeCallData(input, abi)` → `DecodedCall | null`
- `resolveSelectorName(input, registry)` → `SelectorEntry | undefined`
- `decodeRevert(data, options?)` → `RevertReason`
- `computeSelector(signature)` → `Hex`
- `SelectorRegistry` — `add`, `get`, `has`, `addAbi`, `size`, `SelectorRegistry.fromAbi(...)`
- `FourByteClient` — `lookup(selector)` against the 4byte directory

## Storage

- `extractStorageAccesses(trace, rootAddress)` → `StorageAccess[]`

## Rendering

- `formatReport(result, options?)` → `string`
- `renderCallTree(root, options?)` → `string`
- `renderFlamegraph(root, options?)` → `string`
- `foldStacks(root)` → `string`
- `formatGas(value)` → `string`

## Types

`CallNode`, `CallType`, `DecodedArg`, `TraceResult`, `OpcodeGasProfile`,
`OpcodeGasEntry`, `CategoryGasEntry`, `StorageAccess`, `RevertReason`,
`DecodedCall`, `SelectorEntry`, `RawCallFrame`, `StructLog`, `StructLogTrace`,
`TraceClient`, `Hex`, `Address`.

## Errors

`EvmTraceError` (base), `RpcError`, `DecodeError`, `TraceNotFoundError`.
