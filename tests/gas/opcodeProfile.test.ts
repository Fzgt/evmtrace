import { describe, expect, it } from 'vitest';

import { buildOpcodeProfile } from '../../src/gas/opcodeProfile';
import type { StructLogTrace } from '../../src/trace/structLog';
import structlog from '../fixtures/structlog-basic.json';

const trace = structlog as unknown as StructLogTrace;

describe('buildOpcodeProfile', () => {
  const profile = buildOpcodeProfile(trace);

  it('sums the total gas', () => {
    // 3*3 (PUSH1) + 12 (MSTORE) + 2100 (SLOAD) + 22100 (SSTORE) + 0 (STOP)
    expect(profile.total).toBe(24221n);
  });

  it('orders opcodes by gas descending', () => {
    expect(profile.byOpcode.map((e) => e.op)).toEqual([
      'SSTORE',
      'SLOAD',
      'MSTORE',
      'PUSH1',
      'STOP',
    ]);
  });

  it('counts repeated opcodes', () => {
    const push = profile.byOpcode.find((e) => e.op === 'PUSH1')!;
    expect(push.count).toBe(3);
    expect(push.gas).toBe(9n);
  });

  it('records the most expensive opcode first', () => {
    expect(profile.byOpcode[0]).toEqual({ op: 'SSTORE', count: 1, gas: 22100n });
  });
});
