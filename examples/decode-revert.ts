/**
 * Decode the three revert flavours evmtrace understands. Runs offline.
 *
 * Usage:
 *   pnpm dlx tsx examples/decode-revert.ts
 */
import { concat, encodeAbiParameters, encodeErrorResult, parseAbi } from 'viem';

import { decodeRevert } from '../src/index';

const errorData = concat(['0x08c379a0', encodeAbiParameters([{ type: 'string' }], ['out of gas'])]);
const panicData = concat(['0x4e487b71', encodeAbiParameters([{ type: 'uint256' }], [0x11n])]);

const abi = parseAbi(['error InsufficientBalance(uint256 available, uint256 required)']);
const customData = encodeErrorResult({
  abi,
  errorName: 'InsufficientBalance',
  args: [5n, 10n],
});

console.log('Error:  ', decodeRevert(errorData).message);
console.log('Panic:  ', decodeRevert(panicData).message);
console.log('Custom: ', decodeRevert(customData, { abi }).message);
