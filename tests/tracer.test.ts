import { describe, expect, it } from 'vitest';
import { parseAbi } from 'viem';

import type { TraceClient } from '../src/rpc/client';
import { analyzeCallFrame, traceTransaction } from '../src/tracer';
import type { RawCallFrame } from '../src/trace/callTracer';
import type { StructLogTrace } from '../src/trace/structLog';
import simpleTransfer from './fixtures/simple-transfer.json';
import structlog from './fixtures/structlog-basic.json';

const abi = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);
const frame = simpleTransfer as unknown as RawCallFrame;

describe('analyzeCallFrame', () => {
  it('decodes the root call', () => {
    const result = analyzeCallFrame(frame, { abis: [abi] });
    expect(result.failed).toBe(false);
    expect(result.gasUsed).toBe(52048n);
    expect(result.root.functionName).toBe('transfer');
    expect(result.root.functionSignature).toBe('transfer(address,uint256)');
    expect(result.root.decodedInputs).toHaveLength(2);
  });

  it('adds an opcode profile and storage summary from struct logs', () => {
    const result = analyzeCallFrame(frame, {
      abis: [abi],
      structLogs: structlog as unknown as StructLogTrace,
    });
    expect(result.opcodeProfile?.total).toBe(24221n);
    expect(result.storageAccesses?.length).toBeGreaterThan(0);
  });
});

describe('traceTransaction', () => {
  it('fetches the call frame through the injected client', async () => {
    const calls: string[] = [];
    const client: TraceClient = {
      request: async (method) => {
        calls.push(method);
        return simpleTransfer;
      },
    };
    const result = await traceTransaction('0xabc', { client, abis: [abi] });
    expect(calls).toEqual(['debug_traceTransaction']);
    expect(result.txHash).toBe('0xabc');
    expect(result.root.functionName).toBe('transfer');
  });

  it('throws when neither a client nor an rpcUrl is given', async () => {
    await expect(traceTransaction('0xabc', {})).rejects.toThrow(/client.*rpcUrl/);
  });
});
