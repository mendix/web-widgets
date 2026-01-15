/**
 * Security Guardrails for File Operations
 *
 * This module centralizes all security validation to:
 * 1. Prevent path traversal attacks (directory escape)
 * 2. Restrict file operations to safe extensions
 * 3. Ensure operations stay within widget boundaries
 *
 * @module security/guardrails
 */

import { extname, resolve } from "node:path";

// =============================================================================
// Configuration
// =============================================================================

/**
 * Allowed file extensions for write operations.
 * Only widget-related source files are permitted.
 */
export const ALLOWED_EXTENSIONS = [".tsx", ".ts", ".xml", ".scss", ".css", ".json", ".md", ".editorConfig.ts"];

/**
 * Config files allowed without extensions (e.g., .gitignore)
 */
const ALLOWED_EXTENSIONLESS_PATTERNS = ["package", "tsconfig", "eslintrc", ".gitignore", ".prettierrc"];

// =============================================================================
// Path Traversal Prevention
// =============================================================================

/**
 * Validates that a file path is within the allowed widget directory.
 * Prevents directory traversal attacks.
 *
 * Uses path.resolve() to canonicalize paths, catching tricks like:
 * - /widget/../../../etc/passwd
 * - encoded sequences
 *
 * @param basePath - The base widget directory path
 * @param relativePath - The relative file path to validate
 * @returns true if the path is safe, false otherwise
 *
 * @example
 * isPathWithinDirectory("/widgets/foo", "src/Bar.tsx") // true
 * isPathWithinDirectory("/widgets/foo", "../secret.txt") // false
 */
export function isPathWithinDirectory(basePath: string, relativePath: string): boolean {
    // Resolve both paths to absolute paths
    const resolvedBase = resolve(basePath);
    const resolvedFull = resolve(basePath, relativePath);

    // Check that the resolved path starts with the base path
    // This prevents ../ traversal attacks
    return resolvedFull.startsWith(resolvedBase + "/") || resolvedFull === resolvedBase;
}

// =============================================================================
// Extension Whitelist
// =============================================================================

/**
 * Validates that a file extension is allowed for write operations.
 *
 * @param filePath - The file path to check
 * @returns true if the extension is allowed, false otherwise
 *
 * @example
 * isExtensionAllowed("Button.tsx") // true
 * isExtensionAllowed("script.exe") // false
 */
export function isExtensionAllowed(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    // Also allow files without extension (like .gitignore patterns)
    // and special config files
    if (ext === "") {
        const filename = filePath.split("/").pop() || "";
        // Allow common config files without extensions
        return ALLOWED_EXTENSIONLESS_PATTERNS.some(name => filename.includes(name) || filename.startsWith("."));
    }
    return ALLOWED_EXTENSIONS.includes(ext);
}

// =============================================================================
// Combined Validation (High-Level API)
// =============================================================================

/**
 * Validates widget path and file path for security.
 * Throws an error if validation fails.
 *
 * @param widgetPath - The base widget directory path
 * @param filePath - The relative file path to validate
 * @param checkExtension - Whether to also validate file extension (for write operations)
 *
 * @throws {Error} If path traversal detected ('..' in path)
 * @throws {Error} If path escapes widget directory
 * @throws {Error} If extension not allowed (when checkExtension=true)
 *
 * @example
 * // Read operation (no extension check)
 * validateFilePath("/widgets/foo", "src/Bar.tsx");
 *
 * // Write operation (with extension check)
 * validateFilePath("/widgets/foo", "src/Bar.tsx", true);
 */
export function validateFilePath(widgetPath: string, filePath: string, checkExtension = false): void {
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
