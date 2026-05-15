# Design notes

A few decisions worth writing down, along with the sharp edges.

## Two tracers, two jobs

`callTracer` gives a clean, nested view of message calls and is the primary
source for the call tree. Struct logs are noisier and heavier, but they are the
only way to get per-opcode gas and storage access, so they are opt-in
(`structLogs: true`). Where both are available the tree comes from `callTracer`
and the opcode/storage data comes from the struct logs.

## Gas attribution

`gasUsed` on a frame is cumulative (it includes children). `attributeGas`
derives `gasSelf = gasUsed − Σ children.gasUsed`. Some traces report a parent
whose children sum to slightly more than the parent (reordered or synthetic
frames), so self gas is clamped at zero rather than going negative.

## Struct-log call reconstruction is approximate

`reconstructCallTree` follows depth changes and reads the `to`/`gas` arguments
off each call opcode's stack. It is good enough for gas accounting, but it does
not perfectly model `DELEGATECALL`/`CALLCODE`: those keep the caller's storage
context, so the `from` reported for such frames is the executing address, not
the original `msg.sender`. When a `callTracer` frame is available, prefer it.

## Storage context tracking

`extractStorageAccesses` keeps a stack of storage-context addresses.
`CALL`/`STATICCALL` push the callee; `DELEGATECALL`/`CALLCODE` re-push the
caller, which is what the EVM does. The transaction target has to be supplied
because struct logs never carry it.

## Selector resolution order

When decoding a call we try, in order: full ABI decode (name **and**
arguments), then the `SelectorRegistry` (name only). The 4byte directory client
is deliberately separate and injectable — it makes a network call, so callers
opt into it rather than having every trace hit an external service.

## Decimals and bigints

Every on-chain quantity is a `bigint`. The CLI's `--json` mode serialises them
as decimal strings (JSON has no bigint), which is the one place the type is
lossy on the wire.
