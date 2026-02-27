import { MENDIX_PROJECT_DIR } from "@/config";

export interface SessionState {
    projectDir: string | undefined;
}

/**
 * Creates a new session state, initialized from the MENDIX_PROJECT_DIR env var (if set).
 * Each MCP server instance gets its own state, so concurrent sessions are isolated.
 */
export function createSessionState(): SessionState {
    return {
        projectDir: MENDIX_PROJECT_DIR
    };
}
