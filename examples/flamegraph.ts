/**
 * Emit folded flamegraph stacks for a transaction, weighted by self gas. Pipe
 * the output into flamegraph.pl or upload it to speedscope.
 *
 * Usage:
 *   pnpm dlx tsx examples/flamegraph.ts <rpcUrl> <txHash> > stacks.txt
 */
import { foldStacks, traceTransaction, type Hex } from '../src/index';

async function main(): Promise<void> {
  const [rpcUrl, txHash] = process.argv.slice(2);
  if (!rpcUrl || !txHash) {
    console.error('usage: tsx examples/flamegraph.ts <rpcUrl> <txHash>');
    process.exitCode = 1;
    return;
  }

  const result = await traceTransaction(txHash as Hex, { rpcUrl });
  console.log(foldStacks(result.root));
}

void main();
