/**
 * Low-level helpers for working with `0x`-prefixed hex strings and the
 * quantities the JSON-RPC layer hands back (gas, values, calldata).
 */

/** A `0x`-prefixed hex string. */
export type Hex = `0x${string}`;

/** A 20-byte EVM address, encoded as a `0x`-prefixed hex string. */
export type Address = Hex;

const HEX_RE = /^0x[0-9a-fA-F]*$/;

/** Type guard for `0x`-prefixed hex strings. */
export function isHex(value: unknown): value is Hex {
  return typeof value === 'string' && HEX_RE.test(value);
}

/** Ensure a string carries a `0x` prefix and is valid hex, throwing otherwise. */
export function asHex(value: string): Hex {
  const withPrefix = value.startsWith('0x') ? value : `0x${value}`;
  if (!isHex(withPrefix)) {
    throw new TypeError(`Not a hex string: ${value}`);
  }
  return withPrefix as Hex;
}

/**
 * Parse a hex quantity (`0x1a`) or decimal string into a bigint.
 *
 * Empty input (`undefined`, `null`, `''`, `'0x'`) resolves to `fallback`,
 * which keeps call sites free of defensive checks when a field is optional.
 */
export function toBigInt(
  value: string | number | bigint | null | undefined,
  fallback = 0n,
): bigint {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (value === '' || value === '0x') return fallback;
  return BigInt(value);
}

/** The 4-byte function selector of some calldata, or `null` when absent. */
export function getSelector(input: Hex): Hex | null {
  // A selector is 4 bytes: `0x` + 8 hex characters.
  if (input.length < 10) return null;
  return input.slice(0, 10).toLowerCase() as Hex;
}

/** Parse a 32-byte EVM stack word (with or without a `0x` prefix) to a bigint. */
export function wordToBigInt(word: string): bigint {
  return toBigInt(word.startsWith('0x') ? word : `0x${word}`);
}

/** Count the bytes represented by a hex string, ignoring the `0x` prefix. */
export function byteLength(hex: Hex): number {
  return Math.max(0, Math.floor((hex.length - 2) / 2));
}

/** Take the low 20 bytes of a 32-byte stack word and return it as an address. */
export function wordToAddress(word: string): Address {
  const clean = word.startsWith('0x') ? word.slice(2) : word;
  const padded = clean.padStart(64, '0');
  return `0x${padded.slice(24)}`.toLowerCase() as Address;
}

/** Shorten a hex string for display, e.g. `0x1234…cdef`. */
export function shortHex(hex: string, chars = 4): string {
  if (hex.length <= 2 + chars * 2) return hex;
  return `${hex.slice(0, 2 + chars)}…${hex.slice(-chars)}`;
}
