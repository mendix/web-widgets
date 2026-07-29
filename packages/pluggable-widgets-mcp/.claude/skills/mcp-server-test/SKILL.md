---
name: mcp-server-test
description: Use after any change to pluggable-widgets-mcp to verify it still works end to end and to record how fast it is. Runs unit tests, real-process end-to-end tests, and optionally an open-ended run where a model uses the server unaided. Produces a pass/fail result plus a timing comparison against the previous run.
---

# Testing the pluggable-widgets-mcp server

Three layers, fastest first. Run them in order and stop at the first failure — a broken unit test
makes the end-to-end result meaningless.

The reader-facing explanation of what this measures and why lives in
`packages/pluggable-widgets-mcp/docs/evaluation.md`. This file is the operating procedure.

## Arguments

- no arguments — layers 1 and 2 (warm), plus the timing comparison
- `--cold` — adds the from-scratch run that produces the headline timing
- `--llm` — adds layer 3, the open-ended run
- `--only <layer>` — `unit` | `e2e` | `llm`

## Layer 1 — unit tests

```bash
cd packages/pluggable-widgets-mcp
npm run test
```

Run from the package directory, not the repo root. Expect all tests green in a few seconds.

**On failure:** stop. Report which specs failed and what they assert. Do not continue to layer 2.

## Layer 2 — end-to-end tests

```bash
cd packages/pluggable-widgets-mcp
npm run build          # e2e drives dist/, not src/
npm run test:e2e
```

`npm run build` first is not optional — the harness spawns `node dist/index.js`, so a stale `dist/`
tests the previous version of the server and will happily pass while the change under test is broken.

For the from-scratch run:

```bash
E2E_COLD=1 npm run test:e2e
```

Cold mode installs dependencies for real and needs network. If it fails on network, say so plainly —
do not report it as a server failure.

**On a golden-file mismatch:** the diff is the finding. Read it before deciding anything. A changed
golden is either a regression or an intended change to XML generation; only the diff tells you
which. If it is intended, update the golden in the same commit as the generator change, never
separately.

**On failure:** report the failing spec, the assertion, and the actual value. Do not re-run hoping
for a different result.

## Layer 3 — open-ended run (`--llm`)

This measures whether the server is _usable_, not whether it is correct. It only means something if
you approach it genuinely cold.

**Rules — these are the whole point of the exercise:**

- Do **not** read `src/`, the tests, or this repository's documentation first.
- Connect to the server and read only what it tells any client: `tools/list`, the server
  instructions returned at initialize, and the MCP resources it advertises.
- Work only from those. If you find yourself guessing at an argument, that is a finding — record it
  rather than looking up the answer.

**Setup:** start the server against a scratch Mendix project.

```bash
MENDIX_PROJECT_DIR=<path to a Mendix project> node dist/index.js stdio
```

**The brief.** Pick one and treat it as a user request, nothing more:

- "Add a rating-stars widget to my app."
- "I need a badge that shows a status and changes colour."
- "Build me a collapsible panel I can put other widgets inside."

**Record, as you go:**

|                            |                                                                     |
| -------------------------- | ------------------------------------------------------------------- |
| Calls made, in order       | including ones that failed                                          |
| Wrong turns                | a tool called with bad arguments, a step done out of order, a retry |
| Where guidance was missing | anything you had to guess                                           |
| Result                     | did a `.mpk` reach the project's `widgets/` folder?                 |
| Wall-clock                 | from first call to deployed widget                                  |

**Report as findings, not a score.** "The description of `set-widget-properties` does not say
properties replace the previous set, so the first call dropped two properties" is useful. "7/10" is
not.

## Timing

Every end-to-end run appends a row to `packages/pluggable-widgets-mcp/docs/benchmarks/timings.jsonl`
tagged with the current commit. After layer 2, compare the latest row against the previous row of
the same mode and report the delta.

Report it in plain terms:

```
scratch → deployed .mpk    37.4s   (cold)   +1.2s vs 18fe583
rebuild after an edit       3.9s   (warm)   -0.1s vs 18fe583
```

A few seconds of drift on the install or build steps is noise — those are npm and the Mendix
toolchain, not this server. Movement in the server's own steps (`set-widget-properties`,
`write-widget-file`, `deploy-widget`) is not noise: those are measured in milliseconds, so a jump to
hundreds of milliseconds means something real changed.

## Reporting

Give the outcome in this order:

1. **Pass or fail**, and if failed, the single most important reason.
2. **Timings**, with the delta against the previous run.
3. **Findings** from layer 3, if it ran.
4. **What you did not run**, and why.

Never report a layer as passing without having run it. If cold mode was skipped, say it was skipped
rather than quoting the previous run's number as if it were fresh.
