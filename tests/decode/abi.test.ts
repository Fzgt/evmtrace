import { describe, expect, it } from 'vitest';
import { encodeFunctionData, parseAbi } from 'viem';

import { decodeCallData } from '../../src/decode/abi';

const abi = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);
const to = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
const input = encodeFunctionData({ abi, functionName: 'transfer', args: [to, 100n] });

describe('decodeCallData', () => {
  it('decodes name, signature, and selector', () => {
    const decoded = decodeCallData(input, abi)!;
    expect(decoded.name).toBe('transfer');
    expect(decoded.signature).toBe('transfer(address,uint256)');
    expect(decoded.selector).toBe('0xa9059cbb');
  });

  it('decodes named arguments', () => {
    const decoded = decodeCallData(input, abi)!;
    expect(decoded.args).toEqual([
      { name: 'to', type: 'address', value: to },
      { name: 'amount', type: 'uint256', value: 100n },
    ]);
  });

  it('returns null for calldata without a selector', () => {
    expect(decodeCallData('0x', abi)).toBeNull();
  });

  it('returns null for an unknown selector', () => {
    expect(decodeCallData('0x12345678', abi)).toBeNull();
  });
});
