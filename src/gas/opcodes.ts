/**
 * Opcode metadata used when grouping a struct-log trace. We only need coarse
 * categories (which family an opcode belongs to) plus the sets of opcodes that
 * open a new call frame, so this stays deliberately small.
 */

export type OpcodeCategory =
  | 'arithmetic'
  | 'comparison'
  | 'bitwise'
  | 'keccak'
  | 'environment'
  | 'block'
  | 'stack'
  | 'memory'
  | 'storage'
  | 'flow'
  | 'log'
  | 'call'
  | 'create'
  | 'system'
  | 'unknown';

/** Opcodes that push a message-call frame. */
export const CALL_OPCODES = new Set(['CALL', 'CALLCODE', 'DELEGATECALL', 'STATICCALL']);

/** Opcodes that deploy new code. */
export const CREATE_OPCODES = new Set(['CREATE', 'CREATE2']);

/** Opcodes that read or write contract storage. */
export const STORAGE_OPCODES = new Set(['SLOAD', 'SSTORE', 'TLOAD', 'TSTORE']);

const EXACT: Record<string, OpcodeCategory> = {
  STOP: 'flow',
  ADD: 'arithmetic',
  MUL: 'arithmetic',
  SUB: 'arithmetic',
  DIV: 'arithmetic',
  SDIV: 'arithmetic',
  MOD: 'arithmetic',
  SMOD: 'arithmetic',
  ADDMOD: 'arithmetic',
  MULMOD: 'arithmetic',
  EXP: 'arithmetic',
  SIGNEXTEND: 'arithmetic',
  LT: 'comparison',
  GT: 'comparison',
  SLT: 'comparison',
  SGT: 'comparison',
  EQ: 'comparison',
  ISZERO: 'comparison',
  AND: 'bitwise',
  OR: 'bitwise',
  XOR: 'bitwise',
  NOT: 'bitwise',
  BYTE: 'bitwise',
  SHL: 'bitwise',
  SHR: 'bitwise',
  SAR: 'bitwise',
  KECCAK256: 'keccak',
  SHA3: 'keccak',
  ADDRESS: 'environment',
  BALANCE: 'environment',
  ORIGIN: 'environment',
  CALLER: 'environment',
  CALLVALUE: 'environment',
  CALLDATALOAD: 'environment',
  CALLDATASIZE: 'environment',
  CALLDATACOPY: 'environment',
  CODESIZE: 'environment',
  CODECOPY: 'environment',
  GASPRICE: 'environment',
  EXTCODESIZE: 'environment',
  EXTCODECOPY: 'environment',
  RETURNDATASIZE: 'environment',
  RETURNDATACOPY: 'environment',
  EXTCODEHASH: 'environment',
  BLOCKHASH: 'block',
  COINBASE: 'block',
  TIMESTAMP: 'block',
  NUMBER: 'block',
  PREVRANDAO: 'block',
  DIFFICULTY: 'block',
  GASLIMIT: 'block',
  CHAINID: 'block',
  SELFBALANCE: 'block',
  BASEFEE: 'block',
  BLOBHASH: 'block',
  BLOBBASEFEE: 'block',
  POP: 'stack',
  PC: 'stack',
  GAS: 'stack',
  JUMPDEST: 'flow',
  MLOAD: 'memory',
  MSTORE: 'memory',
  MSTORE8: 'memory',
  MSIZE: 'memory',
  MCOPY: 'memory',
  SLOAD: 'storage',
  SSTORE: 'storage',
  TLOAD: 'storage',
  TSTORE: 'storage',
  JUMP: 'flow',
  JUMPI: 'flow',
  RETURN: 'flow',
  REVERT: 'flow',
  INVALID: 'flow',
  CALL: 'call',
  CALLCODE: 'call',
  DELEGATECALL: 'call',
  STATICCALL: 'call',
  CREATE: 'create',
  CREATE2: 'create',
  SELFDESTRUCT: 'system',
};

/** Classify an opcode name into a coarse family. */
export function opcodeCategory(op: string): OpcodeCategory {
  const name = op.toUpperCase();
  const exact = EXACT[name];
  if (exact) return exact;
  if (name.startsWith('PUSH')) return 'stack';
  if (name.startsWith('DUP')) return 'stack';
  if (name.startsWith('SWAP')) return 'stack';
  if (name.startsWith('LOG')) return 'log';
  return 'unknown';
}
