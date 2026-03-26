/**
 * Print the per-opcode gas profile for a transaction, most expensive first.
 *
 * Usage:
 *   pnpm dlx tsx examples/profile-gas.ts <rpcUrl> <txHash>
 */
import { formatGas, traceTransaction, type Hex } from '../src/index';

async function main(): Promise<void> {
  const [rpcUrl, txHash] = process.argv.slice(2);
  if (!rpcUrl || !txHash) {
    console.error('usage: tsx examples/profile-gas.ts <rpcUrl> <txHash>');
    process.exitCode = 1;
    return;
  }

  const result = await traceTransaction(txHash as Hex, { rpcUrl, structLogs: true });
  const profile = result.opcodeProfile;
  if (!profile) {
    console.error('node did not return struct logs');
    process.exitCode = 1;
    return;
  }

  console.log(`Total opcode gas: ${formatGas(profile.total)}`);
  for (const entry of profile.byOpcode.slice(0, 15)) {
    console.log(`  ${entry.op.padEnd(14)}${formatGas(entry.gas).padStart(12)}  x${entry.count}`);
  }
}

void main();
