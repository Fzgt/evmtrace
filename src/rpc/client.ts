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

// Full `debug_traceTransaction` wiring lands in a later change; this scaffold
// just fixes the shape the rest of the package programs against.
