import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Finds the widget's built `.mpk`, searching `dist/` recursively (builds land in `dist/<version>/`).
 *
 * Returns the **most recently modified** match. An earlier version returned whichever file
 * `readdirSync` yielded first, so a widget with both `dist/1.0.0/` and `dist/1.0.1/` present could
 * deploy the stale artifact — silently, since the copy itself succeeds.
 */
export function findMpkFile(widgetPath: string): string | undefined {
    const distPath = join(widgetPath, "dist");
    if (!existsSync(distPath)) {
        return undefined;
    }

    try {
        const candidates = collectMpkFiles(distPath);
        if (candidates.length === 0) {
            return undefined;
        }

        return candidates.reduce((newest, candidate) =>
            statSync(candidate).mtimeMs > statSync(newest).mtimeMs ? candidate : newest
        );
    } catch {
        return undefined;
    }
}

function collectMpkFiles(dir: string, found: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            collectMpkFiles(fullPath, found);
        } else if (entry.name.endsWith(".mpk")) {
            found.push(fullPath);
        }
    }
    return found;
}
