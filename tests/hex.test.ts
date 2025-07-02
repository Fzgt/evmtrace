import { describe, expect, it } from 'vitest';

import {
  asHex,
  byteLength,
  getSelector,
  isHex,
  shortHex,
  toBigInt,
  wordToAddress,
} from '../src/hex';

describe('isHex', () => {
  it('accepts prefixed hex', () => {
    expect(isHex('0xabc123')).toBe(true);
    expect(isHex('0x')).toBe(true);
  });

  it('rejects non-hex', () => {
    expect(isHex('abc')).toBe(false);
    expect(isHex('0xZZ')).toBe(false);
    expect(isHex(42)).toBe(false);
  });
});

describe('asHex', () => {
  it('adds a missing prefix', () => {
    expect(asHex('dead')).toBe('0xdead');
    expect(asHex('0xdead')).toBe('0xdead');
  });

  it('throws on junk', () => {
    expect(() => asHex('nope!')).toThrow(TypeError);
  });
});

describe('toBigInt', () => {
  it('parses hex and decimal', () => {
    expect(toBigInt('0x1a')).toBe(26n);
    expect(toBigInt('26')).toBe(26n);
    expect(toBigInt(26)).toBe(26n);
    expect(toBigInt(26n)).toBe(26n);
  });

  it('falls back on empty input', () => {
    expect(toBigInt(undefined)).toBe(0n);
    expect(toBigInt(null)).toBe(0n);
    expect(toBigInt('')).toBe(0n);
    expect(toBigInt('0x')).toBe(0n);
    expect(toBigInt(undefined, 21000n)).toBe(21000n);
  });
});

describe('getSelector', () => {
  it('takes the first four bytes', () => {
    expect(getSelector('0xa9059cbb0000000000000000000000000000')).toBe('0xa9059cbb');
  });

  it('returns null for short calldata', () => {
    expect(getSelector('0x1234')).toBeNull();
    expect(getSelector('0x')).toBeNull();
  });
});

describe('byteLength', () => {
  it('counts bytes without the prefix', () => {
    expect(byteLength('0x')).toBe(0);
    expect(byteLength('0xdeadbeef')).toBe(4);
  });
});

describe('wordToAddress', () => {
  it('takes the low twenty bytes', () => {
    const word = '000000000000000000000000abcdef0123456789abcdef0123456789abcdef01';
    expect(wordToAddress(word)).toBe('0xabcdef0123456789abcdef0123456789abcdef01');
  });
});

describe('shortHex', () => {
  it('elides the middle', () => {
    expect(shortHex('0x1234567890abcdef', 4)).toBe('0x1234…cdef');
  });

  it('leaves short values untouched', () => {
    expect(shortHex('0x1234', 4)).toBe('0x1234');
  });
});
