import { describe, expect, it } from 'vitest';

import { attributeGas } from '../../src/gas/attribute';
import { formatGas, renderCallTree } from '../../src/format/tree';
import { buildCallTree } from '../../src/trace/buildTree';
import type { RawCallFrame } from '../../src/trace/callTracer';
import simpleTransfer from '../fixtures/simple-transfer.json';

const root = attributeGas(buildCallTree(simpleTransfer as unknown as RawCallFrame));
const ESC = String.fromCharCode(27);

describe('formatGas', () => {
  it('groups digits', () => {
    expect(formatGas(0n)).toBe('0');
    expect(formatGas(52048n)).toBe('52,048');
    expect(formatGas(1000000n)).toBe('1,000,000');
  });
});

describe('renderCallTree', () => {
  const out = renderCallTree(root);

  it('renders one line per frame', () => {
    expect(out.split('\n')).toHaveLength(2);
  });

  it('draws the child with a branch connector', () => {
    expect(out).toContain('└─ STATICCALL');
  });

  it('shows selectors and grouped gas', () => {
    expect(out).toContain('0xa9059cbb');
    expect(out).toContain('52,048');
  });

  it('omits ANSI codes unless colour is requested', () => {
    expect(out.includes(ESC)).toBe(false);
    expect(renderCallTree(root, { color: true }).includes(ESC)).toBe(true);
  });
});
