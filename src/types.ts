import type { Address, Hex } from './hex';

/**
 * The kinds of frame the EVM can push. `CALL`/`STATICCALL`/`DELEGATECALL`/
 * `CALLCODE` are message calls; `CREATE`/`CREATE2` deploy code; `SELFDESTRUCT`
 * appears as a leaf when a contract removes itself.
 */
export type CallType =
  'CALL' | 'STATICCALL' | 'DELEGATECALL' | 'CALLCODE' | 'CREATE' | 'CREATE2' | 'SELFDESTRUCT';

/** A single decoded argument, as produced when an ABI match is available. */
export interface DecodedArg {
  readonly name?: string;
  readonly type: string;
  readonly value: unknown;
}

/**
 * A node in the decoded call tree. Raw RPC fields (`gas`, `value`, …) are
 * normalised to `bigint`; decoding and gas attribution add the optional fields.
 */
export interface CallNode {
  type: CallType;
  from: Address;
  to: Address | null;
  value: bigint;
  /** Gas supplied to the frame. */
  gas: bigint;
  /** Gas consumed by the frame, including everything it called. */
  gasUsed: bigint;
  /** Gas consumed by this frame alone; filled in by {@link attributeGas}. */
  gasSelf?: bigint;
  input: Hex;
  output: Hex;
  /** Low-level failure such as `execution reverted` or `out of gas`. */
  error?: string;
  /** Human-readable revert reason, when one could be decoded. */
  revertReason?: string;
  depth: number;
  calls: CallNode[];
  // ---- decode annotations ----
  selector?: Hex;
  functionName?: string;
  functionSignature?: string;
  decodedInputs?: DecodedArg[];
}

/** One opcode's contribution to the gas total, aggregated over a trace. */
export interface OpcodeGasEntry {
  op: string;
  count: number;
  gas: bigint;
}

/** Opcode-level gas breakdown, sorted from most to least expensive. */
export interface OpcodeGasProfile {
  total: bigint;
  byOpcode: OpcodeGasEntry[];
}

/** Reads and writes observed against a single (address, slot) pair. */
export interface StorageAccess {
  address: Address;
  slot: Hex;
  reads: number;
  writes: number;
  /** Last value seen written to the slot, if any. */
  lastValue?: Hex;
}

/** The full result of tracing a transaction. */
export interface TraceResult {
  txHash?: Hex;
  root: CallNode;
  gasUsed: bigint;
  failed: boolean;
  returnValue?: Hex;
  opcodeProfile?: OpcodeGasProfile;
  storageAccesses?: StorageAccess[];
}
