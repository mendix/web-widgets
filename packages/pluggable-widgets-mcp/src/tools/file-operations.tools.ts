import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { z } from "zod";
import { ALLOWED_EXTENSIONS } from "@/config";
import type { AnyToolDefinition, ToolResponse } from "@/tools/types";
import { createErrorResponse, createToolResponse } from "@/tools/utils/response";

// =============================================================================
// Path Validation Utilities
// =============================================================================

/**
 * Validates that a file path is within the allowed widget directory.
 * Prevents directory traversal attacks.
 *
 * @param basePath - The base widget directory path
 * @param relativePath - The relative file path to validate
 * @returns true if the path is safe, false otherwise
 */
function isPathWithinDirectory(basePath: string, relativePath: string): boolean {
    // Resolve both paths to absolute paths
    const resolvedBase = resolve(basePath);
    const resolvedFull = resolve(basePath, relativePath);

    // Check that the resolved path starts with the base path
    // This prevents ../ traversal attacks
    return resolvedFull.startsWith(resolvedBase + "/") || resolvedFull === resolvedBase;
}

/**
 * Validates that a file extension is allowed for write operations.
 *
 * @param filePath - The file path to check
 * @returns true if the extension is allowed, false otherwise
 */
function isExtensionAllowed(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    // Also allow files without extension (like .gitignore patterns)
    // and special config files
    if (ext === "") {
        const filename = filePath.split("/").pop() || "";
        // Allow common config files without extensions
        return ["package", "tsconfig", "eslintrc", ".gitignore", ".prettierrc"].some(
            name => filename.includes(name) || filename.startsWith(".")
        );
    }
    return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * Validates widget path and file path for security.
 * Throws an error if validation fails.
 */
function validatePaths(widgetPath: string, filePath: string, checkExtension = false): void {
    // Check for obvious path traversal attempts
    if (filePath.includes("..")) {
        throw new Error("Path traversal not allowed: '..' detected in file path");
    }

    // Validate path is within widget directory
    if (!isPathWithinDirectory(widgetPath, filePath)) {
        throw new Error("File path must be within the widget directory");
    }

    // For write operations, check extension
    if (checkExtension && !isExtensionAllowed(filePath)) {
        throw new Error(`File extension not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(", ")}`);
    }
}

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

type ListWidgetFilesInput = z.infer<typeof listWidgetFilesSchema>;
type ReadWidgetFileInput = z.infer<typeof readWidgetFileSchema>;
type WriteWidgetFileInput = z.infer<typeof writeWidgetFileSchema>;

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
        validatePaths(args.widgetPath, args.filePath);

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
        validatePaths(args.widgetPath, args.filePath, true);

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

/**
 * Returns file operation tools for reading and writing widget files.
 *
 * These tools enable LLMs to implement widget functionality after scaffolding
 * by reading existing code and writing new/updated files.
 */
export function getFileOperationTools(): AnyToolDefinition[] {
    return [
        {
            name: "list-widget-files",
            title: "List Widget Files",
            description: LIST_WIDGET_FILES_DESCRIPTION,
            inputSchema: listWidgetFilesSchema,
            handler: handleListWidgetFiles
        },
        {
            name: "read-widget-file",
            title: "Read Widget File",
            description: READ_WIDGET_FILE_DESCRIPTION,
            inputSchema: readWidgetFileSchema,
            handler: handleReadWidgetFile
        },
        {
            name: "write-widget-file",
            title: "Write Widget File",
            description: WRITE_WIDGET_FILE_DESCRIPTION,
            inputSchema: writeWidgetFileSchema,
            handler: handleWriteWidgetFile
        }
    ];
}
