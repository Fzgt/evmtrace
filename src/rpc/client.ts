import { createPublicClient, http } from 'viem';

import { RpcError } from '../errors';

/** Options for constructing a trace client. */
export interface TraceClientOptions {
  /** JSON-RPC endpoint of a node that exposes `debug_traceTransaction`. */
  rpcUrl: string;
}

/**
 * Minimal surface the tracer needs from a node. Kept as an interface so tests
 * (and the CLI) can substitute a fixture-backed client without a live RPC.
 */
export interface TraceClient {
  /** Raw JSON-RPC passthrough, used to reach `debug_*` methods. */
  request(method: string, params: unknown[]): Promise<unknown>;
}

/**
 * Build a {@link TraceClient} backed by a viem HTTP transport. The node must
 * support `debug_traceTransaction` (geth, reth, anvil, and most archive nodes).
 */
export function createTraceClient(options: TraceClientOptions): TraceClient {
  const client = createPublicClient({ transport: http(options.rpcUrl) });
  // `debug_*` methods are outside viem's typed RPC schema, so widen the request.
  const rpcRequest = client.request as unknown as (args: {
    method: string;
    params: unknown[];
  }) => Promise<unknown>;

  return {
    async request(method, params) {
      try {
        return await rpcRequest({ method, params });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new RpcError(`${method} failed: ${message}`);
      }
    },
  };
}
