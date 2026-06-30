# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and the project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-07-18

### Added

- Call-tree decoding from `debug_traceTransaction` (`callTracer`), with ABI and
  4-byte selector resolution.
- Gas attribution (self vs. cumulative) plus a per-opcode profile and category
  roll-up from struct logs.
- Flamegraph output: a text icicle and Brendan Gregg folded stacks.
- Revert decoding for `Error(string)`, `Panic(uint256)`, and custom errors.
- Storage-access extraction per contract.
- Programmatic API (`traceTransaction`, `analyzeCallFrame`, …) and an
  `evmtrace trace` CLI with `--json`, `--flamegraph`, and `--struct-logs`.

[unreleased]: https://github.com/Fzgt/evmtrace/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Fzgt/evmtrace/releases/tag/v0.1.0
