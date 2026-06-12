# Security Policy

## Supported versions

evmtrace is pre-1.0; only the latest `0.x` release receives fixes.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |
| < 0.1   | ❌        |

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report vulnerabilities privately via GitHub's
[security advisories](https://github.com/Fzgt/evmtrace/security/advisories/new),
or by email to fzgt320@gmail.com. Include a description, reproduction steps, and
the impact you expect.

You can expect an initial response within a few days. Once a fix is ready we will
cut a patch release and credit you in the release notes unless you prefer to stay
anonymous.

## Scope

evmtrace parses untrusted trace data and ABIs. Parsing that leads to a crash,
resource exhaustion, or incorrect gas/decoding output is in scope. Issues in the
underlying RPC node or in third-party dependencies should be reported upstream.
