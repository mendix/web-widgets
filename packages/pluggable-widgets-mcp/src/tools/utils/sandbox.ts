import { delimiter, resolve, sep } from "node:path";
import type { SessionState } from "@/tools/session-state";

/**
 * Extra roots to permit alongside the project directory, for development against widgets that live
 * outside a Mendix project. Platform-delimited (`:` on POSIX, `;` on Windows) — splitting on a
 * literal `:` would tear `C:\widgets` into `["C", "\widgets"]`.
 */
const EXTRA_ALLOWED_PATHS_ENV = "MCP_EXTRA_ALLOWED_PATHS";

/**
 * Returns every directory the server is permitted to read or write under.
 *
 * The Mendix project directory is the boundary. It is the only root that is derived from the
 * session rather than the environment, which is what makes the fence stable: an earlier version
 * anchored it to `process.cwd()`, so the security boundary moved depending on who spawned the
 * process.
 */
export function allowedRoots(state: SessionState): string[] {
    return [
        ...(state.projectDir ? [resolve(state.projectDir)] : []),
        ...(process.env[EXTRA_ALLOWED_PATHS_ENV] ?? "")
            .split(delimiter)
            .filter(Boolean)
            .map(path => resolve(path))
    ];
}

/** Checks whether a path resolves inside one of the allowed roots. */
export function isPathAllowed(targetPath: string, state: SessionState): boolean {
    const resolved = resolve(targetPath);
    return allowedRoots(state).some(root => resolved === root || resolved.startsWith(root + sep));
}

/** Human-readable description of the boundary, for error messages. */
export function describeAllowedRoots(state: SessionState): string {
    const roots = allowedRoots(state);
    return roots.length > 0
        ? roots.join(", ")
        : `no project configured — set MENDIX_PROJECT_DIR or call set-project-directory (or set ${EXTRA_ALLOWED_PATHS_ENV})`;
}
