import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Finds the .mpk file in the widget's dist directory.
 * Searches recursively (usually in dist/x.x.x/).
 */
export function findMpkFile(widgetPath: string): string | undefined {
    const distPath = join(widgetPath, "dist");
    if (!existsSync(distPath)) return undefined;

    try {
        const searchDir = (dir: string): string | undefined => {
            const entries = readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = join(dir, entry.name);
                if (entry.isDirectory()) {
                    const found = searchDir(fullPath);
                    if (found) return found;
                } else if (entry.name.endsWith(".mpk")) {
                    return fullPath;
                }
            }
            return undefined;
        };
        return searchDir(distPath);
    } catch {
        return undefined;
    }
}
