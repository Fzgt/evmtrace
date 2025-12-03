import { decodeFunctionData, toFunctionSignature, type Abi, type AbiFunction } from 'viem';

import { getSelector, type Hex } from '../hex';
import type { DecodedArg } from '../types';

/** A calldata payload matched against an ABI. */
export interface DecodedCall {
  name: string;
  signature?: string;
  selector: Hex;
  args: DecodedArg[];
}

function findFunction(abi: Abi, name: string, arity: number): AbiFunction | undefined {
  const candidates = abi.filter(
    (item): item is AbiFunction => item.type === 'function' && item.name === name,
  );
  if (candidates.length <= 1) return candidates[0];
  return candidates.find((fn) => fn.inputs.length === arity) ?? candidates[0];
}

/**
 * Decode a call's input against an ABI, returning the function name, canonical
 * signature, and named arguments. Returns `null` when the calldata is too short
 * or no ABI entry matches the selector.
 */
export function decodeCallData(input: Hex, abi: Abi): DecodedCall | null {
  const selector = getSelector(input);
  if (!selector) return null;

  try {
    const { functionName, args } = decodeFunctionData({ abi, data: input });
    const argList = (args ?? []) as readonly unknown[];
    const fn = findFunction(abi, functionName, argList.length);
    const decoded: DecodedArg[] = (fn?.inputs ?? []).map((input, index) => ({
      name: input.name || undefined,
      type: input.type,
      value: argList[index],
    }));
    return {
      name: functionName,
      signature: fn ? toFunctionSignature(fn) : undefined,
      selector,
      args: decoded,
    };
  } catch {
    return null;
  }
}
