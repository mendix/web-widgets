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

Recorded by `cold.e2e.test.ts` on 2026-07-31, macOS — nothing on disk to a widget deployed into a
Mendix project:

| Step                            | Time             |
| ------------------------------- | ---------------- |
| Scaffold + install dependencies | 11.6 s           |
| Write the XML definition        | 0.002 s          |
| Write the component files       | 0.002 s          |
| Build the `.mpk`                | 13.4 s           |
| Deploy into the project         | 0.002 s          |
| **Total**                       | **25.0 seconds** |

Rebuilding after an edit: **3.6 seconds.**

The shape of that table is the point. Two steps take all the time, and the server owns neither of
them: `npm install` and the Mendix build toolchain. Everything the server itself does — deriving the
XML, writing the files, deploying the artifact — adds up to **six milliseconds**.

So the honest claim is not that this server is fast. It is that **the pipeline costs nothing**. A
developer doing this by hand pays the same 25 seconds of npm and compilation, plus the scaffolding
decisions, the XML by hand, and the copy into `widgets/`. The server removes those and adds
approximately zero.

Two caveats worth stating before quoting the number. It assumes npm's package cache is warm; on a
machine downloading everything for the first time, expect closer to 40 seconds. And it is one
machine — the value of `timings.jsonl` is the trend across commits, not any single row.

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

Layers 1 and 2 are built and passing: **119 unit tests in 1.3 s**, **24 end-to-end tests in 20 s**
warm, **25 s** for the from-scratch run. Timings are recorded automatically.

Layer 3 is a procedure rather than code — it runs through the `mcp-server-test` skill and produces
findings, not a pass/fail — so there is nothing to build, but it has not been exercised yet.

Three of the end-to-end specs were verified to fail when the thing they guard is broken, rather than
being assumed correct because they were green:

| Spec                         | Broken deliberately                                              | Caught                                                       |
| ---------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `transport.e2e.test.ts`      | added a `console.log` to the built server                        | the stray line on stdout                                     |
| `docs-templates.e2e.test.ts` | restored the unpublished `@mendix/widget-plugin-platform` import | `TS2307`, naming the template's line in `widget-patterns.md` |
| `pipeline.e2e.test.ts`       | no golden file present                                           | refused to self-bless; wrote one and failed pending review   |
