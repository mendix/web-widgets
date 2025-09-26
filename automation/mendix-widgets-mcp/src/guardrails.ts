import { stat } from "fs/promises";
import { resolve, join, relative } from "path";

export interface GuardrailConfig {
    allowedPaths: string[];
    blockedPaths: string[];
    allowedFileTypes: string[];
    maxFileSize: number; // in bytes
    dryRunByDefault: boolean;
}

export const DEFAULT_GUARDRAILS: GuardrailConfig = {
    allowedPaths: ["packages/pluggableWidgets", "packages/customWidgets", "packages/modules", "packages/shared"],
    blockedPaths: ["node_modules", ".git", "dist", "build", ".turbo", ".cache"],
    allowedFileTypes: [".ts", ".tsx", ".js", ".jsx", ".xml", ".json", ".scss", ".css", ".md", ".txt"],
    maxFileSize: 1024 * 1024, // 1MB
    dryRunByDefault: true
};

export class GuardrailError extends Error {
    constructor(
        message: string,
        public code: string
    ) {
        super(message);
        this.name = "GuardrailError";
    }
}

export class Guardrails {
    private config: GuardrailConfig;
    private repoRoot: string;

    constructor(repoRoot: string, config: Partial<GuardrailConfig> = {}) {
        this.repoRoot = resolve(repoRoot);
        this.config = { ...DEFAULT_GUARDRAILS, ...config };
    }

    /**
     * Validate that a path is safe to access
     */
    async validatePath(targetPath: string): Promise<string> {
        const resolvedPath = resolve(targetPath);
        const relativePath = relative(this.repoRoot, resolvedPath);

        // Must be within repo
        if (relativePath.startsWith("..")) {
            throw new GuardrailError(`Path ${targetPath} is outside the repository`, "PATH_OUTSIDE_REPO");
        }

        // Check against blocked paths
        for (const blocked of this.config.blockedPaths) {
            if (relativePath.includes(blocked)) {
                throw new GuardrailError(`Path ${targetPath} contains blocked directory: ${blocked}`, "PATH_BLOCKED");
            }
        }

        // Check against allowed paths (must start with one of them)
        const isAllowed = this.config.allowedPaths.some(allowed => relativePath.startsWith(allowed));

        if (!isAllowed) {
            throw new GuardrailError(
                `Path ${targetPath} is not in allowed directories: ${this.config.allowedPaths.join(", ")}`,
                "PATH_NOT_ALLOWED"
            );
        }

        // Check if path exists
        try {
            await stat(resolvedPath);
        } catch {
            throw new GuardrailError(`Path ${targetPath} does not exist`, "PATH_NOT_FOUND");
        }

        return resolvedPath;
    }

    /**
     * Validate that a file is safe to edit
     */
    async validateFile(filePath: string): Promise<string> {
        const validatedPath = await this.validatePath(filePath);
        const stats = await stat(validatedPath);

        if (!stats.isFile()) {
            throw new GuardrailError(`${filePath} is not a file`, "NOT_A_FILE");
        }

        // Check file size
        if (stats.size > this.config.maxFileSize) {
            throw new GuardrailError(
                `File ${filePath} is too large (${stats.size} bytes > ${this.config.maxFileSize} bytes)`,
                "FILE_TOO_LARGE"
            );
        }

        // Check file extension
        const hasAllowedExtension = this.config.allowedFileTypes.some(ext => filePath.endsWith(ext));

        if (!hasAllowedExtension) {
            throw new GuardrailError(
                `File ${filePath} has disallowed extension. Allowed: ${this.config.allowedFileTypes.join(", ")}`,
                "FILE_TYPE_NOT_ALLOWED"
            );
        }

        return validatedPath;
    }

    /**
     * Validate that a package path is a valid widget/module
     */
    async validatePackage(packagePath: string): Promise<string> {
        const validatedPath = await this.validatePath(packagePath);

        // Must have package.json
        const packageJsonPath = join(validatedPath, "package.json");
        try {
            await stat(packageJsonPath);
        } catch {
            throw new GuardrailError(`${packagePath} is not a valid package (no package.json)`, "INVALID_PACKAGE");
        }

        // Should be in packages directory structure
        const relativePath = relative(this.repoRoot, validatedPath);
        const pathParts = relativePath.split("/");

        if (pathParts.length < 3 || pathParts[0] !== "packages") {
            throw new GuardrailError(
                `${packagePath} is not in expected packages directory structure`,
                "INVALID_PACKAGE_STRUCTURE"
            );
        }

        const category = pathParts[1];
        const validCategories = ["pluggableWidgets", "customWidgets", "modules", "shared"];

        if (!validCategories.includes(category)) {
            throw new GuardrailError(
                `Package category ${category} is not valid. Must be one of: ${validCategories.join(", ")}`,
                "INVALID_PACKAGE_CATEGORY"
            );
        }

        return validatedPath;
    }

    /**
     * Check if an operation should run in dry-run mode
     */
    shouldDryRun(dryRun?: boolean): boolean {
        return dryRun ?? this.config.dryRunByDefault;
    }

    /**
     * Validate command execution context
     */
    validateCommand(command: string, cwd: string): void {
        // Block dangerous commands
        const dangerousCommands = [
            "rm",
            "rmdir",
            "del",
            "delete",
            "mv",
            "move",
            "cp -r",
            "copy",
            "git reset --hard",
            "git clean -fd",
            "npm publish",
            "pnpm publish",
            "sudo",
            "chmod 777"
        ];

        const isDangerous = dangerousCommands.some(dangerous =>
            command.toLowerCase().includes(dangerous.toLowerCase())
        );

        if (isDangerous) {
            throw new GuardrailError(
                `Command contains potentially dangerous operations: ${command}`,
                "DANGEROUS_COMMAND"
            );
        }

        // Validate working directory
        const relativeCwd = relative(this.repoRoot, resolve(cwd));
        if (relativeCwd.startsWith("..")) {
            throw new GuardrailError(`Command working directory ${cwd} is outside repository`, "CWD_OUTSIDE_REPO");
        }
    }

    /**
     * Create a safe subset of environment variables
     */
    createSafeEnv(customEnv: Record<string, string> = {}): Record<string, string> {
        // Only pass through safe environment variables
        const safeEnvKeys = ["NODE_ENV", "PATH", "HOME", "USER", "SHELL", "MX_PROJECT_PATH", "DEBUG", "CI"];

        const safeEnv: Record<string, string> = {};
        for (const key of safeEnvKeys) {
            if (process.env[key]) {
                safeEnv[key] = process.env[key]!;
            }
        }

        // Add custom env (validated)
        for (const [key, value] of Object.entries(customEnv)) {
            if (key.startsWith("MX_") || key === "DEBUG" || key === "NODE_ENV") {
                safeEnv[key] = value;
            }
        }

        return safeEnv;
    }
}

/**
 * Wrapper for safe error handling that maintains MCP response format
 */
export function withGuardrails<T extends any[], R extends { content: any[] }>(
    fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
    return async (...args: T) => {
        try {
            return await fn(...args);
        } catch (error) {
            if (error instanceof GuardrailError) {
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(
                                {
                                    success: false,
                                    error: error.message,
                                    code: error.code
                                },
                                null,
                                2
                            )
                        }
                    ]
                } as R;
            }

            // For other errors, wrap them too
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                success: false,
                                error: error instanceof Error ? error.message : String(error),
                                code: "UNKNOWN_ERROR"
                            },
                            null,
                            2
                        )
                    }
                ]
            } as R;
        }
    };
}
