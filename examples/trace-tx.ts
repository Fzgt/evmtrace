/**
 * Trace a single transaction and print a gas report.
 *
 * Usage:
 *   pnpm dlx tsx examples/trace-tx.ts <rpcUrl> <txHash>
 */
import { parseAbi } from 'viem';

import { formatReport, traceTransaction, type Hex } from '../src/index';

async function main(): Promise<void> {
  const [rpcUrl, txHash] = process.argv.slice(2);
  if (!rpcUrl || !txHash) {
    console.error('usage: tsx examples/trace-tx.ts <rpcUrl> <txHash>');
    process.exitCode = 1;
    return;
  }

  const abis = [parseAbi(['function transfer(address,uint256) returns (bool)'])];
  const result = await traceTransaction(txHash as Hex, { rpcUrl, abis, structLogs: true });

  console.log(formatReport(result, { color: true }));
}

void main();
