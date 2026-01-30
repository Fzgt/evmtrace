import { describe, expect, it } from 'vitest';

import { run } from '../src/cli/index';
import type { Hex } from '../src/hex';
import type { TraceOptions } from '../src/tracer';
import type { CallNode, TraceResult } from '../src/types';

function fakeResult(): TraceResult {
  const root: CallNode = {
    type: 'CALL',
    from: '0x0000000000000000000000000000000000000001',
    to: '0x0000000000000000000000000000000000000002',
    value: 0n,
    gas: 100n,
    gasUsed: 50n,
    gasSelf: 50n,
    input: '0x',
    output: '0x',
    depth: 0,
    calls: [],
  };
  return { txHash: '0xabc', root, gasUsed: 50n, failed: false };
}

describe('cli trace', () => {
  it('parses arguments and calls the tracer', async () => {
    const calls: { txHash: Hex; options: TraceOptions }[] = [];
    const output: string[] = [];
    await run(
      ['node', 'evmtrace', 'trace', '0xabc', '--rpc', 'http://localhost:8545', '--struct-logs'],
      {
        trace: async (txHash: Hex, options: TraceOptions) => {
          calls.push({ txHash, options });
          return fakeResult();
        },
        write: (text) => output.push(text),
      },
    );
    expect(calls).toHaveLength(1);
    expect(calls[0]!.txHash).toBe('0xabc');
    expect(calls[0]!.options.rpcUrl).toBe('http://localhost:8545');
    expect(calls[0]!.options.structLogs).toBe(true);
    expect(output.join('\n')).toContain('Status:');
  });

  it('emits JSON with --json and stringifies bigints', async () => {
    const output: string[] = [];
    await run(['node', 'evmtrace', 'trace', '0xabc', '--rpc', 'http://x', '--json'], {
      trace: async () => fakeResult(),
      write: (text) => output.push(text),
    });
    const parsed = JSON.parse(output.join('')) as { txHash: string; gasUsed: string };
    expect(parsed.txHash).toBe('0xabc');
    expect(parsed.gasUsed).toBe('50');
  });

  it('loads ABIs from the provided files', async () => {
    const readFiles: string[] = [];
    let received: TraceOptions | undefined;
    await run(
      ['node', 'evmtrace', 'trace', '0xabc', '--rpc', 'http://x', '--abi', 'a.json', 'b.json'],
      {
        trace: async (_txHash: Hex, options: TraceOptions) => {
          received = options;
          return fakeResult();
        },
        readAbiFile: (path) => {
          readFiles.push(path);
          return [];
        },
        write: () => {},
      },
    );
    expect(readFiles).toEqual(['a.json', 'b.json']);
    expect(received?.abis).toHaveLength(2);
  });
});
