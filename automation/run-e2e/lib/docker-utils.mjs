import { execSync, spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import p from "node:path";
import { fileURLToPath } from "node:url";
import fetch from "node-fetch";
import c from "ansi-colors";
import sh from "shelljs";

const { cat } = sh;

export function getFullImageName(name, mendixVersion) {
    return `${name}:${mendixVersion}`;
}

export async function buildImage(name, mendixVersion) {
    const image = getFullImageName(name, mendixVersion);
    const dockerDir = fileURLToPath(new URL("../docker", import.meta.url));
    const dockerFile = p.join(dockerDir, process.env.RC ? `${name}RC.Dockerfile` : `${name}.Dockerfile`);
    const runnumber = process.env.CI && process.env.GITHUB_RUN_ID;

    const args = [
        `--file ${dockerFile}`,
        `--build-arg MENDIX_VERSION=${mendixVersion}`,
        `--tag ${image}`,
        runnumber ? `--label "runnumber=${runnumber}"` : "",
        // output path
        dockerDir
    ].filter(v => !!v);

    const command = [`docker build`, ...args].join(" ");
    execSync(command, { stdio: "inherit" });
}

export async function prepareImage(name, mendixVersion) {
    const image = getFullImageName(name, mendixVersion);
    const prettyName = c.magenta(image);

    console.log(`Checking ${prettyName} docker image in local images...`);
    const imageId = execSync(`docker image list --quiet ${image}`, { encoding: "utf-8" }).trim();
    if (imageId) {
        console.log(`Found ${prettyName} locally.`);
        return image;
    }

    console.log(`Image not found, creating new ${prettyName} docker image...`);
    await buildImage(name, mendixVersion);
    return image;
}

/**
 * mxbuild/mxruntime containers run as root and write into the bind-mounted
 * package dir (tests/testProject, results). On Linux those files end up
 * owned by root on the host, so the next run can't clean them up.
 * Hand them back to the current host user by running chown inside a container.
 */
export function restoreWorkspaceOwnership(image, paths = ["tests", "results"]) {
    if (typeof process.getuid !== "function" || process.getuid() === 0) {
        return;
    }

    const existing = paths.filter(path => existsSync(p.join(process.cwd(), path)));
    if (existing.length === 0) {
        return;
    }

    const owner = `${process.getuid()}:${process.getgid()}`;
    const args = [
        "run",
        "--rm",
        "--volume",
        `${process.cwd()}:/source`,
        "--entrypoint",
        "chown",
        image,
        "-R",
        owner,
        ...existing.map(path => `/source/${path}`)
    ];

    const result = spawnSync("docker", args, { stdio: "inherit" });
    if (result.status !== 0) {
        console.warn(c.yellow(`Could not restore ownership of ${existing.join(", ")} to ${owner}.`));
    }
}

export function createDeploymentBundle(mxbuildImage, projectFile) {
    console.log(`Start building deployment bundle.`);

    const mprPath = `/source/${projectFile}`;
    const modernClient = process.env.MODERN_CLIENT || "";

    const subCommands = [
        // 1. Update widgets in project.
        `mx update-widgets --loose-version-check ${mprPath}`,
        // 2. Build project to:
        //      a. Check errors.
        //      b. Prepare `deployment` dir for mxruntime.
        // Output file is not used, so put it to tmp.
        `mxbuild ${modernClient} --output=/tmp/automation.mda ${mprPath}`
    ];
    const args = [
        `--tty`,
        `--volume ${process.cwd()}:/source`,
        `--rm`,
        mxbuildImage,
        `bash -c "${subCommands.join(" && ")}"`
    ];

    const command = [`docker run`, ...args].join(" ");

    execSync(command, { stdio: "inherit" });
    console.log("Success. Bundle created and all the widgets are updated.");
}

export async function startRuntime(mxruntimeImage, mendixVersion, ip, freePort, { hostNetwork = false } = {}) {
    console.log(`Start mxruntime image`);

    const dockerDir = fileURLToPath(new URL("../docker", import.meta.url));
    const labelPrefix = "e2e.mxruntime";
    const labelValue = Math.round(Math.random() * (999 - 100)) + 100;
    const containerLabel = `${labelPrefix}=${labelValue}`;
    const args = [
        `run`,
        `--tty`,
        [`--workdir`, `/source`],
        // In host-network mode the runtime listens on the host's 8080 directly.
        hostNetwork ? [`--network`, `host`] : [`--publish`, `${freePort}:8080`],
        [`--env`, `MENDIX_VERSION=${mendixVersion}`],
        [`--entrypoint`, `/bin/bash`],
        [`--volume`, `${process.cwd()}:/source`],
        // shared dir should contain two files:
        // runtime.sh
        // m2ee.yaml
        [`--volume`, `${dockerDir}:/shared:ro`],
        [`--label`, `${containerLabel}`],
        mxruntimeImage,
        `/shared/runtime.sh`
    ];

    spawn("docker", args.flat(), { stdio: "inherit" });

    let runtimeContainerId = "";
    for (let attempts = 100; attempts > 0; --attempts) {
        runtimeContainerId = getContainerId(containerLabel);
        if (runtimeContainerId) {
            break;
        }
        // Give `docker run` time to create the container (up to ~30s in total).
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (runtimeContainerId === "") {
        throw new Error("Failed to get runtime container id. Probably container didn't started.");
    }

    let attempts = 60;
    for (; attempts > 0; --attempts) {
        try {
            const response = await fetch(`http://${ip}:${freePort}`);
            if (response.ok) {
                attempts = 0;
            }
        } catch (e) {
            console.log(`Could not reach http://${ip}:${freePort}, trying again...`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (attempts === 0) {
        console.log("Runtime didn't start");
        console.log("Print runtime.log...");
        console.log(cat("results/runtime.log").toString());
        throw new Error("Runtime didn't start in time, exiting now...");
    }

    return runtimeContainerId;
}

export function startPlaywright(ip, freePort) {
    console.log(`Start e2e tests with Playwright`);

    const REPO_ROOT = execSync(`git rev-parse --show-toplevel`).toString().trim();
    const browserPlaywright = process.env.BROWSER_PLAYWRIGHT || "chromium";
    // const headedMode = process.env.HEADED_MODE || "";
    const modernClientMode = process.env.MODERN_CLIENT ? "MODERN_CLIENT=true" : "";
    const baseURL = `URL=http://${ip}:${freePort}`;
    const startingPoint = p.resolve("/monorepo", p.relative(REPO_ROOT, process.cwd()));

    console.log("Start Playwright in", startingPoint);

    const args = [`--project=${browserPlaywright}`];
    const command = [`${modernClientMode} ${baseURL} playwright test`, ...args].join(" ");

    execSync(command, { stdio: "inherit" });
}

export function getContainerId(containerLabel) {
    return execSync(`docker ps --quiet --filter 'label=${containerLabel}'`, { encoding: "utf-8" }).trim();
}
