/**
 * Static (context-independent) gas costs for common opcodes.
 *
 * Struct-log traces already carry a per-step `gasCost`, so these are used as a
 * documentation reference and as a fallback when a step is missing its cost.
 * Values follow the post-Berlin schedule (EIP-2929); anything with a dynamic
 * component (memory expansion, cold access, refunds) is intentionally omitted.
 */

/** Named tiers from the yellow paper. */
export const GAS_TIER = {
  zero: 0,
  base: 2,
  verylow: 3,
  low: 5,
  mid: 8,
  high: 10,
} as const;

/** Warm/cold access costs introduced by EIP-2929. */
export const ACCESS_COST = {
  warmStorageRead: 100,
  coldStorageRead: 2100,
  warmAccountAccess: 100,
  coldAccountAccess: 2600,
} as const;

const STATIC_COST: Record<string, number> = {
  STOP: GAS_TIER.zero,
  ADD: GAS_TIER.verylow,
  SUB: GAS_TIER.verylow,
  MUL: GAS_TIER.low,
  DIV: GAS_TIER.low,
  SDIV: GAS_TIER.low,
  MOD: GAS_TIER.low,
  SMOD: GAS_TIER.low,
  ADDMOD: GAS_TIER.mid,
  MULMOD: GAS_TIER.mid,
  LT: GAS_TIER.verylow,
  GT: GAS_TIER.verylow,
  SLT: GAS_TIER.verylow,
  SGT: GAS_TIER.verylow,
  EQ: GAS_TIER.verylow,
  ISZERO: GAS_TIER.verylow,
  AND: GAS_TIER.verylow,
  OR: GAS_TIER.verylow,
  XOR: GAS_TIER.verylow,
  NOT: GAS_TIER.verylow,
  BYTE: GAS_TIER.verylow,
  SHL: GAS_TIER.verylow,
  SHR: GAS_TIER.verylow,
  SAR: GAS_TIER.verylow,
  ADDRESS: GAS_TIER.base,
  ORIGIN: GAS_TIER.base,
  CALLER: GAS_TIER.base,
  CALLVALUE: GAS_TIER.base,
  CALLDATALOAD: GAS_TIER.verylow,
  CALLDATASIZE: GAS_TIER.base,
  CODESIZE: GAS_TIER.base,
  GASPRICE: GAS_TIER.base,
  RETURNDATASIZE: GAS_TIER.base,
  POP: GAS_TIER.base,
  MLOAD: GAS_TIER.verylow,
  MSTORE: GAS_TIER.verylow,
  MSTORE8: GAS_TIER.verylow,
  JUMP: GAS_TIER.mid,
  JUMPI: GAS_TIER.high,
  PC: GAS_TIER.base,
  MSIZE: GAS_TIER.base,
  GAS: GAS_TIER.base,
  JUMPDEST: 1,
  SLOAD: ACCESS_COST.warmStorageRead,
};

/** The static gas cost of an opcode, or `undefined` when it is dynamic-only. */
export function staticGasCost(op: string): number | undefined {
  const name = op.toUpperCase();
  if (name in STATIC_COST) return STATIC_COST[name];
  if (name.startsWith('PUSH')) return name === 'PUSH0' ? GAS_TIER.base : GAS_TIER.verylow;
  if (name.startsWith('DUP')) return GAS_TIER.verylow;
  if (name.startsWith('SWAP')) return GAS_TIER.verylow;
  return undefined;
}
