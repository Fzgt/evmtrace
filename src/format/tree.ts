import { createColors } from 'picocolors';

import { shortHex } from '../hex';
import type { CallNode } from '../types';

/** Format a gas amount with thousands separators, e.g. `52,048`. */
export function formatGas(value: bigint): string {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return negative ? `-${digits}` : digits;
}

/** Options for {@link renderCallTree}. */
export interface RenderOptions {
  /** Emit ANSI colours (default `false` for stable, pipe-friendly output). */
  color?: boolean;
  /** Append a `[gas …]` annotation to each frame (default `true`). */
  showGas?: boolean;
}

function targetLabel(node: CallNode): string {
  if (node.to) return shortHex(node.to);
  return node.type === 'CREATE' || node.type === 'CREATE2' ? '(create)' : '(none)';
}

function functionLabel(node: CallNode): string {
  return node.functionSignature ?? node.functionName ?? node.selector ?? '';
}

/**
 * Render a call tree as indented, box-drawing text — the default human view.
 * Each line shows the frame type, target address, decoded function (when known),
 * and its gas.
 */
export function renderCallTree(root: CallNode, options: RenderOptions = {}): string {
  const showGas = options.showGas ?? true;
  const c = createColors(options.color ?? false);
  const lines: string[] = [];

  const walk = (node: CallNode, prefix: string, isLast: boolean, isRoot: boolean): void => {
    const connector = isRoot ? '' : isLast ? '└─ ' : '├─ ';
    const fn = functionLabel(node);
    const head = `${c.cyan(node.type)} ${targetLabel(node)}` + (fn ? ` ${c.yellow(fn)}` : '');
    const self = node.gasSelf !== undefined ? `, self ${formatGas(node.gasSelf)}` : '';
    const gas = showGas ? c.dim(`  [gas ${formatGas(node.gasUsed)}${self}]`) : '';
    const err = node.error ? c.red(`  !! ${node.revertReason ?? node.error}`) : '';
    lines.push(`${prefix}${connector}${head}${gas}${err}`);

    const childPrefix = isRoot ? '' : `${prefix}${isLast ? '   ' : '│  '}`;
    node.calls.forEach((child, index) =>
      walk(child, childPrefix, index === node.calls.length - 1, false),
    );
  };

  walk(root, '', true, true);
  return lines.join('\n');
}
