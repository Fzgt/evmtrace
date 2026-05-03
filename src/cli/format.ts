import { foldStacks } from '../format/flamegraph';
import { formatReport } from '../format/report';
import type { TraceResult } from '../types';

/** `JSON.stringify` replacer that serialises bigints as decimal strings. */
export function jsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}

/** Serialise a trace result to pretty JSON (bigints become strings). */
export function serializeResult(result: TraceResult): string {
  return JSON.stringify(result, jsonReplacer, 2);
}

/** Options controlling CLI text output. */
export interface CliOutputOptions {
  flamegraph?: boolean;
  color?: boolean;
}

/** Render a trace result to the text form requested on the command line. */
export function renderResult(result: TraceResult, options: CliOutputOptions = {}): string {
  if (options.flamegraph) return foldStacks(result.root);
  return formatReport(result, { color: options.color });
}
