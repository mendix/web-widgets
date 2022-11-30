import c from "chalk";
import findFreePort from "find-free-port";
import nodeIp from "ip";
import fetch from "node-fetch";
import { execSync } from "node:child_process";
import sh from "shelljs";
import parseArgs from "yargs-parser";
import { createDeploymentBundle, prepareImage, startCypress, startRuntime } from "./docker-utils.mjs";
import { setupTestProject, updateWidget } from "./setup-test-project.mjs";

const MX_VERSION_MAP_URL =
    "https://raw.githubusercontent.com/mendix/widgets-resources/master/configs/e2e/mendix-versions.json";

// const MX_VERSION_MAP_URL =
//     "https://raw.githubusercontent.com/mendix/web-widgets/main/automation/run-e2e/mendix-versions.json";

const { ls, cat } = sh;

export async function ci() {
    // assert.ok(process.env.CI, "This command meant to run in CI env");
    console.log(c.cyan("Run e2e tests in CI environment"));

    const parseArgsOptions = {
        string: ["mx-version"],
        boolean: ["update-widget", "setup-project"],
        default: {
            "update-widget": true,
            "setup-project": true
        },
        configuration: {
            // https://github.com/yargs/yargs-parser#boolean-negation
            "boolean-negation": true,
            // https://github.com/yargs/yargs-parser#boolean-negation
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

    if (options.updateWidget) {
        await updateWidget();
    }

    let runtimeContainerId;
    try {
        const mxbuildImage = await prepareImage("mxbuild", mendixVersion);
        const mxruntimeImage = await prepareImage("mxruntime", mendixVersion);

        // Build testProject via mxbuild
        const projectFile = ls("tests/testProject/*.mpr").toString();
        createDeploymentBundle(mxbuildImage, projectFile);

        // Spin up the runtime and run testProject
        runtimeContainerId = await startRuntime(mxruntimeImage, mendixVersion, ip, freePort);

        // Spin up cypress docker machine and run the test specs
        startCypress(ip, freePort);
    } catch (e) {
        try {
            execSync(`docker logs ${runtimeContainerId}`, { stdio: "inherit" });
        } catch {
            // ignore
        }
        console.log(cat("results/runtime.log").toString());
        throw e;
    } finally {
        execSync(`docker rm -f ${runtimeContainerId}`);
        execSync(`docker rm -f cypress`);
    }
}

async function getMendixVersion(options) {
    console.log(`Getting mendix version...`);
    if (process.env.MENDIX_VERSION) {
        return process.env.MENDIX_VERSION;
    }

    try {
        const versionMapResponse = await fetch(MX_VERSION_MAP_URL);
        if (versionMapResponse.ok) {
            const { mxVersion } = options;
            const versionMap = await versionMapResponse.json();
            if (mxVersion in versionMap) {
                return versionMap[mxVersion];
            }

            return versionMap.latest;
        }
    } catch (err) {
        console.err(err);
        throw new Error("Couldn't fetch mendix-versions.json");
    }
}
