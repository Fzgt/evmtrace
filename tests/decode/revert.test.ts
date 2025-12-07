import { describe, expect, it } from 'vitest';
import { concat, encodeAbiParameters } from 'viem';

import { decodeRevert } from '../../src/decode/revert';

const errorData = concat(['0x08c379a0', encodeAbiParameters([{ type: 'string' }], ['boom'])]);
const panicData = concat(['0x4e487b71', encodeAbiParameters([{ type: 'uint256' }], [0x11n])]);

describe('decodeRevert', () => {
  it('decodes Error(string)', () => {
    expect(decodeRevert(errorData)).toMatchObject({ kind: 'Error', message: 'boom' });
  });

  it('decodes Panic(uint256) with a description', () => {
    const reason = decodeRevert(panicData);
    expect(reason.kind).toBe('Panic');
    expect(reason.message).toContain('arithmetic overflow');
  });

  it('reports an empty revert', () => {
    expect(decodeRevert('0x').kind).toBe('Empty');
  });

  it('reports an unknown selector', () => {
    expect(decodeRevert('0xdeadbeef').kind).toBe('Unknown');
  });
});
