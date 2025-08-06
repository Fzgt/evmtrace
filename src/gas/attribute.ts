import type { CallNode } from '../types';

/**
 * Fill in `gasSelf` for every node: the gas a frame spent on its own opcodes,
 * i.e. its `gasUsed` minus the `gasUsed` of everything it called.
 */
export function attributeGas(root: CallNode): CallNode {
  const childGas = root.calls.reduce((sum, child) => sum + child.gasUsed, 0n);
  root.gasSelf = root.gasUsed - childGas;
  for (const child of root.calls) {
    attributeGas(child);
  }
  return root;
}
