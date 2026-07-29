import { getConfiguredProjectDir } from "@/config";

export interface SessionState {
    /**
     * The open Mendix project. Also the sandbox root — every path the server touches must resolve
     * inside it. Undefined until configured, in which case tools refuse to run.
     */
    projectDir: string | undefined;
}

/**
 * Creates a new session state, seeded from MENDIX_PROJECT_DIR when Studio Pro passed one.
 * Each MCP server instance gets its own state, so concurrent sessions are isolated, and
 * `set-project-directory` can re-point a session when the user opens a different project.
 */
export function createSessionState(): SessionState {
    return {
        projectDir: getConfiguredProjectDir()
    };
}
