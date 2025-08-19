import type { Hex } from '../hex';

/** A known 4-byte selector and the signature it resolves to. */
export interface SelectorEntry {
  selector: Hex;
  /** Canonical signature, e.g. `transfer(address,uint256)`. */
  signature: string;
  /** Function name, e.g. `transfer`. */
  name: string;
}

/**
 * An in-memory index of 4-byte selectors. Callers seed it from ABIs (and, later,
 * from the 4byte directory) so the decoder can name otherwise-opaque calls.
 */
export class SelectorRegistry {
  private readonly entries = new Map<Hex, SelectorEntry>();

  /** Register a selector. The first signature registered for a selector wins. */
  add(entry: SelectorEntry): void {
    const key = entry.selector.toLowerCase() as Hex;
    if (!this.entries.has(key)) {
      this.entries.set(key, { ...entry, selector: key });
    }
  }

  /** Look up a selector. */
  get(selector: Hex): SelectorEntry | undefined {
    return this.entries.get(selector.toLowerCase() as Hex);
  }

  /** Whether a selector is known. */
  has(selector: Hex): boolean {
    return this.entries.has(selector.toLowerCase() as Hex);
  }

  /** Number of registered selectors. */
  get size(): number {
    return this.entries.size;
  }
}
