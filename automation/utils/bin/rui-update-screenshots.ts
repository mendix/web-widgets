#!/usr/bin/env npx ts-node

import { Command } from "commander";
import { exec, execSync, spawn } from "child_process";
import { promisify } from "util";
import { createWriteStream, existsSync, promises as fs, readFileSync } from "fs";
import * as path from "path";
import * as os from "os";
import { pipeline } from "stream/promises";
import fetch from "node-fetch";
import { createLogger, format, transports } from "winston";
import * as crossZip from "cross-zip";
import { GitHub } from "../../utils/src/github";
import { getPackageFileContent } from "../../utils/src/package-info";

const execAsync = promisify(exec);

// Configuration constants
const CONFIG = {
    ATLAS: {
        THEME_TAG: "atlasui-theme-files-2024-01-25",
        CORE_TAG: "atlas-core-v3.18.1",
        REPO_URL: "https://api.github.com/repos/mendix/atlas"
    },
    DOCKER: {
        PLAYWRIGHT_IMAGE: "mcr.microsoft.com/playwright:v1.51.1-jammy",
        TIMEOUT_SECONDS: 60,
        HEALTH_CHECK_INTERVAL: 2000
    },
    PATHS: {
        MENDIX_VERSIONS: "automation/run-e2e/mendix-versions.json",
        PLUGGABLE_WIDGETS: "packages/pluggableWidgets",
        TESTS_DIR: "tests",
        TEST_PROJECT: "tests/testProject"
    },
    ATLAS_DIRS_TO_REMOVE: [
        "themesource/atlas_ui_resources",
        "themesource/atlas_core",
        "themesource/atlas_nativemobile_content",
        "themesource/atlas_web_content",
        "themesource/datawidgets"
    ]
} as const;

// Types
interface TestProject {
    githubUrl: string;
    branchName: string;
}

interface WidgetPackageJson {
    name?: string;
    version?: string;
    scripts?: {
        [key: string]: string;
    };
    testProject?: TestProject;
}

interface MendixVersions {
    latest: string;
    [key: string]: string;
}

interface GitHubAsset {
    name: string;
    url: string;
}

interface GitHubRelease {
    assets: GitHubAsset[];
}

interface UpdateOptions {
    mendixVersion?: string;
    skipAtlasThemesource: boolean;
    githubToken?: string;
}

// Logger setup
const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    ),
    transports: [new transports.Console(), new transports.File({ filename: "screenshot-updater.log", level: "debug" })]
});

// Custom errors
class SnapshotUpdaterError extends Error {
    constructor(
        message: string,
        public readonly code?: string
    ) {
        super(message);
        this.name = "SnapshotUpdaterError";
    }
}

class ValidationError extends SnapshotUpdaterError {
    constructor(message: string) {
        super(message, "VALIDATION_ERROR");
    }
}

class DockerError extends SnapshotUpdaterError {
    constructor(message: string) {
        super(message, "DOCKER_ERROR");
    }
}

// Utility functions
const FileSystem = {
    async ensureDir(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (_error) {
            throw new SnapshotUpdaterError(`Failed to create directory: ${dirPath}`, "FS_ERROR");
        }
    },

    async removeDir(dirPath: string): Promise<void> {
        if (existsSync(dirPath)) {
            await fs.rm(dirPath, { recursive: true, force: true });
        }
    },

    async copyFile(src: string, dest: string): Promise<void> {
        await fs.copyFile(src, dest);
    },

    async createTempDir(): Promise<string> {
        return fs.mkdtemp(path.join(process.env.TMPDIR || "/tmp", "mx-e2e-"));
    }
};

const DockerManager = {
    async isRunning(): Promise<boolean> {
        try {
            await execAsync("docker info");
            return true;
        } catch {
            return false;
        }
    },

    async findFreePort(): Promise<number> {
        try {
            const { stdout } = await execAsync(
                "node -e \"const net = require('net'); const server = net.createServer(); server.listen(0, () => { console.log(server.address().port); server.close(); });\""
            );
            return parseInt(stdout.trim(), 10);
        } catch {
            // Fallback to random port in ephemeral range
            return Math.floor(Math.random() * (65535 - 49152) + 49152);
        }
    },

    async runContainer(options: {
        image: string;
        name?: string;
        ports?: Record<number, number>;
        volumes?: Record<string, string>;
        workdir?: string;
        command?: string;
        detached?: boolean;
        environment?: Record<string, string>;
    }): Promise<string> {
        const args = ["run", "--rm"];

        if (options.detached) args.push("-d");
        if (options.name) args.push("--name", options.name);
        if (options.workdir) args.push("--workdir", options.workdir);

        if (options.ports) {
            Object.entries(options.ports).forEach(([host, container]) => {
                args.push("-p", `${host}:${container}`);
            });
        }

        if (options.volumes) {
            Object.entries(options.volumes).forEach(([host, container]) => {
                args.push("-v", `${host}:${container}`);
            });
        }

        if (options.environment) {
            Object.entries(options.environment).forEach(([key, value]) => {
                args.push("-e", `${key}=${value}`);
            });
        }

        args.push(options.image);
        if (options.command) args.push("bash", "-c", options.command);

        try {
            const { stdout } = await execAsync(`docker ${args.join(" ")}`);
            return stdout.trim();
        } catch (_error) {
            throw new DockerError(`Failed to run container: ${_error}`);
        }
    },

    async isContainerRunning(name: string): Promise<boolean> {
        try {
            const { stdout } = await execAsync(`docker ps --filter name=${name} --format "{{.Names}}"`);
            return stdout.trim() === name;
        } catch {
            return false;
        }
    },

    async stopContainer(name: string): Promise<void> {
        try {
            await execAsync(`docker rm -f ${name}`);
        } catch {
            // Container might not exist or already stopped
        }
    },

    async getContainerLogs(name: string): Promise<string> {
        try {
            const { stdout } = await execAsync(`docker logs ${name}`);
            return stdout;
        } catch {
            return "No logs available";
        }
    }
};

class GitHubHelper extends GitHub {
    private readonly baseUrl = "https://api.github.com";
    private readonly headers: Record<string, string>;

    constructor(private readonly token?: string) {
        super();
        this.headers = {
            "User-Agent": "mx-e2e-script",
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        };

        if (token) {
            this.headers.Authorization = `Bearer ${token}`;
        }
    }

    async downloadAsset(url: string, destPath: string): Promise<void> {
        const response = await fetch(url, {
            headers: {
                ...this.headers,
                Accept: "application/octet-stream"
            }
        });

        if (!response.ok) {
            throw new SnapshotUpdaterError(`Failed to download asset: ${response.statusText}`);
        }

        if (!response.body) {
            throw new SnapshotUpdaterError("No response body");
        }

        const fileStream = createWriteStream(destPath);
        await pipeline(response.body, fileStream);
    }

    async getRelease(repo: string, tag: string): Promise<GitHubRelease> {
        const url = `${this.baseUrl}/repos/${repo}/releases/tags/${tag}`;
        const response = await fetch(url, { headers: this.headers });

        if (!response.ok) {
            throw new SnapshotUpdaterError(`Failed to fetch release: ${response.statusText}`);
        }

        return response.json() as Promise<GitHubRelease>;
    }
}

class AtlasUpdater {
    constructor(
        private readonly githubClient: GitHubHelper,
        private readonly tempDir: string
    ) {}

    async updateTheme(testProjectDir: string): Promise<void> {
        logger.info("Updating Atlas theme...");

        try {
            const release = await this.githubClient.getRelease("mendix/atlas", CONFIG.ATLAS.THEME_TAG);
            const asset = release.assets.find(a => a.name.endsWith(".zip"));

            if (!asset) {
                throw new SnapshotUpdaterError("No .zip asset in Atlas theme release");
            }

            const themeZip = path.join(this.tempDir, "AtlasTheme.zip");
            await this.githubClient.downloadAsset(asset.url, themeZip);

            const themeTarget = path.join(testProjectDir, "theme");
            await FileSystem.removeDir(themeTarget);

            // Extract and copy theme files
            crossZip.unzipSync(themeZip, this.tempDir);
            await this.copyThemeFiles(this.tempDir, themeTarget);

            logger.info("Atlas theme updated successfully");
        } catch (error) {
            logger.warn(`Atlas theme update failed: ${error}`);
        }
    }

    async updateThemesource(testProjectDir: string): Promise<void> {
        logger.info("Updating Atlas themesource...");

        try {
            const release = await this.githubClient.getRelease("mendix/atlas", CONFIG.ATLAS.CORE_TAG);
            const asset = release.assets.find(a => a.name.endsWith(".mpk"));

            if (!asset) {
                throw new SnapshotUpdaterError("No .mpk asset in Atlas Core release");
            }

            // Remove old Atlas directories
            await Promise.all(
                CONFIG.ATLAS_DIRS_TO_REMOVE.map(dir => FileSystem.removeDir(path.join(testProjectDir, dir)))
            );

            const coreMpk = path.join(this.tempDir, "AtlasCore.mpk");
            await this.githubClient.downloadAsset(asset.url, coreMpk);

            // Extract themesource from MPK
            crossZip.unzipSync(coreMpk, this.tempDir);
            const themesourcePath = path.join(this.tempDir, "themesource");

            if (!existsSync(themesourcePath)) {
                throw new SnapshotUpdaterError("themesource directory not found in Atlas Core mpk");
            }

            // Copy themesource
            const targetPath = path.join(testProjectDir, "themesource");
            await this.copyDirectory(themesourcePath, targetPath);
            await execAsync(`chmod -R +w "${targetPath}"`);

            logger.info("Atlas themesource updated successfully");
        } catch (error) {
            logger.warn(`Atlas themesource update failed: ${error}`);
        }
    }

    private async copyThemeFiles(sourceDir: string, targetDir: string): Promise<void> {
        await FileSystem.ensureDir(targetDir);

        const webSource = path.join(sourceDir, "web");
        const nativeSource = path.join(sourceDir, "native");

        if (existsSync(webSource)) {
            const webTarget = path.join(targetDir, "web");
            await this.copyDirectory(webSource, webTarget);
            logger.info(`Copied web theme files to ${webTarget}`);
        }

        if (existsSync(nativeSource)) {
            const nativeTarget = path.join(targetDir, "native");
            await this.copyDirectory(nativeSource, nativeTarget);
            logger.info(`Copied native theme files to ${nativeTarget}`);
        }

        if (!existsSync(webSource) && !existsSync(nativeSource)) {
            throw new SnapshotUpdaterError("No web or native theme directories found in Atlas theme zip");
        }
    }

    private async copyDirectory(source: string, target: string): Promise<void> {
        await FileSystem.ensureDir(target);
        const entries = await fs.readdir(source, { withFileTypes: true });

        await Promise.all(
            entries.map(async entry => {
                const srcPath = path.join(source, entry.name);
                const destPath = path.join(target, entry.name);

                if (entry.isDirectory()) {
                    await this.copyDirectory(srcPath, destPath);
                } else {
                    await FileSystem.copyFile(srcPath, destPath);
                }
            })
        );
    }
}

class WidgetValidator {
    constructor(private readonly rootDir: string) {}

    async getAvailableWidgets(): Promise<string[]> {
        const widgetsDir = path.join(this.rootDir, CONFIG.PATHS.PLUGGABLE_WIDGETS);

        if (!existsSync(widgetsDir)) {
            return [];
        }

        const entries = await fs.readdir(widgetsDir, { withFileTypes: true });
        const widgets = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

        const validWidgets = await Promise.all(
            widgets.map(async name => {
                const isValid = await this.hasE2eTests(name);
                return isValid ? name : null;
            })
        );

        return validWidgets.filter((name): name is string => name !== null);
    }

    async validateWidget(widgetName: string): Promise<void> {
        if (!(await this.hasE2eTests(widgetName))) {
            throw new ValidationError(`Widget '${widgetName}' does not have e2e tests.`);
        }
    }

    private async hasE2eTests(widgetName: string): Promise<boolean> {
        const e2eDir = path.join(this.rootDir, CONFIG.PATHS.PLUGGABLE_WIDGETS, widgetName, "e2e");

        if (!existsSync(e2eDir)) {
            return false;
        }

        try {
            const files = await fs.readdir(e2eDir);
            return files.some(file => file.endsWith(".spec.js"));
        } catch {
            return false;
        }
    }
}

class SnapshotUpdater {
    private readonly rootDir: string;
    private readonly mendixVersions: MendixVersions;
    private readonly validator: WidgetValidator;
    private readonly dockerManager = DockerManager;
    private tempDir?: string;
    private runtimeContainerId?: string;

    constructor() {
        this.rootDir = path.resolve(__dirname, "../../..");
        this.validator = new WidgetValidator(this.rootDir);

        // Load Mendix versions
        const versionsPath = path.join(this.rootDir, CONFIG.PATHS.MENDIX_VERSIONS);
        this.mendixVersions = JSON.parse(readFileSync(versionsPath, "utf8"));

        // Setup cleanup on process termination
        this.setupCleanup();
    }

    private setupCleanup(): void {
        const cleanup = async (): Promise<void> => {
            if (this.tempDir) {
                await FileSystem.removeDir(this.tempDir);
            }
        };

        process.on("SIGINT", cleanup);
        process.on("SIGTERM", cleanup);
        process.on("uncaughtException", cleanup);
        process.on("unhandledRejection", cleanup);
    }

    async updateSnapshots(widgetName: string, options: UpdateOptions): Promise<void> {
        try {
            logger.info(`Starting screenshot update for widget: ${widgetName}`);

            // Validate prerequisites
            await this.validatePrerequisites(widgetName);

            // Use provided Mendix version or default to latest
            const version = options.mendixVersion || this.mendixVersions.latest;
            logger.info(`Using Mendix version: ${version}`);

            // Create temporary directory
            this.tempDir = await FileSystem.createTempDir();

            // Set up test project
            await this.setupTestProject(widgetName, options);

            // Build deployment bundle
            await this.buildDeploymentBundle(widgetName, version);

            // Start Mendix runtime
            const port = await this.startMendixRuntime(widgetName, version);

            // Wait for runtime to be ready
            await this.waitForRuntime(port);

            // Run Playwright tests
            await this.runPlaywrightTests(widgetName, port);

            logger.info(`Screenshots updated successfully for ${widgetName}`);
        } catch (error) {
            logger.error(`Failed to update screenshots: ${error}`);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    private async validatePrerequisites(widgetName: string): Promise<void> {
        // Check if Docker is running
        if (!(await this.dockerManager.isRunning())) {
            throw new DockerError("Docker is not running. Please start Docker and try again.");
        }

        // Validate widget
        await this.validator.validateWidget(widgetName);
    }

    private async setupTestProject(widgetName: string, options: UpdateOptions): Promise<void> {
        logger.info(`Setting up test project for ${widgetName}...`);

        const widgetDir = path.join(this.rootDir, CONFIG.PATHS.PLUGGABLE_WIDGETS, widgetName);
        const widgetPkg = (await getPackageFileContent(widgetDir)) as WidgetPackageJson;

        if (!widgetPkg.testProject) {
            throw new ValidationError("No testProject field in widget package.json");
        }

        // Download and extract test project
        await this.downloadTestProject(widgetPkg.testProject);

        // Update Atlas components
        if (options.githubToken) {
            const githubClient = new GitHubHelper(options.githubToken);
            const atlasUpdater = new AtlasUpdater(githubClient, this.tempDir!);

            const testProjectDir = path.join(this.rootDir, CONFIG.PATHS.TEST_PROJECT);
            await atlasUpdater.updateTheme(testProjectDir);

            if (!options.skipAtlasThemesource) {
                await atlasUpdater.updateThemesource(testProjectDir);
            } else {
                logger.info("Skipping Atlas themesource update");
            }
        } else {
            logger.warn("No GitHub token provided, skipping Atlas updates");
        }

        // Build and copy widget
        const version = widgetPkg.version || "0.0.0";
        await this.buildAndCopyWidget(widgetName, version);
    }

    private async downloadTestProject(testProject: TestProject): Promise<void> {
        const url = `${testProject.githubUrl}/archive/refs/heads/${testProject.branchName}.zip`;
        const zipPath = path.join(this.tempDir!, "testProject.zip");

        logger.info(`Downloading test project from ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new SnapshotUpdaterError(`Failed to download test project: ${response.statusText}`);
        }

        const fileStream = createWriteStream(zipPath);
        if (response.body) {
            await pipeline(response.body, fileStream);
        }

        // Extract and move
        const testsDir = path.join(this.rootDir, CONFIG.PATHS.TESTS_DIR);
        const testProjectDir = path.join(this.rootDir, CONFIG.PATHS.TEST_PROJECT);

        await FileSystem.removeDir(testProjectDir);
        await FileSystem.ensureDir(testsDir);

        crossZip.unzipSync(zipPath, testsDir);

        const entries = await fs.readdir(testsDir);
        const extracted = entries.find(f => f.startsWith("testProjects-"));

        if (!extracted) {
            throw new SnapshotUpdaterError("Extracted test project dir not found");
        }

        await fs.rename(path.join(testsDir, extracted), testProjectDir);

        // Verify .mpr file exists
        const projectFiles = await fs.readdir(testProjectDir);
        if (!projectFiles.some(f => f.endsWith(".mpr"))) {
            throw new SnapshotUpdaterError("No .mpr file in test project");
        }
    }

    private async buildAndCopyWidget(widgetName: string, version: string): Promise<void> {
        logger.info(`Building and copying widget ${widgetName}...`);

        // First, build the widget using the release script
        await this.buildWidget(widgetName);

        // Then copy the generated MPK files to the test project
        await this.copyWidgetMpk(widgetName, version);
    }

    private async buildWidget(widgetName: string): Promise<void> {
        logger.info(`Building widget ${widgetName}...`);

        const widgetDir = path.join(this.rootDir, CONFIG.PATHS.PLUGGABLE_WIDGETS, widgetName);
        const widgetPkg = (await getPackageFileContent(widgetDir)) as WidgetPackageJson;

        if (!widgetPkg || typeof widgetPkg.version !== "string") {
            throw new SnapshotUpdaterError(`Invalid package.json in widget ${widgetName}`);
        }

        // Check if widget has an e2e-update-project script first
        if (widgetPkg.scripts?.["e2e-update-project"]) {
            logger.info(`Running e2e-update-project script for ${widgetName}`);

            // Set environment variable for the script
            process.env.MX_PROJECT_PATH = path.resolve(this.rootDir, CONFIG.PATHS.TEST_PROJECT);

            try {
                await execAsync("pnpm run e2e-update-project", {
                    cwd: widgetDir,
                    env: { ...process.env }
                });
            } catch (error) {
                throw new SnapshotUpdaterError(`Failed to run e2e-update-project script: ${error}`);
            }
        } else {
            // Fallback to standard release script
            logger.info(`Running release script for ${widgetName}`);

            // Build the widget using pnpm run release with filter
            // This ensures the widget is built with all its dependencies
            try {
                await execAsync(`pnpm run --workspace-root release --filter ${widgetPkg.name}`, {
                    cwd: this.rootDir,
                    env: { ...process.env }
                });
            } catch (error) {
                throw new SnapshotUpdaterError(`Failed to build widget ${widgetName}: ${error}`);
            }
        }

        logger.info(`Widget ${widgetName} built successfully`);
    }

    private async copyWidgetMpk(widgetName: string, version: string): Promise<void> {
        const widgetDir = path.join(this.rootDir, CONFIG.PATHS.PLUGGABLE_WIDGETS, widgetName);
        const mpkPattern = path.join(widgetDir, "dist", version, "*.mpk");
        const outDir = path.join(this.rootDir, CONFIG.PATHS.TEST_PROJECT, "widgets");

        await FileSystem.ensureDir(outDir);

        // Find MPK files
        const { stdout } = await execAsync(`ls ${mpkPattern}`);
        const mpkFiles = stdout.trim().split("\n").filter(Boolean);

        if (mpkFiles.length === 0) {
            throw new SnapshotUpdaterError(`No MPK files found in ${mpkPattern}`);
        }

        // Copy MPK files
        await Promise.all(
            mpkFiles.map(mpkFile => FileSystem.copyFile(mpkFile, path.join(outDir, path.basename(mpkFile))))
        );
    }

    private async buildDeploymentBundle(widgetName: string, mendixVersion: string): Promise<void> {
        logger.info(`Building Mendix deployment bundle for ${widgetName}...`);

        const mxbuildImage = `mxbuild:${mendixVersion}`;
        // Get the actual .mpr file path (resolve the glob)
        const mprFiles = await fs.readdir(path.join(this.rootDir, "tests/testProject"));
        const mprFile = mprFiles.find(file => file.endsWith(".mpr"));

        if (!mprFile) {
            throw new SnapshotUpdaterError("No .mpr file found in test project");
        }

        const mprPath = `/source/tests/testProject/${mprFile}`;

        const subCommands = [
            `mx update-widgets --loose-version-check ${mprPath}`,
            `mxbuild --output=/source/automation.mda ${mprPath}`
        ];

        const args = [
            `--tty`,
            `--volume ${this.rootDir}:/source`,
            `--rm`,
            mxbuildImage,
            `bash -c "${subCommands.join(" && ")}"`
        ];

        const command = [`docker run`, ...args].join(" ");

        try {
            execSync(command, { stdio: "inherit" });
        } catch (error) {
            throw new DockerError(`Failed to run container: ${error}`);
        }

        const bundlePath = path.join(this.rootDir, "automation.mda");
        if (!existsSync(bundlePath)) {
            throw new SnapshotUpdaterError("Deployment bundle (automation.mda) was not created. Build failed.");
        }

        logger.info("Success. Bundle created and all the widgets are updated.");
    }

    private async startMendixRuntime(widgetName: string, mendixVersion: string): Promise<number> {
        const port = await this.dockerManager.findFreePort();

        logger.info(`Starting Mendix runtime for ${widgetName} on port ${port}...`);

        // Use the same approach as the working e2e implementation
        const dockerDir = path.join(this.rootDir, "automation/run-e2e/docker");
        const labelPrefix = "e2e.mxruntime";
        const labelValue = Math.round(Math.random() * (999 - 100)) + 100;
        const containerLabel = `${labelPrefix}=${labelValue}`;

        const args = [
            "run",
            "--tty",
            "--workdir",
            "/source",
            "--publish",
            `${port}:8080`,
            "--env",
            `MENDIX_VERSION=${mendixVersion}`,
            "--entrypoint",
            "/bin/bash",
            "--volume",
            `${this.rootDir}:/source`,
            "--volume",
            `${dockerDir}:/shared:ro`,
            "--label",
            containerLabel,
            `mxruntime:${mendixVersion}`,
            "/shared/runtime.sh"
        ];

        spawn("docker", args, { stdio: "inherit" });

        // Wait for container to get an ID
        let runtimeContainerId = "";
        for (let attempts = 100; attempts > 0; --attempts) {
            try {
                const { stdout } = await execAsync(`docker ps --quiet --filter 'label=${containerLabel}'`);
                runtimeContainerId = stdout.trim();
                if (runtimeContainerId) {
                    break;
                }
            } catch (_error) {
                // Continue waiting
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (!runtimeContainerId) {
            throw new DockerError("Failed to get runtime container id. Probably container didn't start.");
        }

        // Store the container ID for cleanup
        this.runtimeContainerId = runtimeContainerId;

        return port;
    }

    private async waitForRuntime(port: number): Promise<void> {
        logger.info(`Waiting for Mendix runtime to be ready on port ${port}...`);

        const ip = "localhost";
        let attempts = 60;
        for (; attempts > 0; --attempts) {
            try {
                const response = await fetch(`http://${ip}:${port}`, {
                    method: "HEAD"
                });
                if (response.ok) {
                    logger.info("Mendix runtime is ready");
                    return;
                }
            } catch (_error) {
                logger.info(`Could not reach http://${ip}:${port}, trying again...`);
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        if (attempts === 0) {
            logger.error("Runtime didn't start");
            logger.error("Print runtime.log...");
            try {
                const logContent = await fs.readFile(path.join(this.rootDir, "results/runtime.log"), "utf8");
                logger.error(logContent);
            } catch (_error) {
                logger.error("Could not read runtime.log");
            }
            throw new DockerError("Runtime didn't start in time, exiting now...");
        }
    }

    private async runPlaywrightTests(widgetName: string, port: number): Promise<void> {
        logger.info(`Running Playwright screenshot update for ${widgetName}...`);

        // Get host IP address like the working e2e implementation
        const nets = os.networkInterfaces();
        let hostIp = "localhost";

        // Find the first non-internal IPv4 address
        for (const name of Object.keys(nets)) {
            const netArray = nets[name];
            if (netArray) {
                for (const net of netArray) {
                    if (net.family === "IPv4" && !net.internal) {
                        hostIp = net.address;
                        break;
                    }
                }
            }
            if (hostIp !== "localhost") break;
        }

        // Create a temporary script file instead of using complex command escaping
        const scriptPath = path.join(this.tempDir!, "playwright-script.sh");
        const scriptContent = `#!/bin/bash
set -e

# Set environment variables for non-interactive mode
export SHELL=/bin/bash
export CI=true
export DEBIAN_FRONTEND=noninteractive

# Install pnpm using npm (more reliable in containers)
echo "Installing pnpm..."
npm install -g pnpm@latest >/dev/null 2>&1

# Navigate to workspace root first to avoid workspace issues
cd /workspace

# Navigate to widget directory
cd /workspace/packages/pluggableWidgets/${widgetName}

echo "Installing Playwright browsers..."
# Install Playwright browsers with explicit flags
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npx playwright install-deps --quiet >/dev/null 2>&1 || true
npx playwright install chromium --with-deps >/dev/null 2>&1 || {
    echo "Playwright install failed, trying without deps..."
    npx playwright install chromium >/dev/null 2>&1
}

# Test runtime connectivity
export URL="http://${hostIp}:${port}"
echo "Testing connection to Mendix runtime at $URL..."
if ! curl -s --head "$URL" >/dev/null 2>&1; then
    echo "Warning: Could not connect to Mendix runtime at $URL"
    echo "Available network interfaces:"
    ip addr show 2>/dev/null | grep -E '^[0-9]+:|inet ' || ifconfig 2>/dev/null | grep -E 'inet '
fi

echo "Running Playwright screenshot tests..."
npx playwright test --update-snapshots --update-source-method=overwrite --project=chromium --reporter=list --workers=1 --timeout=30000

PLAYWRIGHT_EXIT_CODE=$?
echo "Playwright tests completed with exit code: $PLAYWRIGHT_EXIT_CODE"

# Count and report snapshots
SNAPSHOT_COUNT=$(find e2e/ -name "*.png" 2>/dev/null | wc -l | tr -d ' ')
echo "Updated $SNAPSHOT_COUNT screenshot(s)"

exit $PLAYWRIGHT_EXIT_CODE
`;

        await fs.writeFile(scriptPath, scriptContent, { mode: 0o755 });

        // Use execSync with proper Docker network configuration
        const playwrightImage = "mcr.microsoft.com/playwright:v1.51.1-jammy";

        const dockerCommand = [
            "docker",
            "run",
            "--rm",
            "--volume",
            `${this.rootDir}:/workspace`,
            "--volume",
            `${scriptPath}:/tmp/playwright-script.sh`,
            "--env",
            `URL=http://${hostIp}:${port}`,
            "--network",
            "host",
            playwrightImage,
            "bash",
            "/tmp/playwright-script.sh"
        ];

        logger.info(`Running Docker command: ${dockerCommand.join(" ")}`);
        logger.info(`Script content written to: ${scriptPath}`);

        try {
            execSync(dockerCommand.join(" "), { stdio: "inherit" });
            logger.info("Playwright screenshot update completed successfully");
        } catch (error) {
            throw new DockerError(`Failed to run Playwright tests: ${error}`);
        } finally {
            // Cleanup the temporary script file
            try {
                await fs.unlink(scriptPath);
                logger.debug(`Cleaned up temporary script file: ${scriptPath}`);
            } catch (_error) {
                // Ignore cleanup errors - file might not exist or be inaccessible
                logger.debug(`Could not cleanup script file: ${scriptPath}`);
            }
        }
    }

    private async cleanup(): Promise<void> {
        logger.info("Cleaning up...");

        if (this.runtimeContainerId) {
            try {
                await execAsync(`docker rm -f ${this.runtimeContainerId}`);
            } catch (_error) {
                // Ignore cleanup errors
            }
        }

        if (this.tempDir) {
            await FileSystem.removeDir(this.tempDir);
        }

        const bundlePath = path.join(this.rootDir, "automation.mda");
        if (existsSync(bundlePath)) {
            await fs.unlink(bundlePath);
        }
    }

    async getAvailableWidgets(): Promise<string[]> {
        return this.validator.getAvailableWidgets();
    }

    getAvailableVersions(): string[] {
        return Object.keys(this.mendixVersions);
    }

    async listWidgets(): Promise<void> {
        const widgets = await this.getAvailableWidgets();

        if (widgets.length === 0) {
            console.log("No widgets with e2e tests found.");
            return;
        }

        console.log("Available widgets with e2e tests:");
        widgets.forEach(widget => console.log(`  - ${widget}`));
    }

    listVersions(): void {
        console.log("Available Mendix versions:");
        Object.entries(this.mendixVersions).forEach(([key, version]) => {
            console.log(`  ${key}: ${version}`);
        });
    }
}

// CLI setup
const program = new Command();

program
    .name("rui-update-screenshots")
    .description("Update Playwright screenshots for a widget using Mendix runtime in Docker/Linux")
    .version("2.0.0");

program
    .command("list")
    .description("List all available widgets with e2e tests")
    .action(async () => {
        try {
            const updater = new SnapshotUpdater();
            await updater.listWidgets();
        } catch (error) {
            logger.error(`Failed to list widgets: ${error}`);
            process.exit(1);
        }
    });

program
    .command("update")
    .description("Update screenshots for a specific widget")
    .argument("<widget-name>", "Name of the widget to update screenshots for")
    .option("-v, --mendix-version <version>", "Mendix version to use (default: latest)")
    .option("--skip-atlas-themesource", "Skip updating Atlas themesource", false)
    .option("--github-token <token>", "GitHub token for authenticated downloads")
    .action(async (widgetName: string, options) => {
        try {
            const githubToken = options.githubToken || process.env.GITHUB_TOKEN;

            if (!githubToken) {
                logger.warn("No GitHub token provided. Atlas updates will be skipped.");
            }

            const updater = new SnapshotUpdater();
            await updater.updateSnapshots(widgetName, {
                mendixVersion: options.mendixVersion,
                skipAtlasThemesource: options.skipAtlasThemesource,
                githubToken
            });
        } catch (error) {
            logger.error(`Failed to update screenshots: ${error}`);
            process.exit(1);
        }
    });

program
    .command("versions")
    .description("List available Mendix versions")
    .action(() => {
        try {
            const updater = new SnapshotUpdater();
            updater.listVersions();
        } catch (error) {
            logger.error(`Failed to list versions: ${error}`);
            process.exit(1);
        }
    });

if (require.main === module) {
    program.parse();
}

export { SnapshotUpdater };
