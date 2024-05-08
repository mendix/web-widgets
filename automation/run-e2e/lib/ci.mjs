import c from "ansi-colors";
import findFreePort from "find-free-port";
import nodeIp from "ip";
import { execSync } from "node:child_process";
import sh from "shelljs";
import parseArgs from "yargs-parser";
import { createDeploymentBundle, prepareImage, startPlaywright, startRuntime } from "./docker-utils.mjs";
import { setupTestProject } from "./setup-test-project.mjs";
import { updateTestProject } from "./update-test-project.mjs";
import { fetchWithReport } from "./utils.mjs";
import * as config from "./config.mjs";

const { ls } = sh;

export async function ci() {
    console.log(c.cyan("Run e2e tests in CI environment"));

    const parseArgsOptions = {
        string: ["mx-version"],
        boolean: ["update-project", "setup-project"],
        default: {
            "update-project": true,
            "setup-project": true
        },
        configuration: {
            // https://github.com/yargs/yargs-parser#boolean-negation
            "boolean-negation": true,
            // https://github.com/yargs/yargs-parser#camel-case-expansion
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
        throw new Error("To run e2e test locally, make sure docker is running. Exiting now...");
    }

    if (options.setupProject) {
        await setupTestProject();
    }

    if (options.updateProject) {
        await updateTestProject();
    }

    let runtimeContainerId;
    try {
        const mxbuildImage = await prepareImage("mxbuild", mendixVersion);
        const mxruntimeImage = await prepareImage("mxruntime", mendixVersion);

        // Build testProject via mxbuild
        const projectFile = ls(config.mprFileGlob).toString();
        createDeploymentBundle(mxbuildImage, projectFile);

        // Spin up the runtime and run testProject
        runtimeContainerId = await startRuntime(mxruntimeImage, mendixVersion, ip, freePort);

        // Runs Playwright command line
        startPlaywright(ip, freePort);
    } finally {
        execSync(`docker rm -f ${runtimeContainerId}`);
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
