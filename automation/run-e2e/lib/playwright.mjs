import c from "ansi-colors";
import nodeIp from "ip";
import { execSync } from "node:child_process";
import sh from "shelljs";
import parseArgs from "yargs-parser";
import { setupTestProject } from "./setup-test-project.mjs";
import { updateTestProject } from "./update-test-project.mjs";
import { fetchWithReport } from "./utils.mjs";
import * as config from "./config.mjs";
import p from "path";
import { fileURLToPath } from "url";

const { ls } = sh;

export async function playwright() {
    const dockerDir = fileURLToPath(new URL("../docker", import.meta.url));
    const mxBuildDockerFile = p.join(dockerDir, `mxbuild.Dockerfile`);
    const mxRuntimeDockerFile = p.join(dockerDir, `mxruntime.Dockerfile`);

    console.log(c.cyan("Run e2e tests using Playwright"));

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

    // Create reusable mxbuild image

    const existingImages = execSync(`docker image ls -q mxbuild:${mendixVersion}`).toString().trim();
    if (!existingImages) {
        console.log(`Creating new mxbuild docker image...`);
        execSync(
            `docker build -f ${mxBuildDockerFile} ` +
                `--build-arg MENDIX_VERSION=${mendixVersion} ` +
                `--tag mxbuild:${mendixVersion} .`,
            { stdio: "inherit" }
        );
    }

    const existingRuntimeImages = execSync(`docker image ls -q mxruntime:${mendixVersion}`).toString().trim();
    if (!existingRuntimeImages) {
        console.log(`Creating new runtime docker image...`);
        execSync(
            `docker build -f ${mxRuntimeDockerFile} ` +
                `--build-arg MENDIX_VERSION=${mendixVersion} ` +
                `-t mxruntime:${mendixVersion} .`,
            { stdio: "inherit" }
        );
    }

    // Build testProject via mxbuild
    const projectFile = ls("tests/testProject/*.mpr").toString();
    if (!process.argv.includes("--no-exec-mxbuild")) {
        execSync(
            `docker run --name mxbuild --tty -v ${process.cwd()}:/source ` +
                `--rm mxbuild:${mendixVersion} bash -c "mx update-widgets --loose-version-check /source/${projectFile} && mxbuild ` +
                `-o /tmp/automation.mda /source/${projectFile}"`,
            { stdio: "inherit" }
        );
        console.log("Bundle created and all the widgets are updated");
    }
    // Spin up the runtime and run testProject
    execSync(
        `docker run --name mxruntime -t -v ${process.cwd()}:/source -v ${dockerDir}:/shared:ro -w /source -p 8080:8080 ` +
            `-e MENDIX_VERSION=${mendixVersion} --entrypoint /bin/bash ` +
            `--rm mxruntime:${mendixVersion} /shared/runtime.sh`,
        { stdio: "inherit" }
    );
    console.log("Runtime docker started successfully");
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
