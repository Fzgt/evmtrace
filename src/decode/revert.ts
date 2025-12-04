import { decodeAbiParameters } from 'viem';

import { getSelector, type Hex } from '../hex';

/** Selector of the built-in `Error(string)` revert. */
export const ERROR_SELECTOR = '0x08c379a0';
/** Selector of the built-in `Panic(uint256)` revert. */
export const PANIC_SELECTOR = '0x4e487b71';

/** A decoded revert payload. */
export interface RevertReason {
  kind: 'Error' | 'Panic' | 'Custom' | 'Empty' | 'Unknown';
  message: string;
  selector?: Hex;
  name?: string;
  args?: readonly unknown[];
}

/** Human descriptions for the Solidity `Panic` codes. */
const PANIC_CODES: Record<string, string> = {
  '0x00': 'generic panic',
  '0x01': 'assertion failed',
  '0x11': 'arithmetic overflow or underflow',
  '0x12': 'division or modulo by zero',
  '0x21': 'conversion into non-existent enum value',
  '0x22': 'incorrectly encoded storage byte array',
  '0x31': 'pop on an empty array',
  '0x32': 'array index out of bounds',
  '0x41': 'excessive memory allocation',
  '0x51': 'call to an invalid internal function',
};

function payload(data: Hex): Hex {
  return `0x${data.slice(10)}`;
}

function toPanicKey(code: bigint): string {
  return `0x${code.toString(16).padStart(2, '0')}`;
}

/**
 * Decode revert data emitted by a failed call. Recognises the built-in
 * `Error(string)` and `Panic(uint256)` payloads; everything else is reported as
 * `Unknown` until an ABI is supplied.
 */
export function decodeRevert(data: Hex): RevertReason {
  if (!data || data === '0x') {
    return { kind: 'Empty', message: 'reverted without a reason' };
  }

  const selector = getSelector(data) ?? undefined;

  if (selector === ERROR_SELECTOR) {
    try {
      const [message] = decodeAbiParameters([{ type: 'string' }], payload(data));
      return { kind: 'Error', message: message as string, selector };
    } catch {
      /* not a well-formed Error(string); fall through */
    }
  }

  if (selector === PANIC_SELECTOR) {
    try {
      const [code] = decodeAbiParameters([{ type: 'uint256' }], payload(data));
      const key = toPanicKey(code as bigint);
      return {
        kind: 'Panic',
        name: 'Panic',
        selector,
        message: `panic: ${PANIC_CODES[key] ?? `code ${key}`}`,
      };
    } catch {
      /* not a well-formed Panic(uint256); fall through */
    }
  }

  return { kind: 'Unknown', message: `unknown revert (${selector ?? data})`, selector };
}
