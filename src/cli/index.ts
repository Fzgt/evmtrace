#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

import { Command } from 'commander';

import { VERSION } from '../index';

/** Injectable dependencies, so the program can be driven in tests. */
export interface CliDeps {
  write?: (text: string) => void;
  writeError?: (text: string) => void;
}

/** Build the root `evmtrace` command. */
export function buildProgram(_deps: CliDeps = {}): Command {
  const program = new Command();
  program.name('evmtrace').description('Trace and gas-profile EVM transactions').version(VERSION);
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
