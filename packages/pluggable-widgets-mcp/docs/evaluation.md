# How we evaluate this server

This server turns a description of a Mendix widget into a working `.mpk` sitting in a project's
`widgets/` folder. This document explains how we prove that it works, and how fast it does it.

Two questions, answered separately:

- **Does it work?** — a test suite that runs the whole thing for real and compares the result
  against a known-correct answer.
- **How good is it?** — timings recorded on every run, and an open-ended run where a model uses the
  server with no help and we watch what happens.

---

## What the server does

Six steps, start to finish. A client calls them in order.

| Step                    | What it does                                                       |
| ----------------------- | ------------------------------------------------------------------ |
| `get-project-info`      | Finds the Mendix project and reports what widgets it already has   |
| `create-widget`         | Scaffolds a new widget into the project's `widget-sources/` folder |
| `set-widget-properties` | Writes the widget's XML definition from a list of properties       |
| `write-widget-file`     | Writes the component source the model authored                     |
| `build-widget`          | Compiles it into a `.mpk`                                          |
| `deploy-widget`         | Copies the `.mpk` into the project so Studio Pro picks it up       |

The division of labour matters and the tests are built around it: **the server does what is
mechanically derivable, the model does what needs judgment.** XML is derived from a property list, so
the server owns it and we can check it against a golden file. Component code needs taste, so the
model writes it, guided by [`docs/widget-patterns.md`](./widget-patterns.md) — which the server
serves to the model as a resource.

---

## How we prove it works

Three layers, fastest first. Each catches something the layer above cannot.

### Layer 1 — unit tests · `src/__tests__/`, `src/**/__tests__/`

119 tests, a few seconds. They call the server's tools through a real client/server pair held in
memory, so a call still goes through protocol serialisation and input validation. They cover error
codes, path security, XML generation and the response contract.

What they cannot catch: anything involving a real process, a real install, or a real build.

`npm run test`

### Layer 2 — end-to-end tests · `src/__e2e__/`

The server is launched **as a real child process** and driven over the real protocol, exactly as
Studio Pro drives it. A real widget is scaffolded, really built, and the resulting `.mpk` is unzipped
and inspected.

| File                         | What it proves                                                                                                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pipeline.e2e.test.ts`       | The whole happy path. The generated XML matches a golden file **and** validates against Mendix's own schema. The `.mpk` is opened and its contents checked — a file existing is not the same as a file Studio Pro can load. |
| `transport.e2e.test.ts`      | The server never writes stray output onto the channel it talks to Studio Pro over. One stray character corrupts the connection. Also: the server exits when Studio Pro does, instead of orphaning.                          |
| `failure-modes.e2e.test.ts`  | A broken component reports the exact file, line and column. Attempts to write outside the project are refused — including when the server is started from a different folder, which used to move the boundary.              |
| `docs-templates.e2e.test.ts` | Every code template in `docs/widget-patterns.md` actually compiles. Since the model writes component code from those templates, a broken template is a broken product.                                                      |
| `cold.e2e.test.ts`           | A genuine from-scratch run with a real dependency install. This is the one that produces the headline timing. Off by default.                                                                                               |

`npm run test:e2e` · from scratch: `E2E_COLD=1 npm run test:e2e`

### Layer 3 — open-ended run

A model is pointed at the server knowing nothing about it — no source code, only what the server
tells clients about itself — and given a plain instruction like _"add a rating-stars widget to my
app."_ We record every call it made, every wrong turn, and whether it reached a working widget.

Layers 1 and 2 check that the server is correct. This layer checks that it is **usable** — that the
tool descriptions and instructions are good enough for a model to succeed without a human
translating.

Run via the `mcp-server-test` skill with `--llm`.

---

## How fast it is

Every run records how long each step took. Results are appended to
[`docs/benchmarks/timings.jsonl`](./benchmarks/) with the commit they came from, so a change that
makes things slower shows up immediately instead of being noticed months later.

Measured on 2026-07-29, macOS, from nothing to a deployed widget:

| Step                            | Time             |
| ------------------------------- | ---------------- |
| Scaffold + install dependencies | 23.3 s           |
| Write the XML definition        | 0.003 s          |
| Write the component files       | 0.002 s          |
| Build the `.mpk`                | 14.1 s           |
| Deploy into the project         | 0.003 s          |
| **Total**                       | **≈ 37 seconds** |

Rebuilding an existing widget after an edit: **≈ 4 seconds.**

Almost all of it is the two steps the server doesn't control — npm installing dependencies, and the
Mendix build toolchain compiling. The server's own work is measured in **milliseconds**. That is the
number worth quoting: the pipeline adds essentially nothing to the cost of building a widget by hand,
and removes all the steps in between.

---

## Running the whole thing

The `mcp-server-test` skill runs the layers in order and summarises the result, including how the
timings compare to the previous run.

| Command                   | What it runs                                                  |
| ------------------------- | ------------------------------------------------------------- |
| `/mcp-server-test`        | Unit tests, then end-to-end tests, then the timing comparison |
| `/mcp-server-test --cold` | Adds the from-scratch run and records the headline number     |
| `/mcp-server-test --llm`  | Adds the open-ended run                                       |

Use it after any change to the server. The first two layers are a pass/fail gate; the third is a
judgment call you read.

---

## Where things live

|                                      |                                                     |
| ------------------------------------ | --------------------------------------------------- |
| The server's tools                   | `src/tools/`                                        |
| XML generation                       | `src/generators/xml-generator.ts`                   |
| Guidance served to the model         | `docs/widget-patterns.md`, `docs/property-types.md` |
| Unit tests                           | `src/__tests__/`, `src/**/__tests__/`               |
| End-to-end tests                     | `src/__e2e__/`                                      |
| Known-correct XML to compare against | `src/__e2e__/goldens/`                              |
| Timing history                       | `docs/benchmarks/timings.jsonl`                     |
| The test workflow itself             | `.claude/skills/mcp-server-test/`                   |
| Working notes on the server's design | `.claude/skills/pluggable-widgets-mcp/`             |

Both skills live in the repository, so anyone contributing gets them automatically — no local setup.

---

## Status

Layer 1 is in place and passing — 119 tests. Layers 2 and 3 and the timing history are designed and
not yet built; the numbers quoted above were measured by hand on 2026-07-29 while validating the
pipeline against a real Mendix project, and will be reproduced automatically once `src/__e2e__/`
lands.
