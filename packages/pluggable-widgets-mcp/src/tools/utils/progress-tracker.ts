import type { LogLevel, ToolContext } from "@/tools/types";
import { sendLogMessage, sendProgress } from "./notifications";

/**
 * Default timing constants for progress tracking.
 */
const DEFAULT_HEARTBEAT_INTERVAL_MS = 3000;
const DEFAULT_STUCK_WARNING_MS = 10000;

/**
 * Configuration options for the ProgressTracker.
 */
export interface ProgressTrackerOptions {
    /** MCP tool context for sending notifications */
    context: ToolContext;
    /** Logger name used in notifications/message (e.g., "scaffolding", "build") */
    logger: string;
    /** Interval in ms between heartbeat logs (default: 3000) */
    heartbeatIntervalMs?: number;
    /** Time in ms before sending a stuck warning (default: 10000) */
    stuckWarningMs?: number;
    /** Total number of steps for progress calculation */
    totalSteps?: number;
}

/**
 * Current state snapshot from the tracker.
 */
export interface ProgressTrackerState {
    step: string;
    stepIndex: number;
    elapsedSeconds: number;
    isComplete: boolean;
}

/**
 * A reusable progress tracker for MCP tools.
 *
 * Provides:
 * - Heartbeat logging at regular intervals
 * - Stuck detection with warnings
 * - Convenient logging methods (info, warning, error, debug)
 * - Progress notification helpers
 * - Step tracking with timing
 *
 * @example
 * ```typescript
 * const tracker = new ProgressTracker({
 *     context,
 *     logger: "scaffolding",
 *     totalSteps: 10
 * });
 *
 * tracker.start("initializing");
 *
 * // Update step when progressing
 * tracker.updateStep("configuring", 1);
 * await tracker.info("Configuration started");
 *
 * // On completion
 * tracker.stop();
 * await tracker.info("Complete!");
 * ```
 */
export class ProgressTracker {
    private readonly context: ToolContext;
    private readonly logger: string;
    private readonly heartbeatIntervalMs: number;
    private readonly stuckWarningMs: number;
    private readonly totalSteps: number;

    private startTime: number = 0;
    private lastStepTime: number = 0;
    private currentStep: string = "idle";
    private currentStepIndex: number = 0;
    private stuckWarningShown: boolean = false;
    private isComplete: boolean = false;
    private heartbeatInterval?: ReturnType<typeof setInterval>;

    constructor(options: ProgressTrackerOptions) {
        this.context = options.context;
        this.logger = options.logger;
        this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS;
        this.stuckWarningMs = options.stuckWarningMs ?? DEFAULT_STUCK_WARNING_MS;
        this.totalSteps = options.totalSteps ?? 0;
    }

    /**
     * Starts the progress tracker with optional initial step.
     * Begins heartbeat interval for periodic status updates.
     */
    start(initialStep = "starting"): void {
        this.startTime = Date.now();
        this.lastStepTime = Date.now();
        this.currentStep = initialStep;
        this.currentStepIndex = 0;
        this.stuckWarningShown = false;
        this.isComplete = false;

        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
            this.checkStuckWarning();
        }, this.heartbeatIntervalMs);
    }

    /**
     * Stops the progress tracker and cleans up intervals.
     * Should be called when the operation completes or fails.
     */
    stop(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }

    /**
     * Updates the current step being tracked.
     * Resets the stuck warning timer.
     */
    updateStep(step: string, index?: number): void {
        this.currentStep = step;
        if (index !== undefined) {
            this.currentStepIndex = index;
        }
        this.lastStepTime = Date.now();
        this.stuckWarningShown = false;
    }

    /**
     * Marks the tracker as complete.
     * Subsequent stuck warnings will not be sent.
     */
    markComplete(): void {
        this.isComplete = true;
    }

    /**
     * Gets the elapsed time in seconds since start.
     */
    get elapsedSeconds(): number {
        if (this.startTime === 0) {
            return 0;
        }
        return Math.round((Date.now() - this.startTime) / 1000);
    }

    /**
     * Gets the current state snapshot.
     */
    get state(): ProgressTrackerState {
        return {
            step: this.currentStep,
            stepIndex: this.currentStepIndex,
            elapsedSeconds: this.elapsedSeconds,
            isComplete: this.isComplete
        };
    }

    /**
     * Sends a log message with the specified level.
     */
    async log(level: LogLevel, message: string, data?: Record<string, unknown>): Promise<void> {
        await sendLogMessage(this.context, level, message, data, this.logger);
    }

    /**
     * Sends an info-level log message.
     */
    async info(message: string, data?: Record<string, unknown>): Promise<void> {
        await this.log("info", message, data);
    }

    /**
     * Sends a warning-level log message.
     */
    async warning(message: string, data?: Record<string, unknown>): Promise<void> {
        await this.log("warning", message, data);
    }

    /**
     * Sends an error-level log message.
     */
    async error(message: string, data?: Record<string, unknown>): Promise<void> {
        await this.log("error", message, data);
    }

    /**
     * Sends a debug-level log message.
     */
    async debug(message: string, data?: Record<string, unknown>): Promise<void> {
        await this.log("debug", message, data);
    }

    /**
     * Sends a progress notification to the client.
     */
    async progress(value: number, message?: string): Promise<void> {
        await sendProgress(this.context, value, message);
    }

    /**
     * Sends a heartbeat debug log with current status.
     */
    private sendHeartbeat(): void {
        const elapsed = this.elapsedSeconds;
        const stepInfo = this.totalSteps > 0 ? ` [${this.currentStepIndex}/${this.totalSteps}]` : "";

        this.debug(`In progress...${stepInfo} (${elapsed}s elapsed)`, {
            step: this.currentStep,
            stepIndex: this.currentStepIndex,
            totalSteps: this.totalSteps,
            elapsedSeconds: elapsed
        }).catch(() => undefined);
    }

    /**
     * Checks if the current step has exceeded the stuck warning threshold.
     */
    private checkStuckWarning(): void {
        if (this.isComplete || this.stuckWarningShown) {
            return;
        }

        const timeSinceLastStep = Date.now() - this.lastStepTime;
        if (timeSinceLastStep > this.stuckWarningMs) {
            this.stuckWarningShown = true;
            const waitingSec = Math.round(timeSinceLastStep / 1000);

            this.warning(`Waiting for response (step: ${this.currentStep}, ${waitingSec}s elapsed)`, {
                step: this.currentStep,
                stepIndex: this.currentStepIndex,
                waitingSeconds: waitingSec
            }).catch(() => undefined);
        }
    }
}
