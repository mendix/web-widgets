import { execSync } from "node:child_process";
import p from "node:path";
import { fileURLToPath } from "node:url";
import fetch from "node-fetch";
import c from "ansi-colors";

const REGISTRY = "ghcr.io/mendix/web-widgets";

export function getFullImageName(name, mendixVersion) {
    return `${REGISTRY}/${name}:${mendixVersion}`;
}

export function checkRegistry(image) {
    try {
        execSync(`docker manifest inspect ${image}`, { stdio: "pipe", encoding: "utf-8" });
        return { exists: true };
    } catch (error) {
        if (error.status === 1 && error.stderr === "manifest unknown\n") {
            return { exists: false };
        }

        throw error;
    }
}

export async function buildImage(name, mendixVersion) {
    const image = getFullImageName(name, mendixVersion);
    const dockerDir = fileURLToPath(new URL("../docker", import.meta.url));
    const dockerFile = p.join(dockerDir, `${name}.Dockerfile`);
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

    if (!process.env.SKIP_DOCKER_PULL) {
        console.log(`Checking ${prettyName} docker image in Github Container Registry...`);
        const { exists } = checkRegistry(image);
        if (exists) {
            console.log(`Success, pull ${prettyName} from registry.`);
            execSync(`docker pull ${image}`, { stdio: "inherit" });
            return image;
        }
    }

    console.log(`Image not found, creating new ${prettyName} docker image...`);
    await buildImage(name, mendixVersion);
    return image;
}

export function createDeploymentBundle(mxbuildImage, projectFile) {
    console.log(`Start building deployment bundle.`);

    const mprPath = `/source/${projectFile}`;

    const subCommands = [
        // 1. Update widgets in project.
        `mx update-widgets --loose-version-check ${mprPath}`,
        // 2. Build project to:
        //      a. Check errors.
        //      b. Prepare `deployment` dir for mxruntime.
        // Output file is not used, so put it to tmp.
        `mxbuild --output=/tmp/automation.mda ${mprPath}`
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

export async function startRuntime(mxruntimeImage, mendixVersion, ip, freePort) {
    console.log(`Start mxruntime image`);

    const dockerDir = fileURLToPath(new URL("../docker", import.meta.url));
    const args = [
        `--tty`,
        // Spin mxruntime in background, we will kill it later.
        `--detach`,
        `--rm`,
        `--workdir /source`,
        `--publish ${freePort}:8080`,
        `--env MENDIX_VERSION=${mendixVersion}`,
        `--entrypoint /bin/bash`,
        `--volume ${process.cwd()}:/source`,
        // shared dir should contain two files:
        // runtime.sh
        // m2ee.yaml
        `--volume ${dockerDir}:/shared:ro`,
        mxruntimeImage,
        `/shared/runtime.sh`
    ];
    const command = [`docker run`, ...args].join(" ");
    const runtimeContainerId = execSync(command, { encoding: "utf-8" }).trim();

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
        throw new Error("Runtime didn't start in time, exiting now...");
    }

    return runtimeContainerId;
}

export function startCypress(ip, freePort) {
    console.log(`Start e2e tests with cypress/included image`);

    const REPO_ROOT = execSync(`git rev-parse --show-toplevel`).toString().trim();
    const browserCypress = process.env.BROWSER_CYPRESS || "chrome";
    const headedMode = process.env.HEADED_MODE || "";
    const startingPoint = p.resolve("/monorepo", p.relative(REPO_ROOT, process.cwd()));

    console.log("Start cypress in", startingPoint);

    const args = [
        `--tty`,
        `--volume ${REPO_ROOT}:/monorepo`,
        `--volume ${REPO_ROOT}/node_modules:/monorepo/node_modules:ro`,
        `--workdir ${startingPoint}`,
        // container name
        `--name cypress`,
        // image to run, the entrypoint set to `cypress run` by default
        `cypress/included:12.7.0`,
        // cypress options
        `--browser ${browserCypress} ${headedMode}`.trim(),
        `--e2e`,
        `--config-file cypress.config.cjs`,
        `--config baseUrl=http://${ip}:${freePort},video=true,videoUploadOnPasses=false,viewportWidth=1280,viewportHeight=1080,testIsolation=false,chromeWebSecurity=false`
    ];
    const command = [`docker run`, ...args].join(" ");

    execSync(command, { stdio: "inherit" });
}
