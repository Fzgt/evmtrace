/**
 * evmtrace — trace and gas-profile EVM transactions.
 *
 * @packageDocumentation
 */

export const VERSION = '0.0.0';

export type { Address, Hex } from './hex';
export { asHex, byteLength, getSelector, isHex, shortHex, toBigInt, wordToAddress } from './hex';

export type {
  CallNode,
  CallType,
  DecodedArg,
  OpcodeGasEntry,
  OpcodeGasProfile,
  StorageAccess,
  TraceResult,
} from './types';

export { DecodeError, EvmTraceError, RpcError, TraceNotFoundError } from './errors';

export type { OpcodeCategory } from './gas/opcodes';
export { CALL_OPCODES, CREATE_OPCODES, opcodeCategory, STORAGE_OPCODES } from './gas/opcodes';

export { ACCESS_COST, GAS_TIER, staticGasCost } from './gas/costs';

export type { SelectorEntry } from './decode/selectors';
export { SelectorRegistry } from './decode/selectors';

export type { RawCallFrame } from './trace/callTracer';
export { isRawCallFrame } from './trace/callTracer';

export type { StructLog, StructLogTrace } from './trace/structLog';
export { isStructLogTrace } from './trace/structLog';

export type { TraceClient, TraceClientOptions } from './rpc/client';
