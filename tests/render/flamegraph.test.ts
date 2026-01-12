import { describe, expect, it } from 'vitest';

import { attributeGas } from '../../src/gas/attribute';
import { foldStacks, renderFlamegraph } from '../../src/render/flamegraph';
import { buildCallTree } from '../../src/trace/buildTree';
import type { RawCallFrame } from '../../src/trace/callTracer';
import simpleTransfer from '../fixtures/simple-transfer.json';

const root = attributeGas(buildCallTree(simpleTransfer as unknown as RawCallFrame));

describe('foldStacks', () => {
  const lines = foldStacks(root).split('\n');

  it('emits one folded line per frame weighted by self gas', () => {
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('CALL:0xa9059cbb 49548');
  });

  it('nests children under their parent with a semicolon', () => {
    expect(lines[1]).toContain('CALL:0xa9059cbb;STATICCALL:0x70a08231');
    expect(lines[1]!.endsWith(' 2500')).toBe(true);
  });
});

describe('renderFlamegraph', () => {
  it('draws the root bar at full width', () => {
    const lines = renderFlamegraph(root, { width: 40 }).split('\n');
    expect(lines[0]!.startsWith('█'.repeat(40))).toBe(true);
  });
});
