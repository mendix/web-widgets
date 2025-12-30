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
        name: "frontend-guidelines",
        uri: "mendix://guidelines/frontend",
        title: "Frontend Guidelines",
        description: "CSS/SCSS styling, naming conventions, component best practices, and Atlas UI integration",
        filename: "frontend-guidelines.md"
    },
    {
        name: "implementation-plan",
        uri: "mendix://guidelines/implementation",
        title: "Implementation Plan",
        description: "Step-by-step guide for creating new widgets, including PR templates and testing requirements",
        filename: "implementation-plan.md"
    },
    {
        name: "app-flow",
        uri: "mendix://guidelines/app-flow",
        title: "Application Flow",
        description: "Complete widget development lifecycle from scaffolding to Studio Pro integration",
        filename: "app-flow.md"
    },
    {
        name: "backend-structure",
        uri: "mendix://guidelines/backend-structure",
        title: "Backend Structure",
        description:
            "Widget-to-Mendix runtime integration, data handling with EditableValue/ActionValue, and event management",
        filename: "backend-structure.md"
    },
    {
        name: "tech-stack",
        uri: "mendix://guidelines/tech-stack",
        title: "Technology Stack",
        description: "Core technologies (TypeScript, React, SCSS), monorepo structure, and development tools",
        filename: "tech-stack.md"
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
