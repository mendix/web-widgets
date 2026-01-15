/**
 * Security module exports.
 *
 * This module provides security guardrails for file operations:
 * - Path traversal prevention
 * - Extension whitelist validation
 *
 * @example
 * import { validateFilePath, ALLOWED_EXTENSIONS } from "@/security";
 *
 * validateFilePath(widgetPath, filePath, true); // Throws if invalid
 */

export { ALLOWED_EXTENSIONS, isExtensionAllowed, isPathWithinDirectory, validateFilePath } from "./guardrails";
