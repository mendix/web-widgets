#!/usr/bin/env ts-node
import { loadReleaseCandidates, loadAllPackages } from "../src/release-candidates";

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        if (command === "--candidates" || command === "-c") {
            // List only packages with unreleased changes
            const candidates = await loadReleaseCandidates();
            console.log(JSON.stringify(candidates, null, 2));
        } else if (command === "--all" || command === "-a") {
            // List all packages (including those without changes)
            const allPackages = await loadAllPackages();
            console.log(JSON.stringify(allPackages, null, 2));
        } else if (command === "--summary" || command === "-s") {
            // Summary view
            const candidates = await loadReleaseCandidates();
            const summary = {
                totalCandidates: candidates.length,
                widgets: candidates.filter(c => c.packageType === "widget").length,
                modules: candidates.filter(c => c.packageType === "module").length,
                packages: candidates.map(c => ({
                    name: c.name,
                    packageType: c.packageType,
                    hasDependencies: c.hasDependencies,
                    version: c.currentVersion,
                    hasChanges: c.hasUnreleasedChanges,
                    dependentWidgetsWithChanges: c.hasDependencies
                        ? c.dependentWidgets!.filter(w => w.hasUnreleasedChanges).length
                        : undefined
                }))
            };
            console.log(JSON.stringify(summary, null, 2));
        } else if (command === "--help" || command === "-h" || !command) {
            printHelp();
        } else {
            console.error(`Unknown command: ${command}`);
            console.error("Use --help for usage information");
            process.exit(1);
        }
    } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

function printHelp(): void {
    console.log(`
rui-release-info - Query release candidates in the monorepo

Commands:
  -c, --candidates    List packages with unreleased changes (release candidates)
                      Returns detailed JSON with changelog entries

  -a, --all          List all packages (including those without changes)
                      Useful for seeing complete package structure

  -s, --summary      Show summary statistics and package list
                      Concise view with counts and basic info

  -h, --help         Show this help message
`);
}

main();
