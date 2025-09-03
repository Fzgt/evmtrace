import { describe, expect, it } from 'vitest';

import { computeSelector, SelectorRegistry } from '../../src/decode/selectors';

describe('computeSelector', () => {
  it('matches well-known ERC-20 selectors', () => {
    expect(computeSelector('transfer(address,uint256)')).toBe('0xa9059cbb');
    expect(computeSelector('balanceOf(address)')).toBe('0x70a08231');
    expect(computeSelector('approve(address,uint256)')).toBe('0x095ea7b3');
  });
});

describe('SelectorRegistry', () => {
  it('stores and retrieves entries case-insensitively', () => {
    const registry = new SelectorRegistry();
    registry.add({ selector: '0xA9059CBB', signature: 'transfer(address,uint256)', name: 'transfer' });
    expect(registry.has('0xa9059cbb')).toBe(true);
    expect(registry.get('0xa9059cbb')?.name).toBe('transfer');
    expect(registry.size).toBe(1);
  });

  it('keeps the first signature registered for a selector', () => {
    const registry = new SelectorRegistry();
    registry.add({ selector: '0x00000000', signature: 'first()', name: 'first' });
    registry.add({ selector: '0x00000000', signature: 'second()', name: 'second' });
    expect(registry.get('0x00000000')?.name).toBe('first');
  });
});
