/**
 * Types for the default struct-log tracer (`debug_traceTransaction` with no
 * tracer). Each entry is one executed opcode; `stack` words are 32-byte hex
 * strings, conventionally without a `0x` prefix.
 */

export interface StructLog {
  pc: number;
  op: string;
  gas: number;
  gasCost: number;
  depth: number;
  stack?: string[];
  memory?: string[];
  storage?: Record<string, string>;
  error?: string;
}

export interface StructLogTrace {
  gas: number;
  failed: boolean;
  returnValue: string;
  structLogs: StructLog[];
}

/** Narrow an arbitrary value to a {@link StructLogTrace} shape. */
export function isStructLogTrace(value: unknown): value is StructLogTrace {
  if (typeof value !== 'object' || value === null) return false;
  return Array.isArray((value as { structLogs?: unknown }).structLogs);
}
