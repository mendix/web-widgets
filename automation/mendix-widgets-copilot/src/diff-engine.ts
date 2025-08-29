import { readFile, writeFile } from "fs/promises";
import { relative } from "path";
import { Guardrails } from "./guardrails.js";

export interface FileChange {
    filePath: string;
    originalContent: string;
    newContent: string;
    operation: "create" | "update" | "delete";
    description: string;
}

export interface DiffResult {
    changes: FileChange[];
    summary: {
        filesChanged: number;
        linesAdded: number;
        linesRemoved: number;
        description: string;
    };
    preview: string;
}

export interface ApplyResult {
    success: boolean;
    appliedChanges: string[];
    errors: string[];
    rollbackInfo?: {
        backupFiles: Record<string, string>;
        canRollback: boolean;
    };
}

export class DiffEngine {
    private guardrails: Guardrails;
    private repoRoot: string;

    constructor(repoRoot: string, guardrails: Guardrails) {
        this.repoRoot = repoRoot;
        this.guardrails = guardrails;
    }

    /**
     * Create a diff preview for proposed changes
     */
    async createDiff(changes: Omit<FileChange, "originalContent">[]): Promise<DiffResult> {
        const fileChanges: FileChange[] = [];
        let totalLinesAdded = 0;
        let totalLinesRemoved = 0;

        for (const change of changes) {
            await this.guardrails.validateFile(change.filePath);

            let originalContent = "";
            if (change.operation !== "create") {
                try {
                    originalContent = await readFile(change.filePath, "utf-8");
                } catch (error) {
                    if (change.operation === "update") {
                        throw new Error(`Cannot update non-existent file: ${change.filePath}`);
                    }
                }
            }

            const fileChange: FileChange = {
                ...change,
                originalContent
            };

            // Calculate line changes
            const originalLines = originalContent.split("\n").length;
            const newLines = change.newContent.split("\n").length;

            if (change.operation === "create") {
                totalLinesAdded += newLines;
            } else if (change.operation === "delete") {
                totalLinesRemoved += originalLines;
            } else {
                const lineDiff = newLines - originalLines;
                if (lineDiff > 0) {
                    totalLinesAdded += lineDiff;
                } else {
                    totalLinesRemoved += Math.abs(lineDiff);
                }
            }

            fileChanges.push(fileChange);
        }

        const preview = this.generateUnifiedDiff(fileChanges);

        return {
            changes: fileChanges,
            summary: {
                filesChanged: fileChanges.length,
                linesAdded: totalLinesAdded,
                linesRemoved: totalLinesRemoved,
                description: this.generateSummaryDescription(fileChanges)
            },
            preview
        };
    }

    /**
     * Apply changes to files (with optional dry-run)
     */
    async applyChanges(
        diffResult: DiffResult,
        options: { dryRun?: boolean; createBackup?: boolean } = {}
    ): Promise<ApplyResult> {
        const { dryRun = true, createBackup = true } = options;
        const result: ApplyResult = {
            success: true,
            appliedChanges: [],
            errors: []
        };

        if (dryRun) {
            // Just validate all changes without applying
            for (const change of diffResult.changes) {
                try {
                    await this.guardrails.validateFile(change.filePath);
                    result.appliedChanges.push(`[DRY-RUN] Would ${change.operation} ${change.filePath}`);
                } catch (error) {
                    result.errors.push(`Validation failed for ${change.filePath}: ${error}`);
                    result.success = false;
                }
            }
            return result;
        }

        // Create backups if requested
        const backupFiles: Record<string, string> = {};
        if (createBackup) {
            for (const change of diffResult.changes) {
                if (change.operation !== "create" && change.originalContent) {
                    backupFiles[change.filePath] = change.originalContent;
                }
            }
            result.rollbackInfo = {
                backupFiles,
                canRollback: true
            };
        }

        // Apply changes
        for (const change of diffResult.changes) {
            try {
                await this.guardrails.validateFile(change.filePath);

                switch (change.operation) {
                    case "create":
                    case "update":
                        await writeFile(change.filePath, change.newContent, "utf-8");
                        result.appliedChanges.push(
                            `${change.operation === "create" ? "Created" : "Updated"} ${change.filePath}`
                        );
                        break;
                    case "delete":
                        // For safety, we don't actually delete files, just empty them
                        await writeFile(change.filePath, "", "utf-8");
                        result.appliedChanges.push(`Emptied ${change.filePath} (safe delete)`);
                        break;
                }
            } catch (error) {
                result.errors.push(`Failed to ${change.operation} ${change.filePath}: ${error}`);
                result.success = false;
            }
        }

        return result;
    }

    /**
     * Rollback changes using backup information
     */
    async rollbackChanges(rollbackInfo: NonNullable<ApplyResult["rollbackInfo"]>): Promise<ApplyResult> {
        const result: ApplyResult = {
            success: true,
            appliedChanges: [],
            errors: []
        };

        if (!rollbackInfo.canRollback) {
            result.success = false;
            result.errors.push("Rollback information indicates rollback is not possible");
            return result;
        }

        for (const [filePath, originalContent] of Object.entries(rollbackInfo.backupFiles)) {
            try {
                await this.guardrails.validateFile(filePath);
                await writeFile(filePath, originalContent, "utf-8");
                result.appliedChanges.push(`Restored ${filePath}`);
            } catch (error) {
                result.errors.push(`Failed to restore ${filePath}: ${error}`);
                result.success = false;
            }
        }

        return result;
    }

    /**
     * Generate unified diff format preview
     */
    private generateUnifiedDiff(changes: FileChange[]): string {
        const lines: string[] = [];

        for (const change of changes) {
            const relativePath = relative(this.repoRoot, change.filePath);

            lines.push(`--- ${change.operation === "create" ? "/dev/null" : relativePath}`);
            lines.push(`+++ ${change.operation === "delete" ? "/dev/null" : relativePath}`);

            if (change.operation === "create") {
                const newLines = change.newContent.split("\n");
                lines.push(`@@ -0,0 +1,${newLines.length} @@`);
                for (const line of newLines) {
                    lines.push(`+${line}`);
                }
            } else if (change.operation === "delete") {
                const originalLines = change.originalContent.split("\n");
                lines.push(`@@ -1,${originalLines.length} +0,0 @@`);
                for (const line of originalLines) {
                    lines.push(`-${line}`);
                }
            } else {
                // Update - generate proper diff
                const originalLines = change.originalContent.split("\n");
                const newLines = change.newContent.split("\n");
                const diffLines = this.generateLineDiff(originalLines, newLines);

                lines.push(`@@ -1,${originalLines.length} +1,${newLines.length} @@`);
                lines.push(...diffLines);
            }

            lines.push(""); // Empty line between files
        }

        return lines.join("\n");
    }

    /**
     * Simple line-by-line diff generator
     */
    private generateLineDiff(originalLines: string[], newLines: string[]): string[] {
        const result: string[] = [];
        const maxLines = Math.max(originalLines.length, newLines.length);

        for (let i = 0; i < maxLines; i++) {
            const originalLine = originalLines[i];
            const newLine = newLines[i];

            if (originalLine === undefined) {
                // Line added
                result.push(`+${newLine}`);
            } else if (newLine === undefined) {
                // Line removed
                result.push(`-${originalLine}`);
            } else if (originalLine === newLine) {
                // Line unchanged
                result.push(` ${originalLine}`);
            } else {
                // Line changed
                result.push(`-${originalLine}`);
                result.push(`+${newLine}`);
            }
        }

        return result;
    }

    /**
     * Generate human-readable summary description
     */
    private generateSummaryDescription(changes: FileChange[]): string {
        const operations = changes.reduce(
            (acc, change) => {
                acc[change.operation] = (acc[change.operation] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const parts: string[] = [];
        if (operations.create) parts.push(`${operations.create} files created`);
        if (operations.update) parts.push(`${operations.update} files updated`);
        if (operations.delete) parts.push(`${operations.delete} files deleted`);

        const mainDescription = parts.join(", ");
        const fileTypes = this.getAffectedFileTypes(changes);

        return `${mainDescription} (${fileTypes.join(", ")})`;
    }

    /**
     * Get types of files being changed
     */
    private getAffectedFileTypes(changes: FileChange[]): string[] {
        const extensions = new Set<string>();

        for (const change of changes) {
            const ext = change.filePath.split(".").pop()?.toLowerCase();
            if (ext) {
                extensions.add(ext);
            }
        }

        const typeMap: Record<string, string> = {
            xml: "manifests",
            ts: "TypeScript",
            tsx: "React components",
            js: "JavaScript",
            jsx: "React JSX",
            scss: "styles",
            css: "styles",
            json: "configuration",
            md: "documentation"
        };

        return Array.from(extensions).map(ext => typeMap[ext] || ext);
    }
}

/**
 * Helper to create simple text replacement changes
 */
export function createTextReplacement(
    filePath: string,
    _oldText: string,
    _newText: string,
    description: string
): Omit<FileChange, "originalContent"> {
    return {
        filePath,
        newContent: "", // Will be filled by readFile and replace
        operation: "update",
        description
    };
}

/**
 * Helper to create property addition to XML
 */
export function createXmlPropertyAddition(
    xmlFilePath: string,
    _propertyXml: string,
    _insertAfter: string,
    description: string
): Omit<FileChange, "originalContent"> {
    return {
        filePath: xmlFilePath,
        newContent: "", // Will be computed based on original content
        operation: "update",
        description: `Add property to ${xmlFilePath}: ${description}`
    };
}
