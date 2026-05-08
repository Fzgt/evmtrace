import { describe, expect, it } from 'vitest';
import { concat, encodeAbiParameters, encodeErrorResult, parseAbi } from 'viem';

import { decodeRevert } from '../../src/decode/revert';

const errorData = concat(['0x08c379a0', encodeAbiParameters([{ type: 'string' }], ['boom'])]);
const panicData = concat(['0x4e487b71', encodeAbiParameters([{ type: 'uint256' }], [0x11n])]);

const customAbi = parseAbi(['error InsufficientBalance(uint256 available, uint256 required)']);
const customData = encodeErrorResult({
  abi: customAbi,
  errorName: 'InsufficientBalance',
  args: [1n, 2n],
});

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
    expect(decodeRevert(undefined).kind).toBe('Empty');
  });

  it('reports an unknown selector', () => {
    expect(decodeRevert('0xdeadbeef').kind).toBe('Unknown');
  });

  it('decodes a custom error from an abi', () => {
    const reason = decodeRevert(customData, { abi: customAbi });
    expect(reason.kind).toBe('Custom');
    expect(reason.name).toBe('InsufficientBalance');
    expect(reason.args).toEqual([1n, 2n]);
    expect(reason.message).toContain('InsufficientBalance(1, 2)');
  });

  it('falls back to unknown without the abi', () => {
    expect(decodeRevert(customData).kind).toBe('Unknown');
  });
});
