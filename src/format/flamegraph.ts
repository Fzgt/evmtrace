import type { CallNode } from '../types';
import { formatGas } from './tree';

function frameKey(node: CallNode): string {
  const fn = node.functionName ?? node.selector;
  const target =
    node.to ?? (node.type === 'CREATE' || node.type === 'CREATE2' ? 'create' : 'unknown');
  return `${node.type}:${fn ?? target}`;
}

/**
 * Emit Brendan Gregg's "folded stacks" format, weighted by each frame's self
 * gas. Pipe the output into `flamegraph.pl` or speedscope to get an interactive
 * gas flamegraph.
 */
export function foldStacks(root: CallNode): string {
  const lines: string[] = [];
  const walk = (node: CallNode, path: string[]): void => {
    const stack = [...path, frameKey(node)];
    const self = node.gasSelf ?? node.gasUsed;
    lines.push(`${stack.join(';')} ${self.toString()}`);
    for (const child of node.calls) walk(child, stack);
  };
  walk(root, []);
  return lines.join('\n');
}

/** Options for {@link renderFlamegraph}. */
export interface FlamegraphOptions {
  /** Width, in characters, of a frame that used the whole transaction's gas. */
  width?: number;
}

/**
 * Render a text "icicle": each frame is a bar whose width is proportional to the
 * gas it (and its children) used, indented by call depth.
 */
export function renderFlamegraph(root: CallNode, options: FlamegraphOptions = {}): string {
  const width = options.width ?? 48;
  const total = root.gasUsed > 0n ? root.gasUsed : 1n;
  const lines: string[] = [];
  const walk = (node: CallNode, depth: number): void => {
    const fraction = Number(node.gasUsed) / Number(total);
    const barLength = Math.max(1, Math.round(width * fraction));
    const bar = '█'.repeat(barLength);
    lines.push(`${'  '.repeat(depth)}${bar} ${frameKey(node)} ${formatGas(node.gasUsed)}`);
    for (const child of node.calls) walk(child, depth + 1);
  };
  walk(root, 0);
  return lines.join('\n');
}
