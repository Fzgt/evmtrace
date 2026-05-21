# Architecture

evmtrace is a small pipeline. Each stage is a pure function over plain data, so
you can run the whole thing or just the piece you need.

```
                         debug_traceTransaction
                                   │
            ┌──────────────────────┴───────────────────────┐
            │ callTracer frame                struct logs   │
            ▼                                               ▼
     buildCallTree                                 buildOpcodeProfile
            │                                       extractStorageAccesses
     attributeGas  (self vs. cumulative gas)                │
            │                                               │
     decodeCallTree  (ABI + selector registry)              │
            │                                               │
            └───────────────────┬───────────────────────────┘
                                 ▼
                            TraceResult
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                   ▼
       renderCallTree      renderFlamegraph      formatReport
                            / foldStacks
```

## Stages

1. **Fetch** (`src/rpc/client.ts`). A thin viem wrapper exposes
   `request(method, params)`. The tracer asks for a `callTracer` frame and,
   optionally, a struct-log trace. The interface makes it trivial to swap in a
   fixture-backed client for tests.

2. **Build** (`src/trace/`). `buildCallTree` normalises a `callTracer` frame into
   a `CallNode` tree (hex → bigint, addresses lower-cased, selectors tagged).
   `reconstructCallTree` does the same from struct logs by following depth
   changes and call-opcode targets.

3. **Attribute** (`src/gas/`). `attributeGas` fills in `gasSelf` for every node.
   `buildOpcodeProfile` aggregates per-opcode gas from struct logs, and
   `summarizeByCategory` rolls those into families.

4. **Decode** (`src/decode/`). `decodeCallTree` names each frame and decodes its
   arguments from the supplied ABIs, falling back to the `SelectorRegistry`
   (and, if you wire it up, the 4byte directory). `decodeRevert` turns revert
   payloads into human strings.

5. **Render** (`src/format/`). `renderCallTree`, `renderFlamegraph`/`foldStacks`,
   and `formatReport` turn a `TraceResult` into text.

## Why plain data

Every stage takes and returns serialisable values (`CallNode`, `TraceResult`),
never a live client. That keeps the core testable against JSON fixtures and lets
callers stop at whatever stage they need — for example, decoding a call tree they
already fetched, or rendering one they built themselves.
