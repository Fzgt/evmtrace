import { describe, expect, it } from 'vitest';

import { FourByteClient, type FetchLike } from '../../src/decode/fourbyte';

function mockFetch(results: { id: number; text_signature: string }[]): {
  fetchImpl: FetchLike;
  calls: string[];
} {
  const calls: string[] = [];
  const fetchImpl: FetchLike = async (url) => {
    calls.push(url);
    return { ok: true, json: async () => ({ results }) };
  };
  return { fetchImpl, calls };
}

describe('FourByteClient', () => {
  it('returns signatures ordered oldest-first', async () => {
    const { fetchImpl } = mockFetch([
      { id: 31, text_signature: 'transfer(bytes4[9],bytes5[6],int48[11])' },
      { id: 14, text_signature: 'transfer(address,uint256)' },
    ]);
    const client = new FourByteClient({ fetchImpl });
    const signatures = await client.lookup('0xa9059cbb');
    expect(signatures).toEqual([
      'transfer(address,uint256)',
      'transfer(bytes4[9],bytes5[6],int48[11])',
    ]);
  });

  it('caches lookups by selector', async () => {
    const { fetchImpl, calls } = mockFetch([{ id: 1, text_signature: 'foo()' }]);
    const client = new FourByteClient({ fetchImpl });
    await client.lookup('0x12345678');
    await client.lookup('0x12345678');
    expect(calls).toHaveLength(1);
  });

  it('returns an empty list on a failed response', async () => {
    const fetchImpl: FetchLike = async () => ({ ok: false, json: async () => ({}) });
    const client = new FourByteClient({ fetchImpl });
    expect(await client.lookup('0xdeadbeef')).toEqual([]);
  });
});
