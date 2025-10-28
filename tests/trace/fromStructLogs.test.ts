import { describe, expect, it } from 'vitest';

import { opensFrame, reconstructCallTree } from '../../src/trace/fromStructLogs';
import type { StructLogTrace } from '../../src/trace/structLog';

const BB_WORD = '00000000000000000000000000000000000000000000000000000000000000bb';
const GAS_WORD = '0000000000000000000000000000000000000000000000000000000000002710';

const trace: StructLogTrace = {
  gas: 20106,
  failed: false,
  returnValue: '',
  structLogs: [
    { pc: 0, op: 'PUSH1', gas: 100000, gasCost: 3, depth: 1, stack: [] },
    { pc: 2, op: 'CALL', gas: 99997, gasCost: 100, depth: 1, stack: [BB_WORD, GAS_WORD] },
    { pc: 3, op: 'PUSH1', gas: 90000, gasCost: 3, depth: 2, stack: [] },
    { pc: 5, op: 'SSTORE', gas: 89997, gasCost: 20000, depth: 2, stack: ['0x1', '0x0'] },
    { pc: 6, op: 'STOP', gas: 69997, gasCost: 0, depth: 2, stack: [] },
    { pc: 7, op: 'STOP', gas: 69997, gasCost: 0, depth: 1, stack: [] },
  ],
};

const context = {
  from: '0x00000000000000000000000000000000000000aa' as const,
  to: '0x00000000000000000000000000000000000000cc' as const,
};

describe('opensFrame', () => {
  it('detects call opcodes', () => {
    expect(opensFrame({ pc: 0, op: 'DELEGATECALL', gas: 0, gasCost: 0, depth: 1 })).toBe(true);
    expect(opensFrame({ pc: 0, op: 'ADD', gas: 0, gasCost: 0, depth: 1 })).toBe(false);
  });
});

describe('reconstructCallTree', () => {
  const root = reconstructCallTree(trace, context);

  it('creates a child frame for the CALL', () => {
    expect(root.calls).toHaveLength(1);
    const child = root.calls[0]!;
    expect(child.type).toBe('CALL');
    expect(child.to).toBe('0x00000000000000000000000000000000000000bb');
    expect(child.depth).toBe(1);
    expect(child.gas).toBe(10000n);
  });

  it('accumulates total gas per frame', () => {
    // all steps: 3 + 100 + 3 + 20000 + 0 + 0 = 20106
    expect(root.gasUsed).toBe(20106n);
    // child steps at depth 2: 3 + 20000 + 0 = 20003
    expect(root.calls[0]!.gasUsed).toBe(20003n);
  });
});
