import { describe, expect, it } from 'vitest';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';

import { traceTransaction } from '../../src/index';

/**
 * These tests run only when `EVMTRACE_ANVIL_RPC` points at a live anvil node
 * (e.g. `anvil` on 127.0.0.1:8545). They are skipped otherwise, so the suite
 * stays green without a node. The private key is anvil's well-known account #0.
 */
const RPC = process.env.EVMTRACE_ANVIL_RPC;
const ANVIL_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const RECIPIENT = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

describe.skipIf(!RPC)('anvil integration', () => {
  it('traces a value transfer end to end', async () => {
    const account = privateKeyToAccount(ANVIL_KEY);
    const wallet = createWalletClient({ account, chain: foundry, transport: http(RPC) });

    const hash = await wallet.sendTransaction({ to: RECIPIENT, value: parseEther('1') });
    const result = await traceTransaction(hash, { rpcUrl: RPC!, structLogs: true });

    expect(result.failed).toBe(false);
    expect(result.root.to?.toLowerCase()).toBe(RECIPIENT.toLowerCase());
    expect(result.gasUsed).toBeGreaterThan(0n);
  }, 30_000);
});
