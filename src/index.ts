/**
 * evmtrace — trace and gas-profile EVM transactions.
 *
 * @packageDocumentation
 */

export const VERSION = '0.0.0';

// ---- primitives ----
export type { Address, Hex } from './hex';
export { asHex, byteLength, getSelector, isHex, shortHex, toBigInt, wordToAddress } from './hex';
export { DecodeError, EvmTraceError, RpcError, TraceNotFoundError } from './errors';
export type {
  CallNode,
  CallType,
  DecodedArg,
  OpcodeGasEntry,
  OpcodeGasProfile,
  StorageAccess,
  TraceResult,
} from './types';

// ---- traces ----
export type { RawCallFrame } from './trace/callTracer';
export { isRawCallFrame } from './trace/callTracer';
export type { StructLog, StructLogTrace } from './trace/structLog';
export { isStructLogTrace } from './trace/structLog';
export { buildCallTree, flattenCalls, normalizeCallType, walkCallTree } from './trace/buildTree';
export type { RootContext } from './trace/fromStructLogs';
export { opensFrame, reconstructCallTree } from './trace/fromStructLogs';

// ---- gas ----
export type { OpcodeCategory } from './gas/opcodes';
export { CALL_OPCODES, CREATE_OPCODES, opcodeCategory, STORAGE_OPCODES } from './gas/opcodes';
export { ACCESS_COST, GAS_TIER, staticGasCost } from './gas/costs';
export { attributeGas } from './gas/attribute';
export { buildOpcodeProfile } from './gas/opcodeProfile';

// ---- decode ----
export type { SelectorEntry } from './decode/selectors';
export { computeSelector, SelectorRegistry } from './decode/selectors';
export type { DecodedCall } from './decode/abi';
export { decodeCallData, resolveSelectorName } from './decode/abi';
export type { DecodeRevertOptions, RevertReason } from './decode/revert';
export { decodeRevert, ERROR_SELECTOR, PANIC_SELECTOR } from './decode/revert';
export type { FetchLike, FourByteOptions, FourByteSignature } from './decode/fourbyte';
export { FourByteClient } from './decode/fourbyte';

// ---- storage ----
export { extractStorageAccesses } from './storage/access';

// ---- rendering ----
export type { RenderOptions } from './render/tree';
export { formatGas, renderCallTree } from './render/tree';
export type { FlamegraphOptions } from './render/flamegraph';
export { foldStacks, renderFlamegraph } from './render/flamegraph';
export type { ReportOptions } from './render/report';
export { formatReport } from './render/report';

// ---- rpc + orchestration ----
export type { TraceClient, TraceClientOptions } from './rpc/client';
export { createTraceClient } from './rpc/client';
export type { AnalyzeOptions, TraceOptions } from './tracer';
export { analyzeCallFrame, decodeCallTree, traceTransaction } from './tracer';
