import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { analyzeMpk } from "@/tools/utils/mpk-analyzer";

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(CURRENT_DIR, "../../../../../..");

// Repository-relative paths to fixture .mpk files.
// Tests skip gracefully when files are not present on the current machine.
const KNOWN_GOOD_MPK = `${REPO_ROOT}/packages/pluggableWidgets/badge-web/dist/3.2.3/Badge.mpk`;

const MCP_GENERATED_MPK = `${REPO_ROOT}/packages/pluggable-widgets-mcp/generations/asciiArtWidget/dist/1.0.0/mendix.AsciiArtWidget.mpk`;

describe("mpk-analyzer (diagnostic)", () => {
    it("analyzes a known-good .mpk from pluggableWidgets", () => {
        if (!existsSync(KNOWN_GOOD_MPK)) {
            console.log(`[SKIP] fixture not found: ${KNOWN_GOOD_MPK}`);
            expect(true).toBe(true);
            return;
        }

        const analysis = analyzeMpk(KNOWN_GOOD_MPK);

        console.log("\n=== Known-Good MPK Analysis ===");
        console.log(`Path:         ${analysis.mpkPath}`);
        console.log(`Size:         ${analysis.mpkSizeBytes} bytes`);
        console.log(`Files (${analysis.files.length}):`);
        for (const f of analysis.files) {
            console.log(`  ${f.path} (${f.sizeBytes} bytes)`);
        }
        if (analysis.packageXml) {
            console.log(`\npackage.xml:`);
            console.log(`  clientModuleName: ${analysis.packageXml.clientModuleName}`);
            console.log(`  version:          ${analysis.packageXml.version}`);
            console.log(`  widgetFilePath:   ${analysis.packageXml.widgetFilePath}`);
            console.log(`  filesPath:        ${analysis.packageXml.filesPath}`);
        }
        if (analysis.widgetXml) {
            console.log(`\nWidget XML:`);
            console.log(`  id:                ${analysis.widgetXml.id}`);
            console.log(`  pluginWidget:      ${analysis.widgetXml.pluginWidget}`);
            console.log(`  needsEntityContext:${analysis.widgetXml.needsEntityContext}`);
            console.log(`  propertyCount:     ${analysis.widgetXml.propertyCount}`);
        }
        if (analysis.bundle) {
            console.log(`\nJS Bundle:`);
            console.log(`  fileName:          ${analysis.bundle.fileName}`);
            console.log(`  sizeBytes:         ${analysis.bundle.sizeBytes}`);
            console.log(`  format:            ${analysis.bundle.format}`);
            console.log(`  containsDefine:    ${analysis.bundle.containsDefine}`);
            console.log(`  exportDefault:     ${analysis.bundle.containsExportDefault}`);
            console.log(`  exportNamed:       ${analysis.bundle.containsExportNamed}`);
            console.log(`  hasUseStrict:      ${analysis.bundle.hasUseStrict}`);
            console.log(`  exportPattern:     ${JSON.stringify(analysis.bundle.exportPattern)}`);
        }
        if (analysis.errors.length > 0) {
            console.log(`\nErrors: ${JSON.stringify(analysis.errors)}`);
        }

        // Structural assertions — known-good widget must parse cleanly
        expect(analysis.errors).toHaveLength(0);
        expect(analysis.packageXml).toBeDefined();
        expect(analysis.bundle).toBeDefined();
        // format is diagnostic output, not asserted — printed above for comparison
    });

    it("analyzes an MCP-generated .mpk", () => {
        if (!existsSync(MCP_GENERATED_MPK)) {
            console.log(`[SKIP] fixture not found: ${MCP_GENERATED_MPK}`);
            expect(true).toBe(true);
            return;
        }

        const analysis = analyzeMpk(MCP_GENERATED_MPK);

        console.log("\n=== MCP-Generated MPK Analysis ===");
        console.log(`Path:         ${analysis.mpkPath}`);
        console.log(`Size:         ${analysis.mpkSizeBytes} bytes`);
        console.log(`Files (${analysis.files.length}):`);
        for (const f of analysis.files) {
            console.log(`  ${f.path} (${f.sizeBytes} bytes)`);
        }
        if (analysis.packageXml) {
            console.log(`\npackage.xml:`);
            console.log(`  clientModuleName: ${analysis.packageXml.clientModuleName}`);
            console.log(`  version:          ${analysis.packageXml.version}`);
            console.log(`  widgetFilePath:   ${analysis.packageXml.widgetFilePath}`);
            console.log(`  filesPath:        ${analysis.packageXml.filesPath}`);
        }
        if (analysis.widgetXml) {
            console.log(`\nWidget XML:`);
            console.log(`  id:                ${analysis.widgetXml.id}`);
            console.log(`  pluginWidget:      ${analysis.widgetXml.pluginWidget}`);
            console.log(`  needsEntityContext:${analysis.widgetXml.needsEntityContext}`);
            console.log(`  propertyCount:     ${analysis.widgetXml.propertyCount}`);
        }
        if (analysis.bundle) {
            console.log(`\nJS Bundle:`);
            console.log(`  fileName:          ${analysis.bundle.fileName}`);
            console.log(`  sizeBytes:         ${analysis.bundle.sizeBytes}`);
            console.log(`  format:            ${analysis.bundle.format}`);
            console.log(`  containsDefine:    ${analysis.bundle.containsDefine}`);
            console.log(`  exportDefault:     ${analysis.bundle.containsExportDefault}`);
            console.log(`  exportNamed:       ${analysis.bundle.containsExportNamed}`);
            console.log(`  hasUseStrict:      ${analysis.bundle.hasUseStrict}`);
            console.log(`  exportPattern:     ${JSON.stringify(analysis.bundle.exportPattern)}`);
        }
        if (analysis.errors.length > 0) {
            console.log(`\nErrors: ${JSON.stringify(analysis.errors)}`);
        }

        // Diagnostic only — we don't assert expected format because we're discovering it
        expect(analysis.mpkSizeBytes).toBeGreaterThan(0);
    });

    it("compares known-good vs MCP-generated side by side", () => {
        const goodExists = existsSync(KNOWN_GOOD_MPK);
        const mcpExists = existsSync(MCP_GENERATED_MPK);

        if (!goodExists || !mcpExists) {
            console.log(`[SKIP] both fixtures required for comparison`);
            console.log(`  known-good: ${goodExists ? "found" : "MISSING"}`);
            console.log(`  mcp-generated: ${mcpExists ? "found" : "MISSING"}`);
            expect(true).toBe(true);
            return;
        }

        const good = analyzeMpk(KNOWN_GOOD_MPK);
        const mcp = analyzeMpk(MCP_GENERATED_MPK);

        console.log("\n=== Side-by-Side Comparison ===");
        console.log(`${"FIELD".padEnd(30)} ${"KNOWN-GOOD".padEnd(40)} MCP-GENERATED`);
        console.log("-".repeat(100));

        const row = (label: string, a: unknown, b: unknown): void => {
            const aStr = String(a ?? "(none)");
            const bStr = String(b ?? "(none)");
            const flag = aStr !== bStr ? " <<<" : "";
            console.log(`${label.padEnd(30)} ${aStr.padEnd(40)} ${bStr}${flag}`);
        };

        row("mpkSizeBytes", good.mpkSizeBytes, mcp.mpkSizeBytes);
        row("fileCount", good.files.length, mcp.files.length);
        row("packageXml.clientModuleName", good.packageXml?.clientModuleName, mcp.packageXml?.clientModuleName);
        row("packageXml.version", good.packageXml?.version, mcp.packageXml?.version);
        row("packageXml.widgetFilePath", good.packageXml?.widgetFilePath, mcp.packageXml?.widgetFilePath);
        row("packageXml.filesPath", good.packageXml?.filesPath, mcp.packageXml?.filesPath);
        row("widgetXml.id", good.widgetXml?.id, mcp.widgetXml?.id);
        row("widgetXml.pluginWidget", good.widgetXml?.pluginWidget, mcp.widgetXml?.pluginWidget);
        row("widgetXml.needsEntityContext", good.widgetXml?.needsEntityContext, mcp.widgetXml?.needsEntityContext);
        row("widgetXml.propertyCount", good.widgetXml?.propertyCount, mcp.widgetXml?.propertyCount);
        row("bundle.format", good.bundle?.format, mcp.bundle?.format);
        row("bundle.containsDefine", good.bundle?.containsDefine, mcp.bundle?.containsDefine);
        row("bundle.exportDefault", good.bundle?.containsExportDefault, mcp.bundle?.containsExportDefault);
        row("bundle.exportNamed", good.bundle?.containsExportNamed, mcp.bundle?.containsExportNamed);
        row("bundle.hasUseStrict", good.bundle?.hasUseStrict, mcp.bundle?.hasUseStrict);
        row("bundle.sizeBytes", good.bundle?.sizeBytes, mcp.bundle?.sizeBytes);
        row("errors", good.errors.join("|"), mcp.errors.join("|"));

        console.log("\nKnown-good file list:");
        for (const f of good.files) console.log(`  ${f.path}`);
        console.log("\nMCP-generated file list:");
        for (const f of mcp.files) console.log(`  ${f.path}`);

        // The comparison runs — the console output is the diagnostic result.
        // We assert only that both analyses completed without fatal errors.
        expect(good.mpkSizeBytes).toBeGreaterThan(0);
        expect(mcp.mpkSizeBytes).toBeGreaterThan(0);
    });

    it("widget XML id matches file path convention", () => {
        if (!existsSync(MCP_GENERATED_MPK)) {
            console.log(`[SKIP] fixture not found: ${MCP_GENERATED_MPK}`);
            expect(true).toBe(true);
            return;
        }

        const analysis = analyzeMpk(MCP_GENERATED_MPK);

        if (!analysis.widgetXml?.id) {
            console.log("[SKIP] no widget XML id found in MPK");
            expect(true).toBe(true);
            return;
        }

        // Convert dotted id to slash-based path: "mendix.asciiartwidget.AsciiArtWidget"
        // → "mendix/asciiartwidget/AsciiArtWidget"
        const idAsPath = analysis.widgetXml.id.replace(/\./g, "/");
        const jsPath = `${idAsPath}.js`;

        console.log(`\n=== Widget Id / File Path Check ===`);
        console.log(`  widgetXml.id:    ${analysis.widgetXml.id}`);
        console.log(`  expected js path: ${jsPath}`);
        console.log(`  files in MPK:`);
        for (const f of analysis.files) {
            console.log(`    ${f.path}`);
        }

        const match = analysis.files.some(
            f => f.path === jsPath || f.path.endsWith(`/${idAsPath.split("/").slice(-2).join("/")}.js`)
        );
        expect(match).toBe(true);
    });
});
