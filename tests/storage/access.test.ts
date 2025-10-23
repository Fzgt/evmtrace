import { describe, expect, it } from 'vitest';

import { extractStorageAccesses } from '../../src/storage/access';
import type { StructLogTrace } from '../../src/trace/structLog';

const AA = '0x00000000000000000000000000000000000000aa' as const;
const BB = '0x00000000000000000000000000000000000000bb' as const;
const BB_WORD = '00000000000000000000000000000000000000000000000000000000000000bb';
const GAS_WORD = '0000000000000000000000000000000000000000000000000000000000002710';

const trace: StructLogTrace = {
  gas: 0,
  failed: false,
  returnValue: '',
  structLogs: [
    { pc: 0, op: 'SLOAD', gas: 0, gasCost: 2100, depth: 1, stack: ['0x1'] },
    { pc: 1, op: 'SSTORE', gas: 0, gasCost: 20000, depth: 1, stack: ['0x5', '0x2'] },
    { pc: 2, op: 'CALL', gas: 0, gasCost: 100, depth: 1, stack: [BB_WORD, GAS_WORD] },
    { pc: 3, op: 'SLOAD', gas: 0, gasCost: 2100, depth: 2, stack: ['0x1'] },
    { pc: 4, op: 'STOP', gas: 0, gasCost: 0, depth: 2, stack: [] },
    { pc: 5, op: 'STOP', gas: 0, gasCost: 0, depth: 1, stack: [] },
  ],
};

describe('extractStorageAccesses', () => {
  const accesses = extractStorageAccesses(trace, AA);
  const find = (address: string, slot: string) =>
    accesses.find((a) => a.address === address && a.slot === slot);

  it('records a read in the root context', () => {
    expect(find(AA, '0x1')).toMatchObject({ reads: 1, writes: 0 });
  });

  it('records a write with its last value', () => {
    expect(find(AA, '0x2')).toMatchObject({ reads: 0, writes: 1, lastValue: '0x5' });
  });

  it('attributes callee storage to the callee address', () => {
    expect(find(BB, '0x1')).toMatchObject({ reads: 1, writes: 0 });
  });

  it('produces one entry per (address, slot)', () => {
    expect(accesses).toHaveLength(3);
  });
});
