import { describe, expect, it } from 'vitest';

import { attributeGas } from '../../src/gas/attribute';
import { buildCallTree } from '../../src/trace/buildTree';
import type { RawCallFrame } from '../../src/trace/callTracer';
import simpleTransfer from '../fixtures/simple-transfer.json';

describe('attributeGas', () => {
  it('subtracts child gas from the parent', () => {
    const root = attributeGas(buildCallTree(simpleTransfer as unknown as RawCallFrame));
    // root.gasUsed 52048 - child 2500 = 49548
    expect(root.gasSelf).toBe(49548n);
  });

  it('leaves a leaf frame with self === used', () => {
    const root = attributeGas(buildCallTree(simpleTransfer as unknown as RawCallFrame));
    const child = root.calls[0]!;
    expect(child.gasSelf).toBe(child.gasUsed);
    expect(child.gasSelf).toBe(2500n);
  });
});
