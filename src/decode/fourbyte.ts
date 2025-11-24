import type { Hex } from '../hex';

/** One signature record returned by the 4byte directory API. */
export interface FourByteSignature {
  id: number;
  text_signature: string;
}

interface FourByteResponse {
  results?: FourByteSignature[];
}

/** The subset of the `fetch` contract this client relies on; easy to stub. */
export type FetchLike = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

/** Options for {@link FourByteClient}. */
export interface FourByteOptions {
  /** Override the API base URL. */
  endpoint?: string;
  /** Inject a `fetch` implementation (defaults to the global `fetch`). */
  fetchImpl?: FetchLike;
}

const DEFAULT_ENDPOINT = 'https://www.4byte.directory/api/v1/signatures/';

const defaultFetch: FetchLike = (url) => fetch(url);

/**
 * Resolve unknown selectors against the public 4byte directory. Results are
 * cached per selector and ordered oldest-first (lowest id), which is the
 * heuristic 4byte itself uses for the most likely signature.
 */
export class FourByteClient {
  private readonly cache = new Map<Hex, string[]>();
  private readonly endpoint: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: FourByteOptions = {}) {
    this.endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
    this.fetchImpl = options.fetchImpl ?? defaultFetch;
  }

  /** Look up candidate signatures for a 4-byte selector. */
  async lookup(selector: Hex): Promise<string[]> {
    const key = selector.toLowerCase() as Hex;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const response = await this.fetchImpl(`${this.endpoint}?hex_signature=${key}`);
    if (!response.ok) {
      this.cache.set(key, []);
      return [];
    }

    const body = (await response.json()) as FourByteResponse;
    const signatures = (body.results ?? [])
      .slice()
      .sort((a, b) => a.id - b.id)
      .map((entry) => entry.text_signature);
    this.cache.set(key, signatures);
    return signatures;
  }
}
