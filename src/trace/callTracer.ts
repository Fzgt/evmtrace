import type { Hex } from '../hex';

/**
 * A single frame as emitted by geth's / reth's `callTracer`
 * (`debug_traceTransaction` with `{ tracer: 'callTracer' }`). Numeric fields
 * arrive as hex quantities and children nest under `calls`.
 */
export interface RawCallFrame {
  type: string;
  from: Hex;
  to?: Hex;
  value?: Hex;
  gas: Hex;
  gasUsed: Hex;
  input: Hex;
  output?: Hex;
  error?: string;
  revertReason?: string;
  calls?: RawCallFrame[];
}

/** Narrow an arbitrary value to a {@link RawCallFrame} shape. */
export function isRawCallFrame(value: unknown): value is RawCallFrame {
  if (typeof value !== 'object' || value === null) return false;
  const frame = value as Record<string, unknown>;
  return typeof frame.type === 'string' && typeof frame.from === 'string';
}
