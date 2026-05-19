import { shortHex } from '../hex';
import type { TraceResult } from '../types';
import { formatGas, renderCallTree, type RenderOptions } from './tree';

/** Options for {@link formatReport}. */
export interface ReportOptions extends RenderOptions {
  /** Cap the opcode gas table to this many rows (default `10`). */
  maxOpcodes?: number;
}

/**
 * Assemble the full text report for a trace: a header, the call tree, an
 * optional opcode gas table, and an optional storage-access summary.
 */
export function formatReport(result: TraceResult, options: ReportOptions = {}): string {
  const sections: string[] = [];
  sections.push(`Transaction: ${result.txHash ?? '(unknown)'}`);
  sections.push(`Status:      ${result.failed ? 'reverted' : 'success'}`);
  sections.push(`Gas used:    ${formatGas(result.gasUsed)}`);
  if (result.failed && result.root.revertReason) {
    sections.push(`Revert:      ${result.root.revertReason}`);
  }

  sections.push('');
  sections.push('Call tree');
  sections.push(renderCallTree(result.root, options));

  const profile = result.opcodeProfile;
  if (profile && profile.byOpcode.length > 0) {
    sections.push('');
    sections.push('Gas by opcode');
    const max = options.maxOpcodes ?? 10;
    for (const entry of profile.byOpcode.slice(0, max)) {
      const op = entry.op.padEnd(12);
      const gas = formatGas(entry.gas).padStart(12);
      sections.push(`  ${op}${gas}   ×${entry.count}`);
    }
  }

  const storage = result.storageAccesses;
  if (storage && storage.length > 0) {
    sections.push('');
    sections.push('Storage access');
    for (const access of storage) {
      sections.push(
        `  ${shortHex(access.address)}  slot ${shortHex(access.slot)}  ` +
          `reads=${access.reads} writes=${access.writes}`,
      );
    }
  }

  return sections.join('\n');
}
