import { wordToAddress, wordToBigInt, type Address, type Hex } from '../hex';
import { CALL_OPCODES } from '../gas/opcodes';
import type { StructLogTrace } from '../trace/structLog';
import type { StorageAccess } from '../types';

function normalizeWord(word: string | undefined): Hex | null {
  if (word === undefined) return null;
  return `0x${wordToBigInt(word).toString(16)}`;
}

/**
 * Walk a struct-log trace and collect the storage slots each contract touched.
 *
 * The executing contract is tracked with a context stack: `CALL`/`STATICCALL`
 * switch the storage context to the callee, while `DELEGATECALL`/`CALLCODE`
 * keep the caller's, matching how the EVM scopes storage. `rootAddress` seeds
 * the context because struct logs do not record the transaction target.
 */
export function extractStorageAccesses(
  trace: StructLogTrace,
  rootAddress: Address,
): StorageAccess[] {
  const accesses = new Map<string, StorageAccess>();
  const context: Address[] = [rootAddress];
  let pendingContext: Address | null = null;
  let prevDepth = trace.structLogs[0]?.depth ?? 1;

  for (const log of trace.structLogs) {
    if (log.depth > prevDepth) {
      context.push(pendingContext ?? context[context.length - 1]!);
      pendingContext = null;
    } else if (log.depth < prevDepth) {
      for (let i = 0; i < prevDepth - log.depth && context.length > 1; i += 1) {
        context.pop();
      }
    }
    prevDepth = log.depth;

    const op = log.op.toUpperCase();
    const address = context[context.length - 1]!;
    const stack = log.stack ?? [];

    if (op === 'SLOAD' || op === 'SSTORE') {
      const slot = normalizeWord(stack[stack.length - 1]);
      if (slot) {
        const key = `${address}:${slot}`;
        const entry = accesses.get(key) ?? { address, slot, reads: 0, writes: 0 };
        if (op === 'SLOAD') {
          entry.reads += 1;
        } else {
          entry.writes += 1;
          const value = normalizeWord(stack[stack.length - 2]);
          if (value) entry.lastValue = value;
        }
        accesses.set(key, entry);
      }
    }

    if (CALL_OPCODES.has(op)) {
      const target = stack.length >= 2 ? wordToAddress(stack[stack.length - 2]!) : null;
      pendingContext = op === 'DELEGATECALL' || op === 'CALLCODE' ? address : (target ?? address);
    }
  }

  return [...accesses.values()];
}
