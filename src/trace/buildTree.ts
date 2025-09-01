import { getSelector, toBigInt, type Address, type Hex } from '../hex';
import type { CallNode, CallType } from '../types';
import type { RawCallFrame } from './callTracer';

const CALL_TYPES: ReadonlySet<string> = new Set<CallType>([
  'CALL',
  'STATICCALL',
  'DELEGATECALL',
  'CALLCODE',
  'CREATE',
  'CREATE2',
  'SELFDESTRUCT',
]);

/** Coerce a tracer's `type` string into a known {@link CallType}. */
export function normalizeCallType(type: string): CallType {
  const upper = type.toUpperCase();
  return (CALL_TYPES.has(upper) ? upper : 'CALL') as CallType;
}

/**
 * Turn a raw `callTracer` frame into a normalised {@link CallNode} tree.
 *
 * Hex quantities become `bigint`s, addresses are lower-cased, and each node is
 * tagged with its 4-byte selector so later passes can name it.
 */
export function buildCallTree(frame: RawCallFrame, depth = 0): CallNode {
  const input = (frame.input ?? '0x') as Hex;
  const node: CallNode = {
    type: normalizeCallType(frame.type),
    from: frame.from.toLowerCase() as Address,
    to: frame.to ? (frame.to.toLowerCase() as Address) : null,
    value: toBigInt(frame.value),
    gas: toBigInt(frame.gas),
    gasUsed: toBigInt(frame.gasUsed),
    input,
    output: (frame.output ?? '0x') as Hex,
    depth,
    calls: (frame.calls ?? []).map((child) => buildCallTree(child, depth + 1)),
  };

  if (frame.error) node.error = frame.error;
  if (frame.revertReason) node.revertReason = frame.revertReason;

  const selector = getSelector(input);
  if (selector) node.selector = selector;

  return node;
}
