/** Base class for every error thrown by evmtrace. */
export class EvmTraceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvmTraceError';
  }
}

/** A JSON-RPC request failed or returned an error object. */
export class RpcError extends EvmTraceError {
  readonly code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
  }
}

/** The node could not decode calldata, a revert payload, or an ABI. */
export class DecodeError extends EvmTraceError {
  constructor(message: string) {
    super(message);
    this.name = 'DecodeError';
  }
}

/** The requested transaction or its trace was not available. */
export class TraceNotFoundError extends EvmTraceError {
  constructor(message: string) {
    super(message);
    this.name = 'TraceNotFoundError';
  }
}
