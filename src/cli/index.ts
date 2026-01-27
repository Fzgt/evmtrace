#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { Command } from 'commander';
import type { Abi } from 'viem';

import type { Hex } from '../hex';
import { traceTransaction, type TraceOptions } from '../tracer';
import type { TraceResult } from '../types';
import { VERSION } from '../index';
import { renderResult, serializeResult } from './format';

type TraceFn = (txHash: Hex, options: TraceOptions) => Promise<TraceResult>;

/** Injectable dependencies, so the program can be driven in tests. */
export interface CliDeps {
  trace?: TraceFn;
  readAbiFile?: (path: string) => Abi;
  write?: (text: string) => void;
  writeError?: (text: string) => void;
}

interface TraceCommandOptions {
  rpc: string;
  abi: string[];
  structLogs: boolean;
  flamegraph: boolean;
  json: boolean;
  color: boolean;
}

function defaultReadAbiFile(path: string): Abi {
  return JSON.parse(readFileSync(path, 'utf8')) as Abi;
}

/** Build the root `evmtrace` command. */
export function buildProgram(deps: CliDeps = {}): Command {
  const trace = deps.trace ?? traceTransaction;
  const readAbiFile = deps.readAbiFile ?? defaultReadAbiFile;
  const write = deps.write ?? ((text: string) => process.stdout.write(`${text}\n`));

  const program = new Command();
  program.name('evmtrace').description('Trace and gas-profile EVM transactions').version(VERSION);

  program
    .command('trace')
    .description('Trace a transaction and print where the gas went')
    .argument('<txHash>', 'transaction hash to trace')
    .requiredOption('-r, --rpc <url>', 'JSON-RPC endpoint exposing debug_traceTransaction')
    .option('-a, --abi <path...>', 'ABI JSON file(s) used to decode calls', [])
    .option('-s, --struct-logs', 'also profile opcodes and storage via struct logs', false)
    .option('--flamegraph', 'print folded flamegraph stacks instead of a report', false)
    .option('--json', 'output raw JSON instead of a text report', false)
    .option('--no-color', 'disable ANSI colours')
    .action(async (txHash: string, options: TraceCommandOptions) => {
      const abis = options.abi.map(readAbiFile);
      const result = await trace(txHash as Hex, {
        rpcUrl: options.rpc,
        abis,
        structLogs: options.structLogs,
      });
      if (options.json) {
        write(serializeResult(result));
        return;
      }
      write(renderResult(result, { flamegraph: options.flamegraph, color: options.color }));
    });

  return program;
}

/** Parse argv and run. */
export async function run(argv: string[], deps?: CliDeps): Promise<void> {
  await buildProgram(deps).parseAsync(argv);
}

const invokedPath = process.argv[1];
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  void run(process.argv);
}
