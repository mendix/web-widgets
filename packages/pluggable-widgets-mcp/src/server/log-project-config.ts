import { getConfiguredProjectDir, validateProjectDir } from "@/config";

/**
 * Reports the configured Mendix project at startup, or says none is set.
 *
 * The sinks are injected rather than chosen here because the two transports have different output
 * contracts: STDIO must keep everything on stderr, since stdout carries the MCP JSON-RPC stream and
 * a stray write corrupts the protocol. Passing them in keeps that distinction visible at the call
 * site instead of hidden behind a branch. Tagging is the sink's job, not ours.
 */
export async function logProjectConfig(
    info: (message: string) => void,
    warn: (message: string) => void
): Promise<void> {
    const projectDir = getConfiguredProjectDir();

    if (!projectDir) {
        info("No project configured (set MENDIX_PROJECT_DIR to enable deploy support)");
        return;
    }

    const validation = await validateProjectDir(projectDir);
    if (validation.valid) {
        info(`Project: ${validation.projectName} (${projectDir})`);
    } else {
        warn(`MENDIX_PROJECT_DIR is set but invalid: ${validation.error}`);
    }
}
