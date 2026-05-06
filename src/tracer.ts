import type { Abi } from 'viem';

import { attributeGas } from './gas/attribute';
import { buildOpcodeProfile } from './gas/opcodeProfile';
import { decodeCallData } from './decode/abi';
import { decodeRevert } from './decode/revert';
import { SelectorRegistry } from './decode/selectors';
import { EvmTraceError } from './errors';
import type { Hex } from './hex';
import { createTraceClient, type TraceClient } from './rpc/client';
import { extractStorageAccesses } from './storage/access';
import { buildCallTree } from './trace/buildTree';
import type { RawCallFrame } from './trace/callTracer';
import type { StructLogTrace } from './trace/structLog';
import type { CallNode, TraceResult } from './types';

/** Inputs for {@link analyzeCallFrame}. */
export interface AnalyzeOptions {
  /** ABIs used to name calls and decode arguments and custom errors. */
  abis?: Abi[];
  /** Transaction hash to record on the result. */
  txHash?: Hex;
  /** Struct-log trace, enabling the opcode profile and storage summary. */
  structLogs?: StructLogTrace;
}

/**
 * Annotate a call tree in place: name each frame and decode its arguments from
 * the ABIs, fall back to the selector registry, and decode revert reasons.
 */
export function decodeCallTree(root: CallNode, abi: Abi, registry: SelectorRegistry): void {
  const visit = (node: CallNode): void => {
    if (node.selector) {
      const decoded = abi.length > 0 ? decodeCallData(node.input, abi) : null;
      if (decoded) {
        node.functionName = decoded.name;
        node.functionSignature = decoded.signature;
        node.decodedInputs = decoded.args;
      } else {
        const entry = registry.get(node.selector);
        if (entry) {
          node.functionName = entry.name;
          node.functionSignature = entry.signature;
        }
      }
    }
    if (node.error && !node.revertReason) {
      node.revertReason = decodeRevert(node.output, { abi }).message;
    }
    node.calls.forEach(visit);
  };
  visit(root);
}

/** Flatten several ABIs into one, as viem's decoders expect a single ABI. */
function mergeAbis(abis: Abi[]): Abi {
  return abis.flat() as Abi;
}

/**
 * Turn a raw `callTracer` frame into a fully decoded {@link TraceResult}: build
 * the tree, attribute gas, decode calls and reverts, and — when struct logs are
 * supplied — add an opcode profile and storage-access summary. Pure: no I/O.
 */
export function analyzeCallFrame(frame: RawCallFrame, options: AnalyzeOptions = {}): TraceResult {
  const abis = options.abis ?? [];
  const abi = mergeAbis(abis);
  const registry = SelectorRegistry.fromAbi(...abis);

  const root = attributeGas(buildCallTree(frame));
  decodeCallTree(root, abi, registry);

  const result: TraceResult = {
    txHash: options.txHash,
    root,
    gasUsed: root.gasUsed,
    failed: Boolean(root.error),
    returnValue: root.output,
  };

  if (options.structLogs) {
    result.opcodeProfile = buildOpcodeProfile(options.structLogs);
    if (root.to) {
      result.storageAccesses = extractStorageAccesses(options.structLogs, root.to);
    }
  }

  return result;
}

/** Options for {@link traceTransaction}. */
export interface TraceOptions {
  /** JSON-RPC endpoint; required unless a `client` is supplied. */
  rpcUrl?: string;
  /** A pre-built client (e.g. for tests); takes precedence over `rpcUrl`. */
  client?: TraceClient;
  /** ABIs used to decode calls, arguments, and custom errors. */
  abis?: Abi[];
  /** Also fetch a struct-log trace for opcode-level gas and storage access. */
  structLogs?: boolean;
}

/**
 * Fetch and analyse a transaction by hash. Retrieves the `callTracer` frame
 * (and, optionally, a struct-log trace) over JSON-RPC, then decodes everything.
 */
export async function traceTransaction(txHash: Hex, options: TraceOptions): Promise<TraceResult> {
  const client = options.client ?? resolveClient(options);
  const frame = (await client.request('debug_traceTransaction', [
    txHash,
    { tracer: 'callTracer' },
  ])) as RawCallFrame;

  let structLogs: StructLogTrace | undefined;
  if (options.structLogs) {
    structLogs = (await client.request('debug_traceTransaction', [
      txHash,
      { enableMemory: false, disableStack: false, disableStorage: false },
    ])) as StructLogTrace;
  }

  return analyzeCallFrame(frame, { abis: options.abis, txHash, structLogs });
}

function resolveClient(options: TraceOptions): TraceClient {
  if (!options.rpcUrl) {
    throw new EvmTraceError('traceTransaction requires either `client` or `rpcUrl`');
  }
  return createTraceClient({ rpcUrl: options.rpcUrl });
}
