import { resolve } from "node:path";
import { GENERATIONS_DIR } from "@/config";
import type { SessionState } from "@/tools/session-state";

/**
 * Checks whether a resolved path is within the allowed directories.
 * Allowed dirs: GENERATIONS_DIR, env-var paths (colon-separated), state.projectDir.
 */
export function isPathAllowed(targetPath: string, state: SessionState, envVar?: string): boolean {
    const resolved = resolve(targetPath);
    const allowed = [
        resolve(GENERATIONS_DIR),
        ...((envVar ? process.env[envVar] : undefined) ?? "")
            .split(":")
            .filter(Boolean)
            .map(p => resolve(p)),
        ...(state.projectDir ? [resolve(state.projectDir)] : [])
    ];
    return allowed.some(a => resolved.startsWith(a + "/") || resolved === a);
}
