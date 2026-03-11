#!/usr/bin/env node
/**
 * e2e-mcp: MCP server for Mendix E2E test triage
 *
 * Surfaces CTRF (Common Test Report Format) data from Playwright E2E runs to
 * GitHub Copilot so engineers can ask natural-language questions like:
 *   - "Which tests are flaky?"
 *   - "What failed in the last run?"
 *   - "Which tests are the slowest?"
 *   - "Did anything regress compared to the previous run?"
 *
 * Transport: stdio (VS Code MCP default)
 *
 * Environment variables:
 *   CTRF_DIR  – absolute path to the ctrf/ directory (default: auto-detected
 *               relative to repo root via git rev-parse)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { execSync } from "node:child_process";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Types (CTRF schema subset)
// ---------------------------------------------------------------------------

interface CtrfTest {
    name: string;
    status: "passed" | "failed" | "skipped" | "pending" | "other";
    duration: number;
    retries: number;
    flaky: boolean;
    suite?: string;
    filePath?: string;
    message?: string;
    trace?: string;
    start?: number;
    stop?: number;
}

interface CtrfSummary {
    tests: number;
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
    other: number;
    start: number;
    stop: number;
}

interface CtrfReport {
    results: {
        tool?: { name?: string };
        summary: CtrfSummary;
        tests: CtrfTest[];
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCtrfDir(): string {
    if (process.env.CTRF_DIR) {
        return resolve(process.env.CTRF_DIR);
    }
    try {
        const repoRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
        return join(repoRoot, "automation", "run-e2e", "ctrf");
    } catch {
        return join(process.cwd(), "automation", "run-e2e", "ctrf");
    }
}

function listReportFiles(ctrfDir: string): string[] {
    if (!existsSync(ctrfDir)) return [];
    return readdirSync(ctrfDir)
        .filter(f => f.endsWith(".json"))
        .map(f => join(ctrfDir, f))
        .sort((a, b) => {
            // Sort newest first by filename timestamp (ctrf<timestamp>.json pattern)
            const tsA = parseInt(basename(a).replace(/\D/g, ""), 10) || 0;
            const tsB = parseInt(basename(b).replace(/\D/g, ""), 10) || 0;
            return tsB - tsA;
        });
}

function loadReport(filePath: string): CtrfReport {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as CtrfReport;
}

function loadReports(files: string[]): CtrfReport[] {
    return files.map(f => loadReport(f));
}

function mergeReports(reports: CtrfReport[]): CtrfReport {
    const allTests: CtrfTest[] = reports.flatMap(r => r.results.tests ?? []);
    const summaries = reports.map(r => r.results.summary);
    const merged: CtrfSummary = {
        tests: summaries.reduce((s, r) => s + r.tests, 0),
        passed: summaries.reduce((s, r) => s + r.passed, 0),
        failed: summaries.reduce((s, r) => s + r.failed, 0),
        pending: summaries.reduce((s, r) => s + r.pending, 0),
        skipped: summaries.reduce((s, r) => s + r.skipped, 0),
        other: summaries.reduce((s, r) => s + r.other, 0),
        start: Math.min(...summaries.map(r => r.start ?? Infinity)),
        stop: Math.max(...summaries.map(r => r.stop ?? 0))
    };
    return { results: { summary: merged, tests: allTests } };
}

function fmtDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function widgetFromFilePath(filePath?: string): string {
    if (!filePath) return "unknown";
    const match = filePath.match(/pluggableWidgets\/([^/]+)\//);
    return match ? match[1] : basename(filePath);
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
    name: "e2e-mcp",
    version: "0.1.0",
    description: "Mendix E2E test triage – analyze Playwright CTRF reports"
});

const CTRF_DIR = getCtrfDir();

// ── Tool 1: list_reports ───────────────────────────────────────────────────

server.tool(
    "list_reports",
    "List all available CTRF report files in the ctrf/ directory, newest first.",
    {
        limit: z.number().int().min(1).max(50).optional().describe("Max number of reports to return (default 10)")
    },
    async ({ limit = 10 }) => {
        const files = listReportFiles(CTRF_DIR);
        const slice = files.slice(0, limit);

        if (slice.length === 0) {
            return {
                content: [{ type: "text", text: `No CTRF reports found in ${CTRF_DIR}` }]
            };
        }

        const lines = slice.map((f, i) => {
            try {
                const report = loadReport(f);
                const s = report.results.summary;
                const ts = new Date(s.start).toISOString();
                return `${i + 1}. ${basename(f)}\n   ${ts} | ${s.tests} tests | ✅ ${s.passed} passed | ❌ ${s.failed} failed | ⏱ ${fmtDuration(s.stop - s.start)}`;
            } catch {
                return `${i + 1}. ${basename(f)} (could not parse)`;
            }
        });

        return {
            content: [
                {
                    type: "text",
                    text: `Found ${files.length} report(s) in ${CTRF_DIR}. Showing newest ${slice.length}:\n\n${lines.join("\n\n")}`
                }
            ]
        };
    }
);

// ── Tool 2: get_flaky_tests ────────────────────────────────────────────────

server.tool(
    "get_flaky_tests",
    "Find tests that are flaky – they failed but eventually passed after retries. Accepts an optional report file name; if omitted, uses all reports in the ctrf/ directory.",
    {
        report: z
            .string()
            .optional()
            .describe("Report file name (e.g. merged-report.json or ctrf1234.json). Omit to scan all reports."),
        min_retries: z
            .number()
            .int()
            .min(1)
            .optional()
            .describe("Only include tests retried at least this many times (default 1)")
    },
    async ({ report, min_retries = 1 }) => {
        const files = report ? [join(CTRF_DIR, report)] : listReportFiles(CTRF_DIR);
        if (files.length === 0) {
            return { content: [{ type: "text", text: `No reports found in ${CTRF_DIR}` }] };
        }

        const merged = mergeReports(loadReports(files));
        const flaky = merged.results.tests
            .filter(t => t.flaky && t.retries >= min_retries)
            .sort((a, b) => b.retries - a.retries);

        if (flaky.length === 0) {
            return {
                content: [{ type: "text", text: `No flaky tests found across ${files.length} report(s). 🎉` }]
            };
        }

        const lines = flaky.map(
            (t, i) =>
                `${i + 1}. [${widgetFromFilePath(t.filePath)}] ${t.name}\n` +
                `   retries: ${t.retries} | duration: ${fmtDuration(t.duration)}\n` +
                `   suite: ${t.suite ?? "—"}`
        );

        return {
            content: [
                {
                    type: "text",
                    text:
                        `Found ${flaky.length} flaky test(s) across ${files.length} report(s):\n\n` +
                        lines.join("\n\n") +
                        `\n\n💡 Consider marking these with test.fixme() until root cause is resolved.`
                }
            ]
        };
    }
);

// ── Tool 3: get_failed_tests ───────────────────────────────────────────────

server.tool(
    "get_failed_tests",
    "List tests that permanently failed (status=failed, not eventually retried to pass). Optionally filter by widget name.",
    {
        report: z.string().optional().describe("Report file name. Omit to use the most recent report."),
        widget: z.string().optional().describe("Filter by widget name (e.g. datagrid-web). Partial match supported."),
        include_trace: z.boolean().optional().describe("Include stack trace in output (default false – can be verbose)")
    },
    async ({ report, widget, include_trace = false }) => {
        const files = report ? [join(CTRF_DIR, report)] : listReportFiles(CTRF_DIR).slice(0, 1);

        if (files.length === 0) {
            return { content: [{ type: "text", text: `No reports found in ${CTRF_DIR}` }] };
        }

        const merged = mergeReports(loadReports(files));
        let failed = merged.results.tests.filter(t => t.status === "failed");

        if (widget) {
            failed = failed.filter(t => widgetFromFilePath(t.filePath).includes(widget));
        }

        if (failed.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No permanently-failed tests found${widget ? ` for widget "${widget}"` : ""}. ✅`
                    }
                ]
            };
        }

        const lines = failed.map((t, i) => {
            const msg = t.message ? `\n   error: ${t.message.split("\n").slice(0, 3).join(" | ")}` : "";
            const trace =
                include_trace && t.trace
                    ? `\n   trace:\n${t.trace
                          .split("\n")
                          .slice(0, 8)
                          .map(l => "     " + l)
                          .join("\n")}`
                    : "";
            return (
                `${i + 1}. [${widgetFromFilePath(t.filePath)}] ${t.name}\n` +
                `   retries: ${t.retries} | duration: ${fmtDuration(t.duration)}\n` +
                `   suite: ${t.suite ?? "—"}` +
                msg +
                trace
            );
        });

        return {
            content: [
                {
                    type: "text",
                    text:
                        `${failed.length} permanently-failed test(s)${widget ? ` in "${widget}"` : ""}:\n\n` +
                        lines.join("\n\n")
                }
            ]
        };
    }
);

// ── Tool 4: summarize_run ─────────────────────────────────────────────────

server.tool(
    "summarize_run",
    "High-level summary of an E2E run: pass rate, duration, top failures, flaky count, slowest tests.",
    {
        report: z.string().optional().describe("Report file name. Omit to summarize the most recent report."),
        top_n: z
            .number()
            .int()
            .min(1)
            .max(20)
            .optional()
            .describe("Number of top failures / slowest tests to show (default 5)")
    },
    async ({ report, top_n = 5 }) => {
        const files = report ? [join(CTRF_DIR, report)] : listReportFiles(CTRF_DIR).slice(0, 1);

        if (files.length === 0) {
            return { content: [{ type: "text", text: `No reports found in ${CTRF_DIR}` }] };
        }

        const loaded = mergeReports(loadReports(files));
        const s = loaded.results.summary;
        const tests = loaded.results.tests;
        const passRate = s.tests > 0 ? ((s.passed / s.tests) * 100).toFixed(1) : "N/A";
        const totalDuration = s.stop - s.start;
        const flakyCount = tests.filter(t => t.flaky).length;

        // Top failures (those that didn't recover via retry)
        const failures = tests.filter(t => t.status === "failed").slice(0, top_n);

        // Slowest tests
        const slowest = [...tests].sort((a, b) => b.duration - a.duration).slice(0, top_n);

        // Widget breakdown
        const byWidget = new Map<string, { passed: number; failed: number; flaky: number }>();
        for (const t of tests) {
            const w = widgetFromFilePath(t.filePath);
            const entry = byWidget.get(w) ?? { passed: 0, failed: 0, flaky: 0 };
            if (t.status === "passed") entry.passed++;
            if (t.status === "failed") entry.failed++;
            if (t.flaky) entry.flaky++;
            byWidget.set(w, entry);
        }
        const widgetLines = [...byWidget.entries()]
            .sort((a, b) => b[1].failed - a[1].failed)
            .slice(0, 10)
            .map(
                ([w, stats]) => `  ${w}: ✅${stats.passed} ❌${stats.failed}${stats.flaky ? ` 🔀${stats.flaky}⚡` : ""}`
            );

        const failureLines =
            failures.length > 0
                ? failures.map(t => `  • [${widgetFromFilePath(t.filePath)}] ${t.name}`).join("\n")
                : "  (none)";

        const slowLines = slowest.map(t => `  • ${fmtDuration(t.duration)} – ${t.name}`).join("\n");

        const text = [
            `📊 E2E Run Summary`,
            `  report    : ${files.map(f => basename(f)).join(", ")}`,
            `  total     : ${s.tests} tests`,
            `  passed    : ${s.passed} (${passRate}%)`,
            `  failed    : ${s.failed}`,
            `  flaky     : ${flakyCount}`,
            `  skipped   : ${s.skipped}`,
            `  duration  : ${fmtDuration(totalDuration)}`,
            ``,
            `Widget breakdown (top ${Math.min(widgetLines.length, 10)} by failures):`,
            ...widgetLines,
            ``,
            `Top ${failures.length} failures:`,
            failureLines,
            ``,
            `${top_n} slowest tests:`,
            slowLines
        ].join("\n");

        return { content: [{ type: "text", text }] };
    }
);

// ── Tool 5: compare_runs ──────────────────────────────────────────────────

server.tool(
    "compare_runs",
    "Compare two CTRF reports to detect regressions (new failures) and improvements (newly passing tests). Useful when reviewing a PR's E2E impact.",
    {
        baseline: z.string().describe("Baseline report file name (e.g. the main-branch run)."),
        candidate: z.string().describe("Candidate report file name (e.g. the PR run)."),
        show_improvements: z
            .boolean()
            .optional()
            .describe("Also list tests that newly pass in candidate (default true)")
    },
    async ({ baseline, candidate, show_improvements = true }) => {
        const baseFile = join(CTRF_DIR, baseline);
        const candFile = join(CTRF_DIR, candidate);

        for (const f of [baseFile, candFile]) {
            if (!existsSync(f)) {
                return { content: [{ type: "text", text: `Report not found: ${basename(f)}` }] };
            }
        }

        const baseReport = loadReport(baseFile);
        const candReport = loadReport(candFile);

        const baseMap = new Map(baseReport.results.tests.map(t => [t.name, t]));
        const candMap = new Map(candReport.results.tests.map(t => [t.name, t]));

        // Regressions: passed in baseline, failed in candidate
        const regressions = candReport.results.tests.filter(t => {
            const base = baseMap.get(t.name);
            return t.status === "failed" && base?.status === "passed";
        });

        // New failures: failed in candidate, didn't exist in baseline
        const newFailures = candReport.results.tests.filter(t => {
            return t.status === "failed" && !baseMap.has(t.name);
        });

        // Improvements: failed in baseline, passed in candidate
        const improvements = show_improvements
            ? candReport.results.tests.filter(t => {
                  const base = baseMap.get(t.name);
                  return t.status === "passed" && base?.status === "failed";
              })
            : [];

        const bs = baseReport.results.summary;
        const cs = candReport.results.summary;

        const lines = [
            `🔍 E2E Run Comparison`,
            `  baseline  : ${baseline} (${bs.passed}✅ ${bs.failed}❌ / ${bs.tests} tests)`,
            `  candidate : ${candidate} (${cs.passed}✅ ${cs.failed}❌ / ${cs.tests} tests)`,
            ``,
            `🔴 Regressions (passed → failed): ${regressions.length}`,
            ...(regressions.length
                ? regressions.map(t => `  • [${widgetFromFilePath(t.filePath)}] ${t.name}`)
                : ["  (none)"]),
            ``,
            `🆕 New failures (not in baseline): ${newFailures.length}`,
            ...(newFailures.length
                ? newFailures.map(t => `  • [${widgetFromFilePath(t.filePath)}] ${t.name}`)
                : ["  (none)"])
        ];

        if (show_improvements) {
            lines.push(
                ``,
                `✅ Improvements (failed → passed): ${improvements.length}`,
                ...(improvements.length
                    ? improvements.map(t => `  • [${widgetFromFilePath(t.filePath)}] ${t.name}`)
                    : ["  (none)"])
            );
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
    }
);

// ── Tool 6: get_slowest_tests ─────────────────────────────────────────────

server.tool(
    "get_slowest_tests",
    "List the N slowest passing tests – useful for finding tests that inflate runtime and are candidates for parallelisation or caching.",
    {
        report: z.string().optional().describe("Report file name. Omit to use the most recent report."),
        top_n: z.number().int().min(1).max(50).optional().describe("How many slow tests to return (default 10)"),
        only_passed: z
            .boolean()
            .optional()
            .describe(
                "Only include tests that passed (default true – slow failures are already visible in get_failed_tests)"
            )
    },
    async ({ report, top_n = 10, only_passed = true }) => {
        const files = report ? [join(CTRF_DIR, report)] : listReportFiles(CTRF_DIR).slice(0, 1);

        if (files.length === 0) {
            return { content: [{ type: "text", text: `No reports found in ${CTRF_DIR}` }] };
        }

        const merged = mergeReports(loadReports(files));
        let tests = merged.results.tests;

        if (only_passed) {
            tests = tests.filter(t => t.status === "passed");
        }

        const slowest = [...tests].sort((a, b) => b.duration - a.duration).slice(0, top_n);

        const lines = slowest.map(
            (t, i) =>
                `${i + 1}. ${fmtDuration(t.duration)} – [${widgetFromFilePath(t.filePath)}] ${t.name}\n   suite: ${t.suite ?? "—"}`
        );

        return {
            content: [
                {
                    type: "text",
                    text: `${top_n} slowest${only_passed ? " passing" : ""} tests:\n\n` + lines.join("\n\n")
                }
            ]
        };
    }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
