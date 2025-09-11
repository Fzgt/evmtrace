import { describe, expect, it } from 'vitest';

import { buildCallTree, normalizeCallType } from '../../src/trace/buildTree';
import type { RawCallFrame } from '../../src/trace/callTracer';
import simpleTransfer from '../fixtures/simple-transfer.json';

const frame = simpleTransfer as unknown as RawCallFrame;

describe('normalizeCallType', () => {
  it('keeps known types', () => {
    expect(normalizeCallType('DELEGATECALL')).toBe('DELEGATECALL');
    expect(normalizeCallType('staticcall')).toBe('STATICCALL');
  });

  it('falls back to CALL for anything else', () => {
    expect(normalizeCallType('WEIRD')).toBe('CALL');
  });
});

describe('buildCallTree', () => {
  const root = buildCallTree(frame);

  it('normalises the root frame', () => {
    expect(root.type).toBe('CALL');
    expect(root.to).toBe('0x5fbdb2315678afecb367f032d93f642f64180aa3');
    expect(root.value).toBe(0n);
    expect(root.gas).toBe(100000n);
    expect(root.gasUsed).toBe(52048n);
    expect(root.depth).toBe(0);
  });

  it('tags the selector', () => {
    expect(root.selector).toBe('0xa9059cbb');
  });

  it('recurses into child frames', () => {
    expect(root.calls).toHaveLength(1);
    const child = root.calls[0]!;
    expect(child.type).toBe('STATICCALL');
    expect(child.selector).toBe('0x70a08231');
    expect(child.gasUsed).toBe(2500n);
    expect(child.depth).toBe(1);
    expect(child.calls).toHaveLength(0);
  });
});
