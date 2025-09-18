import type { OpcodeGasEntry, OpcodeGasProfile } from '../types';
import type { StructLogTrace } from '../trace/structLog';

/**
 * Aggregate a struct-log trace into a per-opcode gas breakdown. Each step's
 * `gasCost` is summed by opcode; the result is sorted from most to least
 * expensive, with ties broken alphabetically for stable output.
 */
export function buildOpcodeProfile(trace: StructLogTrace): OpcodeGasProfile {
  const acc = new Map<string, { count: number; gas: bigint }>();
  let total = 0n;

  for (const log of trace.structLogs) {
    const op = log.op.toUpperCase();
    const cost = BigInt(log.gasCost ?? 0);
    const current = acc.get(op) ?? { count: 0, gas: 0n };
    current.count += 1;
    current.gas += cost;
    acc.set(op, current);
    total += cost;
  }

  const byOpcode: OpcodeGasEntry[] = [...acc.entries()]
    .map(([op, value]) => ({ op, count: value.count, gas: value.gas }))
    .sort((a, b) => {
      if (a.gas !== b.gas) return a.gas > b.gas ? -1 : 1;
      return a.op.localeCompare(b.op);
    });

  return { total, byOpcode };
}
