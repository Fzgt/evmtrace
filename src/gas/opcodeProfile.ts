import type { OpcodeGasEntry, OpcodeGasProfile } from '../types';
import type { StructLogTrace } from '../trace/structLog';
import { opcodeCategory, type OpcodeCategory } from './opcodes';

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

/** Gas and opcode count rolled up into one opcode family. */
export interface CategoryGasEntry {
  category: OpcodeCategory;
  gas: bigint;
  count: number;
}

/**
 * Roll an opcode profile up into coarse families (storage, memory, call, …),
 * sorted from most to least gas. Handy for a one-line "where did it go" summary.
 */
export function summarizeByCategory(profile: OpcodeGasProfile): CategoryGasEntry[] {
  const acc = new Map<OpcodeCategory, { gas: bigint; count: number }>();
  for (const entry of profile.byOpcode) {
    const category = opcodeCategory(entry.op);
    const current = acc.get(category) ?? { gas: 0n, count: 0 };
    current.gas += entry.gas;
    current.count += entry.count;
    acc.set(category, current);
  }
  return [...acc.entries()]
    .map(([category, value]) => ({ category, gas: value.gas, count: value.count }))
    .sort((a, b) => {
      if (a.gas !== b.gas) return a.gas > b.gas ? -1 : 1;
      return a.category.localeCompare(b.category);
    });
}
