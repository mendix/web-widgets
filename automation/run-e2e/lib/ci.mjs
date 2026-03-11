import c from "ansi-colors";
import findFreePort from "find-free-port";
import nodeIp from "ip";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import p from "node:path";
import sh from "shelljs";
import parseArgs from "yargs-parser";
import { createDeploymentBundle, prepareImage, startPlaywright, startRuntime } from "./docker-utils.mjs";
import { setupTestProject } from "./setup-test-project.mjs";
import { updateTestProject } from "./update-test-project.mjs";
import { fetchWithReport } from "./utils.mjs";
import * as config from "./config.mjs";

const { ls } = sh;

// Path to the docker directory (contains docker-compose.yml + Dockerfiles)
const DOCKER_DIR = fileURLToPath(new URL("../docker", import.meta.url));
const COMPOSE_FILE = p.join(DOCKER_DIR, "docker-compose.yml");

export async function ci() {
    console.log(c.cyan("Run e2e tests in CI environment"));

    const parseArgsOptions = {
        string: ["mx-version"],
        boolean: ["update-project", "setup-project", "use-compose"],
        default: {
            "update-project": true,
            "setup-project": true,
            // Docker Compose is the default; pass --no-use-compose for raw Docker.
            "use-compose": true
        },
        configuration: {
            "boolean-negation": true,
            "camel-case-expansion": true
        }
    };

    const options = parseArgs(process.argv.slice(2), parseArgsOptions);
    const mendixVersion = await getMendixVersion(options);

    const freePort = await findFreePort(3000);
    const ip = nodeIp.address();

    if (!ip) {
        throw new Error("Could not determine local ip address!");
    }

    try {
        execSync("docker info");
    } catch (e) {
        throw new Error("To run e2e test locally, make sure docker is running. Exiting now...", { cause: e });
    }

    if (options.setupProject) {
        await setupTestProject();
    }

    if (options.updateProject) {
        await updateTestProject();
    }

    if (options.useCompose) {
        await runWithCompose({ mendixVersion, ip, freePort });
    } else {
        await runWithDockerRaw({ mendixVersion, ip, freePort });
    }
}

// ---------------------------------------------------------------------------
// Compose-based orchestration
// Uses "docker compose up --wait" with Docker's built-in healthcheck
// instead of a manual mxbuild → startRuntime → poll loop.
// ---------------------------------------------------------------------------
async function runWithCompose({ mendixVersion, ip, freePort }) {
    // Ensure images exist (pulled from cache or built locally)
    await prepareImage("mxbuild", mendixVersion);
    await prepareImage("mxruntime", mendixVersion);

    const projectFile = ls(config.mprFileGlob).toString();
    if (!projectFile) {
        throw new Error(`No .mpr file found matching ${config.mprFileGlob}`);
    }

    const mprRelPath = projectFile; // relative to process.cwd() → /source mount
    const workspace = process.cwd();

    const composeEnv = {
        ...process.env,
        MENDIX_VERSION: mendixVersion,
        WORKSPACE: workspace,
        MPR_PATH: mprRelPath,
        RUNTIME_PORT: String(freePort),
        ...(process.env.MODERN_CLIENT ? { MODERN_CLIENT: `--modern-client` } : {})
    };

    try {
        console.log(c.cyan("Starting mxbuild + mxruntime via Docker Compose..."));
        console.log(c.gray(`  compose file : ${COMPOSE_FILE}`));
        console.log(c.gray(`  workspace    : ${workspace}`));
        console.log(c.gray(`  mpr          : ${mprRelPath}`));
        console.log(c.gray(`  runtime port : ${freePort}`));

        // Compose starts mxbuild first (via depends_on), then boots mxruntime.
        // Only wait on mxruntime – including mxbuild confuses Compose since its
        // clean exit is treated as a failure by --wait.
        execSync(`docker compose -f "${COMPOSE_FILE}" up --wait mxruntime`, { stdio: "inherit", env: composeEnv });

        console.log(c.green("Runtime is healthy. Starting Playwright..."));
        startPlaywright(ip, freePort);
    } finally {
        console.log(c.cyan("Tearing down Docker Compose services..."));
        execSync(`docker compose -f "${COMPOSE_FILE}" down --volumes --remove-orphans`, {
            stdio: "inherit",
            env: composeEnv
        });
    }
}

// ---------------------------------------------------------------------------
// Legacy raw-Docker orchestration (kept as fallback; use --no-use-compose)
// ---------------------------------------------------------------------------
async function runWithDockerRaw({ mendixVersion, ip, freePort }) {
    let runtimeContainerId;
    try {
        const mxbuildImage = await prepareImage("mxbuild", mendixVersion);
        const mxruntimeImage = await prepareImage("mxruntime", mendixVersion);

        const projectFile = ls(config.mprFileGlob).toString();
        createDeploymentBundle(mxbuildImage, projectFile);

        runtimeContainerId = await startRuntime(mxruntimeImage, mendixVersion, ip, freePort);
        startPlaywright(ip, freePort);
    } finally {
        if (runtimeContainerId) {
            execSync(`docker rm -f ${runtimeContainerId}`);
        }
    }
}

async function getMendixVersion(options) {
    console.log(`Getting mendix version...`);
    if (process.env.MENDIX_VERSION) {
        return process.env.MENDIX_VERSION;
    }

    const versionMapResponse = await fetchWithReport(config.mxVersionMapUrl);
    if (versionMapResponse.ok) {
        const { mxVersion } = options;
        const versionMap = await versionMapResponse.json();
        if (mxVersion in versionMap) {
            return versionMap[mxVersion];
        }

        return versionMap.latest;
    } else {
        throw new Error(`Couldn't fetch mendix-versions.json: ${versionMapResponse.statusText}`);
    }
}
