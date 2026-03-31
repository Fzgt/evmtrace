import type { CallNode } from '../types';

/**
 * Fill in `gasSelf` for every node: the gas a frame spent on its own opcodes,
 * i.e. its `gasUsed` minus the `gasUsed` of everything it called.
 */
export function attributeGas(root: CallNode): CallNode {
  const childGas = root.calls.reduce((sum, child) => sum + child.gasUsed, 0n);
  const self = root.gasUsed - childGas;
  // Some tracers report a parent whose children sum to more than its own
  // gasUsed (e.g. reordered or synthetic frames); never report negative self.
  root.gasSelf = self < 0n ? 0n : self;
  for (const child of root.calls) {
    attributeGas(child);
  }
  return root;
}
