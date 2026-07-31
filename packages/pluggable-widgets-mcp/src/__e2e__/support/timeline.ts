/**
 * Wall-clock instrumentation for the end-to-end suite.
 *
 * Every tool call the harness makes is timed, so specs get timings without bookkeeping. Runs append
 * a row to docs/benchmarks/timings.jsonl tagged with the commit that produced it: the point is not
 * the number on any single run but the trend, so a change that doubles scaffold time is visible.
 *
 * Only the phases the server actually owns are worth watching closely. `scaffold` and `build` are
 * npm and the Mendix toolchain; they drift with the network and the machine. `setProperties`,
 * `writeFiles` and `deploy` are this server's own work and run in single-digit milliseconds, so
 * movement there means something real changed.
 */

import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PACKAGE_ROOT } from "@/config";

export const TIMINGS_FILE = join(PACKAGE_ROOT, "docs", "benchmarks", "timings.jsonl");

export type RunMode = "warm" | "cold";

export interface TimingRow {
    sha: string;
    mode: RunMode;
    ts: string;
    phases: Record<string, number>;
    totalToWorkingWidget: number;
}

/** Short commit SHA, or "unknown" outside a git checkout — never throw for a benchmark. */
function currentSha(): string {
    try {
        return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
            cwd: PACKAGE_ROOT,
            encoding: "utf-8"
        }).trim();
    } catch {
        return "unknown";
    }
}

export class Timeline {
    private readonly phases = new Map<string, number>();

    /** Times `fn`, filing the result under `phase`. Repeated phases accumulate. */
    async record<T>(phase: string, fn: () => Promise<T>): Promise<T> {
        const started = Date.now();
        try {
            return await fn();
        } finally {
            this.phases.set(phase, (this.phases.get(phase) ?? 0) + (Date.now() - started));
        }
    }

    get(phase: string): number | undefined {
        return this.phases.get(phase);
    }

    get total(): number {
        let sum = 0;
        for (const ms of this.phases.values()) sum += ms;
        return sum;
    }

    toRow(mode: RunMode): TimingRow {
        return {
            sha: currentSha(),
            mode,
            ts: new Date().toISOString(),
            phases: Object.fromEntries(this.phases),
            totalToWorkingWidget: this.total
        };
    }
}

/**
 * Appends a row. Benchmark bookkeeping must never fail a run that otherwise passed, so write errors
 * are swallowed after a warning — a read-only checkout should still be able to run the suite.
 */
export function appendTimingRow(row: TimingRow): void {
    try {
        mkdirSync(dirname(TIMINGS_FILE), { recursive: true });
        appendFileSync(TIMINGS_FILE, `${JSON.stringify(row)}\n`, "utf-8");
    } catch (error) {
        process.stderr.write(`[e2e] could not record timings: ${String(error)}\n`);
    }
}

/** The most recent recorded row for `mode`, excluding `exceptSha`. Used to report a delta. */
export function previousRow(mode: RunMode, exceptSha: string): TimingRow | undefined {
    let content: string;
    try {
        content = readFileSync(TIMINGS_FILE, "utf-8");
    } catch {
        return undefined;
    }

    const rows = content
        .split("\n")
        .filter(line => line.trim() !== "")
        .flatMap(line => {
            try {
                return [JSON.parse(line) as TimingRow];
            } catch {
                return []; // a truncated write should not blind the whole history
            }
        })
        .filter(r => r.mode === mode && r.sha !== exceptSha);

    return rows.at(-1);
}

/** Human-readable summary printed at the end of a run. */
export function formatSummary(row: TimingRow): string {
    const previous = previousRow(row.mode, row.sha);
    const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`;

    const lines = [`[e2e] ${row.mode} run — total ${seconds(row.totalToWorkingWidget)}`];
    for (const [phase, ms] of Object.entries(row.phases)) {
        lines.push(`        ${phase.padEnd(18)} ${seconds(ms)}`);
    }
    if (previous) {
        const delta = row.totalToWorkingWidget - previous.totalToWorkingWidget;
        const sign = delta >= 0 ? "+" : "-";
        lines.push(`        vs ${previous.sha}: ${sign}${seconds(Math.abs(delta))}`);
    }
    return lines.join("\n");
}
