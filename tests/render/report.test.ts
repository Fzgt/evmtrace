import { describe, expect, it } from 'vitest';

import { attributeGas } from '../../src/gas/attribute';
import { buildOpcodeProfile } from '../../src/gas/opcodeProfile';
import { formatReport } from '../../src/render/report';
import { buildCallTree } from '../../src/trace/buildTree';
import type { RawCallFrame } from '../../src/trace/callTracer';
import type { StructLogTrace } from '../../src/trace/structLog';
import type { TraceResult } from '../../src/types';
import simpleTransfer from '../fixtures/simple-transfer.json';
import structlog from '../fixtures/structlog-basic.json';

const root = attributeGas(buildCallTree(simpleTransfer as unknown as RawCallFrame));

const result: TraceResult = {
  txHash: '0xabc',
  root,
  gasUsed: root.gasUsed,
  failed: false,
  opcodeProfile: buildOpcodeProfile(structlog as unknown as StructLogTrace),
  storageAccesses: [
    { address: '0x00000000000000000000000000000000000000aa', slot: '0x1', reads: 2, writes: 1 },
  ],
};

describe('formatReport', () => {
  const report = formatReport(result);

  it('renders the header', () => {
    expect(report).toContain('Status:      success');
    expect(report).toContain('Gas used:    52,048');
  });

  it('includes the call tree and opcode table', () => {
    expect(report).toContain('Call tree');
    expect(report).toContain('Gas by opcode');
    expect(report).toContain('SSTORE');
  });

  it('summarises storage access', () => {
    expect(report).toContain('Storage access');
    expect(report).toContain('reads=2 writes=1');
  });
});
