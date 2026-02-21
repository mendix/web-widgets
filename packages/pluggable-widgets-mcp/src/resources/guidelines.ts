import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DOCS_DIR } from "@/config";

/**
 * Definition for a guideline resource.
 */
export interface GuidelineResource {
    /** Unique resource name */
    name: string;
    /** Resource URI (e.g., mendix://guidelines/frontend) */
    uri: string;
    /** Human-readable title */
    title: string;
    /** Description of what this guideline covers */
    description: string;
    /** Source markdown file name */
    filename: string;
}

/**
 * All available guideline resources.
 */
export const GUIDELINE_RESOURCES: GuidelineResource[] = [
    {
        name: "property-types",
        uri: "mendix://guidelines/property-types",
        title: "Property Types Reference",
        description:
            "Complete reference for all Mendix widget property types (string, boolean, action, attribute, etc.) with JSON schema and XML output examples",
        filename: "property-types.md"
    },
    {
        name: "widget-patterns",
        uri: "mendix://guidelines/widget-patterns",
        title: "Widget Patterns",
        description:
            "Reusable patterns for common widget types (button, input, display, container, data list) with TSX and SCSS templates",
        filename: "widget-patterns.md"
    }
];

/**
 * Cache for loaded guideline content to avoid repeated file reads.
 */
const guidelineCache = new Map<string, string>();

/**
 * Loads the content of a guideline file.
 * Caches content after first load for performance.
 *
 * @param filename - The markdown filename to load
 * @returns The file content as a string
 */
export async function loadGuidelineContent(filename: string): Promise<string> {
    // Check cache first
    if (guidelineCache.has(filename)) {
        return guidelineCache.get(filename)!;
    }

    const filePath = join(DOCS_DIR, filename);

    try {
        const content = await readFile(filePath, "utf-8");
        guidelineCache.set(filename, content);
        return content;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load guideline ${filename}: ${message}`);
    }
}

/**
 * Clears the guideline cache. Useful for testing or hot-reloading.
 */
export function clearGuidelineCache(): void {
    guidelineCache.clear();
}
