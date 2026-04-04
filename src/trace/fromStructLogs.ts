import { wordToAddress, wordToBigInt, type Address } from '../hex';
import { CALL_OPCODES, CREATE_OPCODES } from '../gas/opcodes';
import type { CallNode, CallType } from '../types';
import type { StructLog, StructLogTrace } from './structLog';

/** Context needed to seed the root frame, which struct logs do not carry. */
export interface RootContext {
  from: Address;
  to: Address;
  gas?: bigint;
}

interface PendingCall {
  type: CallType;
  to: Address | null;
  gas: bigint;
}

function emptyNode(type: CallType, from: Address, to: Address | null, depth: number): CallNode {
  return {
    type,
    from,
    to,
    value: 0n,
    gas: 0n,
    gasUsed: 0n,
    input: '0x',
    output: '0x',
    depth,
    calls: [],
  };
}

/** Read the `to` and `gas` arguments off a call opcode's stack. */
function readCallArgs(op: string, stack: string[] | undefined): PendingCall {
  const type = op.toUpperCase() as CallType;
  if (!stack || stack.length < 2) return { type, to: null, gas: 0n };
  const gasWord = stack[stack.length - 1]!;
  const toWord = stack[stack.length - 2]!;
  const gas = wordToBigInt(gasWord);
  const to = CREATE_OPCODES.has(type) ? null : wordToAddress(toWord);
  return { type, to, gas };
}

/**
 * Reconstruct an approximate call tree from a struct-log trace by following
 * depth changes and the targets of call opcodes. Per-frame `gasUsed` is the sum
 * of every step executed while that frame (or one of its children) is on the
 * stack, mirroring `callTracer` semantics.
 *
 * Note: `DELEGATECALL`/`CALLCODE` keep the caller's storage context, so the
 * reported `from` for those frames is the executing address, not msg.sender.
 */
export function reconstructCallTree(trace: StructLogTrace, context: RootContext): CallNode {
  const logs = trace.structLogs;
  const rootDepth = logs[0]?.depth ?? 1;
  const root = emptyNode('CALL', context.from, context.to, 0);
  root.gas = context.gas ?? 0n;

  const stack: CallNode[] = [root];
  const depthOf = new Map<CallNode, number>([[root, rootDepth]]);
  let pending: PendingCall | null = null;

  for (const log of logs) {
    const op = log.op.toUpperCase();
    const cost = BigInt(log.gasCost ?? 0);

    // Leave frames we have returned from.
    while (stack.length > 1 && log.depth < depthOf.get(stack[stack.length - 1]!)!) {
      stack.pop();
    }

    // Enter a frame opened by the previous call opcode.
    if (log.depth > depthOf.get(stack[stack.length - 1]!)!) {
      const parent = stack[stack.length - 1]!;
      const info: PendingCall = pending ?? { type: 'CALL', to: null, gas: 0n };
      const child = emptyNode(info.type, parent.to ?? context.from, info.to, parent.depth + 1);
      child.gas = info.gas;
      parent.calls.push(child);
      stack.push(child);
      depthOf.set(child, log.depth);
      pending = null;
    }

    for (const frame of stack) {
      frame.gasUsed += cost;
    }

    if (CALL_OPCODES.has(op) || CREATE_OPCODES.has(op)) {
      pending = readCallArgs(op, log.stack);
    }
  }

  return root;
}

/** Whether a struct log opens a new frame — exported for reuse and testing. */
export function opensFrame(log: StructLog): boolean {
  const op = log.op.toUpperCase();
  return CALL_OPCODES.has(op) || CREATE_OPCODES.has(op);
}
