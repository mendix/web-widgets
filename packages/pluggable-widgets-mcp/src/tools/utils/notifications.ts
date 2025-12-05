import type { LogLevel, ToolContext } from "@/tools/types";

/**
 * Sends a progress notification to the MCP client.
 * Only sends if the client provided a progressToken in the request.
 */
export async function sendProgress(context: ToolContext, progress: number, message?: string): Promise<void> {
    const progressToken = context._meta?.progressToken;
    if (progressToken) {
        await context.sendNotification({
            method: "notifications/progress",
            params: { progressToken, progress, total: 100, message }
        });
    }
}

/**
 * Sends a logging message notification to the MCP client.
 * Works independently of progressToken and provides detailed context.
 */
export async function sendLogMessage(
    context: ToolContext,
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    logger = "mcp-tools"
): Promise<void> {
    await context.sendNotification({
        method: "notifications/message",
        params: {
            level,
            logger,
            data: { message, ...data }
        }
    });
}
