import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { z } from "zod";
import { ALLOWED_EXTENSIONS, validateFilePath } from "@/security";
import type { ToolResponse } from "@/tools/types";
import { createErrorResponse, createToolResponse } from "@/tools/utils/response";

// =============================================================================
// Schemas
// =============================================================================

const listWidgetFilesSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the widget directory (returned by create-widget tool)")
});

const readWidgetFileSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the widget directory"),
    filePath: z
        .string()
        .min(1)
        .describe("Relative path to the file within the widget directory (e.g., 'src/MyWidget.tsx')")
});

const writeWidgetFileSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the widget directory"),
    filePath: z
        .string()
        .min(1)
        .describe("Relative path to the file within the widget directory (e.g., 'src/components/MyComponent.tsx')"),
    content: z.string().describe("The content to write to the file")
});

const fileEntrySchema = z.object({
    relativePath: z.string().min(1).describe("Relative path within the widget directory"),
    content: z.string().describe("File content to write")
});

const batchWriteWidgetFilesSchema = z.object({
    widgetPath: z.string().min(1).describe("Absolute path to the widget directory"),
    files: z.array(fileEntrySchema).min(1).describe("Array of files to write")
});

type ListWidgetFilesInput = z.infer<typeof listWidgetFilesSchema>;
type ReadWidgetFileInput = z.infer<typeof readWidgetFileSchema>;
type WriteWidgetFileInput = z.infer<typeof writeWidgetFileSchema>;
type BatchWriteWidgetFilesInput = z.infer<typeof batchWriteWidgetFilesSchema>;

// =============================================================================
// Tool Handlers
// =============================================================================

/**
 * Recursively lists all files in a directory.
 */
async function listFilesRecursive(
    dir: string,
    basePath: string,
    files: Array<{ path: string; type: string }> = []
): Promise<Array<{ path: string; type: string }>> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = fullPath.replace(basePath + "/", "");

        if (entry.isDirectory()) {
            // Skip node_modules and other common non-source directories
            if (["node_modules", ".git", "dist", "build"].includes(entry.name)) {
                continue;
            }
            await listFilesRecursive(fullPath, basePath, files);
        } else {
            const ext = extname(entry.name).toLowerCase();
            files.push({
                path: relativePath,
                type: ext || "file"
            });
        }
    }

    return files;
}

async function handleListWidgetFiles(args: ListWidgetFilesInput): Promise<ToolResponse> {
    try {
        // Verify the directory exists
        const stats = await stat(args.widgetPath);
        if (!stats.isDirectory()) {
            return createErrorResponse(`Path is not a directory: ${args.widgetPath}`);
        }

        const files = await listFilesRecursive(args.widgetPath, args.widgetPath);

        // Group files by type for better readability
        const byType = files.reduce<Record<string, string[]>>((acc, file) => {
            const type = file.type || "other";
            if (!acc[type]) acc[type] = [];
            acc[type].push(file.path);
            return acc;
        }, {});

        const output = [`Widget files in ${args.widgetPath}:`, "", `Total: ${files.length} files`, ""];

        // Sort types for consistent output
        const sortedTypes = Object.keys(byType).sort();
        for (const type of sortedTypes) {
            output.push(`${type} files (${byType[type].length}):`);
            for (const path of byType[type].sort()) {
                output.push(`  - ${path}`);
            }
            output.push("");
        }

        return createToolResponse(output.join("\n"));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return createErrorResponse(`Failed to list widget files: ${message}`);
    }
}

async function handleReadWidgetFile(args: ReadWidgetFileInput): Promise<ToolResponse> {
    try {
        validateFilePath(args.widgetPath, args.filePath);

        const fullPath = join(args.widgetPath, args.filePath);
        const content = await readFile(fullPath, "utf-8");

        return createToolResponse(
            [`File: ${args.filePath}`, `Path: ${fullPath}`, "", "Content:", "```", content, "```"].join("\n")
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return createErrorResponse(`Failed to read file: ${message}`);
    }
}

async function handleWriteWidgetFile(args: WriteWidgetFileInput): Promise<ToolResponse> {
    try {
        validateFilePath(args.widgetPath, args.filePath, true);

        const fullPath = join(args.widgetPath, args.filePath);

        // Ensure parent directory exists
        const parentDir = dirname(fullPath);
        await mkdir(parentDir, { recursive: true });

        // Write the file
        await writeFile(fullPath, args.content, "utf-8");

        console.error(`[file-operations] Wrote file: ${fullPath}`);

        return createToolResponse(
            [
                `Successfully wrote file: ${args.filePath}`,
                `Full path: ${fullPath}`,
                `Size: ${args.content.length} characters`
            ].join("\n")
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return createErrorResponse(`Failed to write file: ${message}`);
    }
}

async function handleBatchWriteWidgetFiles(args: BatchWriteWidgetFilesInput): Promise<ToolResponse> {
    const results: Array<{ path: string; success: boolean; error?: string }> = [];

    // Validate all paths first before writing anything
    for (const file of args.files) {
        try {
            validateFilePath(args.widgetPath, file.relativePath, true);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return createErrorResponse(`Validation failed for ${file.relativePath}: ${message}`);
        }
    }

    // Write all files
    for (const file of args.files) {
        try {
            const fullPath = join(args.widgetPath, file.relativePath);

            // Ensure parent directory exists
            const parentDir = dirname(fullPath);
            await mkdir(parentDir, { recursive: true });

            // Write the file
            await writeFile(fullPath, file.content, "utf-8");

            console.error(`[file-operations] Wrote file: ${fullPath}`);
            results.push({ path: file.relativePath, success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            results.push({ path: file.relativePath, success: false, error: message });
        }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    if (failed.length === 0) {
        return createToolResponse(
            [`Successfully wrote ${successful.length} files:`, "", ...successful.map(r => `  - ${r.path}`)].join("\n")
        );
    } else if (successful.length === 0) {
        return createErrorResponse(
            [`Failed to write all ${failed.length} files:`, "", ...failed.map(r => `  - ${r.path}: ${r.error}`)].join(
                "\n"
            )
        );
    } else {
        return createToolResponse(
            [
                `Partial success: ${successful.length} written, ${failed.length} failed`,
                "",
                "Written:",
                ...successful.map(r => `  - ${r.path}`),
                "",
                "Failed:",
                ...failed.map(r => `  - ${r.path}: ${r.error}`)
            ].join("\n")
        );
    }
}

// =============================================================================
// Tool Definitions
// =============================================================================

const LIST_WIDGET_FILES_DESCRIPTION = `Lists all files in a widget directory.

Use this tool after scaffolding a widget to understand its structure.
Returns files grouped by type (.tsx, .xml, .scss, etc.).

Excludes: node_modules, .git, dist, build directories.`;

const READ_WIDGET_FILE_DESCRIPTION = `Reads the contents of a file from a widget directory.

Use this to inspect existing code before making modifications.
The file path should be relative to the widget directory.

Examples:
  - src/MyWidget.tsx (main component)
  - src/MyWidget.xml (properties definition)
  - src/components/Header.tsx (sub-component)`;

const WRITE_WIDGET_FILE_DESCRIPTION = `Writes content to a file in a widget directory.

Use this to implement widget functionality after scaffolding.
Creates parent directories if they don't exist.

IMPORTANT: Follow Mendix widget development guidelines:
  - Use TypeScript and React
  - Follow Atlas UI styling conventions
  - Use proper Mendix API types (EditableValue, ActionValue, etc.)
  - Fetch mendix://guidelines/* resources for detailed instructions

Allowed file types: ${ALLOWED_EXTENSIONS.join(", ")}`;

const BATCH_WRITE_WIDGET_FILES_DESCRIPTION = `Writes multiple files to a widget directory in a single operation.

Use this for atomic writes when updating XML, TSX, and SCSS together.
Validates all paths before writing to ensure consistency.
Creates parent directories if they don't exist.

Example use case: After generating XML from a widget definition,
write the XML, TSX component, and SCSS files together.

Allowed file types: ${ALLOWED_EXTENSIONS.join(", ")}`;

/**
 * Registers file operation tools for reading and writing widget files.
 *
 * These tools enable LLMs to implement widget functionality after scaffolding
 * by reading existing code and writing new/updated files.
 */
export function registerFileOperationTools(server: McpServer): void {
    server.registerTool(
        "list-widget-files",
        {
            title: "List Widget Files",
            description: LIST_WIDGET_FILES_DESCRIPTION,
            inputSchema: listWidgetFilesSchema
        },
        handleListWidgetFiles
    );

    server.registerTool(
        "read-widget-file",
        {
            title: "Read Widget File",
            description: READ_WIDGET_FILE_DESCRIPTION,
            inputSchema: readWidgetFileSchema
        },
        handleReadWidgetFile
    );

    server.registerTool(
        "write-widget-file",
        {
            title: "Write Widget File",
            description: WRITE_WIDGET_FILE_DESCRIPTION,
            inputSchema: writeWidgetFileSchema
        },
        handleWriteWidgetFile
    );

    server.registerTool(
        "batch-write-widget-files",
        {
            title: "Batch Write Widget Files",
            description: BATCH_WRITE_WIDGET_FILES_DESCRIPTION,
            inputSchema: batchWriteWidgetFilesSchema
        },
        handleBatchWriteWidgetFiles
    );
}
