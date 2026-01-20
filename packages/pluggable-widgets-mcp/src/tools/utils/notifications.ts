import type { LogLevel, ToolContext } from "@/tools/types";

/**
 * Sends a progress notification to the MCP client.
 * Only sends if the client provided a progressToken in the request.
 *
 * **Where this appears:**
 * - ⚙️ Client UI indicators (spinners, progress bars, status indicators)
 * - 🔍 MCP Inspector's Notifications panel (for debugging)
 * - ❌ NOT in the chat conversation history
 *
 * **MCP Specification Behavior:**
 * Progress notifications are routed to the client's UI layer, not the conversation.
 * This is by design—use tool results for chat-visible output.
 *
 * @param context - Tool execution context with notification sender
 * @param progress - Progress value (0-100)
 * @param message - Optional progress description
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
 *
 * **Where this appears:**
 * - 🔍 MCP Inspector's Logs panel (for debugging)
 * - 🛠️ Client developer consoles (if supported)
 * - ❌ NOT in the chat conversation history
 *
 * **MCP Specification Behavior:**
 * Log notifications are routed to debug/inspector layers, not the conversation.
 * These are intended for developers debugging MCP servers, not end-user feedback.
 * For chat-visible messages, use tool result content instead.
 *
 * @param context - Tool execution context with notification sender
 * @param level - Log severity level (debug, info, warning, error)
 * @param message - Human-readable log message
 * @param data - Additional structured data for debugging
 * @param logger - Logger name/category (defaults to "mcp-tools")
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
